"""
Local ML Analytics Engine
Signals: complexity anomaly, security pattern frequency.
Applied to PDF, code, logs, GitHub artifacts.
Outputs are immutable; agents may reference but not modify.
"""
import re
import math
import uuid
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Security keywords for pattern frequency
SECURITY_KEYWORDS = [
    "auth", "authentication", "password", "token", "jwt", "oauth",
    "trading", "balance", "order", "transaction", "withdraw", "deposit",
    "rate_limit", "ratelimit", "throttle",
    "retry", "retries", "backoff",
    "encrypt", "decrypt", "hash", "secret", "api_key", "apikey",
    "sql", "query", "execute", "injection",
    "xss", "csrf", "sanitize", "validate",
]

# Baselines for percentile-based anomaly (simplified)
SECTION_ENTROPY_BASELINE = 3.5
TOKEN_DENSITY_BASELINE = 0.3
PAGE_COUNT_P90 = 50


def _token_count(text: str) -> int:
    return max(1, len(text.split()) + len(re.findall(r"\b\w+\b", text)) // 2)


def _entropy(s: str) -> float:
    if not s:
        return 0.0
    from collections import Counter
    probs = [c / len(s) for c in Counter(s).values()]
    return -sum(p * math.log2(p) for p in probs if p > 0)


def _keyword_counts(text: str) -> Dict[str, int]:
    text_lower = text.lower()
    counts = {}
    for kw in SECURITY_KEYWORDS:
        pattern = r"\b" + re.escape(kw) + r"\b"
        counts[kw] = len(re.findall(pattern, text_lower))
    return counts


def complexity_anomaly_signal(artifact: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Artifact Complexity & Size Anomaly detection."""
    signals = []
    content = artifact.get("content", {})
    metadata = artifact.get("metadata", {})
    raw_text = content.get("raw_text", "")

    # Aggregate text from files if CODE_REPOSITORY
    if "files" in content:
        raw_text = "\n".join(
            f.get("content", "") for f in content.get("files", [])
        )

    token_count = _token_count(raw_text)
    char_count = len(raw_text)

    # Token density (tokens per char)
    token_density = token_count / max(1, char_count)
    if token_density > TOKEN_DENSITY_BASELINE * 1.5:
        signals.append({
            "type": "complexity_anomaly",
            "subtype": "token_density",
            "confidence": min(0.95, 0.5 + (token_density - TOKEN_DENSITY_BASELINE) * 2),
            "evidence": f"token_density={token_density:.3f} > baseline",
        })

    # Section entropy (for PDFs with sections)
    sections = content.get("sections", [])
    if sections:
        section_texts = [s.get("text", "") for s in sections if s.get("text")]
        if section_texts:
            entropies = [_entropy(t) for t in section_texts]
            avg_entropy = sum(entropies) / len(entropies) if entropies else 0
            if avg_entropy > SECTION_ENTROPY_BASELINE:
                signals.append({
                    "type": "complexity_anomaly",
                    "subtype": "section_entropy",
                    "confidence": min(0.95, 0.6 + (avg_entropy - SECTION_ENTROPY_BASELINE) * 0.1),
                    "evidence": f"section_entropy={avg_entropy:.2f} > baseline",
                })

    # Page count (PDF)
    page_count = metadata.get("page_count", 0)
    if page_count > PAGE_COUNT_P90:
        signals.append({
            "type": "complexity_anomaly",
            "subtype": "page_count",
            "confidence": min(0.9, 0.7 + (page_count - PAGE_COUNT_P90) / 200),
            "evidence": f"page_count={page_count} > P90",
        })

    return signals


def security_pattern_frequency_signal(artifact: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Security Pattern Frequency - keyword distribution analysis."""
    content = artifact.get("content", {})
    raw_text = content.get("raw_text", "")

    if "files" in content:
        raw_text = "\n".join(f.get("content", "") for f in content.get("files", []))

    if not raw_text or len(raw_text) < 100:
        return []

    counts = _keyword_counts(raw_text)
    total = sum(counts.values())
    token_count = _token_count(raw_text)
    if token_count < 50:
        return []

    expected_per_kw = total / max(len(SECURITY_KEYWORDS), 1)
    signals = []

    # Over-representation
    for kw, c in counts.items():
        if c > expected_per_kw * 3 and c >= 5:
            signals.append({
                "type": "security_pattern_frequency",
                "subtype": "over_representation",
                "confidence": min(0.9, 0.6 + c / 50),
                "evidence": f"keyword '{kw}' appears {c} times (elevated)",
            })

    # High-risk concentration (auth, trading, balance, etc.)
    high_risk = ["auth", "password", "token", "trading", "balance", "sql", "injection"]
    hr_count = sum(counts.get(k, 0) for k in high_risk)
    if hr_count > 10:
        signals.append({
            "type": "security_pattern_frequency",
            "subtype": "high_risk_concentration",
            "confidence": min(0.9, 0.65 + hr_count / 100),
            "evidence": f"high-risk keywords total={hr_count}",
        })

    return signals


def github_specific_signal(artifact: Dict[str, Any]) -> List[Dict[str, Any]]:
    """GitHub-specific ML signals."""
    if artifact.get("artifact_type") != "CODE_REPOSITORY" or artifact.get("source") != "github":
        return []

    files = artifact.get("content", {}).get("files", [])
    if not files:
        return []

    signals = []

    # Security-critical file clustering (auth, config, api in paths)
    critical_paths = [f for f in files if any(
        k in f.get("path", "").lower()
        for k in ["auth", "login", "config", "secret", "api", "admin"]
    )]
    if len(critical_paths) >= 3:
        signals.append({
            "type": "github_signal",
            "subtype": "security_critical_clustering",
            "confidence": min(0.85, 0.6 + len(critical_paths) * 0.05),
            "evidence": f"{len(critical_paths)} security-critical files detected",
        })

    # High-risk language concentration (e.g. many .py auth files)
    lang_counts = {}
    for f in files:
        lang = f.get("language", "unknown")
        path = f.get("path", "").lower()
        if "auth" in path or "security" in path:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1
    for lang, cnt in lang_counts.items():
        if cnt >= 2:
            signals.append({
                "type": "github_signal",
                "subtype": "high_risk_language_concentration",
                "confidence": 0.75,
                "evidence": f"{cnt} {lang} files in auth/security paths",
            })

    return signals


def run_ml_analytics(artifact: Dict[str, Any]) -> Dict[str, Any]:
    """Run all ML signals on artifact. Output is immutable."""
    artifact_id = artifact.get("artifact_id", str(uuid.uuid4()))
    signals: List[Dict[str, Any]] = []

    signals.extend(complexity_anomaly_signal(artifact))
    signals.extend(security_pattern_frequency_signal(artifact))
    signals.extend(github_specific_signal(artifact))

    # Enrich with analytics for frontend charts
    content = artifact.get("content", {})
    raw_text = content.get("raw_text", "")
    if "files" in content:
        raw_text = "\n".join(f.get("content", "") for f in content.get("files", []))
    keyword_counts = _keyword_counts(raw_text) if raw_text and len(raw_text) >= 100 else {}
    keyword_distribution = [{"keyword": k, "count": v} for k, v in sorted([(k, v) for k, v in keyword_counts.items() if v > 0], key=lambda x: -x[1])[:15]]
    signal_type_breakdown = {}
    for s in signals:
        t = s.get("type", "other")
        signal_type_breakdown[t] = signal_type_breakdown.get(t, 0) + 1
    confidence_buckets = {"0.5-0.6": 0, "0.6-0.7": 0, "0.7-0.8": 0, "0.8-0.9": 0, "0.9-1.0": 0}
    for s in signals:
        c = s.get("confidence", 0)
        if c < 0.6: confidence_buckets["0.5-0.6"] += 1
        elif c < 0.7: confidence_buckets["0.6-0.7"] += 1
        elif c < 0.8: confidence_buckets["0.7-0.8"] += 1
        elif c < 0.9: confidence_buckets["0.8-0.9"] += 1
        else: confidence_buckets["0.9-1.0"] += 1
    histogram_data = [{"range": k, "count": v} for k, v in confidence_buckets.items()]

    return {
        "engine": "local_ml",
        "artifact_id": artifact_id,
        "signals": signals,
        "analytics": {
            "keyword_distribution": keyword_distribution,
            "signal_type_breakdown": [{"type": k, "count": v} for k, v in signal_type_breakdown.items()],
            "confidence_histogram": histogram_data,
            "total_signals": len(signals),
            "avg_confidence": round(sum(s.get("confidence", 0) for s in signals) / len(signals), 3) if signals else 0,
        },
    }
