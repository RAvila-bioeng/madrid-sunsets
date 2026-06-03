"""Runtime configuration for the Raspberry Pi capture service."""

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration read from environment variables or an app-local .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    supabase_url: str = Field(
        validation_alias=AliasChoices("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    )
    supabase_service_role_key: str = Field(validation_alias="SUPABASE_SERVICE_ROLE_KEY")
    latitude: float = 40.4168
    longitude: float = -3.7038
    capture_window_minutes: int = 90
    capture_before_sunset_minutes: int = 60
    capture_interval_seconds: int = 180
    raw_retention_days: int = 14
    raw_bucket: str = "sunsets-raw"
    best_bucket: str = "sunsets-best"
    telegram_bot_token: str | None = Field(default=None, validation_alias="TELEGRAM_BOT_TOKEN")
    telegram_chat_id: str | None = Field(default=None, validation_alias="TELEGRAM_CHAT_ID")


# Pydantic settings reads required values from the environment at runtime.
settings = Settings()  # type: ignore[call-arg]
