-- ============================================
-- Database Seed untuk Resto Iga Bakar
-- ============================================
-- File ini berisi sample data untuk keseluruhan sistem
-- Jalankan setelah migration database selesai
-- 
-- Cara menggunakan:
-- 1. Pastikan database sudah dibuat dan di-migrate
-- 2. Import file ini ke MySQL atau jalankan melalui command:
--    mysql -u username -p resto_iga_bakar < prisma/seed.sql
-- ============================================

-- Hapus data lama jika ada (optional)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE StockHistory;
-- TRUNCATE TABLE Payment;
-- TRUNCATE TABLE OrderItem;
-- TRUNCATE TABLE Order;
-- TRUNCATE TABLE Product;
-- TRUNCATE TABLE User;
-- SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USERS
-- ============================================
-- Password hash menggunakan bcrypt
-- Admin: admin123
-- Kitchen: kitchen123  
-- User: user123

INSERT INTO `User` (`id`, `email`, `name`, `password`, `role`, `createdAt`, `updatedAt`) VALUES
('clx00000000000000000000001', 'admin@resto.com', 'Admin Resto', '$2b$10$yh3uQD5JHKoAKmlD3Yq3jOqkk2PY0dKE0Gl6/pFoTbVRJHd/Y4kSy', 'ADMIN', NOW(), NOW()),
('clx00000000000000000000002', 'kitchen@resto.com', 'Kitchen Staff', '$2b$10$3ImbIQ8AdVRGNVucjn/6/.SgwptEEdGnfquVr713wuy9BpuD7S/Ke', 'KITCHEN', NOW(), NOW()),
('clx00000000000000000000003', 'user1@example.com', 'John Doe', '$2b$10$SIsCBMibmqNgpXrNo3lDVuTz6caJZGNEELLCqLin0eaOidFUgSdzK', 'USER', NOW(), NOW()),
('clx00000000000000000000004', 'user2@example.com', 'Jane Smith', '$2b$10$SIsCBMibmqNgpXrNo3lDVuTz6caJZGNEELLCqLin0eaOidFUgSdzK', 'USER', NOW(), NOW()),
('clx00000000000000000000005', 'user3@example.com', 'Bob Johnson', '$2b$10$SIsCBMibmqNgpXrNo3lDVuTz6caJZGNEELLCqLin0eaOidFUgSdzK', 'USER', NOW(), NOW());

-- ============================================
-- 2. PRODUCTS - Menu Iga Bakar
-- ============================================

INSERT INTO `Product` (`id`, `name`, `description`, `price`, `image`, `category`, `stock`, `isActive`, `createdAt`, `updatedAt`) VALUES
('clx00000000000000000000011', 'Iga Bakar Madu', 'Iga bakar dengan bumbu madu yang manis dan gurih, disajikan dengan nasi putih dan sambal', 85000.00, NULL, 'Makanan Utama', 50, 1, NOW(), NOW()),
('clx00000000000000000000012', 'Iga Bakar Spesial', 'Iga bakar dengan bumbu rahasia, sangat empuk dan juicy', 95000.00, NULL, 'Makanan Utama', 45, 1, NOW(), NOW()),
('clx00000000000000000013', 'Iga Bakar Pedas', 'Iga bakar dengan level pedas yang bisa disesuaikan, untuk pecinta pedas', 90000.00, NULL, 'Makanan Utama', 40, 1, NOW(), NOW()),
('clx00000000000000000000014', 'Iga Bakar BBQ', 'Iga bakar dengan saus BBQ ala Amerika, smoky dan lezat', 100000.00, NULL, 'Makanan Utama', 35, 1, NOW(), NOW()),
('clx00000000000000000000015', 'Iga Bakar Kecap', 'Iga bakar dengan bumbu kecap manis, khas Indonesia', 80000.00, NULL, 'Makanan Utama', 55, 1, NOW(), NOW()),
('clx00000000000000000000016', 'Nasi Putih', 'Nasi putih hangat', 5000.00, NULL, 'Pelengkap', 100, 1, NOW(), NOW()),
('clx00000000000000000000017', 'Kerupuk', 'Kerupuk udang renyah', 3000.00, NULL, 'Pelengkap', 200, 1, NOW(), NOW()),
('clx00000000000000000000018', 'Sambal Terasi', 'Sambal terasi pedas', 5000.00, NULL, 'Pelengkap', 150, 1, NOW(), NOW()),
('clx00000000000000000000019', 'Es Teh Manis', 'Es teh manis segar', 8000.00, NULL, 'Minuman', 100, 1, NOW(), NOW()),
('clx00000000000000000000020', 'Es Jeruk', 'Es jeruk peras', 10000.00, NULL, 'Minuman', 80, 1, NOW(), NOW()),
('clx00000000000000000000021', 'Jus Alpukat', 'Jus alpukat segar dengan susu', 15000.00, NULL, 'Minuman', 60, 1, NOW(), NOW()),
('clx00000000000000000000022', 'Es Campur', 'Es campur dengan berbagai topping', 12000.00, NULL, 'Minuman', 70, 1, NOW(), NOW());

