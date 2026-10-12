"""
Provenance — Deterministic Beta Posterior & Uncertainty Engine.
Enforces Non-Negotiable Product Rule #6:
"Math/rules in code (coverage, uncertainty, severity aggregation, gap classes).
LLMs write language and extract structure only."

Mathematical Formulations (from ARCHITECTURE §5.1):
Prior: Beta(alpha_0 = 1.0, beta_0 = 1.0)
Update with evidence (score s in [0, 1], confidence weight w in [0, 1]):
  alpha_new = alpha + w * s
  beta_new  = beta + w * (1.0 - s)

Posterior Mean:
  mu = alpha / (alpha + beta)

Posterior Uncertainty (Standard Deviation):
  u = sqrt( (alpha * beta) / ( (alpha + beta)^2 * (alpha + beta + 1) ) )
"""
from __future__ import annotations

import math
from typing import NamedTuple
from packages.schemas.models import SkillStatus


class BetaState(NamedTuple):
    alpha: float
    beta: float
    estimate: float      # mu in [0, 1]
    uncertainty: float   # u in [0, 0.2887]
    evidence_count: int
    status: SkillStatus


def calculate_beta_metrics(alpha: float, beta: float) -> tuple[float, float]:
    """
    Computes (mu, uncertainty) from Beta(alpha, beta).
    """
    total = alpha + beta
    if total <= 0:
        return 0.5, 0.2887

    mu = alpha / total
    variance = (alpha * beta) / ((total ** 2) * (total + 1.0))
    uncertainty = math.sqrt(variance)
    return round(mu, 4), round(uncertainty, 4)


def classify_skill_gap(mu: float, uncertainty: float, evidence_count: int) -> SkillStatus:
    """
    Deterministic skill status classification:
    - Not assessed: evidence_count == 0
    - Verified: mu >= 0.70 and uncertainty <= 0.20
    - Tested — not demonstrated: mu < 0.45 and evidence_count >= 1
    - Claimed — needs validation: otherwise (moderate estimate 0.45 <= mu < 0.70 or high uncertainty)
    """
    if evidence_count == 0:
        return SkillStatus.NOT_ASSESSED

    if mu >= 0.70 and uncertainty <= 0.20:
        return SkillStatus.VERIFIED

    if mu < 0.45 and evidence_count >= 1:
        return SkillStatus.NOT_DEMONSTRATED

    return SkillStatus.CLAIMED_UNVALIDATED


def update_beta_posterior(
    prior_alpha: float = 1.0,
    prior_beta: float = 1.0,
    evidence_score: float = 0.5,
    confidence_weight: float = 1.0,
    prior_count: int = 0,
) -> BetaState:
    """
    Updates Beta prior with observed evidence score and weight.
    All inputs are bounded: score in [0.0, 1.0], weight in [0.0, 1.0].
    """
    s = max(0.0, min(1.0, float(evidence_score)))
    w = max(0.0, min(1.0, float(confidence_weight)))

    new_alpha = prior_alpha + (w * s)
    new_beta = prior_beta + (w * (1.0 - s))
    new_count = prior_count + 1

    mu, uncertainty = calculate_beta_metrics(new_alpha, new_beta)
    status = classify_skill_gap(mu, uncertainty, new_count)

    return BetaState(
        alpha=round(new_alpha, 4),
        beta=round(new_beta, 4),
        estimate=mu,
        uncertainty=uncertainty,
        evidence_count=new_count,
        status=status,
    )


def initial_beta_state() -> BetaState:
    """
    Returns the uniform uninformative prior Beta(1.0, 1.0).
    mu = 0.5, uncertainty = sqrt(1 / 12) ~ 0.2887.
    """
    mu, u = calculate_beta_metrics(1.0, 1.0)
    return BetaState(
        alpha=1.0,
        beta=1.0,
        estimate=mu,
        uncertainty=u,
        evidence_count=0,
        status=SkillStatus.NOT_ASSESSED,
    )
