"""
Provenance SQLAlchemy Database Models.
Implements the append-only Evidence Ledger and tenant isolation (org_id).
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship
from apps.api.db.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RoleModel(Base):
    __tablename__ = "roles"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), nullable=False, index=True, default="default-org")
    title = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    jd_text = Column(Text, nullable=False)
    blueprint_json = Column(Text, nullable=True)  # Serialized Blueprint schema
    created_at = Column(DateTime(timezone=True), default=utc_now)

    interviews = relationship("InterviewModel", back_populates="role")


class CandidateModel(Base):
    __tablename__ = "candidates"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), nullable=False, index=True, default="default-org")
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    resume_text = Column(Text, nullable=True)
    consent_at = Column(DateTime(timezone=True), nullable=True)
    consent_version = Column(String(32), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    interviews = relationship("InterviewModel", back_populates="candidate")


class InterviewModel(Base):
    __tablename__ = "interviews"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), nullable=False, index=True, default="default-org")
    role_id = Column(String(64), ForeignKey("roles.id"), nullable=False, index=True)
    candidate_id = Column(String(64), ForeignKey("candidates.id"), nullable=False, index=True)
    state = Column(String(32), nullable=False, default="SETUP")  # SETUP, CONSENT, IN_PROGRESS, COMPLETED
    mode = Column(String(16), nullable=False, default="text")     # text, voice
    invite_token = Column(String(128), unique=True, index=True)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    role = relationship("RoleModel", back_populates="interviews")
    candidate = relationship("CandidateModel", back_populates="interviews")
    turns = relationship("TurnModel", back_populates="interview", cascade="all, delete-orphan")
    evidence_items = relationship("EvidenceModel", back_populates="interview", cascade="all, delete-orphan")


class TurnModel(Base):
    __tablename__ = "turns"

    id = Column(String(64), primary_key=True, index=True)
    interview_id = Column(String(64), ForeignKey("interviews.id"), nullable=False, index=True)
    turn_index = Column(Integer, nullable=False, index=True)
    speaker = Column(String(32), nullable=False)  # "interviewer" or "candidate"
    text = Column(Text, nullable=False)
    start_ms = Column(Integer, default=0)
    end_ms = Column(Integer, default=0)
    timestamp = Column(DateTime(timezone=True), default=utc_now)

    interview = relationship("InterviewModel", back_populates="turns")
    evidence = relationship("EvidenceModel", back_populates="turn")

    __table_args__ = (
        Index("idx_interview_turn", "interview_id", "turn_index"),
    )


class QuestionModel(Base):
    __tablename__ = "questions"

    id = Column(String(64), primary_key=True, index=True)
    interview_id = Column(String(64), ForeignKey("interviews.id"), nullable=False, index=True)
    competency_id = Column(String(64), nullable=False, index=True)
    turn_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    bloom_level = Column(Integer, default=3)
    mode = Column(String(32), default="probe")  # probe, drill, elevate, verify, bridge
    why_json = Column(Text, nullable=False)     # Serialized WhyCard
    rubric_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class EvidenceModel(Base):
    __tablename__ = "evidence"

    id = Column(String(64), primary_key=True, index=True)
    interview_id = Column(String(64), ForeignKey("interviews.id"), nullable=False, index=True)
    turn_id = Column(String(64), ForeignKey("turns.id"), nullable=False, index=True)
    competency_id = Column(String(64), nullable=False, index=True)
    claim = Column(Text, nullable=False)
    quote = Column(Text, nullable=False)
    start_char = Column(Integer, nullable=False)
    end_char = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    rubric_met_json = Column(Text, default="[]")
    rubric_missed_json = Column(Text, default="[]")
    verified = Column(Boolean, nullable=False, default=False)
    prompt_version = Column(String(32), default="1.0")
    timestamp = Column(DateTime(timezone=True), default=utc_now)

    interview = relationship("InterviewModel", back_populates="evidence_items")
    turn = relationship("TurnModel", back_populates="evidence")


class CompetencyStateModel(Base):
    __tablename__ = "competency_states"

    id = Column(String(64), primary_key=True, index=True)
    interview_id = Column(String(64), ForeignKey("interviews.id"), nullable=False, index=True)
    competency_id = Column(String(64), nullable=False, index=True)
    alpha = Column(Float, default=1.0)
    beta = Column(Float, default=1.0)
    estimate = Column(Float, default=0.5)
    uncertainty = Column(Float, default=0.2887)
    bloom_level = Column(Integer, default=3)
    evidence_count = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), default=utc_now)

    __table_args__ = (
        Index("idx_interview_comp", "interview_id", "competency_id"),
    )


class IntegrityEventModel(Base):
    __tablename__ = "integrity_events"

    id = Column(String(64), primary_key=True, index=True)
    interview_id = Column(String(64), ForeignKey("interviews.id"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False)
    family = Column(String(32), nullable=False)  # focus, input, presence, audio, behavior
    severity_base = Column(Integer, default=1)
    detector_confidence = Column(Float, default=1.0)
    context_multiplier = Column(Float, default=1.0)
    t_ms = Column(Integer, nullable=False)
    metadata_json = Column(Text, default="{}")
    timestamp = Column(DateTime(timezone=True), default=utc_now)


class RiskProfileModel(Base):
    __tablename__ = "risk_profiles"

    id = Column(String(64), primary_key=True, index=True)
    interview_id = Column(String(64), ForeignKey("interviews.id"), nullable=False, unique=True, index=True)
    review_priority = Column(String(32), default="None")  # None, Low, Moderate, High
    total_weighted_score = Column(Float, default=0.0)
    explanation_json = Column(Text, default="{}")
    timestamp = Column(DateTime(timezone=True), default=utc_now)


class DossierModel(Base):
    __tablename__ = "dossiers"

    id = Column(String(64), primary_key=True, index=True)
    interview_id = Column(String(64), ForeignKey("interviews.id"), nullable=False, unique=True, index=True)
    role_id = Column(String(64), nullable=False)
    candidate_name = Column(String(255), nullable=False)
    dossier_json = Column(Text, nullable=False)  # Serialized Dossier schema
    generated_at = Column(DateTime(timezone=True), default=utc_now)


class AuditLogModel(Base):
    """Immutable, append-only compliance audit trail."""
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    actor = Column(String(255), nullable=False)
    action = Column(String(128), nullable=False)
    object_type = Column(String(64), nullable=False)
    object_id = Column(String(64), nullable=False)
    payload_hash = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True)


class UserModel(Base):
    """User account model for enterprise recruiters, hiring managers, and auditors."""
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), nullable=False, index=True, default="default-org")
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(64), nullable=False)
    role = Column(String(64), nullable=False, default="recruiter")  # recruiter, hiring_manager, auditor, admin
    department = Column(String(255), nullable=True, default="Engineering")
    organization_name = Column(String(255), nullable=True, default="Provenance Enterprise")
    created_at = Column(DateTime(timezone=True), default=utc_now)


class PlatformSettingsModel(Base):
    """Platform-wide operational, AI calibration, and compliance settings per tenant."""
    __tablename__ = "platform_settings"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), unique=True, nullable=False, index=True, default="default-org")
    settings_json = Column(Text, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now)

