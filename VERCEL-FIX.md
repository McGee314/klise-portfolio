# 🔧 Perbaikan Error Vercel - MongoDB Connection

## 🚨 Masalah yang Terjadi
Error `ERR_MODULE_NOT_FOUND: Cannot find module '/var/task/server/db.js'` terjadi karena Vercel tidak dapat menemukan file server dependencies yang di-import secara terpisah.

## ✅ Solusi

### Opsi 1: Gunakan File Server Terpadu (Recommended)

1. **Replace file server.ts** dengan `server-vercel-fixed.ts`:
   ```bash
   mv server.ts server-original.ts
   mv server-vercel-fixed.ts server.ts
   ```

2. **Replace vercel.json** dengan versi yang sudah diperbaiki:
   ```bash
   mv vercel.json vercel-original.json  
   mv vercel-fixed.json vercel.json
   ```

### Opsi 2: Update File yang Ada

Atau Anda bisa menggunakan file yang sudah diperbaiki:
- `server-vercel-fixed.ts` - Server dengan semua dependencies built-in
- `vercel-fixed.json` - Konfigurasi Vercel yang sudah diperbaiki

## 🔍 Apa yang Diperbaiki

1. **Bundled Server**: Semua logic database, routes, dan dependencies digabung dalam satu file
2. **MongoDB Fallback**: Automatic fallback ke in-memory database jika MongoDB gagal connect
3. **Better Error Handling**: Error handling yang lebih robust
4. **Vercel Compatibility**: Struktur yang compatible dengan serverless environment

## 🚀 Deployment Steps

1. **Test lokal terlebih dahulu**:
   ```bash
   npm run dev
   ```

2. **Commit dan push perubahan**:
   ```bash
   git add .
   git commit -m "Fix Vercel deployment - bundle server dependencies"
   git push origin main
   ```

3. **Environment Variables di Vercel**:
   Pastikan environment variables berikut sudah diset di Vercel dashboard:
   ```
   MONGODB_URI=mongodb+srv://admin_klise:Klise4ontime@cluster0.rrsa6qb.mongodb.net/?appName=Cluster0
   DB_NAME=klise_porto
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=production
   ```

## 🔄 Rollback (Jika Diperlukan)

Jika ada masalah, Anda bisa rollback:
```bash
mv server.ts server-fixed.ts
mv server-original.ts server.ts
mv vercel.json vercel-fixed.json
mv vercel-original.json vercel.json
```

## 🧪 Testing

Setelah deployment, test endpoint berikut:
- `https://your-app.vercel.app/api/health` - Health check
- `https://your-app.vercel.app/api/content` - Content API
- `https://your-app.vercel.app/api/activities` - Activities API

## 📝 Notes

- File baru menggunakan MongoDB dengan fallback ke in-memory database
- Semua routes sudah included dalam satu file untuk menghindari import issues
- Compatible dengan environment variables yang sudah ada