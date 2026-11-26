# PRD — Sawarna Smart Guide: Peta Interaktif Pantai Ciantir

| | |
|---|---|
| **Status** | Draf v0.2 (revisi pertanyaan terbuka P1–P5) |
| **Pemilik** | Tim KKN Desa Sawarna |
| **Tanggal** | 26 November 2026 |
| **Target rilis** | **6 Desember 2026** |
| **Akhir KKN** | 20 Desember 2026 |
| **Repo / hosting** | `digitaldesasawarna/sawarna-smart-guide` · Cloudflare Pages · domain desa (menyusul) |

---

## 1. Ringkasan

Sawarna Smart Guide adalah **peta wisata digital interaktif** untuk kawasan Pantai Ciantir, Desa Sawarna (Lebak, Banten). Konsepnya seperti papan peta taman wisata (Ancol, Dufan), tetapi digital: bergaya ilustrasi 2.5D yang menarik, bisa diputar ke 8 arah, menunjukkan posisi pengunjung, dan menghubungkan pengunjung langsung ke pelaku UMKM lewat WhatsApp.

Peta dibuka dengan **memindai QR code** di lokasi, langsung di browser HP tanpa instal aplikasi, dan tetap bisa dipakai saat sinyal hilang.

## 2. Latar belakang & masalah

- Pantai Ciantir belum punya peta kawasan yang representatif; papan informasi fisik terbatas dan tidak menunjukkan posisi pengunjung.
- Pengunjung, terutama yang baru pertama datang dan wisatawan asing, sulit mengetahui letak fasilitas, area kuliner/UMKM, dan informasi keselamatan.
- Desa membutuhkan **media digital yang memperkuat citra wisata Sawarna**: modern, rapi, dan konsisten dengan identitas visual Sawarna.
- Sinyal seluler di lokasi lemah, jadi solusi harus ringan dan bisa offline.

## 3. Tujuan

| # | Tujuan | Prioritas |
|---|---|---|
| T1 | **Citra digital desa**: peta yang indah, profesional, dan sesuai brand Sawarna, layak dibagikan dan dipamerkan | Utama |
| T2 | Pengunjung bisa **orientasi & menemukan tempat** di kawasan (fasilitas, UMKM, spot wisata) | Tinggi |
| T3 | **Menghubungkan pengunjung ke UMKM** lewat WhatsApp untuk memesan produk | Tinggi |
| T4 | Menyampaikan **informasi keselamatan** pantai | Tinggi |
| T5 | Data **bisa dirawat pokdarwis tanpa coding** setelah KKN selesai | Tinggi |

## 4. Pengguna

| Pengguna | Kebutuhan utama | Catatan |
|---|---|---|
| **Wisatawan domestik** (utama) | Tahu "saya di mana", fasilitas terdekat, tempat makan, info aman berenang | Datang dari kota; memakai HP Android kelas menengah |
| **Wisatawan asing** (utama) | Sama seperti di atas, dalam bahasa Inggris; spot surfing | Banyak peselancar |
| **Pokdarwis / pengelola desa** (perawat data) | Memperbarui daftar UMKM, nomor WA, dan lokasi dengan mudah | Tidak menulis kode |
| **Pelaku UMKM** (ditampilkan) | Usahanya mudah ditemukan & dihubungi | Nomor WA dipasang **hanya dengan izin** |

## 5. Skenario penggunaan

1. **Tiba di gerbang**: pengunjung memindai QR di gerbang → peta terbuka, berpusat di lokasi gerbang dengan sudut pandang menghadap pantai → pengunjung melihat letak kawasan UMKM, homestay, dan pantai.
2. **Mencari makan**: ketuk filter "Kuliner" → pilih marker warung → baca info singkat → tekan **WhatsApp** untuk memesan, atau **Petunjuk Arah**.
3. **Mencari penginapan**: ketuk zona Homestay → tombol **"Lihat homestay di VisitSawarna"** membuka visitsawarna.com.
4. **Sebelum berenang**: ketuk marker Pos Balawista / ikon keselamatan → baca arti warna bendera, area berbahaya, nomor darurat, titik kumpul evakuasi.
5. **Sinyal hilang di pantai**: peta yang sudah dibuka tetap tampil, marker & info tetap bisa dibaca, dan lokasi GPS tetap jalan.
6. **Wisatawan asing**: HP berbahasa Inggris → peta otomatis tampil dalam bahasa Inggris (bisa diganti manual ID/EN).
7. **Pokdarwis menambah UMKM baru**: menambah satu baris di Google Sheets (nama, kategori, koordinat, nomor WA) → peta menampilkan marker baru tanpa bantuan pengembang.

## 6. Ruang lingkup MVP (rilis 6 Desember 2026)

