import { getApiUrl, getWsUrl } from '../config';

/**
 * API Service for Sentinel Backend
 * Handles all communication with the FastAPI backend
 */

class SentinelAPI {
    /**
     * Analyze an artifact using the multi-agent system
     * @param {Object} artifactData - The artifact data to analyze
     * @param {string} artifactData.artifact_type - Type: 'code', 'architecture', 'logs', 'api_spec'
     * @param {string} artifactData.content - The content to analyze
     * @param {Object} artifactData.metadata - Optional metadata
     * @returns {Promise<Object>} Security report with findings
     */
    async analyzeArtifact(artifactData) {
        try {
            const response = await fetch(getApiUrl('/analyze'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(artifactData),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return {
                success: true,
                data,
            };
        } catch (error) {
            console.error('Error analyzing artifact:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Connect to WebSocket for real-time agent monitoring
     * @param {Function} onMessage - Callback for incoming messages
     * @param {Function} onError - Callback for errors
     * @returns {WebSocket} WebSocket connection
     */
    connectMonitor(onMessage, onError) {
        try {
            const ws = new WebSocket(getWsUrl('/ws/monitor'));

            ws.onopen = () => {
                console.log('WebSocket connected to agent monitor');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (onError) onError(error);
            };

            ws.onclose = () => {
                console.log('WebSocket connection closed');
            };

            return ws;
        } catch (error) {
            console.error('Error creating WebSocket:', error);
            if (onError) onError(error);
            return null;
        }
    }

    /**
     * Check backend health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        try {
            const response = await fetch(getApiUrl('/'));
            const data = await response.json();
            return {
                success: true,
                data,
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

// Export singleton instance
export const sentinelAPI = new SentinelAPI();
export default sentinelAPI;
