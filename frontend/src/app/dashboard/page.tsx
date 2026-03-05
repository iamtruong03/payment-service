'use client';

import { useAuthStore } from '@/store/authStore';
import {
    useAdminStats,
    useRecentTransactions,
} from '@/hooks/usePayments';
import {
    Users,
    CreditCard,
    ShieldCheck,
    TrendingUp,
    ArrowUpRight,
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import type { Transaction } from '@/types/payment';

const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-600/20 text-indigo-400 border-indigo-500/20',
    purple: 'bg-purple-600/20 text-purple-400 border-purple-500/20',
    emerald: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/20',
    orange: 'bg-orange-600/20 text-orange-400 border-orange-500/20',
};

export default function DashboardPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';

    const { data: adminStats, isLoading: isLoadingStats } = useAdminStats(isAdmin);
    const { data: transactions, isLoading: isLoadingTx } = useRecentTransactions();

    const displayStats = [
        {
            label: isAdmin ? 'Total Transactions (24h)' : 'Giao dịch của bạn',
            value: isAdmin ? (adminStats?.totalTransactions24h || 0) : (transactions?.length || 0),
            change: '+12%',
            icon: CreditCard,
            color: 'indigo',
        },
        {
            label: isAdmin ? 'Doanh thu (24h)' : 'Tổng tiền',
            value: isAdmin
                ? `$${((adminStats?.revenue24hCents || 0) / 100).toFixed(2)}`
                : `$${((transactions?.reduce((acc: number, tx: Transaction) =>
                    acc + (tx.status === 'succeeded' ? tx.amount : 0), 0) || 0) / 100).toFixed(2)}`,
            change: '+5%',
            icon: Users,
            color: 'purple',
        },
        {
            label: 'Success Rate',
            value: isAdmin
                ? `${adminStats?.successRate24h || 0}%`
                : (transactions?.length ?? 0) > 0
                    ? `${Math.round((transactions!.filter((tx) => tx.status === 'succeeded').length / transactions!.length) * 100)}%`
                    : '0%',
            change: '+2.1%',
            icon: TrendingUp,
            color: 'emerald',
        },
        {
            label: 'Fraud Events',
            value: isAdmin ? (adminStats?.fraudEvents24h || 0) : '0',
            change: '-8%',
            icon: ShieldCheck,
            color: 'orange',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        Chào buổi sáng, {user?.fullName || user?.email?.split('@')[0]} 👋
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500">
                        {isAdmin ? 'Đây là tổng quan hệ thống thanh toán của bạn.' : 'Đây là tóm tắt các giao dịch gần đây của bạn.'}
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5">
                    <Activity className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-400">System Online</span>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {displayStats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl bg-gray-900/60 border border-white/5 p-5 hover:border-white/10 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{stat.label}</span>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorMap[stat.color]}`}>
                                <stat.icon className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-end justify-between">
                            {(isLoadingStats && isAdmin) || (isLoadingTx && !isAdmin) ? (
                                <div className="h-8 w-24 bg-white/5 animate-pulse rounded" />
                            ) : (
                                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                            )}
                            <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-medium">
                                <ArrowUpRight className="h-3 w-3" />
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent activity */}
            <div className="rounded-xl bg-gray-900/60 border border-white/5 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-white">Hoạt động gần đây</h3>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Xem tất cả</button>
                </div>

                <div className="space-y-4">
                    {isLoadingTx ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="h-10 w-10 rounded-full bg-white/5" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/3 rounded bg-white/5" />
                                    <div className="h-3 w-1/4 rounded bg-white/5/50" />
                                </div>
                                <div className="h-4 w-20 rounded bg-white/5" />
                            </div>
                        ))
                    ) : (transactions?.length ?? 0) === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-500">Chưa có hoạt động nào được ghi lại.</p>
                        </div>
                    ) : (
                        transactions?.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-xl border ${tx.status === 'succeeded' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                        tx.status === 'canceled' ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' :
                                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>
                                        {tx.status === 'succeeded' ? <CheckCircle2 className="h-5 w-5" /> :
                                            tx.status === 'canceled' ? <XCircle className="h-5 w-5" /> :
                                                <Clock className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                                            {tx.cardBrand ? `Thanh toán bằng ${tx.cardBrand}` : 'Giao dịch mới'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <span className="font-mono">{tx.paymentIntentId?.substring(0, 12)}...</span>
                                            <span>•</span>
                                            <span>{new Date(tx.createdAt).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-white">
                                        +${(tx.amount / 100).toFixed(2)}
                                    </p>
                                    <p className={`text-[10px] uppercase font-bold tracking-tight ${tx.status === 'succeeded' ? 'text-emerald-500' :
                                        tx.status === 'canceled' ? 'text-gray-500' : 'text-amber-500'
                                        }`}>
                                        {tx.status}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
