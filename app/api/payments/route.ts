import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST create payment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getCurrentUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, method } = await request.json()

    if (!orderId || !method) {
      return NextResponse.json(
        { error: 'Order ID and payment method are required' },
        { status: 400 }
      )
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    })

    if (existingPayment && existingPayment.status === 'PAID') {
      return NextResponse.json(
        { error: 'Order already paid' },
        { status: 400 }
      )
    }

    // Generate transaction ID for QRIS and EDC
    let transactionId: string | null = null
    if (method === 'QRIS' || method === 'EDC') {
      transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }

    // Validate payment method enum
    const validMethods = ['CASH', 'QRIS', 'EDC']
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Simulate payment processing
    // In real implementation, this would integrate with payment gateway
    const paymentStatus = 'PAID' // Dummy: all payments succeed

    // Ensure amount is properly formatted as Decimal
    let paymentAmount: Prisma.Decimal
    if (order.totalAmount instanceof Prisma.Decimal) {
      paymentAmount = order.totalAmount
    } else if (typeof order.totalAmount === 'string') {
      paymentAmount = new Prisma.Decimal(order.totalAmount)
    } else if (typeof order.totalAmount === 'number') {
      paymentAmount = new Prisma.Decimal(order.totalAmount)
    } else {
      paymentAmount = new Prisma.Decimal(order.totalAmount.toString())
    }

    try {
      const payment = await prisma.payment.upsert({
        where: { orderId },
        update: {
          method: method as 'CASH' | 'QRIS' | 'EDC',
          status: paymentStatus as 'PAID',
          transactionId,
          paidAt: paymentStatus === 'PAID' ? new Date() : null,
          amount: paymentAmount,
        },
        create: {
          orderId,
          method: method as 'CASH' | 'QRIS' | 'EDC',
          amount: paymentAmount,
          status: paymentStatus as 'PAID',
          transactionId,
          paidAt: paymentStatus === 'PAID' ? new Date() : null,
        },
      })

      // Update order status
      if (paymentStatus === 'PAID') {
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CONFIRMED' },
        })
      }

      // Convert Decimal to number for frontend
      const paymentResponse = {
        ...payment,
        amount: payment.amount.toNumber(),
      }

      return NextResponse.json(paymentResponse, { status: 201 })
    } catch (dbError: any) {
      console.error('Database error creating payment:', dbError)
      throw dbError
    }
  } catch (error: any) {
    console.error('Error creating payment:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })

    // Return error with more details in development
    let errorMessage = 'Internal server error'
    if (process.env.NODE_ENV === 'development') {
      errorMessage = error.message || 'Internal server error'
      if (error.code) {
        errorMessage += ` (Code: ${error.code})`
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development'
          ? {
            message: error.message,
            code: error.code,
            stack: error.stack,
            meta: error.meta,
          }
          : undefined
      },
      { status: 500 }
    )
  }
}

