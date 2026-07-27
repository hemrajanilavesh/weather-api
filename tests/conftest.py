from __future__ import annotations

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base
from app.dependencies import get_analysis_service, get_favorite_service, get_weather_service
from app.main import app
from app.services.analysis_service import AnalysisService
from app.services.cache_service import CacheService, InMemoryCache
from app.services.favorite_service import FavoriteService
from app.services.openweather_client import MockWeatherClient
from app.services.weather_service import WeatherService


@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.fixture
def mock_weather_client():
    return MockWeatherClient()


@pytest.fixture
def cache_service():
    return CacheService(InMemoryCache())


@pytest.fixture
def weather_service(mock_weather_client, cache_service):
    return WeatherService(mock_weather_client, cache_service)


@pytest.fixture
def analysis_service(weather_service):
    return AnalysisService(weather_service)


@pytest_asyncio.fixture
async def client(weather_service, analysis_service, db_session):
    app.dependency_overrides[get_weather_service] = lambda: weather_service
    app.dependency_overrides[get_analysis_service] = lambda: analysis_service
    app.dependency_overrides[get_favorite_service] = lambda: FavoriteService(db_session)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
