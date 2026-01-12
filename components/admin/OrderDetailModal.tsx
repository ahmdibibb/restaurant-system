'use client'

import { X } from 'lucide-react'

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
}

interface OrderDetailModalProps {
    order: Order | null
    onClose: () => void
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
    if (!order) return null

    const getStatusBadge = (status: string) => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-blue-100 text-blue-800',
            READY: 'bg-green-100 text-green-800',
            COMPLETED: 'bg-gray-100 text-gray-800',
        }
        return badges[status as keyof typeof badges] || badges.PENDING
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                        <p className="text-sm text-gray-500">{order.orderNumber}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h3>
                        <div className="space-y-1">
                            <p className="text-gray-900 font-medium">{order.user.name}</p>
                            <p className="text-sm text-gray-600">{order.user.email}</p>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Order Type</p>
                            <p className="font-medium text-gray-900">
                                {order.orderType === 'DINE_IN' ? '🍽️ Dine-In' : '🥡 Takeaway'}
                            </p>
                            {order.tableNumber && (
                                <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-gray-500 mb-1">Order Date</p>
                            <p className="font-medium text-gray-900">
                                {new Date(order.createdAt).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.product.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {item.quantity} × Rp {item.price.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        Rp {item.subtotal.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-semibold text-gray-900">Total Amount</p>
                            <p className="text-2xl font-bold text-orange-600">
                                Rp {order.totalAmount.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full bg-orange-600 text-white py-2 rounded-xl hover:bg-orange-700 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
