from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.favorite import FavoriteCity
from app.schemas.favorites import FavoriteCreate, FavoriteResponse


class FavoriteService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, data: FavoriteCreate) -> FavoriteResponse:
        city = FavoriteCity(
            city_name=data.city_name.strip().title(),
            country=data.country.upper() if data.country else None,
            lat=data.lat,
            lon=data.lon,
        )
        self._session.add(city)
        await self._session.flush()
        await self._session.refresh(city)
        return FavoriteResponse.model_validate(city)

    async def list_all(self) -> list[FavoriteResponse]:
        result = await self._session.execute(select(FavoriteCity).order_by(FavoriteCity.created_at.desc()))
        cities = result.scalars().all()
        return [FavoriteResponse.model_validate(c) for c in cities]

    async def remove(self, city_id: int) -> bool:
        result = await self._session.execute(select(FavoriteCity).where(FavoriteCity.id == city_id))
        city = result.scalar_one_or_none()
        if city is None:
            return False
        await self._session.delete(city)
        return True

    async def get_by_name(self, city_name: str) -> FavoriteResponse | None:
        result = await self._session.execute(
            select(FavoriteCity).where(FavoriteCity.city_name == city_name.strip().title())
        )
        city = result.scalar_one_or_none()
        if city is None:
            return None
        return FavoriteResponse.model_validate(city)
