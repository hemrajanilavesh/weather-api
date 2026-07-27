from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "Weather Analysis API"
    debug: bool = False
    allowed_origins: list[str] = ["*"]

    # Database
    database_url: str = "sqlite+aiosqlite:///./weather.db"

    # OpenWeatherMap
    openweather_api_key: str = ""
    openweather_base_url: str = "https://api.openweathermap.org/data/2.5"
    openweather_default_units: str = "metric"

    # Redis (optional — falls back to in-memory cache when empty)
    redis_url: str = ""

    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds


settings = Settings()
