from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.database import close_db, init_db
from app.core.exceptions import WeatherAPIError, generic_error_handler, weather_api_error_handler
from app.core.logging import setup_logging
from app.core.middleware import RateLimitMiddleware, RequestIDMiddleware
from app.routers import health, weather


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    setup_logging()
    await init_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Middleware (order matters — first added = outermost)
    application.add_middleware(CORSMiddleware, allow_origins=settings.allowed_origins, allow_methods=["*"], allow_headers=["*"])
    application.add_middleware(RateLimitMiddleware)
    application.add_middleware(RequestIDMiddleware)

    # Exception handlers
    application.add_exception_handler(WeatherAPIError, weather_api_error_handler)
    application.add_exception_handler(Exception, generic_error_handler)

    # Routers
    application.include_router(health.router)
    application.include_router(weather.router, prefix="/api/v1")

    return application


app = create_app()
