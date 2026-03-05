'use client';

import { cn, getStatusBadgeColor } from '@/lib/utils';
import type { UserStatus } from '@/features/users/types/user';

interface UserStatusBadgeProps {
    status: UserStatus;
    className?: string;
}

const STATUS_LABELS: Record<UserStatus, string> = {
    ACTIVE: 'Active',
    DISABLED: 'Disabled',
    LOCKED: 'Locked',
};

export default function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium',
                getStatusBadgeColor(status),
                className
            )}
        >
            <span className={cn('h-1.5 w-1.5 rounded-full',
                status === 'ACTIVE' ? 'bg-emerald-400' :
                    status === 'LOCKED' ? 'bg-red-400' : 'bg-gray-400'
            )} />
            {STATUS_LABELS[status]}
        </span>
    );
}
