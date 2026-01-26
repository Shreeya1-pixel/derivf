import React, { useState } from 'react';
import {
    Play,
    AlertCircle,
    ShieldAlert,
    CheckCircle2,
    Ticket,
    Ban,
    MoreHorizontal
} from 'lucide-react';
import './ThreatModeling.css';
import ThreatDetails from './ThreatDetails';

const ThreatModeling = () => {
    const [selectedFinding, setSelectedFinding] = useState(1);
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="page-container full-height">
            {showDetails && <ThreatDetails onClose={() => setShowDetails(false)} />}
            {/* Header */}
            <header className="page-header custom-mb">
                <div className="breadcrumb">
                    <span className="text-muted">Threat Modeling / Active Scan</span>
                    <h1 className="page-title">Project: FinTech Core API</h1>
                </div>
                <button className="btn-primary" onClick={() => {
                    alert('Threat Scan: Navigate to "Add Artifact" to submit new artifacts for threat modeling analysis.');
                    window.location.href = '/add-artifact';
                }}>
                    <Play size={16} fill="white" />
                    Run Threat Scan
                </button>
            </header>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-box red">
                    <div className="stat-label">CRITICAL VULNERABILITIES</div>
                    <div className="stat-number">
                        12 <span className="diff">+2</span>
                    </div>
                </div>
                <div className="stat-box orange">
                    <div className="stat-label">MEDIUM RISKS DETECTED</div>
                    <div className="stat-number">
                        45 <span className="diff negative">-5</span>
                    </div>
                </div>
                <div className="stat-box green">
                    <div className="stat-label">LOW SEVERITY ISSUES</div>
                    <div className="stat-number">
                        128 <span className="diff">+12</span>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="threat-layout">
                {/* Left List */}
                <div className="findings-list">
                    <h3 className="pane-title">Detected Findings</h3>

                    <div className={`finding-item ${selectedFinding === 1 ? 'active' : ''}`} onClick={() => setSelectedFinding(1)}>
                        <div className="finding-item-header">
                            <span className="badge-high">HIGH</span>
                            <span className="timestamp">2m ago</span>
                        </div>
                        <div className="finding-title">SQL Injection in Auth Service via 'user_id' parameter</div>
                        <div className="finding-subtitle">
                            auth-module • <span className="status-unresolved">Unresolved</span>
                        </div>
                    </div>

                    <div className="finding-item">
                        <div className="finding-item-header">
                            <span className="badge-high">HIGH</span>
                            <span className="timestamp">15m ago</span>
                        </div>
                        <div className="finding-title">Hardcoded API Keys in Payment Gateway config</div>
                        <div className="finding-subtitle">
                            payment-service • <span className="status-unresolved">Unresolved</span>
                        </div>
                    </div>

                    <div className="finding-item">
                        <div className="finding-item-header">
                            <span className="badge-medium">MEDIUM</span>
                            <span className="timestamp">1h ago</span>
                        </div>
                        <div className="finding-title">Missing Rate Limiting on Public Endpoints</div>
                        <div className="finding-subtitle">
                            api-gateway • <span className="status-review">In Review</span>
                        </div>
                    </div>

                    <div className="finding-item">
                        <div className="finding-item-header">
                            <span className="badge-medium">MEDIUM</span>
                            <span className="timestamp">2h ago</span>
                        </div>
                        <div className="finding-title">Weak Encryption Algorithm (MD5) Detected</div>
                        <div className="finding-subtitle">
                            legacy-utils • <span className="status-review">Triaged</span>
                        </div>
                    </div>

                    <div className="finding-item">
                        <div className="finding-item-header">
                            <span className="badge-low">LOW</span>
                            <span className="timestamp">3h ago</span>
                        </div>
                        <div className="finding-title">Verbose Error Logging Enabled</div>
                        <div className="finding-subtitle">
                            frontend-ssr • <span className="status-ignored">Ignored</span>
                        </div>
                    </div>
                </div>

                {/* Right Detail */}
                <div className="finding-detail">
                    <div className="detail-header">
                        <div>
                            <h2 className="detail-title">SQL Injection in Auth Service</h2>
                            <div className="detail-meta">
                                <span>CWE-89</span>
                                <span>CVSS: 9.8 (Critical)</span>
                                <span>File: auth/login.ts</span>
                            </div>
                        </div>
                        <div className="detail-actions">
                            <button className="btn-text-sm" onClick={() => alert('Assign: This would assign this threat finding to a team member for investigation.')}>Assign</button>
                            <button className="btn-text-sm" onClick={() => alert('Mark False Positive: This would mark this finding as a false positive and remove it from active threats.')}>Mark False Positive</button>
                            <button className="btn-primary sm" onClick={() => setShowDetails(true)}>View Full Analysis</button>
                        </div>
                    </div>

                    <div className="detail-content-grid">
                        <div className="code-panel">
                            <h4 className="panel-heading">VULNERABLE CODE CONTEXT</h4>
                            <div className="code-viewer">
                                <div className="code-line">
                                    <span className="line-num">42</span>
                                    <span>async function</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">43</span>
                                    <span>authenticateUser(req, res) {'{'}</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">44</span>
                                    <span>  const {'{'} username, password {'}'} = req.body;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">45</span>
                                    <span className="comment">  // Constructing query directly from input</span>
                                </div>
                                <div className="code-line highlight-red">
                                    <span className="line-num">46</span>
                                    <span>  const query = `SELECT * FROM users WHERE id = '${'{'}username{'}'}'`;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">47</span>
                                    <span></span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">48</span>
                                    <span>  try {'{'}</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">49</span>
                                    <span>    const result = await db.execute(query);</span>
                                </div>
                            </div>
                        </div>

                        <div className="analysis-panel">
                            <h4 className="panel-heading">THREAT MODELING AGENT ANALYSIS</h4>

                            <div className="analysis-section">
                                <div className="analysis-title">
                                    <div className="dot"></div> Analysis Summary
                                </div>
                                <p>
                                    The variable <code>username</code> is concatenated directly into the SQL command string on line 46.
                                    This allows an attacker to manipulate the query structure by injecting arbitrary SQL commands.
                                </p>
                            </div>

                            <div className="analysis-section">
                                <div className="analysis-title">
                                    <div className="dot"></div> Suggested Remediation
                                </div>
                                <p>
                                    Use parameterized queries or an ORM to handle database interactions safely. Do not concatenate user input directly.
                                </p>
                                <ul>
                                    <li>Replace string interpolation with prepared statements.</li>
                                    <li>Validate input length and format before processing.</li>
                                </ul>

                                <div className="example-fix">
                                    <div className="fix-header">Example fix:</div>
                                    <pre>
                                        {`const query = "SELECT * FROM users 
WHERE id = ?";
await db.execute(query, [username]);`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreatModeling;
