from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_analysis_service, get_favorite_service, get_weather_service
from app.schemas.analysis import TrendResponse
from app.schemas.favorites import FavoriteCreate, FavoriteListResponse, FavoriteResponse
from app.schemas.weather import (
    CompareRequest,
    CompareResponse,
    CurrentWeatherResponse,
    ForecastResponse,
    HistoryResponse,
)
from app.services.analysis_service import AnalysisService
from app.services.favorite_service import FavoriteService
from app.services.weather_service import WeatherService
from app.utils.helpers import utc_now

router = APIRouter(tags=["weather"])


@router.get("/weather/current/{city}", response_model=CurrentWeatherResponse)
async def get_current_weather(
    city: str,
    units: str = Query("metric", pattern="^(metric|imperial)$"),
    service: WeatherService = Depends(get_weather_service),
) -> CurrentWeatherResponse:
    """Get current weather conditions for a city."""
    return await service.get_current_weather(city, units)


@router.get("/weather/forecast/{city}", response_model=ForecastResponse)
async def get_forecast(
    city: str,
    units: str = Query("metric", pattern="^(metric|imperial)$"),
    service: WeatherService = Depends(get_weather_service),
) -> ForecastResponse:
    """Get 5-day weather forecast for a city."""
    return await service.get_forecast(city, units)


@router.get("/weather/history/{city}", response_model=HistoryResponse)
async def get_history(
    city: str,
    days: int = Query(7, ge=1, le=30),
    service: WeatherService = Depends(get_weather_service),
) -> HistoryResponse:
    """Get historical weather data (mocked for free tier)."""
    end = utc_now()
    start = end - timedelta(days=days)
    return await service.get_history(city, start, end)


@router.post("/weather/compare", response_model=CompareResponse)
async def compare_cities(
    request: CompareRequest,
    service: WeatherService = Depends(get_weather_service),
) -> CompareResponse:
    """Compare current weather across multiple cities."""
    return await service.compare_cities(request.cities, request.units)


@router.get("/weather/analysis/trends", response_model=TrendResponse)
async def get_trends(
    city: str = Query(..., min_length=1),
    units: str = Query("metric", pattern="^(metric|imperial)$"),
    analysis: AnalysisService = Depends(get_analysis_service),
) -> TrendResponse:
    """Get temperature and humidity trends for a city."""
    return await analysis.get_temperature_trends(city, units)


# --- Favorites ---

@router.post("/favorites", response_model=FavoriteResponse, status_code=201)
async def add_favorite(
    data: FavoriteCreate,
    service: FavoriteService = Depends(get_favorite_service),
) -> FavoriteResponse:
    """Add a city to favorites."""
    return await service.add(data)


@router.get("/favorites", response_model=FavoriteListResponse)
async def list_favorites(
    service: FavoriteService = Depends(get_favorite_service),
) -> FavoriteListResponse:
    """List all favorite cities."""
    favorites = await service.list_all()
    return FavoriteListResponse(favorites=favorites, count=len(favorites))


@router.delete("/favorites/{city_id}", status_code=204)
async def remove_favorite(
    city_id: int,
    service: FavoriteService = Depends(get_favorite_service),
) -> None:
    """Remove a city from favorites."""
    await service.remove(city_id)
