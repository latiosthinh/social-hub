import axios from 'axios';

// In Next.js, relative paths '/api/...' work for same-domain requests
const api = axios.create({
    baseURL: '/api',
});

// Add user ID to headers
api.interceptors.request.use((config) => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            config.headers['x-user-id'] = userId;
        }
    }
    return config;
});

export const getAccounts = async () => {
    // Check local storage inside the function or assume interceptor handles it
    // But getAccounts needs userId as query param for the GET route we created
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    const res = await api.get(`/accounts${userId ? `?userId=${userId}` : ''}`);
    return res.data;
};

export const addAccount = async (platform: string, displayName: string) => {
    // Note: The backend route implementation for POST /accounts is missing in my previous step?
    // Wait, I created services/accounts.ts/addAccount but did I create the POST route?
    // I created app/api/accounts/route.ts with GET only!
    // I need to add POST to app/api/accounts/route.ts
    const res = await api.post('/accounts', { platform, display_name: displayName });
    return res.data;
};

export const toggleAccount = async (id: string, isActive: boolean) => {
    const res = await api.post(`/accounts/toggle`, { type: 'account', id, isActive });
    return res.data;
};

export const toggleGroup = async (platform: string, isActive: boolean) => {
    // Need user_id for group toggle
    const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    const res = await api.post(`/accounts/toggle`, { type: 'group', userId, platform, isActive });
    return res.data;
};

export default api;
