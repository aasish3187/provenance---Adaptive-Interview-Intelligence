import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)


def test_full_role_and_interview_turn_loop():
    # 1. Create a Role
    role_resp = client.post(
        "/roles",
        json={
            "title": "Staff Platform Engineer",
            "department": "Infrastructure",
            "jd_text": "Must have expertise in Kubernetes, Go, Distributed Storage, and Zero Trust.",
        },
    )
    assert role_resp.status_code == 200
    role_data = role_resp.json()
    role_id = role_data["id"]
    assert role_data["title"] == "Staff Platform Engineer"
    assert len(role_data["blueprint"]["competencies"]) >= 3

    # 2. Recruiter Edits Blueprint (PATCH)
    blueprint = role_data["blueprint"]
    competencies = blueprint["competencies"]
    competencies[0]["must_have"] = True

    patch_resp = client.patch(
        f"/roles/{role_id}/blueprint",
        json={
            "competencies": competencies,
            "target_duration_minutes": 25,
        },
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["recruiter_edited"] is True

    # 3. Create Interview Invite
    inv_resp = client.post(
        "/interviews",
        json={
            "role_id": role_id,
            "candidate_name": "Taylor Reed",
            "candidate_email": "taylor@example.com",
            "mode": "text",
        },
    )
    assert inv_resp.status_code == 200
    inv_data = inv_resp.json()
    interview_id = inv_data["interview_id"]
    assert "invite_token" in inv_data
    assert inv_data["candidate_name"] == "Taylor Reed"

    # 4. Candidate Opens Invite & Agrees to Consent
    consent_resp = client.post(
        f"/interviews/{interview_id}/consent",
        json={
            "consent_version": "1.0",
            "agreed": True,
            "text_mode_preferred": True,
        },
    )
    assert consent_resp.status_code == 200
    assert consent_resp.json()["status"] == "consented"
    assert consent_resp.json()["interview_state"] == "IN_PROGRESS"

    # 5. Fetch Interview State — First question is active
    state_resp = client.get(f"/interviews/{interview_id}")
    assert state_resp.status_code == 200
    state_data = state_resp.json()
    assert state_data["state"] == "IN_PROGRESS"
    assert state_data["current_question"] is not None

    # 6. Candidate Submits First Turn Answer (With Verified Evidence)
    turn1_resp = client.post(
        f"/interviews/{interview_id}/turns",
        json={
            "turn_index": 1,
            "candidate_answer": "When traffic spiked, we configured KEDA with Prometheus custom metrics. We also set pod disruption budgets to preserve capacity during cluster autoscaling.",
        },
    )
    assert turn1_resp.status_code == 200
    turn1_data = turn1_resp.json()
    assert turn1_data["completed"] is False
    assert turn1_data["turn_index"] == 2
    assert "next_question" in turn1_data
    assert "why_card" in turn1_data["next_question"]
    assert turn1_data["evidence_extracted"] >= 1
    assert "latest_competency_posterior" in turn1_data
    assert turn1_data["latest_competency_posterior"]["estimate"] > 0.5

    # 7. Check Transcript Persistence
    transcript_resp = client.get(f"/interviews/{interview_id}/transcript")
    assert transcript_resp.status_code == 200
    transcript = transcript_resp.json()
    assert len(transcript) == 3
    assert transcript[0]["speaker"] == "interviewer"
    assert transcript[1]["speaker"] == "candidate"
    assert "KEDA" in transcript[1]["text"]

    # 8. Record Client-Side Browser Telemetry Event (Mission 9)
    intg_resp = client.post(
        f"/interviews/{interview_id}/integrity-events",
        json={
            "event_type": "tab_hidden",
            "family": "focus",
            "severity_base": 1,
            "detector_confidence": 1.0,
            "context_multiplier": 1.0,
            "t_ms": 15000,
            "metadata": {"reason": "window_blur"},
        },
    )
    assert intg_resp.status_code == 200
    assert intg_resp.json()["status"] == "recorded"

    # 9. Verify Integrity Status & Benign Explanations (Rule 2)
    intg_status_resp = client.get(f"/interviews/{interview_id}/integrity-status")
    assert intg_status_resp.status_code == 200
    intg_status = intg_status_resp.json()
    assert intg_status["review_priority"] in ["None", "Low"]
    assert len(intg_status["benign_explanations"]) >= 1
    assert "documentation" in intg_status["benign_explanations"][0].lower()

    # 10. Check Live Status Endpoint (Mission 8)
    live_resp = client.get(f"/interviews/{interview_id}/live-status")
    assert live_resp.status_code == 200
    live_data = live_resp.json()
    assert live_data["interview_id"] == interview_id
    assert live_data["state"] == "IN_PROGRESS"
    assert len(live_data["competency_posteriors"]) >= 1

    # 11. Complete Remaining Turns to Reach Completion (Turn 2 & Turn 3)
    turn2_resp = client.post(
        f"/interviews/{interview_id}/turns",
        json={
            "turn_index": 2,
            "candidate_answer": "In Go, we prevent deadlocks using sync.Pool for buffer reuse and buffered channels with context timeouts to prevent goroutine leaks.",
        },
    )
    assert turn2_resp.status_code == 200

    turn3_resp = client.post(
        f"/interviews/{interview_id}/turns",
        json={
            "turn_index": 3,
            "candidate_answer": "For inter-service zero-trust security, we configured SPIFFE workload identities with mutual TLS in our service mesh.",
        },
    )
    assert turn3_resp.status_code == 200
    assert turn3_resp.json()["completed"] is True

    # 12. Synthesize & Fetch Dossier (Mission 8)
    dossier_resp = client.get(f"/interviews/{interview_id}/dossier")
    assert dossier_resp.status_code == 200
    dossier = dossier_resp.json()
    assert dossier["interview_id"] == interview_id
    assert "reality_matrix" in dossier
    assert "quadrant_1_verified_strengths" in dossier["reality_matrix"]
    assert "quadrant_2_untested_claims" in dossier["reality_matrix"]
    assert "quadrant_3_hidden_gems" in dossier["reality_matrix"]
    assert "quadrant_4_verified_gaps" in dossier["reality_matrix"]
    assert "citation_validation" in dossier
    assert dossier["citation_validation"]["verified_citations_count"] >= 1
    assert "integrity_review" in dossier
    assert dossier["integrity_review"]["review_priority"] in ["None", "Low", "Moderate"]
