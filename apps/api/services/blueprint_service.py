"""
Provenance — Blueprint Builder Service.
Extracts structured competencies, must-have flags, and observable criteria from JD and resume text
using live AI analysis (Gemini 3.8 Flash / Groq Qwen) with calibrated archetype fallbacks.
"""
from __future__ import annotations

import json
import logging
import uuid
from typing import Any, Dict, List, Optional
from apps.api.services.llm_client import call_llm_json
from packages.schemas.models import Blueprint, Competency

logger = logging.getLogger("provenance.blueprint")

# Calibrated archetype fallbacks for robust offline / local testing
DEFAULT_BACKEND_COMPETENCIES = [
    Competency(
        id="COMP-K8S",
        name="Kubernetes & Container Orchestration",
        description="Production container deployment, pod disruption budgets, custom metrics autoscaling, and cluster topology.",
        importance=0.95,
        must_have=True,
        claimed_in_resume=True,
        rubric_criteria=[
            "Explains HPA scaling mechanics beyond default CPU thresholds",
            "Identifies pod disruption budgets (PDB) and graceful termination",
            "Demonstrates multi-cluster or namespace isolation architecture",
        ],
        target_bloom_level=4,
        estimated_minutes=8,
    ),
    Competency(
        id="COMP-GO",
        name="Go Concurrency & Memory Management",
        description="Channel semantics, goroutine lifecycle, sync primitives, memory allocator profiling, and leak detection.",
        importance=0.90,
        must_have=True,
        claimed_in_resume=True,
        rubric_criteria=[
            "Utilizes sync.Pool or buffer reuse to minimize allocation pressure",
            "Applies context cancellation and non-blocking select timeouts",
            "Identifies deadlock conditions and goroutine leak detection tools",
        ],
        target_bloom_level=4,
        estimated_minutes=8,
    ),
    Competency(
        id="COMP-DISTRIB",
        name="Distributed Systems & Consensus",
        description="Consensus algorithms (Raft, Paxos), write-ahead logs, split-brain recovery, and replication topologies.",
        importance=0.80,
        must_have=False,
        claimed_in_resume=True,
        rubric_criteria=[
            "Explains leader election and log compaction mechanics",
            "Accounts for network partitions and quorum requirements",
            "Designs resilient read/write consistency tradeoffs",
        ],
        target_bloom_level=3,
        estimated_minutes=6,
    ),
    Competency(
        id="COMP-SEC",
        name="Zero-Trust Architecture & API Security",
        description="Workload identity, mutual TLS, token minting, defense-in-depth, and principle of least privilege.",
        importance=0.85,
        must_have=True,
        claimed_in_resume=False,
        rubric_criteria=[
            "Applies workload identity (SPIFFE/SPIRE) over perimeter-only firewalls",
            "Implements mutual TLS (mTLS) for inter-service communication",
            "Demonstrates defense against token replay and privilege escalation",
        ],
        target_bloom_level=3,
        estimated_minutes=6,
    ),
]

FRONTEND_COMPETENCIES = [
    Competency(
        id="COMP-FE-ARCH",
        name="Modern Web Architecture & React/Next.js",
        description="Component lifecycle, state synchronization, SSR/SSG/ISR rendering modes, and bundle splitting.",
        importance=0.95,
        must_have=True,
        claimed_in_resume=True,
        rubric_criteria=[
            "Explains server-side rendering, hydration, and static generation trade-offs",
            "Optimizes Core Web Vitals (LCP, FID/INP, CLS) and asset delivery",
            "Designs modular, reusable components with predictable state flow",
        ],
        target_bloom_level=4,
        estimated_minutes=8,
    ),
    Competency(
        id="COMP-FE-STATE",
        name="Client State Management & Data Fetching",
        description="Predictable state containers, caching layers (TanStack Query/SWR), and asynchronous synchronization.",
        importance=0.90,
        must_have=True,
        claimed_in_resume=True,
        rubric_criteria=[
            "Implements optimistic UI updates and cache invalidation strategies",
            "Manages complex asynchronous side effects and race conditions",
            "Minimizes unnecessary DOM re-renders and memory leaks",
        ],
        target_bloom_level=4,
        estimated_minutes=8,
    ),
    Competency(
        id="COMP-FE-A11Y",
        name="Web Accessibility (WCAG 2.2) & UI Engineering",
        description="Accessible semantic trees, keyboard navigation traps, ARIA semantics, and responsive design systems.",
        importance=0.85,
        must_have=True,
        claimed_in_resume=False,
        rubric_criteria=[
            "Ensures full WCAG 2.2 AA keyboard navigation and screen reader support",
            "Applies robust token-based design systems and responsive breakpoints",
            "Demonstrates automated and manual accessibility testing workflows",
        ],
        target_bloom_level=3,
        estimated_minutes=6,
    ),
    Competency(
        id="COMP-FE-PERF",
        name="Browser Runtime Performance & Web Security",
        description="Main-thread profiling, memory leak detection, CSP headers, XSS prevention, and CORS policies.",
        importance=0.80,
        must_have=False,
        claimed_in_resume=True,
        rubric_criteria=[
            "Diagnoses browser frame drops and layout thrashing using DevTools",
            "Secures frontend applications against XSS and CSRF vectors",
            "Implements secure token storage and session hygiene",
        ],
        target_bloom_level=4,
        estimated_minutes=6,
    ),
]


