from __future__ import annotations

from datetime import datetime

from loguru import logger

from app.schemas.weather import (
    CityComparison,
    CompareResponse,
    CurrentWeatherResponse,
    ForecastResponse,
    HistoryResponse,
)
from app.services.cache_service import CacheService
from app.services.openweather_client import BaseWeatherClient
from app.utils.helpers import utc_now


class WeatherService:
    def __init__(self, client: BaseWeatherClient, cache: CacheService) -> None:
        self._client = client
        self._cache = cache

    def _cache_key(self, endpoint: str, city: str, **kwargs: object) -> str:
        parts = [endpoint, city.lower().replace(" ", "_")]
        for k, v in sorted(kwargs.items()):
            parts.append(f"{k}={v}")
        return ":".join(parts)

    async def get_current_weather(self, city: str, units: str = "metric") -> CurrentWeatherResponse:
        key = self._cache_key("current", city, units=units)
        cached = await self._cache.get_weather(key)
        if cached:
            logger.debug("Cache hit for current weather: {}", city)
            return CurrentWeatherResponse(**cached, cached=True)

        logger.debug("Fetching current weather for {}", city)
        result = await self._client.get_current(city, units)
        await self._cache.set_weather(key, result.model_dump(mode="json"), ttl=600)
        return result

    async def get_forecast(self, city: str, units: str = "metric") -> ForecastResponse:
        key = self._cache_key("forecast", city, units=units)
        cached = await self._cache.get_weather(key)
        if cached:
            logger.debug("Cache hit for forecast: {}", city)
            return ForecastResponse(**cached, cached=True)

        logger.debug("Fetching forecast for {}", city)
        result = await self._client.get_forecast(city, units)
        await self._cache.set_weather(key, result.model_dump(mode="json"), ttl=1800)
        return result

    async def get_history(self, city: str, start: datetime, end: datetime) -> HistoryResponse:
        return await self._client.get_history(city, start, end)

    async def compare_cities(self, cities: list[str], units: str = "metric") -> CompareResponse:
        results: list[CityComparison] = []
        for city in cities:
            current = await self.get_current_weather(city, units)
            results.append(
                CityComparison(
                    city=current.city,
                    temperature=current.temperature,
                    humidity=current.humidity,
                    wind=current.wind,
                    conditions=current.conditions,
                )
            )
        return CompareResponse(cities=results, compared_at=utc_now())

    async def close(self) -> None:
        await self._cache.close()
        if hasattr(self._client, "close"):
            await self._client.close()
