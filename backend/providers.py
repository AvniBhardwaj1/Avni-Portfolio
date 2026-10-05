import logging
import os

import httpx
from fastapi import HTTPException

logger = logging.getLogger(__name__)

_DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "groq": "llama-3.3-70b-versatile",
    "openrouter": "openai/gpt-4o-mini",
    "anthropic": "claude-3-5-haiku-latest",
    "gemini": "gemini-2.5-flash",
}
_OPENAI_COMPATIBLE = {
    "openai": "https://api.openai.com/v1/chat/completions",
    "groq": "https://api.groq.com/openai/v1/chat/completions",
    "openrouter": "https://openrouter.ai/api/v1/chat/completions",
}


def _max_tokens() -> int:
    try:
        value = int(os.environ.get("LLM_MAX_TOKENS", "512"))
    except ValueError as exc:
        raise HTTPException(status_code=503, detail="LLM_MAX_TOKENS must be an integer") from exc
    if not 1 <= value <= 2048:
        raise HTTPException(status_code=503, detail="LLM_MAX_TOKENS must be between 1 and 2048")
    return value


def _response_text(data: dict, provider: str) -> str:
    try:
        if provider in _OPENAI_COMPATIBLE:
            content = data["choices"][0]["message"]["content"]
            if isinstance(content, list):
                content = "".join(
                    part.get("text", "") for part in content if isinstance(part, dict)
                )
        elif provider == "anthropic":
            content = "".join(
                part.get("text", "")
                for part in data["content"]
                if isinstance(part, dict) and part.get("type") == "text"
            )
        else:
            content = "".join(
                part.get("text", "")
                for part in data["candidates"][0]["content"]["parts"]
                if isinstance(part, dict)
            )
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(status_code=502, detail="Invalid response from LLM provider") from exc
    if not isinstance(content, str) or not content.strip():
        raise HTTPException(status_code=502, detail="LLM provider returned an empty response")
    return content


async def complete_chat(messages: list[dict[str, str]], system_prompt: str) -> str:
    provider = os.environ.get("LLM_PROVIDER", "mock").strip().lower()
    if provider == "mock":
        return (
            "The portfolio assistant is running in mock mode and cannot answer dynamically yet. "
            "Please refer to Avni's project and experience sections."
        )
    if provider not in _DEFAULT_MODELS:
        raise HTTPException(status_code=503, detail="Unsupported LLM_PROVIDER")

    api_key = os.environ.get("LLM_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=503, detail="LLM_API_KEY is required for the selected provider")
    model = os.environ.get("LLM_MODEL", _DEFAULT_MODELS[provider]).strip()
    if not model:
        raise HTTPException(status_code=503, detail="LLM_MODEL cannot be empty")

    max_tokens = _max_tokens()
    timeout = httpx.Timeout(20.0, connect=5.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if provider in _OPENAI_COMPATIBLE:
                response = await client.post(
                    _OPENAI_COMPATIBLE[provider],
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": model,
                        "messages": [{"role": "system", "content": system_prompt}, *messages],
                        "max_tokens": max_tokens,
                    },
                )
            elif provider == "anthropic":
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": api_key,
                        "anthropic-version": "2023-06-01",
                    },
                    json={
                        "model": model,
                        "system": system_prompt,
                        "messages": messages,
                        "max_tokens": max_tokens,
                    },
                )
            else:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                    params={"key": api_key},
                    json={
                        "systemInstruction": {"parts": [{"text": system_prompt}]},
                        "contents": [
                            {
                                "role": "model" if message["role"] == "assistant" else "user",
                                "parts": [{"text": message["content"]}],
                            }
                            for message in messages
                        ],
                        "generationConfig": {"maxOutputTokens": max_tokens},
                    },
                )
            response.raise_for_status()
            try:
                return _response_text(response.json(), provider)
            except ValueError as exc:
                raise HTTPException(status_code=502, detail="Invalid response from LLM provider") from exc
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail="LLM provider timed out") from exc
    except httpx.HTTPStatusError as exc:
        logger.warning("LLM provider returned HTTP %s", exc.response.status_code)
        raise HTTPException(status_code=502, detail="LLM provider request failed") from exc
    except httpx.RequestError as exc:
        logger.warning("LLM provider request failed: %s", type(exc).__name__)
        raise HTTPException(status_code=502, detail="LLM provider is unavailable") from exc
