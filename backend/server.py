from fastapi import FastAPI, APIRouter
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


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

@api_router.get("/status", response_model=List[StatusCheck])
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
    messages: List[ChatMessage]
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
        full: List[str] = []
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()