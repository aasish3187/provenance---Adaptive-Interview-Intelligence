import pytest
from apps.api.services.quote_verifier import verify_quote_in_transcript


def test_exact_substring_match():
    transcript = (
        "Hello everyone. When traffic spiked to 10x, our HPA scaled pods based on custom "
        "Prometheus latency metrics rather than default CPU thresholds. It was very stable."
    )
    quote = "our HPA scaled pods based on custom Prometheus latency metrics"
    result = verify_quote_in_transcript(quote, transcript)

    assert result.is_verified is True
    assert result.start_char != -1
    assert result.end_char != -1
    assert transcript[result.start_char : result.end_char] == quote


def test_whitespace_and_newline_variation():
    transcript = (
        "We used sync.Pool\n    to minimize GC pressure in the hot path,\n"
        "and buffered channels with a select-default pattern."
    )
    quote = "We used sync.Pool to minimize GC pressure in the hot path, and buffered channels"
    result = verify_quote_in_transcript(quote, transcript)

    assert result.is_verified is True
    assert result.start_char >= 0
    # The matched slice in the original transcript preserves original whitespace
    matched_text = transcript[result.start_char : result.end_char]
    assert "sync.Pool" in matched_text
    assert "buffered channels" in matched_text


def test_unicode_typographic_quotes_and_dashes():
    transcript = (
        'The candidate said: "We didn’t configure mTLS—assuming the VPC was secure enough."'
    )
    quote = 'We didn\'t configure mTLS - assuming the VPC was secure enough.'
    result = verify_quote_in_transcript(quote, transcript)

    assert result.is_verified is True
    assert result.start_char >= 0
    matched_text = transcript[result.start_char : result.end_char]
    assert "mTLS" in matched_text


def test_repeated_phrases():
    transcript = (
        "First we tested Redis. Redis was fast. Then we tested Postgres. Postgres was durable."
    )
    quote = "Postgres was durable."
    result = verify_quote_in_transcript(quote, transcript)

    assert result.is_verified is True
    assert "Postgres was durable." in transcript[result.start_char : result.end_char]


def test_unverifiable_claim_rejection():
    transcript = (
        "I worked primarily on frontend React components and state management with Redux."
    )
    quote = "I architected high-performance Kubernetes clusters with custom eBPF networking."
    result = verify_quote_in_transcript(quote, transcript)

    # Invariant: Must fail verification and emit reason
    assert result.is_verified is False
    assert result.start_char == -1
    assert result.end_char == -1
    assert result.rejection_reason is not None


def test_empty_quote_or_transcript():
    res1 = verify_quote_in_transcript("", "Some transcript")
    assert res1.is_verified is False

    res2 = verify_quote_in_transcript("Some quote", "")
    assert res2.is_verified is False
