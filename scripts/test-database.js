#!/usr/bin/env node

/**
 * Script untuk test koneksi database
 */

const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing database connection...\n');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection: OK\n');

    // Test queries
    console.log('📊 Testing queries...\n');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`✅ Users table: ${userCount} users found`);

    // Count products
    const productCount = await prisma.product.count();
    console.log(`✅ Products table: ${productCount} products found`);

    // Count orders
    const orderCount = await prisma.order.count();
    console.log(`✅ Orders table: ${orderCount} orders found`);

    // Get sample data
    console.log('\n📋 Sample data:');
    
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (adminUser) {
      console.log(`   Admin: ${adminUser.email} (${adminUser.name})`);
    }

    const products = await prisma.product.findMany({
      take: 3,
      select: {
        name: true,
        price: true,
        stock: true,
      },
    });
    console.log(`   Products: ${products.length} sample products`);
    products.forEach((p) => {
      console.log(`     - ${p.name}: Rp ${p.price.toNumber().toLocaleString('id-ID')} (Stock: ${p.stock})`);
    });

    console.log('\n✅ Database integration test: PASSED');
    console.log('✅ All systems ready!');
  } catch (error) {
    console.error('\n❌ Database test failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Cannot reach database server. Check:');
      console.error('   - MySQL service is running');
      console.error('   - DATABASE_URL in .env is correct');
    } else if (error.code === 'P1000') {
      console.error('\n💡 Authentication failed!');
      console.error('\n🔧 QUICK FIX:');
      console.error('   1. Login to MySQL: mysql -u root -p');
      console.error('   2. Run this SQL (replace "password" with your MySQL password):');
      console.error('      ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'password\';');
      console.error('      FLUSH PRIVILEGES;');
      console.error('   3. Run: npm run db:test again');
      console.error('\n📖 For detailed instructions, see: FIX_AUTH_NOW.md or MYSQL_AUTH_FIX.md');
    } else if (error.code === 'P1003') {
      console.error('\n💡 Database does not exist. Run:');
      console.error('   mysql -u root -p < prisma/database_setup.sql');
    } else if (error.message.includes('sha256_password') || error.message.includes('caching_sha2_password')) {
      console.error('\n💡 MySQL Authentication Plugin Error!');
      console.error('\n🔧 QUICK FIX:');
      console.error('   1. Login to MySQL: mysql -u root -p');
      console.error('   2. Run this SQL (replace "password" with your MySQL password):');
      console.error('      ALTER USER \'root\'@\'localhost\' IDENTIFIED WITH mysql_native_password BY \'password\';');
      console.error('      FLUSH PRIVILEGES;');
      console.error('   3. Restart MySQL service (optional but recommended)');
      console.error('   4. Run: npm run db:test again');
      console.error('\n📖 Quick guide: FIX_AUTH_NOW.md');
      console.error('📖 Detailed guide: MYSQL_AUTH_FIX.md');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();

