# Official tooling references checked for this build kit

**Checked on:** 10 October 2026. Re-check these links at the moment the relevant feature is implemented; AI SDKs, preview APIs, and model IDs can change.

## Google Antigravity

- Google Developers Blog, launch overview (agent-first development platform, Editor and Manager workflows, agent execution across editor/terminal/browser, artifacts): https://developers.googleblog.com/en/build-with-google-antigravity-our-new-agentic-development-platform/
- Official Antigravity Rules docs (workspace/directory rules, `AGENTS.md` support, `.agents/rules` frontmatter and size constraints): https://www.antigravity.google/docs/rules/
- Official Antigravity IDE overview (agents, browser use, tasks, artifacts and recordings): https://www.antigravity.google/docs/ide/overview/
- Antigravity 2.0 overview (standalone manager experience): https://www.antigravity.google/docs/overview

**Practical takeaway:** use persistent `AGENTS.md` rules for invariants and short mission prompts for specific tasks. The menus differ across Antigravity IDE and Antigravity 2.0, so avoid brittle instructions that assume one exact menu location.

## Gemini Live API

- Live API start guide (Google GenAI SDK, bidirectional WebSocket flow, audio and transcription examples): https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk
- Live API ephemeral tokens (client-to-server pattern, constraints, expiration and preview caveat): https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens
- Live API capabilities and limitations: https://ai.google.dev/gemini-api/docs/live-api/capabilities
- Google GenAI SDK libraries page: https://ai.google.dev/gemini-api/docs/libraries

**Implementation caution:** the official start guide available on the check date showed `gemini-3.1-flash-live-preview` as an example model. Treat this as a documentation example, not a guarantee that the model is enabled for your account/region or ideal for production. Verify current model availability, SDK version, pricing, session limits, token expiration and quotas at Mission 11, then pin the choice in `config/models.yaml`. Ephemeral tokens are documented as Preview and still require an authenticated backend that authorizes the intended interview/session.

## Cloud Run

- Official FastAPI deploy quickstart: https://docs.cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-fastapi-service
- Official Cloud Run deployment overview: https://docs.cloud.google.com/run/docs/deploying

**Practical takeaway:** Cloud Run can deploy a FastAPI service from source. Deploy the web and API services deliberately, configure public/private access for each correctly, and test the full flow—not just that the homepage loads. Keep secrets out of the browser bundle and repository. Budget for database hosting, API usage, and an appropriately warm instance for a live demo.

## Product and engineering sources supplied by the team

- `docs/PRD.md` — acceptance requirements and scope tiers.
- `docs/ARCHITECTURE.md` — Evidence Ledger, runtime lanes, state machine and deterministic algorithms.
- `docs/EVALUATION_AND_DEMO.md` — golden candidates, target metrics, five-minute demo.
- Root `AGENTS.md` — non-negotiable product and engineering rules.

This kit is an engineering plan, not legal advice or certification of compliance. The PRD's jurisdiction notes should be revisited with authoritative legislative/regulator sources before any real-world hiring pilot. Say “designed to support auditability and human review,” not “legally compliant,” unless qualified legal counsel has reviewed the deployed product and use case.
