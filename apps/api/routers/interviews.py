"""
Provenance — Candidate Interviews Router.
Manages candidate consent, turn loops, and transcript persistence.
"""
from __future__ import annotations

import json
import secrets
import uuid
from datetime import datetime, timedelta, timezone
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
import pypdf
import docx
from pydantic import BaseModel
from sqlalchemy.orm import Session
from apps.api.db.database import get_db
from apps.api.db.models import (
    CandidateModel,
    CompetencyStateModel,
    EvidenceModel,
    IntegrityEventModel,
    InterviewModel,
    QuestionModel,
    RoleModel,
    TurnModel,
)
from apps.api.services.audit_service import record_audit_event
from apps.api.services.beta_engine import initial_beta_state, update_beta_posterior
from apps.api.services.blueprint_service import generate_blueprint_from_jd, DEFAULT_BACKEND_COMPETENCIES
from apps.api.services.dossier_service import synthesize_interview_dossier
from apps.api.services.evaluator import evaluate_turn_answer
from apps.api.services.guard import sanitize_and_guard
from apps.api.services.integrity_service import aggregate_integrity_events
from apps.api.services.planner import plan_next_question, synthesize_adaptive_question_text
from packages.schemas.models import (
    Competency,
    CompetencyState,
    IntegrityEvent,
    IntegrityFamily,
    InterviewState,
    QuestionMode,
    WhyCard,
)

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post("/parse-resume", response_model=dict)
async def parse_resume_file(file: UploadFile = File(...)):
    """
    Accepts candidate resume file (PDF, DOCX, TXT, MD) and extracts clean text.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")

    filename = file.filename or "resume.txt"
    filename_lower = filename.lower()
    content = await file.read()

    if len(content) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum 15MB limit")

    extracted_text = ""
    try:
        if filename_lower.endswith(".pdf"):
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages_text = []
            for page in reader.pages:
                t = page.extract_text()
                if t:
                    pages_text.append(t)
            extracted_text = "\n\n".join(pages_text).strip()
        elif filename_lower.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            paragraphs = [p.text for p in doc.paragraphs if p.text]
            extracted_text = "\n".join(paragraphs).strip()
        else:
            try:
                extracted_text = content.decode("utf-8").strip()
            except UnicodeDecodeError:
                extracted_text = content.decode("latin1", errors="ignore").strip()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse document: {str(e)}")

    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail="Document appears empty or contains non-extractable text. Please paste text directly.",
        )

    words = extracted_text.split()
    return {
        "filename": filename,
        "text": extracted_text,
        "char_count": len(extracted_text),
        "word_count": len(words),
    }


class CreateInterviewRequest(BaseModel):
    role_id: str
    candidate_name: str
    candidate_email: Optional[str] = None
    resume_text: Optional[str] = None
    mode: Optional[str] = "text"
    org_id: Optional[str] = "default-org"


class StartCandidateInterviewRequest(BaseModel):
    candidate_name: str
    candidate_email: Optional[str] = "candidate@example.com"
    role_title: str
    jd_text: Optional[str] = None
    resume_text: Optional[str] = None
    mode: Optional[str] = "camera"


class CandidateConsentRequest(BaseModel):
    consent_version: str = "1.0"
    agreed: bool
    text_mode_preferred: bool = True
    presence_sensor_agreed: bool = False


class SubmitAnswerRequest(BaseModel):
    turn_index: int
    candidate_answer: str


INITIAL_QUESTIONS = [
    {
        "competency_id": "COMP-K8S",
        "competency_name": "Kubernetes & Container Orchestration",
        "question": "How do you configure and tune pod autoscaling when traffic spikes are driven by asynchronous message queue depth rather than raw CPU usage?",
        "mode": QuestionMode.PROBE,
        "bloom": 3,
        "reason": "Initial baseline check on claimed Kubernetes production experience.",
        "criteria": [
            "Identifies custom metrics exporter (KEDA / Prometheus)",
            "Considers pod disruption budgets and scale-down thresholds",
            "Addresses cold-start and provisioning latency",
        ],
    },
    {
        "competency_id": "COMP-GO",
        "competency_name": "Go Concurrency & Memory Management",
        "question": "Explain your strategy for managing concurrency control and avoiding channel deadlocks in high-throughput Go microservices.",
        "mode": QuestionMode.DRILL,
        "bloom": 4,
        "reason": "Drilling into memory allocation mechanics following strong baseline answer.",
        "criteria": [
            "Uses sync.Pool to minimize GC allocator overhead",
            "Implements non-blocking select with timeout or context cancellation",
            "Identifies goroutine leak detection tools",
        ],
    },
    {
        "competency_id": "COMP-SEC",
        "competency_name": "Zero-Trust Architecture & API Security",
        "question": "How did you secure inter-service communication across your private multi-tenant clusters?",
        "mode": QuestionMode.VERIFY,
        "bloom": 3,
        "reason": "Testing must-have zero-trust competency absent from resume.",
        "criteria": [
            "Understands workload identity (SPIFFE/SPIRE)",
            "Applies mutual TLS (mTLS) for pod authentication",
            "Avoids perimeter-only security assumptions",
        ],
    },
]


def ensure_demo_interview_exists(interview_id: str, db: Session):
    """Guarantees default sessions like INT-901, INT-82A7F2, INT-49B810 exist in database with full valid relations."""
    if interview_id not in ["INT-901", "INT-82A7F2", "INT-49B810"]:
        return

    existing = db.query(InterviewModel).filter_by(id=interview_id).first()
    if existing:
        return

    demos = {
        "INT-901": {
            "role_id": "ROLE-901",
            "role_title": "Senior Backend Engineer",
            "dept": "Core Infrastructure",
            "cand_id": "CAND-901",
            "cand_name": "Alex Morgan",
            "cand_email": "alex.morgan@example.com",
            "resume": "Experienced backend engineer in Go microservices, container orchestration, and database optimization.",
            "jd": "Senior backend engineer specializing in Go concurrency, Kubernetes autoscaling, and zero-trust security.",
            "evidence_quote": "When traffic spiked to 10x, our HPA scaled pods based on custom p99 message lag metrics from Prometheus rather than default CPU thresholds. We paired that with KEDA and pod disruption budgets so node scale-ups didn't drop running batch tasks.",
            "evidence_claim": "Configured custom metrics autoscaling and Pod Disruption Budgets under high-throughput traffic bursts.",
            "comp_id": "COMP-K8S",
            "comp_name": "Kubernetes & Container Orchestration",
        },
        "INT-82A7F2": {
            "role_id": "ROLE-82A",
            "role_title": "Cloud Platform Architect",
            "dept": "Platform Engineering",
            "cand_id": "CAND-82A",
            "cand_name": "Taylor Reed",
            "cand_email": "taylor.reed@example.com",
            "resume": "Cloud Architect with 8+ years leading AWS/GCP multi-cloud topology, Terraform IaC, and disaster recovery.",
            "jd": "Cloud Platform Architect responsible for multi-cloud VPCs, Terraform drift management, and multi-region failover.",
            "evidence_quote": "We structured our AWS and GCP peering across Transit Gateways with automated BGP ASN route advertisements and Route53 latency-based routing policies.",
            "evidence_claim": "Designed zero-trust transit gateway routing and automated BGP peering across multi-cloud environments.",
            "comp_id": "COMP-VPC",
            "comp_name": "Multi-Cloud VPC & Transit Gateway Routing",
        },
        "INT-49B810": {
            "role_id": "ROLE-49B",
            "role_title": "AI / ML Infrastructure Engineer",
            "dept": "Foundation AI & Serving",
            "cand_id": "CAND-49B",
            "cand_name": "Morgan Vance",
            "cand_email": "morgan.vance@example.com",
            "resume": "AI Infrastructure specialist with experience in GPU cluster orchestration, vLLM inference serving, and DeepSpeed sharding.",
            "jd": "AI/ML Infrastructure Engineer building low-latency inference pipelines, vLLM continuous batching, and vector database indexing.",
            "evidence_quote": "By switching from standard HuggingFace TGI to vLLM with PagedAttention and continuous batching, we reduced GPU memory fragmentation and achieved 3.8x higher throughput on our A100 cluster.",
            "evidence_claim": "Optimized GPU memory allocation and batching throughput using vLLM PagedAttention on A100 clusters.",
            "comp_id": "COMP-GPU",
            "comp_name": "GPU Cluster Scheduling & vLLM Serving",
        },
    }

    config = demos[interview_id]
    role = db.query(RoleModel).filter_by(id=config["role_id"]).first()
    if not role:
        bp = generate_blueprint_from_jd(
            role_id=config["role_id"],
            role_title=config["role_title"],
            jd_text=config["jd"],
            resume_text=config["resume"],
        )
        role = RoleModel(
            id=config["role_id"],
            org_id="default-org",
            title=config["role_title"],
            department=config["dept"],
            jd_text=config["jd"],
            blueprint_json=bp.model_dump_json(),
        )
        db.add(role)
        db.commit()

    candidate = db.query(CandidateModel).filter_by(id=config["cand_id"]).first()
    if not candidate:
        candidate = CandidateModel(
            id=config["cand_id"],
            org_id="default-org",
            name=config["cand_name"],
            email=config["cand_email"],
            resume_text=config["resume"],
            consent_at=datetime.now(timezone.utc),
            consent_version="1.0",
        )
        db.add(candidate)
        db.commit()

    interview = InterviewModel(
        id=interview_id,
        org_id="default-org",
        role_id=config["role_id"],
        candidate_id=config["cand_id"],
        state=InterviewState.COMPLETED.value,
        mode="camera",
        invite_token=f"token-{interview_id.lower()}",
        started_at=datetime.now(timezone.utc) - timedelta(minutes=45),
        ended_at=datetime.now(timezone.utc),
    )
    db.add(interview)
    db.commit()

    # Load role competencies from blueprint
    role_competencies = []
    if role and role.blueprint_json:
        try:
            b_data = json.loads(role.blueprint_json)
            role_competencies = b_data.get("competencies", [])
        except Exception:
            pass

    primary_comp_id = role_competencies[0]["id"] if role_competencies else "COMP-001"
    primary_comp_name = role_competencies[0]["name"] if role_competencies else config["comp_name"]

    # Seed competency states
    for idx, c in enumerate(role_competencies):
        cid = c.get("id", f"COMP-{idx+1:03d}")
        is_primary = (idx == 0)
        cs = CompetencyStateModel(
            id=f"CS-{interview_id}-{cid}",
            interview_id=interview_id,
            competency_id=cid,
            alpha=4.5 if is_primary else 2.5,
            beta=1.0 if is_primary else 1.5,
            estimate=0.82 if is_primary else 0.62,
            uncertainty=0.12 if is_primary else 0.20,
            bloom_level=c.get("target_bloom_level", 4),
            evidence_count=1 if is_primary else 0,
        )
        db.add(cs)

    # Seed question
    q1 = QuestionModel(
        id=f"Q-{interview_id}-01",
        interview_id=interview_id,
        competency_id=primary_comp_id,
        turn_index=1,
        text=f"Could you describe your architectural approach, operational tradeoffs, and concrete production experience with {primary_comp_name}?",
        bloom_level=4,
        mode="probe",
        why_json=json.dumps({
            "target_competency_id": primary_comp_id,
            "target_competency_name": primary_comp_name,
            "reason": f"Operational verification of {primary_comp_name}",
            "question_type": "probe",
            "bloom_level": 4,
            "evaluation_criteria": ["Production deployment evidence", "Latency/throughput tradeoffs"],
        }),
    )
    db.add(q1)

    turn1 = TurnModel(
        id=f"TURN-{interview_id}-01",
        interview_id=interview_id,
        turn_index=1,
        speaker="candidate",
        text=config["evidence_quote"],
    )
    db.add(turn1)
    db.commit()

    # Seed verified evidence item
    ev1 = EvidenceModel(
        id=f"EVID-{interview_id}-01",
        interview_id=interview_id,
        turn_id=turn1.id,
        competency_id=primary_comp_id,
        claim=config["evidence_claim"],
        quote=config["evidence_quote"],
        start_char=0,
        end_char=len(config["evidence_quote"]),
        score=0.85,
        confidence=0.90,
        rubric_met_json=json.dumps(["Production architecture validation", "Operational metrics verified"]),
        rubric_missed_json=json.dumps([]),
        verified=True,
        prompt_version="1.0",
    )
    db.add(ev1)
    db.commit()


@router.get("", response_model=List[dict])
def list_interviews(db: Session = Depends(get_db)):
    """Lists all active and completed interview sessions for session selector."""
    for demo_id in ["INT-901", "INT-82A7F2", "INT-49B810"]:
        ensure_demo_interview_exists(demo_id, db)

    interviews = db.query(InterviewModel).order_by(InterviewModel.started_at.desc()).limit(20).all()
    results = []
    for it in interviews:
        cand = db.query(CandidateModel).filter_by(id=it.candidate_id).first()
        role = db.query(RoleModel).filter_by(id=it.role_id).first()
        turns_count = db.query(TurnModel).filter_by(interview_id=it.id).count()
        ev_count = db.query(EvidenceModel).filter_by(interview_id=it.id, verified=True).count()
        results.append({
            "id": it.id,
            "candidate_name": cand.name if cand else "Candidate",
            "candidate_email": cand.email if cand else "",
            "role_title": role.title if role else "Engineering Role",
            "department": role.department if role else "Core Engineering",
            "state": it.state,
            "mode": it.mode,
            "started_at": it.started_at.isoformat() if it.started_at else None,
            "turns_count": turns_count,
            "verified_evidence_count": ev_count,
        })
    return results


@router.post("/start", response_model=dict)
def start_candidate_mock_interview(
    payload: StartCandidateInterviewRequest,
    db: Session = Depends(get_db),
):
    """
    Candidate Launchpad: Ingests resume + target JD, generates customized
    role blueprint, creates live interview session, and synthesizes Question 1.
    """
    role_id = f"ROLE-{uuid.uuid4().hex[:6].upper()}"
    candidate_id = f"CAND-{uuid.uuid4().hex[:6].upper()}"
    interview_id = f"INT-{uuid.uuid4().hex[:6].upper()}"

    jd = payload.jd_text or f"Role: {payload.role_title}. High-impact engineering, scalable architecture, technical depth, and reliable execution."
    blueprint = generate_blueprint_from_jd(
        role_id=role_id,
        role_title=payload.role_title,
        jd_text=jd,
        resume_text=payload.resume_text,
    )

    role = RoleModel(
        id=role_id,
        org_id="default-org",
        title=payload.role_title,
        department="Candidate Practice Studio",
        jd_text=jd,
        blueprint_json=blueprint.model_dump_json(),
    )
    db.add(role)

    candidate = CandidateModel(
        id=candidate_id,
        org_id="default-org",
        name=payload.candidate_name,
        email=payload.candidate_email,
        resume_text=payload.resume_text,
        consent_at=datetime.now(timezone.utc),
        consent_version="1.0",
    )
    db.add(candidate)

    interview = InterviewModel(
        id=interview_id,
        org_id="default-org",
        role_id=role_id,
        candidate_id=candidate_id,
        state=InterviewState.IN_PROGRESS.value,
        mode=payload.mode or "camera",
        invite_token=secrets.token_urlsafe(32),
        started_at=datetime.now(timezone.utc),
    )
    db.add(interview)
    db.commit()

    # Initialize competency states
    target_comp = blueprint.competencies[0]
    for c in blueprint.competencies:
        cs = CompetencyStateModel(
            id=f"CS-{uuid.uuid4().hex[:6].upper()}",
            interview_id=interview_id,
            competency_id=c.id,
            alpha=1.0,
            beta=1.0,
            estimate=0.5,
            uncertainty=0.2887,
            bloom_level=c.target_bloom_level,
            evidence_count=0,
        )
        db.add(cs)

    # Synthesize tailored Question #1 using Gemini
    q1_text = synthesize_adaptive_question_text(
        competency=target_comp,
        mode=QuestionMode.PROBE,
        bloom_level=target_comp.target_bloom_level,
        prior_answer=None,
    )

    q1 = QuestionModel(
        id=f"Q-{uuid.uuid4().hex[:6].upper()}",
        interview_id=interview_id,
        competency_id=target_comp.id,
        turn_index=1,
        text=q1_text,
        bloom_level=target_comp.target_bloom_level,
        mode="probe",
        why_json=json.dumps({
            "target_competency_id": target_comp.id,
            "target_competency_name": target_comp.name,
            "reason": f"Initial baseline check on {target_comp.name} for {payload.role_title}.",
            "question_type": "probe",
            "bloom_level": target_comp.target_bloom_level,
            "evaluation_criteria": target_comp.rubric_criteria or ["Practical architecture mastery"],
        }),
    )
    db.add(q1)

    turn1 = TurnModel(
        id=f"TURN-{uuid.uuid4().hex[:6].upper()}",
        interview_id=interview_id,
        turn_index=1,
        speaker="interviewer",
        text=q1_text,
    )
    db.add(turn1)
    db.commit()

    record_audit_event(
        db=db,
        actor="Candidate",
        action="Mock Interview Session Initialized",
        object_type="Interview",
        object_id=interview_id,
        details=f"Candidate {payload.candidate_name} started practice for role {payload.role_title}.",
    )

    return {
        "interview_id": interview_id,
        "role_id": role_id,
        "candidate_id": candidate_id,
        "role_title": payload.role_title,
        "candidate_name": payload.candidate_name,
        "turn_index": 1,
        "first_question": {
            "id": q1.id,
            "text": q1.text,
            "competency_id": target_comp.id,
            "competency_name": target_comp.name,
            "bloom_level": q1.bloom_level,
            "turn_index": 1,
        },
        "interview_url": f"/interview/{interview_id}",
    }


@router.post("", response_model=dict)
def create_interview(payload: CreateInterviewRequest, db: Session = Depends(get_db)):
    role = db.query(RoleModel).filter_by(id=payload.role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    candidate_id = f"CAND-{uuid.uuid4().hex[:6].upper()}"
    candidate = CandidateModel(
        id=candidate_id,
        org_id=payload.org_id,
        name=payload.candidate_name,
        email=payload.candidate_email,
        resume_text=payload.resume_text,
    )
    db.add(candidate)

    interview_id = f"INT-{uuid.uuid4().hex[:6].upper()}"
    invite_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    interview = InterviewModel(
        id=interview_id,
        org_id=payload.org_id,
        role_id=payload.role_id,
        candidate_id=candidate_id,
        state=InterviewState.CONSENT.value,
        mode=payload.mode or "text",
        invite_token=invite_token,
        token_expires_at=expires_at,
    )
    db.add(interview)
    db.commit()

    record_audit_event(
        db=db,
        actor="Recruiter",
        action="Interview Invitation Created",
        object_type="Interview",
        object_id=interview_id,
        details=f"Issued invite for {payload.candidate_name} to role {role.title}.",
    )

    return {
        "interview_id": interview_id,
        "invite_token": invite_token,
        "invite_url": f"/interview/{interview_id}/consent",
        "expires_at": expires_at.isoformat(),
        "candidate_id": candidate_id,
        "candidate_name": payload.candidate_name,
        "role_title": role.title,
    }


@router.get("/{interview_id}", response_model=dict)
def get_interview(interview_id: str, db: Session = Depends(get_db)):
    ensure_demo_interview_exists(interview_id, db)
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    candidate = db.query(CandidateModel).filter_by(id=interview.candidate_id).first()
    role = db.query(RoleModel).filter_by(id=interview.role_id).first()

    # Get latest active question if in progress
    current_question = (
        db.query(QuestionModel)
        .filter_by(interview_id=interview_id)
        .order_by(QuestionModel.turn_index.desc())
        .first()
    )

    turns_count = db.query(TurnModel).filter_by(interview_id=interview_id, speaker="candidate").count()

    return {
        "id": interview.id,
        "state": interview.state,
        "mode": interview.mode,
        "role_title": role.title if role else "Unknown Role",
        "candidate_name": candidate.name if candidate else "Candidate",
        "current_turn": turns_count + 1,
        "current_question": {
            "id": current_question.id,
            "text": current_question.text,
            "competency_id": current_question.competency_id,
            "turn_index": current_question.turn_index,
        }
        if current_question
        else None,
        "consent_recorded": bool(candidate and candidate.consent_at),
    }


@router.post("/{interview_id}/consent", response_model=dict)
def record_candidate_consent(
    interview_id: str,
    payload: CandidateConsentRequest,
    db: Session = Depends(get_db),
):
    ensure_demo_interview_exists(interview_id, db)
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if not payload.agreed:
        interview.state = "DECLINED"
        db.commit()
        return {"status": "declined", "message": "Interview declined by candidate."}

    candidate = db.query(CandidateModel).filter_by(id=interview.candidate_id).first()
    if candidate:
        candidate.consent_at = datetime.now(timezone.utc)
        candidate.consent_version = payload.consent_version

    interview.state = InterviewState.IN_PROGRESS.value
    interview.started_at = datetime.now(timezone.utc)
    interview.mode = "text" if payload.text_mode_preferred else "voice"

    # Seed the first question if no question exists yet
    existing_q = db.query(QuestionModel).filter_by(interview_id=interview_id).first()
    if not existing_q:
        q_spec = INITIAL_QUESTIONS[0]
        why_card = WhyCard(
            target_competency_id=q_spec["competency_id"],
            target_competency_name=q_spec["competency_name"],
            reason=q_spec["reason"],
            question_type=q_spec["mode"],
            bloom_level=q_spec["bloom"],
            evaluation_criteria=q_spec["criteria"],
        )

        first_q = QuestionModel(
            id=f"Q-{uuid.uuid4().hex[:6].upper()}",
            interview_id=interview_id,
            competency_id=q_spec["competency_id"],
            turn_index=1,
            text=q_spec["question"],
            bloom_level=q_spec["bloom"],
            mode=q_spec["mode"].value,
            why_json=why_card.model_dump_json(),
        )
        db.add(first_q)

        # Log interviewer question turn
        q_turn = TurnModel(
            id=f"TURN-{uuid.uuid4().hex[:6].upper()}",
            interview_id=interview_id,
            turn_index=1,
            speaker="interviewer",
            text=q_spec["question"],
        )
        db.add(q_turn)

    db.commit()

    record_audit_event(
        db=db,
        actor=f"Candidate ({candidate.name if candidate else 'Unknown'})",
        action="Consent Recorded",
        object_type="ConsentRecord",
        object_id=interview_id,
        details=f"Candidate agreed to AI disclosure version {payload.consent_version}. Mode: {interview.mode}.",
    )

    return {
        "status": "consented",
        "interview_state": interview.state,
        "mode": interview.mode,
    }


@router.post("/{interview_id}/turns", response_model=dict)
def submit_candidate_turn(
    interview_id: str,
    payload: SubmitAnswerRequest,
    db: Session = Depends(get_db),
):
    ensure_demo_interview_exists(interview_id, db)
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview.state != InterviewState.IN_PROGRESS.value:
        raise HTTPException(status_code=400, detail="Interview is not currently in progress")

    # 1. Guard containment & prompt injection check
    guard_res = sanitize_and_guard(payload.candidate_answer)
    if guard_res.injection_detected:
        record_audit_event(
            db=db,
            actor="Guard Agent",
            action="Prompt Injection Detected",
            object_type="CandidateAnswer",
            object_id=interview_id,
            details=f"Neutralized injection patterns: {', '.join(guard_res.flagged_patterns)} (type: {guard_res.injection_type})",
        )

    # 2. Persist candidate answer turn to canonical transcript
    cand_turn = TurnModel(
        id=f"TURN-{uuid.uuid4().hex[:6].upper()}",
        interview_id=interview_id,
        turn_index=payload.turn_index,
        speaker="candidate",
        text=guard_res.sanitized_text,
        timestamp=datetime.now(timezone.utc),
    )
    db.add(cand_turn)
    db.commit()

    # 3. Retrieve active question being answered
    current_q = (
        db.query(QuestionModel)
        .filter_by(interview_id=interview_id, turn_index=payload.turn_index)
        .first()
    )
    active_comp_id = current_q.competency_id if current_q else "COMP-GENERAL"
    criteria: List[str] = []
    if current_q and current_q.why_json:
        try:
            why_data = json.loads(current_q.why_json)
            criteria = why_data.get("evaluation_criteria", [])
        except Exception:
            criteria = []

    # 4. Evaluate answer against criteria with strict quote verification
    eval_outcome = evaluate_turn_answer(
        interview_id=interview_id,
        turn_id=cand_turn.id,
        competency_id=active_comp_id,
        rubric_criteria=criteria,
        candidate_raw_text=cand_turn.text,
    )

    # 5. Persist strictly verified evidence spans
    for ev in eval_outcome.evidence_spans:
        ev_model = EvidenceModel(
            id=ev.id,
            interview_id=interview_id,
            turn_id=cand_turn.id,
            competency_id=ev.competency_id,
            claim=ev.claim,
            quote=ev.quote,
            start_char=ev.start_char,
            end_char=ev.end_char,
            score=ev.score,
            confidence=ev.confidence,
            rubric_met_json=json.dumps(ev.rubric_criteria_met),
            rubric_missed_json=json.dumps(ev.rubric_criteria_missed),
            verified=True,
            prompt_version=ev.prompt_version,
        )
        db.add(ev_model)

    # 6. Deterministic Beta Posterior Update
    comp_state_model = (
        db.query(CompetencyStateModel)
        .filter_by(interview_id=interview_id, competency_id=active_comp_id)
        .first()
    )
    prior_alpha = comp_state_model.alpha if comp_state_model else 1.0
    prior_beta = comp_state_model.beta if comp_state_model else 1.0
    prior_count = comp_state_model.evidence_count if comp_state_model else 0

    new_beta = update_beta_posterior(
        prior_alpha=prior_alpha,
        prior_beta=prior_beta,
        evidence_score=eval_outcome.overall_score,
        confidence_weight=eval_outcome.confidence_weight,
        prior_count=prior_count,
    )

    if not comp_state_model:
        comp_state_model = CompetencyStateModel(
            id=f"CS-{uuid.uuid4().hex[:6].upper()}",
            interview_id=interview_id,
            competency_id=active_comp_id,
            alpha=new_beta.alpha,
            beta=new_beta.beta,
            estimate=new_beta.estimate,
            uncertainty=new_beta.uncertainty,
            bloom_level=current_q.bloom_level if current_q else 3,
            evidence_count=new_beta.evidence_count,
        )
        db.add(comp_state_model)
    else:
        comp_state_model.alpha = new_beta.alpha
        comp_state_model.beta = new_beta.beta
        comp_state_model.estimate = new_beta.estimate
        comp_state_model.uncertainty = new_beta.uncertainty
        comp_state_model.evidence_count = new_beta.evidence_count
        comp_state_model.updated_at = datetime.now(timezone.utc)
    db.commit()

    # 7. Adaptive Continuation & Dynamic Stopping Logic
    MIN_TURNS = 3
    MAX_TURNS = 6

    # Load Role & Candidate context
    candidate = db.query(CandidateModel).filter_by(id=interview.candidate_id).first()
    role = db.query(RoleModel).filter_by(id=interview.role_id).first()
    competencies: List[Competency] = []
    if role and role.blueprint_json:
        try:
            b_data = json.loads(role.blueprint_json)
            for c in b_data.get("competencies", []):
                competencies.append(Competency(**c))
        except Exception:
            pass

    if not competencies:
        for q in INITIAL_QUESTIONS:
            competencies.append(
                Competency(
                    id=q["competency_id"],
                    name=q["competency_name"],
                    description=q["reason"],
                    importance=1.0,
                    must_have=True,
                    rubric_criteria=q["criteria"],
                )
            )

    all_states = (
        db.query(CompetencyStateModel)
        .filter_by(interview_id=interview_id)
        .all()
    )
    states_dict = {
        s.competency_id: CompetencyState(
            competency_id=s.competency_id,
            alpha=s.alpha,
            beta=s.beta,
            estimate=s.estimate,
            uncertainty=s.uncertainty,
            evidence_count=s.evidence_count,
            bloom_level=s.bloom_level,
        )
        for s in all_states
    }

    # Dynamic stopping criteria check
    untested_must_haves = [
        c for c in competencies
        if c.must_have and (c.id not in states_dict or states_dict[c.id].evidence_count == 0)
    ]
    high_uncertainty_comps = [
        c for c in competencies
        if c.id in states_dict and states_dict[c.id].uncertainty > 0.18
    ]
    has_unresolved_gaps = (
        0.30 <= eval_outcome.overall_score < 0.75
        or (eval_outcome.evidence_spans and bool(eval_outcome.evidence_spans[0].rubric_criteria_missed))
    )

    should_continue = False
    if payload.turn_index < MIN_TURNS:
        should_continue = True
    elif payload.turn_index < MAX_TURNS and (interview.mode in ["camera", "adaptive"]):
        # Dynamically continue if must-haves remain untested or partial gaps warrant follow-up drilling
        if untested_must_haves or high_uncertainty_comps or has_unresolved_gaps:
            should_continue = True

    if not should_continue:
        interview.state = InterviewState.COMPLETED.value
        interview.ended_at = datetime.now(timezone.utc)
        db.commit()

        record_audit_event(
            db=db,
            actor="System",
            action="Interview Finished",
            object_type="Interview",
            object_id=interview_id,
            details=f"Candidate completed {payload.turn_index} adaptive turns. Evidence ledger committed.",
        )

        return {
            "status": "completed",
            "completed": True,
            "message": "Interview completed successfully.",
            "evidence_count": len(eval_outcome.evidence_spans),
            "latest_score": eval_outcome.overall_score,
            "turns_completed": payload.turn_index,
        }

    # 8. Adaptive Next-Best-Question Planning
    past_qs = (
        db.query(QuestionModel)
        .filter_by(interview_id=interview_id)
        .order_by(QuestionModel.turn_index.asc())
        .all()
    )
    hist_comp_ids = [q.competency_id for q in past_qs]

    recent_scores_by_comp: dict[str, list[float]] = {}
    for s in all_states:
        recent_scores_by_comp[s.competency_id] = [s.estimate]

    decision = plan_next_question(
        competencies=competencies,
        states=states_dict,
        history_competency_ids=hist_comp_ids,
        recent_scores_by_comp=recent_scores_by_comp,
        elapsed_minutes=float(payload.turn_index * 4),
        target_duration_minutes=25.0,
    )

    target_comp = next((c for c in competencies if c.id == decision.selected_competency_id), competencies[0])

    # Extract prior criteria met / missed from latest evaluation
    c_met = eval_outcome.evidence_spans[0].rubric_criteria_met if eval_outcome.evidence_spans else []
    c_missed = eval_outcome.evidence_spans[0].rubric_criteria_missed if eval_outcome.evidence_spans else []

    question_text = synthesize_adaptive_question_text(
        competency=target_comp,
        mode=decision.mode,
        bloom_level=decision.bloom_level,
        prior_answer=payload.candidate_answer,
        prior_question=current_q.text if current_q else None,
        prior_criteria_met=c_met,
        prior_criteria_missed=c_missed,
        role_title=role.title if role else None,
        resume_context=candidate.resume_text[:400] if (candidate and candidate.resume_text) else None,
    )

    next_turn_idx = payload.turn_index + 1
    next_q = QuestionModel(
        id=f"Q-{uuid.uuid4().hex[:6].upper()}",
        interview_id=interview_id,
        competency_id=target_comp.id,
        turn_index=next_turn_idx,
        text=question_text,
        bloom_level=decision.bloom_level,
        mode=decision.mode.value,
        why_json=decision.why_card.model_dump_json(),
    )
    db.add(next_q)

    # Log interviewer question turn
    q_turn = TurnModel(
        id=f"TURN-{uuid.uuid4().hex[:6].upper()}",
        interview_id=interview_id,
        turn_index=next_turn_idx,
        speaker="interviewer",
        text=question_text,
    )
    db.add(q_turn)
    db.commit()

    return {
        "status": "in_progress",
        "completed": False,
        "turn_index": next_turn_idx,
        "can_conclude_early": payload.turn_index >= MIN_TURNS,
        "next_question": {
            "id": next_q.id,
            "text": next_q.text,
            "competency_id": next_q.competency_id,
            "turn_index": next_turn_idx,
            "mode": decision.mode.value,
            "bloom_level": decision.bloom_level,
            "why_card": decision.why_card.model_dump(),
        },
        "evidence_extracted": len(eval_outcome.evidence_spans),
        "latest_competency_posterior": {
            "competency_id": active_comp_id,
            "estimate": new_beta.estimate,
            "uncertainty": new_beta.uncertainty,
            "status": new_beta.status.value,
        },
    }


@router.post("/{interview_id}/conclude", response_model=dict)
def conclude_interview_session(interview_id: str, db: Session = Depends(get_db)):
    """Allows candidate or recruiter to conclude the session and transition to dossier report."""
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.state = InterviewState.COMPLETED.value
    interview.ended_at = datetime.now(timezone.utc)
    db.commit()

    record_audit_event(
        db=db,
        actor="Candidate",
        action="Interview Session Concluded",
        object_type="Interview",
        object_id=interview_id,
        details=f"Session {interview_id} finalized. Ready for Candidate Intelligence Dossier.",
    )

    return {
        "status": "completed",
        "interview_id": interview_id,
        "message": "Session concluded successfully.",
    }


@router.get("/{interview_id}/transcript", response_model=list)
def get_transcript(interview_id: str, db: Session = Depends(get_db)):
    turns = (
        db.query(TurnModel)
        .filter_by(interview_id=interview_id)
        .order_by(TurnModel.turn_index.asc())
        .all()
    )
    return [
        {
            "turn_id": t.id,
            "turn_index": t.turn_index,
            "speaker": t.speaker,
            "text": t.text,
            "timestamp": t.timestamp.isoformat() if t.timestamp else None,
        }
        for t in turns
    ]


class IntegrityEventSubmission(BaseModel):
    event_type: str
    family: str  # "focus", "input", "presence", "audio", "behavior"
    severity_base: int = 1
    detector_confidence: float = 1.0
    context_multiplier: float = 1.0
    t_ms: int = 0
    metadata: Optional[dict] = None


@router.post("/{interview_id}/integrity-events", response_model=dict)
@router.post("/{interview_id}/integrity/events", response_model=dict)
def record_integrity_event(
    interview_id: str,
    payload: IntegrityEventSubmission,
    db: Session = Depends(get_db),
):
    ensure_demo_interview_exists(interview_id, db)
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    event_id = f"INTG-{uuid.uuid4().hex[:6].upper()}"
    ev = IntegrityEventModel(
        id=event_id,
        interview_id=interview_id,
        event_type=payload.event_type,
        family=payload.family,
        severity_base=payload.severity_base,
        detector_confidence=payload.detector_confidence,
        context_multiplier=payload.context_multiplier,
        t_ms=payload.t_ms,
        metadata_json=json.dumps(payload.metadata or {}),
    )
    db.add(ev)
    db.commit()

    return {"status": "recorded", "event_id": event_id}


@router.get("/{interview_id}/integrity-status", response_model=dict)
def get_integrity_status(interview_id: str, db: Session = Depends(get_db)):
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    raw_events = (
        db.query(IntegrityEventModel)
        .filter_by(interview_id=interview_id)
        .order_by(IntegrityEventModel.t_ms.asc())
        .all()
    )
    pydantic_events = [
        IntegrityEvent(
            id=ie.id,
            interview_id=ie.interview_id,
            event_type=ie.event_type,
            family=IntegrityFamily(ie.family),
            severity_base=ie.severity_base,
            detector_confidence=ie.detector_confidence,
            context_multiplier=ie.context_multiplier,
            t_ms=ie.t_ms,
        )
        for ie in raw_events
    ]
    risk_profile = aggregate_integrity_events(pydantic_events)
    return risk_profile.model_dump()


@router.get("/{interview_id}/live-status", response_model=dict)
def get_live_status(interview_id: str, db: Session = Depends(get_db)):
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    candidate = db.query(CandidateModel).filter_by(id=interview.candidate_id).first()
    role = db.query(RoleModel).filter_by(id=interview.role_id).first()

    current_q = (
        db.query(QuestionModel)
        .filter_by(interview_id=interview_id)
        .order_by(QuestionModel.turn_index.desc())
        .first()
    )

    states = (
        db.query(CompetencyStateModel)
        .filter_by(interview_id=interview_id)
        .all()
    )

    turns = (
        db.query(TurnModel)
        .filter_by(interview_id=interview_id)
        .order_by(TurnModel.turn_index.asc())
        .all()
    )

    raw_events = (
        db.query(IntegrityEventModel)
        .filter_by(interview_id=interview_id)
        .all()
    )
    pydantic_events = [
        IntegrityEvent(
            id=ie.id,
            interview_id=ie.interview_id,
            event_type=ie.event_type,
            family=IntegrityFamily(ie.family),
            severity_base=ie.severity_base,
            detector_confidence=ie.detector_confidence,
            context_multiplier=ie.context_multiplier,
            t_ms=ie.t_ms,
        )
        for ie in raw_events
    ]
    risk_profile = aggregate_integrity_events(pydantic_events)

    why_card_dict = None
    if current_q and current_q.why_json:
        try:
            why_card_dict = json.loads(current_q.why_json)
        except Exception:
            pass

    return {
        "interview_id": interview.id,
        "state": interview.state,
        "mode": interview.mode,
        "role_title": role.title if role else "Role",
        "candidate_name": candidate.name if candidate else "Candidate",
        "current_turn_index": current_q.turn_index if current_q else 1,
        "current_question": {
            "id": current_q.id,
            "text": current_q.text,
            "competency_id": current_q.competency_id,
            "bloom_level": current_q.bloom_level,
            "mode": current_q.mode,
            "why_card": why_card_dict,
        }
        if current_q
        else None,
        "competency_posteriors": [
            {
                "competency_id": s.competency_id,
                "estimate": s.estimate,
                "uncertainty": s.uncertainty,
                "bloom_level": s.bloom_level,
                "evidence_count": s.evidence_count,
            }
            for s in states
        ],
        "turns_count": len(turns),
        "integrity_review_priority": risk_profile.review_priority.value,
        "integrity_score": risk_profile.total_weighted_score,
    }


@router.get("/{interview_id}/dossier", response_model=dict)
@router.get("/{interview_id}/report", response_model=dict)
def get_dossier(interview_id: str, db: Session = Depends(get_db)):
    ensure_demo_interview_exists(interview_id, db)
    try:
        return synthesize_interview_dossier(interview_id=interview_id, db=db)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