### F1 — Peta ilustrasi 2.5D, 8 arah pandang *(sudah ada, disempurnakan)*
- Ilustrasi gaya peta taman wisata; kawasan inti detail, sekitarnya hijau alami (sawah, perbukitan, kampung).
- Presisi terhadap koordinat asli, sehingga marker & GPS tepat.
- Rotasi 8 arah (0°–315°): tombol kompas, slider, dan gestur dua jari.
- Pilihan lapisan: Ilustrasi (bawaan), Satelit, Peta jalan.

### F2 — Zona & marker
- **Zona**: UMKM Pantai, Homestay, (batas kawasan sebagai bingkai).
- **Marker per kategori**: Kuliner/UMKM, Sewa & Jasa, Tiket & Parkir, Toilet & Ibadah, Keselamatan, Spot Wisata, Akses.
- **Homestay tidak diberi marker per unit**; cukup zona dengan tautan ke visitsawarna.com.
- Filter kategori.

### F3 — Info tempat (pop-up / panel bawah di HP)
- Isi: nama, kategori, foto (opsional), deskripsi singkat, jam buka (opsional).
- Tombol **Petunjuk Arah** (Google Maps).
- Tombol **WhatsApp** untuk UMKM yang sudah memberi izin.
- **Tidak menampilkan harga.**

### F4 — Info keselamatan *(statis)*
- Lokasi pos balawista, titik kumpul & jalur evakuasi tsunami, area berbahaya (arus balik).
- Arti warna bendera pantai dan nomor darurat (dapat langsung ditelepon dari peta).
- Status harian (bendera hari ini) **tidak** termasuk MVP.

**Nomor darurat yang ditampilkan:**

| Layanan | Nomor | Status |
|---|---|---|
| Panggilan darurat terpadu | **112** | Nomor nasional resmi |
| Basarnas (SAR / kecelakaan laut) | **115** | Nomor nasional resmi |
| Ambulans / gawat darurat medis | **119** | Nomor nasional resmi |
| Polisi | **110** | Nomor nasional resmi |
| Pemadam kebakaran | **113** | Nomor nasional resmi |
| Pos Balawista Pantai Ciantir | *contoh* | Diganti nomor asli saat survei |
| Puskesmas terdekat | *contoh* | Diganti nomor asli saat survei |

Nomor nasional tetap perlu dicoba/diverifikasi berfungsi dari lokasi saat survei.

### F5 — Lokasi saya
- Titik "Anda di sini" dari GPS dan pemberitahuan bila pengunjung berada di luar kawasan.

### F6 — Dwibahasa Indonesia / Inggris
- Otomatis mengikuti bahasa HP, dengan tombol ganti ID/EN.
- Mencakup antarmuka, kategori, nama zona, label peta, dan isi info tempat (kolom terjemahan di data).

### F7 — Bisa dipakai offline (PWA)
- Setelah dibuka sekali (scan QR), halaman, data, dan tile ilustrasi untuk tampilan yang sudah dilihat tetap tersedia tanpa sinyal.
- Bisa "ditambahkan ke layar utama" seperti aplikasi.

### F8 — Data dari Google Sheets
- Pokdarwis mengelola data titik (UMKM, fasilitas, keselamatan, spot) di Google Sheets.
- Peta membaca data terbaru; bila gagal (offline), memakai salinan terakhir yang tersimpan.
- Panduan singkat pengisian untuk pokdarwis.

### F9 — Masuk lewat QR code
- QR sudah tersedia; tinggal dipasang di titik tertentu (gerbang, loket, area UMKM, pos balawista).
- Tautan QR dapat membawa penanda titik (mis. `?dari=gerbang`) agar peta langsung berpusat di lokasi QR dan bisa dihitung per titik.
- Saat dibuka dari QR, arah pandang bawaan **menghadap pantai (Barat Daya, 225°)**.

### F10 — Pengukuran & umpan balik
- Analitik pengunjung tanpa cookie (jumlah kunjungan & scan per titik QR).
- Tautan kuesioner umpan balik singkat.
- Penghitungan klik WhatsApp **tidak** dibuat.

## 7. Data

Satu baris = satu titik. Kolom yang dibutuhkan:

| Kolom | Wajib | Keterangan |
|---|---|---|
| `id` | ✓ | Kode unik, mis. `warung-bu-ani` |
| `kategori` | ✓ | kuliner, sewa, fasilitas, dasar, keselamatan, spot, akses |
| `nama` / `nama_en` | ✓ / – | Nama tempat; versi Inggris opsional |
| `lat`, `lng` | ✓ | Koordinat (diambil saat survei dengan tombol 📍 di peta) |
| `deskripsi` / `deskripsi_en` | – | Satu-dua kalimat |
| `whatsapp` | – | Format `62…`, **hanya dengan izin pemilik** |
| `jam` | – | Mis. `08.00–21.00` |
| `foto` | – | Tautan foto |
| `aktif` | ✓ | `ya` / `tidak` (menyembunyikan tanpa menghapus) |

