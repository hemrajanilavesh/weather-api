from __future__ import annotations

from collections.abc import AsyncGenerator

from app.core.database import async_session_factory
from app.services.analysis_service import AnalysisService
from app.services.cache_service import CacheService, get_cache_backend
from app.services.favorite_service import FavoriteService
from app.services.openweather_client import BaseWeatherClient, get_weather_client
from app.services.weather_service import WeatherService


async def get_weather_client_dep() -> AsyncGenerator[BaseWeatherClient, None]:
    client = get_weather_client()
    yield client
    if hasattr(client, "close"):
        await client.close()


async def get_weather_service() -> AsyncGenerator[WeatherService, None]:
    client = get_weather_client()
    backend = get_cache_backend()
    cache = CacheService(backend)
    service = WeatherService(client, cache)
    yield service
    await service.close()


async def get_favorite_service() -> AsyncGenerator[FavoriteService, None]:
    async with async_session_factory() as session:
        yield FavoriteService(session)


async def get_analysis_service() -> AsyncGenerator[AnalysisService, None]:
    client = get_weather_client()
    backend = get_cache_backend()
    cache = CacheService(backend)
    weather_service = WeatherService(client, cache)
    yield AnalysisService(weather_service)
    await weather_service.close()
