import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle, FileCode, FileText, Shield, Terminal, FileUp, Link, Github } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import { sentinelAPI } from '../services/api';
import { ARTIFACT_TYPES } from '../constants/agents';
import './ArtifactInput.css';

const ARTIFACT_ICONS = {
  code: FileCode,
  architecture: Shield,
  logs: Terminal,
  api_spec: FileText,
};

const INPUT_MODES = [
  { key: 'text', label: 'Text / Code', icon: FileCode },
  { key: 'pdf_upload', label: 'PDF Upload', icon: FileUp },
  { key: 'pdf_url', label: 'PDF URL', icon: Link },
  { key: 'github', label: 'GitHub Link', icon: Github },
];

const ArtifactInput = () => {
  const navigate = useNavigate();
  const { updateAnalysisReport, setIsAnalyzing, setAnalysisError } = useAnalysis();
  const fileInputRef = useRef(null);

  const [inputMode, setInputMode] = useState('text');
  const [artifactType, setArtifactType] = useState('architecture');
  const [content, setContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const runAnalysis = async (result, preview) => {
    if (result.success) {
      updateAnalysisReport(result.data, preview);
      setSubmitStatus('success');
      setTimeout(() => navigate('/risk-summary'), 1500);
    } else {
      setAnalysisError(result.error);
      setSubmitStatus('error');
    }
  };

  const handleAnalyze = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setIsAnalyzing(true);

    try {
      if (inputMode === 'text') {
        if (!content.trim()) {
          setAnalysisError('Please enter some content to analyze.');
          setSubmitStatus('error');
          return;
        }
        const result = await sentinelAPI.analyzeArtifact({
          artifact_type: artifactType,
          content: content.trim(),
          metadata: { source: 'web_ui', timestamp: new Date().toISOString() },
        });
        await runAnalysis(result, { type: artifactType, contentPreview: content.trim().slice(0, 200) + (content.length > 200 ? '...' : '') });
      } else if (inputMode === 'pdf_upload') {
        const file = fileInputRef.current?.files?.[0];
        if (!file || !file.name?.toLowerCase().endsWith('.pdf')) {
          setAnalysisError('Please select a PDF file.');
          setSubmitStatus('error');
          return;
        }
        const result = await sentinelAPI.analyzePdfUpload(file);
        await runAnalysis(result, { type: 'pdf_document', contentPreview: `PDF: ${file.name}` });
      } else if (inputMode === 'pdf_url') {
        if (!pdfUrl.trim()) {
          setAnalysisError('Please enter a PDF URL.');
          setSubmitStatus('error');
          return;
        }
        const result = await sentinelAPI.analyzePdfUrl(pdfUrl.trim());
        await runAnalysis(result, { type: 'pdf_document', contentPreview: `PDF URL: ${pdfUrl.slice(0, 50)}...` });
      } else if (inputMode === 'github') {
        if (!githubUrl.trim()) {
          setAnalysisError('Please enter a GitHub URL.');
          setSubmitStatus('error');
          return;
        }
        const result = await sentinelAPI.analyzeGitHub(githubUrl.trim());
        await runAnalysis(result, { type: 'code_repository', contentPreview: `GitHub: ${githubUrl.slice(0, 50)}...` });
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

  const selectedMeta = ARTIFACT_TYPES[artifactType];

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
          Text, PDF (upload/URL), or GitHub links. All agents + ML analytics process every artifact.
        </div>
      </header>

      <div className="artifact-guidance-bar">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Artifact Input</h2>
          <p className="text-muted text-sm">
            Choose input mode. PDFs and GitHub repos are analyzed by all agents and the Local ML engine.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={isSubmitting}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
            background: isSubmitting ? '#666' : 'var(--accent-cyan)', color: '#000', fontWeight: '600',
            border: 'none', borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '14px',
          }}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />}
          {submitStatus === 'success' && <CheckCircle size={16} />}
          {submitStatus === 'error' && <AlertCircle size={16} />}
          {isSubmitting ? 'Analyzing...' : submitStatus === 'success' ? 'Complete!' : 'Run Analysis'}
        </button>
      </div>

      {/* Input mode selector */}
      <div className="artifact-type-selector">
        <label className="input-label">Input Mode</label>
        <div className="artifact-type-tabs">
          {INPUT_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`artifact-type-tab ${inputMode === m.key ? 'active' : ''}`}
              onClick={() => setInputMode(m.key)}
            >
              <m.icon size={16} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {inputMode === 'text' && (
        <>
          <div className="artifact-type-selector mt-2">
            <label className="input-label">Artifact Type</label>
            <div className="artifact-type-tabs">
              {Object.entries(ARTIFACT_TYPES).map(([key, meta]) => {
                const Icon = ARTIFACT_ICONS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`artifact-type-tab ${artifactType === key ? 'active' : ''}`}
                    onClick={() => setArtifactType(key)}
                  >
                    <Icon size={16} />
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="input-desc mt-2">{selectedMeta?.description}</p>
          </div>
          <div className="input-group mt-4">
            <textarea
              className="code-input font-mono"
              rows={12}
              placeholder={`Paste your ${selectedMeta?.label.toLowerCase()} here...`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </>
      )}

      {inputMode === 'pdf_upload' && (
        <div className="input-group mt-4">
          <label className="input-label">Select PDF File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="file-input"
          />
          <p className="input-desc mt-2">Upload a PDF. All agents + ML will analyze extracted text and sections.</p>
        </div>
      )}

      {inputMode === 'pdf_url' && (
        <div className="input-group mt-4">
          <label className="input-label">PDF URL</label>
          <input
            type="url"
            className="code-input"
            placeholder="https://example.com/document.pdf"
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
          />
          <p className="input-desc mt-2">Enter a URL to a PDF. The document will be fetched and analyzed.</p>
        </div>
      )}

      {inputMode === 'github' && (
        <div className="input-group mt-4">
          <label className="input-label">GitHub URL</label>
          <input
            type="url"
            className="code-input"
            placeholder="https://github.com/org/repo or .../blob/main/file.py"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
          <p className="input-desc mt-2">Full repo, single file, commit, or PR. Read-only fetch via API.</p>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .artifact-type-selector { margin-bottom: 1rem; }
        .artifact-type-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .artifact-type-tab { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px;
          border: 1px solid #1e2630; background: #0f141a; color: #8b949e; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .artifact-type-tab:hover { border-color: #22d3ee; color: #e6edf3; }
        .artifact-type-tab.active { border-color: #22d3ee; background: rgba(34, 211, 238, 0.1); color: #22d3ee; }
        .input-label { font-weight: 600; color: #e6edf3; display: block; margin-bottom: 4px; }
        .mt-2 { margin-top: 0.5rem; } .mt-4 { margin-top: 1rem; }
        .file-input { padding: 12px; background: #0f141a; border: 1px solid #1e2630; border-radius: 8px; color: #e6edf3; width: 100%; }
      `}</style>
    </div>
  );
};

export default ArtifactInput;
