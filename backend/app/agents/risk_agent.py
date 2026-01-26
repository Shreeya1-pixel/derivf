import logging
import json
from typing import List, Dict
from app.models.schemas import AgentFinding
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

class RiskAgent:
    """
    The Strategist (Risk Manager): Calculates overall risk.
    Aggregates all findings into a single 'Security Score' and risk narrative.
    """
    async def analyze(self, findings: List[AgentFinding]) -> Dict:
        if not findings:
            return {"overall_score": 100, "summary": "No findings detected. System appears secure.", "status": "GO"}
            
        findings_context = json.dumps([f.dict() for f in findings], default=str)
        
        system_prompt = """
        You are an expert Risk Management Agent (the Strategist).
        Analyze the list of security findings to determine the overall security posture.
        
        1. Calculate a Security Score (0-100), where 100 is perfectly secure and 0 is compromised.
           - Critical severities reduce score significantly (-25 each).
           - High severities reduce score moderately (-15 each).
           - Medium severities reduce score slightly (-5 each).
        
        2. Provide a 2-3 sentence executive summary of the risk state.
        
        3. Determine a GO/NO-GO status for deployment.
        """
        
        response_schema = """
        {
            "overall_score": integer,
            "summary": "string",
            "status": "string (GO / NO-GO)"
        }
        """
        
        try:
            results = await ai_service.analyze_content(system_prompt, findings_context, response_schema)
            
            if results and isinstance(results, list) and len(results) > 0:
                result = results[0]
                return {
                    "overall_score": result.get("overall_score", 0),
                    "summary": result.get("summary", "Risk assessment complete."),
                    "status": result.get("status", "NO-GO")
                }
            
            # Fallback if parsing fails
            return {"overall_score": 50, "summary": "Automated risk assessment passed but failed to parse details.", "status": "NO-GO"}
            
        except Exception as e:
            logger.error(f"Risk analysis failed: {e}")
            return {"overall_score": 0, "summary": "Risk analysis failed due to error.", "status": "NO-GO"}
        
        summary = f"System analysis complete. Identified {len(findings)} issues. " \
                  f"Critical risks detected in trading logic." if score < 80 else "System appears healthy."

        from datetime import datetime
        import uuid
        
        return SecurityReport(
            id=str(uuid.uuid4()),
            timestamp=datetime.now(),
            overall_score=score,
            findings=findings,
            summary=summary,
            status=status
        )
