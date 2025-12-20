#!/usr/bin/env node

/**
 * Script untuk setup dan integrasi database
 * Menjalankan setup database lengkap
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Database Integration...\n');

// Check if .env exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ File .env tidak ditemukan!');
  console.log('📝 Membuat file .env dari template...');
  
  const envTemplate = `# Database
DATABASE_URL="mysql://root:password@localhost:3306/resto_iga_bakar"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ File .env telah dibuat!');
  console.log('⚠️  PERINGATAN: Edit file .env dan sesuaikan dengan kredensial MySQL Anda!\n');
}

// Step 1: Check if database setup SQL exists
const sqlPath = path.join(process.cwd(), 'prisma', 'database_setup.sql');
if (!fs.existsSync(sqlPath)) {
  console.log('❌ File prisma/database_setup.sql tidak ditemukan!');
  process.exit(1);
}

console.log('📋 Langkah-langkah setup database:');
console.log('1. Pastikan MySQL sudah berjalan');
console.log('2. Import file prisma/database_setup.sql ke MySQL');
console.log('3. Generate Prisma Client\n');

// Step 2: Generate Prisma Client
console.log('🔧 Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client generated successfully!\n');
} catch (error) {
  console.log('❌ Error generating Prisma Client');
  console.log('💡 Pastikan sudah menjalankan: npm install');
  process.exit(1);
}

// Step 3: Test database connection
console.log('🔍 Testing database connection...');
try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  prisma.$connect()
    .then(() => {
      console.log('✅ Database connection successful!');
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('\n✅ Database integration completed!');
      console.log('\n📝 Next steps:');
      console.log('1. Import prisma/database_setup.sql ke MySQL');
      console.log('2. Run: npm run dev');
      console.log('3. Login dengan: admin@resto.com / admin123');
    })
    .catch((error) => {
      console.log('❌ Database connection failed!');
      console.log('💡 Pastikan:');
      console.log('   - MySQL service berjalan');
      console.log('   - DATABASE_URL di .env sudah benar');
      console.log('   - Database resto_iga_bakar sudah dibuat');
      console.log('\nError:', error.message);
      process.exit(1);
    });
} catch (error) {
  console.log('❌ Error testing database connection');
  console.log('Error:', error.message);
  process.exit(1);
}

