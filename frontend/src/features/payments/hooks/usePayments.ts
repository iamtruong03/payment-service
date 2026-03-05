import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '@/features/payments/api/paymentApi';
import type { CreatePaymentIntentRequest } from '@/features/payments/types/payment';

// ─── Query keys ───────────────────────────────────────────────────────────────
export const PAYMENT_KEYS = {
    stripeConfig: ['stripe-config'] as const,
    myTransactions: ['my-transactions'] as const,
    recentTransactions: ['recent-transactions'] as const,
    transaction: (id: number) => ['transaction', id] as const,
    adminStats: ['admin-stats'] as const,
    adminTransactions: ['admin-transactions'] as const,
    fraudLogs: ['admin-fraud'] as const,
};

// ─── Stripe config ────────────────────────────────────────────────────────────
export function useStripeConfig() {
    return useQuery({
        queryKey: PAYMENT_KEYS.stripeConfig,
        queryFn: paymentApi.getStripeConfig,
        staleTime: Infinity,
    });
}

// ─── User: create payment intent ──────────────────────────────────────────────
export function useCreatePaymentIntent() {
    return useMutation({
        mutationFn: (data: CreatePaymentIntentRequest) => paymentApi.createPaymentIntent(data),
    });
}

// ─── User: cancel payment intent ──────────────────────────────────────────────
export function useCancelPaymentIntent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (paymentIntentId: string) => paymentApi.cancelPaymentIntent(paymentIntentId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: PAYMENT_KEYS.myTransactions });
            qc.invalidateQueries({ queryKey: PAYMENT_KEYS.recentTransactions });
        },
    });
}

// ─── User: my transactions ────────────────────────────────────────────────────
export function useMyTransactions() {
    return useQuery({
        queryKey: PAYMENT_KEYS.myTransactions,
        queryFn: paymentApi.getMyTransactions,
    });
}

// ─── User: recent transactions (dashboard widget) ─────────────────────────────
export function useRecentTransactions() {
    return useQuery({
        queryKey: PAYMENT_KEYS.recentTransactions,
        queryFn: async () => {
            const list = await paymentApi.getMyTransactions();
            return list.slice(0, 5);
        },
    });
}

// ─── User: single transaction by id ──────────────────────────────────────────
export function useTransaction(id: number) {
    return useQuery({
        queryKey: PAYMENT_KEYS.transaction(id),
        queryFn: () => paymentApi.getTransactionById(id),
        enabled: !!id,
    });
}

// ─── Admin: stats ─────────────────────────────────────────────────────────────
export function useAdminStats(enabled = true) {
    return useQuery({
        queryKey: PAYMENT_KEYS.adminStats,
        queryFn: paymentApi.getAdminStats,
        enabled,
    });
}

// ─── Admin: all transactions ──────────────────────────────────────────────────
export function useAdminTransactions(size = 50) {
    return useQuery({
        queryKey: [...PAYMENT_KEYS.adminTransactions, size],
        queryFn: () => paymentApi.getAdminTransactions(size),
    });
}

// ─── Admin: fraud logs ────────────────────────────────────────────────────────
export function useFraudLogs(size = 50) {
    return useQuery({
        queryKey: [...PAYMENT_KEYS.fraudLogs, size],
        queryFn: () => paymentApi.getFraudLogs(size),
    });
}
