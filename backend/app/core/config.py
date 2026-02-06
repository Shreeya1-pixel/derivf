import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sentinel Backend"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://user:password@localhost/dbname")
    
    # AI Configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    MODEL_NAME: str = "google/gemini-2.0-flash-001"
    
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:8000", "https://localhost:8000", "http://localhost:5173", "https://localhost:5173"]

    # Slack Configuration
    SLACK_BOT_TOKEN: str = os.getenv("SLACK_BOT_TOKEN", "")
    SLACK_CHANNEL_ID: str = os.getenv("SLACK_CHANNEL_ID", "general")
    
    # Supabase (Database)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    class Config:
        env_file = ".env"

settings = Settings()
