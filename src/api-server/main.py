"""
main.py

Defines all FastAPI routes for authentication, agent management, and middleware setup, including CORS and static file handling.
"""

from fastapi import (
    FastAPI,
    Request,
    Response,
    HTTPException,
    File,
    UploadFile,
    Body,
    Form,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Dict, Any, Union, List, Optional
from datetime import datetime
import os
from shutil import copyfile
import requests
import threading

from config import settings
from dependencies import verify_x_api_key, get_current_user
from auth import (
    is_admin_password_set,
    set_admin_password,
    check_admin_password,
    change_admin_password,
    create_access_token,
    verify_jwt_token,
)
from agent import (
    get_agents, 
    save_agent, 
    get_agent, 
    change_agent,
    delete_agent,
    update_agent_embeddings_status
    )

# Create the app
app = FastAPI()

# uncomment below in case CORS settings required for direct api-access during development 
#origins = []
#app.add_middleware(
#    CORSMiddleware,
#    allow_origins=origins,
#    allow_credentials=True,
#    allow_methods=["*"],
#    allow_headers=["*"],
#)

# --------- Helper functions ---------


# function to save the uploaded files and return an updated comma-delimited string of filenames
def process_uploaded_files(
    agent_name: str,
    original_files: str = "",
    new_files: List[UploadFile] = [],
    deleted_files: str = "",
) -> str:
    """
    Remove deleted files, add new files, and return a comma-delimited string of filenames.
    """
    agent_dir = os.path.join(settings.agents_dir, agent_name)
    os.makedirs(agent_dir, exist_ok=True)  # Ensure the agent directory exists

    # Step 1: Process deleted files (remove them from the agent's directory)
    if deleted_files:
        deleted_files_list = [file.strip() for file in deleted_files.split(",") if file.strip()]
        for file in deleted_files_list:
            file_path = os.path.join(agent_dir, file)
            if os.path.exists(file_path):
                os.remove(file_path)

    # Step 2: Process new files (add them to the agent's directory)
    for file in new_files:
        file_path = os.path.join(agent_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())

    # Step 3: Retrieve all remaining files in the directory
    all_files = os.listdir(agent_dir)
    
    # Optional: Sort the files based on creation or modification date
    all_files.sort(key=lambda x: os.path.getmtime(os.path.join(agent_dir, x)))

    # Return the updated comma-delimited string of filenames
    return ", ".join(all_files) if all_files else ""

# function to delete all files of agent as well as subdirectory
def delete_agent_files(agent_name: str) -> None:
    """
    Delete the agent's directory and all files within it.
    """
    agent_dir = os.path.join(settings.agents_dir, agent_name)
    
    # Check if the agent directory exists
    if os.path.exists(agent_dir):
        # Remove the agent's directory and all its contents
        shutil.rmtree(agent_dir)

# function to call the embeddings server in a separate thread
def trigger_embeddings_generation(agent_name):
    def generate_embeddings_task():
        try:
            # Call the embeddings server to start generating embeddings
            url = f"http://{settings.embeddings_server}:{settings.embeddings_server_port}/generate"
            headers = {
               "X-Requested-With": "XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl"
            }
            requests.post(url, json={"agent_name": agent_name}, headers=headers)
            # do not wait for response
        except Exception as e:
            print(f"Error during embeddings generation for agent {agent_name}: {str(e)}")

    # Run the task in a separate thread
    threading.Thread(target=generate_embeddings_task).start()

# Helper function to compose the LLM request
def compose_request(instruction, document_chunks, history, user_prompt):
    """
    Combines the instruction, document chunks, history, and user prompt into a complete prompt
    for an LLM (vLLM, Ollama, or OpenAI-compatible API).
    
    :param instruction: The main system instruction to the LLM (e.g., "You are a Teacher...").
    :param document_chunks: A list of document chunks relevant to the conversation.
    :param history: A list of past user prompts and system responses (as a list of dictionaries).
    :param user_prompt: The latest user input or question.
    
    :return: A formatted list of messages to be used for LLM completion API.
    """
    
    # Start with the instruction as the system message
    messages = [
        {"role": "system", "content": instruction}
    ]
    
    # Add document chunks as a system message (summarizing or presenting document context)
    if document_chunks:
        chunked_documents = "\n\n".join(document_chunks)
        messages.append({
            "role": "system",
            "content": f"The following document chunks are relevant:\n{chunked_documents}"
        })
    
    # Add the past history of user prompts and system responses
    for entry in history:
        if "user" in entry:
            messages.append({"role": "user", "content": entry["user"]})
        if "assistant" in entry:
            messages.append({"role": "assistant", "content": entry["assistant"]})
        if "system" in entry:
            messages.append({"role": "system", "content": entry["system"]})
    
    # Add the latest user prompt
    messages.append({"role": "user", "content": user_prompt})
    
    return messages

# Helper function to map response length to max_tokens
def get_max_tokens_by_length(response_length: str) -> int:
    length_map = {
        "s": settings.chat_response_length_short, 
        "m": settings.chat_response_length_medium,
        "l": settings.chat_response_length_long
    }
    return length_map.get(str(response_length).lower(), settings.chat_response_length_medium)  # Default to medium if not provided


# Helper function to call the vllm server
def send_prompt_vllm(
    messages: list,
    response_length: str = settings.chat_response_length_default,  # short, medium, long
    temperature: float = settings.chat_temperature, # controls the randomness or creativity of token selection by adjusting the overall probability distribution.
    top_p: float = settings.chat_top_p, # limits the range of tokens the model can choose from by cutting off low-probability tokens.
    frequency_penalty: float = settings.chat_frequency_penalty, # It reduces the likelihood of tokens (words or phrases) being repeated based on how frequently they have already appeared in the generated text. Range is -2 to 2.
    presence_penalty: float = settings.chat_presence_penalty #  It reduces the likelihood of tokens (words or phrases) being repeated based on whether they have appeared at all in the generated text so far, without considering their frequency. This encourages the model to introduce new topics or words into the conversation. Range is -2 to 2
    ):
    try:
        max_tokens = get_max_tokens_by_length(response_length)

        # Call the vLLM API using requests
        url = f"http://{settings.llm-server}:{settings.llm_server_port}/v1/chat/completions"
        response = requests.post(url,
            json={
               "model": settings.llm_model_name,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
                "top_p": top_p,
                "frequency_penalty": frequency_penalty,
                "presence_penalty": presence_penalty
            },
            timeout=600
        )
        response.raise_for_status()
        response_data = response.json()
        choices = response_data['choices']
        choice = choices[0]
        message = choice['message']
        resp_json = {
            "content": message['content'],
            "role": message['role']
        }
        return resp_json
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error connecting to vLLM server: {str(e)}")



# --------- API Routes ---------


@app.get("/api/auth/is-admin-password-set")
async def route_check_admin_password_set(request: Request):
    """
    Route to check if the admin password is set.
    """
    try:
        verify_x_api_key(request.headers)
        res: bool = is_admin_password_set()
        return {"admin_password_set": res}
    except Exception as e:
        raise HTTPException(status_code=403, detail="Access denied")


@app.post("/api/auth/set-admin-password")
def route_set_admin_password(request: Request, body: dict = Body(...)):
    """
    Route to set the admin password.
    """
    try:
        verify_x_api_key(request.headers)
        password: str = body.get("password", "")
        if not password:
            raise HTTPException(status_code=400, detail="Password cannot be blank")
        set_admin_password(password)
        return {"msg": "Admin password set successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )


@app.get("/api/auth/check-token")
def route_check_jwt_token(request: Request):
    """
    Route to check if the JWT token is valid.
    """
    try:
        verify_x_api_key(request.headers)
        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=403, detail="Access denied")
        payload = verify_jwt_token(access_token)
        return {"message": "Token is valid", "username": payload["sub"]}
    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )


