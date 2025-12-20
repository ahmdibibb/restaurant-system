# Quick Start - Integrasi Database

## Langkah Cepat Setup Database

### 1. Import Database Setup SQL

```bash
# Windows PowerShell
mysql -u root -p < prisma/database_setup.sql

# Atau melalui MySQL Workbench:
# File → Run SQL Script → pilih prisma/database_setup.sql
```

### 2. Buat File .env

Buat file `.env` di root project:

```env
DATABASE_URL="mysql://root:password@localhost:3306/resto_iga_bakar"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
```

**Ganti:**
- `root` → username MySQL Anda
- `password` → password MySQL Anda

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Test Database Connection

```bash
npm run db:test
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

## Setup Otomatis (All-in-One)

```bash
npm run db:setup
```

Script ini akan:
- ✅ Membuat .env jika belum ada
- ✅ Generate Prisma Client
- ✅ Test database connection

## Login Credentials (Setelah Import SQL)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@resto.com | admin123 |
| Kitchen | kitchen@resto.com | kitchen123 |
| User | user1@example.com | user123 |

## Troubleshooting Cepat

### Error: "Cannot reach database"
- ✅ Pastikan MySQL service berjalan
- ✅ Cek DATABASE_URL di .env

### Error: "Authentication failed"
- ✅ Lihat `MYSQL_AUTH_FIX.md`
- ✅ Ubah authentication method ke `mysql_native_password`

### Error: "Database does not exist"
- ✅ Import `prisma/database_setup.sql`

### Error: "Table doesn't exist"
- ✅ Pastikan sudah import SQL
- ✅ Atau run: `npm run db:migrate`

## Verifikasi

Setelah setup, test dengan:

```bash
# Test database
npm run db:test

# Buka Prisma Studio untuk melihat data
npm run db:studio

# Jalankan aplikasi
npm run dev
```

Kemudian buka browser:
- http://localhost:3000
- Login dengan: admin@resto.com / admin123

## Struktur Database

Setelah import SQL, database akan memiliki:

- ✅ **6 Tabel**: User, Product, Order, OrderItem, Payment, StockHistory
- ✅ **5 Users**: 1 Admin, 1 Kitchen, 3 Users
- ✅ **12 Products**: Menu iga bakar lengkap
- ✅ **Sample Data**: Orders dan Payments untuk testing

## Next Steps

1. ✅ Database sudah terintegrasi
2. ✅ Test semua fitur aplikasi
3. ✅ Customize produk sesuai kebutuhan
4. ✅ Tambah user baru melalui register (USER only)

