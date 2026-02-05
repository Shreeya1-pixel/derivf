import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext();

export const useAnalysis = () => {
    const context = useContext(AnalysisContext);
    if (!context) {
        throw new Error('useAnalysis must be used within AnalysisProvider');
    }
    return context;
};

export const AnalysisProvider = ({ children }) => {
    const [analysisReport, setAnalysisReport] = useState(null);
    const [lastArtifact, setLastArtifact] = useState(null); // { type, contentPreview }
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    // WAF Events Storage
    const [wafEvents, setWafEvents] = useState({
        inputGuard: [],
        outputGuard: [],
        behaviorViolations: []
    });
    const [analysisHistory, setAnalysisHistory] = useState([]); // All past analyses

    const updateAnalysisReport = (report, artifactMeta = null) => {
        setAnalysisReport(report);
        if (artifactMeta) setLastArtifact(artifactMeta);
        setError(null);

        // Add to history
        if (report) {
            setAnalysisHistory(prev => [{
                id: report.id,
                timestamp: report.timestamp || new Date().toISOString(),
                artifactType: artifactMeta?.type || 'unknown',
                summary: report.summary,
                overallScore: report.overall_score,
                findingsCount: report.findings?.length || 0
            }, ...prev]);
        }
    };

    const addWafEvent = (eventType, event) => {
        setWafEvents(prev => ({
            ...prev,
            [eventType]: [event, ...prev[eventType]]
        }));
    };

    const clearAnalysisReport = () => {
        setAnalysisReport(null);
        setLastArtifact(null);
        setError(null);
    };

    const clearWafEvents = () => {
        setWafEvents({
            inputGuard: [],
            outputGuard: [],
            behaviorViolations: []
        });
    };

    const setAnalysisError = (err) => {
        setError(err);
    };

    const value = {
        analysisReport,
        lastArtifact,
        isAnalyzing,
        error,
        wafEvents,
        analysisHistory,
        updateAnalysisReport,
        addWafEvent,
        clearAnalysisReport,
        clearWafEvents,
        setIsAnalyzing,
        setAnalysisError,
    };

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    );
};

export default AnalysisContext;
