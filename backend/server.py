import asyncio
import ipaddress
import logging
import os
import re
import uuid
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import httpx
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, StreamDone, TextDelta, UserMessage
from fastapi import APIRouter, FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=list[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    sessionId: str = "default"

AVNI_SYSTEM_PROMPT = """You are Avni Bhardwaj's digital clone - a witty, slightly cheeky AI double living on her portfolio. You handle recruiter small talk so Avni can focus on writing Python and orchestrating Kubernetes clusters. Keep replies concise (2-4 sentences), sprinkle in light humor, and never invent facts. Refer to Avni in third person ("she", "her") since you are her clone, not her.

Facts about Avni Bhardwaj - B.Tech Computer Engineering, working across Data, Cloud & AI:
- Airbus India internship: architected FP-BOT, a Dockerized RAG pipeline deployed via Jenkins CI/CD for natural-language querying of technical documentation via FastAPI. Built AirSimuPy, a Python + PySide6 simulation platform using NetworkX and NumPy to execute block-diagram data pipelines via a Hybrid Compiled Architecture. Executed mathematical validation of a Python-based Sorting Tool against legacy Fortran solvers.
- Projects: Autonomous AI Research Agent / Briefing-Bot (GitHub Actions cron fetches an allowlist of tech sources, Gemini synthesizes headlines + Fact of the Day with prompt-injection defenses, Gmail SMTP sends a formatted HTML email; github.com/AvniBhardwaj1/Briefing-Bot-Automation); Personalized AI Financial Advisor (fine-tuned quantized Llama-3 GGUF served locally via Ollama, LangChain ReAct agent calling yfinance and CSV tools, Streamlit app; github.com/AvniBhardwaj1/personal-finance-assistant); MapMyNotes (NLP study companion turning PDFs/slides/text into interactive D3.js mind maps with flashcards and quizzes, Streamlit + Gemini; github.com/AvniBhardwaj1/MapMyNotes); Job Hunt Automation "jobhunt" (reads Greenhouse/Lever/Ashby ATS APIs, deterministic prefilter, LLM scoring against resume, drafts application kits, daily email digest; github.com/AvniBhardwaj1/Job_search_automation); Weather MCP Server (Minimal Common Platform wrapper around OpenWeatherMap: normalized JSON, TTL/Redis cache, Jest tests, demo UI; github.com/AvniBhardwaj1/weather-mcp-server); Fake News Detection (TF-IDF + cosine-similarity NLP classifier, 89% accuracy, Streamlit app; github.com/AvniBhardwaj1/MLPROJECT); Pediatric Bone Age Prediction (ensemble of DenseNet201 and SE-ResNet50 for medical diagnostics); IoT Actuator Control (Arduino Uno + ESP8266); Speed Typing Game (vanilla JS WPM/accuracy trainer; github.com/AvniBhardwaj1/speed-typing-game).
- Achievements: National Finalist at Chaitanya leadership event, Atharv Ranbhoomi'24 IIM Indore (Team INNOV8, top 20 of 977); GDSC Lead 2023-24; Techinnovation 6th Rank Winner at IIT Kanpur twice (CCTV analytics platform frontend, top 5 of 25,000 applicants; autonomous environmental monitoring prototype); Organizing Committee at WittyHacks 4.0 NMIMS Indore; Top 10 at Execute Hackathon (AI fashion try-on with TensorFlow + OpenCV); Winner of GDSC Oracle Challenge 2023.
- Skills - Data Engineering & Cloud: AWS, Docker, Kubernetes, Kafka, ClickHouse. AI & ML: PyTorch, LangChain, RAG. Backend: Python, C++, FastAPI.
- Contact: avnibhardwaj01.ab@gmail.com, github.com/avnibhardwaj1, linkedin.com/in/avni-bhardwaj10, leetcode.com/u/AvniBhardwaj10.
If asked something off-topic, deflect with humor and steer back to Avni's work. If asked about her learning process or how she learns, lean into her signature humor and weave in her actual quotes: "Today no knowledge, tomorrow master.", "It works on my machine.", and "Turning caffeine into scalable architecture." Never use markdown formatting - no asterisks, no bullet symbols, no headers - plain conversational text only."""

@api_router.post("/chat")
async def chat_clone(req: ChatRequest):
    user_text = next((m.content for m in reversed(req.messages) if m.role == "user"), "")
    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=f"avni-clone-{req.sessionId}",
        system_message=AVNI_SYSTEM_PROMPT,
    ).with_model("openai", "gpt-5.4-mini")

    async def generate():
        full: list[str] = []
        try:
            await db.chat_messages.insert_one({
                "sessionId": req.sessionId,
                "role": "user",
                "content": user_text,
                "ts": datetime.now(timezone.utc).isoformat(),
            })
            async for event in chat.stream_message(UserMessage(text=user_text)):
                if isinstance(event, TextDelta):
                    full.append(event.content)
                    yield event.content
                elif isinstance(event, StreamDone):
                    break
            if full:
                await db.chat_messages.insert_one({
                    "sessionId": req.sessionId,
                    "role": "assistant",
                    "content": "".join(full),
                    "ts": datetime.now(timezone.utc).isoformat(),
                })
        except Exception:
            logger.exception("chat stream failed")
            yield "My clone brain glitched - email the human original at avnibhardwaj01.ab@gmail.com."

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )

