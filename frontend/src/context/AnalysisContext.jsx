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

    const updateAnalysisReport = (report, artifactMeta = null) => {
        setAnalysisReport(report);
        if (artifactMeta) setLastArtifact(artifactMeta);
        setError(null);
    };

    const clearAnalysisReport = () => {
        setAnalysisReport(null);
        setLastArtifact(null);
        setError(null);
    };

    const setAnalysisError = (err) => {
        setError(err);
    };

    const value = {
        analysisReport,
        lastArtifact,
        isAnalyzing,
        error,
        updateAnalysisReport,
        clearAnalysisReport,
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
