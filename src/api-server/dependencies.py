"""
dependencies.py

Dependency functions for FastAPI routes, including API key verification and JWT-based user authentication.
"""

from fastapi import Header, HTTPException, Cookie
from starlette.datastructures import Headers
from typing import Dict, Optional, Union
from config import settings
from auth import verify_jwt_token

# ---------- Helper Functions ----------

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


async def get_current_user(access_token: Optional[str] = Cookie(None)) -> Dict[str, str]:
    """
    Verify the JWT token from the access_token cookie and extract user details.

    Args:
        access_token (Optional[str]): JWT token from the cookies.

    Returns:
        Dict[str, str]: A dictionary with the username if the token is valid.

    Raises:
        HTTPException: If the token is missing or invalid.
    """
    # Check if the access token is present in cookies
    if access_token is None:
        raise HTTPException(
            status_code=403, 
            detail="Access token is missing in cookies"
        )

    # Verify and decode the JWT token using the function from auth.py
    payload: Dict[str, Optional[str]] = verify_jwt_token(access_token)

    # Extract the username (sub) from the token payload
    username: Optional[str] = payload.get("sub")

    # Check if username is valid
    if username is None:
        raise HTTPException(
            status_code=401, 
            detail="Invalid user"
        )

    # Return user information
    return {"username": username}
