"""
Tests for Mission 10 & 11:
- Realtime Audio Lane WebSocket
- Seamless Voice-to-Text Fallback (§10 Failure Paths)
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)


def test_voice_websocket_handshake_and_fallback():
    # 1. Create a role and interview
    role_res = client.post("/roles", json={"title": "Voice SRE", "jd_text": "SRE K8s Go"})
    role_id = role_res.json()["id"]

    inv_res = client.post(
        "/interviews",
        json={"role_id": role_id, "candidate_name": "Sam Voice", "mode": "voice"},
    )
    interview_id = inv_res.json()["interview_id"]

    # 2. Consent to interview
    client.post(
        f"/interviews/{interview_id}/consent",
        json={"consent_version": "1.0", "agreed": True, "text_mode_preferred": False},
    )

    # 3. Connect via WebSocket
    with client.websocket_connect(f"/interviews/{interview_id}/voice") as websocket:
        # Expect connected handshake
        handshake = websocket.receive_json()
        assert handshake["type"] == "connected"
        assert handshake["interview_id"] == interview_id

        # 4. Trigger voice-to-text fallback (§10 Failure Paths)
        websocket.send_json({
            "type": "fallback_request",
            "reason": "microphone_permission_denied",
        })

        fallback_resp = websocket.receive_json()
        assert fallback_resp["type"] == "mode_switched"
        assert fallback_resp["mode"] == "text"
        assert "cleanly" in fallback_resp["message"]

    # 5. Verify database interview mode updated to "text"
    int_state = client.get(f"/interviews/{interview_id}").json()
    assert int_state["mode"] == "text"
