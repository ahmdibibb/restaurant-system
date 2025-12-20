'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CreditCard, QrCode, DollarSign } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  items: Array<{
    id: string
    quantity: number
    price: number
    subtotal: number
    product: {
      id: string
      name: string
    }
  }>
}

type PaymentMethod = 'CASH' | 'QRIS' | 'EDC' | null

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Order not found')
        setLoading(false)
        return
      }

      // Ensure all numeric values are numbers (not Decimal objects)
      const processedOrder = {
        ...data,
        totalAmount: typeof data.totalAmount === 'number' 
          ? data.totalAmount 
          : parseFloat(data.totalAmount || 0),
        items: data.items?.map((item: any) => ({
          ...item,
          price: typeof item.price === 'number' 
            ? item.price 
            : parseFloat(item.price || 0),
          subtotal: typeof item.subtotal === 'number' 
            ? item.subtotal 
            : parseFloat(item.subtotal || 0),
        })) || [],
      }

      setOrder(processedOrder)
    } catch (err: any) {
      console.error('Error fetching order:', err)
      setError(err.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method')
      return
    }

    if (!order?.id) {
      setError('Order not found')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: order.id,
          method: selectedMethod,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMsg = data.error || data.details?.message || 'Payment failed'
        console.error('Payment error:', data)
        setError(errorMsg)
        setProcessing(false)
        return
      }

      // Redirect to receipt
      router.push(`/receipt/${order.id}`)
    } catch (err: any) {
      console.error('Payment request error:', err)
      setError(err.message || 'An error occurred. Please try again.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Payment</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {order && (
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-xl font-semibold">Order Details</h2>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <p className="mb-2">
                  <span className="font-semibold">Order Number:</span> {order.orderNumber}
                </p>
                <div className="my-4 border-t pt-4">
                  <h3 className="mb-2 font-semibold">Items:</h3>
                  {order.items.map((item) => (
                    <div key={item.id} className="mb-2 flex justify-between text-sm">
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>Rp {(item.subtotal || 0).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      Rp {(order.totalAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold">Select Payment Method</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMethod('CASH')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedMethod === 'CASH'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-300 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign
                      size={24}
                      className={selectedMethod === 'CASH' ? 'text-orange-600' : 'text-gray-600'}
                    />
                    <div>
                      <p className="font-semibold">Cash Payment</p>
                      <p className="text-sm text-gray-600">Pay with cash at the counter</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('QRIS')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedMethod === 'QRIS'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-300 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode
                      size={24}
                      className={selectedMethod === 'QRIS' ? 'text-orange-600' : 'text-gray-600'}
                    />
                    <div>
                      <p className="font-semibold">QRIS</p>
                      <p className="text-sm text-gray-600">Scan QR code to pay</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedMethod('EDC')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                    selectedMethod === 'EDC'
                      ? 'border-orange-600 bg-orange-50'
                      : 'border-gray-300 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      size={24}
                      className={selectedMethod === 'EDC' ? 'text-orange-600' : 'text-gray-600'}
                    />
                    <div>
                      <p className="font-semibold">EDC / Card Payment</p>
                      <p className="text-sm text-gray-600">Pay with debit/credit card</p>
                    </div>
                  </div>
                </button>
              </div>

              {selectedMethod && (
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="mt-6 w-full rounded-lg bg-orange-600 px-6 py-3 text-lg font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {processing ? 'Processing Payment...' : 'Pay Now'}
                </button>
              )}

              {selectedMethod === 'QRIS' && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-semibold">Note:</p>
                  <p>This is a dummy payment. In production, a QR code would be displayed here.</p>
                </div>
              )}

              {selectedMethod === 'EDC' && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-semibold">Note:</p>
                  <p>This is a dummy payment. In production, you would be redirected to the payment gateway.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

