import axios from 'axios';
import qs from 'qs';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || '';

export const isStrapiConfigured = !!STRAPI_URL;

export const strapi = axios.create({
    baseURL: `${STRAPI_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
        Authorization: STRAPI_TOKEN ? `Bearer ${STRAPI_TOKEN}` : '',
    },
    timeout: 10000, // 10 second timeout
});

// Interceptor to add token from local storage if available
strapi.interceptors.request.use((config) => {
    const token = localStorage.getItem('strapi_jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for better error logging
strapi.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
            console.warn('[Strapi] Server not reachable. Is the backend running on', STRAPI_URL, '?');
        }
        return Promise.reject(error);
    }
);

export const strapiApi = {
    // Auth
    login: async (identifier: string, password: string) => {
        const { data } = await strapi.post('/auth/local', { identifier, password });
        if (data.jwt) {
            localStorage.setItem('strapi_jwt', data.jwt);
            localStorage.setItem('strapi_user', JSON.stringify(data.user));
        }
        return data;
    },
    register: async (username: string, email: string, password: string) => {
        const { data } = await strapi.post('/auth/local/register', { username, email, password });
        return data;
    },
    logout: () => {
        localStorage.removeItem('strapi_jwt');
        localStorage.removeItem('strapi_user');
    },

    // Content
    find: async (collection: string, params: any = {}) => {
        const query = qs.stringify(params, { encodeValuesOnly: true });
        const { data } = await strapi.get(`/${collection}?${query}`);
        return data;
    },
    create: async (collection: string, payload: any) => {
        const { data } = await strapi.post(`/${collection}`, { data: payload });
        return data;
    },
    update: async (collection: string, id: string | number, payload: any) => {
        const { data } = await strapi.put(`/${collection}/${id}`, { data: payload });
        return data;
    },
    delete: async (collection: string, id: string | number) => {
        const { data } = await strapi.delete(`/${collection}/${id}`);
        return data;
    },

    // File Upload
    upload: async (formData: FormData) => {
        const { data } = await strapi.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
    }
};
