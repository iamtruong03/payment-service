import axiosClient from '@/api/axiosClient';
import type {
    User,
    UserProfile,
    UserCreateRequest,
    UserUpdateRequest,
    UserStatusUpdateRequest,
    UserRoleUpdateRequest,
    PageResponse,
} from '@/features/users/types/user';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
}

export const userApi = {
    // ─── Self-service ──────────────────────────────────────────────────────────
    getMyProfile: async (): Promise<UserProfile> => {
        const res = await axiosClient.get<ApiResponse<UserProfile>>('/users/me');
        return res.data.data;
    },

    updateMyProfile: async (data: UserUpdateRequest): Promise<UserProfile> => {
        const res = await axiosClient.put<ApiResponse<UserProfile>>('/users/me', data);
        return res.data.data;
    },

    // ─── Admin ─────────────────────────────────────────────────────────────────
    getUsers: async (page = 0, size = 10): Promise<PageResponse<User>> => {
        const res = await axiosClient.get<ApiResponse<PageResponse<User>>>('/admin/users', {
            params: { page, size },
        });
        return res.data.data;
    },

    getUserById: async (id: number): Promise<User> => {
        const res = await axiosClient.get<ApiResponse<User>>(`/admin/users/${id}`);
        return res.data.data;
    },

    createUser: async (data: UserCreateRequest): Promise<User> => {
        const res = await axiosClient.post<ApiResponse<User>>('/admin/users', data);
        return res.data.data;
    },

    updateUser: async (id: number, data: UserUpdateRequest): Promise<User> => {
        const res = await axiosClient.put<ApiResponse<User>>(`/admin/users/${id}`, data);
        return res.data.data;
    },

    updateUserStatus: async (id: number, data: UserStatusUpdateRequest): Promise<User> => {
        const res = await axiosClient.patch<ApiResponse<User>>(`/admin/users/${id}/status`, data);
        return res.data.data;
    },

    updateUserRole: async (id: number, data: UserRoleUpdateRequest): Promise<User> => {
        const res = await axiosClient.patch<ApiResponse<User>>(`/admin/users/${id}/role`, data);
        return res.data.data;
    },

    deleteUser: async (id: number): Promise<void> => {
        await axiosClient.delete(`/admin/users/${id}`);
    },
};
