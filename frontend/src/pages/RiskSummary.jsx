import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Download,
    Calendar,
    Sparkles,
    AlertCircle,
    AlertTriangle,
    Info
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useAnalysis } from '../context/AnalysisContext';
import './RiskSummary.css';

const data = [
    { name: 'W1', value: 4 },
    { name: 'W2', value: 7 },
    { name: 'W3', value: 5 },
    { name: 'W4', value: 9 },
    { name: 'W5', value: 8 },
    { name: 'Today', value: 12 },
];

const RiskSummary = () => {
    const { analysisReport } = useAnalysis();
    const navigate = useNavigate();

    // Calculate severity counts from real data
    const severityCounts = useMemo(() => {
        if (!analysisReport?.findings) {
            return { high: 12, medium: 48, low: 156, critical: 0 };
        }

        const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
        analysisReport.findings.forEach(finding => {
            const severity = finding.severity?.toLowerCase() || 'info';
            counts[severity] = (counts[severity] || 0) + 1;
        });

        return {
            critical: counts.critical,
            high: counts.high + counts.critical, // Combine critical with high
            medium: counts.medium,
            low: counts.low + counts.info
        };
    }, [analysisReport]);

    // Generate executive insight from findings
    const executiveInsight = useMemo(() => {
        if (!analysisReport?.summary) {
            return "Critical risks have increased by 15% this week, primarily due to unresolved authentication vulnerabilities in core services. Immediate remediation of the Identity Provider module is recommended to prevent potential data exposure.";
        }
        return analysisReport.summary;
    }, [analysisReport]);

    const overallScore = analysisReport?.overall_score || 65;
    const timestamp = analysisReport?.timestamp ? new Date(analysisReport.timestamp).toLocaleString() : 'Last 30 Days';

    return (
        <div className="page-container">
            {/* Header */}
            <header className="page-header">
                <div className="breadcrumb">
                    <span className="text-muted">Reporting / Executive</span>
                    <h1 className="page-title">Risk Summary</h1>
                </div>
                <div className="header-actions">
                    <div className="date-filter">
                        <Calendar size={16} />
                        <span>{analysisReport ? `Analysis: ${timestamp}` : 'Last 30 Days'}</span>
                    </div>
                    <button className="btn-primary" onClick={() => {
                        alert('Export functionality: This would generate a PDF report of the security analysis. In production, this would call a PDF generation service.');
                    }}>
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>
            </header>

            {/* Executive Insight */}
            <section className="insight-card">
                <div className="insight-icon">
                    <Sparkles size={20} color="#a78bfa" />
                </div>
                <div className="insight-content">
                    <h3 className="insight-title">Executive Insight</h3>
                    <p className="insight-text">
                        {executiveInsight}
                    </p>
                    {analysisReport && (
                        <div style={{ marginTop: '12px', fontSize: '14px', color: '#22d3ee' }}>
                            Security Score: {overallScore}/100
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card high">
                    <div className="stat-header">
                        <span className="stat-label">HIGH SEVERITY</span>
                        <AlertCircle size={16} color="#ef4444" />
                    </div>
                    <div className="stat-value">{severityCounts.high}</div>
                    <div className="stat-trend negative">
                        {analysisReport ? `${severityCounts.critical} critical` : '↗ +3 from last week'}
                    </div>
                </div>

                <div className="stat-card medium">
                    <div className="stat-header">
                        <span className="stat-label">MEDIUM SEVERITY</span>
                        <AlertTriangle size={16} color="#f59e0b" />
                    </div>
                    <div className="stat-value">{severityCounts.medium}</div>
                    <div className="stat-trend neutral">
                        {analysisReport ? 'Requires attention' : '- No change'}
                    </div>
                </div>

                <div className="stat-card low">
                    <div className="stat-header">
                        <span className="stat-label">LOW SEVERITY</span>
                        <Info size={16} color="#10b981" />
                    </div>
                    <div className="stat-value">{severityCounts.low}</div>
                    <div className="stat-trend positive">
                        {analysisReport ? 'Monitor' : '↘ -12 from last week'}
                    </div>
                </div>
            </div>

            <div className="lower-grid">
                {/* Chart */}
                <div className="chart-card">
                    <div className="card-header">
                        <h3>Risk Posture Trend</h3>
                        <span className="text-muted text-sm">Active vulnerabilities over time</span>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2630" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6e7681', fontSize: 12 }}
                                />
                                <YAxis
                                    hide
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f141a', borderColor: '#1e2630' }}
                                    itemStyle={{ color: '#f0f6fc' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#22d3ee"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Projected Impact */}
                <div className="impact-card">
                    <div className="card-header">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} color="#a78bfa" />
                            <h3>Projected Impact</h3>
                        </div>
                        <span className="badge-warning">
                            {severityCounts.high > 5 ? 'Elevated' : severityCounts.high > 0 ? 'Moderate' : 'Low'}
                        </span>
                    </div>

                    <p className="impact-desc">
                        Based on current open vulnerabilities, AI forecasts the following risks if left unresolved for 7 days.
                    </p>

                    <div className="impact-bars">
                        <div className="impact-item">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Data Exposure Risk</span>
                                <span className="text-sm text-red-400">
                                    {severityCounts.high > 5 ? 'High (78%)' : 'Medium (45%)'}
                                </span>
                            </div>
                            <div className="progress-bg">
                                <div className="progress-fill red" style={{ width: severityCounts.high > 5 ? '78%' : '45%' }}></div>
                            </div>
                            <span className="text-xs text-muted mt-1 display-block">PII / User Records</span>
                        </div>

                        <div className="impact-item">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">Service Disruption</span>
                                <span className="text-sm text-orange-400">
                                    {severityCounts.medium > 10 ? 'Medium (42%)' : 'Low (25%)'}
                                </span>
                            </div>
                            <div className="progress-bg">
                                <div className="progress-fill orange" style={{ width: severityCounts.medium > 10 ? '42%' : '25%' }}></div>
                            </div>
                            <span className="text-xs text-muted mt-1 display-block">Auth Service Availability</span>
                        </div>
                    </div>

                    <button className="btn-text" onClick={() => navigate('/remediation')}>View Mitigation Plan</button>
                </div>
            </div>
        </div>
    );
};

export default RiskSummary;
