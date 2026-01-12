'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ShoppingCart, User } from 'lucide-react'

interface CartItem {
  productId: string
  quantity: number
}

interface NavbarProps {
  title: string
  showCart?: boolean
  cart?: CartItem[]
  cartHref?: string
  sticky?: boolean
}

export default function Navbar({
  title,
  showCart = false,
  cart = [],
  cartHref = '/cart',
  sticky = false
}: NavbarProps) {
  const router = useRouter()



  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const navClassName = sticky
    ? "sticky top-0 z-50 bg-white shadow-md"
    : "bg-white shadow-sm"

  return (
    <nav className={navClassName}>
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-orange-600">{title}</h1>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">


            {/* Cart Button (if showCart is true) */}
            {showCart && (
              <Link
                href={cartHref}
                className="group relative flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-all hover:bg-orange-700 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={20} className="transition-transform group-hover:scale-110" />
                <span>Cart ({cart.length})</span>
                {cart.length > 0 && (
                  <span className="absolute -right-2 -top-2 animate-bounce rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Button */}
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-all hover:bg-gray-50 hover:scale-105 active:scale-95 w-full md:w-auto"
            >
              <User size={20} />
              Profile
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-all hover:bg-gray-50 hover:scale-105 active:scale-95 w-full md:w-auto"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

