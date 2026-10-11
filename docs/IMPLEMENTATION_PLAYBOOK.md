# Provenance — Implementation Playbook

**Purpose:** turn the existing PRD and architecture into a build sequence a five-person team can execute in Antigravity, while making the product unusually clear, polished, traceable, and easy to navigate.

## 1. Product decision

Provenance is a **recruiter-led, evidence-driven interview workspace**. It is not an autonomous hiring decision maker, an emotion detector, a personality assessor, or a proctor that accuses candidates.

Its advantage is not “AI asks interview questions.” The distinctive product experience is that the system adapts based on competency uncertainty, explains every question, and lets the recruiter inspect the source behind every finding.

### Non-negotiable principles

1. **Evidence before opinion:** every scored claim must cite a verified transcript span. Verify in code; discard and log unsupported evidence.
2. **Observation is not a conclusion:** integrity signals are events for review, never a cheating verdict.
3. **No overall hire score:** show competency-specific evidence, uncertainty, coverage, and gaps.
4. **Human stays in control:** recruiter edits the blueprint and makes all consequential decisions.
5. **Candidate content is untrusted data:** prompt injection attempts cannot change system instructions, rubrics, or scoring logic.
6. **Math lives in code; language lives in the model:** coverage, probability updates, difficulty, gap classes, and integrity aggregation are deterministic and tested.
7. **Text is a first-class mode:** voice adds convenience; it must not become a barrier or a reason for a worse evaluation.
8. **Privacy is visible:** explain what is collected and why; camera signals are off unless explicitly configured and separately consented to; no raw video is stored.

## 2. Definition of done

A release is not “done” because the page looks right. The deployed application must complete this flow end-to-end:

1. Recruiter creates a role and supplies a job description plus synthetic resume.
2. Blueprint builder extracts target competencies, resume claims, must-haves, and duration.
3. Recruiter reviews and edits the blueprint before inviting the candidate.
4. Candidate opens a signed invite link, sees AI disclosure and consent, and can choose text mode.
5. Candidate answers questions. The system appends timestamped transcript segments.
6. The evaluator returns schema-valid evidence. Code verifies each quote against the canonical transcript.
7. The ledger and deterministic competency state update; the planner selects the next question and creates a WhyCard.
8. The skill-gap matrix reflects claims and interview evidence, including ambiguity and not-tested status.
9. The dossier shows strengths, risks, unknowns, and follow-up questions. Every sentence/findings chip opens its proof in the transcript.
10. Audit events are recorded; synthetic evaluation checks pass; the deployed demo can be reset and replayed without external AI calls.

**First objective:** a public URL and a complete text-only journey. Only then deepen voice, integrity, and visualizations.

## 3. Experience direction: Quiet Intelligence

### What should feel different

Many AI tools lead with a chat box, opaque scores, and dense dashboards. Provenance should lead with **what is known, what is still uncertain, and the evidence that supports it**.

Signature interaction: **Proofline** — a click-through chain:

`Question → Candidate quote → Rubric criteria → Skill estimate change → Recruiter finding`

The recruiter should not have to trust a sentence. They should be able to open its proof in one click, inspect context, then close the evidence panel without losing their place.

### Product language

Use plain language: “Evidence found,” “Still needs validation,” “Not assessed,” “Signal to review,” and “Why this question.” Avoid “cheating probability,” “perfect candidate,” “bad candidate,” “culture fit,” or claims about personality/emotion.

## 4. Architecture and implementation boundaries

Use the proposed monorepo and retain the separation between the fast conversation lane and the slower reasoning lane.

```text
/apps/web                 Next.js App Router, TypeScript, UI, candidate/recruiter experiences
/apps/api                 FastAPI, Pydantic v2, orchestration, business rules, AI calls
/packages/schemas         Shared JSON schemas and generated TS types
/docs                     PRD, architecture, UI spec, implementation docs
/evals/golden             Synthetic transcripts, labelled expected outcomes
/evals/runner             Repeatability, quote checks, fairness counterfactuals, integrity suites
/infra                    Cloud Run, database, secret and CI/CD configuration
```

### Runtime lanes

- **Conversation lane:** browser audio capture/playback and Gemini Live session. It handles conversational responsiveness; it must not create competency scores or make independent hiring judgments.
- **Reasoning lane:** FastAPI state machine runs after each finalized answer: guard → evaluator → quote verification → ledger update → deterministic state update → next-best-question planner → WhyCard.
- **Fallback lane:** text interview executes the exact same evaluation/orchestration path. If the Live API drops, show a clear banner and continue in text mode.
- **Demo lane:** an explicit synthetic replay mode runs a pre-recorded interview through the same UI state transitions without network/model calls. It must be clearly labelled as demo data.

