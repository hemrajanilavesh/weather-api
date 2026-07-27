from __future__ import annotations

import statistics
from collections import Counter

from app.schemas.analysis import TemperatureReading, TrendResponse, TrendSummary
from app.services.weather_service import WeatherService


class AnalysisService:
    def __init__(self, weather_service: WeatherService) -> None:
        self._weather = weather_service

    async def get_temperature_trends(self, city: str, units: str = "metric") -> TrendResponse:
        forecast = await self._weather.get_forecast(city, units)

        readings = []
        for entry in forecast.entries:
            readings.append(
                TemperatureReading(
                    timestamp=entry.timestamp,
                    temperature=entry.temperature.current,
                    humidity=entry.humidity,
                )
            )

        temps = [r.temperature for r in readings]
        humids = [r.humidity for r in readings]
        conditions = []
        for entry in forecast.entries:
            if entry.conditions:
                conditions.append(entry.conditions[0].main)

        dominant = Counter(conditions).most_common(1)[0][0] if conditions else "Unknown"

        return TrendResponse(
            city=forecast.city,
            unit=units,
            period="5_day_forecast",
            trends=readings,
            summary=TrendSummary(
                avg_temperature=round(statistics.mean(temps), 1) if temps else 0,
                min_temperature=round(min(temps), 1) if temps else 0,
                max_temperature=round(max(temps), 1) if temps else 0,
                avg_humidity=round(statistics.mean(humids), 1) if humids else 0,
                dominant_condition=dominant,
                data_points=len(readings),
            ),
        )
