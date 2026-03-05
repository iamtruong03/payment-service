import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getRoleBadgeColor(role: string): string {
    switch (role) {
        case 'ADMIN':
            return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        case 'SYSTEM':
            return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
        default:
            return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
}

export function getStatusBadgeColor(status: string): string {
    switch (status) {
        case 'ACTIVE':
            return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        case 'DISABLED':
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
        case 'LOCKED':
            return 'bg-red-500/20 text-red-300 border-red-500/30';
        default:
            return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
}
