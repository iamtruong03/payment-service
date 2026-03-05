import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login as loginAction } from '@/features/auth/actions/auth';
import { authApi } from '@/features/auth/api/authApi';
import { userApi } from '@/features/users/api/userApi';
import { useAuthStore } from '@/store/authStore';
import type { AuthUser } from '@/features/auth/types/auth';

export function useLogin() {
    const { setAuth } = useAuthStore();
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            const result = await loginAction(data);
            if (result.error) throw new Error(result.error);
            return result;
        },
        onSuccess: async (data) => {
            const realToken = (data as any).token as string;
            useAuthStore.setState({ token: realToken });

            try {
                const profile = await userApi.getMyProfile();
                const user: AuthUser = {
                    id: profile.id,
                    email: profile.email,
                    fullName: profile.fullName,
                    role: profile.role,
                    status: profile.status,
                };
                setAuth(realToken, user);
            } catch {
                setAuth(realToken, {
                    id: 0,
                    email: '',
                    fullName: null,
                    role: 'USER',
                    status: 'ACTIVE',
                });
            }
            router.push('/dashboard');
        },
    });
}

export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: () => {
            router.push('/login');
        },
    });
}

export function useAuth() {
    return useAuthStore();
}
