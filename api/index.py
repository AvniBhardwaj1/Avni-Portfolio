import sys
from pathlib import Path

# Vercel serverless entry — exposes the FastAPI app from /backend
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from server import app  # noqa: E402,F401
