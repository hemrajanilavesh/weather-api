from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_trends_returns_summary(client):
    response = await client.get("/api/v1/weather/analysis/trends", params={"city": "Rome"})
    assert response.status_code == 200
    data = response.json()
    summary = data["summary"]
    assert summary["data_points"] > 0
    assert summary["avg_temperature"] != 0
