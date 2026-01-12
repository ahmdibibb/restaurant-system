'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CreditCard, QrCode, Wallet, ArrowLeft, CheckCircle2 } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  orderType: string
  tableNumber: string | null
  notes: string | null
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
      setError('Silakan pilih metode pembayaran')
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
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
          <p className="text-lg text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-4 text-6xl">😕</div>
          <p className="text-xl font-semibold text-gray-800 mb-2">Oops!</p>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/products')}
            className="rounded-lg bg-orange-600 px-6 py-3 text-white hover:bg-orange-700"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    )
  }

  const paymentMethods = [
    {
      id: 'CASH' as const,
      name: 'Tunai',
      description: 'Bayar dengan uang tunai',
      icon: Wallet,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-600',
    },
    {
      id: 'QRIS' as const,
      name: 'QRIS',
      description: 'Scan QR code untuk bayar',
      icon: QrCode,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-600',
    },
    {
      id: 'EDC' as const,
      name: 'Kartu Debit/Kredit',
      description: 'Bayar dengan kartu',
      icon: CreditCard,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <button
            onClick={() => {
              if (confirm('Batalkan pembayaran dan kembali ke menu?')) {
                localStorage.removeItem('cart')
                router.push('/products')
              }
            }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Pilih Metode Pembayaran
          </h1>
          <p className="text-gray-600">Pilih cara pembayaran yang paling nyaman untuk Anda</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
            <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        {order && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Side - Payment Methods */}
            <div className="lg:col-span-2 space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod === method.id

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full rounded-2xl border-2 p-6 text-left transition-all duration-300 ${isSelected
                      ? `${method.borderColor} ${method.bgColor} shadow-lg scale-105`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${method.color} shadow-md`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                      {isSelected && (
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${method.color} bg-gradient-to-br`}>
                          <CheckCircle2 size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
                <h2 className="mb-4 text-lg font-bold text-gray-900">
                  Ringkasan Pesanan
                </h2>

                <div className="mb-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Nomor Pesanan</p>
                  <p className="font-mono text-lg font-bold text-gray-900">{order.orderNumber}</p>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipe</span>
                    <span className="font-semibold text-gray-900">
                      {order.orderType === 'DINE_IN' ? '🍽️ Dine-in' : '🥡 Takeaway'}
                    </span>
                  </div>
                  {order.orderType === 'DINE_IN' && order.tableNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Meja</span>
                      <span className="font-semibold text-gray-900">#{order.tableNumber}</span>
                    </div>
                  )}
                </div>

                <div className="mb-4 border-t border-gray-200 pt-4">
                  <p className="mb-2 text-sm font-semibold text-gray-700">Items:</p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product.name} x{item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          Rp {(item.subtotal || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-orange-600">
                      Rp {(order.totalAmount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || processing}
                  className={`mt-6 w-full rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all ${!selectedMethod || processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-95'
                    }`}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Memproses...
                    </span>
                  ) : (
                    'Bayar Sekarang'
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  🔒 Pembayaran aman dan terenkripsi
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
