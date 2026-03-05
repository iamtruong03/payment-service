import axiosClient from '@/api/axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/features/auth/types/auth';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return res.data.data;
    },

    register: async (data: RegisterRequest): Promise<{ message: string }> => {
        const res = await axiosClient.post<ApiResponse<{ message: string }>>('/auth/register', data);
        return res.data.data;
    },
};
