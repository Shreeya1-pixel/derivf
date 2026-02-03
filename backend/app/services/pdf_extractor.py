"""
PDF Artifact Extraction Pipeline
Extracts text, sections, tables from PDFs for analysis by all agents.
"""
import io
import uuid
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    logger.warning("pdfplumber not installed. PDF ingestion disabled.")


def extract_from_bytes(pdf_bytes: bytes) -> Optional[Dict[str, Any]]:
    """Extract content from PDF bytes."""
    if not PDF_AVAILABLE:
        raise RuntimeError("pdfplumber not installed. Run: pip install pdfplumber")

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            page_count = len(pdf.pages)
            raw_text_parts: List[str] = []
            sections: List[Dict[str, str]] = []
            total_chars = 0

            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                raw_text_parts.append(text)
                total_chars += len(text)

                # Best-effort section detection (headers often have different font/position)
                for line in text.split("\n"):
                    line = line.strip()
                    if not line:
                        continue
                    # Simple heuristic: short lines that end without period may be headers
                    if len(line) < 80 and not line.endswith(".") and len(line) > 2:
                        sections.append({"title": line, "text": ""})
                    elif sections:
                        sections[-1]["text"] = (sections[-1]["text"] + " " + line).strip()

            raw_text = "\n\n".join(raw_text_parts)
            if not sections:
                sections = [{"title": "Document", "text": raw_text[:5000]}]

            # Tables (best-effort)
            all_tables: List[str] = []
            for page in pdf.pages:
                tables = page.extract_tables()
                for tbl in tables or []:
                    if tbl:
                        row_strs = [" | ".join(str(c or "") for c in row) for row in tbl]
                        all_tables.append("\n".join(row_strs))
            tables_text = "\n\n---\n\n".join(all_tables) if all_tables else ""
            if tables_text:
                raw_text = raw_text + "\n\n[TABLES]\n\n" + tables_text

            token_approx = total_chars // 4
            extraction_confidence = min(1.0, 0.7 + (token_approx / 10000) * 0.1) if total_chars > 0 else 0.5

            return {
                "artifact_id": str(uuid.uuid4()),
                "artifact_type": "PDF_DOCUMENT",
                "origin": "upload",
                "content": {
                    "sections": sections[:50],  # cap sections
                    "raw_text": raw_text[:100000],  # cap raw text
                },
                "metadata": {
                    "page_count": page_count,
                    "extraction_confidence": round(extraction_confidence, 2),
                    "source_type": _infer_source_type(raw_text),
                },
            }
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise


def extract_from_url(url: str) -> Optional[Dict[str, Any]]:
    """Fetch PDF from URL and extract content."""
    try:
        import httpx
        with httpx.Client(timeout=60, follow_redirects=True) as client:
            r = client.get(url)
            if r.status_code != 200:
                raise ValueError(f"Failed to fetch URL: {r.status_code}")
            ct = r.headers.get("content-type", "")
            if "pdf" not in ct.lower() and not url.lower().endswith(".pdf"):
                raise ValueError("URL does not appear to point to a PDF")
            return extract_from_bytes(r.content)
    except Exception as e:
        logger.error(f"PDF URL fetch failed: {e}")
        raise


def _infer_source_type(text: str) -> str:
    """Infer document type from content."""
    text_lower = text.lower()
    if any(k in text_lower for k in ["architecture", "microservice", "api gateway", "data flow"]):
        return "architecture"
    if any(k in text_lower for k in ["error", "exception", "log", "trace", "debug"]):
        return "logs"
    if any(k in text_lower for k in ["endpoint", "request", "response", "openapi", "swagger"]):
        return "documentation"
    return "unknown"


def pdf_to_agent_content(normalized: Dict[str, Any]) -> str:
    """Convert normalized PDF artifact to string for agent consumption."""
    c = normalized.get("content", {})
    meta = normalized.get("metadata", {})
    parts = [
        "[ARTIFACT TYPE: PDF_DOCUMENT]",
        "What can be inferred: Text content, section structure, tables (best-effort).",
        "What cannot be inferred: Images, diagrams, scanned content without OCR.",
        f"[PDF Document - {meta.get('page_count', 0)} pages, confidence: {meta.get('extraction_confidence', 0)}]",
    ]
    parts.append("\n\n--- SECTIONS ---\n")
    for s in c.get("sections", [])[:20]:
        parts.append(f"## {s.get('title', '')}\n{s.get('text', '')}\n")
    parts.append("\n--- RAW TEXT (excerpt) ---\n")
    raw = c.get("raw_text", "")[:15000]
    parts.append(raw)
    return "\n".join(parts) + "\n\n[Derived from PDF Artifact]"
