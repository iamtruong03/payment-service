'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminStats } from '@/hooks/usePayments'

export default function AdminStatsPage() {
    const { data, isLoading, error } = useAdminStats()

    if (isLoading) return <div>Loading statistics...</div>
    if (error) return <div className="text-red-500">{(error as Error).message}</div>
    if (!data) return null

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue 24h</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(data.revenue24hCents / 100).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate 24h</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.successRate24h}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Fraud Events 24h</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data.fraudEvents24h}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Tx 24h</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.failedTransactions24h}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Top Offenders</h3>
                <div className="bg-white border rounded">
                    {data.topOffenders?.map((o, i) => (
                        <div key={i} className="flex justify-between p-4 border-b last:border-0 hover:bg-gray-50">
                            <span className="font-mono text-sm">{o.ip}</span>
                            <span className="text-sm text-gray-500">{o.declineCount} declines {o.blocked && '(Blocked)'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
