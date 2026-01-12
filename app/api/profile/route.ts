import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET user profile
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

        // Get user with order count
        const userWithStats = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        })

        if (!userWithStats) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            ...userWithStats,
            totalOrders: userWithStats._count.orders,
        })
    } catch (error) {
        console.error('Error fetching profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await getCurrentUser(token)

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, email, currentPassword, newPassword } = await request.json()

        // Validate input
        if (!name || !email) {
            return NextResponse.json(
                { error: 'Name and email are required' },
                { status: 400 }
            )
        }

        // Check if email is already taken by another user
        if (email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already in use' },
                    { status: 400 }
                )
            }
        }

        // Prepare update data
        const updateData: any = {
            name,
            email,
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required to change password' },
                    { status: 400 }
                )
            }

            const currentUser = await prisma.user.findUnique({
                where: { id: user.id },
            })

            if (!currentUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }

            const isPasswordValid = await bcrypt.compare(
                currentPassword,
                currentUser.password
            )

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                )
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10)
            updateData.password = hashedPassword
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
