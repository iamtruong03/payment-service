'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';

const schema = z.object({
    email: z.string().email('Invalid email'),
    fullName: z.string().min(1, 'Full name required'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const [showPass, setShowPass] = useState(false);
    const registerMutation = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) });

    const onSubmit = handleSubmit((data) => {
        registerMutation.mutate(data);
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/40">
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">Create account</h1>
                        <p className="mt-1 text-sm text-gray-500">Join PayGate today</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-2xl">
                    <form onSubmit={onSubmit} className="space-y-4">
                        {registerMutation.isError && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                                Registration failed. Please try again.
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                            <input
                                {...register('email')}
                                type="email"
                                className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                        </div>

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Full Name</label>
                            <input
                                {...register('fullName')}
                                className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Nguyen Van A"
                            />
                            {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    {...register('password')}
                                    type={showPass ? 'text' : 'password'}
                                    className="w-full rounded-lg bg-gray-800 border border-white/10 px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/30"
                        >
                            {registerMutation.isPending ? 'Creating account...' : (
                                <>Create account <ArrowRight className="h-4 w-4" /></>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
