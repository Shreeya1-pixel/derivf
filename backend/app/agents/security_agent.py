import logging
from typing import List
from app.models.schemas import AgentFinding, VulnerabilitySeverity
from app.services.ai_service import ai_service

logger = logging.getLogger(__name__)

class SecurityAgent:
    """
    The Logic Auditor (The Pentester): The 'Specialist'.
    Looks for vulnerabilities in code (SQLi, XSS, Logic bugs).
    """
    async def analyze(self, content: str) -> List[AgentFinding]:
        system_prompt = """
        You are an expert Security Audit Agent (The Logic Auditor).
        Your goal is to analyze code snippets and identify security vulnerabilities.
        Focus on:
        - Injection attacks (SQLi, NoSQLi, Command Injection)
        - Broken Access Control
        - Business Logic Flaws (e.g. race conditions, price manipulation)
        - Hardcoded secrets
        - Insecure configuration

        For each finding, provide:
        - finding_type: Short descriptive title
        - description: Technical explanation of the vulnerability
        - severity: "critical", "high", "medium", "low", or "info"
        - location: Specific function or line of code
        - suggestion: Concrete code fix or logical remediation
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
                        agent_name="Logic Auditor",
                        finding_type=item.get("finding_type", "Security Vulnerability"),
                        description=item.get("description", ""),
                        severity=VulnerabilitySeverity(item.get("severity", "medium").lower()),
                        location=item.get("location", "Codebase"),
                        suggestion=item.get("suggestion", "")
                    ))
            
            return findings
        except Exception as e:
            logger.error(f"Security analysis failed: {e}")
            return []
