'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) router.replace('/login');
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-950">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header title="Profile" />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
