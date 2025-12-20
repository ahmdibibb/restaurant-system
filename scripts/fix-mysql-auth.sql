-- ============================================
-- Script untuk Fix MySQL Authentication Error
-- Unknown authentication plugin 'sha256_password'
-- ============================================
-- 
-- Cara menggunakan:
-- 1. Login ke MySQL sebagai root:
--    mysql -u root -p
-- 
-- 2. Jalankan script ini:
--    source scripts/fix-mysql-auth.sql;
-- 
-- Atau copy-paste perintah SQL berikut di MySQL client
-- ============================================

-- Ubah authentication method untuk user root (localhost)
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
FLUSH PRIVILEGES;

-- Jika menggunakan user lain, ganti dengan user Anda:
-- ALTER USER 'your_username'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
-- FLUSH PRIVILEGES;

-- Untuk mengizinkan koneksi dari host manapun (tidak disarankan untuk production):
-- ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'your_password_here';
-- FLUSH PRIVILEGES;

-- Verifikasi perubahan
SELECT user, host, plugin FROM mysql.user WHERE user = 'root';

-- ============================================
-- CATATAN PENTING:
-- 1. Ganti 'your_password_here' dengan password MySQL Anda
-- 2. Setelah fix, update DATABASE_URL di .env jika password berubah
-- 3. Restart aplikasi setelah fix
-- ============================================