@api_router.get("/chat/history")
async def chat_history(sessionId: str = "default"):
    docs = await db.chat_messages.find(
        {"sessionId": sessionId}, {"_id": 0}
    ).sort("ts", 1).to_list(200)
    return {
        "messages": [
            {"id": str(i), "role": d["role"], "content": d["content"]}
            for i, d in enumerate(docs)
        ]
    }

class AnalyticsEvent(BaseModel):
    sessionId: str
    type: str
    data: dict = {}
    ts: str = ""

@api_router.post("/analytics/event")
async def track_event(ev: AnalyticsEvent):
    await db.analytics_events.insert_one({
        "sessionId": ev.sessionId,
        "type": ev.type,
        "data": ev.data,
        "ts": ev.ts or datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True}

@api_router.get("/analytics/stats")
async def analytics_stats(x_stats_token: str = Header(default="")):
    if x_stats_token != os.environ.get("STATS_TOKEN"):
        raise HTTPException(status_code=401, detail="unauthorized")
    events = await db.analytics_events.find({}, {"_id": 0}).to_list(20000)
    return _aggregate(events)

# --- Email (Emergent managed Resend proxy) ---
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
DIGEST_EMAIL = os.environ["DIGEST_EMAIL"]
SITE_URL = os.environ.get("SITE_URL", "")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.IGNORECASE)

def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)

def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)

class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = {k.lower(): v for k, v in attrs}.get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []

def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")

async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail="Failed to send email")
    except httpx.HTTPError as e:
        logger.error(f"Email send error: {e!s}")
        raise HTTPException(status_code=500, detail="Failed to send email") from e

# --- Analytics aggregation ---
def _aggregate(events: list) -> dict:
    visitors = len({e["sessionId"] for e in events if e["type"] == "page_view"})
    card_clicks: dict = {}
    dwell: dict = {}
    for e in events:
        if e["type"] == "card_click":
            title = e["data"].get("title", e["data"].get("id", "?"))
            card_clicks[title] = card_clicks.get(title, 0) + 1
        elif e["type"] == "section_view":
            dwell.setdefault(e["data"].get("section", "?"), []).append(e["data"].get("dwellMs", 0))
    return {
        "visitors": visitors,
        "pageViews": sum(1 for e in events if e["type"] == "page_view"),
        "resumeDownloads": sum(1 for e in events if e["type"] == "resume_download"),
        "gestureOptins": sum(1 for e in events if e["type"] == "gesture_optin"),
        "chatMessages": sum(1 for e in events if e["type"] == "chat_message"),
        "cardClicks": sorted(card_clicks.items(), key=lambda kv: kv[1], reverse=True),
        "dwellAvgSec": {k: round(sum(v) / len(v) / 1000, 1) for k, v in dwell.items() if v},
        "totalEvents": len(events),
    }

