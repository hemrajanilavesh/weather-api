from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_add_favorite(client):
    response = await client.post("/api/v1/favorites", json={"city_name": "London", "country": "GB"})
    assert response.status_code == 201
    data = response.json()
    assert data["city_name"] == "London"
    assert data["country"] == "GB"


@pytest.mark.asyncio
async def test_list_favorites(client):
    await client.post("/api/v1/favorites", json={"city_name": "Paris"})
    response = await client.get("/api/v1/favorites")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1


@pytest.mark.asyncio
async def test_remove_favorite(client):
    create_resp = await client.post("/api/v1/favorites", json={"city_name": "Berlin"})
    city_id = create_resp.json()["id"]
    response = await client.delete(f"/api/v1/favorites/{city_id}")
    assert response.status_code == 204
