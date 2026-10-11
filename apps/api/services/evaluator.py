"""
Provenance — Evaluator Agent Service.
Enforces Non-Negotiable Product Rule #1:
"Every score/claim must link to a verified quote span in the transcript.
Verify quotes in code (normalized substring match). Discard and log unverifiable evidence."

Rule #6:
"Math/rules in code (coverage, uncertainty, severity aggregation, gap classes).
LLMs write language and extract structure only."
"""
from __future__ import annotations

import logging
import uuid
from typing import List, Optional, Tuple
from apps.api.services.guard import sanitize_and_guard
from apps.api.services.llm_client import call_llm_json
from apps.api.services.quote_verifier import verify_quote_in_transcript
from packages.schemas.models import EvidenceSpan

logger = logging.getLogger("provenance.evaluator")


class EvaluationOutcome:
    def __init__(
        self,
        evidence_spans: List[EvidenceSpan],
        discarded_unverified_quotes: List[str],
        injection_flagged: bool,
        overall_score: float,
        confidence_weight: float,
        reasoning: str = "",
    ):
        self.evidence_spans = evidence_spans
        self.discarded_unverified_quotes = discarded_unverified_quotes
        self.injection_flagged = injection_flagged
        self.overall_score = overall_score
        self.confidence_weight = confidence_weight
        self.reasoning = reasoning


