import os
from pathlib import Path
from typing import Optional, List
from pydantic import computed_field, Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env as soon as this module is imported
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

class Settings(BaseSettings):
    # Database configuration - REMOVED
    REDIS_URL: Optional[str] = None
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "dev_secret_key_change_me_in_production"
    
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "models/gemini-2.5-flash"
    DEEPSEEK_KEY: Optional[str] = None
    AT_RISK_THRESHOLD: float = 0.2

    # Supabase Configuration
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None  # For admin operations

    # Default AI Models for different use cases - centralized configuration
    DEFAULT_ROADMAP_MODEL: str = "models/gemini-2.5-pro"
    DEFAULT_FEEDBACK_MODEL: str = "models/gemini-2.5-flash"
    DEFAULT_LEARNING_CONTENT_MODEL: str = "models/gemini-2.5-flash"
    DEFAULT_VISUALIZATION_MODEL: str = "models/gemini-2.5-flash"
    DEFAULT_LEARNING_RESOURCES_MODEL: str = "models/gemini-2.5-flash"
    # Email / Auth integrations
    RESEND_API_KEY: Optional[str] = None
    RESEND_SENDER: str = "eulerfold@gmail.com"
    SENTRY_DSN: Optional[str] = None
    SENTRY_ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"  # URL of the Next.js frontend
    YOUTUBE_API_KEY: Optional[str] = None
    
    # ToS & Privacy Policy
    TOS_VERSION: str = "2026-03"

    # Payments
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None
    RAZORPAY_PLAN_ID: Optional[str] = None

    CORS_ALLOWED_ORIGINS: str = Field(
        default="*",
        description="Comma-separated list of allowed CORS origins"
    )
    
    @computed_field
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
