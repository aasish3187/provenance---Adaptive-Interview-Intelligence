# RESEARCH & RESOURCES

Labels: **[found]** = surfaced in this research session and read in snippet form; **[known]** = well-known official resource from general knowledge,
link not re-verified this session (open and check); **[to-verify]** = claim needs confirmation.

## A. Papers (what to steal)
- **CoMAI: Collaborative Multi-Agent Framework for Robust and Equitable Interview Evaluation** [found] — https://arxiv.org/abs/2603.16215
  Steal: centralized finite-state machine; four agents (question generation, security, scoring, summarization); rubric-guided scoring with adaptive difficulty; layered prompt-injection defense. Reported 90.47% accuracy, 83.33% recall, 84.41% candidate satisfaction (self-reported; treat as indicative).
- **JudgeAgent / Agent-as-Interviewer** [found] — https://arxiv.org/abs/2509.02097
  Steal: knowledge-driven question synthesis and target-adaptive difficulty control to find capability boundaries.
- **MAGI: Multi-Agent Guided Interview** [found] — https://arxiv.org/abs/2504.18260
  Steal: navigation agent enforcing a structured tree + judgment agent validating whether an answer satisfies a node + traceable reasoning trace mapping responses to criteria (pattern for rubric nodes).
- **Scaffolding-oriented multi-agent clinical interview training** [found] — https://arxiv.org/pdf/2609.10939
  Steal: separating a conversational agent from a turn-level evaluator that does not leak summative scores.
- Search next (not covered): LLM-as-judge bias/position effects, G-Eval, rubric-based grading reliability, IRT/computerized adaptive testing (CAT) for question selection, structured-interview validity research (I/O psychology), speech-based assessment fairness for accented speech.

## B. Open-source repos to read (do not copy whole products; hackathon rule 6 on original work)
- **andidev30/clair-ai** [found] — https://github.com/andidev30/clair-ai — Gemini Live API voice interviewer, Python/FastAPI AI service + Go API + UI on Cloud Run; recruiter-created sessions, candidate link. Study its 3-service split and Live API usage.
- **MTahaRF/interview_agent** [found] — https://github.com/MTahaRF/interview_agent — LiveKit Agents (Node) + Gemini 2.5 Flash + Silero VAD; conversation_log output.
- **LiveKit + Maxim interview agent tutorial** [found] — https://www.getmaxim.ai/blog/build-an-ai-interview-voice-agent-with-livekit-maxim/ — LiveKit agents with Gemini realtime, observability via Maxim.
- **Cerebras LiveKit interviewer cookbook** [found] — https://inference-docs.cerebras.ai/cookbook/agents/livekit.md — resume + JD personalized mock interviewer, fast inference.
- **DEV: real-time AI interview agent with voice** [found] — https://dev.to/navyabuilds/building-a-real-time-ai-interview-agent-with-voice-5dm — lessons: voice differs from chat, tune turn detection, real-time scoring, code challenges.
- Agent setup kit for Antigravity/Codex/Claude Code [found] — https://github.com/TheThirdRail/coding-agent-setup — skills/rules/workflow installers.

## C. Antigravity (building tool)
- Setup & AGENTS.md/GEMINI.md/.agents guidance [found] — https://thepromptshelf.dev/blog/google-antigravity-agents-md-rules-guide-2026
  Key facts reported: Rules (standing instructions), custom agent.md files, SKILL.md skills (workspace `.agents/skills/<name>/SKILL.md` or global); AGENTS.md read since IDE 1.20.5; GEMINI.md takes precedence; **12,000 characters per rule/workflow file**; global rules in `~/.gemini/GEMINI.md`.
- Setup guide (autonomy levels, review policy, Manager view basics) [found] — https://petronellatech.com/blog/google-antigravity-ide-setup-guide-2026/
- Cross-tool AGENTS.md layout example [found] — https://makerkit.dev/docs/md/next-supabase-turbo/installation/ai-agents (nested AGENTS.md is opt-in: Settings → Agent → Load nested AGENTS.md files)
- Skills install path example [found] — https://docs.coingecko.com/docs/ai-agent-hub/antigravity
- Official Antigravity docs: search "Google Antigravity documentation" and confirm install, models and quotas yourself [to-verify]. Free-tier limits change.

