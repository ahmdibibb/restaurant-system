'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag, UtensilsCrossed, ShoppingBag } from 'lucide-react'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

type OrderType = 'DINE_IN' | 'TAKEAWAY'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [discountCode, setDiscountCode] = useState('')

  // Order details
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN')
  const [tableNumber, setTableNumber] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    } else {
      router.push('/products')
    }
  }, [router])

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getSubtotal = () => {
    return getTotalPrice()
  }

  const getDiscount = () => {
    return discountCode === 'DISCOUNT10' ? getTotalPrice() * 0.1 : 0
  }

  const getShipping = () => {
    return 0
  }

  const getFinalTotal = () => {
    return getSubtotal() - getDiscount() + getShipping()
  }

  const handleCreateOrder = async () => {
    // Validation
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      setError('Nomor meja wajib diisi untuk Dine-in')
      return
    }

    setLoading(true)
    setError('')

    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }))

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          orderType,
          tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
          notes: notes.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Gagal membuat pesanan')
        return
      }

      // Clear cart
      localStorage.removeItem('cart')

      // Redirect to payment
      router.push(`/payment/${data.id}`)
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <p className="text-lg text-gray-600 mb-4">Keranjang kosong</p>
          <Link
            href="/products"
            className="inline-block rounded-xl bg-orange-600 px-6 py-3 text-white hover:bg-orange-700 transition-all"
          >
            Kembali ke Menu
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Menu</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Review Pesanan Anda
          </h1>
          <p className="text-gray-600">Periksa kembali pesanan sebelum melanjutkan ke pembayaran</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
            <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Side - Cart Items & Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Pesanan</h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-50 to-transparent p-4 border border-orange-100"
                  >
                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>

                    {/* Total Price (price × quantity) */}
                    <div className="text-right">
                      <p className="font-bold text-orange-600 text-lg">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Type Selection */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Tipe Pesanan
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setOrderType('DINE_IN')}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${orderType === 'DINE_IN'
                    ? 'border-orange-600 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                    : 'border-gray-300 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`rounded-xl p-3 transition-all ${orderType === 'DINE_IN'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                      : 'bg-gray-100 group-hover:bg-orange-100'
                      }`}>
                      <UtensilsCrossed
                        size={32}
                        className={orderType === 'DINE_IN' ? 'text-white' : 'text-gray-600 group-hover:text-orange-600'}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">Dine-in</p>
                      <p className="text-xs text-gray-500">Makan di tempat</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOrderType('TAKEAWAY')}
                  className={`group relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 ${orderType === 'TAKEAWAY'
                    ? 'border-orange-600 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg scale-105'
                    : 'border-gray-300 bg-white hover:border-orange-300 hover:shadow-md'
                    }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`rounded-xl p-3 transition-all ${orderType === 'TAKEAWAY'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                      : 'bg-gray-100 group-hover:bg-orange-100'
                      }`}>
                      <ShoppingBag
                        size={32}
                        className={orderType === 'TAKEAWAY' ? 'text-white' : 'text-gray-600 group-hover:text-orange-600'}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900">Takeaway</p>
                      <p className="text-xs text-gray-500">Bawa pulang</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Table Number Input (Conditional) */}
              {orderType === 'DINE_IN' && (
                <div className="mt-6 animate-fadeIn">
                  <label htmlFor="tableNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Meja <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tableNumber"
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Contoh: 12"
                    className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-lg focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Special Notes */}
            <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Catatan Khusus (Opsional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tidak pakai sambal, level pedas sedang, dll"
                rows={3}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
              />
            </div>

            {/* Discount Code */}
            <div className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <Tag className="text-purple-600" size={24} />
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Masukkan kode diskon"
                  className="flex-1 border-0 bg-white/80 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button className="rounded-xl px-6 py-3 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-md">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
              <h2 className="mb-6 text-lg font-bold text-gray-900">
                Rincian Pesanan
              </h2>

              {/* Item Details */}
              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Subtotal & Total */}
              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    Rp {getSubtotal().toLocaleString('id-ID')}
                  </span>
                </div>

                {getShipping() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      Rp {getShipping().toLocaleString('id-ID')}
                    </span>
                  </div>
                )}

                {getDiscount() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-green-600">
                      -Rp {getDiscount().toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {/* Final Total */}
              <div className="mb-6 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                    Rp {getFinalTotal().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Memproses...
                  </span>
                ) : (
                  'Lanjut ke Pembayaran'
                )}
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
