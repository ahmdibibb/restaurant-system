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

    // Get date range (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    // Total products sold (from OrderItem where order has paid payment)
    let totalProductsSold = 0
    try {
      // First, get all paid order IDs in the last 30 days
      const paidOrders = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          orderId: true,
        },
      })

      const paidOrderIds = paidOrders.map((p) => p.orderId)

      if (paidOrderIds.length > 0) {
        const productsSoldResult = await prisma.orderItem.aggregate({
          where: {
            orderId: {
              in: paidOrderIds,
            },
          },
          _sum: {
            quantity: true,
          },
        })
        totalProductsSold = productsSoldResult._sum.quantity || 0
      }
    } catch (error) {
      console.error('Error aggregating products sold:', error)
    }

    // Revenue by payment method
    let revenueByMethod: Record<string, number> = {
      CASH: 0,
      QRIS: 0,
      EDC: 0,
    }

    try {
      const payments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          method: true,
          amount: true,
        },
      })

      payments.forEach((payment) => {
        const method = payment.method
        const amount = payment.amount.toNumber()
        if (revenueByMethod[method] !== undefined) {
          revenueByMethod[method] += amount
        }
      })
    } catch (error) {
      console.error('Error fetching revenue by method:', error)
    }

    // Product sales breakdown (top products sold)
    let productSales: Array<{
      productId: string
      productName: string
      quantitySold: number
      totalRevenue: number
    }> = []

    try {
      // Get all paid order IDs in the last 30 days
      const paidOrders = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          orderId: true,
        },
      })

      const paidOrderIds = paidOrders.map((p) => p.orderId)

      if (paidOrderIds.length > 0) {
        const orderItems = await prisma.orderItem.findMany({
          where: {
            orderId: {
              in: paidOrderIds,
            },
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })

        // Group by product
        const productMap = new Map<
          string,
          { name: string; quantity: number; revenue: number }
        >()

        orderItems.forEach((item) => {
          const productId = item.productId
          const productName = item.product.name
          const quantity = item.quantity
          const revenue = item.subtotal.toNumber()

          if (productMap.has(productId)) {
            const existing = productMap.get(productId)!
            existing.quantity += quantity
            existing.revenue += revenue
          } else {
            productMap.set(productId, {
              name: productName,
              quantity,
              revenue,
            })
          }
        })

        productSales = Array.from(productMap.entries()).map(([productId, data]) => ({
          productId,
          productName: data.name,
          quantitySold: data.quantity,
          totalRevenue: data.revenue,
        }))

        // Sort by quantity sold (descending)
        productSales.sort((a, b) => b.quantitySold - a.quantitySold)
      }
    } catch (error) {
      console.error('Error fetching product sales:', error)
    }

    // Daily revenue for the last 30 days
    let dailyRevenue: Array<{ date: string; amount: number }> = []
    try {
      const payments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          amount: true,
          createdAt: true,
        },
      })

      const dailyMap = new Map<string, number>()
      payments.forEach((payment) => {
        const date = payment.createdAt.toISOString().split('T')[0]
        const amount = payment.amount.toNumber()
        dailyMap.set(date, (dailyMap.get(date) || 0) + amount)
      })

      dailyRevenue = Array.from(dailyMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('Error fetching daily revenue:', error)
    }

    // Total revenue
    const totalRevenue =
      revenueByMethod.CASH + revenueByMethod.QRIS + revenueByMethod.EDC

    return NextResponse.json({
      period: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        days: 30,
      },
      totalProductsSold,
      totalRevenue,
      revenueByMethod,
      productSales,
      dailyRevenue,
    })
  } catch (error: any) {
    console.error('Error fetching sales report:', error)

    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? error.message || 'Internal server error'
        : 'Internal server error'

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

