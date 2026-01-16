'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users as UsersIcon,
  TrendingUp,
  Menu,
  Bell,
  Moon,
  User,
  Settings,
  FileText,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Download,
  DollarSign,
} from 'lucide-react'
import Loading from '@/components/Loading'
import UserManagement from '@/components/admin/UserManagement'
import OrderList from '@/components/admin/OrderList'
import Analytics from '@/components/admin/Analytics'
import OrderDetailModal from '@/components/admin/OrderDetailModal'
import { generateSalesReportPDF } from '@/lib/generateSalesReportPDF'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  productsSold: number
  lowStockProducts: Array<{ id: string; name: string; stock: number }>
  topProducts: Array<{ product: any; quantitySold: number }>
  dailySales: Array<{ date: string; amount: number }>
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  isActive: boolean
  category: string | null
  image: string | null
}

interface SalesReport {
  period: {
    startDate: string
    endDate: string
    days: number
  }
  totalProductsSold: number
  totalRevenue: number
  revenueByMethod: {
    CASH: number
    QRIS: number
    EDC: number
  }
  productSales: Array<{
    productId: string
    productName: string
    quantitySold: number
    totalRevenue: number
  }>
  dailyRevenue: Array<{ date: string; amount: number }>
}

type Tab = 'dashboard' | 'products' | 'orders' | 'users' | 'analytics'

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showSalesReport, setShowSalesReport] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [todayOrders, setTodayOrders] = useState(0)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [revenuePeriod, setRevenuePeriod] = useState('monthly')
  const [orderPeriod, setOrderPeriod] = useState('weekly')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    category: '',
  })

  useEffect(() => {
    checkUserRole()
  }, [])

  useEffect(() => {
    // Only fetch dashboard data after authentication and when on dashboard tab
    if (isAuthenticated && activeTab === 'dashboard') {
      // Initial fetch
      fetchTodayStats()
      fetchRecentOrders()
      fetchStats()

      // Set up polling to refresh data every 5 seconds
      const interval = setInterval(() => {
        fetchTodayStats()
        fetchRecentOrders()
        fetchStats()
      }, 5000) // Refresh every 5 seconds

      // Cleanup interval when component unmounts or dependencies change
      return () => clearInterval(interval)
    }
  }, [activeTab, isAuthenticated])

  const checkUserRole = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!res.ok) {
        router.push('/login')
        return
      }

      const data = await res.json()
      if (data.user?.role !== 'ADMIN') {
        setError('Access denied. Admin privileges required.')
        setLoading(false)
        setIsAuthenticated(false)
        return
      }

      // Clear any previous errors and mark as authenticated
      setError(null)
      setIsAuthenticated(true)

      await Promise.all([fetchStats(), fetchProducts()])
      setLoading(false)
    } catch (error) {
      console.error('Error checking user role:', error)
      setLoading(false)
      setIsAuthenticated(false)
      router.push('/login')
    }
  }

  const fetchTodayStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const res = await fetch(`/api/admin/orders?period=daily&date=${today}&limit=100`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setTodayOrders(data.stats?.totalOrders || 0)
        setTodayRevenue(data.stats?.totalRevenue || 0)
        // Clear error on successful fetch
        setError(null)
      }
      // Silently handle errors - don't spam console during polling
    } catch (error) {
      // Silently handle errors - don't spam console during polling
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders?period=all&limit=5', {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setRecentOrders(data.orders || [])
        // Clear error on successful fetch
        setError(null)
      }
      // Silently handle errors - don't spam console during polling
    } catch (error) {
      // Silently handle errors - don't spam console during polling
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats?period=month', {
        credentials: 'include',
      })

      if (!res.ok) {
        setStats({
          totalSales: 0,
          totalOrders: 0,
          productsSold: 0,
          lowStockProducts: [],
          topProducts: [],
          dailySales: [],
        })
        return
      }

      const data = await res.json()
      setStats({
        totalSales: data.totalSales || 0,
        totalOrders: data.totalOrders || 0,
        productsSold: data.productsSold || 0,
        lowStockProducts: data.lowStockProducts || [],
        topProducts: data.topProducts || [],
        dailySales: data.dailySales || [],
      })
      // Clear error on successful fetch
      setError(null)
    } catch (error) {
      // Silently handle errors - don't spam console during polling
      setStats({
        totalSales: 0,
        totalOrders: 0,
        productsSold: 0,
        lowStockProducts: [],
        topProducts: [],
        dailySales: [],
      })
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
      // Clear error on successful fetch
      setError(null)
    } catch (error) {
      // Silently handle errors - don't spam console during polling
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesReport = async () => {
    try {
      const res = await fetch('/api/dashboard/sales-report', {
        credentials: 'include',
      })

      if (!res.ok) {
        setSalesReport(null)
        return
      }

      const data = await res.json()
      setSalesReport(data)
    } catch (error) {
      console.error('Error fetching sales report:', error)
      setSalesReport(null)
    }
  }

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
        }),
      })

      if (res.ok) {
        setShowProductForm(false)
        setEditingProduct(null)
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          image: '',
          category: '',
        })
        fetchProducts()
        setError(null)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setError('Network error. Please try again.')
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image || '',
      category: product.category || '',
    })
    setShowProductForm(true)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as Tab, label: 'Products', icon: Package },
    { id: 'orders' as Tab, label: 'Orders', icon: ShoppingCart },
    { id: 'users' as Tab, label: 'Users', icon: UsersIcon },
    { id: 'analytics' as Tab, label: 'Analytics', icon: TrendingUp },
  ]

  if (loading) {
    return <Loading />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/80 flex flex-col py-6 z-50 shadow-xl">
        {/* Logo */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 transform transition-transform hover:scale-105">
              <span className="text-xl">🔥</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Resto Iga Bakar</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${activeTab === item.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-lg shadow-orange-200 scale-[1.02]'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                  <div className={`${activeTab === item.id ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-orange-100'} p-1.5 rounded-lg transition-colors`}>
                    <Icon size={18} className={activeTab === item.id ? 'text-white' : 'text-gray-700 group-hover:text-orange-600'} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Settings & Logout */}
        <div className="px-4 space-y-2 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent pt-4 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md transition-all duration-200 group">
            <div className="bg-gray-100 group-hover:bg-blue-100 p-1.5 rounded-lg transition-colors">
              <Settings size={18} className="group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="text-sm">Settings</span>
          </button>
          <button
            onClick={() => {
              document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
              router.push('/login')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:shadow-md transition-all duration-200 group"
          >
            <div className="bg-red-50 group-hover:bg-red-100 p-1.5 rounded-lg transition-colors">
              <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {navItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-md group">
                <Moon size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors" />
              </button>
              <button className="p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-md relative group">
                <Bell size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 ml-2 border-l border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Admin</span>
                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-gray-200 hover:ring-orange-300 transition-all duration-200 cursor-pointer hover:scale-105">
                  <User size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800 font-semibold">⚠️ {error}</p>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Menus */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-900">{products.length}</p>
                      <p className="text-sm text-gray-500 mt-1">Total Menus</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-gray-900" />
                    </div>
                  </div>
                </div>

                {/* Total Orders Today */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-900">{todayOrders}</p>
                      <p className="text-sm text-gray-500 mt-1">Total Orders Today</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart size={20} className="text-gray-900" />
                    </div>
                  </div>
                </div>

                {/* Total Products Sold */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-900">{stats?.productsSold || 0}</p>
                      <p className="text-sm text-gray-500 mt-1">Total Products Sold</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-gray-900" />
                    </div>
                  </div>
                </div>

                {/* Revenue Today */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-900">
                        Rp {todayRevenue.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Revenue Today</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DollarSign size={20} className="text-gray-900" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Chart */}
              <div className="grid grid-cols-1 gap-6">
                {/* Revenue Chart - Modern Design */}
                <div className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-semibold text-gray-900">Monthly Revenue</h3>
                      <button className="w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-gray-400 hover:border-gray-600 hover:text-gray-600 transition-colors">
                        <span className="text-sm font-bold">i</span>
                      </button>
                    </div>
                    <div className="flex gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                      <button
                        onClick={() => setRevenuePeriod('today')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${revenuePeriod === 'today'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        Day
                      </button>
                      <button
                        onClick={() => setRevenuePeriod('weekly')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${revenuePeriod === 'weekly'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setRevenuePeriod('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${revenuePeriod === 'monthly'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        Month
                      </button>
                      <button
                        className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 transition-all duration-200"
                      >
                        Year
                      </button>
                      <button
                        className="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 transition-all duration-200"
                      >
                        Date Range
                      </button>
                    </div>
                  </div>
                  <div className="h-96 relative">
                    {stats?.dailySales && stats.dailySales.length > 0 ? (
                      <div className="h-full w-full relative">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs font-medium text-gray-400">
                          <span>{(Math.max(...stats.dailySales.map(d => d.amount)) / 1000).toFixed(0)}k</span>
                          <span>{(Math.max(...stats.dailySales.map(d => d.amount)) * 0.75 / 1000).toFixed(0)}k</span>
                          <span>{(Math.max(...stats.dailySales.map(d => d.amount)) / 2 / 1000).toFixed(0)}k</span>
                          <span>{(Math.max(...stats.dailySales.map(d => d.amount)) * 0.25 / 1000).toFixed(0)}k</span>
                          <span>0k</span>
                        </div>

                        {/* Chart area */}
                        <div className="ml-12 h-full pb-12 relative group">
                          <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
                            {/* Grid lines - horizontal dotted */}
                            <line x1="0" y1="0" x2="600" y2="0" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="75" x2="600" y2="75" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="150" x2="600" y2="150" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="225" x2="600" y2="225" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                            <line x1="0" y1="300" x2="600" y2="300" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />

                            {/* Area fill with cyan gradient */}
                            <defs>
                              <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                              </linearGradient>
                            </defs>

                            {(() => {
                              const dataCount = revenuePeriod === 'monthly' ? 30 : revenuePeriod === 'weekly' ? 7 : 1
                              const data = stats.dailySales.slice(-dataCount)
                              const maxAmount = Math.max(...data.map(d => d.amount), 1)
                              const points = data.map((day, i) => {
                                const x = data.length > 1 ? (i / (data.length - 1)) * 600 : 300
                                const y = 300 - (day.amount / maxAmount) * 280 - 10
                                return { x, y, amount: day.amount, date: day.date }
                              })

                              const linePoints = points.map(p => `${p.x},${p.y}`).join(' ')
                              const areaPoints = `0,300 ${linePoints} 600,300`

                              return (
                                <>
                                  {/* Area fill */}
                                  <polyline
                                    points={areaPoints}
                                    fill="url(#cyanGradient)"
                                  />
                                  {/* Line */}
                                  <polyline
                                    points={linePoints}
                                    fill="none"
                                    stroke="#0e7490"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  {/* Data points */}
                                  {points.map((point, i) => (
                                    <g key={i}>
                                      <circle
                                        cx={point.x}
                                        cy={point.y}
                                        r="5"
                                        fill="#0e7490"
                                        className="transition-all cursor-pointer hover:r-7"
                                      />
                                    </g>
                                  ))}
                                </>
                              )
                            })()}
                          </svg>

                          {/* X-axis labels */}
                          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs font-medium text-gray-400">
                            {(() => {
                              const dataCount = revenuePeriod === 'monthly' ? 30 : revenuePeriod === 'weekly' ? 7 : 1
                              const data = stats.dailySales.slice(-dataCount)
                              // Show labels every few days for monthly view
                              const step = revenuePeriod === 'monthly' ? 2 : 1
                              return data.filter((_, i) => i % step === 0 || i === data.length - 1).map((day, i) => (
                                <span key={i} className="text-center">
                                  {revenuePeriod === 'today'
                                    ? new Date(day.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                                    : new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                  }
                                </span>
                              ))
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="font-medium">No revenue data available</p>
                        <p className="text-sm mt-1">Start making sales to see your revenue chart</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order List Preview */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    View All →
                  </button>
                </div>

                {recentOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            No
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            ID #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Customer Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                            Status Order
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentOrders.map((order, index) => (
                          <tr
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 font-mono text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-900">
                              {order.user?.name || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
                              {order.orderType === 'DINE_IN'
                                ? `🍽️ Dine-In`
                                : '🥡 Takeaway'}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-gray-900">
                              Rp {order.totalAmount.toLocaleString('id-ID')}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'READY' ? 'bg-green-100 text-green-800' :
                                    order.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                      'bg-gray-100 text-gray-800'
                                }`}>
                                <span className={`w-2 h-2 rounded-full ${order.status === 'PENDING' ? 'bg-yellow-600' :
                                  order.status === 'CONFIRMED' ? 'bg-blue-600' :
                                    order.status === 'READY' ? 'bg-green-600' :
                                      order.status === 'COMPLETED' ? 'bg-gray-600' :
                                        'bg-gray-600'
                                  }`}></span>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No recent orders</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="mb-6 flex justify-between">
                <h2 className="text-2xl font-bold">Products Management</h2>
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      stock: '',
                      image: '',
                      category: '',
                    })
                    setShowProductForm(true)
                  }}
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                  <Plus size={20} />
                  Add Product
                </button>
              </div>

              {showProductForm && (
                <div className="mb-6 rounded-2xl bg-white p-6 border border-gray-200">
                  <h3 className="mb-4 text-xl font-semibold">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <form
                    onSubmit={handleSubmitProduct}
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="MAKANAN">Makanan</option>
                        <option value="MINUMAN">Minuman</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <button
                        type="submit"
                        className="rounded-xl bg-orange-600 px-6 py-2 text-white hover:bg-orange-700"
                      >
                        {editingProduct ? 'Update' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProductForm(false)
                          setEditingProduct(null)
                        }}
                        className="rounded-xl border border-gray-300 px-6 py-2 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto rounded-2xl bg-white border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 font-medium">
                          {product.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {product.category ? (
                            <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                              {product.category}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          Rp {(product.price || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">{product.stock}</td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${product.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrderList />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  )
}
