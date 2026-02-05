"""Internal endpoints (e.g. Slack test)."""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.slack_service import send_soc_alert
from app.services.slack_formatter import build_soc_alert

router = APIRouter(prefix="/internal", tags=["internal"])


class SlackTestPayload(BaseModel):
    risk: str = "HIGH"
    confidence: float = 0.82
    artifact_type: str = "PDF_DOCUMENT"
    consensus: Optional[Dict[str, str]] = None


@router.post("/test/slack")
async def test_slack(payload: SlackTestPayload):
    """Manual test endpoint for Slack integration."""
    consensus = payload.consensus or {"threat": "HIGH", "security": "MEDIUM", "soc": "LOW"}
    msg = build_soc_alert(
        artifact_type=payload.artifact_type,
        risk_level=payload.risk,
        confidence=payload.confidence,
        agent_consensus_summary=f"Threat: {consensus.get('threat', 'N/A')}, Security: {consensus.get('security', 'N/A')}, SOC: {consensus.get('soc', 'N/A')}",
        derived_from=payload.artifact_type,
    )
    ok = send_soc_alert(msg)
    return {"sent": ok, "message": "Check Slack channel"}
