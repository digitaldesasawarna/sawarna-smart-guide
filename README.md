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
| `js/app.js` | Logika peta (Leaflet): ilustrasi/satelit, filter, lokasi saya, mode ambil koordinat |
| `data/geografi.json` | Bentuk pantai, sungai, sawah, hutan (untuk ilustrasi) |
| `tools/gen-ilustrasi.mjs` | Generator ilustrasi peta → `assets/peta-ilustrasi.svg` |
| `tools/render-tiles.mjs` | SVG → tile WebP `assets/tiles/{z}/{x}/{y}.webp` |
| `js/vendor/leaflet-rotate.js` | Plugin rotasi peta (Raruto, GPL-3.0) |

## Fitur kerangka

- Batas kawasan (kuning), zona UMKM pantai (merah), zona homestay (hijau), jalur utama (biru)
- Marker berwarna per kategori + filter kategori
- Pop-up per kategori: homestay, kuliner, sewa & jasa, tiket & parkir, toilet & ibadah, keselamatan, spot wisata, akses
- Pop-up zona: ringkasan layanan di dalam zona + tombol tampilkan layanan zona
- Tombol **Lokasi saya** (GPS), **kembali ke awal**, dan **📍 ambil koordinat** (untuk survei)
- Basemap satelit (Esri) / peta jalan (OSM)

## Peta ilustrasi

Peta dasar bawaan adalah ilustrasi bergaya peta taman wisata, ditempel presisi di atas koordinat asli sehingga marker & GPS tetap tepat. Satelit dan peta jalan tetap tersedia di tombol lapisan. Peta bisa diputar ke segala arah (tombol kompas: slider 0–359°, ±15°, 8 arah mata angin; dua jari di HP; Shift + seret di laptop).

Ilustrasi disajikan sebagai **tile WebP** (`assets/tiles/`, ±3,5 MB total; tiap tampilan hanya memuat beberapa ratus KB). Cara membuat ulang setelah mengubah zona/jalur di `js/data.js` atau bentuk alam di `data/geografi.json`:

```
node tools/gen-ilustrasi.mjs     # 1. gambar SVG (assets/peta-ilustrasi.svg, tidak di-commit)
node tools/render-tiles.mjs      # 2. potong jadi tile WebP memakai Chrome/Edge headless (±30 detik)
```

Simbol (rumah, lapak, pohon, payung, dll.) ada di `tools/ilustrasi/simbol.mjs`. Label nama tempat diatur di `js/data.js` → `label`.

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
