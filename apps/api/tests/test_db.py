import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from apps.api.db.database import Base
from apps.api.db.models import (
    RoleModel,
    CandidateModel,
    InterviewModel,
    TurnModel,
    EvidenceModel,
    AuditLogModel,
)
from apps.api.services.audit_service import record_audit_event


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_create_role_and_candidate(test_db):
    role = RoleModel(
        id="ROLE-TEST-1",
        org_id="test-org",
        title="Distributed Systems Lead",
        department="Core Engineering",
        jd_text="Requirements: Raft, Go, Kubernetes, eBPF",
    )
    test_db.add(role)

    candidate = CandidateModel(
        id="CAND-TEST-1",
        org_id="test-org",
        name="Alex Morgan",
        email="alex@example.com",
        consent_version="1.0",
    )
    test_db.add(candidate)
    test_db.commit()

    saved_role = test_db.query(RoleModel).filter_by(id="ROLE-TEST-1").first()
    assert saved_role is not None
    assert saved_role.title == "Distributed Systems Lead"
    assert saved_role.org_id == "test-org"

    saved_cand = test_db.query(CandidateModel).filter_by(id="CAND-TEST-1").first()
    assert saved_cand is not None
    assert saved_cand.name == "Alex Morgan"


def test_turn_and_evidence_ledger(test_db):
    role = RoleModel(id="R1", title="Eng", jd_text="JD")
    cand = CandidateModel(id="C1", name="Alex")
    interview = InterviewModel(id="INT-1", role_id="R1", candidate_id="C1", state="IN_PROGRESS")
    test_db.add_all([role, cand, interview])
    test_db.commit()

    turn = TurnModel(
        id="TURN-1",
        interview_id="INT-1",
        turn_index=1,
        speaker="candidate",
        text="When traffic spiked, our custom HPA scaled pods cleanly.",
    )
    test_db.add(turn)
    test_db.commit()

    evidence = EvidenceModel(
        id="EVID-1",
        interview_id="INT-1",
        turn_id="TURN-1",
        competency_id="COMP-K8S",
        claim="Experienced in custom HPA metrics",
        quote="our custom HPA scaled pods cleanly",
        start_char=20,
        end_char=55,
        score=0.85,
        confidence=0.9,
        verified=True,
    )
    test_db.add(evidence)
    test_db.commit()

    saved_ev = test_db.query(EvidenceModel).filter_by(id="EVID-1").first()
    assert saved_ev is not None
    assert saved_ev.verified is True
    assert saved_ev.turn.text.startswith("When traffic spiked")


def test_audit_log_append(test_db):
    log = record_audit_event(
        test_db,
        actor="Recruiter",
        action="Reviewed Candidate",
        object_type="Dossier",
        object_id="DOS-1",
        details="Recruiter approved candidate for next round.",
        payload={"score": 0.82},
    )

    assert log.id.startswith("AUD-")
    assert log.payload_hash is not None

    saved_log = test_db.query(AuditLogModel).filter_by(id=log.id).first()
    assert saved_log is not None
    assert saved_log.action == "Reviewed Candidate"
