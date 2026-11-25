# sawarna-smart-guide

Peta interaktif kawasan wisata **Pantai Ciantir, Desa Sawarna** (Lebak, Banten).

## Menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal:

```
python -m http.server 5173
```

lalu buka http://localhost:5173

## Struktur

| File | Isi |
|---|---|
| `index.html` | Halaman peta |
| `css/style.css` | Tampilan (mobile-first) |
| `js/data.js` | **Semua data peta**: batas kawasan, zona, jalur, kategori, titik layanan |
| `js/popup.js` | Isi pop-up per kategori layanan |
| `js/app.js` | Logika peta (Leaflet): filter, lokasi saya, mode ambil koordinat |

## Fitur kerangka

- Batas kawasan (kuning), zona UMKM pantai (merah), zona homestay (hijau), jalur utama (biru)
- Marker berwarna per kategori + filter kategori
- Pop-up per kategori: homestay, kuliner, sewa & jasa, tiket & parkir, toilet & ibadah, keselamatan, spot wisata, akses
- Pop-up zona: ringkasan layanan di dalam zona + tombol tampilkan layanan zona
- Tombol **Lokasi saya** (GPS), **kembali ke awal**, dan **📍 ambil koordinat** (untuk survei)
- Basemap satelit (Esri) / peta jalan (OSM)

## Menambah data

Edit `js/data.js`. Gunakan tombol 📍 di peta untuk menyalin koordinat `[lat, lng]`.
Titik bertanda `contoh: true` masih **data contoh** dan perlu diganti dengan hasil survei.
Isi `kontak.wa` / `kontak.telp` hanya dengan izin pemilik usaha.

## Brand kit

Panduan identitas visual ada di [`brand/index.html`](brand/index.html) (buka `/brand/` di situs).

| Path | Isi |
|---|---|
| `brand/tokens.css` | Warna, font, ukuran, sudut, bayangan (CSS variables `--sw-*`) |
| `brand/logo/` | Logo warna penuh, putih, biru, gelap + simbol (PNG transparan); `sawarna-logo-sumber.jpg` = file asli |
| `brand/ikon/` | Favicon, ikon aplikasi 192/512, maskable, apple-touch-icon |

Warna inti: **Biru Ombak `#4677B4`** dan **Oranye Senja `#DF9232`**. Font: **Plus Jakarta Sans** (+ Yellowtail untuk aksen).
