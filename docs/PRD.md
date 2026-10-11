# PRD — Provenance: Adaptive Interview Intelligence

Version 1.0 · Owner: Aasish (Team Lead) · Status: build-ready

## 1. One-line vision
An interview system that reasons about what it has *proven* about a candidate, decides what to ask next and why,
and hands the recruiter a dossier where every claim links back to a verbatim quote and timestamp.

## 2. Problem
1. Fixed interview scripts waste time on what is already proven and miss what is unproven.
2. LLM interview tools often output opaque scores ("7/10") that recruiters cannot defend and regulators will not accept.
3. Resumes claim skills the interview never validates; recruiters cannot see the gap.
4. Cheating/AI-assistance is rising, but naive proctoring accuses innocent candidates.
5. Hiring AI is legally high-risk in many jurisdictions (see compliance file): explanation, human oversight and audit logs are required, not optional.

## 3. Market position (from research)
- Market splits into live AI interviewers, pre-recorded video tools, assessment platforms and interview-intelligence/notetakers.
  One comparison reports only two platforms offer live two-way adaptive conversations and most have no cheating detection.
- HireVue is quote-only pricing (a comparison cites $35,000+/yr enterprise); newer players price per interview,
  some as low as about $1 per interview. Metaview-style tools document interviews but do not run them.
- **Our wedge:** adaptive + evidence-traceable + responsible integrity + recruiter dossier, in one connected loop.
  Competitors do one slice. We connect all five modules and make evidence the spine.

## 4. Users and jobs-to-be-done
| Persona | Job | Success looks like |
|---|---|---|
| Recruiter (primary buyer user) | Screen 50 candidates without watching 50 hours | Dossier in 2 minutes, each claim clickable to a quote |
| Hiring manager | Decide who to advance and what to probe next | Calibrated follow-up questions, unresolved-question list |
| Candidate | Fair, understandable, low-anxiety interview | Knows it is AI, consented, can request human review |
| Admin / compliance | Prove the tool is auditable and fair | Exportable audit log, fairness report, consent records |

## 5. Product principles
1. **Evidence before opinion.** No score without a verified quote span.
2. **Observation ≠ conclusion.** Integrity shows signals for review, never verdicts.
3. **No single number decides a person.** Competency profile + uncertainty, not a rank.
4. **Humans decide.** The system recommends follow-ups; it never auto-rejects.
5. **Explain the next question.** Every question carries a visible reason.
6. **Degrade gracefully.** Voice fails → text. LLM fails → cached rubric fallback. Always a working demo.

## 6. Scope tiers
- **P0 (hackathon MVP, must demo live, deployed):** full vertical slice through all 5 modules, text+voice interview, evidence ledger, reality matrix, integrity timeline (browser signals), dossier.
- **P1 (months 1–2):** coding sandbox, ATS-style role templates, team accounts, recruiter co-view, PDF export, fairness harness, multilingual.
- **P2 (month 3 / commercial):** SSO, ATS integrations (Greenhouse/Lever), billing, SOC2-readiness work, bias-audit pack, Play Store companion app for candidates (hackathon rules offer a publication pathway for winners).

## 7. Functional requirements

### M1 — Question Generation & Interview Adaptation
- FR-1.1 Ingest JD + resume → **Interview Blueprint**: competencies with weights, must-have flags, claimed skills, time budget.
- FR-1.2 Maintain per-competency state: estimate, uncertainty, evidence count, last difficulty.
- FR-1.3 Select next question by utility (importance × uncertainty × claim-verification need × time fit − repetition). See ARCHITECTURE §5.
- FR-1.4 Difficulty ladder (Bloom levels: remember → understand → apply → analyze → evaluate → create) moves up/down on demonstrated performance.
- FR-1.5 Every question emits a `WhyCard`: competency targeted, trigger (e.g. "claimed Kubernetes, weak autoscaling answer"), difficulty, alternatives considered.
- FR-1.6 Coverage guard: no must-have competency is left untested when time ends if avoidable; show coverage ring.
- FR-1.7 Stop rule: all must-haves below uncertainty threshold or time budget reached.
- **Acceptance:** replay on 10 golden candidates shows ≥90% must-have coverage, difficulty tracks performance, 100% of questions have WhyCards.

### M2 — Real-Time Candidate Evaluation
- FR-2.1 Live transcription (voice) with word/segment timestamps; text input as equal-class path.
- FR-2.2 Answer understanding relative to the question asked (rubric-anchored, not free-form vibes).
- FR-2.3 Structured evidence items: `{competency, claim, quote, start_ms, end_ms, score 0–1, confidence, rubric_criteria_hit/missed}`.
- FR-2.4 **Quote verification:** every quote must be an exact substring (after normalization) of the transcript; unverifiable evidence is discarded and logged.
- FR-2.5 Cumulative profile updates after each answer with an explanation of *why the estimate moved*.
- FR-2.6 Evaluate technical, behavioral, communication and role-specific competencies; communication scored on content clarity, never accent or fluency-as-identity.
- FR-2.7 Prompt-injection defense: candidate text is data, never instructions (see Architecture §9).
- **Acceptance:** 100% of stored scores have verified quotes; repeat-run score variance ≤ 0.1 on the golden set; evaluator lag p95 ≤ 4 s.

