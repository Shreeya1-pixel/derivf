from fastapi import APIRouter, HTTPException, WebSocket, UploadFile, File, BackgroundTasks
from typing import List, Optional
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from pydantic import BaseModel
from app.core.config import settings
from app.services.slack_service import send_soc_alert
from app.services.slack_formatter import build_soc_alert
from app.services.escalation_policy import should_notify_slack
from app.models.schemas import (
    AnalysisRequest, SecurityReport, AgentFinding,
    PDFBase64Request, PDFUrlRequest, GitHubArtifactRequest,
)
from app.agents.threat_agent import ThreatAgent
from app.agents.security_agent import SecurityAgent
from app.agents.soc_intelligence_agent import SOCIntelligenceAgent
from app.agents.risk_agent import RiskAgent
from app.agents.remediation_agent import RemediationAgent
from app.services.pdf_extractor import extract_from_bytes, extract_from_url, pdf_to_agent_content
from app.services.github_fetcher import fetch_github_artifact, github_to_agent_content
from app.services.ml_analytics import run_ml_analytics
import asyncio
import base64
import uuid
from datetime import datetime

router = APIRouter()

threat_agent = ThreatAgent()
security_agent = SecurityAgent()
soc_agent = SOCIntelligenceAgent()
risk_agent = RiskAgent()
remediation_agent = RemediationAgent()


def _add_derived_from(findings: List[AgentFinding], label: Optional[str]) -> List[AgentFinding]:
    """Add derived_from to each finding if label provided."""
    if not label:
        return findings
    out = []
    for f in findings:
        d = f.model_dump() if hasattr(f, "model_dump") else f.dict()
        d["derived_from"] = label
        out.append(AgentFinding(**d))
    return out


async def _run_full_analysis(
    content: str,
    artifact_id: str,
    artifact_origin: Optional[str] = None,
    ml_output: Optional[dict] = None,
) -> SecurityReport:
    """Core analysis pipeline: all agents + optional ML signals."""
    results = await asyncio.gather(
        threat_agent.analyze(content),
        security_agent.analyze(content),
        soc_agent.analyze(content),
    )
    all_findings = []
    for res in results:
        all_findings.extend(_add_derived_from(res, artifact_origin))

    remediation_findings = await remediation_agent.analyze(all_findings)
    if remediation_findings:
        all_findings.extend(_add_derived_from(remediation_findings, artifact_origin))

    risk_input = [f for f in all_findings if f.agent_name != "Remediation Engineer"]
    risk_evaluation = await risk_agent.analyze(risk_input)

    # Slack notification after risk decision (failure must not affect API response)
    vulnerability_record = None  # Track for alert logging
    try:
        score = risk_evaluation.get("overall_score", 100)
        status = risk_evaluation.get("status", "GO")
        risk_level = "CRITICAL" if score < 40 else "HIGH" if score < 60 else "MEDIUM" if score < 80 else "LOW"
        if status == "NO-GO" and risk_level == "LOW":
            risk_level = "MEDIUM"
        consensus = {}
        for f in risk_input:
            name = (f.agent_name or "").replace(" ", "_").lower()
            if name and name != "remediation_engineer":
                consensus[name] = getattr(f.severity, "value", str(f.severity)) if hasattr(f.severity, "value") else str(f.severity or "info")
        avg_conf = 0.7
        if ml_output and ml_output.get("analytics", {}).get("avg_confidence") is not None:
            avg_conf = ml_output["analytics"]["avg_confidence"]
        
        # Log vulnerability to Supabase before Slack notification
        from app.services.supabase_logger import log_vulnerability, log_alert
        vulnerability_record = log_vulnerability(
            artifact=artifact_origin or "UNKNOWN",
            risk=risk_level,
            confidence=avg_conf,
            agent_votes=consensus,
            artifact_id=artifact_id,
            summary=risk_evaluation.get("summary", "N/A"),
            status=status,
            overall_score=score,
        )
        
        if should_notify_slack(risk_level, avg_conf, consensus):
            msg = build_soc_alert(
                artifact_type="analysis",
                risk_level=risk_level,
                confidence=avg_conf,
                agent_consensus_summary=risk_evaluation.get("summary", "N/A"),
                derived_from=artifact_origin,
            )
            send_soc_alert(msg)
            
            # Log alert to Supabase if vulnerability was logged
            if vulnerability_record and vulnerability_record.get("id"):
                log_alert(vulnerability_record["id"], channel="slack")
                
    except Exception:
        pass  # Slack failure must not affect API response


    return SecurityReport(
        id=artifact_id,
        timestamp=datetime.utcnow(),
        overall_score=risk_evaluation.get("overall_score", 0),
        findings=all_findings,
        summary=risk_evaluation.get("summary", "Analysis complete."),
        status=risk_evaluation.get("status", "NO-GO"),
        ml_signals=ml_output,
    )


@router.get("/")
async def api_health():
    return {"status": "ok", "message": "Sentinel API operational"}