### Integration contracts

Agree on Pydantic schemas and websocket event names before parallel agents build independently. Every response includes `schema_version`, stable IDs, and timestamps. All database mutations go through Alembic migrations. Use idempotency keys for writes and org-scoped authorization for reads/writes.

Suggested first endpoints:

- `GET /healthz`
- `POST /roles` — create role and save JD metadata
- `POST /roles/{role_id}/blueprint` — build or regenerate proposed blueprint
- `PATCH /roles/{role_id}/blueprint` — save recruiter edits
- `POST /interviews` — create interview and expiring signed invite
- `POST /interviews/{id}/consent` — save consent version and choice
- `POST /interviews/{id}/answers` — accept finalized text answer (and idempotency key)
- `GET /interviews/{id}` — fetch safe interview state
- `WS /interviews/{id}/stream` — transcript, question, profile delta, coverage, and integrity metadata events
- `GET /interviews/{id}/dossier`
- `GET /interviews/{id}/evidence/{evidence_id}`
- `POST /interviews/{id}/review` — human review and note
- `POST /candidates/{id}/deletion-request`

Keep a live list of contract changes in `docs/API_CONTRACTS.md` before implementing cross-agent integrations.

## 5. Build order and release gates

Dates in the original plan are relative to kickoff. Preserve the order if timing changes.

### Phase 0 — Repo, contracts, and deployment (D0–D1)

**Build:** repository skeleton; root `AGENTS.md`; `.agents/rules`; shared schema location; env example; Postgres migrations; `make dev`, `make test`, `make check`; CI; minimal Next.js page; minimal FastAPI `/healthz`; initial public Cloud Run deployment for both services.

**UI task:** write and implement tokens before screens. Create the app shell with responsive nav, empty states, loading states, and error states. No page should be an unstyled placeholder.

**Exit gate:** public site loads; `/healthz` returns healthy; CI is green; no secrets in repo; developer setup is documented.

### Phase 1 — Design system and static product skeleton (D1–D2)

Implement the UI Design Spec before complex features. Build reusable components and these routes with realistic **synthetic fixture data only**:

- recruiter dashboard
- blueprint studio
- candidate consent/lobby
- candidate text interview room
- recruiter observer room
- dossier with evidence drawer

This is not permission to fake a production workflow. Fixture data must live under an explicit demo/evaluation module and be visibly marked as demo data. Production API failures show a proper error/retry state, not a fabricated successful result.

**Exit gate:** responsive navigation works; design tokens are the only source of colors/spacing; keyboard-only flow succeeds; Playwright screenshots captured at desktop and mobile widths.

### Phase 2 — Text interview vertical slice (D2–D4)

**Build:** role upload/create; blueprint extraction; editable competencies and priorities; signed candidate invite; consent logging; text interview question/answer loop; transcript segments; persistence; a basic dossier. Use a provider adapter for Gemini so tests can use a deterministic stub.

**Exit gate:** a new user who has never seen the repo can complete an entire 10-minute synthetic text interview on the deployed URL and open the resulting dossier.

### Phase 3 — Evidence quality and adaptive loop (D4–D7)

**Build:** typed evaluator output; exact quote-span verification; invalid evidence discard + log; rubric criteria hits/misses; Beta-state updates; next-best-question selection; difficulty ladder; coverage guard; WhyCard; prompt-injection fixtures.

**Exit gate:** 100% of stored evidence has a verified quote; every question has a reason; the strong/weak/bluffer synthetic paths demonstrate expected adaptation; repeated scoring is stable within the project's release tolerance.

### Phase 4 — Reality Matrix and Proofline dossier (D6–D9)

**Build:** skill statuses; required-but-absent overlay; ambiguous/conflicting evidence state; transcript/evidence cross-links; strengths, concerns, unknowns, and follow-ups; export-safe dossier format (JSON first, then PDF).

**Exit gate:** every finding opens the precise quote + timestamp + rubric context; an untested skill is never labelled “not demonstrated”; dossier validator rejects uncited sentences.

### Phase 5 — Integrity signals (D8–D11)

Start with the browser events that do not require camera access: visibility/tab change, window blur, fullscreen exit, paste size and timing. Store facts and timestamps, aggregate deterministically, and display neutral explanations. Camera face-count is a separate feature flag requiring explicit notice/consent; process locally, never upload frames, and store counts only. If browser/device support is missing, mark the sensor unavailable—never penalize the candidate.