### M3 — Interview Integrity Intelligence
- FR-3.1 Capture predefined events: tab/visibility change, window blur, fullscreen exit, paste events (size, latency after question), multiple faces (on-device detector count only), face absent, long unexplained silence followed by unusually fluent answer, second-voice flag (optional).
- FR-3.2 Each event: `type, severity (base), detector_confidence, context, t_ms`.
- FR-3.3 Temporal aggregation: debounce, cluster, decay, corroboration across independent signal families.
- FR-3.4 Output **Review Priority** (None / Low / Moderate / High) with an explanation and *benign alternative explanations*; never "cheating probability".
- FR-3.5 Chronological timeline linked to transcript position.
- FR-3.6 Clear UI separation: "Detected" (facts) vs "Needs human review" (interpretation).
- **Acceptance:** benign scenarios (switching tabs to take notes once, brief look-away, dog walks by) must not exceed Low; ≥3 corroborated families escalate; all events traceable.

### M4 — Resume-to-Interview Skill Gap Intelligence
- FR-4.1 Extract skills from JD and resume; normalize to a taxonomy (ESCO/O*NET-style) with semantic matching.
- FR-4.2 Classify each required/claimed skill: 🟢 Verified · 🟡 Claimed, shallow/unvalidated · 🔴 Tested, not demonstrated · ⚪ Not assessed · plus overlay **Required but absent from resume**.
- FR-4.3 Each classification links to evidence IDs; ambiguous evidence is labelled ambiguous, not forced.
- FR-4.4 Role-alignment summary per competency family.
- **Acceptance:** golden-set classification precision ≥85% vs human labels; zero classifications without evidence links except ⚪.

### M5 — Candidate Decision Intelligence
- FR-5.1 Aggregate resume, interview evidence, integrity summary, optional assessments, recruiter notes.
- FR-5.2 Dossier sections: strengths, risks, unresolved questions, role alignment, competency rose with uncertainty bands, suggested follow-ups, evidence appendix.
- FR-5.3 Every sentence in the dossier carries evidence chips (click → transcript at timestamp).
- FR-5.4 No overall hire score. Optional **"Comparison view"** for multiple candidates shows profiles side by side with uncertainty, not a rank.
- FR-5.5 Export PDF + JSON; immutable audit log entry at generation.

### Platform
- Auth + roles (Recruiter, Hiring Manager, Admin, Candidate-by-link), org workspaces, role/JD library, candidate invite links with expiry.
- Consent + AI disclosure screen; candidate can request human review; data deletion request.
- Observability: traces for every agent call; cost and latency dashboards.

## 8. Non-functional requirements
| Area | Target |
|---|---|
| Voice turn latency | first interviewer audio ≤ ~1 s after candidate stops (Live API lane) |
| Evaluator lag | p95 ≤ 4 s from end of answer to profile update |
| Availability for demo | Deployed on managed serverless, health checks, warm instance, text-mode fallback |
| Security | No keys in client or repo; ephemeral tokens for browser→Live API; row-level org isolation; encryption at rest/in transit |
| Privacy | Video never leaves the browser; only event metadata stored; configurable retention (default 30 days); synthetic data in demos |
| Accessibility | WCAG 2.2 AA target; keyboard path through the whole interview; captions always on option |
| i18n | English first; architecture ready for more (voice STT/TTS language per interview) |

## 9. Success metrics
- Hackathon: live deployed demo completes end-to-end ≥10 consecutive times; judges can click any score to its quote in ≤2 clicks.
- Product: recruiter time-to-decision, % dossier claims opened (trust proxy), follow-up question adoption rate, false-positive rate of integrity flags on benign scenarios, repeat-run score variance.

## 10. Business model (for later; validate with real recruiters)
- Per-interview credits (SMB/campus hiring) + annual team plans (enterprise) + compliance/audit add-on.
- Differentiator to sell: "audit-ready by default" (evidence ledger, human-in-the-loop, fairness report).
- Do not claim legal compliance certification; claim "designed to support" and have counsel review.

## 11. Risks
| Risk | Mitigation |
|---|---|
| Live voice flakiness during judging | Text-mode fallback toggle; pre-recorded replay mode; warm deployment |
| LLM hallucinated evidence | Quote verification, schema validation, discard-and-log |
| Candidate bias / unfair scoring | Rubric anchoring, name/identity redaction in evaluator input, counterfactual tests |
| Integrity false accusations | Review-priority framing, benign explanations, no auto-action |
| Scope explosion | P0 vertical slice first; each module ships thin before deep |
| Cost blow-up | Cheap fast model for classification, stronger model only for evaluation/dossier; caching; per-session budget cap |

## 12. Out of scope (explicit)
Emotion/affect recognition, face recognition, personality typing, auto-rejection, scoring accent/appearance, storing raw video.