@router.post("/analyze", response_model=SecurityReport)
async def analyze_artifact(request: AnalysisRequest):
    """Original analyze endpoint - text/code/architecture/logs. ML analytics applied."""
    try:
        content = request.content
        aid = request.metadata.get("artifact_id", str(uuid.uuid4())) if request.metadata else str(uuid.uuid4())
        # Run ML on text/code artifact
        norm = {"artifact_id": aid, "artifact_type": getattr(request.artifact_type, "value", str(request.artifact_type)), "content": {"raw_text": content}, "metadata": {}}
        ml_output = run_ml_analytics(norm)
        return await _run_full_analysis(content, aid, None, ml_output)
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())


@router.post("/analyze/pdf/upload", response_model=SecurityReport)
async def analyze_pdf_upload(file: UploadFile = File(...)):
    """Multipart PDF file upload. All agents + ML process the PDF."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    try:
        pdf_bytes = await file.read()
        normalized = extract_from_bytes(pdf_bytes)
        content = pdf_to_agent_content(normalized)
        ml_output = run_ml_analytics(normalized)
        return await _run_full_analysis(
            content,
            normalized["artifact_id"],
            "Derived from PDF Artifact",
            ml_output,
        )
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())


@router.post("/analyze/pdf/base64", response_model=SecurityReport)
async def analyze_pdf_base64(req: PDFBase64Request):
    """PDF as base64 payload. All agents + ML process the PDF."""
    try:
        pdf_bytes = base64.b64decode(req.content_base64)
        normalized = extract_from_bytes(pdf_bytes)
        content = pdf_to_agent_content(normalized)
        ml_output = run_ml_analytics(normalized)
        return await _run_full_analysis(
            content,
            normalized["artifact_id"],
            "Derived from PDF Artifact",
            ml_output,
        )
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())


@router.post("/analyze/pdf/url", response_model=SecurityReport)
async def analyze_pdf_url(req: PDFUrlRequest):
    """PDF from URL. Fetched safely, then all agents + ML process."""
    try:
        normalized = extract_from_url(req.url)
        content = pdf_to_agent_content(normalized)
        ml_output = run_ml_analytics(normalized)
        return await _run_full_analysis(
            content,
            normalized["artifact_id"],
            "Derived from PDF Artifact",
            ml_output,
        )
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())


@router.post("/analyze/github", response_model=SecurityReport)
async def analyze_github(req: GitHubArtifactRequest):
    """GitHub link (repo/file/commit/PR). All agents + ML process."""
    try:
        normalized = fetch_github_artifact(req.url)
        content = github_to_agent_content(normalized)
        ml_output = run_ml_analytics(normalized)
        return await _run_full_analysis(
            content,
            normalized["artifact_id"],
            "Derived from GitHub Artifact",
            ml_output,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=str(e) + "\n" + traceback.format_exc())


@router.get("/vulnerabilities")
async def get_vulnerabilities_history(limit: int = 100, risk_filter: Optional[str] = None):
    """
    Retrieve vulnerability history from Supabase.
    
    Args:
        limit: Maximum number of records (default 100)
        risk_filter: Optional filter by risk level (LOW, MEDIUM, HIGH, CRITICAL)
    
    Returns:
        List of vulnerability records from Supabase audit log
    """
    from app.services.supabase_logger import get_vulnerabilities
    vulnerabilities = get_vulnerabilities(limit=limit, risk_filter=risk_filter)
    return {
        "count": len(vulnerabilities),
        "vulnerabilities": vulnerabilities
    }


@router.get("/ml/signals/{artifact_id}")

async def get_ml_signals(artifact_id: str):
    """ML signals are stored per-report; this endpoint would typically look up by artifact_id.
    For now returns empty - signals are embedded in SecurityReport.ml_signals."""
    return {"artifact_id": artifact_id, "signals": [], "message": "Check SecurityReport.ml_signals"}


@router.websocket("/ws/monitor")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        import random
        agents = ["Threat Modeler", "Logic Auditor", "SOC Intelligence", "Remediation Agent", "Supervisor"]
        while True:
            agent = random.choice(agents)
            message = f"Analyzing {random.choice(['API Spec', 'Auth Module', 'Order Book', 'PDF Document', 'GitHub Repo'])}..."
            await websocket.send_json({"agent": agent, "message": message, "status": "working"})
            await asyncio.sleep(random.uniform(2, 5))
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()


# --- Slack Integration ---

# Initialize Slack Client lazily/conditionally
slack_client = WebClient(token=settings.SLACK_BOT_TOKEN) if hasattr(settings, "SLACK_BOT_TOKEN") and settings.SLACK_BOT_TOKEN else None

class SlackMessage(BaseModel):
    channel: str
    text: str

def send_slack_notification_task(channel: str, text: str):
    """
    Background task to send slack notification
    """
    if not slack_client:
        print("Slack client not initialized. Missing SLACK_BOT_TOKEN.")
        return

    try:
        response = slack_client.chat_postMessage(
            channel=channel,
            text=text
        )
        print(f"Slack message sent: {response['ts']}")
    except SlackApiError as e:
        print(f"Error sending slack message: {e.response['error']}")

@router.post("/send-notification")
async def send_notification(message: SlackMessage, background_tasks: BackgroundTasks):
    """
    Send a notification to Slack asynchronously.
    """
    if not slack_client:
        raise HTTPException(status_code=503, detail="Slack integration not configured. Setup SLACK_BOT_TOKEN.")
    
    background_tasks.add_task(send_slack_notification_task, message.channel, message.text)
    return {"status": "Notification queued"}
