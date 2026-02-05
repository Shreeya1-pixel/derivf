"""
Supabase vulnerability logger service.
Logs vulnerability findings to Supabase database for audit trail and analysis.
"""
import logging
from typing import Dict, List, Optional
from datetime import datetime
from app.db.supabase_client import supabase

logger = logging.getLogger(__name__)

def log_vulnerability(
    artifact: str,
    risk: str,
    confidence: float,
    agent_votes: Dict[str, str],
    artifact_id: Optional[str] = None,
    summary: Optional[str] = None,
    status: Optional[str] = None,
    overall_score: Optional[int] = None,
) -> Optional[Dict]:
    """
    Log a vulnerability to Supabase.
    
    Args:
        artifact: Type of artifact analyzed (e.g., "PDF_DOCUMENT", "CODE", "GITHUB")
        risk: Risk level (e.g., "LOW", "MEDIUM", "HIGH", "CRITICAL")
        confidence: Confidence score (0.0 - 1.0)
        agent_votes: Dictionary of agent names and their severity assessments
        artifact_id: Optional artifact ID
        summary: Optional summary of the analysis
        status: Optional status (e.g., "GO", "NO-GO")
        overall_score: Optional overall security score
    
    Returns:
        The inserted record or None if failed
    """
    try:
        data = {
            "artifact": artifact.upper(),
            "risk": risk.upper(),
            "confidence": confidence,
            "agent_votes": agent_votes,
        }
        
        # Add optional fields if provided
        if artifact_id:
            data["artifact_id"] = artifact_id
        if summary:
            data["summary"] = summary
        if status:
            data["status"] = status
        if overall_score is not None:
            data["overall_score"] = overall_score
        
        response = supabase.table("vulnerabilities").insert(data).execute()
        logger.info(f"✅ Logged vulnerability to Supabase: {risk} risk for {artifact}")
        return response.data[0] if response.data else None
    except Exception as e:
        # Log errors but don't break the main flow
        logger.error(f"❌ Failed to log vulnerability to Supabase: {e}")
        return None


def log_alert(
    vulnerability_id: str,
    channel: str = "slack",
) -> Optional[Dict]:
    """
    Log an alert notification to Supabase.
    
    Args:
        vulnerability_id: UUID of the vulnerability that triggered the alert
        channel: Channel where alert was sent (default: "slack")
    
    Returns:
        The inserted record or None if failed
    """
    try:
        data = {
            "vulnerability_id": vulnerability_id,
            "channel": channel,
            "sent_at": datetime.utcnow().isoformat(),
        }
        
        response = supabase.table("alerts").insert(data).execute()
        logger.info(f"✅ Logged alert to Supabase for vulnerability {vulnerability_id}")
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"❌ Failed to log alert to Supabase: {e}")
        return None


def get_vulnerabilities(
    limit: int = 100,
    risk_filter: Optional[str] = None,
) -> List[Dict]:
    """
    Retrieve vulnerabilities from Supabase.
    
    Args:
        limit: Maximum number of records to retrieve
        risk_filter: Optional risk level filter (e.g., "HIGH", "CRITICAL")
    
    Returns:
        List of vulnerability records
    """
    try:
        query = supabase.table("vulnerabilities").select("*").order("created_at", desc=True).limit(limit)
        
        if risk_filter:
            query = query.eq("risk", risk_filter.upper())
        
        response = query.execute()
        return response.data if response.data else []
    except Exception as e:
        logger.error(f"❌ Failed to retrieve vulnerabilities from Supabase: {e}")
        return []
