import React, { useMemo } from 'react';
import {
  Share2,
  Wrench,
  Zap,
  Flame,
  Shield,
  Ticket,
  FileSearch,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalysis } from '../context/AnalysisContext';
import { filterBySeverity } from '../utils/findingsHelpers';
import './Remediation.css';

const Remediation = () => {
  const { analysisReport } = useAnalysis();
  const navigate = useNavigate();

  const remediationGroups = useMemo(() => {
    if (!analysisReport?.findings?.length) {
      return { quickWins: [], highImpact: [], longTerm: [] };
    }
    const allFindings = analysisReport.findings;
    const high = filterBySeverity(allFindings, ['high', 'critical']);
    const medium = filterBySeverity(allFindings, ['medium']);
    const low = filterBySeverity(allFindings, ['low', 'info']);

    return {
      highImpact: high,
      quickWins: medium,
      longTerm: low,
    };
  }, [analysisReport]);

  const hasData = remediationGroups.highImpact.length > 0 ||
    remediationGroups.quickWins.length > 0 ||
    remediationGroups.longTerm.length > 0;

  const renderFindingCard = (finding, idx) => (
    <div className="finding-card" key={idx}>
      <div className="finding-main">
        <div className="finding-header">
          <h4>
            {finding.finding_type || 'Security Finding'}{' '}
            <span className={`score ${['critical', 'high'].includes((finding.severity || '').toLowerCase()) ? 'red' : ''}`}>
              {finding.agent_name || ''} • {(finding.severity || 'medium').toUpperCase()}
            </span>
          </h4>
        </div>
        <p className="finding-desc">{finding.description}</p>
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
          <label>SEVERITY</label>
          <span className={`severity-${(finding.severity || 'medium').toLowerCase()}`}>
            {(finding.severity || 'medium').toUpperCase()}
          </span>
        </div>
        <div className="meta-item">
          <label>COMPONENT</label>
          <span>{finding.location || 'Unknown'}</span>
        </div>
        <div className="meta-item">
          <label>AGENT</label>
          <span>{finding.agent_name || '—'}</span>
        </div>
        {finding.derived_from && (
          <div className="meta-item">
            <label>SOURCE</label>
            <span className="derived-from-badge">{finding.derived_from}</span>
          </div>
        )}
        <button className="btn-jira" onClick={() => alert('Jira: Would create ticket.')}>
          <Ticket size={14} />
          Create Jira Ticket
        </button>
      </div>
    </div>
  );

  if (!hasData) {
    return (
      <div className="page-container">
        <header className="page-header">
          <div className="breadcrumb">
            <span className="text-muted">Actionable Findings</span>
            <h1 className="page-title">Remediation Plan</h1>
          </div>
        </header>
        <div className="empty-state-card">
          <FileSearch size={48} color="#6e7681" />
          <h3>No Remediation Data</h3>
          <p>Run an analysis first. Remediation suggestions come from the Remediation Engineer and other agents.</p>
          <button className="btn-primary" onClick={() => navigate('/add-artifact')}>
            Add Artifact & Run Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="breadcrumb">
          <span className="text-muted">Actionable Findings</span>
          <h1 className="page-title">Remediation Plan</h1>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => alert('Share: Would generate shareable plan.')}>
            <Share2 size={16} />
            Share Plan
          </button>
          <button className="btn-primary" onClick={() => alert('Auto-Fix: Would apply safe fixes.')}>
            <Wrench size={16} />
            Auto-Fix Safe Items
          </button>
        </div>
      </header>

      {remediationGroups.highImpact.length > 0 && (
        <section className="remediation-section">
          <div className="section-header">
            <div className="icon-box red">
              <Flame size={20} color="#f87171" />
            </div>
            <div>
              <h3 className="section-title">High Impact</h3>
              <p className="section-desc">Critical/high severity findings requiring immediate attention.</p>
            </div>
          </div>
          {remediationGroups.highImpact.map(renderFindingCard)}
        </section>
      )}

      {remediationGroups.quickWins.length > 0 && (
        <section className="remediation-section">
          <div className="section-header">
            <div className="icon-box green">
              <Zap size={20} color="#34d399" />
            </div>
            <div>
              <h3 className="section-title">Quick Wins</h3>
              <p className="section-desc">Medium severity – lower effort fixes.</p>
            </div>
          </div>
          {remediationGroups.quickWins.map(renderFindingCard)}
        </section>
      )}

      {remediationGroups.longTerm.length > 0 && (
        <section className="remediation-section">
          <div className="section-header">
            <div className="icon-box blue">
              <Shield size={20} color="#60a5fa" />
            </div>
            <div>
              <h3 className="section-title">Long-term Hardening</h3>
              <p className="section-desc">Low/info severity – strategic improvements.</p>
            </div>
          </div>
          {remediationGroups.longTerm.map(renderFindingCard)}
        </section>
      )}
    </div>
  );
};

export default Remediation;
