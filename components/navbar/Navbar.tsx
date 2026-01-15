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
    ? "sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg"
    : "bg-white shadow-md"

  return (
    <nav className={navClassName}>
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">{title}</h1>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-3">


            {/* Cart Button (if showCart is true) */}
            {showCart && (
              <Link
                href={cartHref}
                className="group relative flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 text-white transition-all duration-200 hover:shadow-lg hover:shadow-orange-200 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={20} className="transition-transform group-hover:scale-110" />
                <span className="font-medium">Cart ({cart.length})</span>
                {cart.length > 0 && (
                  <span className="absolute -right-2 -top-2 animate-bounce rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold shadow-lg ring-2 ring-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Button */}
            <Link
              href="/profile"
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 px-5 py-2.5 transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:scale-105 active:scale-95 w-full md:w-auto group"
            >
              <User size={20} className="text-gray-700 group-hover:text-gray-900 transition-colors" />
              <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Profile</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 px-5 py-2.5 transition-all duration-200 hover:bg-red-50 hover:border-red-200 hover:shadow-md hover:scale-105 active:scale-95 w-full md:w-auto group"
            >
              <LogOut size={20} className="text-gray-700 group-hover:text-red-600 transition-colors" />
              <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

