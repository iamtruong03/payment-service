import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/server-api'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        // The backend uses cardFingerprint, amount, currency
        const response = await fetchWithAuth('/api/payment/create-intent', {
            method: 'POST',
            body: JSON.stringify(body),
        })

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Backend request failed' },
                { status: response.status }
            )
        }

        const text = await response.text()
        if (!text) {
            return NextResponse.json(
                { error: 'Empty response from backend' },
                { status: 500 }
            )
        }

        const data = JSON.parse(text)
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Error in create-intent proxy:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
