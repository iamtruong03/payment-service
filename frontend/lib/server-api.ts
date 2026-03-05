// client route handlers for proxying to backend to attach JWT
import { cookies } from 'next/headers'

const BACKEND_URL = 'http://localhost:8080'

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

    // We could handle 401/403 here...
    return response
}
