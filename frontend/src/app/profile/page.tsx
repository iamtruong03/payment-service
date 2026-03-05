'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Pencil, Check, X, Shield, Calendar, Mail } from 'lucide-react';
import { useMyProfile, useUpdateMyProfile } from '@/hooks/useUsers';
import UserStatusBadge from '@/components/user/UserStatusBadge';
import { getRoleBadgeColor, formatDate, cn } from '@/lib/utils';

const schema = z.object({
    fullName: z.string().min(1, 'Full name required'),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
    const [editing, setEditing] = useState(false);
    const { data: profile, isLoading, isError } = useMyProfile();
    const updateMutation = useUpdateMyProfile();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { fullName: profile?.fullName ?? '' },
    });

    const onSubmit = handleSubmit(async (data) => {
        await updateMutation.mutateAsync(data);
        setEditing(false);
    });

    const handleCancel = () => {
        reset({ fullName: profile?.fullName ?? '' });
        setEditing(false);
    };

    if (isLoading) {
        return (
            <div className="max-w-lg space-y-4 animate-pulse">
                <div className="h-32 rounded-xl bg-gray-800" />
                <div className="h-48 rounded-xl bg-gray-800" />
            </div>
        );
    }

    if (isError || !profile) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center max-w-lg">
                <p className="text-sm text-red-400">Failed to load profile. Make sure the backend is running.</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl space-y-4">
            {/* Profile hero card */}
            <div className="rounded-xl bg-gray-900 border border-white/10 overflow-hidden">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-indigo-600/30 via-purple-600/20 to-transparent" />

                {/* Avatar + info */}
                <div className="px-6 pb-6 -mt-10">
                    <div className="flex items-end gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-600 text-white text-2xl font-bold border-4 border-gray-900 shadow-xl">
                            {(profile.fullName || profile.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="mb-1">
                            <h2 className="text-lg font-semibold text-white">{profile.fullName || '—'}</h2>
                            <p className="text-sm text-gray-500">{profile.email}</p>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className={cn('inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium', getRoleBadgeColor(profile.role))}>
                            <Shield className="h-3 w-3" />
                            {profile.role}
                        </span>
                        <UserStatusBadge status={profile.status} />
                    </div>
                </div>
            </div>

            {/* Detail card */}
            <div className="rounded-xl bg-gray-900 border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Account Details</h3>
                    {!editing ? (
                        <button
                            onClick={() => { setEditing(true); reset({ fullName: profile.fullName ?? '' }); }}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-600/30 transition-all"
                        >
                            <Pencil className="h-3 w-3" />
                            Edit
                        </button>
                    ) : (
                        <div className="flex gap-1">
                            <button onClick={handleCancel} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all">
                                <X className="h-3.5 w-3.5" />
                            </button>
                            <button form="profile-form" type="submit" disabled={updateMutation.isPending}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition-all disabled:opacity-50">
                                <Check className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                <form id="profile-form" onSubmit={onSubmit} className="space-y-3">
                    {/* Full Name */}
                    <InfoRow
                        label="Full Name"
                        icon={User}
                        editing={editing}
                        value={profile.fullName ?? '—'}
                    >
                        <input
                            {...register('fullName')}
                            className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                        {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
                    </InfoRow>

                    {/* Email (readonly) */}
                    <InfoRow label="Email" icon={Mail} editing={false} value={profile.email} />

                    {/* Created at */}
                    <InfoRow label="Member since" icon={Calendar} editing={false} value={formatDate(profile.createdAt)} />
                </form>
            </div>
        </div>
    );
}

function InfoRow({
    label,
    icon: Icon,
    editing,
    value,
    children,
}: {
    label: string;
    icon: React.ElementType;
    editing: boolean;
    value: string;
    children?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-gray-500">
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                {editing && children ? (
                    children
                ) : (
                    <p className="text-sm text-white">{value}</p>
                )}
            </div>
        </div>
    );
}
