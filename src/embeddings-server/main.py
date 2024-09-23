import os
from fastapi import FastAPI, HTTPException, Request, Body, Header
from starlette.datastructures import Headers
from llama_index.core.text_splitter import TokenTextSplitter
from llama_index.core.readers.file.base import SimpleDirectoryReader
from sentence_transformers import SentenceTransformer
import chromadb
import httpx
import asyncio
from typing import Optional

from config import settings

# Initialize FastAPI app
app = FastAPI()

# Initialize the Hugging Face embedding model
embedding_model = SentenceTransformer(model_name_or_path=settings.embedding_model_name, cache_folder=settings.models_dir, token=settings.hf_api_token)

# Initialize the ChromaDB client
client = chromadb.PersistentClient(path=settings.store_dir)

# Helper function to notify app server
async def notify_app_server(agent_name: str):
    url = f"http://{settings.api_server}:{settings.api_server_port}/api/agents/{agent_name}/update-embeddings-status"
    
    headers = {
        "X-Requested-With": "XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Making the async POST request without body
            response = await client.post(url, headers=headers)
            
            # Optionally, check the response
            if response.status_code == 200:
                print(f"Successfully notified app-server for agent {agent_name}")
            else:
                print(f"Failed to notify app-server: {response.status_code}")
    except Exception as e:
        print(e)

def verify_x_api_key(headers: Headers) -> str:
    """
    Verify the presence and correctness of the X-API-Key header.
    
    Args:
        headers (Headers): The request headers.

    Returns:
        str: The API key if valid.

    Raises:
        HTTPException: If the X-API-Key header is missing or invalid.
    """
    # Retrieve the API key from headers
    x_api_key: Optional[str] = headers.get(settings.header_name)

    # Check if the API key exists
    if x_api_key is None:
        raise HTTPException(
            status_code=400,
            detail="X-API-Key header missing"
        )
    
    # Validate the API key
    if x_api_key != settings.header_key:
        raise HTTPException(
            status_code=401,
            detail="Invalid X-API-Key"
        )

    return x_api_key


# Step 1: /generate endpoint to process and store embeddings
@app.post("/generate")
async def generate_embeddings(request: Request, body: dict = Body(...)):
    agent_name = body.get("agent_name")
    agent_dir = os.path.join(settings.agents_dir, agent_name)
    # Check if the agent's document directory exists
    if not os.path.exists(agent_dir):
        raise HTTPException(status_code=404, detail=f"Directory for agent {agent_name} not found")

    try:
        # Validate the API key in the request header
        verify_x_api_key(headers=request.headers)

        # Step 1: Load the documents from the agent's directory
        directory_reader = SimpleDirectoryReader(agent_dir)
        documents = directory_reader.load_data()

        # Step 2: Chunk documents with overlap (ignoring sentence/chapter boundaries)
        text_splitter = TokenTextSplitter(chunk_size=512, chunk_overlap=50)
        chunked_documents = []
        for doc in documents:
            chunks = text_splitter.split_text(doc.text)
            chunked_documents.extend(chunks)

        # Step 3: Generate embeddings for each chunk using the Hugging Face model
        embeddings = []
        for chunk in chunked_documents:
            vector = embedding_model.encode(chunk)
            embeddings.append(vector)

        # Step 4: Store the embeddings in ChromaDB
        collection_name = f"agent_{agent_name}"
        # Step 5: delete the collection
        client.delete_collection(collection_name)
        # Step 6: Use get_or_create_collection to manage the collection
        collection = client.get_or_create_collection(name=collection_name)
        # Step 7: Add each chunk with its embedding into ChromaDB
        for i, chunk in enumerate(chunked_documents):
            document_id = f"doc_chunk_{i}"
            collection.add(
                documents=[chunk],       # Chunked document text
                embeddings=[embeddings[i].tolist()],  # Embedding vector
                ids=[document_id]        # Unique ID for each chunk
            )

        # call app server as an async function
        asyncio.create_task(notify_app_server(agent_name))

        return {"message": f"Embeddings generated and stored for agent {agent_name}"}

    except Exception as e:
        raise HTTPException(
            status_code=getattr(e, "status_code", 500),
            detail=getattr(e, "detail", str(e)),
        )

# Step 2: /query endpoint to retrieve document chunks based on a prompt
@app.post("/query")
async def query_embeddings(request: Request, agent_name: str = Body(), prompt: str = Body(), top_k: int = Body(5)): # top_k defaults to 5

    try:
        print(11)
        # Validate the API key in the request header
        verify_x_api_key(headers=request.headers)
        print(12)        
        # Step 1: Generate the embedding for the query prompt
        prompt_embedding = embedding_model.encode(prompt)
        print(13)
        # Step 2: Access the ChromaDB collection for the specified agent
        collection_name = f"agent_{agent_name}"
        collection = client.get_or_create_collection(name=collection_name)
        print(14)
        # Step 3: Query ChromaDB for the most relevant document chunks
        results = collection.query(
            query_embeddings=[prompt_embedding.tolist()],
            n_results=top_k  # Use the top_k parameter to retrieve the top 'k' results
        )
        print(15)
        # Extract and return the relevant document chunks
        document_chunks = results['documents']
        return {
            "status": "success",
            "agent_name": agent_name,
            "prompt": prompt,
            "results": document_chunks
        }
    
        # In the function calling the query apply the following
        #document_chunks = results['documents']
        #document_text_array = [chunk for sublist in document_chunks for chunk in sublist]



    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query for agent {agent_name}: {str(e)}")


# Step 3: Run the FastAPI app with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8002, reload=True)
