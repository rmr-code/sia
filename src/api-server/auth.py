"""
auth.py

Handles user authentication, password hashing, and JWT creation/verification for the FastAPI application.
"""

from fastapi import HTTPException
from datetime import datetime, timedelta, timezone
import jwt
import sqlite3
from sqlite3 import Connection, Cursor
from typing import Any, Optional, Tuple, Dict
import time
import bcrypt

from config import settings


# -------- Internal Methods --------

def _get_db_connection() -> Tuple[Connection, Cursor]:
    """
    Get a database connection and cursor. Ensures the users table is created if it does not exist.
    """
    conn: Connection = sqlite3.connect(settings.database_url)
    cursor: Cursor = conn.cursor()
    _create_table(cursor)
    return conn, cursor


def _create_table(cursor: Cursor) -> None:
    """
    Create the users table if it does not exist.
    """
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            hashed_password TEXT,
            role TEXT,
            created_on INTEGER,
            updated_on INTEGER
        )
    ''')


def _hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def _check_password(entered_password: str, stored_hashed_password: str) -> bool:
    """
    Verify that the entered password matches the stored hashed password.
    """
    return bcrypt.checkpw(entered_password.encode('utf-8'), stored_hashed_password.encode('utf-8'))


# -------- User Management Methods --------

def get_user(conn: Connection, cursor: Cursor, username: str) -> Optional[Tuple[int, str, str, str]]:
    """
    Fetch a user by username and role.
    """
    cursor.execute("SELECT id, username, role, hashed_password FROM users WHERE username=? AND role='admin';", (username,))
    return cursor.fetchone()


def set_admin_password(password: str) -> None:
    """
    Set the admin password if it hasn't been set.
    """
    try:
        conn, cursor = _get_db_connection()

        # Check if the admin already exists
        if get_user(conn, cursor, "admin"):
            raise HTTPException(status_code=409, detail="Admin already created")

        # Hash the password and insert the admin user
        hashed_password = _hash_password(password)
        now = int(time.time())

        cursor.execute(
            "INSERT INTO users (username, hashed_password, role, created_on, updated_on) VALUES (?, ?, ?, ?, ?);",
            ("admin", hashed_password, "admin", now, now)
        )
        conn.commit()
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()


def check_admin_password(password: str) -> None:
    """
    Check if the entered admin password is correct.
    """
    try:
        conn, cursor = _get_db_connection()

        # Get admin info
        row = get_user(conn, cursor, "admin")
        if row is None:
            raise HTTPException(status_code=400, detail="Admin not set")

        # Verify the password
        hashed_password = row[3]
        if not _check_password(password, hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()


def change_admin_password(current_password: str, new_password: str) -> None:
    """
    Change the admin password after verifying the current one.
    """
    try:
        conn, cursor = _get_db_connection()

        # Get admin info
        row = get_user(conn, cursor, "admin")
        if row is None:
            raise HTTPException(status_code=400, detail="Admin not set")

        # Verify the current password
        hashed_password = row[3]
        if not _check_password(current_password, hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # Hash the new password and update the user
        new_hashed_password = _hash_password(new_password)
        now = int(time.time())
        cursor.execute(
            "UPDATE users SET hashed_password = ?, updated_on = ? WHERE id = ?;",
            (new_hashed_password, now, row[0])
        )
        conn.commit()
    except sqlite3.Error as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if conn:
            conn.close()


def is_admin_password_set() -> bool:
    """
    Check if the admin password has been set.
    """
    conn, cursor = _get_db_connection()
    admin_exists = bool(get_user(conn, cursor, "admin"))
    conn.close()
    return admin_exists


# -------- JWT Token Methods --------

def create_access_token(data: Dict[str, str]) -> str:
    """
    Create a JWT access token with a given payload.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token and return its decoded payload.
    """
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
