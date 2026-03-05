import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/server-api'

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id
        const response = await fetchWithAuth(`/api/payment/cancel-intent/${id}`, {
            method: 'POST',
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Backend request failed' },
                { status: response.status }
            )
        }

        const text = await response.text()
        const data = text ? JSON.parse(text) : { success: true }
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error in cancel-intent proxy:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
