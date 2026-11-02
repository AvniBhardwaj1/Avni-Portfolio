import asyncio
import importlib
import sys
from pathlib import Path

import pytest
from fastapi import HTTPException
from pydantic import ValidationError
from starlette.requests import Request


def load_server(monkeypatch, chat_logging="off"):
    monkeypatch.setenv("MONGO_URL", "mongodb://127.0.0.1:27017")
    monkeypatch.setenv("DB_NAME", "test_portfolio")
    monkeypatch.setenv("CHAT_LOGGING", chat_logging)
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
        self.contact_submissions = FakeChatMessages()


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
    assert "Software Developer Intern" in server.AVNI_SYSTEM_PROMPT
    assert "Transformers in Practice" in server.AVNI_SYSTEM_PROMPT
    assert "TODO(owner)" not in server.AVNI_SYSTEM_PROMPT
    assert any(gap.startswith("TODO(owner)") for gap in server.PROFILE_DATA["gaps"])
    assert server.PROFILE_DATA["contact"]["email"] == "avnibhardwaj01.ab@gmail.com"
    assert "phone" not in server.PROFILE_DATA["contact"]


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
    server = load_server(monkeypatch, chat_logging="on")
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)
    monkeypatch.setenv("LLM_FALLBACK_PROVIDER", "mock")

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


def test_chat_transcripts_are_not_stored_by_default(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)
    monkeypatch.setenv("LLM_PROVIDER", "mock")

    async def call_chat():
        response = await server.chat_clone(
            server.ChatRequest(
                messages=[server.ChatMessage(role="user", content="Tell me about Avni")]
            ),
            make_request(),
        )
        parts = [
            part if isinstance(part, bytes) else part.encode()
            async for part in response.body_iterator
        ]
        return b"".join(parts)

    asyncio.run(call_chat())
    history = asyncio.run(server.chat_history("test-session"))

    assert fake_db.chat_messages.documents == []
    assert history == {"messages": [], "loggingEnabled": False}


def test_contact_submission_is_validated_and_stored(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)

    async def submit():
        return await server.submit_contact(
            server.ContactSubmission(
                name="Recruiter",
                email="recruiter@example.com",
                project_type="Internship",
                message="I would like to discuss a project.",
            ),
            make_request(),
        )

    response = asyncio.run(submit())

    assert response == {"status": "received", "notificationStatus": "skipped"}
    assert len(fake_db.contact_submissions.documents) == 1
    assert fake_db.contact_submissions.documents[0]["email"] == "recruiter@example.com"
    assert fake_db.contact_submissions.documents[0]["projectType"] == "Internship"


def test_contact_is_saved_when_notification_fails(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)
    monkeypatch.setattr(server, "_contact_email_configured", lambda: True)

    async def fail_email(**_kwargs):
        raise HTTPException(status_code=502, detail="email provider unavailable")

    monkeypatch.setattr(server, "send_email", fail_email)

    async def submit():
        return await server.submit_contact(
            server.ContactSubmission(
                name="Recruiter",
                email="recruiter@example.com",
                project_type="Internship",
                message="I would like to discuss a project.",
            ),
            make_request(),
        )

    response = asyncio.run(submit())
    assert response == {"status": "received", "notificationStatus": "failed"}
    assert len(fake_db.contact_submissions.documents) == 1


def test_contact_notification_is_sent_after_saving(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    sent = []
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)
    monkeypatch.setattr(server, "_contact_email_configured", lambda: True)

    async def send_email(**kwargs):
        sent.append(kwargs)
        return "email-id"

    monkeypatch.setattr(server, "send_email", send_email)

    async def submit():
        return await server.submit_contact(
            server.ContactSubmission(
                name="Recruiter",
                email="recruiter@example.com",
                project_type="Internship",
                message="I would like to discuss a project.",
            ),
            make_request(),
        )

    response = asyncio.run(submit())

    assert response == {"status": "received", "notificationStatus": "sent"}
    assert len(fake_db.contact_submissions.documents) == 1
    assert sent[0]["to"] == server.PROFILE_DATA["contact"]["email"]
    assert sent[0]["reply_to"] == "recruiter@example.com"


def test_contact_notification_escapes_untrusted_html(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    sent = []
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)
    monkeypatch.setattr(server, "_contact_email_configured", lambda: True)

    async def send_email(**kwargs):
        sent.append(kwargs)
        return "email-id"

    monkeypatch.setattr(server, "send_email", send_email)

    async def submit():
        return await server.submit_contact(
            server.ContactSubmission(
                name="<img src=x>",
                email="recruiter@example.com",
                project_type="Other",
                message="Please review this <script>alert(1)</script> message.",
            ),
            make_request(),
        )

    response = asyncio.run(submit())

    assert response["notificationStatus"] == "sent"
    assert "<img" not in sent[0]["html"]
    assert "<script>" not in sent[0]["html"]
    assert "&lt;script&gt;" in sent[0]["html"]


def test_contact_honeypot_acknowledges_without_storing(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)

    async def submit():
        return await server.submit_contact(
            server.ContactSubmission(
                name="Bot",
                email="bot@example.com",
                project_type="Other",
                message="I would like to discuss a project.",
                website="https://spam.example",
            ),
            make_request(),
        )

    response = asyncio.run(submit())

    assert response == {"status": "received", "notificationStatus": "skipped"}
    assert fake_db.contact_submissions.documents == []


def test_contact_rate_limit_rejects_the_sixth_request(monkeypatch):
    server = load_server(monkeypatch)
    fake_db = FakeDatabase()
    monkeypatch.setattr(server, "db", fake_db)
    monkeypatch.setattr(server, "_RATE_LIMIT_INDEX_READY", False)
    request = make_request()
    submission = server.ContactSubmission(
        name="Recruiter",
        email="recruiter@example.com",
        project_type="Internship",
        message="I would like to discuss a project.",
    )

    async def submit():
        return await server.submit_contact(submission, request)

    async def submit_five():
        for _ in range(5):
            await submit()
        with pytest.raises(HTTPException) as exc:
            await submit()
        assert exc.value.status_code == 429
        assert exc.value.headers["Retry-After"]

    asyncio.run(submit_five())

    assert len(fake_db.contact_submissions.documents) == 5


def test_contact_submission_rejects_invalid_email(monkeypatch):
    server = load_server(monkeypatch)

    async def submit():
        return await server.submit_contact(
            server.ContactSubmission(
                name="Recruiter",
                email="not-an-email",
                project_type="Other",
                message="I would like to discuss a project.",
            ),
            make_request(),
        )

    with pytest.raises(HTTPException) as exc:
        asyncio.run(submit())

    assert exc.value.status_code == 422
