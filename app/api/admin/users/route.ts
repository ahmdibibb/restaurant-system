import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// GET all users (Admin only)
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
        const role = searchParams.get('role')

        const where: any = {}
        if (role) where.role = role

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST create user (Admin only)
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const currentUser = await getCurrentUser(token)

        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { email, name, password, role } = await request.json()

        // Validation
        if (!email || !name || !password || !role) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            )
        }

        if (!['USER', 'ADMIN', 'KITCHEN'].includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
