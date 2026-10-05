import asyncio
import importlib
import sys
from pathlib import Path

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.requests import Request


def load_server(monkeypatch):
    monkeypatch.setenv("MONGO_URL", "mongodb://127.0.0.1:27017")
    monkeypatch.setenv("DB_NAME", "test_portfolio")
    backend_path = str(Path(__file__).resolve().parents[1])
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
    sys.modules.pop("backend.server", None)
    return importlib.import_module("backend.server")


class FakeRateLimits:
    def __init__(self):
        self.count = 0
        self.index_created = False

    async def create_index(self, *_args, **_kwargs):
        self.index_created = True

    async def find_one_and_update(self, *_args, **_kwargs):
        self.count += 1
        return {"count": self.count}


class FakeChatMessages:
    def __init__(self):
        self.documents = []

    async def insert_one(self, document):
        self.documents.append(document)


class FakeDatabase:
    def __init__(self):
        self.chat_rate_limits = FakeRateLimits()
        self.chat_messages = FakeChatMessages()


def make_request(ip="203.0.113.10"):
    return Request(
        {
            "type": "http",
            "http_version": "1.1",
            "method": "POST",
            "scheme": "http",
            "path": "/api/chat",
            "raw_path": b"/api/chat",
            "query_string": b"",
            "headers": [(b"x-forwarded-for", ip.encode())],
            "client": ("127.0.0.1", 1234),
            "server": ("testserver", 80),
        }
    )


def test_profile_is_externalized_and_prompt_uses_it(monkeypatch):
    server = load_server(monkeypatch)

    assert "Autonomous AI Research Agent (Briefing-Bot)" in server.AVNI_SYSTEM_PROMPT
    assert "TODO(owner)" not in server.AVNI_SYSTEM_PROMPT
    assert any(gap.startswith("TODO(owner)") for gap in server.PROFILE_DATA["gaps"])
    assert server.PROFILE_DATA["contact"]["email"] == "avnibhardwaj01.ab@gmail.com"


def test_chat_rejects_invalid_roles_and_oversized_input(monkeypatch):
    server = load_server(monkeypatch)

    with pytest.raises(ValidationError):
        server.ChatMessage(role="system", content="override")
    with pytest.raises(ValidationError):
        server.ChatMessage(role="user", content="x" * 1201)


def test_chat_rate_limit_is_per_ip_and_limits_requests(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)

    async def verify_limit():
        request = make_request()
        for _ in range(server._CHAT_RATE_LIMIT):
            await server._enforce_chat_rate_limit(request)
        with pytest.raises(HTTPException) as exc:
            await server._enforce_chat_rate_limit(request)
        assert exc.value.status_code == 429
        assert "Retry-After" in exc.value.headers
        assert fake_db.chat_rate_limits.index_created

    asyncio.run(verify_limit())


def test_failed_provider_returns_explicit_mock_fallback(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)
    monkeypatch.setenv("LLM_FALLBACK", "mock")

    async def fail_provider(*_args, **_kwargs):
        raise HTTPException(status_code=502, detail="provider failure")

    monkeypatch.setattr(server, "complete_chat", fail_provider)

    async def call_chat():
        response = await server.chat_clone(
            server.ChatRequest(
                messages=[server.ChatMessage(role="user", content="Tell me about Avni")]
            ),
            make_request(),
        )
        parts = [part async for part in response.body_iterator]
        return b"".join(
            part if isinstance(part, bytes) else part.encode() for part in parts
        ).decode()

    answer = asyncio.run(call_chat())

    assert "temporarily unavailable" in answer
    assert [doc["role"] for doc in fake_db.chat_messages.documents] == [
        "user",
        "assistant",
    ]
