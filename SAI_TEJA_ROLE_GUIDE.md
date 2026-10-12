# 🚀 Teammate Contribution Guide: Sai Teja
### Role: Distributed Backend & Real-Time Systems Architect
**Google Student Club Welcome Hackathon 2026 — Track 03: Adaptive Interview Intelligence**

---

## 📌 1. Your Role & Technical Ownership
As the **Distributed Backend & Real-Time Systems Architect**, you own the high-throughput, low-latency foundation of Provenance. You are responsible for ensuring that live voice streaming, session orchestration, database state transitions, and audit records happen with sub-second performance and zero data loss.

### Your Key Files & Deliverables in this Codebase:
1. **Live Audio & WebSocket Streaming**:
   - `apps/api/routers/voice_ws.py` — Starlette full-duplex bi-directional audio WebSocket pipeline with barge-in support and graceful text fallbacks.
   - `apps/api/services/token_service.py` — Ephemeral authentication token minting for candidate voice sessions (credentials never leak to client).
2. **Session State Machine & API Endpoints**:
   - `apps/api/routers/interviews.py` — Interview lifecycle endpoints (`/start`, `/turn`, `/complete`, `/sessions`).
   - `apps/api/routers/roles.py` — Role blueprint calibration, competencies definition, and rubric endpoints.
   - `apps/api/routers/auth.py` — Multi-tenant authentication, recruiter profile management, and session tokens.
3. **Immutable Evidence Ledger & Persistence**:
   - `apps/api/database.py` — SQLite/PostgreSQL append-only database configuration with WAL journaling.
   - `apps/api/models/` — Relational schema definitions (`InterviewSession`, `InterviewTurn`, `EvidenceLedgerEntry`, `AuditLogEntry`).
   - `apps/api/routers/audit.py` — Tamper-evident immutable audit log with cryptographic hash verification.
4. **Automated Unit & Integration Tests**:
   - `apps/api/tests/test_db.py` — Database schema, relational integrity, and append-only tests.
   - `apps/api/tests/test_voice_ws.py` — Starlette WebSocket handshake and fallback tests.
   - `apps/api/tests/test_interviews_api.py` — Full turn-by-turn interview lifecycle integration tests.
   - `apps/api/tests/test_auth.py` — Authentication, token validation, and security tests.

---

## 💻 2. Git Setup & Push Instructions

When you clone or extract this repository, run the following commands in your terminal (PowerShell or Bash) to push your commits with your official name:

```bash
# 1. Configure your Git Identity
git config user.name "Sai Teja"
git config user.email "YOUR_GITHUB_EMAIL@example.com"

# 2. Check Git status
git status

# 3. Add your backend files and deliverables
git add apps/api/ config/ packages/ docker-compose.yml Makefile start.bat stop.bat SAI_TEJA_ROLE_GUIDE.md

# 4. Commit your architectural contribution
git commit -m "feat(backend): implement high-concurrency streaming gateway, voice websockets, and immutable evidence ledger"

# 5. Link your GitHub repository (if not already set)
git remote add origin https://github.com/YOUR_ORGANIZATION_OR_USERNAME/YOUR_REPO_NAME.git

# 6. Push your branch or master/main
git branch -M main
git push -u origin main
```

---

## 🧪 3. How to Run & Verify Your Systems

```bash
# Start backend API (FastAPI with reload)
uvicorn apps.api.main:app --host 0.0.0.0 --port 8001 --reload

# Run your backend test suite
pytest apps/api/tests/test_db.py apps/api/tests/test_voice_ws.py apps/api/tests/test_interviews_api.py -v
```

---

## 🎤 4. Your 1-Minute Pitch to the Hackathon Judges

> *"Hello Judges, I'm Sai Teja, the Distributed Backend & Real-Time Systems Architect for Provenance. 
> 
> My primary focus was building a zero-lag, fault-tolerant infrastructure capable of streaming bi-directional live audio with Gemini Live. I engineered our Starlette WebSocket gateway that handles audio chunking, barge-in cancellation, and ephemeral auth token delegation so candidate keys never touch browser memory.
> 
> Furthermore, I built our Central Append-Only Evidence Ledger. In traditional tools, scores are disconnected numbers. In Provenance, every single turn, transcript span, and Bayesian state update is appended to an immutable database ledger with SHA-256 audit hashing. If anything fails during the interview, our state machine automatically recovers without dropping candidate evidence."*
