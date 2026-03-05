import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/server-api'

export async function GET(req: Request) {
    const response = await fetchWithAuth('/api/admin/stats')
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
}
