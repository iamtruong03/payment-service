import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/features/auth/types/auth';

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;

    setAuth: (token: string, user: AuthUser) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setAuth: (token, user) =>
                set({ token, user, isAuthenticated: true }),

            logout: () => {
                set({ token: null, user: null, isAuthenticated: false });
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            },

            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
