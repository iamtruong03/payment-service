import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row gap-6">
            <nav className="w-full md:w-64 space-y-2 mb-6">
                <Link href="/admin/stats" className="block px-4 py-2 hover:bg-gray-100/10 rounded">
                    Statistics
                </Link>
                <Link href="/admin/transactions" className="block px-4 py-2 hover:bg-gray-100/10 rounded">
                    Transactions
                </Link>
                <Link href="/admin/fraud" className="block px-4 py-2 hover:bg-gray-100/10 rounded">
                    Fraud Logs
                </Link>
            </nav>
            <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                {children}
            </div>
        </div>
    )
}
