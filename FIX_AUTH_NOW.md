# 🔧 Fix Authentication Error - INSTAN

## Error
```
Error: Unknown authentication plugin 'sha256_password'
```

## ⚡ Solusi Cepat (5 Menit)

### Step 1: Login MySQL
```bash
mysql -u root -p
```
Masukkan password MySQL Anda.

### Step 2: Jalankan Perintah Ini
Copy-paste perintah berikut di MySQL console (ganti `password_anda` dengan password MySQL Anda):

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password_anda';
FLUSH PRIVILEGES;
```

### Step 3: Verifikasi
```sql
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
```
Pastikan kolom `plugin` = `mysql_native_password`

### Step 4: Test
```bash
npm run db:test
```

## ✅ Selesai!

Jika masih error, cek:
1. Password di `.env` sudah benar?
2. MySQL service sudah restart?
3. User yang digunakan sudah di-fix?

## 📝 Contoh Lengkap

Jika password MySQL Anda adalah `mypassword123`:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'mypassword123';
FLUSH PRIVILEGES;
```

Kemudian test:
```bash
npm run db:test
```

## 🆘 Masih Error?

Lihat file `MYSQL_AUTH_FIX.md` untuk penjelasan lengkap dan solusi alternatif.