**Exit gate:** scripted benign events never exceed Low review priority; three independent corroborating families can produce a higher review priority with the underlying events shown; no output calls the person a cheater.

### Phase 6 — Voice lane (D9–D13)

First inspect current official Gemini Live API docs and account availability. Pin model IDs in `config/models.yaml`, not code. Use short-lived/ephemeral client tokens from an authenticated backend when the browser connects directly. Keep the backend responsible for the evidence ledger, scoring, question selection, and audit. Test transcripts and timestamps; handle barge-in, reconnect, denied microphone, model/session expiration, and quota/network failure.

**Exit gate:** voice interview works in two tested browsers; candidate can always switch to text; all speech answers use the same quote-verification/evaluation path; p50/p95 are measured and displayed in internal diagnostics.

### Phase 7 — Security, fairness, accessibility, and demo hardening (D12–D18 or final week)

**Build:** 12+ golden candidates; 20 injection variants; name-swap and content-equivalent counterfactuals; accent/grammar-sensitive checks; org authorization tests; delete workflow; event audit trail; 20-session load test; reduced-motion, contrast, keyboard and screen-reader checks; budget limits; demo replay; error/empty states; responsive polish; README and architecture diagram.

**Exit gate:** all agreed CI gates pass, deployed URL works repeatedly, demo reset/replay is tested, two full dry runs complete without manual database edits.

## 6. Five-person work split

| Role | Ownership | Do not overlap on |
|---|---|---|
| R1 — Tech lead / orchestration | contracts, state machine, planner, ledger invariants, mission sequencing, integrations | avoid editing web components while R3/R4 own them |
| R2 — Backend / deployment | API, DB, migrations, auth/org scope, Cloud Run, CI/CD, logs | no unilateral schema changes after contract freeze |
| R3 — Candidate room / voice | consent, candidate interview, audio/text controls, transcript UI, fallback | no independent backend contract changes |
| R4 — Recruiter product / design system | tokens, dashboard, blueprint, observer, Reality Matrix, dossier | no one-off color systems or bespoke primitives outside spec |
| R5 — Evaluation / responsible AI / QA | golden candidates, metrics, prompt injection, integrity calibration, a11y, demo runbook | synthetic evaluation only; no real candidate data in fixtures |

Pair R1 + R2 on schemas before parallel work. R3 and R4 can work in parallel after the component tokens and API events are agreed. R5 should write tests and acceptance criteria alongside each feature, not at the end.

## 7. Antigravity working protocol

For every mission:

1. Instruct the agent to read `AGENTS.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/UI_DESIGN_SPEC.md`, and the current mission's relevant references.
2. Ask for a concise implementation plan artifact before changes. Require explicit approval before schema, DB, security, or architectural changes.
3. Keep each mission vertical and bounded to named folders. Use parallel agents only for disjoint folders after API contracts are frozen.
4. Ask for implementation plus tests; do not accept “done” without command output.
5. Require `make check`, Playwright tests where appropriate, screenshots or browser recording for UI, and a short list of risks/unimplemented items.
6. Review every diff, especially authorization, prompt construction, score logic, retention, camera, and secrets.
7. Commit after a green check. Do not stack multiple unreviewed agent changes.

Google Antigravity supports persistent workspace rules and artifact-oriented agent workflows; exact menu labels differ between the IDE and standalone 2.0 experience. See official references in `docs/REFERENCES.md`.

## 8. Core technical choices

- **Frontend:** Next.js App Router, TypeScript strict mode, Tailwind using CSS tokens, accessible primitives, icon set from Lucide. Prefer a small, consistent component library over many custom components.
- **Backend:** Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, Alembic, pytest, Ruff, mypy.
- **Orchestration:** typed finite-state machine first; LangGraph is acceptable if it improves traceability, but keep the core deterministic transition logic visible and testable.
- **Database:** PostgreSQL; use pgvector only for skill/term matching if semantic normalization is needed. Do not use vector search for score math.
- **AI:** provider wrapper for Google GenAI SDK; separate low-latency conversation from slower structured evaluation. Validate all model outputs with Pydantic.
- **Realtime:** WebSocket or SSE for app events, plus Live API WebSocket for audio session. Avoid trying to funnel large raw audio frames through normal REST endpoints.
- **Deployment:** Cloud Run web and API services, database on managed Postgres (or Supabase for a simple early prototype), secrets in environment/Secret Manager. Verify connection pooling and request/session timeouts before public demo.
- **Testing:** pytest, Vitest, Playwright, axe accessibility checks, API contract tests, seeded evaluation runner.
- **Observability:** structured logs with `interview_id`, `turn_id`, `agent_name`, `prompt_version`, latency and outcome. Never log secrets or unnecessary transcript PII.

