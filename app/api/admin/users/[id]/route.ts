import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET user by ID (Admin only)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await getCurrentUser(token)

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PUT update user (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await getCurrentUser(token)

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { email, name, role, password } = await request.json()

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: params.id },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Validate role if provided
        if (role && !['USER', 'ADMIN', 'KITCHEN'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            )
        }

        // Check email uniqueness if changing email
        if (email && email !== user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: 'Email already exists' },
                    { status: 400 }
                )
            }
        }

        // Prepare update data
        const updateData: any = {}
        if (email) updateData.email = email
        if (name) updateData.name = name
        if (role) updateData.role = role
        if (password) {
            updateData.password = await bcrypt.hash(password, 10)
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// DELETE user (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await getCurrentUser(token)

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Prevent deleting self
        if (params.id === currentUser.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: params.id },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if this is the last admin
        if (user.role === 'ADMIN') {
            const adminCount = await prisma.user.count({
                where: { role: 'ADMIN' },
            })

            if (adminCount <= 1) {
                return NextResponse.json(
                    { error: 'Cannot delete the last admin user' },
                    { status: 400 }
                )
            }
        }

        // Delete user
        await prisma.user.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ message: 'User deleted successfully' })
    } catch (error) {
        console.error('Error deleting user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
