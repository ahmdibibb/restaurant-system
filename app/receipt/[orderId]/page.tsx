'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Printer, Download, Share2, Home, Mail } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface OrderItem {
  id: string
  quantity: number
  price: number
  subtotal: number
  product: {
    name: string
    category: string
  }
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  status: string
  orderType: string
  tableNumber?: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: OrderItem[]
  payment?: {
    method: string
    status: string
    paidAt: string
  }
}

export default function ReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    const element = document.getElementById('receipt-content')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`Receipt-${order?.orderNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Gagal membuat PDF')
    }
  }

  const handleShareWhatsApp = () => {
    if (!order) return
    const message = `*Resto Iga Bakar - Receipt*%0A%0AOrder: ${order.orderNumber}%0ATotal: Rp ${order.totalAmount.toLocaleString('id-ID')}%0AStatus: ${order.status}%0A%0ATrack: ${window.location.origin}/receipt/${order.id}`
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleShareEmail = () => {
    if (!order) return
    const subject = `Receipt - ${order.orderNumber}`
    const body = `Resto Iga Bakar Receipt\n\nOrder Number: ${order.orderNumber}\nTotal Amount: Rp ${order.totalAmount.toLocaleString('id-ID')}\nStatus: ${order.status}\n\nTrack your order: ${window.location.origin}/receipt/${order.id}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900">Order tidak ditemukan</h1>
        <button
          onClick={() => router.push('/products')}
          className="mt-4 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
        >
          Kembali ke Menu
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Action Buttons - Hidden on print */}
      <div className="print:hidden mx-auto mb-6 max-w-2xl px-4">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            <Printer size={20} />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Download PDF
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition-colors"
          >
            <Share2 size={20} />
            WhatsApp
          </button>
          <button
            onClick={handleShareEmail}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
          >
            <Mail size={20} />
            Email
          </button>
          <button
            onClick={() => router.push('/products')}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 transition-colors"
          >
            <Home size={20} />
            Home Page
          </button>
        </div>
      </div>

      {/* Receipt Content */}
      <div id="receipt-content" className="mx-auto max-w-2xl bg-white p-8 shadow-lg print:shadow-none">
        {/* Header */}
        <div className="border-b-2 border-dashed border-gray-300 pb-6 text-center">
          <h1 className="text-3xl font-bold text-orange-600">Resto Iga Bakar</h1>
          <p className="mt-2 text-sm text-gray-600">Jl. Contoh No. 123, Jakarta</p>
          <p className="text-sm text-gray-600">Telp: (021) 1234-5678</p>
        </div>

        {/* Order Info */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Order Number:</span>
            <span className="font-mono font-bold text-gray-900">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Date:</span>
            <span className="text-gray-900">
              {new Date(order.createdAt).toLocaleString('id-ID', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Customer:</span>
            <span className="text-gray-900">{order.user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Type:</span>
            <span className="text-gray-900">
              {order.orderType === 'DINE_IN' ? '🍽️ Dine-In' : '🥡 Takeaway'}
              {order.tableNumber && ` - Table ${order.tableNumber}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Status:</span>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
              {order.status}
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Order Items</h2>
          <table className="w-full">
            <thead className="border-b-2 border-gray-300">
              <tr>
                <th className="pb-2 text-left text-sm font-semibold text-gray-700">Item</th>
                <th className="pb-2 text-center text-sm font-semibold text-gray-700">Qty</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-700">Price</th>
                <th className="pb-2 text-right text-sm font-semibold text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-sm text-gray-900">{item.product.name}</td>
                  <td className="py-3 text-center text-sm text-gray-900">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-gray-900">
                    Rp {item.price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 text-right text-sm font-semibold text-gray-900">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-6 border-t-2 border-gray-300 pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span className="text-gray-900">TOTAL</span>
            <span className="text-orange-600">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
          </div>
          {order.payment && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">{order.payment.method}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 border-t-2 border-dashed border-gray-300 pt-6 text-center">
          <p className="text-sm font-semibold text-gray-900">Terima kasih atas kunjungan Anda!</p>
          <p className="mt-2 text-xs text-gray-600">Silakan datang kembali</p>
        </div>
      </div>
    </div>
  )
}
