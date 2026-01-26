import React, { useMemo } from 'react';
import {
    Share2,
    Wrench,
    Zap,
    Flame,
    Shield,
    CheckCircle2,
    Ticket
} from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { filterBySeverity } from '../utils/findingsHelpers';
import './Remediation.css';

const Remediation = () => {
    const { analysisReport } = useAnalysis();

    // Group findings by severity for remediation categories
    const remediationGroups = useMemo(() => {
        if (!analysisReport?.findings) {
            return { quickWins: [], highImpact: [], longTerm: [] };
        }

        const high = filterBySeverity(analysisReport.findings, ['high', 'critical']);
        const medium = filterBySeverity(analysisReport.findings, ['medium']);
        const low = filterBySeverity(analysisReport.findings, ['low', 'info']);

        return {
            highImpact: high,
            quickWins: medium.slice(0, 2), // First 2 medium as quick wins
            longTerm: low
        };
    }, [analysisReport]);
    return (
        <div className="page-container">
            <header className="page-header">
                <div className="breadcrumb">
                    <span className="text-muted">Actionable Findings</span>
                    <h1 className="page-title">Remediation Plan</h1>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => {
                        alert('Share functionality: This would generate a shareable link or export the remediation plan for team collaboration.');
                    }}>
                        <Share2 size={16} />
                        Share Plan
                    </button>
                    <button className="btn-primary" onClick={() => {
                        alert('Auto-Fix functionality: This would automatically apply safe fixes to low-risk vulnerabilities. Manual review required for critical changes.');
                    }}>
                        <Wrench size={16} />
                        Auto-Fix Safe Items
                    </button>
                </div>
            </header>

            {/* Quick Wins */}
            <section className="remediation-section">
                <div className="section-header">
                    <div className="icon-box green">
                        <Zap size={20} color="#34d399" />
                    </div>
                    <div>
                        <h3 className="section-title">Quick Wins</h3>
                        <p className="section-desc">Low effort fixes with immediate security benefits.</p>
                    </div>
                </div>


                {remediationGroups.quickWins.length > 0 ? (
                    remediationGroups.quickWins.map((finding, idx) => (
                        <div className="finding-card" key={idx}>
                            <div className="finding-main">
                                <div className="finding-header">
                                    <h4>{finding.finding_type || 'Security Finding'} <span className="score">Priority: Medium</span></h4>
                                </div>
                                <p className="finding-desc">
                                    {finding.description}
                                </p>
                                {finding.suggestion && (
                                    <div className="code-display">
                                        <span className="code-label">SUGGESTED FIX</span>
                                        <code>
                                            <span className="code-add">{finding.suggestion}</span>
                                        </code>
                                    </div>
                                )}
                            </div>
                            <div className="finding-meta">
                                <div className="meta-item">
                                    <label>EFFORT</label>
                                    <span className="effort-low">Low (&lt; 5 mins)</span>
                                </div>
                                <div className="meta-item">
                                    <label>COMPONENT</label>
                                    <span>{finding.location || 'Unknown'}</span>
                                </div>
                                <div className="meta-item">
                                    <label>PRIORITY</label>
                                    <div className="priority-bar">
                                        <div className="bar-fill green" style={{ width: '40%' }}></div>
                                    </div>
                                </div>
                                <button className="btn-jira" onClick={() => {
                                    alert('Jira Integration: This would create a ticket in your Jira project with the vulnerability details and suggested fix.');
                                }}>
                                    <Ticket size={14} />
                                    Create Jira Ticket
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="finding-card">
                        <div className="finding-main">
                            <div className="finding-header">
                                <h4>Disable 'X-Powered-By' Header <span className="score">Score: 92</span></h4>
                            </div>
                            <p className="finding-desc">
                                The server is exposing its technology stack (Express.js) via response headers. This information helps
                                attackers target specific vulnerabilities in your framework version.
                            </p>
                            <div className="code-display">
                                <span className="code-label">EXAMPLE FIX</span>
                                <code>
                                    <span className="code-comment">const app = express(); // Add this line to remove the header</span>
                                    <br />
                                    <span className="code-add">app.disable('x-powered-by');</span>
                                </code>
                            </div>
                        </div>
                        <div className="finding-meta">
                            <div className="meta-item">
                                <label>EFFORT</label>
                                <span className="effort-low">Low (&lt; 5 mins)</span>
                            </div>
                            <div className="meta-item">
                                <label>COMPONENT</label>
                                <span>Auth Service / API Gateway</span>
                            </div>
                            <div className="meta-item">
                                <label>PRIORITY</label>
                                <div className="priority-bar">
                                    <div className="bar-fill green" style={{ width: '40%' }}></div>
                                </div>
                            </div>
                            <button className="btn-jira">
                                <Ticket size={14} />
                                Create Jira Ticket
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* High Impact */}
            <section className="remediation-section">
                <div className="section-header">
                    <div className="icon-box red">
                        <Flame size={20} color="#f87171" />
                    </div>
                    <div>
                        <h3 className="section-title">High Impact</h3>
                        <p className="section-desc">Critical vulnerabilities that require immediate attention.</p>
                    </div>
                </div>

                <div className="finding-card">
                    <div className="finding-main">
                        <div className="finding-header">
                            <h4>Sanitize Database Inputs (SQL Injection) <span className="score red">Score: 98</span></h4>
                        </div>
                        <p className="finding-desc">
                            Raw SQL queries are constructed using user input in the user search endpoint. This allows attackers to
                            manipulate queries and potentially dump the database.
                        </p>
                        <div className="code-display">
                            <span className="code-label">EXAMPLE FIX</span>
                            <code>
                                <span className="code-comment">// Unsafe: const query = "SELECT * FROM users WHERE id = " + req.body.id;</span>
                                <br />
                                <span className="code-comment">// Safe: Use parameterized queries</span>
                                <br />
                                <span className="code-add">const query = "SELECT * FROM users WHERE id = $1";</span>
                                <br />
                                <span className="code-add">await db.query(query, [req.body.id]);</span>
                            </code>
                        </div>
                    </div>
                    <div className="finding-meta">
                        <div className="meta-item">
                            <label>EFFORT</label>
                            <span className="effort-med">Medium (1-2 days)</span>
                        </div>
                        <div className="meta-item">
                            <label>COMPONENT</label>
                            <span>User Service</span>
                        </div>
                        <div className="meta-item">
                            <label>PRIORITY</label>
                            <div className="priority-bar">
                                <div className="bar-fill red" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                        <button className="btn-jira" onClick={() => {
                            alert('Jira Integration: This would create a ticket in your Jira project with the vulnerability details and suggested fix.');
                        }}>
                            <Ticket size={14} />
                            Create Jira Ticket
                        </button>
                    </div>
                </div>
            </section>

            {/* Long-term */}
            <section className="remediation-section">
                <div className="section-header">
                    <div className="icon-box blue">
                        <Shield size={20} color="#60a5fa" />
                    </div>
                    <div>
                        <h3 className="section-title">Long-term Hardening</h3>
                        <p className="section-desc">Strategic improvements to improve security posture over time.</p>
                    </div>
                </div>

                <div className="finding-card collapsed">
                    <div className="finding-main">
                        <div className="finding-header">
                            <h4>Enforce MFA for Admin Access <span className="score">Score: 85</span></h4>
                        </div>
                    </div>
                    <div className="finding-meta">
                        <div className="meta-item">
                            <label>EFFORT</label>
                            <span>High (2 weeks)</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Remediation;
