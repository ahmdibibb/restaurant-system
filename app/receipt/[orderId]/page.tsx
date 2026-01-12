'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Printer, Home } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  createdAt: string
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
  payment: {
    method: string
    transactionId: string | null
    paidAt: string | null
  } | null
}

export default function ReceiptPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()

      if (!res.ok) {
        return
      }

      setOrder(data)
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Order not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-4 flex justify-between print:hidden">
          <button
            onClick={() => {
              // Clear cart before going back to products
              localStorage.removeItem('cart')
              router.push('/products')
            }}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            <Home size={20} />
            Pesanan Baru
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
          >
            <Printer size={20} />
            Print Receipt
          </button>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg print:shadow-none">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-orange-600">Resto Iga Bakar</h1>
            <p className="mt-2 text-gray-600">Jl. Example Street No. 123</p>
            <p className="text-gray-600">Telp: (021) 1234-5678</p>
          </div>

          <div className="mb-6 border-t-2 border-dashed border-gray-300 pt-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-lg font-semibold">{order.orderNumber}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="text-lg">{formatDate(order.createdAt)}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Order Type</p>
              <p className="text-lg font-semibold">
                {(order as any).orderType === 'DINE_IN' ? 'Dine-in' : 'Takeaway'}
              </p>
            </div>
            {(order as any).orderType === 'DINE_IN' && (order as any).tableNumber && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Table Number</p>
                <p className="text-lg font-semibold">{(order as any).tableNumber}</p>
              </div>
            )}
            {(order as any).notes && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Special Notes</p>
                <p className="text-lg">{(order as any).notes}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">Items</h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-gray-200 pb-2">
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x Rp {(item.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="font-semibold">Rp {(item.subtotal || 0).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 border-t-2 border-gray-300 pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-orange-600">Rp {(order.totalAmount || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>

          {order.payment && (
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold">Payment Information</h3>
              <p className="text-sm">
                <span className="font-semibold">Method:</span> {order.payment.method}
              </p>
              {order.payment.transactionId && (
                <p className="text-sm">
                  <span className="font-semibold">Transaction ID:</span> {order.payment.transactionId}
                </p>
              )}
              {order.payment.paidAt && (
                <p className="text-sm">
                  <span className="font-semibold">Paid At:</span> {formatDate(order.payment.paidAt)}
                </p>
              )}
            </div>
          )}

          <div className="border-t-2 border-dashed border-gray-300 pt-6 text-center">
            <p className="text-sm text-gray-600">Thank you for your order!</p>
            <p className="mt-2 text-sm text-gray-600">Please come again</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

