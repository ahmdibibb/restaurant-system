'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Minus, Trash2 } from 'lucide-react'
import SimpleNavbar from '@/components/navbar/SimpleNavbar'
import Loading from '@/components/Loading'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    setLoading(false)
  }

  const saveCart = (newCart: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(newCart))
    setCart(newCart)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    const newCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    )
    saveCart(newCart)
  }

  const removeItem = (productId: string) => {
    const newCart = cart.filter((item) => item.productId !== productId)
    saveCart(newCart)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }
    router.push('/checkout')
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleNavbar title="Shopping Cart" backHref="/products" backLabel="Back to Products" />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {cart.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-md">
            <p className="text-lg text-gray-600">Your cart is empty</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2 text-white hover:bg-orange-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                      Rp {item.price.toLocaleString('id-ID')} each
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="rounded-lg border border-gray-300 p-1 hover:bg-gray-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="rounded-lg border border-gray-300 p-1 hover:bg-gray-50"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <p className="w-32 text-right font-semibold">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="rounded-lg border border-red-300 p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
              <div className="mb-4 flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-orange-600">
                  Rp {getTotalPrice().toLocaleString('id-ID')}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full rounded-lg bg-orange-600 px-6 py-3 text-lg font-semibold text-white hover:bg-orange-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

