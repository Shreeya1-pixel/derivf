# Sentinel - Multi-Agent AI Security & Logic Governance

## Vision
Securing the future of high-frequency trading through autonomous, logic-aware security orchestration.

## Problem & Solution
In fintech, a security breach isn't just about stolen passwords; it’s about logic flaws. Sentinel is a "Digital Security Board" - a multi-agent AI system that acts like an elite team of security experts sitting inside the developer's workflow.

## Architecture
- **Backend**: Python FastAPI (Async, Typed)
- **AI Orchestration**: Multi-Agent System (Threat, Security, SOC, Risk, Remediation Agents)
- **Database**: PostgreSQL (via Supabase/Replit DB) with pgvector support
- **Real-time**: WebSockets for live agent interaction

## Agents
1. **The Architect (Threat Modeler)**: Analyzes system designs and trust boundaries.
2. **The Logic Auditor (Security Review)**: Looks for Economic Vulnerabilities.
3. **The Compliance Sentinel (SOC Intelligence)**: Cross-references logs and alerts.
4. **The Supervisor (Risk & Prioritization)**: Synthesizes reports and provides a Security Score.
5. **Remediation Agent**: Suggests concrete fixes.

## Setup
1. Ensure Python 3.11+ is installed.
2. Install dependencies: `pip install -r requirements.txt` (or let Replit handle it).
3. Run: `python sentinel-backend/main.py`
