from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class TemperatureTrend(BaseModel):
    city: str
    readings: list[TemperatureReading]
    avg_temperature: float
    min_temperature: float
    max_temperature: float
    trend: str = Field(description="rising, falling, or stable")


class TemperatureReading(BaseModel):
    timestamp: datetime
    temperature: float
    humidity: int


class TrendResponse(BaseModel):
    city: str
    unit: str = "metric"
    period: str = Field(description="e.g. 'last_24h', 'last_7d'")
    trends: list[TemperatureReading]
    summary: TrendSummary


class TrendSummary(BaseModel):
    avg_temperature: float
    min_temperature: float
    max_temperature: float
    avg_humidity: float
    dominant_condition: str
    data_points: int
