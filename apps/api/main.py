"""
Provenance — FastAPI Gateway & Orchestration Engine.
Evidence-driven adaptive interview intelligence.
"""
from __future__ import annotations

import sys
from pathlib import Path
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

from packages.schemas.models import HealthCheckResponse, SystemStatus
from apps.api.config import settings, models_config
from apps.api.db.database import Base, engine
from apps.api.routers import roles, interviews, voice, audit, auth

# Create tables if not exist (SQLite local / dev fallback)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Provenance API",
    description="Evidence-driven adaptive interview intelligence platform.",
    version="0.1.0",
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(roles.router)
app.include_router(interviews.router)
app.include_router(voice.router)
app.include_router(audit.router)
app.include_router(auth.router)



@app.get("/")
def root():
    return {
        "service": "Provenance API",
        "tagline": "Every finding has a source.",
        "version": "0.1.0",
        "status": "online",
        "documentation": "/docs",
        "health": "/healthz",
    }


@app.get("/healthz", response_model=HealthCheckResponse)
def health_check() -> HealthCheckResponse:
    """Public health check endpoint required for Cloud Run and monitoring."""
    return HealthCheckResponse(
        status=SystemStatus.OK,
        service="provenance-api",
        version="0.1.0",
        timestamp=datetime.now(timezone.utc),
        environment=settings.environment,
    )


@app.get("/api/config/models")
def get_models_info():
    """Inspect configured model IDs without exposing API keys or secrets."""
    return {
        "version": models_config.get("version", "1.0"),
        "conversation_model": models_config.get("conversation", {}).get("model_id"),
        "evaluator_model": models_config.get("evaluator", {}).get("model_id"),
        "planner_model": models_config.get("planner", {}).get("model_id"),
        "guard_model": models_config.get("guard", {}).get("model_id"),
        "dossier_model": models_config.get("dossier", {}).get("model_id"),
    }
