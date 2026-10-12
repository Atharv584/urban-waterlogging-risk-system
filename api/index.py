"""
Vercel serverless entry point for Urban Waterlogging Risk Prediction FastAPI backend.
Uses Mangum as the ASGI adapter to bridge FastAPI ↔ Vercel Lambda-style functions.
"""
import os
import sys

# Ensure backend directory is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import app  # noqa: E402
from mangum import Mangum

# Vercel invokes `handler` as the serverless function entry point
handler = Mangum(app, lifespan="off")
