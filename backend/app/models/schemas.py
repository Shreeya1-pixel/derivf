from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class ArtifactType(str, Enum):
    CODE = "code"
    ARCHITECTURE = "architecture"
    LOGS = "logs"
    API_SPEC = "api_spec"

class VulnerabilitySeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AnalysisRequest(BaseModel):
    artifact_type: ArtifactType
    content: str
    metadata: Optional[Dict[str, Any]] = None

class AgentFinding(BaseModel):
    agent_name: str
    finding_type: str
    description: str
    severity: VulnerabilitySeverity
    location: Optional[str] = None
    suggestion: Optional[str] = None

class SecurityReport(BaseModel):
    id: str
    timestamp: datetime
    overall_score: int
    findings: List[AgentFinding]
    summary: str
    status: str

class AgentMessage(BaseModel):
    agent: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
