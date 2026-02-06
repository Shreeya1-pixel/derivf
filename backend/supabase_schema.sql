-- Supabase Table Creation SQL
-- Run these in Supabase SQL Editor or use Table Editor UI

-- Table 1: vulnerabilities
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artifact_id TEXT,
    artifact TEXT NOT NULL,
    risk TEXT NOT NULL,
    confidence FLOAT8 NOT NULL,
    agent_votes JSONB NOT NULL,
    summary TEXT,
    status TEXT,
    overall_score INT4,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on risk level for filtering
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_risk ON vulnerabilities(risk);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_created_at ON vulnerabilities(created_at DESC);

-- Table 2: alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vulnerability_id UUID NOT NULL REFERENCES vulnerabilities(id),
    channel TEXT NOT NULL,
    sent_at TIMESTAMP NOT NULL
);

-- Create index on vulnerability_id for lookups
CREATE INDEX IF NOT EXISTS idx_alerts_vulnerability_id ON alerts(vulnerability_id);
