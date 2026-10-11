"""
Provenance — Dossier Citation Validator Service.
Enforces Non-Negotiable Product Rule #1:
"Every score/claim must link to a verified quote span in the transcript.
Verify quotes in code (normalized substring match). Discard and log unverifiable evidence."

Validates that every claim and evaluative finding in a generated dossier
is backed by a verified Evidence ID in the canonical evidence ledger.
"""
from __future__ import annotations

import re
from typing import Dict, List, NamedTuple, Set


class CitationValidationResult(NamedTuple):
    is_valid: bool
    total_claims_checked: int
    verified_citations_count: int
    uncited_evaluative_sentences: List[str]
    invalid_evidence_ids: List[str]


# Words that indicate an evaluative finding requiring evidence citation
EVALUATIVE_INDICATORS = [
    r"\bdemonstrated\b",
    r"\blacks\b",
    r"\bproficient\b",
    r"\bfailed\b",
    r"\bmastery\b",
    r"\bweakness\b",
    r"\bstrong\b",
    r"\binsufficient\b",
    r"\bstruggled\b",
    r"\bverified\b",
    r"\bexcelled\b",
]


def extract_evidence_citations(text: str) -> List[str]:
    """
    Extracts all citation tokens formatted as [EVID-XXXX] from text.
    """
    return re.findall(r"\[(EVID-[A-Za-z0-9_-]+)\]", text)


def validate_dossier_citations(
    dossier_markdown: str,
    valid_verified_evidence_ids: Set[str],
) -> CitationValidationResult:
    """
    Validates that:
    1. Every [EVID-XXXX] citation maps to an existing, verified evidence record.
    2. Every evaluative finding contains at least one valid citation tag.
    """
    sentences = [
        s.strip()
        for s in re.split(r"(?<!\d)\.(?!\d)|\n+", dossier_markdown)
        if len(s.strip()) > 15
    ]

    cited_ids = extract_evidence_citations(dossier_markdown)
    invalid_ids = [eid for eid in cited_ids if eid not in valid_verified_evidence_ids]

    uncited_sentences: List[str] = []
    evaluative_count = 0

    eval_regex = re.compile("|".join(EVALUATIVE_INDICATORS), re.IGNORECASE)

    for sentence in sentences:
        if eval_regex.search(sentence):
            evaluative_count += 1
            has_valid_citation = False
            for eid in extract_evidence_citations(sentence):
                if eid in valid_verified_evidence_ids:
                    has_valid_citation = True
                    break

            if not has_valid_citation:
                uncited_sentences.append(sentence)

    is_valid = (len(invalid_ids) == 0) and (len(uncited_sentences) == 0)

    return CitationValidationResult(
        is_valid=is_valid,
        total_claims_checked=evaluative_count,
        verified_citations_count=len(cited_ids) - len(invalid_ids),
        uncited_evaluative_sentences=uncited_sentences,
        invalid_evidence_ids=invalid_ids,
    )
