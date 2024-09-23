"""
agent.py

CRUD operations for agent-related data in the SQLite database, including agent creation, retrieval, and management.
"""

from fastapi import HTTPException
import time
from datetime import datetime
import sqlite3
from sqlite3 import Connection, Cursor
from typing import Any, List, Tuple, Optional, Dict

from auth import get_user
from config import settings


# ---------- Agent class
class Agent:
    def __init__(
        self,
        id: int,
        name: str,
        status: str,
        embeddings_status: str,
        created_on: int,
        updated_on: Optional[int] = None,
        instructions: Optional[str] = None,
        welcome_message: Optional[str] = None,
        suggested_prompts: Optional[str] = None,
        files: Optional[str] = None,
    ):
        self.id = id
        self.name = name
        self.status = status
        self.embeddings_status = embeddings_status
        self.created_on = created_on
        self.updated_on = updated_on
        self.instructions = instructions
        self.welcome_message = welcome_message
        self.suggested_prompts = suggested_prompts
        self.files = files


# ---------- Internal Methods


def _get_db_connection() -> Tuple[Connection, Cursor]:
    """
    Get a database connection and cursor.
    Ensures the agents table is created if it does not exist.
    """
    conn: Connection = sqlite3.connect(settings.database_url)
    cursor: Cursor = conn.cursor()
    _create_table(cursor)
    return conn, cursor


