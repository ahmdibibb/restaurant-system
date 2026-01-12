import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET orders with filters (Admin only)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await getCurrentUser(token)

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const period = searchParams.get('period') || 'daily' // daily, monthly, all
        const date = searchParams.get('date') // YYYY-MM-DD or YYYY-MM
        const status = searchParams.get('status')
        const orderType = searchParams.get('orderType')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        // Build where clause
        const where: any = {}

        if (status) where.status = status
        if (orderType) where.orderType = orderType

        // Date filtering
        if (date) {
            if (period === 'daily') {
                // Filter by specific day
                const startDate = new Date(date)
                startDate.setHours(0, 0, 0, 0)
                const endDate = new Date(date)
                endDate.setHours(23, 59, 59, 999)

                where.createdAt = {
                    gte: startDate,
                    lte: endDate,
                }
            } else if (period === 'monthly') {
                // Filter by month (date should be YYYY-MM)
                const [year, month] = date.split('-')
                const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
                const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999)

                where.createdAt = {
                    gte: startDate,
                    lte: endDate,
                }
            }
        }

        // Get total count
        const totalCount = await prisma.order.count({ where })

        // Get orders with pagination
        const orders = await prisma.order.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                payment: {
                    select: {
                        id: true,
                        method: true,
                        status: true,
                        amount: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        })

        // Convert Decimal to number
        const ordersResponse = orders.map((order) => ({
            ...order,
            totalAmount: order.totalAmount.toNumber(),
            items: order.items.map((item) => ({
                ...item,
                price: item.price.toNumber(),
                subtotal: item.subtotal.toNumber(),
            })),
            payment: order.payment ? {
                ...order.payment,
                amount: order.payment.amount.toNumber(),
            } : null,
        }))

        // Calculate stats for the period
        const stats = {
            totalOrders: totalCount,
            totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount.toNumber(), 0),
            averageOrderValue: totalCount > 0
                ? orders.reduce((sum, order) => sum + order.totalAmount.toNumber(), 0) / totalCount
                : 0,
        }

        return NextResponse.json({
            orders: ordersResponse,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
            stats,
        })
    } catch (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
