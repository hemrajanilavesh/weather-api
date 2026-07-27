from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class Coordinates(BaseModel):
    lat: float
    lon: float


class Temperature(BaseModel):
    current: float
    feels_like: float
    min: float
    max: float
    unit: str = "C"


class Wind(BaseModel):
    speed: float
    direction: int | None = None
    unit: str = "m/s"


class WeatherCondition(BaseModel):
    id: int
    main: str
    description: str
    icon: str | None = None


class CurrentWeatherResponse(BaseModel):
    city: str
    country: str | None = None
    coordinates: Coordinates
    temperature: Temperature
    humidity: int = Field(ge=0, le=100)
    pressure: int | None = None
    wind: Wind
    conditions: list[WeatherCondition]
    visibility: int | None = None
    timestamp: datetime
    cached: bool = False


class ForecastEntry(BaseModel):
    timestamp: datetime
    temperature: Temperature
    humidity: int
    conditions: list[WeatherCondition]
    wind: Wind
    pop: float | None = Field(None, description="Probability of precipitation (0-1)")


class ForecastResponse(BaseModel):
    city: str
    country: str | None = None
    coordinates: Coordinates
    entries: list[ForecastEntry]
    cached: bool = False


class HistoryEntry(BaseModel):
    date: datetime
    temperature: Temperature
    humidity: int
    conditions: list[WeatherCondition]
    wind: Wind


class HistoryResponse(BaseModel):
    city: str
    country: str | None = None
    entries: list[HistoryEntry]
    start_date: datetime
    end_date: datetime


class CompareRequest(BaseModel):
    cities: list[str] = Field(min_length=2, max_length=5, description="2-5 city names to compare")
    units: str = Field(default="metric", pattern="^(metric|imperial)$")


class CityComparison(BaseModel):
    city: str
    temperature: Temperature
    humidity: int
    wind: Wind
    conditions: list[WeatherCondition]


class CompareResponse(BaseModel):
    cities: list[CityComparison]
    compared_at: datetime
