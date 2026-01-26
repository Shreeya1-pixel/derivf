import asyncio
import logging
import json
from typing import List
from app.models.schemas import AgentFinding, VulnerabilitySeverity
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

class RemediationAgent:
    """
    The Engineer (Remediation): Suggests fixes.
    Takes findings from other agents and generates concrete code patches or config changes.
    """
    async def analyze(self, findings: List[AgentFinding]) -> List[AgentFinding]:
        if not findings:
            return []
            
        # Convert findings to string for context
        findings_context = json.dumps([f.dict() for f in findings], default=str)
        
        system_prompt = """
        You are an expert Security Engineer Agent (The Fixer).
        Your goal is to review security findings and generate concrete, actionable remediation plans.
        Focus on:
        - Root cause analysis.
        - Code-level fixes (provide sanitized code examples).
        - Configuration hardening.
        - Prioritization of fixes based on impact/effort.

        For each finding provided, generate a detailed remediation entry.
        """
        
        response_schema = """
        {
            "findings": [
                {
                    "finding_type": "string (Remediation Plan: [Original Finding Name])",
                    "description": "string (Actionable steps to fix)",
                    "severity": "string (Same as original)",
                    "location": "string (Same as original)",
                    "suggestion": "string (Code snippet or configuration block)"
                }
            ]
        }
        """
        
        try:
            results = await ai_service.analyze_content(system_prompt, findings_context, response_schema)
            
            remediation_findings = []
            if results and isinstance(results, list) and len(results) > 0:
                items = results
                if isinstance(results[0], dict) and "findings" in results[0]:
                    items = results[0]["findings"]
                    
                for item in items:
                    remediation_findings.append(AgentFinding(
                        agent_name="Remediation Engineer",
                        finding_type=item.get("finding_type", "Remediation Plan"),
                        description=item.get("description", ""),
                        severity=VulnerabilitySeverity(item.get("severity", "info").lower()),
                        location=item.get("location", "System"),
                        suggestion=item.get("suggestion", "")
                    ))
            
            return remediation_findings
        except Exception as e:
            logger.error(f"Remediation analysis failed: {e}")
            return []
