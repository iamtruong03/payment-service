'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/features/users/hooks/useUsers';
import type { User, UserCreateRequest, UserUpdateRequest } from '@/features/users/types/user';

const createSchema = z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Minimum 8 characters'),
    fullName: z.string().min(1, 'Full name required'),
    role: z.enum(['USER', 'ADMIN']).default('USER'),
});

const updateSchema = z.object({
    fullName: z.string().min(1, 'Full name required'),
});

// Zod infers the OUTPUT type (after defaults applied) — use this for the form data type
type CreateForm = z.infer<typeof createSchema>;
type UpdateForm = z.infer<typeof updateSchema>;

interface UserFormProps {
    user?: User | null;
    onClose: () => void;
}

export default function UserForm({ user, onClose }: UserFormProps) {
    const isEdit = !!user;

    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser(user?.id ?? 0);

    const createForm = useForm<CreateForm>({
        resolver: zodResolver(createSchema) as any,
        defaultValues: { role: 'USER' as const },
    });

    const updateForm = useForm<UpdateForm>({
        resolver: zodResolver(updateSchema),
        defaultValues: { fullName: user?.fullName ?? '' },
    });

    useEffect(() => {
        if (user) updateForm.setValue('fullName', user.fullName ?? '');
    }, [user]);

    const handleCreate = createForm.handleSubmit(async (data) => {
        await createMutation.mutateAsync(data as unknown as UserCreateRequest);
        onClose();
    });

    const handleUpdate = updateForm.handleSubmit(async (data) => {
        await updateMutation.mutateAsync(data as unknown as UserUpdateRequest);
        onClose();
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-xl bg-gray-900 border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <h2 className="text-base font-semibold text-white">
                        {isEdit ? 'Edit User' : 'Create User'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    {!isEdit ? (
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Field label="Email" error={createForm.formState.errors.email?.message}>
                                <input
                                    {...createForm.register('email')}
                                    type="email"
                                    className={inputClass}
                                    placeholder="user@example.com"
                                />
                            </Field>
                            <Field label="Full Name" error={createForm.formState.errors.fullName?.message}>
                                <input
                                    {...createForm.register('fullName')}
                                    className={inputClass}
                                    placeholder="Nguyen Van A"
                                />
                            </Field>
                            <Field label="Password" error={createForm.formState.errors.password?.message}>
                                <input
                                    {...createForm.register('password')}
                                    type="password"
                                    className={inputClass}
                                    placeholder="••••••••"
                                />
                            </Field>
                            <Field label="Role" error={createForm.formState.errors.role?.message}>
                                <select {...createForm.register('role')} className={inputClass}>
                                    <option value="USER">USER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </Field>
                            <FormActions onClose={onClose} loading={createMutation.isPending} isEdit={false} />
                        </form>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <Field label="Full Name" error={updateForm.formState.errors.fullName?.message}>
                                <input
                                    {...updateForm.register('fullName')}
                                    className={inputClass}
                                    placeholder="Nguyen Van A"
                                />
                            </Field>
                            <FormActions onClose={onClose} loading={updateMutation.isPending} isEdit={true} />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
            {children}
            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
}

function FormActions({ onClose, loading, isEdit }: { onClose: () => void; loading: boolean; isEdit: boolean }) {
    return (
        <div className="flex gap-2 pt-2">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
            </button>
        </div>
    );
}

const inputClass =
    'w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all';
