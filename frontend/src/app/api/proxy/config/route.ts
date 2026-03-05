import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/server-api'

export async function GET() {
    try {
        const response = await fetchWithAuth('/api/config')

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
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in config proxy:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
