'use client'

import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface CartItem {
    productId: string
    name: string
    price: number
    quantity: number
}

interface CartSidebarProps {
    cart: CartItem[]
    onUpdateQuantity: (productId: string, quantity: number) => void
    onRemoveItem: (productId: string) => void
    onCheckout: () => void
}

export default function CartSidebar({ cart, onUpdateQuantity, onRemoveItem, onCheckout }: CartSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0)
    }

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-white shadow-2xl transition-all hover:bg-orange-700 lg:hidden"
            >
                {isOpen ? <X size={24} /> : <ShoppingCart size={24} />}
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                        {getTotalItems()}
                    </span>
                )}
            </button>

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-full bg-white shadow-2xl transition-transform duration-300 lg:left-0 lg:top-0 lg:h-screen lg:w-96 lg:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingCart className="text-white" size={24} />
                                <h2 className="text-xl font-bold text-white">Pesanan</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white lg:hidden"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        {cart.length > 0 && (
                            <p className="mt-2 text-sm text-orange-100">
                                {getTotalItems()} item dalam keranjang
                            </p>
                        )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <ShoppingCart size={64} className="mb-4 text-gray-300" />
                                <p className="text-lg font-semibold text-gray-600">
                                    Keranjang Kosong
                                </p>
                                <p className="mt-2 text-sm text-gray-400">
                                    Silakan masukkan pesanan
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {cart.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="rounded-xl bg-gray-50 p-4 shadow-sm transition-all hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800 line-clamp-1">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-1 text-sm font-bold text-orange-600">
                                                    Rp {item.price.toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onRemoveItem(item.productId)}
                                                className="text-red-500 transition-colors hover:text-red-700"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm transition-all hover:bg-orange-50 active:scale-95"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-12 text-center font-bold text-gray-800">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm transition-all hover:bg-orange-50 active:scale-95"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <p className="font-bold text-gray-800">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer - Total & Checkout */}
                    {cart.length > 0 && (
                        <div className="border-t border-gray-200 bg-white p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-700">Total</span>
                                <span className="text-2xl font-bold text-orange-600">
                                    Rp {getTotalPrice().toLocaleString('id-ID')}
                                </span>
                            </div>
                            <button
                                onClick={onCheckout}
                                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-4 font-bold text-white shadow-lg transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95"
                            >
                                Checkout ({getTotalItems()} item)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                />
            )}
        </>
    )
}
