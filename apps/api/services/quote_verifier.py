"""
Provenance — Deterministic Quote Verification Engine.
Validates that evaluator-extracted quote claims exist verifiably within canonical transcripts.
In accordance with AGENTS.md Invariant 1:
- Every score/claim must link to a verified quote span in the transcript.
- Verify quotes in code using normalized substring matching.
- Discard and log unverifiable evidence.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Optional, Tuple


@dataclass
class QuoteVerificationResult:
    is_verified: bool
    start_char: int
    end_char: int
    original_matched_text: str
    normalized_quote: str
    rejection_reason: Optional[str] = None


def normalize_text_for_matching(text: str) -> str:
    """
    Normalizes Unicode punctuation, typographic quotes, and whitespace.
    NFKC converts compatibility characters to canonical forms.
    """
    if not text:
        return ""
    # Unicode NFKC normalization
    normalized = unicodedata.normalize("NFKC", text)
    # Standardize typographic quotes and apostrophes
    normalized = re.sub(r"[‘’`´]", "'", normalized)
    normalized = re.sub(r"[“”«»]", '"', normalized)
    # Standardize dashes and hyphens
    normalized = re.sub(r"[—–−]", "-", normalized)
    # Collapse multiple whitespace characters into single space
    normalized = re.sub(r"\s+", " ", normalized).strip()
    return normalized


def _clean_word_tokens(text: str) -> list[str]:
    """Extract lowercased alphanumeric tokens for fuzzy sequence alignment."""
    return re.findall(r"\w+", text.lower(), re.UNICODE)


def verify_quote_in_transcript(
    candidate_quote: str,
    canonical_transcript: str,
) -> QuoteVerificationResult:
    """
    Verifies if candidate_quote appears in canonical_transcript.
    Returns start_char and end_char offsets relative to canonical_transcript.
    """
    if not candidate_quote or not candidate_quote.strip():
        return QuoteVerificationResult(
            is_verified=False,
            start_char=-1,
            end_char=-1,
            original_matched_text="",
            normalized_quote="",
            rejection_reason="Candidate quote is empty",
        )

    if not canonical_transcript or not canonical_transcript.strip():
        return QuoteVerificationResult(
            is_verified=False,
            start_char=-1,
            end_char=-1,
            original_matched_text="",
            normalized_quote=candidate_quote,
            rejection_reason="Canonical transcript is empty",
        )

    # 1. Direct exact substring match
    clean_quote = candidate_quote.strip()
    direct_pos = canonical_transcript.find(clean_quote)
    if direct_pos != -1:
        return QuoteVerificationResult(
            is_verified=True,
            start_char=direct_pos,
            end_char=direct_pos + len(clean_quote),
            original_matched_text=canonical_transcript[direct_pos : direct_pos + len(clean_quote)],
            normalized_quote=clean_quote,
        )

    # 2. Case-insensitive exact substring match
    lower_transcript = canonical_transcript.lower()
    lower_quote = clean_quote.lower()
    lower_pos = lower_transcript.find(lower_quote)
    if lower_pos != -1:
        return QuoteVerificationResult(
            is_verified=True,
            start_char=lower_pos,
            end_char=lower_pos + len(clean_quote),
            original_matched_text=canonical_transcript[lower_pos : lower_pos + len(clean_quote)],
            normalized_quote=clean_quote,
        )

    # 3. Flexible normalized regex match (tolerates whitespace / punctuation variations)
    # Extract clean tokens from the quote
    quote_tokens = re.findall(r"\S+", clean_quote)
    if not quote_tokens:
        return QuoteVerificationResult(
            is_verified=False,
            start_char=-1,
            end_char=-1,
            original_matched_text="",
            normalized_quote=clean_quote,
            rejection_reason="No tokens found in quote",
        )

    # Build regex pattern where whitespace/punctuation between words is flexible
    escaped_tokens = [re.escape(token) for token in quote_tokens]
    # Allow whitespace and optional punctuation between tokens
    pattern_str = r"\s*[\s\.,;!?'\"“”‘’—–-]*\s*".join(escaped_tokens)

    try:
        match = re.search(pattern_str, canonical_transcript, re.IGNORECASE | re.UNICODE)
        if match:
            start_char, end_char = match.span()
            return QuoteVerificationResult(
                is_verified=True,
                start_char=start_char,
                end_char=end_char,
                original_matched_text=canonical_transcript[start_char:end_char],
                normalized_quote=clean_quote,
            )
    except re.error:
        pass

    # 4. Token-level sequence sliding window (robust against internal punctuation/apostrophe normalization)
    quote_words = _clean_word_tokens(clean_quote)
    if not quote_words:
        return QuoteVerificationResult(
            is_verified=False,
            start_char=-1,
            end_char=-1,
            original_matched_text="",
            normalized_quote=clean_quote,
            rejection_reason="No alphanumeric words found in quote",
        )

    # Build regex with escaped words separated by non-word/whitespace characters
    word_pattern = r"\b" + r"[\W_]+".join(re.escape(w) for w in quote_words) + r"\b"
    word_match = re.search(word_pattern, canonical_transcript, re.IGNORECASE | re.UNICODE)
    if word_match:
        start_char, end_char = word_match.span()
        return QuoteVerificationResult(
            is_verified=True,
            start_char=start_char,
            end_char=end_char,
            original_matched_text=canonical_transcript[start_char:end_char],
            normalized_quote=clean_quote,
        )

    # If all match attempts fail, the quote cannot be verified in the transcript
    return QuoteVerificationResult(
        is_verified=False,
        start_char=-1,
        end_char=-1,
        original_matched_text="",
        normalized_quote=clean_quote,
        rejection_reason="Quote could not be found as a substring in the canonical transcript",
    )
