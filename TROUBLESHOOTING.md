# Troubleshooting Guide

## Error 500: Failed to fetch stats

### Penyebab Umum

1. **Database Connection Error**
   - MySQL service tidak berjalan
   - DATABASE_URL di `.env` salah
   - Database tidak ada

2. **Database Query Error**
   - Tabel tidak ada
   - Schema tidak sesuai
   - Data corrupt

3. **Authentication Error**
   - Token expired
   - User bukan ADMIN

### Solusi

#### 1. Cek Database Connection

```bash
npm run db:test
```

Jika error, cek:
- MySQL service berjalan
- DATABASE_URL di `.env` benar
- Database `resto_iga_bakar` sudah dibuat

#### 2. Cek Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Cek schema dengan Prisma Studio
npm run db:studio
```

#### 3. Import Database Setup

Jika tabel belum ada, import SQL:

```bash
mysql -u root -p < prisma/database_setup.sql
```

#### 4. Cek Server Logs

Lihat terminal dimana `npm run dev` berjalan untuk melihat error detail.

#### 5. Cek Browser Console

Buka Developer Tools (F12) → Console untuk melihat error detail dari frontend.

### Error Messages

| Error | Penyebab | Solusi |
|-------|----------|--------|
| "Failed to fetch stats: 500" | Server error | Cek server logs, pastikan database terhubung |
| "Unauthorized" | Token expired | Login ulang |
| "Forbidden" | Bukan ADMIN | Login sebagai admin |
| "Database connection failed" | MySQL tidak berjalan | Start MySQL service |

### Debug Steps

1. **Test Database:**
   ```bash
   npm run db:test
   ```

2. **Check API Directly:**
   ```bash
   # Di browser console atau Postman
   fetch('/api/dashboard/stats?period=month', { 
     credentials: 'include' 
   }).then(r => r.json()).then(console.log)
   ```

3. **Check Server Logs:**
   - Lihat terminal `npm run dev`
   - Cari error message di console

4. **Verify Database:**
   ```bash
   npm run db:studio
   ```
   Buka http://localhost:5555 untuk melihat data

### Common Fixes

#### Fix 1: Database Not Connected
```bash
# Test connection
npm run db:test

# If fails, check .env
cat .env

# Import database if not exists
mysql -u root -p < prisma/database_setup.sql
```

#### Fix 2: Tables Missing
```bash
# Run migrations
npm run db:migrate

# Or push schema
npm run db:push
```

#### Fix 3: Authentication Issue
- Clear browser cookies
- Login ulang sebagai admin
- Pastikan role = ADMIN

#### Fix 4: Prisma Client Not Generated
```bash
npm install
npm run db:generate
```

## Still Having Issues?

1. Check server logs (terminal where `npm run dev` runs)
2. Check browser console (F12)
3. Verify database connection: `npm run db:test`
4. Check `.env` file configuration
5. Restart development server

