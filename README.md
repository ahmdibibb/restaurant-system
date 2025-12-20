# Resto Iga Bakar - Sistem Informasi Manajemen Restoran

Sistem informasi manajemen restoran berbasis web dengan Next.js, TypeScript, dan MySQL.

## Fitur

### User
- Melihat dan memilih produk
- Keranjang belanja
- Checkout
- Pembayaran (Tunai, QRIS, EDC - dummy)
- Menerima struk setelah pembayaran

### Admin
- Dashboard monitoring:
  - Stok produk
  - Produk terjual
  - Total penjualan harian dan bulanan
- CRUD produk (Create, Read, Update, Delete)

### Kitchen
- Menerima orderan dari queue
- Update status orderan (Confirmed → Preparing → Ready)
- Orderan diurutkan berdasarkan nomor order

## Tech Stack

- **Frontend & Backend**: Next.js 16 dengan TypeScript
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: JWT (JSON Web Token)
- **Styling**: Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

**⚠️ PENTING - Fix Authentication Error Terlebih Dahulu:**
Jika Anda menggunakan MySQL 8.0+ dan mendapat error `Unknown authentication plugin 'sha256_password'`, fix terlebih dahulu:

```sql
-- Login ke MySQL: mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_anda';
FLUSH PRIVILEGES;
```

Lihat `FIX_AUTH_NOW.md` untuk quick fix atau `MYSQL_AUTH_FIX.md` untuk penjelasan lengkap.

**Setup Database:**
1. Import database setup SQL:
   ```bash
   mysql -u root -p < prisma/database_setup.sql
   ```

2. Buat file `.env` di root project:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/resto_iga_bakar"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```
   Ganti `root` dan `password` dengan kredensial MySQL Anda.

3. Test koneksi:
   ```bash
   npm run db:test
   ```

### 3. Setup Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio untuk melihat data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Penggunaan

### Membuat Akun

1. **Register (USER saja)**: Buka halaman register untuk membuat akun USER
2. **Admin & Kitchen**: Dibuat melalui SQL seed atau akan dikelola oleh admin (fitur CRUD user akan ditambahkan)

## Setup Database dengan Sample Data

Setelah migration, import sample data:

```bash
# Import SQL seed file
mysql -u username -p resto_iga_bakar < prisma/seed.sql

# Atau gunakan MySQL Workbench/phpMyAdmin untuk import file prisma/seed.sql
```

Lihat file `prisma/seed.md` untuk detail lengkap.

**Default Login Credentials (dari seed):**
- Admin: admin@resto.com / admin123
- Kitchen: kitchen@resto.com / kitchen123
- User: user1@example.com / user123

### User Flow

1. Login sebagai User
2. Browse produk di halaman Products
3. Tambahkan produk ke cart
4. Checkout dan buat order
5. Pilih metode pembayaran (Cash/QRIS/EDC)
6. Dapatkan struk setelah pembayaran

### Admin Flow

1. Login sebagai Admin
2. Lihat dashboard dengan statistik
3. Manage produk (tambah, edit, hapus)
4. Monitor stok dan penjualan

### Kitchen Flow

1. Login sebagai Kitchen
2. Lihat order queue
3. Update status orderan:
   - Start Preparing (dari Confirmed)
   - Mark Ready (dari Preparing)

## Database Schema

- **User**: Admin, User, Kitchen
- **Product**: Produk dengan stok
- **Order**: Order dengan status (PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED)
- **OrderItem**: Item dalam order
- **Payment**: Pembayaran dengan metode (CASH, QRIS, EDC)
- **StockHistory**: History perubahan stok

## API Routes

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin only)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (Admin only)
- `DELETE /api/products/[id]` - Delete product (Admin only)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order (User only)
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status (Kitchen/Admin)

### Payments
- `POST /api/payments` - Create payment (User only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin only)

### Kitchen
- `GET /api/kitchen/orders` - Get kitchen orders (Kitchen/Admin)

## Catatan Penting

1. **Payment System**: Sistem pembayaran saat ini adalah dummy. Untuk production, perlu integrasi dengan payment gateway yang sebenarnya.

2. **Security**: Pastikan untuk mengubah `JWT_SECRET` di production dengan nilai yang aman.

3. **Database**: Pastikan backup database dilakukan secara berkala.

## License

MIT
