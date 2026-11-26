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
| `js/app.js` | Logika peta (Leaflet): ilustrasi isometrik, marker kawasan bertingkat, filter, lokasi saya, mode ambil koordinat |
| `data/geografi.json` | Bentuk pantai, sungai, sawah, hutan (untuk ilustrasi) |
| `tools/gen-ilustrasi.mjs` | Generator ilustrasi peta (8 arah) → `assets/ilustrasi/peta-{arah}.svg` |
| `tools/render-tiles.mjs` | SVG → tile WebP `assets/tiles/{arah}/{z}/{x}/{y}.webp` |
| `tools/ilustrasi/` | Pustaka simbol tanah & sprite 2.5D |
| `js/iso.js` | Parameter proyeksi isometrik per arah (dibuat `gen-ilustrasi.mjs`) |

## Fitur kerangka

- Batas kawasan (kuning), zona UMKM pantai (merah), zona homestay (hijau), jalur utama (biru)
- Marker berwarna per kategori + filter kategori
- Pop-up per kategori: homestay, kuliner, sewa & jasa, tiket & parkir, toilet & ibadah, keselamatan, spot wisata, akses
- Pop-up zona: ringkasan layanan di dalam zona + tombol tampilkan layanan zona
- Tombol **Lokasi saya** (GPS), **kembali ke awal**, dan **📍 ambil koordinat** (untuk survei)

## Peta ilustrasi

Peta dasar bawaan adalah ilustrasi 2.5D bergaya peta taman wisata: tanah (jalan, zona, pantai, sungai, sawah) presisi sesuai koordinat asli, sedangkan bangunan, pohon, orang, dan kendaraan digambar "berdiri" menghadap penonton. Peta hanya memakai ilustrasi (tanpa pilihan satelit/peta jalan). Saat peta jauh, tiap kawasan (UMKM Pantai, Homestay) tampil sebagai satu marker berikon; setelah diperbesar ke zoom 18, marker kawasan hilang dan titik detail di dalamnya muncul.

Ilustrasi bergaya **isometrik** (dimetrik 2:1, ala Rod Hunt / Icograms): bangunan diekstrusi dari jejak OSM asli, dibuat untuk **8 arah pandang** (0°, 45°, … 315°). Tiap arah memakai CRS Leaflet khusus dengan matriks yang sama dengan generator, sehingga pin dan GPS tetap tepat. Arah dipilih lewat tombol kompas (slider, ±45°, 8 arah mata angin).

Ilustrasi disajikan sebagai **tile WebP** di `assets/tiles/{arah}/{z}/{x}/{y}.webp`; HP hanya mengunduh tile arah & tampilan yang sedang dilihat. Cara membuat ulang setelah mengubah zona/jalur di `js/data.js` atau bentuk alam di `data/geografi.json`:

```
python tools/siapkan-data-nyata.py  # 0. bangunan, jalan, sungai dari OpenStreetMap + warna atap dari citra (data/nyata.json)
node tools/gen-ilustrasi.mjs      # 1. gambar SVG per arah (assets/ilustrasi/, tidak di-commit), ±10 detik
node tools/render-tiles.mjs       # 2. potong jadi tile WebP memakai Chrome/Edge headless, ±4 menit
node tools/render-tiles.mjs 225   #    (atau satu arah saja)
```

Foto contoh untuk kartu info (potongan ilustrasi) dibuat dengan `python tools/foto-contoh.py` → `assets/foto/`; ganti dengan foto asli hasil survei.

Bangunan, jalan, dan anak sungai di ilustrasi mengikuti data OpenStreetMap (© kontributor OpenStreetMap, ODbL); warna atap disimpulkan dari citra satelit sebagai acuan saja.

Simbol tanah ada di `tools/ilustrasi/simbol.mjs`, objek berdiri (rumah, kios, pohon, orang, gapura, dll.) di `tools/ilustrasi/sprite.mjs`. Label nama tempat diatur di `js/data.js` → `label`.

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