@app.post("/api/auth/login")
def route_login(request: Request, body: dict = Body(...), response: Response = None):
    """
    Route to log in and set the JWT cookie.
    """
    verify_x_api_key(request.headers)
    password: str = body.get("password", "")
    if not password:
        raise HTTPException(status_code=400, detail="Password cannot be blank")

    check_admin_password(password)

    access_token = create_access_token({"sub": "admin"})
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.access_token_expire_minutes * 60,
        expires=settings.access_token_expire_minutes * 60,
        secure=True,
        samesite="lax",
    )
    return {"message": "Login successful"}


@app.post("/api/auth/change-admin-password")
def route_change_admin_password(request: Request, body: dict = Body(...)):
    """
    Route to change the admin password.
    """
    try:
        verify_x_api_key(request.headers)
        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=403, detail="Access denied")

        payload = verify_jwt_token(access_token)
        if payload["sub"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")

        current_password: str = body.get("current_password", "")
        new_password: str = body.get("new_password", "")
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Password cannot be blank")

        change_admin_password(current_password, new_password)
        return {"message": "Admin password changed successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )


@app.post("/api/auth/logout")
def route_logout(response: Response):
    """
    Route to log out and clear the JWT cookie.
    """
    response.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        expires=0,
        max_age=0,
    )
    return {"message": "Logout successful"}


@app.get("/api/agents")
def route_agents(request: Request):
    """
    Route to fetch all agents.
    """
    try:
        verify_x_api_key(request.headers)
        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=403, detail="Access denied")
        payload = verify_jwt_token(access_token)
        if payload["sub"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        # Get list of agents from the database
        agents: List[Dict[str, any]] = get_agents()
        # Convert the Agent objects 
        return {"list": agents}

    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )


@app.post("/api/agents")
def route_save_agent(
    request: Request,
    name: str = Form(...),
    instructions: str = Form(""),
    welcome_message: str = Form(""),
    suggested_prompts: str = Form(""),
    new_files: List[UploadFile] = File([]),
):
    """
    Route to create agent and upload optional files.
    """
    try:
        verify_x_api_key(request.headers)

        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=403, detail="Access denied")

        payload = verify_jwt_token(access_token)
        if payload["sub"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not name:
            raise HTTPException(status_code=400, detail="Agent name cannot be blank")

        # Process and save files (if any), and generate a comma-delimited string of filenames
        file_names_str: Optional[str] = process_uploaded_files(name, "", new_files, "")

        # check if files have been added
        if file_names_str:
            # call the embeddings-server
            trigger_embeddings_generation(name)

            embeddings_status = "I" # in-progress
        else:
            embeddings_status = ""
        # Save the agent data to the database
        agent = save_agent(
            name=name,
            instructions=instructions,
            welcome_message=welcome_message,
            suggested_prompts=suggested_prompts,
            files=file_names_str,
            embeddings_status = embeddings_status
        )
        
        # send the saved data back as response
        return {"agent": agent}

    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )


@app.put("/api/agents/{agent_name}")
def route_update_agent(
    request: Request,
    agent_name: str,
    files: str = Form(""),  # Original comma-delimited file list
    instructions: str = Form(""),
    welcome_message: str = Form(""),
    suggested_prompts: str = Form(""),
    new_files: List[UploadFile] = File([]),
    deleted_files: str = Form(""),  # Comma-delimited list of files to delete
):
    """
    Route to update an agent, handling both field updates and file uploads.
    """
    try:
        # Validate API key
        verify_x_api_key(request.headers)
        # process the files
        final_file_list = process_uploaded_files(
            agent_name,
            files,
            new_files,
            deleted_files,
        )
        # check if files have been added or deleted
        if new_files or deleted_files != "":
            # call the embeddings-server
            trigger_embeddings_generation(agent_name)
            # set embeddings_status
            embeddings_status = "I" # in-progress
        else:
            embeddings_status = ""

        # Call `change_agent` to update the agent in the database
        agent = change_agent(
            name=agent_name,
            instructions=instructions,
            welcome_message=welcome_message,
            suggested_prompts=suggested_prompts,
            files=final_file_list,  # Updated files string
            embeddings_status=embeddings_status
        )
        return {"agent": agent}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/agents/{agent_name}")
