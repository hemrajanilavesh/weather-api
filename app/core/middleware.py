from __future__ import annotations

import time
import uuid
from collections import defaultdict
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import settings
from app.core.exceptions import RateLimitError


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: object, requests: int | None = None, window: int | None = None) -> None:
        super().__init__(app)
        self.requests = requests or settings.rate_limit_requests
        self.window = window or settings.rate_limit_window
        self._counts: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        cutoff = now - self.window

        self._counts[client_ip] = [t for t in self._counts[client_ip] if t > cutoff]

        if len(self._counts[client_ip]) >= self.requests:
            raise RateLimitError()

        self._counts[client_ip].append(now)
        return await call_next(request)
