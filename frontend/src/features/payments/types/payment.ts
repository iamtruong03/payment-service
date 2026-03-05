export type PaymentStatus =
    | 'succeeded'
    | 'requires_payment_method'
    | 'requires_action'
    | 'processing'
    | 'payment_failed'
    | 'canceled';

export interface Transaction {
    id: number;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: PaymentStatus | string;
    cardBrand?: string;
    cardLast4?: string;
    cardCountry?: string;
    ipAddress?: string;
    riskScore?: number;
    failureMessage?: string;
    declineCode?: string;
    clientSecret?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreatePaymentIntentRequest {
    amount: number;
    currency: string;
    idempotencyKey?: string;
    cardFingerprint?: string;
}

export interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
    isDuplicate?: boolean;
}

export interface CancelPaymentIntentResponse {
    paymentIntentId: string;
    status: string;
    success: boolean;
}

export interface AdminStats {
    totalTransactions24h: number;
    revenue24hCents: number;
    successRate24h: number;
    fraudEvents24h: number;
    failedTransactions24h: number;
    topOffenders: TopOffender[];
}

export interface TopOffender {
    ip: string;
    declineCount: number;
    blocked: boolean;
}

export interface FraudLog {
    id: number;
    ipAddress: string;
    cardFingerprint?: string;
    eventType: string;
    reason: string;
    riskScore: number;
    createdAt: string;
}

export interface StripeConfig {
    publishableKey: string;
}
