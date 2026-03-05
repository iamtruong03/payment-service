export type Role = 'USER' | 'ADMIN' | 'SYSTEM';

export type UserStatus = 'ACTIVE' | 'DISABLED' | 'LOCKED';

export interface User {
    id: number;
    email: string;
    fullName: string | null;
    role: Role;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: number;
    email: string;
    fullName: string | null;
    role: Role;
    status: UserStatus;
    createdAt: string;
}

export interface UserCreateRequest {
    email: string;
    password: string;
    fullName: string;
    role?: Role;
}

export interface UserUpdateRequest {
    fullName: string;
}

export interface UserStatusUpdateRequest {
    status: UserStatus;
    reason?: string;
}

export interface UserRoleUpdateRequest {
    role: Role;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage?: number;
    number?: number;
    size?: number;
}
