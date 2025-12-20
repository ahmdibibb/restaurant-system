# Fix MySQL Authentication Error - Step by Step

## Error yang Terjadi
```
Error: Unknown authentication plugin 'sha256_password'
```

## Solusi Cepat

### Langkah 1: Login ke MySQL

Buka terminal/command prompt dan login ke MySQL:

```bash
mysql -u root -p
```

Masukkan password MySQL Anda.

### Langkah 2: Ubah Authentication Method

Setelah login, jalankan perintah SQL berikut:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_anda';
FLUSH PRIVILEGES;
```

**⚠️ PENTING:** Ganti `password_anda` dengan password MySQL Anda yang sebenarnya.

### Langkah 3: Verifikasi

Cek apakah perubahan berhasil:

```sql
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
```

Pastikan kolom `plugin` menunjukkan `mysql_native_password`.

### Langkah 4: Update .env (Jika Password Berubah)

Jika Anda mengubah password saat fix, update file `.env`:

```env
DATABASE_URL="mysql://root:password_baru@localhost:3306/resto_iga_bakar"
```

### Langkah 5: Test Koneksi

```bash
npm run db:test
```

## Solusi Alternatif: Menggunakan File SQL

### Opsi 1: Copy-Paste Manual

1. Buka file `scripts/fix-mysql-auth.sql`
2. Edit baris dengan password Anda
3. Login ke MySQL: `mysql -u root -p`
4. Copy-paste isi file ke MySQL console
5. Tekan Enter

### Opsi 2: Source File

```bash
mysql -u root -p < scripts/fix-mysql-auth.sql
```

## Jika Menggunakan User MySQL Lain

Jika Anda tidak menggunakan `root`, ganti dengan user Anda:

```sql
ALTER USER 'username_anda'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_anda';
FLUSH PRIVILEGES;
```

## Menggunakan MySQL Workbench

1. Buka MySQL Workbench
2. Connect ke server
3. Buka tab "SQL Editor"
4. Copy-paste perintah SQL:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_anda';
   FLUSH PRIVILEGES;
   ```
5. Edit password sesuai dengan password Anda
6. Klik "Execute" (⚡ icon)

## Menggunakan phpMyAdmin

1. Buka phpMyAdmin
2. Klik tab "SQL"
3. Copy-paste perintah SQL:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_anda';
   FLUSH PRIVILEGES;
   ```
4. Edit password sesuai dengan password Anda
5. Klik "Go"

## Troubleshooting

### Error: "Access denied"

**Solusi:**
- Pastikan Anda login sebagai user yang memiliki privileges
- Atau gunakan user root

### Error: "User does not exist"

**Solusi:**
- Cek user yang ada:
  ```sql
  SELECT user, host FROM mysql.user;
  ```
- Gunakan user yang benar dari list tersebut

### Masih Error Setelah Fix

**Solusi:**
1. Pastikan MySQL service di-restart:
   ```bash
   # Windows (sebagai Administrator)
   net stop MySQL80
   net start MySQL80
   ```

2. Cek ulang plugin:
   ```sql
   SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
   ```

3. Pastikan `.env` sudah update dengan password yang benar

## Verifikasi Fix Berhasil

Setelah fix, test dengan:

```bash
npm run db:test
```

Output yang diharapkan:
```
✅ Database connection: OK
✅ Users table: 5 users found
✅ Products table: 12 products found
✅ Database integration test: PASSED
```

## Quick Reference

**Perintah Lengkap (Copy-Paste):**

```sql
-- Fix authentication untuk root
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_anda';
FLUSH PRIVILEGES;

-- Verifikasi
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
```

**Setelah Fix:**
```bash
npm run db:test
```