def _create_table(cursor: Cursor) -> None:
    """
    Create the agents table if it does not exist.
    """
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE,
            instructions TEXT,
            welcome_message TEXT,
            suggested_prompts TEXT,
            files TEXT,
            status TEXT,
            embeddings_status TEXT,
            created_on INTEGER,
            updated_on INTEGER
        )
    """
    )


# Utility function to convert an Agent object to a dictionary of selected fields
def agent_to_dict(agent: Agent) -> Dict[str, Any]:
    return {
        "id": agent.id,
        "name": agent.name,
        "instructions": agent.instructions,
        "welcome_message": agent.welcome_message,
        "suggested_prompts": agent.suggested_prompts,
        "files": agent.files,
        "status": agent.status,
        "embeddings_status": agent.embeddings_status,
        "created_on": agent.created_on,
        "updated_on": agent.updated_on,
    }


# ---------- Methods for Agent Operations


# Function to get a list of agents
def get_agents() -> List[Dict[str, Any]]:
    agents: List[Dict[str, Any]] = []
    try:
        conn, cursor = _get_db_connection()
        cursor.execute(
            "SELECT id, name, status, embeddings_status, created_on, updated_on FROM agents"
        )
        rows: List[tuple] = cursor.fetchall()
        # Convert each row to an Agent object
        for row in rows:
            agent = Agent(
                id=row[0],
                name=row[1],
                status=row[2],
                embeddings_status=row[3],
                created_on=row[4],
                updated_on=row[5],
            )
            # Append to list after converting it to dict
            agents.append(agent_to_dict(agent))
        return agents

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        if conn:
            conn.close()


# Function to create the agent in the database
def save_agent(
    name: str,
    instructions: Optional[str] = None,
    welcome_message: Optional[str] = None,
    suggested_prompts: Optional[str] = None,
    files: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Insert a new agent into the 'agents' table.
    """
    conn: sqlite3.Connection = None
    cursor: sqlite3.Cursor = None
    try:
        conn, cursor = _get_db_connection()

        # Check if an agent with the same name already exists
        cursor.execute("SELECT COUNT(1) FROM agents WHERE name = ?", (name,))
        if cursor.fetchone()[0] > 0:
            raise HTTPException(
                status_code=400, detail="Agent with this name already exists"
            )

        # Get the current time as a UNIX timestamp
        now: int = int(time.time())

        # Insert a new agent
        cursor.execute(
            """
            INSERT INTO agents (name, instructions, welcome_message, suggested_prompts, files, status, embeddings_status, created_on, updated_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (
                name,
                instructions,
                welcome_message,
                suggested_prompts,
                files,
                "",
                "",
                now,
                now,
            ),
        )

        # Retrieve the newly inserted agent data
        cursor.execute(
            """
            SELECT id, name, instructions, welcome_message, suggested_prompts, files, status, 
                   embeddings_status, created_on, updated_on 
            FROM agents WHERE name = ?
        """,
            (name,),
        )

        row = cursor.fetchone()
        if row is None:
            raise ValueError(f"Agent with name '{name}' not found after insertion.")

        # create an Agent object
        agent = Agent(
            id=row[0],
            name=row[1],
            instructions=row[2],
            welcome_message=row[3],
            suggested_prompts=row[4],
            files=row[5],
            status=row[6],
            embeddings_status=row[7],
            created_on=row[8],
            updated_on=row[9],
        )
        return agent_to_dict(agent)

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()


def change_agent(
    name: str,
    instructions: Optional[str],
    welcome_message: Optional[str],
    suggested_prompts: Optional[str],
    files: Optional[str],  # Comma-delimited list of file names
    embeddings_status: Optional[str],
) -> Dict[str, Any]:
    """
    Update the agent's details in the database except for the name.
    """
    conn: sqlite3.Connection = None
    cursor: sqlite3.Cursor = None
    try:
        # Get database connection and cursor
        conn, cursor = _get_db_connection()
        # Ensure the agent exists
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        agent_row = cursor.fetchone()
        if not agent_row:
            raise HTTPException(
                status_code=404, detail=f"Agent with name '{name}' not found"
            )
        # Get the current timestamp for `updated_on`
        updated_on = int(datetime.now().timestamp())
        # Update the agent's fields except for `name` and `created_on`
        cursor.execute(
            """
            UPDATE agents
            SET instructions = COALESCE(?, instructions),
                welcome_message = COALESCE(?, welcome_message),
                suggested_prompts = COALESCE(?, suggested_prompts),
                files = COALESCE(?, files),
                embeddings_status = COALESCE(?, embeddings_status),
                updated_on = ?
            WHERE name = ?
        """,
            (
                instructions,
                welcome_message,
                suggested_prompts,
                files,
                embeddings_status,
                updated_on,
                name,
            ),
        )
        conn.commit()
        # Fetch the updated agent record
        cursor.execute(
            """
            SELECT id, name, instructions, welcome_message, suggested_prompts, files, status, embeddings_status, created_on, updated_on
            FROM agents WHERE name = ?""",
            (name,),
        )
        row = cursor.fetchone()
        if row is None:
            raise ValueError(f"Agent with name '{name}' not found after update.")
        # create an Agent object
        agent = Agent(
            id=row[0],
            name=row[1],
            instructions=row[2],
            welcome_message=row[3],
            suggested_prompts=row[4],
            files=row[5],
            status=row[6],
            embeddings_status=row[7],
            created_on=row[8],
            updated_on=row[9],
        )
        return agent_to_dict(agent)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating agent: {str(e)}")
    finally:
        if conn:
            conn.close()


def update_agent_embeddings_status(
    name: str,
    embeddings_status: str,
) -> None:
    """
    Update the agent's embeddings status and updated_on only.
    """
    conn: sqlite3.Connection = None
    cursor: sqlite3.Cursor = None
    try:
        # Get database connection and cursor
        conn, cursor = _get_db_connection()
        # Ensure the agent exists
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        agent_row = cursor.fetchone()
        if not agent_row:
            raise HTTPException(
                status_code=404, detail=f"Agent with name '{name}' not found"
            )
        # Get the current timestamp for `updated_on`
        updated_on = int(datetime.now().timestamp())
        # Update the agent's fields except for `name` and `created_on`
        cursor.execute(
            """
            UPDATE agents
            SET embeddings_status = COALESCE(?, embeddings_status),
                updated_on = ?
            WHERE name = ?
        """,
            (
                embeddings_status,
                updated_on,
                name,
            ),
        )
        conn.commit()
        return

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating agent: {str(e)}")
    finally:
        if conn:
            conn.close()



# Function to get an agent by name
def get_agent(name: str) -> Agent:
    conn: sqlite3.Connection = None
    cursor: sqlite3.Cursor = None
    try:
        conn, cursor = _get_db_connection()
        cursor.execute(
            """
            SELECT id, name, instructions, welcome_message, suggested_prompts, files, status,
                   embeddings_status, created_on, updated_on
            FROM agents
            WHERE name = ?
        """,
            (name,),
        )
        row = cursor.fetchone()

        if row is None:
            raise ValueError(f"Agent with name '{name}' not found")

        # Create the Agent object
        agent = Agent(
            id=row[0],
            name=row[1],
            instructions=row[2],
            welcome_message=row[3],
            suggested_prompts=row[4],
            files=row[5],
            status=row[6],
            embeddings_status=row[7],
            created_on=row[8],
            updated_on=row[9],
        )
        return agent_to_dict(agent)

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        if conn:
            conn.close()


# Function to delete an agent by name
def delete_agent(name: str) -> None:
    """
    Delete the agent from the database by name.
    """
    conn: sqlite3.Connection = None
    cursor: sqlite3.Cursor = None
    try:
        conn, cursor = _get_db_connection()
        # Check if the agent exists before attempting to delete
        cursor.execute("SELECT name FROM agents WHERE name = ?", (name,))
        agent: Optional[tuple] = cursor.fetchone()

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Delete the agent record from the database
        cursor.execute("DELETE FROM agents WHERE name = ?", (name,))
        conn.commit()

    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    finally:
        if conn:
            conn.close()
