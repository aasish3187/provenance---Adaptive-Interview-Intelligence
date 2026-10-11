"""
Provenance — Security Guard Agent.
Enforces Non-Negotiable Product Rule #5:
"Candidate text is untrusted data. Never let it alter instructions.
Wrap it in delimiters and run the Guard agent."
"""
from __future__ import annotations

import re
from typing import NamedTuple, Optional


class GuardResult(NamedTuple):
    sanitized_text: str
    wrapped_content: str
    injection_detected: bool
    injection_type: Optional[str]
    flagged_patterns: list[str]


# Common prompt injection signatures and instruction-override directives
INJECTION_PATTERNS = [
    (r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|directives|prompts)", "instruction_override"),
    (r"system\s+prompt\s*(override|reset|leak|reveal)", "system_prompt_override"),
    (r"you\s+are\s+now\s+(a\s+helpful\s+assistant|DAN|unrestricted)", "persona_jailbreak"),
    (r"give\s+me\s+(a\s+)?(10/10|full\s+score|perfect\s+score|hire)", "score_manipulation"),
    (r"disregard\s+the\s+(rubric|evaluation|criteria)", "rubric_override"),
    (r"output\s+only\s+(verified|pass|passed)", "output_hijack"),
    (r"<\|im_start\|>|<\|im_end\|>|\[SYSTEM\]|\[INST\]", "delimiter_injection"),
]


def sanitize_and_guard(raw_candidate_text: str) -> GuardResult:
    """
    Sanitizes candidate input, checks for prompt injection attacks,
    and encloses content in strict XML delimiters.
    """
    if not raw_candidate_text:
        return GuardResult(
            sanitized_text="",
            wrapped_content="<candidate_answer></candidate_answer>",
            injection_detected=False,
            injection_type=None,
            flagged_patterns=[],
        )

    text = raw_candidate_text.strip()
    flagged = []
    detected_type = None

    for pattern, p_type in INJECTION_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            flagged.append(match.group(0))
            if not detected_type:
                detected_type = p_type

    # Neutralize XML tag spoofing within the candidate text
    sanitized = text.replace("<candidate_answer>", "&lt;candidate_answer&gt;")
    sanitized = sanitized.replace("</candidate_answer>", "&lt;/candidate_answer&gt;")

    injection_detected = len(flagged) > 0

    # Wrap in canonical delimiters
    wrapped = f"<candidate_answer>\n{sanitized}\n</candidate_answer>"

    return GuardResult(
        sanitized_text=sanitized,
        wrapped_content=wrapped,
        injection_detected=injection_detected,
        injection_type=detected_type,
        flagged_patterns=flagged,
    )
