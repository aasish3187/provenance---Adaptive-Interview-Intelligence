---
name: Golden Benchmark Scenario (Evals)
about: Propose a new synthetic evaluation candidate scenario (G13+) for the benchmark suite
title: '[EVAL] Golden Scenario: '
labels: 'evals, testing'
assignees: ''
---

## 🎯 Candidate Profile & Scenario Objective
- **Candidate Name**: [e.g., Alex Zhao]
- **Target Role**: [e.g., Senior ML Platform Engineer]
- **Evaluation Purpose**: [e.g., Edge-case testing of hallucinated citations in complex distributed systems responses]
- **Expected Outcome**: [e.g., Verified, Needs Review, High Uncertainty]

## 🧪 Benchmark Turns & Ground Truth
Provide 2–4 representative interview turns with expected rubrics and verbatim quotes:

```json
{
  "turn_index": 1,
  "competency_id": "COMP-DISTRIBUTED",
  "question": "...",
  "answer": "...",
  "criteria": [
    "Criterion 1",
    "Criterion 2"
  ]
}
```

## 🛡️ Invariant Verification
- [ ] Verbatim quote is verifiable via normalized substring matching.
- [ ] Any adversarial injection attempts are documented.
- [ ] Non-punitive telemetry events (if present) are non-biasing.