async def send_weekly_digest() -> str | None:
    week_start = datetime.now(timezone.utc).timestamp() - 7 * 86400
    since = datetime.fromtimestamp(week_start, tz=timezone.utc).isoformat()
    events = await db.analytics_events.find({"ts": {"$gte": since}}, {"_id": 0}).to_list(20000)
    s = _aggregate(events)

    def cell(label: str, value: int) -> str:
        return (f'<td style="padding:14px;border:1px solid #e2e8f0;border-radius:12px;text-align:center">'
                f'<div style="font-size:26px;font-weight:bold;color:#0891b2">{value}</div>'
                f'<div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px">{escape(label)}</div></td>')

    top_rows = "".join(
        f'<tr><td style="padding:8px 4px;font-size:14px;color:#334155">{escape(t)}</td>'
        f'<td style="padding:8px 4px;font-size:14px;font-weight:bold;color:#0891b2;text-align:right">{c} clicks</td></tr>'
        for t, c in s["cardClicks"][:5]
    ) or '<tr><td style="padding:8px 4px;font-size:14px;color:#94a3b8">No card clicks this week.</td></tr>'

    dwell_rows = "".join(
        f'<tr><td style="padding:6px 4px;font-size:13px;color:#334155">#{escape(k)}</td>'
        f'<td style="padding:6px 4px;font-size:13px;color:#0891b2;text-align:right">{v}s avg</td></tr>'
        for k, v in s["dwellAvgSec"].items()
    ) or '<tr><td style="padding:6px 4px;font-size:13px;color:#94a3b8">No section data yet.</td></tr>'

    subject = f"{s['visitors']} visitors this week - your portfolio digest"
    html = (
        '<table role="presentation" width="100%" style="background:#f6f4ef;padding:32px 0"><tr><td align="center">'
        '<table role="presentation" width="560" style="background:#ffffff;border-radius:16px;padding:32px;font-family:Arial,sans-serif">'
        '<tr><td><p style="font-size:12px;letter-spacing:2px;color:#0891b2;text-transform:uppercase;margin:0">Weekly digest</p>'
        '<h1 style="font-size:28px;color:#111827;margin:8px 0 4px">Portfolio week in review.</h1>'
        '<p style="font-size:14px;color:#64748b;margin:0 0 20px">Today no knowledge, tomorrow master. Here is how the site did.</p>'
        '<table role="presentation" width="100%" style="border-collapse:separate;border-spacing:6px"><tr>'
        + cell("Visitors", s["visitors"]) + cell("Page views", s["pageViews"]) + cell("Resume downloads", s["resumeDownloads"])
        + '</tr><tr>'
        + cell("Gesture opt-ins", s["gestureOptins"]) + cell("Clone chats", s["chatMessages"]) + cell("Total events", s["totalEvents"])
        + '</tr></table>'
        '<h2 style="font-size:16px;color:#111827;margin:24px 0 8px">Most clicked projects</h2>'
        f'<table role="presentation" width="100%">{top_rows}</table>'
        '<h2 style="font-size:16px;color:#111827;margin:24px 0 8px">Time per section</h2>'
        f'<table role="presentation" width="100%">{dwell_rows}</table>'
        f'<p style="margin:28px 0 0"><a href="{escape(SITE_URL)}/stats" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:13px;font-weight:bold">Open the live stats dashboard</a></p>'
        f'<p style="font-size:12px;color:#94a3b8;margin:24px 0 0">Sent by {escape(EMAIL_FROM_NAME)} every Monday morning. We never ask for your password or card details by email.</p>'
        '</td></tr></table></td></tr></table>'
    )
    return await send_email(to=DIGEST_EMAIL, subject=subject, html=html)

async def _weekly_digest_loop():
    while True:
        try:
            now = datetime.now(ZoneInfo("Asia/Kolkata"))
            if now.weekday() == 0 and now.hour >= 9:
                week = now.strftime("%G-W%V")
                marker = await db.settings.find_one({"key": "weekly_digest"})
                if not marker or marker.get("week") != week:
                    email_id = await send_weekly_digest()
                    if email_id:
                        await db.settings.update_one(
                            {"key": "weekly_digest"}, {"$set": {"week": week}}, upsert=True
                        )
                        logger.info(f"Weekly digest sent: {email_id}")
        except Exception:
            logger.exception("weekly digest loop failed")
        await asyncio.sleep(3600)

@api_router.post("/analytics/weekly-email")
async def trigger_weekly_email(x_stats_token: str = Header(default="")):
    if x_stats_token != os.environ.get("STATS_TOKEN"):
        raise HTTPException(status_code=401, detail="unauthorized")
    email_id = await send_weekly_digest()
    return {"status": "sent", "email_id": email_id}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(_weekly_digest_loop())

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()