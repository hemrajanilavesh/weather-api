from __future__ import annotations

import abc
import json
import time
from typing import Any

from loguru import logger

from app.config import settings


class CacheBackend(abc.ABC):
    @abc.abstractmethod
    async def get(self, key: str) -> Any | None: ...

    @abc.abstractmethod
    async def set(self, key: str, value: Any, ttl: int = 300) -> None: ...

    @abc.abstractmethod
    async def delete(self, key: str) -> None: ...

    @abc.abstractmethod
    async def close(self) -> None: ...


class InMemoryCache(CacheBackend):
    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float]] = {}

    async def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.time() > expires_at:
            del self._store[key]
            return None
        return value

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        self._store[key] = (value, time.time() + ttl)

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)

    async def close(self) -> None:
        self._store.clear()


class RedisCache(CacheBackend):
    def __init__(self) -> None:
        import redis.asyncio as aioredis

        self._client = aioredis.from_url(settings.redis_url, decode_responses=True)

    async def get(self, key: str) -> Any | None:
        try:
            raw = await self._client.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as exc:
            logger.warning("Redis get failed: {}", exc)
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> None:
        try:
            await self._client.set(key, json.dumps(value, default=str), ex=ttl)
        except Exception as exc:
            logger.warning("Redis set failed: {}", exc)

    async def delete(self, key: str) -> None:
        try:
            await self._client.delete(key)
        except Exception as exc:
            logger.warning("Redis delete failed: {}", exc)

    async def close(self) -> None:
        await self._client.aclose()


class CacheService:
    def __init__(self, backend: CacheBackend) -> None:
        self._backend = backend

    async def get_weather(self, key: str) -> dict | None:
        return await self._backend.get(f"weather:{key}")

    async def set_weather(self, key: str, data: dict, ttl: int = 300) -> None:
        await self._backend.set(f"weather:{key}", data, ttl=ttl)

    async def invalidate(self, key: str) -> None:
        await self._backend.delete(f"weather:{key}")

    async def close(self) -> None:
        await self._backend.close()


def get_cache_backend() -> CacheBackend:
    if settings.redis_url:
        logger.info("Using Redis cache")
        return RedisCache()
    logger.info("Using in-memory cache")
    return InMemoryCache()