def generate_blueprint_from_jd(
    role_id: str,
    role_title: str,
    jd_text: str,
    resume_text: Optional[str] = None,
) -> Blueprint:
    """
    Parses JD and candidate resume into a calibrated interview blueprint.
    Uses AI generation with multi-model failover, and falls back to role archetype libraries.
    """
    blueprint_id = f"BP-{uuid.uuid4().hex[:8].upper()}"

    # 1. Attempt AI Competency Extraction
    extracted_competencies = _extract_competencies_via_llm(role_title, jd_text, resume_text)
    if extracted_competencies and len(extracted_competencies) >= 3:
        if resume_text:
            lower_resume = resume_text.lower()
            for comp in extracted_competencies:
                comp_terms = comp.name.lower().replace("&", " ").replace("/", " ").split()
                if any(term in lower_resume for term in comp_terms if len(term) > 3):
                    comp.claimed_in_resume = True
                for crit in comp.rubric_criteria:
                    crit_terms = crit.lower().replace("&", " ").replace("/", " ").split()
                    if sum(1 for term in crit_terms if len(term) > 3 and term in lower_resume) >= 2:
                        comp.claimed_in_resume = True
        total_minutes = sum(c.estimated_minutes for c in extracted_competencies)
        return Blueprint(
            id=blueprint_id,
            role_id=role_id,
            role_title=role_title,
            target_duration_minutes=total_minutes,
            competencies=extracted_competencies,
            recruiter_edited=False,
        )

    # 2. Fallback to Role Archetype Library
    title_lower = role_title.lower()
    if any(k in title_lower for k in ["frontend", "react", "ui", "web", "next.js"]):
        base_library = FRONTEND_COMPETENCIES
    else:
        base_library = DEFAULT_BACKEND_COMPETENCIES

    competencies = [c.model_copy(deep=True) for c in base_library]

    # Adjust must-have claims if resume text contains relevant keywords
    if resume_text:
        lower_resume = resume_text.lower()
        for comp in competencies:
            comp_terms = comp.name.lower().split()
            if any(term in lower_resume for term in comp_terms if len(term) > 3):
                comp.claimed_in_resume = True

    total_minutes = sum(c.estimated_minutes for c in competencies)

    return Blueprint(
        id=blueprint_id,
        role_id=role_id,
        role_title=role_title,
        target_duration_minutes=total_minutes,
        competencies=competencies,
        recruiter_edited=False,
    )


def _extract_competencies_via_llm(
    role_title: str,
    jd_text: str,
    resume_text: Optional[str],
) -> Optional[List[Competency]]:
    """Invokes LLM Gateway to generate structured, role-specific competencies."""
    prompt = (
        f"You are the Lead Architect on the Provenance technical interview platform.\n"
        f"Analyze the Target Role Title, Job Description, and Candidate Resume to generate 3 to 4 core competencies for this specific interview.\n\n"
        f"Role Title: {role_title}\n"
        f"Job Description: {jd_text[:1200]}\n\n"
    )
    if resume_text:
        prompt += f"Candidate Resume: {resume_text[:1500]}\n\n"
    else:
        prompt += "Candidate Resume: Not provided (set claimed_in_resume based on standard baseline assumptions).\n\n"

    prompt += (
        "Instructions:\n"
        "1. Identify 3 to 4 distinct, rigorous competencies required for this role.\n"
        "2. For each competency, determine if it is a must_have requirement.\n"
        "3. Compare with the Candidate Resume: if the candidate claimed experience or relevant projects for this competency, set claimed_in_resume to true; otherwise false.\n"
        "4. Formulate 3 specific, observable rubric evaluation criteria for each competency.\n"
        "5. Output JSON matching this schema:\n"
        "{\n"
        '  "competencies": [\n'
        "    {\n"
        '      "id": "COMP-UNIQUE-ID",\n'
        '      "name": "Competency Title",\n'
        '      "description": "Short explanation",\n'
        '      "importance": 0.90,\n'
        '      "must_have": true,\n'
        '      "claimed_in_resume": true,\n'
        '      "rubric_criteria": ["criteria 1", "criteria 2", "criteria 3"],\n'
        '      "target_bloom_level": 4,\n'
        '      "estimated_minutes": 8\n'
        "    }\n"
        "  ]\n"
        "}\n"
    )

    result = call_llm_json(
        prompt=prompt,
        system_prompt="You are a principal technical hiring architect. You only return valid JSON matching the requested competency schema.",
        timeout_seconds=7.0,
    )

    if not result or not isinstance(result, dict):
        return None

    raw_comps = result.get("competencies", [])
    if not isinstance(raw_comps, list):
        return None

    parsed: List[Competency] = []
    for item in raw_comps:
        if isinstance(item, dict) and "name" in item:
            try:
                c_id = item.get("id") or f"COMP-{uuid.uuid4().hex[:6].upper()}"
                comp = Competency(
                    id=c_id,
                    name=str(item.get("name")),
                    description=str(item.get("description", "")),
                    importance=float(item.get("importance", 0.9)),
                    must_have=bool(item.get("must_have", True)),
                    claimed_in_resume=bool(item.get("claimed_in_resume", False)),
                    rubric_criteria=[str(rc) for rc in item.get("rubric_criteria", ["Demonstrates practical technical depth"])],
                    target_bloom_level=int(item.get("target_bloom_level", 4)),
                    estimated_minutes=int(item.get("estimated_minutes", 8)),
                )
                parsed.append(comp)
            except Exception as e:
                logger.warning(f"Error parsing competency item: {e}")

    return parsed if len(parsed) >= 2 else None
