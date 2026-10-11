"""
Provenance — Dossier Synthesis Service.
Enforces Non-Negotiable Product Rule #1:
"Every score/claim must link to a verified quote span in the transcript."

Rule #3:
"No overall hire/no-hire score. Show competency profile with uncertainty."
"""
from __future__ import annotations

import json
from typing import Any, Dict, List
from sqlalchemy.orm import Session
from apps.api.db.models import (
    CandidateModel,
    CompetencyStateModel,
    EvidenceModel,
    IntegrityEventModel,
    InterviewModel,
    RoleModel,
)
from apps.api.services.beta_engine import classify_skill_gap
from apps.api.services.citation_validator import validate_dossier_citations
from apps.api.services.integrity_service import aggregate_integrity_events
from packages.schemas.models import (
    Competency,
    IntegrityEvent,
    IntegrityFamily,
    ReviewPriority,
    SkillStatus,
)


def synthesize_interview_dossier(interview_id: str, db: Session) -> Dict[str, Any]:
    """
    Generates the complete evidence-backed candidate dossier.
    Combines Bayesian posterior profiles, 4-Quadrant Reality Matrix,
    evidence quotes, and benign-explained integrity review priority.
    """
    interview = db.query(InterviewModel).filter_by(id=interview_id).first()
    if not interview:
        raise ValueError(f"Interview {interview_id} not found")

    candidate = db.query(CandidateModel).filter_by(id=interview.candidate_id).first()
    role = db.query(RoleModel).filter_by(id=interview.role_id).first()

    # Load competencies from blueprint
    competencies: List[Competency] = []
    if role and role.blueprint_json:
        try:
            b_data = json.loads(role.blueprint_json)
            for c in b_data.get("competencies", []):
                competencies.append(Competency(**c))
        except Exception:
            pass

    # Load competency states and evidence items
    states_models = db.query(CompetencyStateModel).filter_by(interview_id=interview_id).all()
    evidence_models = db.query(EvidenceModel).filter_by(interview_id=interview_id, verified=True).all()

    evidence_by_comp: Dict[str, List[EvidenceModel]] = {}
    verified_evidence_ids = set()
    for ev in evidence_models:
        verified_evidence_ids.add(ev.id)
        evidence_by_comp.setdefault(ev.competency_id, []).append(ev)

    # Build competency profiles
    competency_profiles = []
    q1_strengths = []
    q2_untested = []
    q3_hidden_gems = []
    q4_gaps = []

    for comp in competencies:
        state = next((s for s in states_models if s.competency_id == comp.id), None)
        mu = state.estimate if state else 0.5
        u = state.uncertainty if state else 0.2887
        count = state.evidence_count if state else 0
        status = classify_skill_gap(mu, u, count)

        comp_evidence = evidence_by_comp.get(comp.id, [])
        evidence_list = [
            {
                "id": e.id,
                "claim": e.claim,
                "quote": e.quote,
                "start_char": e.start_char,
                "end_char": e.end_char,
                "score": e.score,
                "confidence": e.confidence,
                "turn_id": e.turn_id,
            }
            for e in comp_evidence
        ]

        # Citation tokens
        citation_tags = "".join(f" [{e.id}]" for e in comp_evidence)

        # Build descriptive narrative with strict evidence citation
        if status == SkillStatus.VERIFIED:
            narrative = (
                f"Candidate demonstrated verified proficiency in {comp.name} with high confidence "
                f"(posterior mean {mu:.2f} +/- {u:.2f}){citation_tags}."
            )
        elif status == SkillStatus.NOT_DEMONSTRATED:
            narrative = (
                f"Candidate was tested on {comp.name} but lacked key operational criteria "
                f"(posterior mean {mu:.2f} +/- {u:.2f}){citation_tags}."
            )
        elif status == SkillStatus.CLAIMED_UNVALIDATED:
            narrative = (
                f"Competency {comp.name} was partially demonstrated or requires further validation "
                f"(posterior mean {mu:.2f} +/- {u:.2f}){citation_tags}."
            )
        else:
            narrative = f"Competency {comp.name} was not assessed during this interview session."

        profile_item = {
            "competency_id": comp.id,
            "name": comp.name,
            "importance": comp.importance,
            "must_have": comp.must_have,
            "claimed_in_resume": comp.claimed_in_resume,
            "estimate": mu,
            "uncertainty": u,
            "status": status.value,
            "evidence_count": count,
            "evidence": evidence_list,
            "narrative": narrative,
        }
        competency_profiles.append(profile_item)

        # 4-Quadrant Categorization
        if status == SkillStatus.VERIFIED and comp.claimed_in_resume:
            q1_strengths.append(profile_item)
        elif status == SkillStatus.VERIFIED and not comp.claimed_in_resume:
            q3_hidden_gems.append(profile_item)
        elif comp.claimed_in_resume and (status == SkillStatus.CLAIMED_UNVALIDATED or status == SkillStatus.NOT_ASSESSED):
            q2_untested.append(profile_item)
        elif status == SkillStatus.NOT_DEMONSTRATED:
            q4_gaps.append(profile_item)
        elif not comp.claimed_in_resume and comp.must_have:
            q4_gaps.append(profile_item)
        else:
            q2_untested.append(profile_item)

    # Integrity Analysis
    raw_int_events = db.query(IntegrityEventModel).filter_by(interview_id=interview_id).all()
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
        for ie in raw_int_events
    ]
    risk_profile = aggregate_integrity_events(pydantic_events)

    # Dossier Markdown representation for citation validation check
    dossier_text = "\n".join(cp["narrative"] for cp in competency_profiles)
    citation_check = validate_dossier_citations(dossier_text, verified_evidence_ids)

    # Synthesize Candidate Decision Intelligence (Multi-Source Synthesis)
    str_names = [c["name"] for c in q1_strengths]
    gap_names = [c["name"] for c in q4_gaps]
    untested_names = [c["name"] for c in q2_untested]
    gem_names = [c["name"] for c in q3_hidden_gems]

    c_name = candidate.name if candidate else "Candidate"
    r_title = role.title if role else "Target Role"

    summary_parts = []
    if str_names:
        summary_parts.append(f"{c_name} demonstrated verified practical depth in {', '.join(str_names)}.")
    if gem_names:
        summary_parts.append(f"Discovered unadvertised strengths in {', '.join(gem_names)}.")
    if untested_names:
        summary_parts.append(f"Resume claims in {', '.join(untested_names)} require follow-up validation.")
    if gap_names:
        summary_parts.append(f"Identified operational gaps in {', '.join(gap_names)}.")

    executive_summary = (
        " ".join(summary_parts)
        if summary_parts
        else f"{c_name} completed the evaluation for {r_title}. Evidence ledger is available for detailed review."
    )

    decision_intelligence = {
        "candidate_name": c_name,
        "role_title": r_title,
        "executive_summary": executive_summary,
        "verified_strengths": str_names,
        "untested_claims": untested_names,
        "verified_gaps": gap_names,
        "hidden_gems": gem_names,
        "integrity_review_priority": risk_profile.review_priority.value,
        "benign_explanations": risk_profile.benign_explanations,
        "recommended_focus": (
            f"Candidate did not demonstrate required operational criteria in {', '.join(gap_names[:2])}. Address these critical technical gaps before considering progression."
            if gap_names and not str_names
            else (
                f"Focus subsequent interviews on validating {', '.join(untested_names[:2])}."
                if untested_names
                else "Candidate demonstrated verified baseline coverage across target competencies."
            )
        ),
    }

    return {
        "interview_id": interview.id,
        "candidate_id": candidate.id if candidate else "",
        "candidate_name": c_name,
        "role_title": r_title,
        "completed_at": interview.ended_at.isoformat() if interview.ended_at else None,
        "citation_validation": {
            "is_valid": citation_check.is_valid,
            "verified_citations_count": citation_check.verified_citations_count,
            "uncited_evaluative_sentences": citation_check.uncited_evaluative_sentences,
        },
        "competency_profiles": competency_profiles,
        "reality_matrix": {
            "quadrant_1_verified_strengths": q1_strengths,
            "quadrant_2_untested_claims": q2_untested,
            "quadrant_3_hidden_gems": q3_hidden_gems,
            "quadrant_4_verified_gaps": q4_gaps,
        },
        "decision_intelligence": decision_intelligence,
        "integrity_review": {
            "review_priority": risk_profile.review_priority.value,
            "total_weighted_score": risk_profile.total_weighted_score,
            "contributing_families": [f.value for f in risk_profile.contributing_families],
            "benign_explanations": risk_profile.benign_explanations,
            "explanation": risk_profile.explanation,
        },
    }
