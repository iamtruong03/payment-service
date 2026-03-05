'use client';

import { useState } from 'react';
import { Pencil, Trash2, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import UserStatusBadge from './UserStatusBadge';
import { getRoleBadgeColor, formatDate, cn } from '@/lib/utils';
import { useDeleteUser, useUpdateUserStatus } from '@/features/users/hooks/useUsers';
import type { User } from '@/features/users/types/user';

interface UserTableProps {
    users: User[];
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onEdit: (user: User) => void;
}

export default function UserTable({
    users,
    totalPages,
    currentPage,
    onPageChange,
    onEdit,
}: UserTableProps) {
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const deleteMutation = useDeleteUser();
    const statusMutation = useUpdateUserStatus();

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            deleteMutation.mutate(id);
        }
        setActiveMenu(null);
    };

    const handleToggleStatus = (user: User) => {
        const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        statusMutation.mutate({ id: user.id, data: { status: newStatus } });
        setActiveMenu(null);
    };

    return (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-gray-900/50">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/2">
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/2 transition-colors group">
                                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{user.id}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-300 text-xs font-semibold">
                                            {(user.fullName || user.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user.fullName || '—'}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', getRoleBadgeColor(user.role))}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <UserStatusBadge status={user.status} />
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                                            title="Edit"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-yellow-400 transition-all"
                                            title={user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                        >
                                            {user.status === 'ACTIVE'
                                                ? <ShieldOff className="h-3.5 w-3.5" />
                                                : <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="py-16 text-center text-gray-600">No users found.</div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                    <p className="text-xs text-gray-500">
                        Page {currentPage + 1} of {totalPages}
                    </p>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 0}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onPageChange(i)}
                                className={cn(
                                    'flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-all',
                                    i === currentPage
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1}
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
