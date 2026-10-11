"""
Provenance — Integrity Tide Engine.
Enforces Non-Negotiable Product Rule #2:
"Integrity output is a review priority with explanations and benign alternatives.
Never output 'cheating probability', never auto-reject."

Rule #4:
"No emotion/affect recognition, face recognition, personality typing, or raw video storage.
Face detection runs on-device and emits counts only."

Mathematical Formulations (from ARCHITECTURE §7):
1. 3s Debounce: Rapid successive events in same family merged.
2. Time Decay: w(t) = w_0 * exp(-delta_t / 600s).
3. 50% Family Cap: Single family capped at 50% of raw sum.
4. Multi-Family Corroboration: >=2 families multiplies combined score by 1.4x.
5. Review Priority Thresholds:
   - < 2.0: NONE
   - 2.0 - 4.9: LOW
   - 5.0 - 8.9: MODERATE
   - >= 9.0: HIGH
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Dict, List, Optional
from packages.schemas.models import (
    IntegrityEvent,
    IntegrityFamily,
    ReviewPriority,
    RiskProfile,
)

BENIGN_EXPLANATIONS: Dict[str, str] = {
    "focus": "Candidate may have switched windows to check API documentation, terminal logs, or system settings.",
    "input": "Candidate may have copied boilerplate code, test fixtures, or notes from a local editor or scratchpad.",
    "presence": "Candidate may have leaned outside camera frame, adjusted room lighting, or another person entered the room briefly.",
    "audio": "Background ambient noise, household acoustics, or room reverberation.",
    "behavior": "Extended pause before answering may reflect deep contemplation, architecture design, or careful articulation.",
}


def aggregate_integrity_events(
    events: List[IntegrityEvent],
    current_time_ms: Optional[int] = None,
) -> RiskProfile:
    """
    Deterministically computes the risk profile from raw telemetry events.
    Applies debounce, exponential time decay, family contribution caps,
    and multi-family corroboration bonus. Emits ONLY review priorities.
    """
    if not events:
        return RiskProfile(
            interview_id="",
            review_priority=ReviewPriority.NONE,
            total_weighted_score=0.0,
            contributing_families=[],
            benign_explanations=[],
            events_count=0,
            explanation="All monitored signals within normal bounds. No review needed.",
        )

    # Sort events chronologically
    sorted_events = sorted(events, key=lambda e: e.t_ms)
    interview_id = sorted_events[0].interview_id

    if current_time_ms is None:
        current_time_ms = sorted_events[-1].t_ms

    # 1. Apply 3-second (3000ms) debounce per family
    debounced_events: List[IntegrityEvent] = []
    last_seen_by_family: Dict[IntegrityFamily, int] = {}

    for ev in sorted_events:
        last_t = last_seen_by_family.get(ev.family)
        if last_t is None or (ev.t_ms - last_t >= 3000):
            debounced_events.append(ev)
            last_seen_by_family[ev.family] = ev.t_ms

    # 2. Compute decayed weights per family
    family_scores: Dict[IntegrityFamily, float] = {}

    for ev in debounced_events:
        delta_sec = max(0.0, (current_time_ms - ev.t_ms) / 1000.0)
        # 600-second half-life decay factor
        decay = math.exp(-delta_sec / 600.0)
        raw_weight = ev.severity_base * ev.detector_confidence * ev.context_multiplier
        decayed_weight = raw_weight * decay

        family_scores[ev.family] = family_scores.get(ev.family, 0.0) + decayed_weight

    raw_total = sum(family_scores.values())
    if raw_total <= 0.0:
        return RiskProfile(
            interview_id=interview_id,
            review_priority=ReviewPriority.NONE,
            total_weighted_score=0.0,
            contributing_families=[],
            benign_explanations=[],
            events_count=len(events),
            explanation="All monitored signals within normal bounds.",
        )

    # 3. Apply 50% single-family cap
    # No single family can exceed 50% of the raw sum (when multiple families exist)
    capped_scores: Dict[IntegrityFamily, float] = {}
    active_families = [f for f, s in family_scores.items() if s > 0.05]

    for fam, score in family_scores.items():
        if len(active_families) > 1:
            max_allowed = raw_total * 0.50
            capped_scores[fam] = min(score, max_allowed)
        else:
            capped_scores[fam] = score

    capped_total = sum(capped_scores.values())

    # 4. Apply multi-family corroboration bonus (1.4x if >= 2 families)
    multiplier = 1.4 if len(active_families) >= 2 else 1.0
    final_score = round(capped_total * multiplier, 2)

    # 5. Map to 4-tier Review Priority
    if final_score < 2.0:
        priority = ReviewPriority.NONE
    elif final_score < 5.0:
        priority = ReviewPriority.LOW
    elif final_score < 9.0:
        priority = ReviewPriority.MODERATE
    else:
        priority = ReviewPriority.HIGH

    # 6. Gather benign explanations for all active families
    benign_list = [
        BENIGN_EXPLANATIONS.get(fam.value, "Routine workstation interaction.")
        for fam in active_families
    ]

    explanation_summary = (
        f"Review priority: {priority.value}. "
        f"{len(debounced_events)} debounced events recorded across {len(active_families)} categories. "
        "Review recommended solely for context clarification."
    )

    return RiskProfile(
        interview_id=interview_id,
        review_priority=priority,
        total_weighted_score=final_score,
        contributing_families=active_families,
        benign_explanations=benign_list,
        events_count=len(events),
        explanation=explanation_summary,
        last_calculated_at=datetime.now(timezone.utc),
    )
