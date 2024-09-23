"""
config.py

Configuration settings for the FastAPI application. This module retrieves environment variables and defines constants used throughout the app.
"""

import os
from decimal import Decimal, InvalidOperation
from typing import List

class Settings:
    """Configuration class for loading environment variables and setting static constants."""

    def __init__(self) -> None:
        """Initialize settings by loading environment variables and setting defaults."""
        # Directory paths
        self.data_dir: str = "data"
        self.base_dir: str = os.path.abspath(os.path.dirname(__file__))
        self.agents_dir: str = os.path.join(self.data_dir, "agents")
        self.models_dir: str = os.path.join(self.data_dir, "models")
        self.store_dir: str = os.path.join(self.data_dir, "store")
        
        # Database settings
        self.database_url: str = os.getenv("DATABASE_URL", "./data/sia.db")

        # Security settings
        self.secret_key: str = os.getenv("SECRET_KEY", "some secret key")
        self.header_name: str = "X-Requested-With"  # Fixed header name for requests from the frontend
        self.header_key: str = "XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl"  # Fixed secret key expected from the frontend
        self.algorithm: str = "HS256"  # Algorithm used for encoding JWT
        
        # Token settings
        token_expiry_hours: int = self._get_env_int("TOKEN_EXPIRY_IN_HOURS", 24)
        self.access_token_expire_minutes: int = token_expiry_hours * 60  # Convert hours to minutes

        # embeddings-server info
        self.embeddings_server = os.getenv("EMBEDDINGS_SERVER", "embeddings-server")
        self.embeddings_server_port = self._get_env_int("EMBEDDINGS_SERVER_PORT", 8002) # port used by the embeddings-server

        # llm-server info
        self.llm_server = os.getenv("LLM_SERVER", "llm-server")
        self.llm_server_port = self._get_env_int("LLM_SERVER_PORT", 8000) # port used by the llm-server
        self.llm_model_name = os.getenv("LLM_MODEL_NAME", "microsoft/Phi-3-mini-4k-instruct")
        
        # chat params
        self.chat_response_length_default = os.getenv("CHAT_RESPONSE_LENGTH_DEFAULT", "M")
        self.chat_response_length_short = self._get_env_int("CHAT_RESPONSE_LENGTH_SHORT", 50)
        self.chat_response_length_medium = self._get_env_int("CHAT_RESPONSE_LENGTH_SHORT", 150)
        self.chat_response_length_long = self._get_env_int("CHAT_RESPONSE_LENGTH_SHORT", 300)
        self.chat_temperature = self._get_env_decimal("CHAT_TEMPERATURE", 0.7)
        self.chat_max_tokens = self._get_env_int("CHAT_MAX_TOKENS", 200)
        self.chat_top_p = self._get_env_decimal("CHAT_TOP_P", 0.9)
        self.chat_frequency_penalty = self._get_env_decimal("CHAT_FREQUENCY_PENALTY", 0.0)  # Values from 0.0 to 2.0
        self.chat_presence_penalty = self._get_env_decimal("CHAT_PRESENCE_PENALTY", 0.0)

        # Allowed hosts handling
        allowed_hosts_str: str = os.getenv("ALLOWED_HOSTS", "")
        self.allowed_hosts: List[str] = self._parse_allowed_hosts(allowed_hosts_str)

    def _get_env_int(self, key: str, default: int) -> int:
        """Helper function to safely get an integer environment variable."""
        try:
            return int(os.getenv(key, default))
        except ValueError:
            return default
    def _get_env_decimal(self, key: str, default: Decimal) -> Decimal:
        """Helper function to safely get a decimal environment variable."""
        try:
            return Decimal(os.getenv(key, default))
        except (ValueError, InvalidOperation):
            return default

    def _parse_allowed_hosts(self, hosts_str: str) -> List[str]:
        """Helper function to parse the ALLOWED_HOSTS environment variable into a list."""
        # Split the string by commas, strip spaces, and filter out empty strings
        return [host.strip() for host in hosts_str.split(",") if host.strip()]


# Instantiate settings object
settings = Settings()
