"""
Provenance — Shared Pydantic v2 Schemas & Data Contracts.
Unified source of truth for API, state machine, and data persistence.
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------------------
# Enums
# -------------------------------------------------------------------------

class SystemStatus(str, Enum):
    OK = "ok"
    DEGRADED = "degraded"
    DOWN = "down"


class InterviewState(str, Enum):
    SETUP = "SETUP"
    CONSENT = "CONSENT"
    WARMUP = "WARMUP"
    IN_PROGRESS = "IN_PROGRESS"
    WRAPUP = "WRAPUP"
    SYNTHESIZE = "SYNTHESIZE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class InterviewMode(str, Enum):
    TEXT = "text"
    VOICE = "voice"


class QuestionMode(str, Enum):
    PROBE = "probe"      # New topic
    DRILL = "drill"      # Digging deeper after shallow answer
    ELEVATE = "elevate"  # Testing higher difficulty after strong answer
    VERIFY = "verify"    # Checking specific resume claim
    BRIDGE = "bridge"    # Transitioning gracefully


class SkillStatus(str, Enum):
    VERIFIED = "Verified"                              # 🟢 μ>=0.7 & u<=0.2
    CLAIMED_UNVALIDATED = "Claimed — needs validation"  # 🟡 0.4<=μ<0.7 or u>0.2
    NOT_DEMONSTRATED = "Tested — not demonstrated"     # 🔴 μ<0.4 & >=2 evidence
    NOT_ASSESSED = "Not assessed"                      # ⚪ Not tested yet


class ReviewPriority(str, Enum):
    NONE = "None"
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"


class IntegrityFamily(str, Enum):
    FOCUS = "focus"          # tab/visibility, window blur
    INPUT = "input"          # paste burst, unnatural typing speed
    PRESENCE = "presence"    # face count transitions (on-device only)
    AUDIO = "audio"          # background noise, second voice flag
    BEHAVIOR = "behavior"    # long silence followed by sudden fluent answer


# -------------------------------------------------------------------------
# Health & Meta
# -------------------------------------------------------------------------

class HealthCheckResponse(BaseModel):
    status: SystemStatus = Field(default=SystemStatus.OK)
    service: str = Field(default="provenance-api")
    version: str = Field(default="0.1.0")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    environment: str = Field(default="development")


# -------------------------------------------------------------------------
# Consent & Candidate
# -------------------------------------------------------------------------

class ConsentRecord(BaseModel):
    candidate_id: str
    interview_id: str
    consent_version: str = "1.0"
    agreed: bool
    text_mode_preferred: bool = False
    optional_presence_sensor_agreed: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_hash: Optional[str] = None


# -------------------------------------------------------------------------
# Blueprint & Competencies
# -------------------------------------------------------------------------

class Competency(BaseModel):
    id: str
    name: str
    description: str
    importance: float = Field(ge=0.0, le=1.0, default=1.0)
    must_have: bool = False
    claimed_in_resume: bool = False
    rubric_criteria: List[str] = Field(default_factory=list)
    target_bloom_level: int = Field(ge=1, le=6, default=3)
    estimated_minutes: int = 5


class Blueprint(BaseModel):
    id: str
    role_id: str
    role_title: str
    target_duration_minutes: int = 30
    competencies: List[Competency] = Field(default_factory=list)
    recruiter_edited: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------------------------------------------------------------
# Questions & Explainability
# -------------------------------------------------------------------------

class WhyCard(BaseModel):
    target_competency_id: str
    target_competency_name: str
    reason: str
    question_type: QuestionMode
    bloom_level: int = Field(ge=1, le=6, default=3)
    evaluation_criteria: List[str] = Field(default_factory=list)
    alternative_considered: Optional[str] = None


class Question(BaseModel):
    id: str
    interview_id: str
    competency_id: str
    turn_index: int
    text: str
    bloom_level: int = 3
    mode: QuestionMode = QuestionMode.PROBE
    why_card: WhyCard
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------------------------------------------------------------
# Transcripts & Turns
# -------------------------------------------------------------------------

class TranscriptSegment(BaseModel):
    turn_id: str
    interview_id: str
    speaker: str  # "interviewer" or "candidate"
    text: str
    start_ms: int = 0
    end_ms: int = 0
    is_final: bool = True
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------------------------------------------------------------
# Evidence & Ledger
# -------------------------------------------------------------------------

class EvidenceSpan(BaseModel):
    id: str
    interview_id: str
    turn_id: str
    competency_id: str
    claim: str
    quote: str
    start_char: int
    end_char: int
    score: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    rubric_criteria_met: List[str] = Field(default_factory=list)
    rubric_criteria_missed: List[str] = Field(default_factory=list)
    verified: bool = False
    created_by_agent: str = "evaluator_agent"
    prompt_version: str = "1.0"
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class EvidenceBatch(BaseModel):
    turn_id: str
    items: List[EvidenceSpan] = Field(default_factory=list)
    evaluator_uncertainty_rationale: Optional[str] = None


# -------------------------------------------------------------------------
# Deterministic State: Beta Posterior & Utility
# -------------------------------------------------------------------------

class CompetencyState(BaseModel):
    competency_id: str
    alpha: float = 1.0
    beta: float = 1.0
    estimate: float = 0.5        # alpha / (alpha + beta)
    uncertainty: float = 0.2887  # sqrt(ab / ((a+b)^2 * (a+b+1)))
    evidence_count: int = 0
    bloom_level: int = 3
    last_updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class QuestionDecision(BaseModel):
    selected_competency_id: str
    mode: QuestionMode
    bloom_level: int
    utility_score: float
    why_card: WhyCard


# -------------------------------------------------------------------------
# Integrity Intelligence
# -------------------------------------------------------------------------

class IntegrityEvent(BaseModel):
    id: str
    interview_id: str
    event_type: str
    family: IntegrityFamily
    severity_base: int = Field(ge=1, le=3, default=1)
    detector_confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    context_multiplier: float = 1.0
    t_ms: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RiskProfile(BaseModel):
    interview_id: str
    review_priority: ReviewPriority = ReviewPriority.NONE
    total_weighted_score: float = 0.0
    contributing_families: List[IntegrityFamily] = Field(default_factory=list)
    benign_explanations: List[str] = Field(default_factory=list)
    events_count: int = 0
    explanation: str = "All monitored signals within normal bounds."
    last_calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# -------------------------------------------------------------------------
# Skill Gap Mapping & Dossier
# -------------------------------------------------------------------------

class SkillGapItem(BaseModel):
    skill_id: str
    skill_name: str
    status: SkillStatus
    importance: float = 1.0
    must_have: bool = False
    claimed_in_resume: bool = False
    required_but_absent_from_resume: bool = False
    evidence_ids: List[str] = Field(default_factory=list)
    is_ambiguous: bool = False
    estimate: float = 0.5
    uncertainty: float = 0.2887


class SkillGapMap(BaseModel):
    interview_id: str
    skills: List[SkillGapItem] = Field(default_factory=list)


class DossierFinding(BaseModel):
    id: str
    category: str  # "strength", "risk", "unresolved"
    statement: str
    evidence_ids: List[str] = Field(default_factory=list)  # Must have >=1 verified evidence ID
    competency_id: str
    uncertainty_level: str = "Low"


class Dossier(BaseModel):
    id: str
    interview_id: str
    role_id: str
    candidate_display_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "Ready for human review"
    summary_themes: List[str] = Field(default_factory=list)
    demonstrated_strengths: List[DossierFinding] = Field(default_factory=list)
    validation_needs_and_risks: List[DossierFinding] = Field(default_factory=list)
    unresolved_questions: List[str] = Field(default_factory=list)
    suggested_follow_ups: List[Dict[str, str]] = Field(default_factory=list)
    skill_gap_map: SkillGapMap
    risk_profile: RiskProfile
    evidence_count: int = 0
