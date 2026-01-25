import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

// Add user ID to headers
api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
        config.headers['x-user-id'] = userId;
    }
    return config;
});

export const getAccounts = async () => {
    const res = await api.get('/accounts');
    return res.data;
};

export const addAccount = async (platform: string, displayName: string) => {
    const res = await api.post('/accounts', { platform, display_name: displayName });
    return res.data;
};

export const toggleAccount = async (id: string, isActive: boolean) => {
    const res = await api.patch(`/accounts/${id}/toggle`, { is_active: isActive });
    return res.data;
};

export const toggleGroup = async (platform: string, isActive: boolean) => {
    const res = await api.patch(`/accounts/group/${platform}/toggle`, { is_active: isActive });
    return res.data;
};

export default api;
