# Contributing to Provenance

First off, thank you for considering contributing to **Provenance — Evidence-Driven Adaptive Interview Intelligence**!

Provenance is built for the **Google Student Club Welcome Hackathon 2026** (Track 03: Adaptive Interview Intelligence). Our mission is to eliminate black-box AI hallucinations in technical hiring through deterministic quote verification, Bayesian competency modeling, and transparent human-in-the-loop decision-making.

---

## 🏛️ Repository Architecture

Provenance is organized as a monorepo containing three core packages:

```
├── apps/
│   ├── api/                 # FastAPI REST & WebSocket Backend (Python 3.10+)
│   │   ├── domain/          # Pydantic v2 schemas, competency definitions
│   │   ├── routers/         # Auth, roles, candidates, interviews, voice, audit
│   │   ├── services/        # Bayesian Beta engine, NBQ planner, quote verifier, CoMAI sandbox
│   │   └── tests/           # 38 unit & integration pytest suites (100% green)
│   └── web/                 # Next.js 14 App Router Frontend (React, TypeScript, Tailwind)
│       ├── app/             # App Router pages (/recruiter, /interview, /settings)
│       ├── components/      # Proofline drawer, 3D audio orb, reality matrix
│       └── lib/             # API client, WebSocket hooks, state stores
├── evals/
│   ├── golden/              # G1–G12 benchmark candidate scenarios (.json)
│   └── runner.py            # Automated release gates & counterfactual test harness
├── photos/                  # UI showcase assets & documentation screenshots
└── docs/                    # Workflow diagrams and architecture specifications
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** (Node.js 20 LTS recommended)
- **Git**

### 2. Environment Setup
Copy the sample environment file and configure your keys:
```bash
cp .env.example .env
```
Key variables:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8001
CORS_ORIGINS=http://localhost:3000,https://provenance-adaptive-interview-intel.vercel.app
DATABASE_URL=sqlite:///./provenance.db
```

### 3. Backend Setup (FastAPI)
```bash
cd apps/api
pip install -r requirements.txt
python -m uvicorn apps.api.main:app --port 8001 --reload
```
Interactive OpenAPI / Swagger docs: [http://localhost:8001/docs](http://localhost:8001/docs)

### 4. Frontend Setup (Next.js 14)
```bash
cd apps/web
npm install
npm run dev
```
Web Application: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing & Golden Gates

Before submitting any Pull Request, ensure all test suites pass with zero regressions:

### Run Backend Unit & Integration Tests
```bash
python -m pytest apps/api/tests -v
```

### Run Golden Benchmark Suite (G1–G12)
```bash
python -m evals.runner
```
**Invariants that MUST pass:**
1. `quote_verification_pass_rate_pct == 100.0%`
2. `g5_injection_neutralized == True`
3. `counterfactual_name_delta <= 0.05`
4. `uncited_evaluative_sentences == 0`

### Build Frontend
```bash
cd apps/web
npm run build
```

---

## 📜 Architectural Invariants & Code Standards

Every contributor must honor the core tenets of Provenance:

1. **Quote Verification Invariant**: No competency score or evaluation sentence may be presented without a verified verbatim transcript citation. Quotes must match transcript text via deterministic normalized substring matching (`quote_verifier.py`).
2. **CoMAI Security Sandboxing**: All candidate input must be enclosed in canonical delimiters (`<candidate_answer>...</candidate_answer>`). Any attempted delimiter escape or prompt injection must be quarantined and logged.
3. **Non-Punitive Telemetry**: The system **must never** output a "cheating probability" or auto-disqualify a candidate based on browser events. Browser telemetry (tab blur, copy-paste) is grouped with benign explanations (e.g. note-taking) and labeled for human review priority only.
4. **Human-in-the-Loop Supremacy**: Final hiring decisions belong exclusively to human recruiters. The AI serves as an evidence aggregator and calibration engine.

---

## 🔀 Git & Pull Request Guidelines

1. **Branch Naming**:
   - `feat/feature-name`
   - `fix/bug-fix-name`
   - `docs/documentation-update`
   - `evals/scenario-name`
2. **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat(planner): implement Bloom taxonomy ladder progression`
   - `fix(verifier): handle Unicode curly apostrophes in transcript normalization`
   - `docs(readme): add screenshot gallery and deployment links`
3. **Pull Requests**:
   - Provide a clear description using our PR template (`.github/pull_request_template.md`).
   - Include output of `pytest` confirming all 38 tests pass.
   - Tag the appropriate lead reviewer.

---

## 👥 Hackathon Core Team

- **Team Lead & Multi-Agent Orchestration**: Aasish ([@aasish3187](https://github.com/aasish3187))
- **Distributed Backend & WebSocket Engine**: Sai Teja ([@tejaalahari](https://github.com/tejaalahari))
- **Principal Frontend & UX**: Susmitha ([@susmithavura](https://github.com/susmithavura))
- **AI Safety & Telemetry Integrity**: Pavani ([@donthiboyinapavani](https://github.com/donthiboyinapavani))
- **Mathematical Modeling & Bayesian Algorithms**: Hasini ([@HasiniVuyyuru](https://github.com/HasiniVuyyuru))