## 9. MVP versus later scope

### P0 — must work for judging

- deployed recruiter and candidate workflows
- editable blueprint from JD/resume
- consent and text interview
- one adaptive next-question loop with WhyCard
- evidence ledger and verified quote spans
- four-status skill map plus ambiguous state
- integrity timeline for low-risk browser events
- clickable dossier and human review note
- Gemini voice lane with text fallback (when feasible; text fallback cannot be postponed)
- synthetic demo replay and metric dashboard/table

### P1 — after the vertical slice is stable

- polished voice experience and captions
- recruiter co-view, PDF export, saved role templates
- expanded admin/audit panel and retention controls
- additional integrity families after false-positive calibration
- additional locales and question types

### P2 — after hackathon

- coding sandbox, ATS integrations, team SSO, billing, role-template marketplace, pilot operations, formal external fairness/bias audit, penetration test, mobile companion app.

Do not spend the first development week on ATS integrations, billing, role marketplaces, or a complex 3D skill visualization.

## 10. Release metrics

Use the thresholds in `docs/EVALUATION_AND_DEMO.md` as targets, but label them as **internal prototype evaluation**, not proof of real-world fairness or legal compliance. In particular:

- Quote verification in stored evidence: 100%.
- Uncited dossier sentences: 0.
- Identical transcript repeat variance: <= 0.10, with evaluator model/prompt version frozen.
- Must-have competency coverage: >= 90% in the golden set.
- Benign integrity events: never above Low review priority.
- Name-swap twin delta: <= 0.05; content-equivalent accent/grammar tests must be separately inspected and are not settled by one numeric threshold.
- Evaluator p95: <= 4 seconds after finalized answer where model/service conditions permit; report measured results honestly.
- Full end-to-end deployed flow: ten consecutive runs.
- Accessibility: full keyboard flow, visible focus, reduced motion, captions, sufficient contrast, zoom/reflow checks.

## 11. Risks to address early

| Risk | Mitigation / release gate |
|---|---|
| Agent creates polished screens but no end-to-end app | start with public deployed vertical slice; every phase has runnable acceptance flow |
| UI becomes a wall of charts/cards | one primary action per screen; progressive disclosure; evidence panel is contextual |
| LLM invents proof | quote verifier runs after every evaluator output; evidence requires transcript span IDs and character offsets |
| Evaluator score varies between runs | structured rubric, frozen prompt/model version, repeat-run regression; human review for uncertainty |
| Candidate prompt injection | candidate answer stored as data; never concatenate into system instructions; schema validation and injection tests |
| Voice API/model changes or expires | dynamic config, official docs check at mission time, text mode, demo replay |
| Integrity event harms a candidate | neutral event language, contextual alternatives, human review only, benign golden cases |
| Browser camera unavailable or intrusive | camera signal optional, separate permission, local count only, visible off-state, no penalty when unavailable |
| Public demo leaks data or keys | synthetic fixtures only, secret scan, signed invite expiry, no client long-lived key, scoped auth tests |
| Deployment appears available but sessions fail | end-to-end health test, warm instance for demo if budget permits, recorded replay fallback |
| Team agents overwrite each other | folder ownership, contract freeze, reviewed diffs, no parallel overlapping missions |

## 12. Final demo story

Tell one coherent story, not a feature tour:

1. “A resume says Kubernetes. The system doesn’t assume the claim is true—it tests it.”
2. Show the recruiter editing the skill blueprint.
3. Show the candidate informed about AI, data use, and text alternative.
4. Give a shallow answer. Show the `Why this question` card explaining the next probe.
5. Show the evidence added to Proofline with a timestamped, verified quote.
6. Switch tabs once. Show a low-priority, neutral signal with a benign explanation.
7. Show the Reality Matrix: claimed-but-shallow, verified, tested-not-demonstrated, not assessed.
8. Click a dossier sentence. Land on the exact transcript excerpt and criteria.
9. Show injection and repeatability results in the evaluation panel.
10. End with what becomes possible after the hackathon, while distinguishing P1/P2 roadmap features from what works today.

Keep a pre-recorded synthetic replay. If voice or the network fails, explicitly switch to demo replay and continue the same workflow rather than improvising.
