import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// ─── Request interceptor: attach JWT ──────────────────────────────────────────
axiosClient.interceptors.request.use(
    (config) => {
        // Try zustand store first (SSR-safe), fallback to localStorage
        let token: string | null = null;
        try {
            token = useAuthStore.getState().token;
        } catch {
            token = null;
        }
        if (!token && typeof window !== 'undefined') {
            token = localStorage.getItem('auth-token');
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: handle auth errors ─────────────────────────────────
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear auth and redirect to login
            try {
                useAuthStore.getState().logout();
            } catch {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('auth-token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