def route_get_agent(agent_name: str, request: Request):
    try:
        verify_x_api_key(request.headers)

        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=403, detail="Access denied")

        payload = verify_jwt_token(access_token)
        if payload["sub"] != "admin":
            raise HTTPException(status_code=403, detail="Access denied")

        if not agent_name:
            raise HTTPException(status_code=400, detail="Agent name cannot be blank")

        # get agent details
        agent: Dict[str, any] = get_agent(agent_name)
        return {"agent": agent}

    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )


@app.delete("/api/agents/{agent_name}")
def route_delete_agent(
    request: Request, 
    agent_name: str
) -> Response:
    """
    Route to delete an agent by its name, along with its associated files.
    """
    try:
        # Validate the API key in the request header
        verify_x_api_key(headers=request.headers)
        
        # Verify the JWT token from cookies to ensure the user is authorized
        access_token: Optional[str] = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=403, detail="Access denied")

        payload = verify_jwt_token(token=access_token)
        if payload['sub'] != 'admin':
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Delete the agent's files (helper function)
        delete_agent_files(agent_name=agent_name)

        # Call the agent deletion function from agent.py
        delete_agent(agent_name=agent_name)

        return Response(content=f"Agent '{agent_name}' deleted successfully.", status_code=200)
    
    except Exception as e:
        # Extract status code and details from the exception
        status_code: int = getattr(e, "status_code", 400)
        detail: str = getattr(e, "detail", str(e))

        # Raise the HTTPException with the appropriate error message
        raise HTTPException(status_code=status_code, detail=detail)


@app.post("/api/agents/{agent_name}/update-embeddings-status")
def route_update_embeddings_status(agent_name: str, request: Request):
    try:
        # Validate the API key in the request header
        verify_x_api_key(headers=request.headers)
        # check if route param is blank
        if not agent_name:
            raise HTTPException(status_code=400, detail="Agent name missing")
        # call update in agent
        update_agent_embeddings_status(agent_name, "")
        return {"message": "Embeddings status updated successfully"}
    except Exception as e:
        # Extract status code and details from the exception
        status_code: int = getattr(e, "status_code", 400)
        detail: str = getattr(e, "detail", str(e))

        # Raise the HTTPException with the appropriate error message
        raise HTTPException(status_code=status_code, detail=detail)

@app.get("/api/chat/{agent_name}")
def route_get_agent(agent_name: str, request: Request):
    try:
        verify_x_api_key(request.headers)

        if not agent_name:
            raise HTTPException(status_code=400, detail="Agent name cannot be blank")

        # get agent details
        agent: Dict[str, any] = get_agent(agent_name)
        return {"agent": agent}

    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )

@app.post("/api/chat/{agent_name}")
def route_post_chat(agent_name: str, request: Request, body: dict = Body(...)):
    """
    Route to post chat message 
    """
    try:
        verify_x_api_key(request.headers)

        if not agent_name:
            raise HTTPException(status_code=400, detail="Agent name cannot be blank")

         # get input details
        agent: Dict[str, any] = get_agent(agent_name)
        input: str = body.get("input", "")
        messages: Dict[str, Any] = body.get("messages")
        response_length = body.get("response_length", settings.chat_response_length_default)

         # Call the embeddings server to query for document chunks
        url = f"http://{settings.embeddings_server}:{settings.embeddings_server_port}/query"
        headers = {
               "X-Requested-With": "XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl"
        }

        # get the response
        response = requests.post(url, json={"agent_name": agent_name, "prompt": input}, headers=headers)
        response_json = response.json()

        # pick the chunks
        document_chunks = response_json['results']
        # create document array
        document_text_array = [chunk.replace('\n', ' ') for sublist in document_chunks for chunk in sublist]
        # compose request
        messages = compose_request(agent['instructions'], document_text_array, messages, input)
        # sent request to llm-server
        llm_response = send_prompt_vllm(messages=messages, response_length=response_length)
        # send the saved data back as response
        return {"content": llm_response["content"], "role": llm_response["role"]}
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=getattr(e, "status_code", 400),
            detail=getattr(e, "detail", str(e)),
        )