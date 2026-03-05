'use client'

import { useState, useEffect, useRef } from 'react'
import { loadStripe, Stripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import { useStripeConfig, useCreatePaymentIntent, useCancelPaymentIntent } from '@/hooks/usePayments'

function CheckoutForm({ amount, paymentIntentId }: { amount: number; paymentIntentId?: string }) {
    const stripe = useStripe()
    const elements = useElements()
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const router = useRouter()
    const cancelMutation = useCancelPaymentIntent()

    const handleCancel = async () => {
        if (!paymentIntentId) {
            router.push('/dashboard/payments')
            return
        }
        setIsLoading(true)
        try {
            await cancelMutation.mutateAsync(paymentIntentId)
            router.push('/dashboard/payments')
        } catch (err: any) {
            setMessage(err?.message || 'Không thể hủy thanh toán.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!stripe || !elements) return

        setIsLoading(true)
        setMessage(null)

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: 'if_required',
        })

        if (error) {
            if (error.type === 'card_error' && error.param === 'number') {
                setMessage('Số thẻ của quý vị không chính xác.')
            } else {
                setMessage(error.message ?? 'An unexpected error occurred.')
            }
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage('Payment successful!')
            setTimeout(() => router.push('/dashboard/payments'), 2000)
        } else {
            setMessage('Payment requires further action.')
        }

        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <div className="grid grid-cols-2 gap-4">
                <Button disabled={isLoading || !stripe || !elements} type="submit" className="w-full">
                    <span id="button-text">
                        {isLoading ? 'Đang xử lý...' : `Thanh toán $${(amount / 100).toFixed(2)}`}
                    </span>
                </Button>
                <Button
                    type="button"
                    disabled={isLoading}
                    onClick={handleCancel}
                    className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                    Hủy bỏ
                </Button>
            </div>
            {message && (
                <div className={`text-sm font-medium text-center mt-4 ${message.includes('successful') ? 'text-green-600' : 'text-red-500'
                    }`}>
                    {message}
                </div>
            )}
        </form>
    )
}

export default function CheckoutPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const queryClientSecret = searchParams.get('client_secret')
    const queryAmount = searchParams.get('amount')

    const [clientSecret, setClientSecret] = useState(queryClientSecret || '')
    const [paymentIntentId, setPaymentIntentId] = useState('')
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [inputAmount, setInputAmount] = useState(queryAmount ? (parseInt(queryAmount) / 100).toString() : '0')
    const [finalAmount, setFinalAmount] = useState(queryAmount ? parseInt(queryAmount) : 0)

    const [idempotencyKey] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36))

    const { data: stripeConfig, isError: configError } = useStripeConfig()
    const createIntentMutation = useCreatePaymentIntent()

    // Load Stripe.js when publishableKey is available
    useEffect(() => {
        if (stripeConfig?.publishableKey) {
            setStripePromise(loadStripe(stripeConfig.publishableKey))
        }
    }, [stripeConfig])

    useEffect(() => {
        if (configError) {
            setError('Failed to load payment configuration. Please check that the backend is running.')
        }
    }, [configError])

    const handleCreateIntent = async (e: React.FormEvent) => {
        e.preventDefault()
        const amountCents = Math.round(parseFloat(inputAmount) * 100)
        if (isNaN(amountCents) || amountCents <= 0) {
            setError('Vui lòng nhập số tiền hợp lý.')
            return
        }

        setError(null)
        try {
            const data = await createIntentMutation.mutateAsync({
                amount: amountCents,
                currency: 'usd',
                idempotencyKey,
            })

            if (!data.clientSecret) throw new Error('Missing clientSecret in response')

            setClientSecret(data.clientSecret)
            setFinalAmount(amountCents)
            if (data.paymentIntentId) setPaymentIntentId(data.paymentIntentId)
        } catch (err: any) {
            setError(err?.message || 'Failed to create payment intent. Please try again.')
        }
    }

    const options: StripeElementsOptions = {
        clientSecret,
        appearance: { theme: 'stripe' as const },
        locale: 'vi',
    }

    return (
        <div className="flex justify-center pt-10 h-full">
            <Card className="w-full max-w-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Secure Checkout</CardTitle>
                    <button
                        onClick={() => router.push('/dashboard/payments')}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="text-center py-4 text-red-600">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {!clientSecret ? (
                        <form onSubmit={handleCreateIntent} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Số tiền thanh toán (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={inputAmount}
                                        onChange={(e) => setInputAmount(e.target.value)}
                                        className="w-full bg-gray-950 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    disabled={createIntentMutation.isPending || !stripePromise}
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-500"
                                >
                                    {createIntentMutation.isPending ? 'Đang tạo giao dịch...' : 'Tiếp tục'}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => router.push('/dashboard/payments')}
                                    className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300"
                                >
                                    Hủy bỏ
                                </Button>
                            </div>
                        </form>
                    ) : stripePromise ? (
                        <Elements options={options} stripe={stripePromise}>
                            <CheckoutForm amount={finalAmount} paymentIntentId={paymentIntentId} />
                        </Elements>
                    ) : (
                        <div className="text-center py-10">Đang tải cấu hình Stripe...</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