-- ============================================
-- 3. STOCK HISTORY - Initial Stock
-- ============================================

INSERT INTO `StockHistory` (`id`, `productId`, `quantity`, `type`, `description`, `createdAt`) VALUES
('clx00000000000000000000031', 'clx00000000000000000000011', 50, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000032', 'clx00000000000000000000012', 45, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000033', 'clx00000000000000000000013', 40, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000034', 'clx00000000000000000000014', 35, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000035', 'clx00000000000000000000015', 55, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000036', 'clx00000000000000000000016', 100, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000037', 'clx00000000000000000000017', 200, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000038', 'clx00000000000000000000018', 150, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000039', 'clx00000000000000000000019', 100, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000040', 'clx00000000000000000000020', 80, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000041', 'clx00000000000000000000021', 60, 'IN', 'Stock awal', NOW()),
('clx00000000000000000000042', 'clx00000000000000000000022', 70, 'IN', 'Stock awal', NOW());

-- ============================================
-- 4. SAMPLE ORDERS (Optional - untuk testing)
-- ============================================

INSERT INTO `Order` (`id`, `orderNumber`, `userId`, `status`, `totalAmount`, `orderType`, `tableNumber`, `notes`, `createdAt`, `updatedAt`) VALUES
('clx00000000000000000000051', 'ORD-1700000000000-ABC123', 'clx00000000000000000000003', 'CONFIRMED', 95000.00, 'DINE_IN', '12', 'Tidak pakai sambal', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('clx00000000000000000000052', 'ORD-1700000000001-DEF456', 'clx00000000000000000000004', 'PREPARING', 180000.00, 'DINE_IN', '5', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
('clx00000000000000000000053', 'ORD-1700000000002-GHI789', 'clx00000000000000000000005', 'READY', 85000.00, 'TAKEAWAY', NULL, 'Bungkus terpisah', DATE_SUB(NOW(), INTERVAL 3 HOUR), NOW());

-- ============================================
-- 5. ORDER ITEMS
-- ============================================

INSERT INTO `OrderItem` (`id`, `orderId`, `productId`, `quantity`, `price`, `subtotal`, `createdAt`) VALUES
('clx00000000000000000000061', 'clx00000000000000000000051', 'clx00000000000000000000012', 1, 95000.00, 95000.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('clx00000000000000000000062', 'clx00000000000000000000052', 'clx00000000000000000000011', 2, 85000.00, 170000.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('clx00000000000000000000063', 'clx00000000000000000000052', 'clx00000000000000000000016', 2, 5000.00, 10000.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('clx00000000000000000000064', 'clx00000000000000000000053', 'clx00000000000000000000011', 1, 85000.00, 85000.00, DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- ============================================
-- 6. PAYMENTS
-- ============================================

INSERT INTO `Payment` (`id`, `orderId`, `method`, `amount`, `status`, `transactionId`, `paidAt`, `createdAt`, `updatedAt`) VALUES
('clx00000000000000000000071', 'clx00000000000000000000051', 'QRIS', 95000.00, 'PAID', 'TXN-1700000000000-QRIS001', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('clx00000000000000000000072', 'clx00000000000000000000052', 'CASH', 180000.00, 'PAID', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('clx00000000000000000000073', 'clx00000000000000000000053', 'EDC', 85000.00, 'PAID', 'TXN-1700000000002-EDC001', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- ============================================
-- CATATAN PENTING
-- ============================================
-- 1. Password default:
--    - Admin: admin123
--    - Kitchen: kitchen123
--    - User: user123
--
-- 2. Untuk security, segera ubah password setelah login pertama kali
--
-- 3. ID menggunakan format CUID (Collision-resistant Unique Identifier)
--    yang mirip dengan format yang digunakan Prisma
--
-- 4. Untuk menambahkan produk baru, gunakan dashboard admin
--
-- 5. Untuk membuat user admin/kitchen baru, gunakan dashboard admin
--    (akan dibuat fitur CRUD user oleh admin)
-- ============================================

