# Solusi Error: Unknown authentication plugin 'sha256_password'

## Penjelasan Error

Error ini terjadi karena:
1. **MySQL 8.0+** menggunakan metode autentikasi baru: `caching_sha2_password` atau `sha256_password`
2. **MySQL2 client** (yang digunakan Prisma) terkadang belum sepenuhnya mendukung plugin autentikasi tersebut
3. Ada ketidakcocokan antara metode autentikasi user MySQL dan yang didukung oleh client

## Solusi 1: Ubah Metode Autentikasi User MySQL (Recommended)

### Langkah-langkah:

1. **Akses MySQL Server:**
   ```bash
   mysql -u root -p
   ```
   Atau gunakan MySQL Workbench, phpMyAdmin, atau tool database lainnya.

2. **Cek User Database Anda:**
   Lihat file `.env` untuk melihat username yang digunakan:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/resto_iga_bakar"
   ```
   Catat `username` yang digunakan.

3. **Ubah Metode Autentikasi:**
   Jalankan perintah SQL berikut di MySQL (ganti `your_username` dan `your_password`):
   
   ```sql
   -- Untuk user yang sudah ada
   ALTER USER 'your_username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
   FLUSH PRIVILEGES;
   ```

   **Contoh:**
   Jika username di `.env` adalah `root`:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
   FLUSH PRIVILEGES;
   ```

4. **Verifikasi Perubahan:**
   ```sql
   SELECT user, host, plugin FROM mysql.user WHERE user = 'your_username';
   ```
   Pastikan kolom `plugin` menunjukkan `mysql_native_password`.

5. **Restart Development Server:**
   ```bash
   npm run dev
   ```

## Solusi 2: Buat User Baru dengan mysql_native_password

Jika Anda ingin membuat user baru khusus untuk aplikasi:

```sql
-- Buat user baru
CREATE USER 'resto_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'secure_password_here';

-- Berikan privileges
GRANT ALL PRIVILEGES ON resto_iga_bakar.* TO 'resto_user'@'localhost';

-- Refresh privileges
FLUSH PRIVILEGES;
```

Kemudian update `.env`:
```env
DATABASE_URL="mysql://resto_user:secure_password_here@localhost:3306/resto_iga_bakar"
```

## Solusi 3: Update MySQL2 atau Gunakan Connection String Khusus

Jika Solusi 1 dan 2 tidak bekerja, coba tambahkan parameter di `DATABASE_URL`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/resto_iga_bakar?authPlugins=mysql_native_password"
```

Atau jika menggunakan MySQL 8.0+ dengan caching_sha2_password:

```env
DATABASE_URL="mysql://username:password@localhost:3306/resto_iga_bakar?authPlugins=caching_sha2_password"
```

## Solusi 4: Update Prisma dan MySQL2

Pastikan menggunakan versi terbaru:

```bash
npm install @prisma/client@latest prisma@latest mysql2@latest
npm run db:generate
```

## Troubleshooting

### Jika masih error setelah Solusi 1:

1. **Cek apakah user sudah berubah:**
   ```sql
   SELECT user, host, plugin FROM mysql.user;
   ```

2. **Coba dengan user root (jika development):**
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_root_password';
   FLUSH PRIVILEGES;
   ```

3. **Jika menggunakan XAMPP/WAMP:**
   - Buka phpMyAdmin
   - Pilih tab "SQL"
   - Jalankan query ALTER USER

### Error: "Access denied for user"

Jika mendapat error access denied setelah mengubah autentikasi:

```sql
-- Berikan privileges lagi
GRANT ALL PRIVILEGES ON resto_iga_bakar.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Database doesn't exist"

Buat database terlebih dahulu:

```sql
CREATE DATABASE resto_iga_bakar;
```

## Verifikasi Setup

Setelah perbaikan, test koneksi:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npx prisma db push

# Atau run migrations
npx prisma migrate dev
```

Jika berhasil, Anda akan melihat:
- ✅ Schema berhasil di-push
- ✅ Tables terbuat di database
- ✅ Tidak ada error authentication

## Catatan Penting

1. **Security Warning:**
   - `mysql_native_password` adalah metode autentikasi lama dan kurang aman
   - Untuk production, pertimbangkan untuk menggunakan `caching_sha2_password` dengan MySQL2 versi terbaru

2. **MySQL Version:**
   - Jika menggunakan MySQL 8.0+, pastikan MySQL2 client sudah update
   - Versi MySQL2 >= 2.3.0 mendukung `caching_sha2_password` dengan lebih baik

3. **Alternative:**
   - Pertimbangkan menggunakan MariaDB (kompatibel dengan MySQL dan lebih sedikit masalah autentikasi)
   - Atau gunakan PostgreSQL dengan Prisma

## Quick Reference Commands

```sql
-- Cek plugin autentikasi user
SELECT user, host, plugin FROM mysql.user WHERE user = 'your_username';

-- Ubah ke mysql_native_password
ALTER USER 'your_username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;

-- Cek privileges
SHOW GRANTS FOR 'your_username'@'localhost';
```

