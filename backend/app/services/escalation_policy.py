"""
Escalation policy - decides when to notify Slack.
Does not modify agent outputs.
"""
from typing import Dict, Any, Optional


def _severity_to_score(s: str) -> int:
    s = (s or "").lower()
    if s == "critical": return 4
    if s == "high": return 3
    if s == "medium": return 2
    if s == "low": return 1
    return 0


def _compute_disagreement(consensus: Dict[str, str]) -> float:
    """Compute agent disagreement as normalized variance (0-1)."""
    if not consensus:
        return 0.0
    scores = [_severity_to_score(v) for v in consensus.values() if v]
    if len(scores) < 2:
        return 0.0
    mean = sum(scores) / len(scores)
    variance = sum((x - mean) ** 2 for x in scores) / len(scores)
    # Normalize: max variance for 0-4 range is ~2.5, map to 0-1
    return min(1.0, variance / 2.5)


def should_notify_slack(
    risk_level: str,
    confidence: float,
    consensus: Optional[Dict[str, str]] = None,
) -> bool:
    """
    Rules:
    - HIGH / CRITICAL → Slack
    - Disagreement > 0.4 → Slack
    - MEDIUM + confidence < 0.6 → Slack
    """
    risk_upper = (risk_level or "").upper()
    consensus = consensus or {}
    disagreement = _compute_disagreement(consensus)

    if risk_upper in ("HIGH", "CRITICAL"):
        return True
    if disagreement > 0.4:
        return True
    if risk_upper == "MEDIUM" and confidence < 0.6:
        return True
    return False
