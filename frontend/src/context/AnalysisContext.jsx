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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    const updateAnalysisReport = (report) => {
        setAnalysisReport(report);
        setError(null);
    };

    const clearAnalysisReport = () => {
        setAnalysisReport(null);
        setError(null);
    };

    const setAnalysisError = (err) => {
        setError(err);
    };

    const value = {
        analysisReport,
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
