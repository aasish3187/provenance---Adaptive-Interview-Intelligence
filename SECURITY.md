# Security Policy & Responsible Vulnerability Disclosure

## Supported Versions

Provenance actively maintains and patches security issues on the primary branch and current release.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Threat Model & Security Boundaries

Provenance operates as high-stakes interview intelligence software. The primary attack surfaces we harden against include:

1. **Candidate Prompt Injection Attacks**: Adversarial attempts within `<candidate_answer>` delimiters to hijack system prompts, force arbitrary competency ratings (e.g., `10/10`), or extract evaluator rubrics.
2. **Citation Spoofing & Phantom Evidence**: Malicious injection of artificial quote strings designed to deceive quote verifiers without matching verbatim candidate speech.
3. **Telemetry Evasion & False Positives**: Forgery or suppression of browser blur/tab switch events.
4. **Data Sovereignty & Privacy**: Protection against unauthorized retention of raw audio/video streams. Provenance processes audio on-device or ephemerally and retains text transcripts, mathematical posteriors, and verified quotes only.

---

## Reporting a Vulnerability

We take the security and integrity of Provenance seriously. If you discover a potential vulnerability, please report it responsibly:

- **Email**: [provenance-ai@googlegroups.com](mailto:provenance-ai@googlegroups.com)
- **Direct GitHub Contact**: [@aasish3187](https://github.com/aasish3187)

**Please do not report security vulnerabilities through public GitHub issues.**

### What to Include in Your Report:
- A descriptive summary of the vulnerability (e.g., CoMAI delimiter breakout, quote verification bypass).
- Step-by-step reproduction instructions or a minimal Proof of Concept (PoC) scenario (`.json` or curl payload).
- Expected vs. actual behavior.
- Impact assessment and potential mitigations.

### Response Timeline:
- **Initial Acknowledgment**: Within 24 hours.
- **Triage & Assessment**: Within 48 hours.
- **Patch & Release**: Critical security issues will receive high-priority hotfixes and automated regression tests added to `evals/golden/`.

Thank you for helping keep Provenance fair, secure, and resilient for all candidates and evaluators!
