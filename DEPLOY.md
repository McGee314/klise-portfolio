# Vercel Deployment Guide

## Setup untuk Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Pilih framework: **Other**
   - Build command: `npm run vercel-build`
   - Output directory: `dist`

4. **Custom Domain**:
   - Di dashboard Vercel, masuk ke project settings
   - Pilih "Domains" > Add domain
   - Ikuti instruksi DNS (CNAME/ALIAS record)

## ⚠️ PENTING: Masalah Database & Upload Files

**Vercel serverless memiliki keterbatasan:**

1. **SQLite tidak persisten** - database akan hilang setiap deploy
2. **File uploads hilang** - folder `/uploads` tidak persisten
3. **Cold start** - server restart sering

### Solusi yang Disarankan:

**Opsi 1: Cloud Database**
```bash
# Ganti SQLite dengan Supabase/MongoDB/PlanetScale
npm install @supabase/supabase-js
# atau
npm install mongodb
```

**Opsi 2: Cloud Storage**
```bash
# Ganti local upload dengan Cloudinary/S3
npm install cloudinary
# atau
npm install @aws-sdk/client-s3
```

**Opsi 3: VPS Hosting**
- Deploy ke DigitalOcean/Railway/Render
- SQLite + file uploads akan berfungsi normal

## Environment Variables

Tambahkan di Vercel dashboard:
- `JWT_SECRET=your-secret-key`
- `NODE_ENV=production`
- Database connection strings (jika pakai cloud DB)

## Domain Custom

1. Beli domain (Namecheap, GoDaddy, dll)
2. Di Vercel dashboard: Settings > Domains
3. Add domain Anda
4. Ikuti instruksi DNS yang diberikan Vercel
5. Tunggu propagasi (5-48 jam)

Setelah setup, website akan accessible di domain Anda!