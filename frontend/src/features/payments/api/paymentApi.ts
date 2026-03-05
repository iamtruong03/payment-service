import axiosClient from '@/api/axiosClient';
import type {
    AdminStats,
    CancelPaymentIntentResponse,
    CreatePaymentIntentRequest,
    FraudLog,
    PaymentIntentResponse,
    StripeConfig,
    Transaction,
} from '@/features/payments/types/payment';
import type { PageResponse } from '@/features/users/types/user';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
}

export const paymentApi = {
    // ─── Stripe config ─────────────────────────────────────────────────────────
    getStripeConfig: async (): Promise<StripeConfig> => {
        const res = await axiosClient.get<ApiResponse<StripeConfig>>('/config');
        return res.data.data;
    },

    // ─── User: create payment intent ───────────────────────────────────────────
    createPaymentIntent: async (data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
        const res = await axiosClient.post<ApiResponse<PaymentIntentResponse>>('/payment/create-intent', data);
        return res.data.data;
    },

    // ─── User: cancel payment intent ───────────────────────────────────────────
    cancelPaymentIntent: async (paymentIntentId: string): Promise<CancelPaymentIntentResponse> => {
        const res = await axiosClient.post<ApiResponse<CancelPaymentIntentResponse>>(
            `/payment/cancel-intent/${paymentIntentId}`
        );
        return res.data.data;
    },

    // ─── User: my transactions ─────────────────────────────────────────────────
    getMyTransactions: async (): Promise<Transaction[]> => {
        const res = await axiosClient.get<ApiResponse<Transaction[]>>('/payment/my-transactions');
        return Array.isArray(res.data.data) ? res.data.data : [];
    },

    // ─── User: transaction by id ───────────────────────────────────────────────
    getTransactionById: async (id: number): Promise<Transaction> => {
        const res = await axiosClient.get<ApiResponse<Transaction>>(`/payment/${id}`);
        return res.data.data;
    },

    // ─── Admin: stats ──────────────────────────────────────────────────────────
    getAdminStats: async (): Promise<AdminStats> => {
        const res = await axiosClient.get<ApiResponse<AdminStats>>('/admin/stats');
        return res.data.data;
    },

    // ─── Admin: all transactions ───────────────────────────────────────────────
    getAdminTransactions: async (size = 50): Promise<PageResponse<Transaction>> => {
        const res = await axiosClient.get<ApiResponse<PageResponse<Transaction>>>(
            `/admin/transactions?size=${size}`
        );
        return res.data.data;
    },

    // ─── Admin: fraud logs ─────────────────────────────────────────────────────
    getFraudLogs: async (size = 50): Promise<PageResponse<FraudLog>> => {
        const res = await axiosClient.get<ApiResponse<PageResponse<FraudLog>>>(
            `/admin/fraud-logs?size=${size}`
        );
        return res.data.data;
    },
};
