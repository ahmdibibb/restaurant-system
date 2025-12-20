import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let where: any = {}

    // If user is not admin, only show their own orders
    if (user.role !== 'ADMIN') {
      where.userId = user.id
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payment: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Convert Decimal to number for frontend
    const ordersResponse = orders.map((order) => ({
      ...order,
      totalAmount: order.totalAmount.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toNumber(),
        subtotal: item.subtotal.toNumber(),
      })),
      payment: order.payment
        ? {
            ...order.payment,
            amount: order.payment.amount.toNumber(),
          }
        : null,
    }))

    return NextResponse.json(ordersResponse)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create order
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser(token)

    if (!user || user.role !== 'USER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Validate and calculate total
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        )
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        )
      }

      const subtotal = product.price.toNumber() * item.quantity
      totalAmount += subtotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal: new Prisma.Decimal(subtotal),
      })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        totalAmount: new Prisma.Decimal(totalAmount),
        status: 'PENDING',
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })

      await prisma.stockHistory.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: 'OUT',
          description: `Order ${orderNumber}`,
        },
      })
    }

    // Convert Decimal to number for frontend
    const orderResponse = {
      ...order,
      totalAmount: order.totalAmount.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        price: item.price.toNumber(),
        subtotal: item.subtotal.toNumber(),
      })),
    }

    return NextResponse.json(orderResponse, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

