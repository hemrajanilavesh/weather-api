from __future__ import annotations

import abc
from datetime import UTC, datetime

import httpx
from loguru import logger
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings
from app.core.exceptions import CityNotFoundError, ExternalAPIError
from app.schemas.weather import (
    Coordinates,
    CurrentWeatherResponse,
    ForecastEntry,
    ForecastResponse,
    HistoryEntry,
    HistoryResponse,
    Temperature,
    WeatherCondition,
    Wind,
)


class BaseWeatherClient(abc.ABC):
    @abc.abstractmethod
    async def get_current(self, city: str, units: str | None = None) -> CurrentWeatherResponse: ...

    @abc.abstractmethod
    async def get_forecast(self, city: str, units: str | None = None, count: int = 40) -> ForecastResponse: ...

    @abc.abstractmethod
    async def get_history(self, city: str, start: datetime, end: datetime) -> HistoryResponse: ...


class OpenWeatherClient(BaseWeatherClient):
    def __init__(self) -> None:
        self._base_url = settings.openweather_base_url
        self._api_key = settings.openweather_api_key
        self._client = httpx.AsyncClient(timeout=10.0)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=10))
    async def _request(self, params: dict) -> dict:
        params["appid"] = self._api_key
        response = await self._client.get(self._base_url, params=params)
        if response.status_code == 404:
            raise CityNotFoundError(params.get("q", "unknown"))
        if response.status_code != 200:
            logger.error("OpenWeather API error: {}", response.text)
            raise ExternalAPIError("OpenWeatherMap", f"HTTP {response.status_code}")
        return response.json()

    def _parse_current(self, data: dict) -> CurrentWeatherResponse:
        main = data.get("main", {})
        return CurrentWeatherResponse(
            city=data["name"],
            country=data.get("sys", {}).get("country"),
            coordinates=Coordinates(lat=data["coord"]["lat"], lon=data["coord"]["lon"]),
            temperature=Temperature(
                current=main.get("temp", 0),
                feels_like=main.get("feels_like", 0),
                min=main.get("temp_min", 0),
                max=main.get("temp_max", 0),
            ),
            humidity=main.get("humidity", 0),
            pressure=main.get("pressure"),
            wind=Wind(speed=data.get("wind", {}).get("speed", 0), direction=data.get("wind", {}).get("deg")),
            conditions=[
                WeatherCondition(id=w["id"], main=w["main"], description=w["description"], icon=w.get("icon"))
                for w in data.get("weather", [])
            ],
            visibility=data.get("visibility"),
            timestamp=datetime.fromtimestamp(data.get("dt", 0), tz=UTC),
        )

    def _parse_forecast(self, data: dict) -> ForecastResponse:
        entries = []
        for item in data.get("list", []):
            entries.append(
                ForecastEntry(
                    timestamp=datetime.fromtimestamp(item["dt"], tz=UTC),
                    temperature=Temperature(
                        current=item["main"]["temp"],
                        feels_like=item["main"]["feels_like"],
                        min=item["main"]["temp_min"],
                        max=item["main"]["temp_max"],
                    ),
                    humidity=item["main"]["humidity"],
                    conditions=[
                        WeatherCondition(id=w["id"], main=w["main"], description=w["description"], icon=w.get("icon"))
                        for w in item.get("weather", [])
                    ],
                    wind=Wind(speed=item.get("wind", {}).get("speed", 0), direction=item.get("wind", {}).get("deg")),
                    pop=item.get("pop"),
                )
            )
        city_info = data.get("city", {})
        return ForecastResponse(
            city=city_info.get("name", ""),
            country=city_info.get("country"),
            coordinates=Coordinates(lat=city_info.get("coord", {}).get("lat", 0), lon=city_info.get("coord", {}).get("lon", 0)),
            entries=entries,
        )

    async def get_current(self, city: str, units: str | None = None) -> CurrentWeatherResponse:
        data = await self._request({"q": city, "units": units or settings.openweather_default_units})
        return self._parse_current(data)

    async def get_forecast(self, city: str, units: str | None = None, count: int = 40) -> ForecastResponse:
        data = await self._request({"q": city, "units": units or settings.openweather_default_units, "cnt": count})
        return self._parse_forecast(data)

    async def get_history(self, city: str, start: datetime, end: datetime) -> HistoryResponse:
        raise ExternalAPIError("OpenWeatherMap", "Historical data requires a paid plan")

    async def close(self) -> None:
        await self._client.aclose()


class MockWeatherClient(BaseWeatherClient):
    """Deterministic mock client for development and testing."""

    async def get_current(self, city: str, units: str | None = None) -> CurrentWeatherResponse:
        import random

        random.seed(hash(city) % 2**31)
        return CurrentWeatherResponse(
            city=city.title(),
            country="MO",
            coordinates=Coordinates(lat=51.5, lon=-0.1),
            temperature=Temperature(current=22.0, feels_like=21.0, min=19.0, max=25.0),
            humidity=random.randint(40, 80),
            pressure=1013,
            wind=Wind(speed=random.uniform(1.0, 10.0), direction=random.randint(0, 360)),
            conditions=[WeatherCondition(id=800, main="Clear", description="clear sky")],
            visibility=10000,
            timestamp=datetime.now(UTC),
        )

    async def get_forecast(self, city: str, units: str | None = None, count: int = 40) -> ForecastResponse:
        import random

        random.seed(hash(city) % 2**31)
        entries = []
        now = datetime.now(UTC)
        for _ in range(min(count, 8)):
            entries.append(
                ForecastEntry(
                    timestamp=now,
                    temperature=Temperature(
                        current=random.uniform(15.0, 30.0),
                        feels_like=random.uniform(14.0, 29.0),
                        min=random.uniform(13.0, 25.0),
                        max=random.uniform(25.0, 35.0),
                    ),
                    humidity=random.randint(30, 90),
                    conditions=[WeatherCondition(id=800, main="Clear", description="clear sky")],
                    wind=Wind(speed=random.uniform(0.5, 8.0), direction=random.randint(0, 360)),
                    pop=random.uniform(0, 0.5),
                )
            )
        return ForecastResponse(
            city=city.title(), country="MO", coordinates=Coordinates(lat=51.5, lon=-0.1), entries=entries
        )

    async def get_history(self, city: str, start: datetime, end: datetime) -> HistoryResponse:
        import random

        random.seed(hash(city) % 2**31)
        return HistoryResponse(
            city=city.title(),
            country="MO",
            entries=[
                HistoryEntry(
                    date=start,
                    temperature=Temperature(current=20.0, feels_like=19.0, min=17.0, max=24.0),
                    humidity=random.randint(40, 80),
                    conditions=[WeatherCondition(id=800, main="Clear", description="clear sky")],
                    wind=Wind(speed=random.uniform(1.0, 5.0)),
                )
            ],
            start_date=start,
            end_date=end,
        )


def get_weather_client() -> BaseWeatherClient:
    if settings.openweather_api_key:
        return OpenWeatherClient()
    return MockWeatherClient()
