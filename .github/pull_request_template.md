## 📝 Summary of Changes
<!-- Provide a concise description of the changes, bug fixes, or new features in this PR -->

## 🎯 Related Issue / Track Milestone
<!-- Closes #issue_number or relates to Track 03 milestone -->
- Fixes #
- Milestone: 

## 🔍 Provenance Core Invariants Checklist
Please verify all core system invariants before requesting review:
- [ ] **Deterministic Quote Verification**: All evaluation claims are backed by verbatim transcript spans matching via `quote_verifier.py`.
- [ ] **CoMAI Sandboxing**: Candidate inputs remain enclosed in `<candidate_answer>` tags; prompt injections are safely quarantined.
- [ ] **Non-Punitive Telemetry**: No "cheating score" or automatic disqualifications introduced; human review priority preserved.
- [ ] **Bayesian Beta Engine**: Competency updates preserve monotonic variance reduction and proper prior weighting.
- [ ] **Human-in-the-Loop Oversight**: Final hiring decision authority remains strictly with the human recruiter.

## 🧪 Test Suite & Golden Benchmark Results
- [ ] `python -m pytest apps/api/tests -v` passes (38/38 tests green).
- [ ] `evals/runner.py` golden release gates verified (0 uncited sentences, injection neutralized).
- [ ] Frontend builds cleanly with zero TypeScript errors (`cd apps/web && npm run build`).

### Pytest Execution Snippet
```bash
# Paste terminal output here
```

## 📸 Screenshots / Visual Verification (If UI change)
<!-- Attach screenshot or GIF from local testing -->
