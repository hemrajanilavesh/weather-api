from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_get_current_weather(client):
    response = await client.get("/api/v1/weather/current/London")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "London"
    assert "temperature" in data
    assert "humidity" in data
    assert "conditions" in data


@pytest.mark.asyncio
async def test_get_forecast(client):
    response = await client.get("/api/v1/weather/forecast/Paris")
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Paris"
    assert "entries" in data
    assert len(data["entries"]) > 0


@pytest.mark.asyncio
async def test_compare_cities(client):
    response = await client.post(
        "/api/v1/weather/compare",
        json={"cities": ["London", "Paris", "Tokyo"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["cities"]) == 3
    city_names = [c["city"] for c in data["cities"]]
    assert "London" in city_names


@pytest.mark.asyncio
async def test_get_trends(client):
    response = await client.get("/api/v1/weather/analysis/trends", params={"city": "Berlin"})
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Berlin"
    assert "summary" in data
    assert "trends" in data
