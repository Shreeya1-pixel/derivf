"""
Slack message formatter - converts risk decision into SOC-style Slack alert using Block Kit.
"""
from typing import Dict, Any, Optional


def build_soc_alert(
    artifact_type: str,
    risk_level: str,
    confidence: float,
    agent_consensus_summary: str,
    derived_from: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build a SOC-style Slack alert message.
    Output shape: { "text": "...", "blocks": [...] }
    """
    risk_emoji = "🔴" if risk_level.upper() in ("CRITICAL", "HIGH") else "🟠" if risk_level.upper() == "MEDIUM" else "🟢"
    conf_pct = int(confidence * 100)

    text = "🚨 Security Risk Detected"
    derived_line = f"Derived from: {derived_from}" if derived_from else "Derived from: Text/Code/Logs"

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": "🚨 Security Risk Detected", "emoji": True},
        },
        {"type": "section", "fields": [
            {"type": "mrkdwn", "text": f"*Artifact Type*\n{artifact_type or 'Unknown'}"},
            {"type": "mrkdwn", "text": f"*Risk Level*\n{risk_emoji} {risk_level}"},
            {"type": "mrkdwn", "text": f"*Confidence*\n{conf_pct}%"},
            {"type": "mrkdwn", "text": f"*Source*\n{derived_line}"},
        ]},
        {"type": "divider"},
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*Agent Consensus Summary*\n{agent_consensus_summary or 'N/A'}"},
        },
    ]
    return {"text": text, "blocks": blocks}
