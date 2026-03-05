// Server-side helper: proxy requests to Spring Boot backend with JWT auth
import { cookies } from 'next/headers'
import { API_BASE_URL } from '@/constants'

// Strip /api suffix if present to avoid double /api/api paths
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '')

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = cookies().get('jwt')?.value

    const headers = new Headers(options.headers)
    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers,
    })

    return response
}
