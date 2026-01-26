import logging
from app.models.schemas import AgentFinding, VulnerabilitySeverity
from typing import List
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

class SOCIntelligenceAgent:
    """
    The Detective (SOC Analyst): Analysis logs and traffic.
    Correlates disparate events to find complex attack patterns.
    """
    async def analyze(self, content: str) -> List[AgentFinding]:
        system_prompt = """
        You are an expert SOC Analyst Agent (The Detective).
        Your goal is to analyze logs, alert streams, and network traffic data to identify security incidents.
        Focus on:
        - Anomalous patterns (spikes in traffic, timing anomalies).
        - Attack signatures (Brute force, DDoS, Port scanning).
        - Correlation between seemingly unrelated events.
        - Indicators of Compromise (IoCs).

        For each finding, provide:
        - finding_type: Short descriptive title (e.g. "Brute Force Attack Detected")
        - description: Explanation of the evidence found in logs
        - severity: "critical", "high", "medium", "low", or "info"
        - location: The log source or service affected
        - suggestion: Immediate response action (e.g. block IP, rotate credentials)
        """
        
        response_schema = """
        {
            "findings": [
                {
                    "finding_type": "string",
                    "description": "string",
                    "severity": "string",
                    "location": "string",
                    "suggestion": "string"
                }
            ]
        }
        """
        
        try:
            results = await ai_service.analyze_content(system_prompt, content, response_schema)
            
            findings = []
            if results and isinstance(results, list) and len(results) > 0:
                items = results
                if isinstance(results[0], dict) and "findings" in results[0]:
                    items = results[0]["findings"]
                    
                for item in items:
                    findings.append(AgentFinding(
                        agent_name="SOC Intelligence",
                        finding_type=item.get("finding_type", "Security Incident"),
                        description=item.get("description", ""),
                        severity=VulnerabilitySeverity(item.get("severity", "medium").lower()),
                        location=item.get("location", "Logs"),
                        suggestion=item.get("suggestion", "")
                    ))
            
            return findings
        except Exception as e:
            logger.error(f"SOC analysis failed: {e}")
            return []
