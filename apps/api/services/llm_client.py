"""
Provenance — Resilient LLM Inference Gateway.
Supports live Google Gemini 3.8 Flash (primary) and Groq Qwen 3.8 (instant accelerator fallback).
Implements failover hierarchy, circuit-breaking for quota limits, and JSON repair.
"""
from __future__ import annotations

import json
import logging
import re
import time
from pathlib import Path
from typing import Any, Dict, Optional
from apps.api.config import settings

logger = logging.getLogger("provenance.llm_gateway")

# Circuit breaker state for Gemini quota exhaustion (429 / 503)
_BREAKER_FILE = Path(__file__).resolve().parent / ".gemini_breaker"
_gemini_circuit_breaker_until: float = 0.0


def is_gemini_available() -> bool:
    """Returns False if Gemini is currently in circuit breaker cooldown."""
    global _gemini_circuit_breaker_until
    if _BREAKER_FILE.exists():
        try:
            mtime = _BREAKER_FILE.stat().st_mtime
            if time.time() - mtime < 14400.0:  # 4 hours
                return False
        except Exception:
            pass
    return time.time() >= _gemini_circuit_breaker_until


def trip_gemini_circuit_breaker(cooldown_seconds: float = 14400.0) -> None:
    """Trips circuit breaker to instantly route to Groq without delay."""
    global _gemini_circuit_breaker_until
    _gemini_circuit_breaker_until = time.time() + cooldown_seconds
    try:
        _BREAKER_FILE.touch()
    except Exception:
        pass
    logger.info(f"Gemini circuit breaker tripped for {cooldown_seconds}s. Routing instantly to Groq accelerator.")


def call_llm_json(
    prompt: str,
    system_prompt: Optional[str] = None,
    timeout_seconds: float = 6.0,
) -> Optional[Dict[str, Any]]:
    """
    Executes a structured JSON LLM call.
    Attempts Gemini 3.8 Flash (if not circuit-broken) -> Groq Qwen 3.8 -> None.
    Guarantees returning a parsed Dict or None on failure.
    """
    # 1. Primary: Google Gemini 3.8 Flash
    if settings.gemini_api_key and is_gemini_available():
        try:
            from google import genai
            from google.genai.types import HttpOptions, HttpRetryOptions

            client = genai.Client(
                api_key=settings.gemini_api_key,
                http_options=HttpOptions(retry_options=HttpRetryOptions(attempts=1)),
            )
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"System Instructions: {system_prompt}\n\nTask: {prompt}"

            response = client.models.generate_content(
                model=getattr(settings, "gemini_model_flash", "gemini-3.8-flash"),
                contents=full_prompt,
                config={"response_mime_type": "application/json"},
            )
            raw_text = response.text.strip() if response.text else ""
            if raw_text:
                parsed = _safe_extract_json(raw_text)
                if parsed:
                    return parsed
        except Exception as e:
            err_str = str(e)
            logger.warning(f"Primary Gemini JSON inference failover triggered: {err_str[:120]}")
            if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                trip_gemini_circuit_breaker(14400.0)  # 4-hour quota cooldown
            elif "503" in err_str:
                trip_gemini_circuit_breaker(60.0)

    # 2. Secondary: Groq Cloud Accelerator (Qwen 3.8 / 500+ tok/s)
    if settings.groq_api_key:
        try:
            from groq import Groq
            base_url = getattr(settings, "groq_base_url", "https://api.groq.com")
            if base_url.endswith("/openai/v1"):
                base_url = base_url.replace("/openai/v1", "")
            groq_client = Groq(api_key=settings.groq_api_key, base_url=base_url)

            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": f"{system_prompt}. Return strict JSON."})
            else:
                messages.append({"role": "system", "content": "You are a JSON-only intelligence engine. Return strict JSON."})
            messages.append({"role": "user", "content": prompt})

            groq_res = groq_client.chat.completions.create(
                model=getattr(settings, "groq_model", "qwen/qwen3.8-27b"),
                messages=messages,
                response_format={"type": "json_object"},
                temperature=0.2,
                timeout=timeout_seconds,
            )
            groq_text = groq_res.choices[0].message.content or ""
            if groq_text:
                parsed = _safe_extract_json(groq_text)
                if parsed:
                    return parsed
        except Exception as ge:
            logger.warning(f"Secondary Groq JSON inference failed: {ge}")

    return None


def call_llm_text(
    prompt: str,
    system_prompt: Optional[str] = None,
    max_tokens: int = 150,
    timeout_seconds: float = 5.0,
) -> Optional[str]:
    """
    Executes a fast natural language text generation LLM call.
    Attempts Gemini 3.8 Flash (if not circuit-broken) -> Groq Qwen 3.8 -> None.
    """
    # 1. Primary: Google Gemini 3.8 Flash
    if settings.gemini_api_key and is_gemini_available():
        try:
            from google import genai
            from google.genai.types import HttpOptions, HttpRetryOptions

            client = genai.Client(
                api_key=settings.gemini_api_key,
                http_options=HttpOptions(retry_options=HttpRetryOptions(attempts=1)),
            )
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"

            response = client.models.generate_content(
                model=getattr(settings, "gemini_model_flash", "gemini-3.8-flash"),
                contents=full_prompt,
            )
            raw_text = response.text.strip().strip('"').strip("'") if response.text else ""
            if raw_text and len(raw_text) > 10:
                return raw_text
        except Exception as e:
            err_str = str(e)
            logger.warning(f"Primary Gemini text inference failover triggered: {err_str[:120]}")
            if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                trip_gemini_circuit_breaker(14400.0)
            elif "503" in err_str:
                trip_gemini_circuit_breaker(60.0)

    # 2. Secondary: Groq Cloud Accelerator (Qwen 3.8 / 500+ tok/s)
    if settings.groq_api_key:
        try:
            from groq import Groq
            base_url = getattr(settings, "groq_base_url", "https://api.groq.com")
            if base_url.endswith("/openai/v1"):
                base_url = base_url.replace("/openai/v1", "")
            groq_client = Groq(api_key=settings.groq_api_key, base_url=base_url)

            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            groq_res = groq_client.chat.completions.create(
                model=getattr(settings, "groq_model", "qwen/qwen3.8-27b"),
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.3,
                timeout=timeout_seconds,
            )
            raw_text = groq_res.choices[0].message.content or ""
            raw_text = raw_text.strip().strip('"').strip("'")
            if raw_text and len(raw_text) > 10:
                return raw_text
        except Exception as ge:
            logger.warning(f"Secondary Groq text inference failed: {ge}")

    return None


def _safe_extract_json(text: str) -> Optional[Dict[str, Any]]:
    """Safely extracts JSON even if surrounded by markdown code fences."""
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass
        first_brace = text.find("{")
        last_brace = text.rfind("}")
        if first_brace != -1 and last_brace > first_brace:
            try:
                return json.loads(text[first_brace : last_brace + 1])
            except Exception:
                pass
    return None
