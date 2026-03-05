'use client';

import { useState } from 'react';
import {
    CreditCard,
    Calendar,
    ArrowRight,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
} from 'lucide-react';
import TransactionDetailModal from '@/components/payments/TransactionDetailModal';
import { useMyTransactions } from '@/hooks/usePayments';
import type { Transaction } from '@/types/payment';

export default function MyPaymentsPage() {
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, isLoading, error } = useMyTransactions();
    const transactions = data ?? [];

    const handleViewDetails = (tx: Transaction) => {
        setSelectedTx(tx);
        setIsModalOpen(true);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'succeeded': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case 'payment_failed': return <XCircle className="h-4 w-4 text-red-400" />;
            default: return <Clock className="h-4 w-4 text-amber-400" />;
        }
    };

    const getStatusTextClass = (status: string) => {
        switch (status) {
            case 'succeeded': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'payment_failed': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        }
    };

    return (
        <div className="space-y-6 pt-2">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Payments History</h2>
                    <p className="text-sm text-gray-500">Manage and monitor all your transaction records.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="bg-gray-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/10 w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 rounded-2xl bg-gray-900/40 border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                    <p className="text-red-400 text-sm">{(error as Error).message}</p>
                    <button onClick={() => window.location.reload()} className="mt-4 text-xs font-bold text-white underline">Retry</button>
                </div>
            ) : transactions.length === 0 ? (
                <div className="p-12 rounded-2xl bg-gray-900/40 border border-white/5 text-center">
                    <CreditCard className="h-10 w-10 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No transaction records found in your account.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            onClick={() => handleViewDetails(tx)}
                            className="group relative rounded-2xl bg-gray-900/40 border border-white/5 p-5 hover:bg-gray-900/80 hover:border-white/10 transition-all cursor-pointer overflow-hidden shadow-lg"
                        >
                            <div className={`absolute top-0 left-0 right-0 h-1 ${tx.status === 'succeeded' ? 'bg-emerald-500/30' :
                                tx.status === 'payment_failed' ? 'bg-red-500/30' : 'bg-amber-500/30'
                                }`} />

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusTextClass(tx.status)}`}>
                                        {getStatusIcon(tx.status)}
                                        {tx.status.replace('_', ' ')}
                                    </div>
                                    <div className="mt-2.5">
                                        <p className="text-2xl font-bold text-white leading-none">
                                            {(tx.amount / 100).toLocaleString('en-US', { style: 'currency', currency: tx.currency?.toUpperCase() || 'USD' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-gray-400 group-hover:text-white transition-colors">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-white/5">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        {tx.cardBrand ? `${tx.cardBrand} •••• ${tx.cardLast4}` : 'Unknown Card'}
                                    </span>
                                    <span className="text-gray-500 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-600 font-mono truncate">{tx.paymentIntentId}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <TransactionDetailModal
                transaction={selectedTx}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
