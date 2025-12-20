import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser(token)

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'today' // today, week, month

    const now = new Date()
    let startDate: Date

    // Fix: Create new Date objects to avoid mutation
    switch (period) {
      case 'today':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 1)
        break
      default:
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
    }

    // Total sales - with safe error handling
    let totalSales = { _sum: { amount: null } }
    try {
      totalSales = await prisma.payment.aggregate({
        where: {
          status: 'PAID',
          createdAt: { gte: startDate },
        },
        _sum: {
          amount: true,
        },
      })
    } catch (error) {
      console.error('Error aggregating total sales:', error)
    }

    // Total orders - with safe error handling
    let totalOrders = 0
    try {
      totalOrders = await prisma.order.count({
        where: {
          createdAt: { gte: startDate },
        },
      })
    } catch (error) {
      console.error('Error counting orders:', error)
    }

    // Products sold - with safe error handling
    let productsSold = { _sum: { quantity: null } }
    try {
      productsSold = await prisma.orderItem.aggregate({
        where: {
          order: {
            createdAt: { gte: startDate },
          },
        },
        _sum: {
          quantity: true,
        },
      })
    } catch (error) {
      console.error('Error aggregating products sold:', error)
    }

    // Low stock products - with safe error handling
    let lowStockProducts: Array<{ id: string; name: string; stock: number }> = []
    try {
      lowStockProducts = await prisma.product.findMany({
        where: {
          stock: { lt: 10 },
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          stock: true,
        },
      })
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    }

    // Top selling products - with safe error handling
    let topProducts: Array<{ productId: string; _sum: { quantity: number | null } }> = []
    try {
      topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: startDate },
          },
        },
        _sum: {
          quantity: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      })
    } catch (error) {
      console.error('Error grouping top products:', error)
    }

    // Get product details for top products - with safe error handling
    let topProductsWithDetails: Array<{ product: any; quantitySold: number }> = []
    try {
      topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          try {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
            })
            return {
              product,
              quantitySold: item._sum.quantity || 0,
            }
          } catch (error) {
            console.error(`Error fetching product ${item.productId}:`, error)
            return {
              product: null,
              quantitySold: item._sum.quantity || 0,
            }
          }
        })
      )
    } catch (error) {
      console.error('Error fetching top products details:', error)
    }

    // Daily sales for the last 30 days - with safe error handling
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    let dailySales: Array<{ amount: any; createdAt: Date }> = []
    try {
      dailySales = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      })
    } catch (error) {
      console.error('Error fetching daily sales:', error)
    }

    const dailySalesGrouped = dailySales.reduce((acc: any, payment) => {
      try {
        const date = payment.createdAt.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += payment.amount?.toNumber() || 0
        return acc
      } catch (error) {
        console.error('Error processing daily sale:', error)
        return acc
      }
    }, {})

    return NextResponse.json({
      totalSales: totalSales._sum.amount?.toNumber() || 0,
      totalOrders,
      productsSold: productsSold._sum.quantity || 0,
      lowStockProducts,
      topProducts: topProductsWithDetails,
      dailySales: Object.entries(dailySalesGrouped).map(([date, amount]) => ({
        date,
        amount,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    
    // Return error with more details in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Internal server error'
      : 'Internal server error'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
