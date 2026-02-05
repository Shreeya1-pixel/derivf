import React, { useState } from 'react';
import {
    Shield,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Activity,
    Eye,
    TrendingUp,
    Info,
    FileSearch,
    BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import './AIWaf.css';

const AIWaf = () => {
    const navigate = useNavigate();
    const { wafEvents, analysisHistory } = useAnalysis();
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeTab, setActiveTab] = useState('input-guard');
    const [showDocumentation, setShowDocumentation] = useState(false);

    const getSeverityClass = (severity) => {
        const sev = (severity || 'info').toLowerCase();
        if (sev === 'critical') return 'red';
        if (sev === 'high') return 'red';
        if (sev === 'medium') return 'orange';
        if (sev === 'low') return 'green';
        return 'blue';
    };

    const getActionBadgeClass = (action) => {
        const act = (action || '').toLowerCase();
        if (act === 'blocked') return 'badge-blocked';
        if (act === 'sanitized') return 'badge-sanitized';
        if (act === 'contained') return 'badge-contained';
        if (act === 'suppressed') return 'badge-suppressed';
        return 'badge-default';
    };

    // Calculate risk metrics from actual WAF events
    const calculateRiskMetrics = () => {
        const totalInputEvents = wafEvents.inputGuard.length;
        const totalOutputEvents = wafEvents.outputGuard.length;
        const totalBehaviorEvents = wafEvents.behaviorViolations.length;

        const sanitizations = wafEvents.inputGuard.filter(e => e.action === 'Sanitized').length;
        const blocks = wafEvents.inputGuard.filter(e => e.action === 'Blocked').length;

        // Calculate AI Safety Score (0-100)
        // Higher score = better protection
        let safetyScore = 50; // Base score
        if (totalInputEvents > 0) {
            const blockRate = blocks / totalInputEvents;
            const sanitizeRate = sanitizations / totalInputEvents;
            safetyScore = Math.min(100, 50 + (blockRate * 30) + (sanitizeRate * 20));
        }

        return {
            promptInjectionAttempts: totalInputEvents,
            sanitizations,
            blocks,
            aiSafetyScore: Math.round(safetyScore),
            totalEvents: totalInputEvents + totalOutputEvents + totalBehaviorEvents,
        };
    };

    const metrics = calculateRiskMetrics();

    const renderDocumentation = () => (
        <div className="documentation-panel">
            <div className="doc-header">
                <div className="flex items-center gap-2">
                    <BookOpen size={20} className="icon-cyan" />
                    <h2>How AI WAF Works: Multi-Input Normalization</h2>
                </div>
                <button className="btn-close" onClick={() => setShowDocumentation(false)}>×</button>
            </div>

            <div className="doc-content">
                <div className="doc-section">
                    <h3>1️⃣ User Input (Unchanged)</h3>
                    <p>
                        Users submit inputs in different forms through the <strong>Add Artifact</strong> portal:
                    </p>
                    <ul>
                        <li><strong>Raw text</strong> - Direct code, logs, or architecture descriptions</li>
                        <li><strong>PDF documents</strong> - Architecture diagrams, security reports</li>
                        <li><strong>GitHub repository links</strong> - Source code repositories</li>
                        <li><strong>URLs</strong> - Web pages, documentation</li>
                    </ul>
                    <div className="doc-note">
                        <Info size={14} />
                        <span>The AI WAF does NOT introduce a new input box or change user behavior. It operates transparently on existing submission flows.</span>
                    </div>
                </div>

                <div className="doc-section">
                    <h3>2️⃣ Input Normalization Layer</h3>
                    <p>
                        All inputs are converted into a <strong>normalized representation</strong> before any AI agent runs.
                    </p>
                    <div className="normalization-flow">
                        <div className="norm-step">
                            <div className="norm-label">Text Extraction</div>
                            <div className="norm-desc">PDFs and web pages → Plain text</div>
                        </div>
                        <div className="norm-arrow">→</div>
                        <div className="norm-step">
                            <div className="norm-label">Content Selection</div>
                            <div className="norm-desc">GitHub repos → README, docs, key files</div>
                        </div>
                        <div className="norm-arrow">→</div>
                        <div className="norm-step">
                            <div className="norm-label">Intent Attachment</div>
                            <div className="norm-desc">User's question + Context</div>
                        </div>
                        <div className="norm-arrow">→</div>
                        <div className="norm-step">
                            <div className="norm-label">Metadata</div>
                            <div className="norm-desc">Input type, source, timestamp</div>
                        </div>
                    </div>
                    <div className="doc-highlight">
                        <strong>Critical:</strong> The AI WAF inspects the normalized representation, not the raw file or link.
                    </div>
                </div>

                <div className="doc-section">
                    <h3>3️⃣ Input Guard Agent (Detection)</h3>
                    <p>
                        The Input Guard Agent evaluates the normalized input using:
                    </p>
                    <ul>
                        <li><strong>Known attack classes</strong> - Prompt injection, role override, delimiter abuse, data exfiltration</li>
                        <li><strong>Policy rules</strong> - Instruction hierarchy, agent boundaries, safety constraints</li>
                        <li><strong>Historical pattern matches</strong> - Similar patterns from past WAF events</li>
                    </ul>
                    <p className="doc-insight">
                        Detection confidence increases when similar patterns have been seen before. The system learns from each event without storing user data.
                    </p>
                </div>

                <div className="doc-section">
                    <h3>4️⃣ Event-Based Logging (Important)</h3>
                    <p>
                        Each input creates <strong>ONE immutable WAF event</strong> containing:
                    </p>
                    <div className="event-structure">
                        <div className="event-field">
                            <span className="field-name">Detected Issue</span>
                            <span className="field-value">e.g., "Prompt Injection"</span>
                        </div>
                        <div className="event-field">
                            <span className="field-name">Confidence Score</span>
                            <span className="field-value">0.0 - 1.0</span>
                        </div>
                        <div className="event-field">
                            <span className="field-name">Action Taken</span>
                            <span className="field-value">Allowed / Sanitized / Blocked</span>
                        </div>
                        <div className="event-field">
                            <span className="field-name">Timestamp</span>
                            <span className="field-value">ISO 8601 format</span>
                        </div>
                    </div>
                    <div className="doc-highlight critical">
                        <strong>Inputs are not re-analyzed later. Only security decisions are logged.</strong>
                    </div>
                </div>

                <div className="doc-section">
                    <h3>5️⃣ Historical Context (When Viewing an Input)</h3>
                    <p>
                        When you select a WAF event in the dashboard:
                    </p>
                    <ul>
                        <li>The system shows <strong>historical statistics</strong> for similar attack patterns</li>
                        <li>This includes frequency, trend, and past enforcement outcomes</li>
                        <li>Data is <strong>aggregated across events</strong>, not tied to individual users or inputs</li>
                    </ul>
                    <p className="doc-note-text">
                        Example: "Prompt injection attempts: 47 in last 24h" reflects pattern frequency, not user tracking.
                    </p>
                </div>

                <div className="doc-section">
                    <h3>6️⃣ Why This Works for AI Security</h3>
                    <p>This approach:</p>
                    <ul>
                        <li>✅ Stops prompt injection <strong>without blocking legitimate use</strong></li>
                        <li>✅ Applies <strong>consistent security</strong> across documents, repositories, and text</li>
                        <li>✅ Mirrors how real SOC systems <strong>accumulate threat intelligence</strong> over time</li>
                        <li>✅ Remains <strong>explainable and auditable</strong> for compliance</li>
                    </ul>
                </div>

                <div className="doc-conclusion">
                    <p>
                        <strong>This event-based and pattern-driven approach allows the AI WAF to protect LLM agents across multiple input types while remaining explainable, auditable, and safe for production deployment.</strong>
                    </p>
                </div>
            </div>
        </div>
    );

    const renderInputGuard = () => {
        if (wafEvents.inputGuard.length === 0) {
            return (
                <div className="empty-state-waf">
                    <Shield size={48} color="#6e7681" />
                    <h3>No Input Guard Events</h3>
                    <p>
                        Input Guard events are created when users submit artifacts through the Add Artifact portal.
                        The AI WAF analyzes normalized inputs for prompt injection, role override, and other attack patterns.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/add-artifact')}>
                        Add Artifact to Generate Events
                    </button>
                </div>
            );
        }

        return (
            <div className="waf-section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">🛡️ Input Guard Agent</h2>
                        <p className="section-subtitle">Intercepted user inputs before execution</p>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-item">
                            <span className="stat-value">{wafEvents.inputGuard.length}</span>
                            <span className="stat-label">Intercepted</span>
                        </div>
                    </div>
                </div>

                <div className="events-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Original Input</th>
                                <th>Detection Type</th>
                                <th>Confidence</th>
                                <th>Action</th>
                                <th>Severity</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {wafEvents.inputGuard.map((event, idx) => (
                                <tr key={idx} onClick={() => setSelectedEvent({ ...event, type: 'input' })}>
                                    <td className="timestamp-cell">{event.timestamp}</td>
                                    <td className="input-cell">
                                        <div className="input-preview">{event.originalInput}</div>
                                    </td>
                                    <td>
                                        <span className="detection-type">{event.detectionType}</span>
                                    </td>
                                    <td>
                                        <div className="confidence-bar">
                                            <div
                                                className="confidence-fill"
                                                style={{ width: `${event.confidence * 100}%` }}
                                            ></div>
                                            <span className="confidence-text">{(event.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`action-badge ${getActionBadgeClass(event.action)}`}>
                                            {event.action}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="severity-indicator">
                                            <div className={`status-dot ${getSeverityClass(event.severity)}`}></div>
                                            <span className={`severity-text ${getSeverityClass(event.severity)}`}>
                                                {event.severity?.toUpperCase()}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <button className="btn-view-details">
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderOutputGuard = () => {
        if (wafEvents.outputGuard.length === 0) {
            return (
                <div className="empty-state-waf">
                    <Shield size={48} color="#6e7681" />
                    <h3>No Output Guard Events</h3>
                    <p>
                        Output Guard events are created when AI agents generate responses that contain sensitive data.
                        The WAF redacts API keys, PII, infrastructure details, and harmful content before delivery.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/add-artifact')}>
                        Add Artifact to Generate Events
                    </button>
                </div>
            );
        }

        return (
            <div className="waf-section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">🔒 Output Guard Agent</h2>
                        <p className="section-subtitle">AI outputs sanitized before user delivery</p>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-item">
                            <span className="stat-value">{wafEvents.outputGuard.length}</span>
                            <span className="stat-label">Redacted</span>
                        </div>
                    </div>
                </div>

                <div className="output-events-grid">
                    {wafEvents.outputGuard.map((event, idx) => (
                        <div
                            key={idx}
                            className="output-event-card"
                            onClick={() => setSelectedEvent({ ...event, type: 'output' })}
                        >
                            <div className="output-event-header">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={16} className={`icon-${getSeverityClass(event.severity)}`} />
                                    <span className="policy-name">{event.policyTriggered}</span>
                                </div>
                                <span className="timestamp-small">{event.timestamp}</span>
                            </div>

                            <div className="output-diff">
                                <div className="diff-section">
                                    <div className="diff-label">
                                        <XCircle size={12} className="icon-red" />
                                        Original Output
                                    </div>
                                    <div className="diff-content original">{event.originalOutput}</div>
                                </div>

                                <div className="diff-arrow">→</div>

                                <div className="diff-section">
                                    <div className="diff-label">
                                        <CheckCircle size={12} className="icon-green" />
                                        Final Output
                                    </div>
                                    <div className="diff-content final">{event.finalOutput}</div>
                                </div>
                            </div>

                            <div className="output-event-footer">
                                <span className={`exposure-badge ${getSeverityClass(event.severity)}`}>
                                    {event.exposureStatus}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderBehaviorViolations = () => {
        if (wafEvents.behaviorViolations.length === 0) {
            return (
                <div className="empty-state-waf">
                    <Shield size={48} color="#6e7681" />
                    <h3>No Behavior Violations</h3>
                    <p>
                        Behavior violations are logged when AI agents attempt actions outside their designated scope,
                        such as role escalation, tool abuse, or boundary violations.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/add-artifact')}>
                        Add Artifact to Generate Events
                    </button>
                </div>
            );
        }

        return (
            <div className="waf-section">
                <div className="section-header">
                    <div>
                        <h2 className="section-title">⚠️ Agent Behavior Violations</h2>
                        <p className="section-subtitle">Agent-level policy enforcement log</p>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-item">
                            <span className="stat-value">{wafEvents.behaviorViolations.length}</span>
                            <span className="stat-label">Violations</span>
                        </div>
                    </div>
                </div>

                <div className="violations-log">
                    {wafEvents.behaviorViolations.map((violation, idx) => (
                        <div
                            key={idx}
                            className="violation-item"
                            onClick={() => setSelectedEvent({ ...violation, type: 'behavior' })}
                        >
                            <div className="violation-left">
                                <div className={`violation-icon ${getSeverityClass(violation.severity)}`}>
                                    <Shield size={16} />
                                </div>
                                <div className="violation-info">
                                    <div className="violation-header-row">
                                        <span className="agent-name">{violation.agentName}</span>
                                        <span className="violation-type">{violation.violationType}</span>
                                    </div>
                                    <p className="violation-description">{violation.description}</p>
                                    <span className="timestamp-small">{violation.timestamp}</span>
                                </div>
                            </div>
                            <div className="violation-right">
                                <span className={`action-badge ${getActionBadgeClass(violation.action)}`}>
                                    {violation.action}
                                </span>
                                <div className="severity-indicator">
                                    <div className={`status-dot ${getSeverityClass(violation.severity)}`}></div>
                                    <span className={`severity-text ${getSeverityClass(violation.severity)}`}>
                                        {violation.severity?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderRiskMetrics = () => (
        <div className="waf-section">
            <div className="section-header">
                <div>
                    <h2 className="section-title">📊 Risk Score Over Time</h2>
                    <p className="section-subtitle">AI WAF performance metrics</p>
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <div className="metric-icon red">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-value">{metrics.promptInjectionAttempts}</span>
                        <span className="metric-label">Input Guard Events</span>
                        <span className="metric-period">Total intercepted</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon orange">
                        <Activity size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-value">{metrics.sanitizations}</span>
                        <span className="metric-label">Sanitizations</span>
                        <span className="metric-period">Inputs modified</span>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon red">
                        <XCircle size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-value">{metrics.blocks}</span>
                        <span className="metric-label">Blocks</span>
                        <span className="metric-period">Requests denied</span>
                    </div>
                </div>

                <div className="metric-card highlight">
                    <div className="metric-icon green">
                        <TrendingUp size={20} />
                    </div>
                    <div className="metric-content">
                        <span className="metric-value large">{metrics.aiSafetyScore}</span>
                        <span className="metric-label">AI Safety Confidence Score</span>
                        <span className="metric-period">0-100 scale</span>
                    </div>
                </div>
            </div>

            <div className="metric-explanation">
                <Info size={14} />
                <span>
                    Confidence score reflects how safely the system handled adversarial inputs. Higher scores
                    indicate better protection against prompt injection and data leakage.
                </span>
            </div>

            {analysisHistory.length > 0 && (
                <div className="analysis-history-section">
                    <h3>Recent Analysis History</h3>
                    <div className="history-list">
                        {analysisHistory.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="history-item">
                                <div className="history-meta">
                                    <span className="history-type">{item.artifactType}</span>
                                    <span className="history-time">{new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="history-summary">{item.summary}</div>
                                <div className="history-stats">
                                    <span className="history-score">Score: {item.overallScore}</span>
                                    <span className="history-findings">{item.findingsCount} findings</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderExplainability = () => {
        if (!selectedEvent) {
            return (
                <div className="explainability-empty">
                    <Eye size={32} color="#6e7681" />
                    <p>Select an event to see decision explainability</p>
                </div>
            );
        }

        return (
            <div className="explainability-panel">
                <div className="explainability-header">
                    <h3>Decision Explainability</h3>
                    <button className="btn-close" onClick={() => setSelectedEvent(null)}>
                        ×
                    </button>
                </div>

                <div className="explainability-content">
                    {selectedEvent.type === 'input' && (
                        <>
                            <div className="explain-section">
                                <h4>Original Input</h4>
                                <div className="code-block">{selectedEvent.originalInput}</div>
                            </div>

                            <div className="explain-section">
                                <h4>Detection Analysis</h4>
                                <div className="analysis-grid">
                                    <div className="analysis-item">
                                        <span className="analysis-label">Detection Type:</span>
                                        <span className="analysis-value">{selectedEvent.detectionType}</span>
                                    </div>
                                    <div className="analysis-item">
                                        <span className="analysis-label">Confidence:</span>
                                        <span className="analysis-value">
                                            {(selectedEvent.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="analysis-item">
                                        <span className="analysis-label">WAF Action:</span>
                                        <span className={`action-badge ${getActionBadgeClass(selectedEvent.action)}`}>
                                            {selectedEvent.action}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="explain-section">
                                <h4>Why This Decision?</h4>
                                <p className="reason-text">{selectedEvent.reason}</p>
                            </div>

                            <div className="explain-section">
                                <h4>Modification Summary</h4>
                                <p className="modification-text">{selectedEvent.modificationSummary}</p>
                            </div>

                            <div className="explain-section">
                                <h4>User Intent Assessment</h4>
                                <div className="intent-assessment">
                                    {selectedEvent.action === 'Blocked' ? (
                                        <div className="intent-malicious">
                                            <XCircle size={16} />
                                            <span>Malicious Intent Detected</span>
                                        </div>
                                    ) : (
                                        <div className="intent-mixed">
                                            <AlertTriangle size={16} />
                                            <span>Partial Policy Overlap - Benign intent with unsafe elements</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {selectedEvent.type === 'output' && (
                        <>
                            <div className="explain-section">
                                <h4>Policy Triggered</h4>
                                <div className="policy-badge">{selectedEvent.policyTriggered}</div>
                            </div>

                            <div className="explain-section">
                                <h4>Original Output (Pre-Redaction)</h4>
                                <div className="code-block danger">{selectedEvent.originalOutput}</div>
                            </div>

                            <div className="explain-section">
                                <h4>Final Output (Post-Redaction)</h4>
                                <div className="code-block safe">{selectedEvent.finalOutput}</div>
                            </div>

                            <div className="explain-section">
                                <h4>Why This Was Redacted?</h4>
                                <p className="reason-text">
                                    The output contained sensitive information that violates our data leakage
                                    prevention policy. Sensitive content was removed before delivery to the user to
                                    prevent exposure of confidential data.
                                </p>
                            </div>

                            <div className="explain-section">
                                <h4>Exposure Status</h4>
                                <div className="exposure-status-box">
                                    <CheckCircle size={16} className="icon-green" />
                                    <span>{selectedEvent.exposureStatus}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {selectedEvent.type === 'behavior' && (
                        <>
                            <div className="explain-section">
                                <h4>Agent Information</h4>
                                <div className="agent-info-box">
                                    <Shield size={16} />
                                    <span>{selectedEvent.agentName}</span>
                                </div>
                            </div>

                            <div className="explain-section">
                                <h4>Violation Type</h4>
                                <div className="violation-type-badge">{selectedEvent.violationType}</div>
                            </div>

                            <div className="explain-section">
                                <h4>What Happened?</h4>
                                <p className="reason-text">{selectedEvent.description}</p>
                            </div>

                            <div className="explain-section">
                                <h4>WAF Action Taken</h4>
                                <span className={`action-badge large ${getActionBadgeClass(selectedEvent.action)}`}>
                                    {selectedEvent.action}
                                </span>
                            </div>

                            <div className="explain-section">
                                <h4>Why This Action?</h4>
                                <p className="reason-text">
                                    The agent attempted to perform an action outside its designated scope. The WAF
                                    contained the violation to prevent unauthorized access or behavior escalation.
                                    This demonstrates agent-level boundary enforcement.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const hasAnyEvents = metrics.totalEvents > 0;

    return (
        <div className="page-container waf-page">
            <div className="waf-header">
                <div className="breadcrumb">
                    <span className="text-muted">AI Security / Web Application Firewall</span>
                    <h1 className="page-title">🛡️ AI WAF - Multi-Layer Guardrail System</h1>
                    <p className="page-description">
                        Real-time AI Web Application Firewall protecting LLM agents from prompt injection,
                        unsafe outputs, and agent behavior violations
                    </p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setShowDocumentation(true)}>
                        <BookOpen size={14} />
                        How It Works
                    </button>
                </div>
            </div>

            {!hasAnyEvents && (
                <div className="waf-empty-banner">
                    <div className="empty-banner-content">
                        <FileSearch size={32} />
                        <div>
                            <h3>No WAF Events Yet</h3>
                            <p>
                                WAF events are generated when you submit artifacts for analysis. The AI WAF will intercept,
                                analyze, and log security events based on your inputs.
                            </p>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/add-artifact')}>
                            Add Artifact to Start
                        </button>
                    </div>
                </div>
            )}

            {showDocumentation && renderDocumentation()}

            <div className="waf-content">
                <div className="waf-main">
                    <div className="waf-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'input-guard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('input-guard')}
                        >
                            Input Guard
                            {wafEvents.inputGuard.length > 0 && (
                                <span className="tab-badge">{wafEvents.inputGuard.length}</span>
                            )}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'output-guard' ? 'active' : ''}`}
                            onClick={() => setActiveTab('output-guard')}
                        >
                            Output Guard
                            {wafEvents.outputGuard.length > 0 && (
                                <span className="tab-badge">{wafEvents.outputGuard.length}</span>
                            )}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
                            onClick={() => setActiveTab('behavior')}
                        >
                            Behavior Violations
                            {wafEvents.behaviorViolations.length > 0 && (
                                <span className="tab-badge">{wafEvents.behaviorViolations.length}</span>
                            )}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('metrics')}
                        >
                            Risk Metrics
                        </button>
                    </div>

                    <div className="tab-content">
                        {activeTab === 'input-guard' && renderInputGuard()}
                        {activeTab === 'output-guard' && renderOutputGuard()}
                        {activeTab === 'behavior' && renderBehaviorViolations()}
                        {activeTab === 'metrics' && renderRiskMetrics()}
                    </div>
                </div>

                <div className="waf-sidebar">{renderExplainability()}</div>
            </div>
        </div>
    );
};

export default AIWaf;
