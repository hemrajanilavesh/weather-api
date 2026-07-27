from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class FavoriteCreate(BaseModel):
    city_name: str = Field(min_length=1, max_length=100, examples=["London"])
    country: str | None = Field(None, max_length=2, examples=["GB"])
    lat: float | None = None
    lon: float | None = None


class FavoriteResponse(BaseModel):
    id: int
    city_name: str
    country: str | None
    lat: float | None
    lon: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class FavoriteListResponse(BaseModel):
    favorites: list[FavoriteResponse]
    count: int
