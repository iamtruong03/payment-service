// ─── API ──────────────────────────────────────────────────────────────────────
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const JWT_COOKIE_NAME = 'jwt';
export const JWT_MAX_AGE = 86400; // 1 day in seconds

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const ADMIN_PAGE_SIZE = 50;

// ─── Routes ───────────────────────────────────────────────────────────────────
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PAYMENTS: '/dashboard/payments',
    USERS: '/dashboard/users',
    PROFILE: '/profile',
    CHECKOUT: '/checkout',
    ADMIN_STATS: '/admin/stats',
    ADMIN_TRANSACTIONS: '/admin/transactions',
    ADMIN_FRAUD: '/admin/fraud',
} as const;

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SYSTEM: 'SYSTEM',
} as const;

// ─── User Status ──────────────────────────────────────────────────────────────
export const USER_STATUS = {
    ACTIVE: 'ACTIVE',
    DISABLED: 'DISABLED',
    LOCKED: 'LOCKED',
} as const;

// ─── Payment Status ───────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
    SUCCEEDED: 'succeeded',
    REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
    REQUIRES_ACTION: 'requires_action',
    PROCESSING: 'processing',
    PAYMENT_FAILED: 'payment_failed',
    CANCELED: 'canceled',
} as const;

// ─── Query stale times ────────────────────────────────────────────────────────
export const STALE_TIME = {
    PROFILE: 5 * 60 * 1000,  // 5 minutes
    STATIC: Infinity,         // never re-fetch
    SHORT: 30 * 1000,        // 30 seconds
} as const;
