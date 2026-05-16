# 🏖️ Gazebo Monitor — Panduan Deploy

Aplikasi monitoring penyewaan gazebo realtime. Operator bisa update status, publik bisa lihat via link khusus.

---

## 🔥 LANGKAH 1 — Setup Firebase (Gratis)

1. Buka **https://console.firebase.google.com**
2. Klik **"Add project"** → isi nama project (misal: `gazebo-monitor`) → klik Continue
3. Matikan Google Analytics (opsional) → klik **"Create project"**
4. Setelah masuk dashboard, klik ikon **`</>`** (Web) untuk tambah app
5. Isi nickname app (misal: `gazebo-web`) → klik **"Register app"**
6. **COPY** seluruh blok `firebaseConfig` yang muncul
7. Buka file **`src/firebase.js`** dan paste config tadi (ganti yang ada tulisan `GANTI_DENGAN_...`)

### Buat Realtime Database:
1. Di sidebar Firebase, klik **"Build" → "Realtime Database"**
2. Klik **"Create Database"**
3. Pilih region terdekat (misal Singapore)
4. Pilih **"Start in test mode"** → klik Enable
5. Pastikan URL database muncul di `firebaseConfig.databaseURL` di `src/firebase.js`

---

## ▲ LANGKAH 2 — Deploy ke Vercel (Gratis)

### Cara A — Via GitHub (Recommended):
1. Upload folder `gazebo-monitor` ke **GitHub** (buat repo baru)
2. Buka **https://vercel.com** → Sign up pakai akun GitHub
3. Klik **"New Project"** → Import repo yang tadi dibuat
4. Vercel auto-detect React → langsung klik **"Deploy"**
5. Tunggu ~1 menit → dapat link seperti `https://gazebo-monitor.vercel.app` ✅

### Cara B — Via Vercel CLI:
```bash
npm install -g vercel
cd gazebo-monitor
npm install
vercel
```

---

## 🔗 LANGKAH 3 — Cara Share

Setelah deploy berhasil, lo dapat 2 URL:

| URL | Fungsi |
|-----|--------|
| `https://gazebo-monitor.vercel.app` | Halaman utama (pilih Operator atau Viewer) |
| `https://gazebo-monitor.vercel.app?view=1` | **Link Publik** — langsung ke mode lihat saja |

- **Bagikan `?view=1`** ke pelanggan/publik → mereka hanya bisa lihat, tidak bisa edit
- **Operator** buka URL utama → klik "Masuk sebagai Operator" → masukkan PIN

> 💡 Di dalam aplikasi, operator bisa klik tombol **"🔗 Salin Link Publik"** untuk langsung copy link viewer.

---

## ⚙️ Konfigurasi

### Ganti PIN Operator:
Buka `src/App.js` → baris ke-7:
```js
const OPERATOR_PIN = "1234"; // Ganti angka ini
```

### Ganti Jumlah Gazebo:
Buka `src/App.js` → baris ke-6:
```js
const TOTAL_GAZEBO = 21; // Ganti sesuai kebutuhan
```

---

## 📂 Struktur File

```
gazebo-monitor/
├── public/
│   └── index.html
├── src/
│   ├── App.js          ← Aplikasi utama
│   ├── firebase.js     ← Config Firebase (ISI INI DULU!)
│   └── index.js        ← Entry point
├── package.json
└── README.md
```

---

## ❓ FAQ

**Q: Apakah Firebase Realtime Database gratis?**
A: Ya! Gratis sampai 1GB storage dan 10GB/bulan transfer. Lebih dari cukup.

**Q: Apakah Vercel gratis?**
A: Ya! Plan gratis Vercel sudah cukup untuk aplikasi ini.

**Q: Data hilang kalau server mati?**
A: Tidak. Data tersimpan di Firebase cloud, bukan di server Vercel.
