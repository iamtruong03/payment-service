'use client'

import { useFraudLogs } from '@/hooks/usePayments'

export default function AdminFraudLogsPage() {
    const { data, isLoading, error } = useFraudLogs(50)

    if (isLoading) return <div>Loading...</div>
    if (error) return <div className="text-red-500">{(error as Error).message}</div>

    const content = data?.content ?? []

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Fraud Logs</h2>
            <div className="overflow-x-auto border rounded bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP/Fingerprint</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {content.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                    {log.ipAddress}<br />
                                    <span className="text-xs text-gray-400">{log.cardFingerprint}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        {log.eventType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{log.reason}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">{log.riskScore}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
