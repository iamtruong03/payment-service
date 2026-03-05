'use client';

import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getRoleBadgeColor } from '@/lib/utils';

interface HeaderProps {
    title?: string;
}

export default function Header({ title = 'Dashboard' }: HeaderProps) {
    const { user } = useAuthStore();

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 bg-gray-950/80 backdrop-blur-sm px-6">
            {/* Title */}
            <h1 className="text-lg font-semibold text-white">{title}</h1>

            {/* Right actions */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="hidden md:flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-gray-400 w-48">
                    <Search className="h-3.5 w-3.5" />
                    <span>Search...</span>
                </div>

                {/* Notifications */}
                <button className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </button>

                {/* Role badge */}
                {user && (
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                    </span>
                )}
            </div>
        </header>
    );
}
