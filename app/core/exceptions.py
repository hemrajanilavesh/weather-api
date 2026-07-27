from __future__ import annotations

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class WeatherAPIError(HTTPException):
    """Base exception for weather API errors."""

    def __init__(self, status_code: int, detail: str, headers: dict[str, str] | None = None) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class CityNotFoundError(WeatherAPIError):
    def __init__(self, city: str) -> None:
        super().__init__(status_code=404, detail=f"City '{city}' not found")


class RateLimitError(WeatherAPIError):
    def __init__(self) -> None:
        super().__init__(
            status_code=429,
            detail="Rate limit exceeded. Please try again later.",
            headers={"Retry-After": "60"},
        )


class ExternalAPIError(WeatherAPIError):
    def __init__(self, service: str, message: str = "Service temporarily unavailable") -> None:
        super().__init__(status_code=502, detail=f"{service}: {message}")


class CacheError(WeatherAPIError):
    def __init__(self, message: str = "Cache operation failed") -> None:
        super().__init__(status_code=500, detail=message)


async def weather_api_error_handler(request: Request, exc: WeatherAPIError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
        headers=exc.headers,
    )


async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500},
    )
