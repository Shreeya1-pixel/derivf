import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { sentinelAPI } from '../services/api';
import './ArtifactInput.css';

const ArtifactInput = () => {
    const navigate = useNavigate();
    const { updateAnalysisReport, setIsAnalyzing, setAnalysisError } = useAnalysis();

    const [formData, setFormData] = useState({
        architecture: '',
        code: '',
        logs: '',
        workflow: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAnalyze = async () => {
        setIsSubmitting(true);
        setSubmitStatus(null);
        setIsAnalyzing(true);

        // Combine all inputs into a single content string
        const combinedContent = `
=== ARCHITECTURE ===
${formData.architecture}

=== CODE ===
${formData.code}

=== LOGS ===
${formData.logs}

=== WORKFLOW ===
${formData.workflow}
        `.trim();

        try {
            const result = await sentinelAPI.analyzeArtifact({
                artifact_type: 'architecture',
                content: combinedContent,
                metadata: {
                    source: 'web_ui',
                    timestamp: new Date().toISOString()
                }
            });

            if (result.success) {
                updateAnalysisReport(result.data);
                setSubmitStatus('success');

                // Navigate to risk summary after a short delay
                setTimeout(() => {
                    navigate('/risk-summary');
                }, 1500);
            } else {
                setAnalysisError(result.error);
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            setAnalysisError(error.message);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header custom-layout">
                <div>
                    <div className="breadcrumb">
                        <span className="text-muted">Input Entry Point</span>
                        <h1 className="page-title">Add Artifact / System</h1>
                    </div>
                </div>
                <div className="text-muted text-sm flex items-center gap-2">
                    Safe, offline analysis. No credentials required.
                </div>
            </header>

            <div className="artifact-guidance-bar">
                <div>
                    <h2 className="text-lg font-semibold text-white mb-1">Artifact Details</h2>
                    <p className="text-muted text-sm">Describe the system or paste relevant artifacts. This will be used by threat modeling, security review, and SOC agents.</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={handleAnalyze}
                    disabled={isSubmitting}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        background: isSubmitting ? '#666' : 'var(--primary)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}
                >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
                    {submitStatus === 'success' && <CheckCircle size={16} />}
                    {submitStatus === 'error' && <AlertCircle size={16} />}
                    {isSubmitting ? 'Analyzing...' : submitStatus === 'success' ? 'Analysis Complete!' : 'Run Analysis'}
                </button>
            </div>

            <div className="input-forms-grid">
                <div className="input-group">
                    <div className="input-header">
                        <label>Architecture Description</label>
                        <span className="feed-hint">Feeds: Threat Modeling Agent</span>
                    </div>
                    <div className="input-desc">Best for demos. High-level description of services, data flows, and entry points.</div>
                    <textarea
                        className="code-input"
                        rows={4}
                        value={formData.architecture}
                        onChange={(e) => handleInputChange('architecture', e.target.value)}
                    ></textarea>
                </div>

                <div className="input-group">
                    <div className="input-header">
                        <label>Code Snippet</label>
                        <span className="feed-hint">Feeds: Security Review Agent</span>
                    </div>
                    <div className="input-desc">Paste any relevant handler, query, or security-critical logic.</div>
                    <textarea
                        className="code-input font-mono"
                        rows={4}
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                    ></textarea>
                </div>

                <div className="input-group">
                    <div className="input-header">
                        <label>Logs / SOC Context</label>
                        <span className="feed-hint">Feeds: SOC Intelligence Agent</span>
                    </div>
                    <div className="input-desc">Paste relevant log lines, alert text, or incident notes.</div>
                    <textarea
                        className="code-input font-mono"
                        rows={4}
                        value={formData.logs}
                        onChange={(e) => handleInputChange('logs', e.target.value)}
                    ></textarea>
                </div>

                <div className="input-group">
                    <div className="input-header">
                        <label>Bot or Workflow Logic</label>
                        <span className="feed-hint">Feeds: Cross-Agent Reasoning</span>
                    </div>
                    <div className="input-desc">Optional. Describe automation, bots, or workflows that act on user data.</div>
                    <textarea
                        className="code-input font-mono"
                        rows={4}
                        value={formData.workflow}
                        onChange={(e) => handleInputChange('workflow', e.target.value)}
                    ></textarea>
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ArtifactInput;
