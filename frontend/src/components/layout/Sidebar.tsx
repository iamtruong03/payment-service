'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    User,
    CreditCard,
    FileText,
    LogOut,
    Shield,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const allNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['USER', 'ADMIN'] },
    { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
    { href: '/profile', label: 'Profile', icon: User, roles: ['USER', 'ADMIN'] },
    { href: '/checkout', label: 'Payments', icon: CreditCard, roles: ['USER', 'ADMIN'] },
    { href: '/dashboard/payments', label: 'My Transactions', icon: FileText, roles: ['USER', 'ADMIN'] },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    const navItems = allNavItems.filter(
        (item) => !user || item.roles.includes(user.role)
    );

    return (
        <aside className="flex h-screen w-64 flex-col bg-gray-950 border-r border-white/5">
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                    <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-semibold text-white tracking-tight">PayGate</span>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
                {user?.role === 'ADMIN' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 mb-2">
                        <Shield className="h-3 w-3 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Admin</span>
                    </div>
                )}
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                                isActive
                                    ? 'bg-indigo-600/20 text-indigo-300 shadow-sm'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            )}
                        >
                            <item.icon className={cn('h-4 w-4', isActive ? 'text-indigo-400' : 'text-gray-500')} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User */}
            <div className="border-t border-white/5 p-3">
                {user && (
                    <div className="flex items-center gap-3 rounded-lg px-3 py-2 mb-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 text-sm font-medium">
                            {(user.fullName || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.fullName || user.email}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );
}
