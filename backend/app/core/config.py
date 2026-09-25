"""Application configuration and settings."""

from typing import List, Union, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    APP_NAME: str = "Naxora CRM"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "debug", "dev", "development")
        return bool(v)

    # Security
    SECRET_KEY: str = "default_development_secret_key_change_in_production_min32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/naxora_crm"

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        import json
        try:
            return json.loads(v)
        except Exception:
            return ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Initial Super Admin Seed
    FIRST_SUPERUSER_EMAIL: str = "admin@nexorastaffing.com"
    FIRST_SUPERUSER_PASSWORD: str = "NexoraAdmin@2026!"
    FIRST_SUPERUSER_FIRST_NAME: str = "Nexora"
    FIRST_SUPERUSER_LAST_NAME: str = "Admin"


settings = Settings()

