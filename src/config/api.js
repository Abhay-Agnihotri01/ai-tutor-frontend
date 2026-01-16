const envApiUrl = import.meta.env.VITE_API_URL;
export const API_URL = envApiUrl && !envApiUrl.endsWith('/api')
    ? `${envApiUrl}/api`
    : (envApiUrl || 'http://localhost:5000/api');

export const BASE_URL = API_URL.replace(/\/api$/, '');
