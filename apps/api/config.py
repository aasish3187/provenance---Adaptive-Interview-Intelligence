"""
Provenance API Configuration.
Loads system settings from environment variables and model configurations from config/models.yaml.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Dict
import yaml
from dotenv import load_dotenv
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR = BASE_DIR / "config"
MODELS_FILE = CONFIG_DIR / "models.yaml"

# Load environment configuration from .env if present
load_dotenv(BASE_DIR / ".env")


class Settings(BaseModel):
    environment: str = Field(default_factory=lambda: os.getenv("ENVIRONMENT", "development"))
    api_port: int = Field(default_factory=lambda: int(os.getenv("API_PORT", "8000")))
    api_host: str = Field(default_factory=lambda: os.getenv("API_HOST", "0.0.0.0"))
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
        ]
    )
    database_url: str = Field(
        default_factory=lambda: os.getenv("DATABASE_URL", "sqlite:///./provenance.db")
    )
    secret_key: str = Field(
        default_factory=lambda: os.getenv("SECRET_KEY", "dev_secret_key_provenance_min_32_characters_long")
    )
    gemini_api_key: str = Field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY", "")
    )
    gemini_model_pro: str = Field(
        default_factory=lambda: os.getenv("GEMINI_MODEL_PRO", "gemini-3.1-pro-preview")
    )
    gemini_model_flash: str = Field(
        default_factory=lambda: os.getenv("GEMINI_MODEL_FLASH", "gemini-3.8-flash")
    )
    groq_api_key: str = Field(
        default_factory=lambda: os.getenv("GROQ_API_KEY", "")
    )
    groq_model: str = Field(
        default_factory=lambda: os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    )
    openrouter_api_key: str = Field(
        default_factory=lambda: os.getenv("OPENROUTER_API_KEY", "")
    )
    qwen_api_key: str = Field(
        default_factory=lambda: os.getenv("QWEN_API_KEY", "")
    )


def load_models_config() -> Dict[str, Any]:
    """Load model configurations from models.yaml without hardcoded identifiers."""
    if not MODELS_FILE.exists():
        raise FileNotFoundError(f"Configuration file not found at {MODELS_FILE}")
    with open(MODELS_FILE, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


settings = Settings()
models_config = load_models_config()