def evaluate_turn_answer(
    interview_id: str,
    turn_id: str,
    competency_id: str,
    rubric_criteria: List[str],
    candidate_raw_text: str,
    prompt_version: str = "2.0",
) -> EvaluationOutcome:
    """
    Evaluates a candidate turn answer against provided rubric criteria using
    AI evaluation (Gemini 3.8 Flash / Groq) with deterministic quote verification.
    Guarantees that every emitted evidence span is verified by exact normalized
    substring matching in the candidate transcript.
    """
    # 1. Security Guard containment
    guard_res = sanitize_and_guard(candidate_raw_text)
    sanitized = guard_res.sanitized_text
    trimmed_answer = sanitized.strip() if sanitized else ""

    if not trimmed_answer:
        return EvaluationOutcome(
            evidence_spans=[],
            discarded_unverified_quotes=[],
            injection_flagged=guard_res.injection_detected,
            overall_score=0.05,
            confidence_weight=0.85,
            reasoning=f"Candidate did not provide a verbal or typed response to the question on {competency_id}.",
        )

    # 1b. Short, single-word or non-substantive answer (e.g., 'hi', 'hlo', 'no')
    if len(trimmed_answer) < 8:
        v_res = verify_quote_in_transcript(trimmed_answer, candidate_raw_text)
        spans = []
        if v_res.is_verified:
            spans.append(
                EvidenceSpan(
                    id=f"EVID-{uuid.uuid4().hex[:6].upper()}",
                    interview_id=interview_id,
                    turn_id=turn_id,
                    competency_id=competency_id,
                    claim=f"Candidate provided a non-substantive response ('{trimmed_answer}') which fails to meet {competency_id} criteria",
                    quote=v_res.original_matched_text,
                    start_char=v_res.start_char,
                    end_char=v_res.end_char,
                    score=0.05,
                    confidence=0.85,
                    rubric_criteria_met=[],
                    rubric_criteria_missed=list(rubric_criteria),
                    verified=True,
                    created_by_agent="evaluator_agent",
                    prompt_version=prompt_version,
                )
            )
        return EvaluationOutcome(
            evidence_spans=spans,
            discarded_unverified_quotes=[],
            injection_flagged=guard_res.injection_detected,
            overall_score=0.05,
            confidence_weight=0.85,
            reasoning=f"Candidate provided a non-substantive response ('{trimmed_answer}') which does not address {competency_id} criteria.",
        )

    # 2. Extract Candidate Sentences for fallback & matching
    raw_sentences = [
        s.strip()
        for s in sanitized.replace("\n", " ").split(".")
        if len(s.strip()) > 8
    ]

    criteria_met: list[str] = []
    criteria_missed: list[str] = []
    candidate_quotes: list[Tuple[str, str]] = []  # (claim, quote)
    llm_score: Optional[float] = None
    llm_reasoning: str = ""

    # 3. AI Evaluation Call
    eval_prompt = (
        f"You are an expert technical evaluator on the Provenance interview platform.\n"
        f"Competency ID: {competency_id}\n"
        f"Rubric Criteria:\n"
        + "\n".join(f"- {c}" for c in (rubric_criteria or ["Practical architecture mastery"]))
        + f"\n\nCandidate Answer:\n\"\"\"{sanitized}\"\"\"\n\n"
        f"Evaluate the candidate's answer with technical rigor.\n"
        f"CRITICAL INVARIANT: Every quote in extracted_quotes MUST BE an EXACT, VERBATIM substring copied directly from the candidate answer. Do not paraphrase or edit any words.\n\n"
        f"Return JSON strictly in this structure:\n"
        f"{{\n"
        f'  "criteria_met": ["criterion 1"],\n'
        f'  "criteria_missed": ["criterion 2"],\n'
        f'  "score": 0.85,\n'
        f'  "extracted_quotes": [\n'
        f'    {{"claim": "Demonstrates capability", "quote": "exact quote from candidate text"}}\n'
        f"  ],\n"
        f'  "reasoning": "Concise summary of candidate performance."\n'
        f"}}"
    )

    llm_result = call_llm_json(
        prompt=eval_prompt,
        system_prompt="You are a rigorous technical interview evaluator. You only return valid JSON matching the requested schema.",
        timeout_seconds=6.0,
    )

    if llm_result and isinstance(llm_result, dict):
        criteria_met = [str(c) for c in llm_result.get("criteria_met", [])]
        criteria_missed = [str(c) for c in llm_result.get("criteria_missed", [])]
        raw_score = llm_result.get("score")
        if isinstance(raw_score, (int, float)):
            llm_score = max(0.0, min(1.0, float(raw_score)))
        llm_reasoning = str(llm_result.get("reasoning", ""))

        for q_obj in llm_result.get("extracted_quotes", []):
            if isinstance(q_obj, dict):
                c_claim = str(q_obj.get("claim", f"Demonstrates {competency_id}"))
                c_quote = str(q_obj.get("quote", "")).strip().strip('"').strip("'")
                if c_quote:
                    candidate_quotes.append((c_claim, c_quote))

    # 4. Deterministic Fallback if LLM yielded no quotes or missed evaluation
    if not candidate_quotes:
        for crit in rubric_criteria:
            crit_tokens = set(re_tokenize(crit.lower()))
            matched_sentence = None
            best_overlap = 0

            for sentence in raw_sentences:
                s_tokens = set(re_tokenize(sentence.lower()))
                common = crit_tokens.intersection(s_tokens)
                if len(common) >= 2 or (len(crit_tokens) <= 3 and len(common) >= 1):
                    overlap_ratio = len(common) / max(1, len(crit_tokens))
                    if overlap_ratio > best_overlap:
                        best_overlap = overlap_ratio
                        matched_sentence = sentence

            if matched_sentence and best_overlap >= 0.20:
                if crit not in criteria_met:
                    criteria_met.append(crit)
                candidate_quotes.append((f"Demonstrates: {crit}", matched_sentence))
            else:
                if crit not in criteria_missed and crit not in criteria_met:
                    criteria_missed.append(crit)

        # Ensure at least one quote is checked if candidate provided an answer
        if not candidate_quotes:
            if raw_sentences:
                candidate_quotes.append((f"Candidate response on {competency_id}", raw_sentences[0][:120]))
            elif trimmed_answer:
                candidate_quotes.append((f"Candidate response on {competency_id}", trimmed_answer[:120]))

    # 5. Non-Negotiable Invariant #1: Strict quote verification via quote_verifier
    valid_evidence: List[EvidenceSpan] = []
    discarded: List[str] = []

    tot_criteria = max(1, len(rubric_criteria))
    # Calibrate deterministic score
    if llm_score is not None and criteria_met:
        computed_score = round(0.5 * llm_score + 0.5 * (len(criteria_met) / tot_criteria), 3)
    elif criteria_met:
        computed_score = round(len(criteria_met) / tot_criteria, 3)
    elif llm_score is not None:
        computed_score = round(min(llm_score, 0.15), 3)
    else:
        computed_score = 0.08

    for claim, candidate_quote in candidate_quotes:
        v_res = verify_quote_in_transcript(candidate_quote, candidate_raw_text)
        if not v_res.is_verified:
            # Attempt to find substring match if quote had slight trimming issue
            for s in raw_sentences:
                if candidate_quote in s or s in candidate_quote:
                    sub_res = verify_quote_in_transcript(s, candidate_raw_text)
                    if sub_res.is_verified:
                        v_res = sub_res
                        candidate_quote = s
                        break

        if v_res.is_verified:
            span = EvidenceSpan(
                id=f"EVID-{uuid.uuid4().hex[:6].upper()}",
                interview_id=interview_id,
                turn_id=turn_id,
                competency_id=competency_id,
                claim=claim,
                quote=v_res.original_matched_text,
                start_char=v_res.start_char,
                end_char=v_res.end_char,
                score=max(0.05, min(1.0, computed_score)),
                confidence=0.90 if criteria_met else 0.85,
                rubric_criteria_met=criteria_met,
                rubric_criteria_missed=criteria_missed if criteria_missed else list(rubric_criteria),
                verified=True,
                created_by_agent="evaluator_agent",
                prompt_version=prompt_version,
            )
            valid_evidence.append(span)
        else:
            # Invariant 1: Discard and log unverifiable evidence
            logger.warning(
                f"Discarding unverifiable evidence quote: '{candidate_quote}'. Reason: {v_res.rejection_reason}"
            )
            discarded.append(candidate_quote)

    overall_score = computed_score
    confidence_weight = 0.95 if criteria_met and valid_evidence else 0.85

    if not llm_reasoning:
        if criteria_met:
            llm_reasoning = f"Demonstrated {len(criteria_met)} of {tot_criteria} criteria with verified transcript evidence."
        else:
            llm_reasoning = f"Did not meet target criteria for {competency_id}."

    return EvaluationOutcome(
        evidence_spans=valid_evidence,
        discarded_unverified_quotes=discarded,
        injection_flagged=guard_res.injection_detected,
        overall_score=round(overall_score, 3),
        confidence_weight=round(confidence_weight, 3),
        reasoning=llm_reasoning,
    )


def re_tokenize(text: str) -> list[str]:
    import re
    words = re.findall(r"[a-z0-9_-]+", text)
    stopwords = {"and", "the", "for", "with", "that", "this", "from", "into", "when", "using", "how"}
    return [w for w in words if w not in stopwords and len(w) > 2]
