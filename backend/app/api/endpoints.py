from fastapi import APIRouter, HTTPException, WebSocket
from typing import List
from app.models.schemas import AnalysisRequest, SecurityReport, AgentMessage
from app.agents.threat_agent import ThreatAgent
from app.agents.security_agent import SecurityAgent
from app.agents.soc_intelligence_agent import SOCIntelligenceAgent
from app.agents.risk_agent import RiskAgent
from app.agents.remediation_agent import RemediationAgent
from app.agents.remediation_agent import RemediationAgent
import asyncio
from datetime import datetime

router = APIRouter()

# Instantiate agents
threat_agent = ThreatAgent()
security_agent = SecurityAgent()
soc_agent = SOCIntelligenceAgent()
risk_agent = RiskAgent()
remediation_agent = RemediationAgent()

@router.post("/analyze", response_model=SecurityReport)
async def analyze_artifact(request: AnalysisRequest):
    """
    Trigger a full multi-agent analysis on an artifact.
    """
    try:
        # 1. Parallel Analysis (Threat, Security, SOC)
        results = await asyncio.gather(
            threat_agent.analyze(request.content),
            security_agent.analyze(request.content),
            soc_agent.analyze(request.content)
        )
        
        all_findings = []
        for res in results:
            all_findings.extend(res)
        
        # 2. Remediation Analysis (Dependent on previous findings)
        remediation_findings = await remediation_agent.analyze(all_findings)
        # Filter out empty findings if any
        if remediation_findings:
            all_findings.extend(remediation_findings)
        
        # 3. Risk Evaluation (Dependent on all findings)
        # Filter only threat/security/soc findings for risk scoring to avoid double counting remediation info
        risk_input = [f for f in all_findings if f.agent_name != "Remediation Engineer"]
        risk_evaluation = await risk_agent.analyze(risk_input)
        
        # Construct final report
        return SecurityReport(
            id=request.id if hasattr(request, 'id') and request.id else "analysis_id",
            timestamp=datetime.utcnow(),
            overall_score=risk_evaluation.get("overall_score", 0),
            findings=all_findings,
            summary=risk_evaluation.get("summary", "Analysis complete."),
            status=risk_evaluation.get("status", "NO-GO")
        )

    except Exception as e:
        import traceback
        error_msg = f"Analysis Failed: {str(e)}\n{traceback.format_exc()}"
        print(error_msg) # Print to server logs
        raise HTTPException(status_code=500, detail=error_msg)

@router.websocket("/ws/monitor")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Simulate real-time agent chatter
        agents = ["Threat Modeler", "Logic Auditor", "SOC Intelligence", "Remediation Agent", "Supervisor"]
        import random
        
        while True:
            agent = random.choice(agents)
            message = f"Analyzing {random.choice(['API Spec', 'Auth Module', 'Order Book', 'Latency Logs'])}..."
            await websocket.send_json({"agent": agent, "message": message, "status": "working"})
            await asyncio.sleep(random.uniform(2, 5))
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()
