'use client';

import React, { useState } from 'react';
import {
    X,
    CreditCard,
    Calendar,
    Clock,
    Shield,
    Globe,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    DollarSign,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransaction, useCancelPaymentIntent } from '@/features/payments/hooks/usePayments';
import type { Transaction } from '@/features/payments/types/payment';

interface TransactionDetailModalProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onCancel?: (transactionId: number) => void;
}

export default function TransactionDetailModal({
    transaction: initialTransaction,
    isOpen,
    onClose,
    onCancel,
}: TransactionDetailModalProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const { data: freshTransaction } = useTransaction(
        isOpen && initialTransaction ? initialTransaction.id : 0
    );

    const cancelMutation = useCancelPaymentIntent();
    const transaction = freshTransaction ?? initialTransaction;

    if (!isOpen || !transaction) return null;

    const handleResumePayment = () => {
        if (transaction.clientSecret) {
            router.push(`/checkout?client_secret=${transaction.clientSecret}&amount=${transaction.amount}`);
        }
    };

    const handleCancelTransaction = async () => {
        setError(null);
        try {
            await cancelMutation.mutateAsync(transaction.paymentIntentId);
            if (onCancel) onCancel(transaction.id);
            setTimeout(() => onClose(), 500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while canceling the transaction');
        }
    };

    const formatCurrency = (amount: number, currency: string) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100);

    const getStatusStyles = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'succeeded') {
            return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: CheckCircle2 };
        } else if (s.includes('failed') || s.includes('canceled')) {
            return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: XCircle };
        } else {
            return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: AlertTriangle };
        }
    };

    const statusStyle = getStatusStyles(transaction.status);
    const isLoading = cancelMutation.isPending;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-950 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gray-900/40">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${statusStyle.bg} ${statusStyle.border}`}>
                            <statusStyle.icon className={`h-5 w-5 ${statusStyle.text}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Transaction Details</h2>
                            <p className="text-xs text-gray-500 font-mono">{transaction.paymentIntentId}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-400">Error</p>
                                    <p className="text-sm text-red-300 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
                                <DollarSign className="h-3 w-3" /> Amount
                            </p>
                            <p className="text-2xl font-bold text-white">
                                {formatCurrency(transaction.amount, transaction.currency)}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${statusStyle.bg} ${statusStyle.border}`}>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className={`text-lg font-semibold capitalize ${statusStyle.text}`}>
                                {transaction.status.replace('_', ' ')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5" /> Payment Details
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-tight">Card</p>
                                    <p className="text-sm text-gray-200 flex items-center gap-2">
                                        <span className="capitalize">{transaction.cardBrand || 'Unknown'}</span>
                                        <span className="text-gray-500">••••</span>
                                        <span className="font-mono">{transaction.cardLast4 || '****'}</span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-tight">Country</p>
                                    <p className="text-sm text-gray-200 flex items-center gap-2">
                                        <Globe className="h-3.5 w-3.5 text-gray-500" />
                                        {transaction.cardCountry || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" /> Timing & Network
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-tight">Created At</p>
                                    <p className="text-sm text-gray-200 flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                                        {new Date(transaction.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-tight">IP Address</p>
                                    <p className="text-sm text-gray-200 font-mono">{transaction.ipAddress || 'Unknown'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(transaction.riskScore !== undefined || transaction.failureMessage) && (
                        <div className="p-4 rounded-xl bg-gray-900 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Shield className="h-3.5 w-3.5" /> Security & Errors
                                </h3>
                                {transaction.riskScore !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500 uppercase">Risk Score</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${transaction.riskScore > 75 ? 'bg-red-500/20 text-red-400' :
                                            transaction.riskScore > 40 ? 'bg-amber-500/20 text-amber-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {transaction.riskScore}/100
                                        </span>
                                    </div>
                                )}
                            </div>
                            {transaction.failureMessage && (
                                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                    <p className="text-[10px] text-red-400/60 uppercase mb-1 font-bold">Failure Message</p>
                                    <p className="text-sm text-red-400">{transaction.failureMessage}</p>
                                    {transaction.declineCode && (
                                        <p className="mt-1 text-[11px] text-red-500/80 font-mono">Code: {transaction.declineCode}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-900/60 border-t border-white/5 flex gap-3 justify-end">
                    {transaction.status.toLowerCase() === 'requires_payment_method' && transaction.clientSecret && (
                        <button
                            onClick={handleResumePayment}
                            disabled={isLoading}
                            className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 active:scale-95"
                        >
                            <CreditCard className="h-4 w-4" />
                            Tiếp tục thanh toán
                        </button>
                    )}
                    {transaction.status.toLowerCase() === 'requires_payment_method' && (
                        <button
                            onClick={handleCancelTransaction}
                            disabled={isLoading}
                            className="px-6 py-2 rounded-xl bg-red-600/20 text-red-400 text-sm font-bold hover:bg-red-600/30 disabled:cursor-not-allowed border border-red-500/30 transition-all flex items-center gap-2 active:scale-95"
                        >
                            {isLoading ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Canceling...</>
                            ) : (
                                <><X className="h-4 w-4" /> Cancel</>
                            )}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2 rounded-xl bg-gray-800 text-white text-sm font-bold hover:bg-gray-700 disabled:cursor-not-allowed transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
