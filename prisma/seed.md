# Database Seed - Resto Iga Bakar

## Cara Menggunakan Seed Data

### Metode 1: Import SQL File (Recommended)

1. Pastikan database sudah dibuat dan schema sudah di-migrate:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

2. Import file SQL:
   ```bash
   # Windows (PowerShell/CMD)
   mysql -u username -p resto_iga_bakar < prisma/seed.sql
   
   # Atau melalui MySQL Workbench:
   # - Buka MySQL Workbench
   # - Connect ke database
   # - File > Run SQL Script
   # - Pilih file prisma/seed.sql
   ```

### Metode 2: Copy-Paste ke MySQL Client

1. Buka MySQL client (command line, Workbench, atau phpMyAdmin)
2. Pilih database `resto_iga_bakar`
3. Copy semua isi file `prisma/seed.sql`
4. Paste dan jalankan

## Data yang Akan Di-import

### 1. Users (5 users)
- **1 Admin**: admin@resto.com / admin123
- **1 Kitchen**: kitchen@resto.com / kitchen123
- **3 Users**: user1@example.com, user2@example.com, user3@example.com / user123

### 2. Products (12 produk)
- **5 Menu Iga Bakar**: Iga Bakar Madu, Spesial, Pedas, BBQ, Kecap
- **3 Pelengkap**: Nasi Putih, Kerupuk, Sambal Terasi
- **4 Minuman**: Es Teh Manis, Es Jeruk, Jus Alpukat, Es Campur

### 3. Stock History
- Record awal untuk semua produk

### 4. Sample Orders (3 orders - optional)
- Order dengan berbagai status untuk testing

### 5. Payments (3 payments - optional)
- Sample payment dengan berbagai metode (CASH, QRIS, EDC)

## Login Credentials

Setelah import, Anda bisa login dengan:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@resto.com | admin123 |
| Kitchen | kitchen@resto.com | kitchen123 |
| User | user1@example.com | user123 |
| User | user2@example.com | user123 |
| User | user3@example.com | user123 |

**⚠️ PENTING**: Ganti password setelah login pertama kali untuk keamanan!

## Menghapus Seed Data

Jika ingin menghapus semua data sample:

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE StockHistory;
TRUNCATE TABLE Payment;
TRUNCATE TABLE OrderItem;
TRUNCATE TABLE Order;
TRUNCATE TABLE Product;
TRUNCATE TABLE User;
SET FOREIGN_KEY_CHECKS = 1;
```

## Troubleshooting

### Error: Duplicate entry
- Data sudah ada di database
- Hapus data lama terlebih dahulu atau skip bagian yang error

### Error: Foreign key constraint
- Pastikan tabel sudah dibuat dengan benar
- Pastikan urutan insert sesuai (User → Product → Order → dll)

### Error: Invalid decimal value
- Pastikan format angka menggunakan titik (.) bukan koma (,)
- Contoh: 85000.00 bukan 85000,00

