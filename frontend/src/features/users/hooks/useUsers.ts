import {
    useQuery,
    useMutation,
    useQueryClient,
} from '@tanstack/react-query';
import { userApi } from '@/features/users/api/userApi';
import type {
    UserCreateRequest,
    UserUpdateRequest,
    UserStatusUpdateRequest,
    UserRoleUpdateRequest,
} from '@/features/users/types/user';

const USERS_KEY = 'admin-users';
const PROFILE_KEY = 'my-profile';

// ─── My Profile ───────────────────────────────────────────────────────────────
export function useMyProfile() {
    return useQuery({
        queryKey: [PROFILE_KEY],
        queryFn: userApi.getMyProfile,
        staleTime: 1000 * 60 * 5,
    });
}

export function useUpdateMyProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UserUpdateRequest) => userApi.updateMyProfile(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [PROFILE_KEY] }),
    });
}

// ─── Admin: Users list ────────────────────────────────────────────────────────
export function useUsers(page = 0, size = 10) {
    return useQuery({
        queryKey: [USERS_KEY, page, size],
        queryFn: () => userApi.getUsers(page, size),
    });
}

export function useUser(id: number) {
    return useQuery({
        queryKey: [USERS_KEY, id],
        queryFn: () => userApi.getUserById(id),
        enabled: !!id,
    });
}

// ─── Admin: Mutations ─────────────────────────────────────────────────────────
export function useCreateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UserCreateRequest) => userApi.createUser(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
    });
}

export function useUpdateUser(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: UserUpdateRequest) => userApi.updateUser(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
    });
}

export function useUpdateUserStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UserStatusUpdateRequest }) =>
            userApi.updateUserStatus(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
    });
}

export function useDeleteUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => userApi.deleteUser(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
    });
}
