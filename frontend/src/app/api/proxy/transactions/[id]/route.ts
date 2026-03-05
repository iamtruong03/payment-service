import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/server-api'

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const { id } = params;
    const response = await fetchWithAuth(`/api/payment/${id}`)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
}
