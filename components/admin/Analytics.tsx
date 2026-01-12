'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Package, DollarSign, Calendar, Users } from 'lucide-react'

interface AnalyticsData {
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    newCustomers: number
}

interface TopProduct {
    product: {
        name: string
        category: string
    }
    quantitySold: number
    totalRevenue: number
}

interface RevenueBreakdown {
    revenueByMethod: {
        CASH: number
        QRIS: number
        EDC: number
    }
    revenueByOrderType: {
        DINE_IN: number
        TAKEAWAY: number
    }
}

export default function Analytics() {
    const [days, setDays] = useState(30)
    const [overview, setOverview] = useState<AnalyticsData | null>(null)
    const [topProducts, setTopProducts] = useState<TopProduct[]>([])
    const [revenue, setRevenue] = useState<RevenueBreakdown | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [days])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const [overviewRes, productsRes, revenueRes] = await Promise.all([
                fetch(`/api/admin/analytics?days=${days}&type=overview`, { credentials: 'include' }),
                fetch(`/api/admin/analytics?days=${days}&type=top-products`, { credentials: 'include' }),
                fetch(`/api/admin/analytics?days=${days}&type=revenue-breakdown`, { credentials: 'include' }),
            ])

            const [overviewData, productsData, revenueData] = await Promise.all([
                overviewRes.json(),
                productsRes.json(),
                revenueRes.json(),
            ])

            setOverview(overviewData)
            setTopProducts(productsData.topProducts || [])
            setRevenue(revenueData)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const foodProducts = topProducts.filter(p => p.product.category === 'MAKANAN')
    const drinkProducts = topProducts.filter(p => p.product.category === 'MINUMAN')

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-orange-600" size={28} />
                    <h2 className="text-2xl font-bold text-gray-900">Sales Analytics</h2>
                </div>
                <select
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="rounded-xl border-2 border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                </select>
            </div>

            {/* Overview Stats */}
            {overview && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                                <p className="text-4xl font-bold text-blue-900 mt-2">{overview.totalOrders}</p>
                            </div>
                            <Package size={32} className="text-blue-600" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-green-50 to-green-100 p-6 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">
                                    Rp {overview.totalRevenue.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <DollarSign size={32} className="text-green-600" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Avg Order Value</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">
                                    Rp {Math.round(overview.averageOrderValue).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <TrendingUp size={32} className="text-purple-600" />
                        </div>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 p-6 border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-medium">New Customers</p>
                                <p className="text-4xl font-bold text-orange-900 mt-2">{overview.newCustomers}</p>
                            </div>
                            <Users size={32} className="text-orange-600" />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top Products */}
                <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                    <h3 className="mb-6 text-xl font-bold text-gray-900">Top Products</h3>

                    {/* Foods */}
                    {foodProducts.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">🍽️ Foods</h4>
                            <div className="space-y-3">
                                {foodProducts.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-xl bg-orange-50 p-4 border border-orange-100">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">{item.quantitySold} sold</p>
                                        </div>
                                        <p className="font-bold text-orange-600">
                                            Rp {item.totalRevenue.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Drinks */}
                    {drinkProducts.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-3">🥤 Drinks</h4>
                            <div className="space-y-3">
                                {drinkProducts.slice(0, 5).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between rounded-xl bg-blue-50 p-4 border border-blue-100">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{item.product.name}</p>
                                            <p className="text-xs text-gray-500">{item.quantitySold} sold</p>
                                        </div>
                                        <p className="font-bold text-blue-600">
                                            Rp {item.totalRevenue.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {topProducts.length === 0 && (
                        <p className="text-center text-gray-400 py-8">No product data available</p>
                    )}
                </div>

                {/* Revenue Breakdown */}
                {revenue && (
                    <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                        <h3 className="mb-6 text-xl font-bold text-gray-900">Revenue Breakdown</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* By Payment Method - Donut Chart */}
                            <div>
                                <p className="mb-4 text-sm font-semibold text-gray-700 text-center">By Payment Method</p>
                                <div className="relative w-48 h-48 mx-auto">
                                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                        {(() => {
                                            const total = revenue.revenueByMethod.CASH + revenue.revenueByMethod.QRIS + revenue.revenueByMethod.EDC
                                            if (total === 0) return null

                                            const cashPercent = (revenue.revenueByMethod.CASH / total) * 100
                                            const qrisPercent = (revenue.revenueByMethod.QRIS / total) * 100
                                            const edcPercent = (revenue.revenueByMethod.EDC / total) * 100

                                            const radius = 70
                                            const circumference = 2 * Math.PI * radius

                                            let currentOffset = 0

                                            return (
                                                <>
                                                    {/* Cash - Green */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke="#10b981"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${(cashPercent / 100) * circumference} ${circumference}`}
                                                        strokeDashoffset={currentOffset}
                                                    />
                                                    {(() => { currentOffset -= (cashPercent / 100) * circumference; return null })()}

                                                    {/* QRIS - Purple */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke="#a855f7"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${(qrisPercent / 100) * circumference} ${circumference}`}
                                                        strokeDashoffset={currentOffset}
                                                    />
                                                    {(() => { currentOffset -= (qrisPercent / 100) * circumference; return null })()}

                                                    {/* EDC - Blue */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke="#3b82f6"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${(edcPercent / 100) * circumference} ${circumference}`}
                                                        strokeDashoffset={currentOffset}
                                                    />
                                                </>
                                            )
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                Rp {(revenue.revenueByMethod.CASH + revenue.revenueByMethod.QRIS + revenue.revenueByMethod.EDC).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="text-gray-700">Cash</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            Rp {revenue.revenueByMethod.CASH.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span className="text-gray-700">QRIS</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            Rp {revenue.revenueByMethod.QRIS.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <span className="text-gray-700">EDC</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            Rp {revenue.revenueByMethod.EDC.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* By Order Type - Donut Chart */}
                            <div>
                                <p className="mb-4 text-sm font-semibold text-gray-700 text-center">By Order Type</p>
                                <div className="relative w-48 h-48 mx-auto">
                                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                                        {(() => {
                                            const total = revenue.revenueByOrderType.DINE_IN + revenue.revenueByOrderType.TAKEAWAY
                                            if (total === 0) return null

                                            const dineInPercent = (revenue.revenueByOrderType.DINE_IN / total) * 100
                                            const takeawayPercent = (revenue.revenueByOrderType.TAKEAWAY / total) * 100

                                            const radius = 70
                                            const circumference = 2 * Math.PI * radius

                                            return (
                                                <>
                                                    {/* Dine-In - Orange */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke="#f97316"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${(dineInPercent / 100) * circumference} ${circumference}`}
                                                    />

                                                    {/* Takeaway - Yellow */}
                                                    <circle
                                                        cx="100"
                                                        cy="100"
                                                        r={radius}
                                                        fill="transparent"
                                                        stroke="#eab308"
                                                        strokeWidth="30"
                                                        strokeDasharray={`${(takeawayPercent / 100) * circumference} ${circumference}`}
                                                        strokeDashoffset={-((dineInPercent / 100) * circumference)}
                                                    />
                                                </>
                                            )
                                        })()}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                Rp {(revenue.revenueByOrderType.DINE_IN + revenue.revenueByOrderType.TAKEAWAY).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span className="text-gray-700">Dine-In</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            Rp {revenue.revenueByOrderType.DINE_IN.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                            <span className="text-gray-700">Takeaway</span>
                                        </div>
                                        <span className="font-semibold text-gray-900">
                                            Rp {revenue.revenueByOrderType.TAKEAWAY.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
