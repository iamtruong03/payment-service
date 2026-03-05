'use server'

import { cookies } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
    : 'http://localhost:8080'

export async function login(data: { email: string; password: string }) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, password: data.password }),
        })

        const json = await res.json()

        // Backend wraps responses in { success, data, message }
        if (!res.ok || !json.success) {
            throw new Error(json.message || 'Invalid credentials')
        }

        const token = json.data?.token

        if (!token) throw new Error('No token received')

        cookies().set('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 86400,
        })

        const roles = json.data?.roles
        return { success: true, token, role: roles?.[0] || 'ROLE_USER' }
    } catch (error: any) {
        return { error: error.message || 'Login failed' }
    }
}

export async function register(data: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
}) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const resp = await res.json()
            throw new Error(resp.message || 'Registration failed')
        }

        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Registration failed' }
    }
}

export async function logout() {
    cookies().delete('jwt')
    return { success: true }
}

export async function getSession() {
    const token = cookies().get('jwt')?.value
    return token ? { token } : null
}
