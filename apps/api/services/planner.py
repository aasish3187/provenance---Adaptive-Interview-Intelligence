"""
Provenance — Adaptive Next-Best-Question (NBQ) Planner Engine.
Enforces Non-Negotiable Product Rule #6:
"Math/rules in code (coverage, uncertainty, severity aggregation, gap classes).
LLMs write language and extract structure only."

Mathematical Formulations (from ARCHITECTURE §5.2 & §5.3):
Utility:
  U(c) = importance(c) * norm_uncertainty(c) * (1 + 0.5 * claim_unverified(c)) * time_fit(c) - 0.3 * recency_penalty(c)

Bloom Difficulty Ladder:
  L in {1..6}:
  - If last 2 turns score >= 0.75: L = min(6, L + 1)
  - If last turn score <= 0.40: L = max(1, L - 1)
  - Else: L stays constant
"""
from __future__ import annotations

from typing import Dict, List, Optional
from packages.schemas.models import (
    Competency,
    CompetencyState,
    QuestionDecision,
    QuestionMode,
    WhyCard,
)


def calculate_utility(
    competency: Competency,
    state: CompetencyState,
    recent_competency_ids: List[str],
    elapsed_minutes: float = 0.0,
    target_duration_minutes: float = 30.0,
) -> float:
    """
    Computes deterministic question utility score for a given competency.
    Higher utility = greater information gain for hiring decision.
    """
    # 1. Base importance (must_have gets boost)
    importance = competency.importance
    if competency.must_have:
        importance = max(importance, 1.25)

    # 2. Normalized uncertainty (prior max is 0.2887)
    norm_uncertainty = min(1.0, state.uncertainty / 0.2887)

    # 3. Unverified resume claim multiplier (+50% bonus if claimed but not tested)
    claim_bonus = 0.5 if (competency.claimed_in_resume and state.evidence_count == 0) else 0.0

    # 4. Time fit: favors untested competencies when time is running out
    time_remaining_ratio = max(0.1, 1.0 - (elapsed_minutes / max(1.0, target_duration_minutes)))
    time_fit = 1.0 + (0.3 * (1.0 - time_remaining_ratio) if state.evidence_count == 0 else 0.0)

    # 5. Recency penalty to prevent repetitive questioning on same topic
    recency_penalty = 0.0
    if recent_competency_ids:
        if recent_competency_ids[-1] == competency.id:
            recency_penalty = 1.0
        elif len(recent_competency_ids) > 1 and recent_competency_ids[-2] == competency.id:
            recency_penalty = 0.5

    utility = (importance * norm_uncertainty * (1.0 + claim_bonus) * time_fit) - (0.3 * recency_penalty)
    return round(max(0.0, utility), 4)


def update_bloom_level(
    current_bloom: int,
    recent_scores_for_comp: List[float],
) -> int:
    """
    Adapts Bloom taxonomy difficulty:
    - If last 2 scores >= 0.75: Level + 1 (Mastery elevation)
    - If last score <= 0.40: Level - 1 (Foundation drill)
    - Otherwise: Level stays constant
    """
    lvl = current_bloom
    if len(recent_scores_for_comp) >= 2 and recent_scores_for_comp[-1] >= 0.75 and recent_scores_for_comp[-2] >= 0.75:
        lvl = min(6, lvl + 1)
    elif recent_scores_for_comp and recent_scores_for_comp[-1] <= 0.40:
        lvl = max(1, lvl - 1)
    return lvl


def select_question_mode(
    state: CompetencyState,
    claimed_in_resume: bool,
    recent_scores: List[float],
) -> QuestionMode:
    """
    Selects question mode based on state and performance:
    - VERIFY: Claimed on resume but zero evidence
    - DRILL: Shallow/insufficient prior answer (score <= 0.40)
    - ELEVATE: Strong prior demonstration (score >= 0.75)
    - PROBE: Baseline exploratory question
    """
    if state.evidence_count == 0 and claimed_in_resume:
        return QuestionMode.VERIFY

    if recent_scores and recent_scores[-1] <= 0.40:
        return QuestionMode.DRILL

    if recent_scores and recent_scores[-1] >= 0.75:
        return QuestionMode.ELEVATE

    return QuestionMode.PROBE


