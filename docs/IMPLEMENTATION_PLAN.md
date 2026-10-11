# IMPLEMENTATION PLAN

Exact hackathon dates are "announced separately", so this plan uses relative days (D0 = kickoff). Compress or stretch as needed.
Rule: **a deployed vertical slice by D3, then deepen.** Deployment is mandatory for evaluation.

## Team roles (5 people: 3 x 2nd year, 2 x 3rd year)
| Role | Suggested owner | Owns |
|---|---|---|
| R1 Tech lead + Agent orchestration | Aasish | State machine, Planner (NBQ), ledger invariants, Antigravity mission control, final integration |
| R2 Backend + infra | 3rd year | FastAPI, DB/migrations, auth/orgs, Cloud Run, CI/CD, tokens, observability |
| R3 Interview Room frontend | 2nd year | Voice/text room, Live API client, WhyCard, coverage ring, transcript |
| R4 Recruiter frontend + design system | 2nd year | Tokens, components, Dossier, Reality Matrix, Integrity timeline, Figma-to-code |
| R5 Evaluation, Responsible AI, QA, demo | 3rd/2nd year | Golden set, eval harness, integrity calibration, compliance docs, demo script, test data |
Everyone reviews Antigravity output via its artifacts (plans, diffs, recordings) in their area. Pair R1+R2 on schemas first.

## Phase 0 — Foundations (D0–D1)
- [ ] Repo, monorepo layout, `AGENTS.md`, `.agents/rules`, `Makefile` (`make check`, `make dev`)
- [ ] Shared schemas (Blueprint, Evidence, QuestionDecision, RiskProfile, SkillGapMap, Dossier) in `/packages/schemas`
- [ ] Postgres + migrations, auth stub, health endpoint
- [ ] Deploy "hello" web + api to Cloud Run with CI (prove deployment path day 1)
- [ ] Figma: tokens + 6 hero components from UI spec
**Exit:** public URL live; schemas merged; CI green.

## Phase 1 — Vertical slice, text mode (D1–D4)  ★ the safety net
- [ ] JD + resume upload → Blueprint (Blueprint Builder)
- [ ] Text interview loop: ask → answer → Guard → Evaluator → ledger → Planner → next question + WhyCard
- [ ] Quote verification + Beta updates + coverage ring
- [ ] Minimal dossier page with evidence chips
**Exit:** a stranger can run a full 10-minute text interview on the live URL and get a dossier with clickable evidence.

## Phase 2 — Voice + integrity (D4–D8)
- [ ] Ephemeral token endpoint; Gemini Live API client in browser; barge-in, captions, transcript segments with timestamps
- [ ] Slow-lane → fast-lane question injection; latency budget measured
- [ ] Voice failure auto-fallback to text
- [ ] Integrity sensors (visibility, blur, fullscreen, paste, MediaPipe face count) -> events -> aggregator -> timeline
- [ ] Consent + AI disclosure + human-review request flow
**Exit:** voice interview works on 2 browsers/devices; benign integrity scenarios stay ≤ Low.

## Phase 3 — Intelligence depth (D8–D14)
- [ ] Gap Mapper + Reality Matrix with ambiguity handling
- [ ] Difficulty ladder tuned against golden candidates
- [ ] Dossier Synthesizer with citation validator; PDF/JSON export
- [ ] Recruiter live observer view (read-only, via SSE)
- [ ] Eval harness in CI; metrics dashboard
**Exit:** golden-set targets in EVALUATION met; all five modules connected end to end.

## Phase 4 — Polish + demo hardening (D14–D18 or final week before judging)
- [ ] Figma-faithful UI pass, motion, dark/light, a11y audit (axe + manual keyboard)
- [ ] Demo mode: seeded realistic synthetic candidates, replay mode (no network risk)
- [ ] Load test 20 concurrent sessions; set min-instances; budget caps
- [ ] README, architecture diagram, security/privacy page, 5-min demo rehearsed 3x
**Exit:** two full dry runs on the deployed URL with no intervention.

## Months 2–3 (club journey): make it a product
- Coding sandbox question type (Monaco + sandboxed execution) feeding the same ledger
- Role template marketplace; multilingual STT/TTS; ATS integrations (Greenhouse/Lever)
- Teams, SSO, billing; fairness/bias-audit pack; retention controls; pen-test pass
- Pilot with 3 real recruiters/college placement cells using synthetic or consented data; collect trust metrics
- Candidate companion mobile app (Android/Kotlin if desired) toward the Play Store opportunity for winners

## Working agreement with Antigravity
- One mission per agent; run parallel agents only on disjoint folders (e.g. `/apps/web` vs `/apps/api`) via the Manager view.
- Require plan artifact approval for schema/DB changes; allow "agent decides" review for UI-only work.
- Humans own: schema design, prompts' rubric content, threshold calibration, security review, demo script.

## Risk burn-down checklist (check weekly)
Deployed? text fallback works? quote-verification rate 100%? keys out of repo? golden set green? demo rehearsed?
