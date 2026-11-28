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
| `js/rute.js` | Data "Cara ke Sawarna": rute kota asal → Desa Sawarna, dan info lokal tiap wisata (akses, parkir, tiket, waktu terbaik, sinyal). Perkiraan dari keterangan warga; perbarui `diperbarui` setiap kali diubah |
| `js/iso.js` | Parameter proyeksi isometrik per arah (dibuat `gen-ilustrasi.mjs`) |

## Fitur kerangka

- Batas kawasan (kuning), zona UMKM pantai (merah), zona homestay (hijau), jalur utama (biru)
- Marker berwarna per kategori + filter kategori
- Pop-up per kategori: homestay, kuliner, sewa & jasa, tiket & parkir, toilet & ibadah, keselamatan, spot wisata, akses
- Pop-up zona: ringkasan layanan di dalam zona + tombol tampilkan layanan zona
- Tombol **Lokasi saya** (GPS), **kembali ke awal**, dan **📍 ambil koordinat** (untuk survei)

## Peta ilustrasi

Peta dasar bawaan adalah ilustrasi 2.5D bergaya peta taman wisata: tanah (jalan, zona, pantai, sungai, sawah) presisi sesuai koordinat asli, sedangkan bangunan, pohon, orang, dan kendaraan digambar "berdiri" menghadap penonton. Peta hanya memakai ilustrasi (tanpa pilihan satelit/peta jalan). Saat peta jauh, tiap kawasan (UMKM Pantai, Homestay) tampil sebagai satu marker berikon; setelah diperbesar ke zoom 18, marker kawasan hilang dan titik detail di dalamnya muncul.

Peta hanya menampilkan **wilayah Ciantir** (`pulau` di `js/data.js`) sebagai pulau yang melayang di atas awan: tebing tanah di bawah tepinya, awan di sekelilingnya, dan langit dari CSS; di luar wilayah itu gambar transparan dan peta tidak bisa digeser ke sana. Ilustrasi bergaya **isometrik** (dimetrik 2:1, ala Rod Hunt / Icograms): bangunan diekstrusi dari jejak OSM asli, dibuat untuk **8 arah pandang** (0°, 45°, … 315°). Tiap arah memakai CRS Leaflet khusus dengan matriks yang sama dengan generator, sehingga pin dan GPS tetap tepat. Arah dipilih lewat tombol kompas (slider, ±45°, 8 arah mata angin). Di panel yang sama pengunjung bisa memilih **sudut kamera** (tilt): Rendah (±22°), Sedang (30°, bawaan), atau Tinggi (±43°); tiap sudut punya set tile sendiri (`assets/tiles/{arah}-t38`, `{arah}`, `{arah}-t68`) dan pilihan diingat di perangkat pengunjung.

Ilustrasi disajikan sebagai **tile WebP** di `assets/tiles/{arah}/{z}/{x}/{y}.webp`; HP hanya mengunduh tile arah & tampilan yang sedang dilihat. Cara membuat ulang setelah mengubah zona/jalur di `js/data.js` atau bentuk alam di `data/geografi.json`:

```
python tools/siapkan-data-nyata.py  # 0. bangunan, jalan, sungai dari OpenStreetMap + warna atap dari citra (data/nyata.json)
python tools/tutupan-lahan.py       #    hutan, sawah, lahan dari citra satelit (data/tutupan.json)
node tools/gen-ilustrasi.mjs      # 1. gambar SVG per arah, sudut kamera bawaan (assets/ilustrasi/, tidak di-commit)
node tools/gen-ilustrasi.mjs --miring rendah   #    sudut kamera lain: rendah | tinggi (8 arah)
node tools/render-tiles.mjs       # 2. potong jadi tile WebP memakai Chrome/Edge headless, ±4 menit
node tools/render-tiles.mjs 225   #    (atau satu arah saja; sudut lain: 225-t38, 225-t68)
```

Foto contoh untuk kartu info (potongan ilustrasi) dibuat dengan `python tools/foto-contoh.py` → `assets/foto/`; ganti dengan foto asli hasil survei.

Hutan, sawah, dan lahan terbuka mengikuti tutupan lahan hasil `python tools/tutupan-lahan.py` (klasifikasi warna & tekstur citra satelit Esri per sel ±4 m → `data/tutupan.json`; citranya sendiri tidak disimpan). Sungai Cisawarna, bangunan, jalan, dan anak sungai di ilustrasi mengikuti data OpenStreetMap; setiap jalan yang melintasi sungai diberi jembatan (© kontributor OpenStreetMap, ODbL); warna atap disimpulkan dari citra satelit sebagai acuan saja.

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
