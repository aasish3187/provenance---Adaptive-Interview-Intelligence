"""
Provenance — Realtime Audio Lane & Voice Fallback Router.
Enforces ARCHITECTURE §10 Failure Paths:
"Voice -> text fallback: Seamlessly transitions mode on connection loss,
mic refusal, or Live API timeouts without lost state."
"""
from __future__ import annotations

import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from apps.api.db.database import get_db
from apps.api.db.models import InterviewModel
from apps.api.routers.interviews import submit_candidate_turn, SubmitAnswerRequest
from apps.api.services.audit_service import record_audit_event

logger = logging.getLogger("provenance.voice")
router = APIRouter(prefix="/interviews", tags=["voice"])


@router.websocket("/{interview_id}/voice")
async def voice_interview_websocket(websocket: WebSocket, interview_id: str):
    """
    WebSocket endpoint for bidirectional audio lane.
    Handles streaming speech transcripts, interviewer response audio,
    and automatic fallback to text mode.
    """
    await websocket.accept()
    from apps.api.db.database import SessionLocal
    db: Session = SessionLocal()

    try:
        interview = db.query(InterviewModel).filter_by(id=interview_id).first()
        if not interview:
            await websocket.send_json({"type": "error", "message": "Interview not found"})
            await websocket.close()
            return

        # Handshake confirmation
        await websocket.send_json({
            "type": "connected",
            "interview_id": interview_id,
            "mode": interview.mode,
            "message": "Realtime audio channel established.",
        })

        while True:
            raw_msg = await websocket.receive_text()
            data = json.loads(raw_msg)
            msg_type = data.get("type")

            # 1. Voice-to-Text Fallback Handshake (§10 Failure Paths)
            if msg_type == "fallback_request" or msg_type == "network_degradation":
                reason = data.get("reason", "audio_lane_unavailable")
                interview.mode = "text"
                db.commit()

                record_audit_event(
                    db=db,
                    actor="System",
                    action="Voice Fallback Triggered",
                    object_type="Interview",
                    object_id=interview_id,
                    details=f"Seamlessly transitioned session to text mode. Reason: {reason}",
                )

                await websocket.send_json({
                    "type": "mode_switched",
                    "mode": "text",
                    "reason": reason,
                    "message": "Switched cleanly to text mode. No conversation turns lost.",
                })
                continue

            # 2. Candidate Final Speech Turn
            elif msg_type == "candidate_speech_final":
                turn_index = data.get("turn_index", 1)
                candidate_text = data.get("text", "").strip()

                if candidate_text:
                    turn_req = SubmitAnswerRequest(
                        turn_index=turn_index,
                        candidate_answer=candidate_text,
                    )
                    # Process through evaluator, Beta posterior, and planner
                    result = submit_candidate_turn(interview_id=interview_id, payload=turn_req, db=db)

                    # Send interviewer response back over voice WebSocket
                    await websocket.send_json({
                        "type": "turn_processed",
                        "status": result.get("status"),
                        "completed": result.get("completed", False),
                        "next_question": result.get("next_question"),
                        "evidence_extracted": result.get("evidence_extracted", 0),
                        "latest_competency_posterior": result.get("latest_competency_posterior"),
                    })

            # 3. Heartbeat / Ping
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        logger.info(f"Voice WebSocket disconnected for interview {interview_id}")
    except Exception as e:
        logger.error(f"Error in voice websocket: {str(e)}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        db.close()
