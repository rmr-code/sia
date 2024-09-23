"""
config.py

Configuration settings for the Embeddings-server application. 
This module retrieves environment variables and defines constants used throughout the app.
"""

import os
from typing import List

class Settings:
    """Configuration class for loading environment variables and setting static constants."""

    def __init__(self) -> None:
        """Initialize settings by loading environment variables and setting defaults."""
        # Environment-specific variables from .env
        self.embedding_model_name: str = os.getenv("EMBEDDING_MODEL_NAME")
        self.embedding_model_filename: str = os.getenv("EMBEDDING_MODEL_FILENAME", "pytorch_model.bin") 
        self.no_workers: int = self._get_env_int("EMBEDDINGS_NO_WORKERS", 1)
        self.hf_api_token: str = os.getenv("HF_API_TOKEN", "NONE")
        
        # Directory paths
        self.data_dir: str = "data"
        self.base_dir: str = os.path.abspath(os.path.dirname(__file__))
        self.agents_dir: str = os.path.join(self.data_dir, "agents")
        self.models_dir: str = os.path.join(self.data_dir, "models")
        self.store_dir: str = os.path.join(self.data_dir, "store")
        
        # Security settings
        self.header_name: str = "X-Requested-With"  # Fixed header name for requests from the frontend
        self.header_key: str = "XteNATqxnbBkPa6TCHcK0NTxOM1JVkQl"  # Fixed secret key expected from the frontend
        
        # api-server info
        self.api_server = os.getenv("API_SERVER", "embeddings-server")
        self.api_server_port = self._get_env_int("API_SERVER_PORT", 8080) # port used by the api-server

    def _get_env_int(self, key: str, default: int) -> int:
        """Helper function to safely get an integer environment variable."""
        try:
            return int(os.getenv(key, default))
        except ValueError:
            return default

# Instantiate settings object
settings = Settings()
