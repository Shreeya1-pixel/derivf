from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from enum import Enum
from datetime import datetime

class ArtifactType(str, Enum):
    CODE = "code"
    ARCHITECTURE = "architecture"
    LOGS = "logs"
    API_SPEC = "api_spec"
    PDF_DOCUMENT = "pdf_document"
    CODE_REPOSITORY = "code_repository"

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

class PDFBase64Request(BaseModel):
    content_base64: str
    metadata: Optional[Dict[str, Any]] = None

class PDFUrlRequest(BaseModel):
    url: str
    metadata: Optional[Dict[str, Any]] = None

class GitHubArtifactRequest(BaseModel):
    url: str
    metadata: Optional[Dict[str, Any]] = None

class MLSignal(BaseModel):
    type: str
    subtype: Optional[str] = None
    confidence: float
    evidence: str

class MLAnalyticsOutput(BaseModel):
    engine: str = "local_ml"
    artifact_id: str
    signals: List[MLSignal]

class AgentFinding(BaseModel):
    agent_name: str
    finding_type: str
    description: str
    severity: VulnerabilitySeverity
    location: Optional[str] = None
    suggestion: Optional[str] = None
    derived_from: Optional[str] = None  # "Derived from PDF Artifact" etc.

class SecurityReport(BaseModel):
    id: str
    timestamp: datetime
    overall_score: int
    findings: List[AgentFinding]
    summary: str
    status: str
    ml_signals: Optional[Dict[str, Any]] = None

class AgentMessage(BaseModel):
    agent: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
