"""
Mbamager Application Configuration

This module parses global configuration metrics and credentials from environmental variables,
utilizing Pydantic validation to enforce secure initialization rules.
"""

from typing import Optional

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Validates and stores general environment variables for the Mbamager API.
    """
    PROJECT_NAME: str = "Mbamager"
    VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Cryptographic JWT Config
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-for-development"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # PostgreSQL Database Connection
    # Format: postgresql://<user>:<password>@<host>:<port>/<database>
    DATABASE_URL: str = "postgresql://mbamager:mbamager@localhost:5432/mbamager"

    # SMTP configuration for Password Recovery Emails
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@mbamager.com"

    # Cognitive SDK Secret (Google Gemini API)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.5-flash"
    GEMINI_TEMPERATURE: float = 0.2
    GEMINI_MAX_TOKENS: int = 1000

    class Config:
        env_file: str = ".env"
        case_sensitive: bool = True

settings: Settings = Settings()
