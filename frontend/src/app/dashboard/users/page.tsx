'use client';

import { useState } from 'react';
import { Plus, RefreshCw, Users } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import UserTable from '@/components/user/UserTable';
import UserForm from '@/components/user/UserForm';
import type { User } from '@/types/user';

export default function UsersPage() {
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const { data, isLoading, isError, refetch } = useUsers(page, 10);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setEditingUser(null);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600/20 border border-purple-500/20">
                        <Users className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-white">User Management</h2>
                        <p className="text-xs text-gray-500">
                            {data?.totalElements ?? 0} total users
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => refetch()}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/30"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add User
                    </button>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="rounded-xl border border-white/10 bg-gray-900/50 p-8 text-center">
                    <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-800" />
                                <div className="flex-1 h-4 rounded bg-gray-800" />
                                <div className="h-4 w-20 rounded bg-gray-800" />
                                <div className="h-4 w-16 rounded bg-gray-800" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : isError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center">
                    <p className="text-sm text-red-400">Failed to load users. Is the backend running?</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-3 text-xs text-red-400 underline hover:text-red-300"
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <UserTable
                    users={data?.content ?? []}
                    totalPages={data?.totalPages ?? 0}
                    currentPage={page}
                    onPageChange={setPage}
                    onEdit={handleEdit}
                />
            )}

            {/* Modal */}
            {showForm && (
                <UserForm user={editingUser} onClose={handleClose} />
            )}
        </div>
    );
}
