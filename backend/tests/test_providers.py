import asyncio

import pytest
from fastapi import HTTPException

from backend.providers import _response_text, complete_chat


def test_mock_provider_works_without_api_key(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    monkeypatch.delenv("LLM_API_KEY", raising=False)

    answer = asyncio.run(complete_chat([{"role": "user", "content": "Hello"}], "system"))

    assert "mock mode" in answer


@pytest.mark.parametrize(
    ("provider", "data", "expected"),
    [
        ("openai", {"choices": [{"message": {"content": "Hello"}}]}, "Hello"),
        ("anthropic", {"content": [{"type": "text", "text": "Hello"}]}, "Hello"),
        (
            "gemini",
            {"candidates": [{"content": {"parts": [{"text": "Hello"}]}}]},
            "Hello",
        ),
    ],
)
def test_response_text_supports_provider_response_shapes(provider, data, expected):
    assert _response_text(data, provider) == expected


def test_provider_requires_api_key(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "openai")
    monkeypatch.delenv("LLM_API_KEY", raising=False)

    with pytest.raises(HTTPException) as exc:
        asyncio.run(complete_chat([{"role": "user", "content": "Hello"}], "system"))

    assert exc.value.status_code == 503


def test_unsupported_provider_is_explicit(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "unsupported")

    with pytest.raises(HTTPException) as exc:
        asyncio.run(complete_chat([{"role": "user", "content": "Hello"}], "system"))

    assert exc.value.status_code == 503
