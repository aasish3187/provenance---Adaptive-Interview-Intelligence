# RESPONSIBLE AI & COMPLIANCE

Not legal advice. Have counsel review before selling to employers. This file is also what you show judges for the
"Security, Privacy & Responsibility" and "Evidence & Explainability" criteria.

## 1. Legal landscape (from research; verify current status before relying on it)
- **EU AI Act:** employment/recruitment AI is classed high-risk: risk management, data quality, transparency, human oversight, documentation/logging.
  Sources disagree on timing: one 2026 source reports the high-risk employment obligations now applying from 2 Dec 2027 after a simplification agreement;
  others still cite August 2026. **Check the Official Journal / Commission page before quoting a date.**
- **NYC Local Law 144:** automated employment decision tools need an independent annual bias audit, a published summary, and candidate notice.
- **Illinois AI Video Interview Act:** notice, explanation, consent and limits on sharing for AI analysis of video interviews. Illinois BIPA (biometrics) is the big litigation risk: another reason we never store face data.
- **Illinois Human Rights Act AI provision (effective 1 Jan 2026), Colorado AI Act:** discrimination-effect and notice/appeal duties for high-risk systems (Colorado's obligations are reported as taking effect in 2026; verify).
- **US EEOC guidance & discrimination law (Title VII, ADA, ADEA):** apply to AI tools regardless of AI-specific compliance.
- **India (your home market):** consult counsel on the Digital Personal Data Protection Act and sector rules; this was not researched in depth here.

## 2. Design commitments (map each to a feature + test)
| Commitment | Implementation |
|---|---|
| Disclose AI use & obtain consent | Consent screen before any capture; stored consent record with text version |
| Human in the loop | No auto-reject; decision record requires human actor + reason; audit log |
| Explainability | Evidence ledger; WhyCards; dossier citation validator |
| Observation vs conclusion | Integrity UI split "Detected" / "For human review"; benign explanations |
| Right to human review | Candidate-visible request button → creates a task for recruiter |
| Data minimization | No raw video stored; face detection on-device returns counts only; retention default 30 days; delete endpoint |
| Bias controls | Redacted evaluator input; rubric anchoring; counterfactual tests (swap name, gender cues, accent-neutral text); disparity report |
| Accessibility & fairness to non-native speakers | Communication scored on content clarity, not accent; text mode equal-class; extra-time option |
| Security | Ephemeral browser tokens, RLS multi-tenancy, secrets manager, signed expiring invite links, injection defenses |

## 3. What we deliberately do NOT build (and say so on stage)
Emotion/affect recognition, face recognition, gaze-based "attention scoring" as a decision input, personality typing, auto-ranking people, scoring appearance/voice timbre.
Optional head-pose/look-away may exist as a *low-weight, off-by-default* presence signal only; the default product uses focus/input/presence-count families.
Rationale: weak scientific validity, high false-positive risk, regulatory exposure. (The "verdict" doc you found suggested gaze drift; we narrow it for these reasons.)

## 4. Bias & fairness test plan
1. **Counterfactual pairs:** identical answers with different names/genders/institutions → score deltas must be within noise (set tolerance, e.g. ≤0.05).
2. **Paraphrase robustness:** same content, different fluency/wording → evidence scores stable.
3. **Disparity report:** with synthetic or consented demographic-labelled data, report selection-rate/score ratios per group (the shape NYC-style audits use). Do not collect demographics from real candidates without a legal basis.
4. **Drift monitoring:** track score distributions per prompt/model version; alert on shifts.
5. Publish a **Model & Prompt Card** in the repo: purpose, inputs, limits, known failure modes, version history.

## 5. Integrity false-positive policy
- Every flag lists at least one benign explanation.
- Never combine one family alone into High; High requires ≥2 independent families with corroboration.
- Missing sensors ("camera off") are neutral, not suspicious.
- Reviewer can mark events benign; reviewer actions are logged and feed threshold calibration.

## 6. Incident & failure transparency
Public status page for demo; on AI failure show a plain message and fall back, never silently guess. Log `unverified_evidence_discarded` rate and show it in the Compliance Center.
