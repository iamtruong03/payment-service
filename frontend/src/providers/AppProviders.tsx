'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { STALE_TIME } from '@/constants';

/**
 * AppProviders — wraps the entire application with all global providers.
 * Add new providers here (e.g. ThemeProvider, ToastProvider) without
 * touching app/layout.tsx.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        refetchOnWindowFocus: false,
                        staleTime: STALE_TIME.SHORT,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
