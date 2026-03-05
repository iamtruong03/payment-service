export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface AuthResponse {
    token: string;
}

export interface AuthUser {
    id: number;
    email: string;
    fullName: string | null;
    role: 'USER' | 'ADMIN' | 'SYSTEM';
    status: 'ACTIVE' | 'DISABLED' | 'LOCKED';
}