def plan_next_question(
    competencies: List[Competency],
    states: Dict[str, CompetencyState],
    history_competency_ids: List[str],
    recent_scores_by_comp: Dict[str, List[float]],
    elapsed_minutes: float = 0.0,
    target_duration_minutes: float = 30.0,
) -> QuestionDecision:
    """
    Selects the optimal Next-Best-Question competency via deterministic utility argmax,
    adjusts Bloom difficulty, and outputs an explainable WhyCard.
    """
    if not competencies:
        raise ValueError("Cannot plan question without competencies")

    utilities: List[tuple[Competency, float]] = []
    for comp in competencies:
        state = states.get(comp.id, CompetencyState(competency_id=comp.id))
        u = calculate_utility(
            competency=comp,
            state=state,
            recent_competency_ids=history_competency_ids,
            elapsed_minutes=elapsed_minutes,
            target_duration_minutes=target_duration_minutes,
        )
        utilities.append((comp, u))

    # Sort descending by utility
    utilities.sort(key=lambda x: x[1], reverse=True)

    selected_comp, top_utility = utilities[0]
    runner_up = utilities[1][0].name if len(utilities) > 1 else None

    selected_state = states.get(selected_comp.id, CompetencyState(competency_id=selected_comp.id))
    recent_scores = recent_scores_by_comp.get(selected_comp.id, [])

    # Update Bloom level
    bloom = update_bloom_level(selected_state.bloom_level, recent_scores)

    # Determine mode
    mode = select_question_mode(selected_state, selected_comp.claimed_in_resume, recent_scores)

    # Formulate plain-language why rationale
    if mode == QuestionMode.VERIFY:
        reason = f"Candidate claimed '{selected_comp.name}' on resume but has 0 verified transcript evidence so far."
    elif mode == QuestionMode.DRILL:
        reason = f"Last response on '{selected_comp.name}' had gaps. Drilling deeper into architectural tradeoffs."
    elif mode == QuestionMode.ELEVATE:
        reason = f"Candidate demonstrated strong fundamentals (score >= 0.75). Elevating to Bloom level {bloom}."
    else:
        reason = f"Highest decision uncertainty (+/-{selected_state.uncertainty:.2f}) among priority competencies."

    why_card = WhyCard(
        target_competency_id=selected_comp.id,
        target_competency_name=selected_comp.name,
        reason=reason,
        question_type=mode,
        bloom_level=bloom,
        evaluation_criteria=selected_comp.rubric_criteria or [
            f"Demonstrates practical mastery of {selected_comp.name}",
            "Addresses operational edge cases and reliability tradeoffs",
            "Cites concrete production experience or architecture design",
        ],
        alternative_considered=f"Considered '{runner_up}' (Utility {utilities[1][1]:.2f})" if runner_up else None,
    )

    return QuestionDecision(
        selected_competency_id=selected_comp.id,
        mode=mode,
        bloom_level=bloom,
        utility_score=top_utility,
        why_card=why_card,
    )


def synthesize_adaptive_question_text(
    competency: Competency,
    mode: QuestionMode,
    bloom_level: int,
    prior_answer: Optional[str] = None,
    prior_question: Optional[str] = None,
    prior_criteria_met: Optional[List[str]] = None,
    prior_criteria_missed: Optional[List[str]] = None,
    role_title: Optional[str] = None,
    resume_context: Optional[str] = None,
) -> str:
    """
    Generates tailored, highly contextual question text aligned with competency, Bloom level, and mode.
    Dynamically reacts to the candidate's prior response:
    - If previous answer demonstrated strong criteria -> Elevates to higher architectural depth.
    - If previous answer had gaps -> Drills directly into the missing tradeoffs.
    - Uses live Gemini 3.8 Flash / Groq Qwen failover with deterministic fallback ladder.
    """
    from apps.api.services.llm_client import call_llm_text

    # 1. Formulate Context-Rich Adaptive Prompt
    prompt = (
        f"You are the senior adaptive technical interviewer for the Provenance platform.\n"
        f"Target Role: {role_title or 'Senior Engineering'}\n"
        f"Competency to evaluate: '{competency.name}'\n"
        f"Interview Mode: {mode.value.upper()} (Target Bloom Level: {bloom_level}/6)\n"
        f"Evaluation Rubric Criteria: {', '.join(competency.rubric_criteria or ['Practical architectural depth'])}\n"
    )

    if prior_question:
        prompt += f"Previous Question Asked: \"{prior_question[:250]}\"\n"

    if prior_answer:
        prompt += f"Candidate's Prior Answer: \"{prior_answer[:450]}\"\n"

    if prior_criteria_met:
        prompt += f"Criteria Candidate Successfully Addressed: {', '.join(prior_criteria_met)}\n"

    if prior_criteria_missed:
        prompt += f"Criteria Candidate Omitted or Missed: {', '.join(prior_criteria_missed)}\n"

    if resume_context:
        prompt += f"Relevant Candidate Resume Context: \"{resume_context[:300]}\"\n"

    prompt += (
        "\nAdaptive Questioning Directives:\n"
        "- If MODE is ELEVATE: Candidate demonstrated mastery; push them to discuss higher-scale distributed edge cases, latency bottlenecks, or architectural failure recovery.\n"
        "- If MODE is DRILL: Candidate had partial gaps; directly reference or drill into the missing dimension/tradeoff from their previous answer.\n"
        "- If MODE is VERIFY: Probe the candidate's practical production experience validating the specific claim on their background.\n"
        "- If MODE is PROBE: Ask a clear, hands-on architectural problem to assess foundational competencies.\n\n"
        "Output ONLY the question itself. No conversational pleasantries, no conversational preamble."
    )

    llm_q = call_llm_text(
        prompt=prompt,
        system_prompt="You are a principal technical interviewer. Formulate sharp, rigorous, contextual questions.",
        max_tokens=150,
        timeout_seconds=5.0,
    )

    if llm_q and len(llm_q.strip()) > 20:
        return llm_q.strip().strip('"').strip("'")

    # 2. Deterministic Fallback Ladder
    name = competency.name
    if mode == QuestionMode.DRILL:
        if prior_criteria_missed:
            return f"Regarding your experience with {name}, how do you specifically address {prior_criteria_missed[0].lower()} in high-throughput production environments?"
        return f"Regarding your experience with {name}, can you walk through a specific production outage or edge-case failure you diagnosed and how you resolved it?"
    elif mode == QuestionMode.ELEVATE:
        return f"At an architectural level, how would you design and evaluate a multi-region deployment strategy for {name} with zero downtime and strict data consistency?"
    elif mode == QuestionMode.VERIFY:
        return f"You highlighted {name} on your background. Could you explain how you designed and benchmarked your most critical implementation of it?"
    else:
        if bloom_level <= 2:
            return f"What are the foundational principles of {name}, and how do you decide when it is the right tool to use?"
        elif bloom_level <= 4:
            return f"How do you implement and troubleshoot {name} under high concurrency and latency constraints?"
        else:
            return f"What are the most complex failure modes you have encountered with {name}, and what architectural patterns did you put in place to prevent them?"
