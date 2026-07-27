from __future__ import annotations

from datetime import UTC, datetime


def utc_now() -> datetime:
    """Return current UTC time with timezone info."""
    return datetime.now(UTC)


def normalize_city_name(city: str) -> str:
    """Normalize city name: strip, title-case."""
    return city.strip().title()
