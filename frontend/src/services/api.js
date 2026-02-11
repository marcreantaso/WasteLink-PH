import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Attach JWT token
api.interceptors.request.use(async (config) => {
    try {
        const auth = await AsyncStorage.getItem('wastelink_auth');
        if (auth) {
            const { token } = JSON.parse(auth);
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) { }
    return config;
});

// Handle errors
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            AsyncStorage.removeItem('wastelink_auth');
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (phone, pin) => api.post('/auth/login', { phone, pin }),
    me: () => api.get('/users/me'),
};

// Collections
export const collectionsAPI = {
    list: (params) => api.get('/collections', { params }),
    create: (data) => api.post('/collections', data),
    sync: (items) => api.post('/collections/sync', { items }),
};

// Marketplace
export const marketplaceAPI = {
    listings: (params) => api.get('/marketplace/listings', { params }),
    createListing: (data) => api.post('/marketplace/listings', data),
    bids: (listingId) => api.get(`/marketplace/listings/${listingId}/bids`),
    placeBid: (listingId, data) => api.post(`/marketplace/listings/${listingId}/bids`, data),
    acceptBid: (bidId) => api.patch(`/marketplace/bids/${bidId}/accept`),
    rejectBid: (bidId) => api.patch(`/marketplace/bids/${bidId}/reject`),
};

// Earnings
export const earningsAPI = {
    summary: (params) => api.get('/earnings', { params }),
    requestPayout: (data) => api.post('/earnings/payout', data),
};

// Health & Safety
export const healthAPI = {
    incidents: () => api.get('/health-incidents'),
    create: (data) => api.post('/health-incidents', data),
    alert: (incidentId) => api.post(`/health-incidents/${incidentId}/alert`),
};

// Admin
export const adminAPI = {
    analytics: (params) => api.get('/admin/analytics', { params }),
    users: (params) => api.get('/admin/users', { params }),
    verifyUser: (userId) => api.patch(`/admin/users/${userId}/verify`),
};

export default api;