## D. Voice and agent stack
- **Gemini Live API (WebSockets guide)** [found] — https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket
  Reported: stateful bidirectional WebSocket streaming; ephemeral tokens recommended for client-side; the page's examples use `gemini-3.1-flash-live-preview`; another source notes Live model availability varies by project/rollout. **Always read current docs and pin from config.**
- LangGraph vs Google ADK comparisons [found] — https://fast.io/resources/google-adk-vs-langgraph-agentic-orchestration/ , https://www.raftlabs.com/blog/ai-agent-framework-comparison
  Takeaway: LangGraph = explicit stateful graphs, strongest control/observability (our FSM fit); ADK = code-first, native Google Cloud/Vertex path. Either works; pick one and stay consistent.
- LiveKit Agents docs [known] — https://docs.livekit.io/agents/ (alternative to raw Live API if you need rooms, telephony later)
- google-genai Python SDK, Pydantic structured output [known] — https://ai.google.dev/gemini-api/docs
- MediaPipe Face Detector (on-device) [known] — https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector
- Silero VAD [found via LiveKit repo] — https://github.com/snakers4/silero-vad [known]
- Langfuse (LLM tracing/evals) [known] — https://langfuse.com ; OpenTelemetry [known] — https://opentelemetry.io

## E. Skills taxonomies & semantic matching
- O*NET (US occupational skills) [known] — https://www.onetcenter.org/database.html
- ESCO (EU skills/occupations) [known] — https://esco.ec.europa.eu
- Sentence embeddings via Hugging Face (e.g. BGE or MiniLM families, or Gemini embeddings) [known]; **I did not search Hugging Face in this session**, so pick and benchmark models yourselves on a small labelled skill-matching set.

## F. Compliance & fairness
- AI hiring regulation overviews [found] — https://brighthire.com/?p=15906 , https://www.acquiretm.com/blog/ai-hiring-regulations-guide/ , https://dev.to/multigrid/employment-law-and-ai-in-hiring-pbf
- EU AI Act text and timeline [known] — https://artificial-intelligence-act.eu and the European Commission AI Act page; check the *current* high-risk dates (sources conflict).
- NYC DCWP AEDT page (Local Law 144) [known] — search "NYC DCWP automated employment decision tools".
- Fairlearn / AIF360 for disparity metrics [known] — https://fairlearn.org , https://github.com/Trusted-AI/AIF360

## G. Market (positioning)
- Platform categories & pricing ranges [found] — https://fabrichq.ai/blogs/best-ai-interview-platforms-compared-2026 (note: vendor-authored, may favour its own product)
- HireVue alternatives & 2026 acquisition of Hireguide tech [found] — https://www.socialtalent.com/?p=95600 (vendor-authored)
- 10-platform comparison incl. Metaview/BrightHire ratings [found] — https://www.hackerearth.com/blog/best-ai-interview-tools (vendor-authored)
All three are vendor blogs; validate claims by talking to 5 real recruiters before pitching numbers.

## H. UI/UX resources
- Figma Variables & Dev Mode docs [known]; shadcn/ui [known] https://ui.shadcn.com ; Framer Motion [known] https://motion.dev ; visx [known] https://airbnb.io/visx ; Lucide icons [known] https://lucide.dev ; Google Fonts: Instrument Serif, Inter, JetBrains Mono [known]; WCAG 2.2 [known] https://www.w3.org/TR/WCAG22/ ; Radix primitives for accessible components [known].

## What this research did NOT cover
Hugging Face model/datasets search; academic work on CAT/IRT and LLM-judge reliability; DPDP (India) specifics; hands-on verification of every link; pricing of Gemini/Live API (check Google's pricing page for budget caps). Ask for a second research pass on any of these.
