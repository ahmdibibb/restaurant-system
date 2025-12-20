'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SimpleNavbar from '@/components/navbar/SimpleNavbar'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleCreateOrder = async () => {
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
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create order')
        return
      }

      // Clear cart
      localStorage.removeItem('cart')

      // Redirect to payment
      router.push(`/payment/${data.id}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">No items in cart</p>
          <Link
            href="/products"
            className="mt-4 inline-block text-orange-600 hover:text-orange-700"
          >
            Go to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar title="" backHref="/cart" backLabel="Back to Cart" />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Checkout</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="space-y-3 rounded-lg bg-white p-4 shadow-md">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    Rp {getTotalPrice().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Confirm Order</h2>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <p className="mb-4 text-gray-600">
                Please review your order and click the button below to proceed to payment.
              </p>
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full rounded-lg bg-orange-600 px-6 py-3 text-lg font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Creating Order...' : 'Confirm & Proceed to Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

