// API Configuration
export const API_CONFIG = {
    BASE_URL: 'http://localhost:8000',
    API_VERSION: '/api/v1',
    WS_URL: 'ws://localhost:8000',
};

export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

export const getWsUrl = (endpoint) => {
    return `${API_CONFIG.WS_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};
