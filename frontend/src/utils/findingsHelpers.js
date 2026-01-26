// Helper function to group findings by agent
export const groupFindingsByAgent = (findings) => {
    if (!findings || !Array.isArray(findings)) return {};

    const grouped = {};
    findings.forEach(finding => {
        const agent = finding.agent_name || 'Unknown';
        if (!grouped[agent]) {
            grouped[agent] = [];
        }
        grouped[agent].push(finding);
    });

    return grouped;
};

// Helper function to filter findings by severity
export const filterBySeverity = (findings, severities) => {
    if (!findings || !Array.isArray(findings)) return [];
    if (!severities || severities.length === 0) return findings;

    return findings.filter(finding =>
        severities.includes(finding.severity?.toLowerCase())
    );
};

// Helper function to get remediation priority
export const getRemediationPriority = (finding) => {
    const severity = finding.severity?.toLowerCase();
    if (severity === 'critical' || severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
};

// Helper function to format finding for display
export const formatFinding = (finding) => {
    return {
        title: finding.finding_type || 'Security Finding',
        description: finding.description || 'No description available',
        severity: finding.severity || 'info',
        location: finding.location || 'Unknown',
        suggestion: finding.suggestion || 'No suggestion available',
        agent: finding.agent_name || 'Unknown Agent'
    };
};
