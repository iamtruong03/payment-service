import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/server-api'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const qs = searchParams.toString()
    const response = await fetchWithAuth(`/api/admin/fraud-logs?${qs}`)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
}
