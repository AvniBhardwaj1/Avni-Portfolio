import asyncio
import importlib
import sys
from pathlib import Path

import httpx


def _load_server(monkeypatch):
    monkeypatch.setenv("MONGO_URL", "mongodb://127.0.0.1:27017")
    monkeypatch.setenv("DB_NAME", "test_portfolio")
    backend_path = str(Path(__file__).resolve().parents[1])
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
    sys.modules.pop("server", None)
    return importlib.import_module("server")


def test_stats_deny_when_token_is_not_configured(monkeypatch):
    monkeypatch.delenv("STATS_TOKEN", raising=False)
    server = _load_server(monkeypatch)

    async def request():
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=server.app), base_url="http://test"
        ) as client:
            return await client.get("/api/analytics/stats", headers={"x-stats-token": "anything"})

    response = asyncio.run(request())

    assert response.status_code == 401


def test_cron_rejects_stats_token_and_requires_cron_secret(monkeypatch):
    monkeypatch.setenv("STATS_TOKEN", "configured-stats-token")
    monkeypatch.delenv("CRON_SECRET", raising=False)
    server = _load_server(monkeypatch)

    async def request():
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=server.app), base_url="http://test"
        ) as client:
            return await client.get(
                "/api/cron/weekly-digest",
                headers={"x-stats-token": "configured-stats-token"},
            )

    response = asyncio.run(request())

    assert response.status_code == 401