Data zona, jalur, dan batas kawasan tetap dikelola pengembang (jarang berubah, mempengaruhi ilustrasi).

**Tahap data:** (1) data contoh untuk gambaran & demo → (2) survei lapangan → (3) data asli + formulir izin pemilik usaha.

## 8. Kebutuhan non-fungsional

| Aspek | Target |
|---|---|
| Perangkat | Mobile-first; nyaman di HP Android kelas menengah & iPhone; tetap baik di laptop |
| Kecepatan | Tampilan pertama terbuka < 3 detik di 4G; unduhan awal < 1,5 MB |
| Offline | Peta, data, dan tile yang sudah dilihat tetap tersedia tanpa sinyal |
| Aksesibilitas | Kontras teks lolos WCAG AA; target sentuh ≥ 44 px |
| Privasi | Tanpa akun & tanpa cookie pelacak; nomor WA hanya dengan izin |
| Brand | Mengikuti brand kit Sawarna (`brand/`) |
| Biaya | Gratis dioperasikan (Cloudflare Pages, Google Sheets) |

## 9. Ukuran keberhasilan

| Metrik | Cara ukur | Target awal |
|---|---|---|
| Jumlah pengunjung / scan QR | Analitik tanpa cookie, per titik QR | *ditentukan setelah minggu pertama* |
| Cakupan data | Jumlah UMKM & fasilitas terdata dari survei | *ditentukan setelah survei* |
| Kepuasan pengunjung | Kuesioner singkat | *ditentukan* |

## 10. Jadwal

| Tanggal | Kegiatan |
|---|---|
| 26–28 Nov | PRD & DESIGN disepakati; data contoh lengkap; dwibahasa; integrasi Google Sheets |
| 29 Nov – 1 Des | Survei lapangan: koordinat, foto, izin WhatsApp; isi Google Sheets |
| 2–4 Des | Offline (PWA), info keselamatan, analitik & umpan balik, uji di beberapa HP |
| 5 Des | Uji coba lapangan, pasang QR, perbaikan akhir |
| **6 Des** | **Rilis** |
| 7–20 Des | Sosialisasi & demo ke pengunjung dan mitra; kumpulkan umpan balik; serah terima akses (Google Sheets, Cloudflare, domain) ke pokdarwis |

## 11. Di luar cakupan (tidak dikerjakan dulu)

- Pemesanan & pembayaran online.
- Akun / login pengunjung, favorit, ulasan.
- Navigasi rute langkah demi langkah (cukup diarahkan ke Google Maps).
- Kawasan wisata lain di Sawarna (Tanjung Layar, Legon Pari, Goa Langir, dll.).
- Harga produk/homestay.
- Marker per unit homestay.
- Status keselamatan harian.
- Gamifikasi.

## 12. Risiko & pertanyaan terbuka

| # | Hal | Catatan |
|---|---|---|
| R1 | Waktu sangat terbatas (10 hari) | Prioritaskan F1–F6; F7–F10 bisa versi sederhana |
| R2 | Ukuran tile ilustrasi besar (±35 MB total untuk 8 arah) | Offline menyimpan tile yang sudah dilihat saja; pertimbangkan simpan arah bawaan penuh |
| R3 | Izin nomor WhatsApp dari pemilik usaha | Siapkan formulir izin saat survei |
| R4 | Google Sheets diubah sembarangan / format salah | Validasi data, kolom `aktif`, panduan pengisian |
| P1 | Nama domain desa yang akan dipakai | Disesuaikan nanti; sementara memakai `*.pages.dev` |
| P2 | Nomor Pos Balawista & Puskesmas terdekat | Sementara data contoh; nomor asli dikumpulkan saat survei |

## 13. Keputusan yang sudah diambil

- Fokus hanya kawasan Pantai Ciantir dan sekitarnya.
- Gaya ilustrasi 2.5D peta taman wisata (referensi: peta Ancol), 8 arah pandang.
- Tanpa gamifikasi; tanpa direktori UMKM lengkap (diganti zona + marker).
- Tanpa harga; UMKM dihubungi lewat WhatsApp; homestay diarahkan ke visitsawarna.com.
- Data dirawat pokdarwis melalui Google Sheets.
- Brand kit Sawarna menjadi dasar desain.
- Tidak ada penghitungan klik WhatsApp.
- Akun Google Sheets & Cloudflare dimiliki **pokdarwis** setelah KKN (serah terima akses termasuk dalam kegiatan 7–20 Des).
- Situs akan memakai **domain desa** (nama domain menyusul).
- Arah pandang bawaan saat dibuka dari QR: **menghadap pantai, 225°**.
- Nomor darurat memakai nomor nasional resmi (112, 115, 119, 110, 113); nomor lokal memakai contoh sampai survei.
