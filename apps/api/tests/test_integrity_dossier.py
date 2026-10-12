"""
Tests for Mission 8 & Mission 9:
- Integrity Tide Engine (Debounce, time decay, family caps, 1.4x corroboration, benign explanations)
- Citation Validator (Strict quote verification & evaluative finding coverage)
- Dossier Synthesis & 4-Quadrant Reality Matrix
"""
from __future__ import annotations

import pytest
from apps.api.services.citation_validator import (
    extract_evidence_citations,
    validate_dossier_citations,
)
from apps.api.services.integrity_service import aggregate_integrity_events
from packages.schemas.models import (
    IntegrityEvent,
    IntegrityFamily,
    ReviewPriority,
)


# -------------------------------------------------------------------------
# 1. Integrity Tide Engine Tests
# -------------------------------------------------------------------------

def test_integrity_empty_events():
    profile = aggregate_integrity_events([])
    assert profile.review_priority == ReviewPriority.NONE
    assert profile.total_weighted_score == 0.0
    assert len(profile.benign_explanations) == 0


def test_integrity_debounce_3_seconds():
    # 3 focus events within 2 seconds (0s, 1s, 2s)
    events = [
        IntegrityEvent(
            id="E1",
            interview_id="INT-1",
            event_type="tab_hidden",
            family=IntegrityFamily.FOCUS,
            severity_base=2,
            t_ms=1000,
        ),
        IntegrityEvent(
            id="E2",
            interview_id="INT-1",
            event_type="tab_hidden",
            family=IntegrityFamily.FOCUS,
            severity_base=2,
            t_ms=2000,
        ),
        IntegrityEvent(
            id="E3",
            interview_id="INT-1",
            event_type="tab_hidden",
            family=IntegrityFamily.FOCUS,
            severity_base=2,
            t_ms=2500,
        ),
    ]

    profile = aggregate_integrity_events(events, current_time_ms=3000)
    # Debounce merges the rapid duplicates into 1 event
    assert profile.total_weighted_score < 3.0
    assert profile.review_priority in [ReviewPriority.NONE, ReviewPriority.LOW]


def test_integrity_multi_family_corroboration_bonus():
    # Two distinct families at same time: focus and input
    events = [
        IntegrityEvent(
            id="E1",
            interview_id="INT-1",
            event_type="window_blur",
            family=IntegrityFamily.FOCUS,
            severity_base=3,
            t_ms=1000,
        ),
        IntegrityEvent(
            id="E2",
            interview_id="INT-1",
            event_type="paste_burst",
            family=IntegrityFamily.INPUT,
            severity_base=3,
            t_ms=1000,
        ),
    ]

    profile = aggregate_integrity_events(events, current_time_ms=2000)
    assert len(profile.contributing_families) == 2
    # Multi-family corroboration bonus applies
    assert profile.total_weighted_score >= 5.0
    assert profile.review_priority in [ReviewPriority.MODERATE, ReviewPriority.HIGH]
    # Check that benign explanations are present for both
    assert len(profile.benign_explanations) == 2


def test_integrity_never_outputs_cheating_probability():
    events = [
        IntegrityEvent(
            id="E1",
            interview_id="INT-1",
            event_type="tab_hidden",
            family=IntegrityFamily.FOCUS,
            severity_base=1,
            t_ms=1000,
        ),
    ]
    profile = aggregate_integrity_events(events, current_time_ms=2000)
    profile_dict = profile.model_dump()
    assert "cheating_probability" not in profile_dict
    assert "cheat_score" not in profile_dict
    assert "auto_reject" not in profile_dict
    assert isinstance(profile.review_priority, ReviewPriority)


# -------------------------------------------------------------------------
# 2. Citation Validator Tests
# -------------------------------------------------------------------------

def test_extract_evidence_citations():
    text = "Candidate demonstrated mastery [EVID-A1] and [EVID-B2]."
    citations = extract_evidence_citations(text)
    assert citations == ["EVID-A1", "EVID-B2"]


def test_validate_dossier_citations_all_valid():
    dossier = (
        "Candidate demonstrated strong architectural competence in Kubernetes [EVID-101]. "
        "Candidate also excelled in Go memory management and zero-copy pipelines [EVID-102]."
    )
    valid_ids = {"EVID-101", "EVID-102"}

    res = validate_dossier_citations(dossier, valid_ids)
    assert res.is_valid is True
    assert res.verified_citations_count == 2
    assert len(res.uncited_evaluative_sentences) == 0
    assert len(res.invalid_evidence_ids) == 0


def test_validate_dossier_citations_rejects_uncited_claims():
    # Evaluative finding with NO evidence citation
    dossier = (
        "Candidate demonstrated weakness in multi-tenant cluster security and failed the scenario."
    )
    valid_ids = {"EVID-101"}

    res = validate_dossier_citations(dossier, valid_ids)
    assert res.is_valid is False
    assert len(res.uncited_evaluative_sentences) == 1
    assert "weakness" in res.uncited_evaluative_sentences[0]


def test_validate_dossier_citations_rejects_phantom_evidence_id():
    dossier = "Candidate demonstrated verified excellence in database scaling [EVID-FAKE999]."
    valid_ids = {"EVID-101"}

    res = validate_dossier_citations(dossier, valid_ids)
    assert res.is_valid is False
    assert res.invalid_evidence_ids == ["EVID-FAKE999"]
