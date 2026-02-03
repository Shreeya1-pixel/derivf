/**
 * Agent and artifact type constants - maps backend models to frontend views
 */

export const ARTIFACT_TYPES = {
  code: {
    label: 'Code Snippet',
    description: 'Paste security-critical code, handlers, or logic for Security Review',
    hint: 'Feeds: Logic Auditor (Security Agent)',
  },
  architecture: {
    label: 'Architecture / Design',
    description: 'Describe system design, data flows, and trust boundaries',
    hint: 'Feeds: Threat Modeler',
  },
  logs: {
    label: 'Logs / SOC Context',
    description: 'Paste log lines, alerts, or incident notes for correlation analysis',
    hint: 'Feeds: SOC Intelligence',
  },
  api_spec: {
    label: 'API Spec / Contract',
    description: 'OpenAPI spec, endpoint definitions, or API documentation',
    hint: 'Feeds: Threat + Security agents',
  },
};

export const AGENT_NAMES = {
  THREAT_MODELER: 'Threat Modeler',
  LOGIC_AUDITOR: 'Logic Auditor',
  SOC_INTELLIGENCE: 'SOC Intelligence',
  REMEDIATION_ENGINEER: 'Remediation Engineer',
};

/** Which page displays which agent's findings */
export const AGENT_TO_PAGE = {
  [AGENT_NAMES.THREAT_MODELER]: '/threat-modeling',
  [AGENT_NAMES.LOGIC_AUDITOR]: '/security-review',
  [AGENT_NAMES.SOC_INTELLIGENCE]: '/soc-alerts',
  [AGENT_NAMES.REMEDIATION_ENGINEER]: '/remediation',
};
