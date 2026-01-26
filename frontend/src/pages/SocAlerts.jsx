import React from 'react';
import {
    AlertCircle,
    ShieldAlert,
    Activity,
    User,
    Globe,
    Clock,
    Settings,
    XCircle,
    Eye,
    CheckCircle,
    Shield,
    Zap
} from 'lucide-react';
import './SocAlerts.css';

const SocAlerts = () => {
    return (
        <div className="page-container full-height-soc">
            {/* Header */}
            <div className="soc-header">
                <div className="breadcrumb">
                    <span className="text-muted">Detection & Response / Alerts</span>
                    <h1 className="page-title">Alert Feed</h1>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary"><Settings size={14} /> Feed Settings</button>
                    <button className="btn-secondary"><XCircle size={14} /> Dismiss All</button>
                </div>
            </div>

            {/* AI Insight Banner */}
            <div className="ai-insight-banner">
                <div className="banner-content">
                    <span className="ai-badge">AI Insight</span>
                    <span className="insight-text">Alert Correlation Active: We've detected that 7 recent alerts are likely part of the same incident (ID: #INC-2024-001).</span>
                </div>
                <a href="#" className="view-details-link">View Correlation Details →</a>
            </div>

            <div className="soc-grid">
                {/* Left Column: Feed */}
                <div className="feed-panel">
                    <div className="feed-header">
                        <span className="text-muted text-xs font-bold tracking-wider">INCOMING STREAM</span>
                        <span className="text-muted text-xs">Sort by: <span className="text-white">Severity</span></span>
                    </div>

                    <div className="correlated-group">
                        <div className="group-label">CORRELATED INCIDENT #INC-2024-001</div>

                        <div className="alert-item active">
                            <div className="alert-meta-top">
                                <div className="flex items-center gap-2">
                                    <div className="status-dot red"></div>
                                    <span className="severity-text red">CRITICAL</span>
                                </div>
                                <span className="time-ago">2 min ago</span>
                            </div>
                            <div className="alert-title">Failed Login Spike (Multiple IPs)</div>
                            <div className="alert-meta-bottom">
                                <span className="meta-tag">Auth Service</span>
                                <span className="ai-confidence">98% AI Conf.</span>
                            </div>
                        </div>

                        <div className="alert-item">
                            <div className="alert-meta-top">
                                <div className="flex items-center gap-2">
                                    <div className="status-dot orange"></div>
                                    <span className="severity-text orange">MEDIUM</span>
                                </div>
                                <span className="time-ago">3 min ago</span>
                            </div>
                            <div className="alert-title">Unusual API Rate Limit Spike</div>
                            <div className="alert-meta-bottom">
                                <span className="meta-tag">API Gateway</span>
                                <span className="ai-confidence">85% AI Conf.</span>
                            </div>
                        </div>

                        <div className="alert-item">
                            <div className="alert-meta-top">
                                <div className="flex items-center gap-2">
                                    <div className="status-dot green"></div>
                                    <span className="severity-text green">LOW</span>
                                </div>
                                <span className="time-ago">5 min ago</span>
                            </div>
                            <div className="alert-title">Anomalous User Agent Detected</div>
                            <div className="alert-meta-bottom">
                                <span className="meta-tag">Frontend LB</span>
                                <span className="ai-confidence">99% AI Conf.</span>
                            </div>
                        </div>
                    </div>

                    <div className="single-alerts-header">SINGLE ALERTS</div>

                    <div className="alert-item">
                        <div className="alert-meta-top">
                            <div className="flex items-center gap-2">
                                <div className="status-dot blue"></div>
                                <span className="severity-text blue">INFO</span>
                            </div>
                            <span className="time-ago">1 hr ago</span>
                        </div>
                        <div className="alert-title">Routine Backup Completed</div>
                        <div className="alert-meta-bottom">
                            <span className="meta-tag">Database</span>
                        </div>
                    </div>

                </div>

                {/* Right Column: Investigation */}
                <div className="investigation-panel">

                    <div className="investigation-header">
                        <div>
                            <h2 className="investigation-title">Brute Force Attempt on Admin Portal</h2>
                            <div className="flex gap-2 mt-2">
                                <span className="tag-critical">Critical Severity</span>
                                <span className="tag-correlated">Correlated Incident</span>
                            </div>
                        </div>
                        <div className="malicious-score">
                            <span className="score-val">95%</span>
                            <span className="score-label">MALICIOUS PROBABILITY</span>
                        </div>
                    </div>

                    <div className="incident-analysis-grid">
                        <div className="analysis-box">
                            <h4 className="box-title">Why it triggered</h4>
                            <p className="box-content">
                                A sudden spike of 450+ failed login attempts was detected within 60 seconds from a distributed IP range,
                                followed immediately by high-volume API calls to the user enumeration endpoint.
                            </p>
                        </div>
                        <div className="analysis-box">
                            <h4 className="box-title">Impact Assessment</h4>
                            <p className="box-content">
                                Potential unauthorized access to admin accounts. Service degradation possible due to API load.
                                <span className="text-warning"> No successful logins detected yet.</span>
                            </p>
                        </div>
                    </div>

                    <div className="rec-actions-section">
                        <h4 className="rec-title">RECOMMENDED ACTIONS</h4>

                        <div className="action-row">
                            <div className="action-info">
                                <input type="checkbox" className="custom-checkbox" />
                                <span className="action-text">Temporarily block IP Range 192.168.x.x/24</span>
                            </div>
                            <button className="btn-action green">Execute Block</button>
                        </div>

                        <div className="action-row">
                            <div className="action-info">
                                <input type="checkbox" className="custom-checkbox" />
                                <span className="action-text">Enforce CAPTCHA on all admin login routes</span>
                            </div>
                            <button className="btn-action dark">Enable CAPTCHA</button>
                        </div>
                    </div>

                    <div className="investigation-footer">
                        <button className="btn-danger-outline">Escalate to SecOps</button>
                        <div className="flex gap-2">
                            <button className="btn-secondary">View Raw Logs</button>
                            <button className="btn-primary">Mark as Resolved</button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SocAlerts;
