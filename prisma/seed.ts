import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create Users
    console.log('Creating users...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    const kitchenPassword = await bcrypt.hash('kitchen123', 10)
    const userPassword = await bcrypt.hash('user123', 10)

    await prisma.user.createMany({
        data: [
            {
                id: 'clx00000000000000000000001',
                email: 'admin@resto.com',
                name: 'Admin Resto',
                password: adminPassword,
                role: 'ADMIN',
            },
            {
                id: 'clx00000000000000000000002',
                email: 'kitchen@resto.com',
                name: 'Kitchen Staff',
                password: kitchenPassword,
                role: 'KITCHEN',
            },
            {
                id: 'clx00000000000000000000003',
                email: 'user1@example.com',
                name: 'John Doe',
                password: userPassword,
                role: 'USER',
            },
        ],
        skipDuplicates: true,
    })

    // 2. Create Products
    console.log('Creating products...')
    await prisma.product.createMany({
        data: [
            {
                id: 'clx00000000000000000000011',
                name: 'Iga Bakar Madu',
                description: 'Iga bakar dengan bumbu madu yang manis dan gurih',
                price: 85000,
                category: 'MAKANAN',
                stock: 50,
                isActive: true,
            },
            {
                id: 'clx00000000000000000000012',
                name: 'Iga Bakar Spesial',
                description: 'Iga bakar dengan bumbu rahasia, sangat empuk dan juicy',
                price: 95000,
                category: 'MAKANAN',
                stock: 45,
                isActive: true,
            },
            {
                id: 'clx00000000000000000000013',
                name: 'Iga Bakar Pedas',
                description: 'Iga bakar dengan level pedas yang bisa disesuaikan',
                price: 90000,
                category: 'MAKANAN',
                stock: 40,
                isActive: true,
            },
            {
                id: 'clx00000000000000000000014',
                name: 'Iga Bakar BBQ',
                description: 'Iga bakar dengan saus BBQ ala Amerika, smoky dan lezat',
                price: 100000,
                category: 'MAKANAN',
                stock: 35,
                isActive: true,
            },
            {
                id: 'clx00000000000000000000015',
                name: 'Iga Bakar Kecap',
                description: 'Iga bakar dengan bumbu kecap manis, khas Indonesia',
                price: 80000,
                category: 'MAKANAN',
                stock: 55,
                isActive: true,
            },
            {
                id: 'clx00000000000000000000019',
                name: 'Es Teh Manis',
                description: 'Es teh manis segar',
                price: 8000,
                category: 'MINUMAN',
                stock: 100,
                isActive: true,
            },
            {
                id: 'clx00000000000000000000020',
                name: 'Es Jeruk',
                description: 'Es jeruk peras',
                price: 10000,
                category: 'MINUMAN',
                stock: 80,
                isActive: true,
            },
            {
                id: 'clx00000000000000000000021',
                name: 'Jus Alpukat',
                description: 'Jus alpukat segar dengan susu',
                price: 15000,
                category: 'MINUMAN',
                stock: 60,
                isActive: true,
            },
        ],
        skipDuplicates: true,
    })

    console.log('✅ Seed completed successfully!')
    console.log('\n📝 Default credentials:')
    console.log('Admin: admin@resto.com / admin123')
    console.log('Kitchen: kitchen@resto.com / kitchen123')
    console.log('User: user1@example.com / user123')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
