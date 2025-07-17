from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os
import warnings

# Suppress known warnings from Pydantic v2
warnings.filterwarnings("ignore", message="Valid config keys have changed in V2:*")

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = os.getenv("DB_NAME", "apphelix_engagement_db")  # Default to apphelix_engagement_db
    AZURE_CLIENT_ID: str
    AZURE_CLIENT_SECRET: str
    AZURE_TENANT_ID: str
    OPENAI_API_KEY: str
    JWT_SECRET_KEY: str
    UPLOAD_DIR: str = './uploads'
    AI_SERVICE_API_KEY: Optional[str] = None
    AZURE_REDIRECT_URI: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env')),
        extra='ignore'  # Optional: ignores unknown variables in the .env
    )

# Create a global settings instance
settings = Settings()
