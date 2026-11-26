# DESIGN — Sawarna Smart Guide: Peta Interaktif Pantai Ciantir

| | |
|---|---|
| **Status** | Draf v0.5 (revisi: sentuhan tema pesisir & pantai) |
| **Tanggal** | 26 November 2026 |
| **Acuan** | [`docs/PRD.md`](PRD.md) · brand kit [`brand/`](../brand/index.html) · token [`brand/tokens.css`](../brand/tokens.css) |

Dokumen ini menjelaskan **bagaimana** produk terlihat dan terasa. **Apa** yang dibuat dan **mengapa** ada di PRD.

---

## 1. Prinsip desain

1. **Peta adalah bintangnya.** Ilustrasi tampil penuh layar; antarmuka tipis, tenang, dan tidak berebut perhatian dengan peta.
2. **Bersih & nyaman dilihat, berjiwa pesisir.** Gaya *clean design*: banyak ruang kosong, sedikit warna, hierarki teks jelas, tanpa kesan kartun — diperkaya detail halus bertema pantai (§2.1). Setiap elemen harus punya alasan untuk ada.
3. **Nyata, bukan karangan.** Peta adalah ilustrasi detail yang **setia pada kondisi asli** (foto satelit): yang terlihat di peta ada di lapangan, di tempat yang sama, dengan bentuk dan warna yang mirip.
4. **Sekali ketuk.** Info penting (tempat, arah, WhatsApp, keselamatan) tercapai dengan satu atau dua ketukan.
5. **Nyaman di pantai.** Terang, kontras tinggi, tombol cukup besar (≥ 44 px), bisa dipakai satu tangan di bawah sinar matahari.
6. **Tahan sinyal lemah.** Ringan, bisa offline, tanpa animasi berat.

## 2. Fondasi visual

Antarmuka memakai **brand kit Sawarna** (`brand/tokens.css`, variabel `--sw-*`) secara **hemat**: dasar netral, satu warna aksen, warna kategori hanya sebagai penanda kecil.

| Unsur | Ketentuan |
|---|---|
| Permukaan | **Buih** `#F7FBFC` & putih; permukaan sekunder **Pasir Terang** `#FBF6EC`; panel mengambang 92% + blur halus (lihat §2.1) |
| Teks | Tinta `--sw-tinta` untuk judul/isi, abu `--sw-abu-500` untuk keterangan |
| Aksen (satu saja) | Biru Ombak `--sw-biru-600` untuk tombol utama, status aktif, dan tautan. Oranye Senja **tidak** dipakai untuk tombol atau teks; hanya di logo dan penanda kecil "baru/penting" (warna Senja, §2.1) |
| Warna kategori | Dipakai **kecil saja**: titik di chip, lingkaran pin, garis kecil di kartu. Bukan latar tombol atau kapsul penuh warna |
| Garis & bayangan | Garis 1 px `--sw-abu-200`; bayangan sangat lembut (`--sw-bayangan-1/2`); tidak ada bingkai tebal |
| Sudut | Konsisten: 12 px (kartu, panel), 999 px (chip, tombol bulat) |
| Jarak | Kelipatan 4/8 px; ruang dalam kartu 16 px |
| Huruf | Plus Jakarta Sans saja, tiga ketebalan: 400 (isi), 600 (label, tombol), 700 (judul). **Yellowtail tidak dipakai** di antarmuka maupun label peta |
| Ukuran huruf | Judul kartu 17 px · isi 14 px · keterangan 12 px · chip/tombol 13–14 px |
| Ikon | Ikon garis SVG tipis (1,75 px), satu warna, sudut membulat; **tanpa emoji** |
| Tema | Terang saja |
| WhatsApp | Tombol sekunder bergaris dengan ikon WhatsApp hijau `--sw-whatsapp`; bukan blok hijau penuh |

### Warna kategori (penanda kecil)

Warna sedikit diredam agar tenang di atas ilustrasi realistis.

| Kategori | Warna | Ikon |
|---|---|---|
| Kuliner & UMKM | `#C9822B` | toko |
| Sewa & Jasa | `#2A8FA5` | papan selancar |
| Tiket & Parkir | `#6E5AA8` | tiket |
| Toilet & Ibadah | `#6B7A8F` | toilet |
| Keselamatan | `#C94545` | pelampung |
| Spot Wisata | `#BF5A8C` | kamera |
| Akses | `#3F6DA6` | gerbang |

Homestay tidak punya pin (PRD F2): ditandai lewat **zona**.

### 2.1 Sentuhan tema pesisir & pantai

Tema pesisir memperkaya antarmuka yang bersih lewat **detail kecil yang terasa, bukan terlihat ramai**. Inspirasinya: pasir, buih ombak, air dangkal, kaca laut (*sea glass*), cangkang, tali kapal, matahari terbenam.

**Aturan pakai**
1. Maksimal **satu** sentuhan pesisir per komponen.
2. Tekstur & pola: opasitas **≤ 6%**, hanya di permukaan besar (panel, layar pembuka), tidak di belakang teks kecil.
3. Bentuk & motif digambar sebagai **garis tipis/siluet sederhana**, bukan gambar klip kartun.
4. Tidak mengorbankan kontras, ukuran sentuh, atau kecepatan muat.

| Aspek | Elemen pesisir | Diterapkan di |
|---|---|---|
| **Warna** | Palet "pantai pagi": **Buih** `#F7FBFC` (permukaan utama), **Pasir Terang** `--sw-pasir-terang` `#FBF6EC` (permukaan sekunder & latar foto kosong), **Air Dangkal** `--sw-biru-50` `#EEF4FB` (status aktif), **Kaca Laut** `#D6ECE8` (latar info ringan & sukses), **Senja** `--sw-oranye-100` `#FAE6CB` (hanya penanda "baru/penting" kecil) | Panel, chip aktif, kotak info, sorotan |
| **Bentuk** | **Garis tepi ombak**: tepi atas panel bawah & kartu keselamatan berupa lengkung ombak halus (tinggi 6 px); **sudut kerikil**: sudut 12–16 px yang lembut; pegangan panel bawah berbentuk garis buih pendek | Panel bawah HP, panel keselamatan, panel arah |
| **Tekstur** | **Butiran pasir** sangat halus (noise 3–4%) pada panel besar & layar pembuka; **riak air** samar pada latar biru muda | Layar pembuka, panel keselamatan, kartu header (opsional) |
| **Pola** | **Garis ombak tipis** berulang (1 px, 5%) sebagai pemisah bagian atau dasar header; **garis kontur pasang-surut** untuk latar kosong | Pemisah di panel, bagian bawah layar pembuka |
| **Ikon** | Set ikon garis bertema: ombak (laut/Spot Surfing), pelampung (keselamatan), papan selancar (sewa), cangkang/kerang (kuliner laut), daun kelapa (kebun), perahu (akses laut), jangkar (dermaga), matahari terbenam (spot sunset), bendera pantai (status bendera) | Pin, chip, panel keselamatan, kompas |
| **Ilustrasi kecil** | Ilustrasi garis satu warna untuk **keadaan kosong & pesan**: perahu di pasir ("Belum ada tempat di kategori ini"), botol pesan ("Mode offline: data tersimpan"), bintang laut ("Anda berada di luar kawasan"), cangkang (foto belum tersedia) | Keadaan kosong, offline, galat, foto kosong |
| **Kompas** | Mawar angin bergaya **kompas pelaut**, jarum utara merah tipis | Tombol & panel arah pandang |
| **Gerak** | **Riak** saat tombol diketuk (lingkaran memudar seperti tetes air); panel naik dengan *easing* lembut seperti **ombak pasang** (250–300 ms); titik "lokasi saya" berdenyut seperti **riak air**; garis ombak di layar pembuka bergerak pelan sekali (bisa dimatikan "kurangi gerakan") | Tombol, panel, lokasi saya, layar pembuka |
| **Memuat** | Indikator muat berupa **garis ombak** yang mengalir, atau batang yang terisi seperti **air pasang** | Saat tile/data dimuat |
| **Pin terpilih** | Cincin **riak** tipis yang memudar di sekeliling pin | Pin marker |
| **Peta** | Label laut & sungai miring (italic) dengan jarak huruf lebar seperti **peta bahari**; tanda skala jarak bergaya **tali kapal** (garis dengan simpul) | Label peta, skala jarak |
| **Foto** | Sudut foto sedikit membulat dengan **gradasi bawah seperti air** sangat tipis agar teks kategori tetap terbaca | Pop-up info tempat |
| **Waktu** | Opsional: aksen header berganti halus mengikuti waktu (pagi biru muda, sore keemasan senja) | Header (fase berikutnya) |
| **Bahasa** | Sapaan & pesan hangat bernuansa pantai, tetap singkat: "Selamat datang di Pantai Ciantir", "Ombak sedang tinggi — berenang di area yang diawasi", "Sinyal surut? Peta tetap bisa dipakai." | Layar pembuka, toast, panel keselamatan |

**Yang dihindari:** gambar bintang laut/ikan/ombak berwarna-warni besar, font huruf sambung bertema pantai, latar foto pantai di belakang teks, animasi ombak terus-menerus di atas peta.

## 3. Tata letak

### HP (utama)

```
┌──────────────────────────────┐
│ ┌──────────────────────────┐ │  ← kartu header putih, satu baris
│ │ ◐ Pantai Ciantir    ID EN│ │
│ └──────────────────────────┘ │
│ (Semua)(• Kuliner)(• Sewa) → │  ← chip putih bergaris tipis
│                              │
│                         ( ⛑ )│  ← tombol bulat putih, ikon merah
│      peta ilustrasi     ( ⊕ )│  ← kompas
│      layar penuh        ( ◎ )│  ← lokasi saya
│                         ( ▤ )│  ← lapisan
└──────────────────────────────┘
```

- Tidak ada kotak legenda: chip filter sekaligus legenda (titik warna + nama).
- Semua tombol mengambang **putih dengan ikon gelap**, ukuran sama (44 px), jarak sama; hanya ikon keselamatan yang berwarna merah.
- Tombol "kembali ke awal" digabung ke ketukan dua kali pada kompas (mengurangi jumlah tombol).
- Zoom dengan cubit dua jari; tanpa tombol +/− di HP.
- Atribusi peta kecil, abu-abu, di pojok kanan bawah.

### Laptop / layar lebar

- Kartu header di kiri atas (lebar maks ±420 px), chip filter di bawahnya.
- Tombol di kanan bawah, ditambah tombol zoom +/− dengan gaya yang sama.
- Pop-up info tempat sama seperti di HP.

## 4. Komponen

### 4.1 Layar pembuka
- Sederhana dan singkat: latar putih, **logo Sawarna memudar masuk** lalu teks "Pantai Ciantir" kecil di bawahnya; **±1 detik**, bisa dilewati dengan ketukan.
- Tanpa animasi ombak/ilustrasi yang ramai. Peta & tile arah bawaan dimuat di belakang, lalu peta tampil memudar masuk.
- Bila "kurangi gerakan" aktif di HP: logo diam ±0,5 detik.

### 4.2 Header
- Kartu putih satu baris: **simbol logo kecil** (24 px), judul "Pantai Ciantir" (600), dan sakelar bahasa **ID | EN** berupa teks kecil (aktif = biru & tebal).
- Bahasa awal mengikuti bahasa HP; pilihan disimpan.

### 4.3 Chip filter
- Chip putih, garis tipis abu, teks gelap, **titik kecil berwarna kategori** di depan nama. Tanpa emoji dan tanpa angka besar.
- Chip aktif: latar biru sangat muda `--sw-biru-50`, garis & teks biru. Chip "Semua" aktif: sama.
- Perilaku: ketuk pertama saat semua aktif → fokus ke satu kategori; ketukan berikutnya → tambah/kurangi kategori. Baris bisa digeser.

### 4.4 Pin marker
- **Lingkaran kecil** (28 px) warna kategori dengan ikon garis putih, bingkai putih 2 px, bayangan halus. Bukan tetesan besar.
- Saat zoom jauh, pin mengecil menjadi titik (12 px) agar peta tidak ramai.
- Pin terpilih: membesar ke 36 px + cincin putih tipis.
- Pin tetap tegak saat peta diputar.

### 4.5 Pop-up info tempat
- Kartu putih di atas marker, lebar maks 280 px, sudut 12 px, bayangan lembut, panah kecil ke marker. Peta bergeser otomatis agar kartu tidak terpotong.
- Susunan (rata kiri, ruang dalam 16 px):
  1. **Foto highlight** (16:9) di bagian atas kartu, sudut atas membulat. Belum ada foto asli → foto contoh (lihat §7).
  2. Keterangan kecil: titik warna + nama kategori (abu, 12 px).
  3. **Nama tempat** (17 px, 700).
  4. Deskripsi 1–2 kalimat (14 px, abu gelap); jam buka bila ada.
  5. Tombol, sejajar: **Petunjuk Arah** (utama, biru penuh) dan **WhatsApp** (sekunder, bergaris, ikon hijau; hanya UMKM yang sudah memberi izin).
- Tanpa harga, tanpa banyak ikon di dalam teks, tanpa label "Data contoh" setelah data asli masuk.

### 4.6 Zona
- Zona terlihat dari ilustrasinya sendiri. Area klik tak terlihat; saat disorot muncul garis putih tipis.
- **Label zona: kapsul putih** dengan titik warna zona dan teks gelap (600, 13 px). Bukan kapsul penuh warna.
- Ketuk zona → pop-up zona (gaya sama dengan §4.5): nama, deskripsi singkat, ringkasan layanan, dan tombol:
  - Zona UMKM → "Tampilkan UMKM di zona ini".
  - Zona Homestay → **"Lihat homestay di VisitSawarna"** (tab baru).

### 4.7 Tombol & panel keselamatan
- Tombol bulat **putih dengan ikon pelampung merah**, di urutan teratas tumpukan kanan.
- Membuka **panel keselamatan** (panel bawah di HP, kartu di laptop), tersusun rapi per bagian dengan judul kecil:
  1. Arti warna bendera pantai (contoh bendera kecil + satu kalimat).
  2. Peringatan arus balik & area berbahaya.
  3. Titik kumpul & jalur evakuasi tsunami (tombol teks "Tunjukkan di peta").
  4. Nomor darurat: daftar baris (nama · nomor) dengan tombol telepon kecil di kanan (112, 115 Basarnas, 119, 110, 113, Pos Balawista, Puskesmas).
- Merah hanya untuk ikon & tombol telepon; panel tetap putih bersih.

### 4.8 Kompas & panel arah pandang
- Tombol kompas putih, jarum tipis (utara merah kecil).
- Panel arah: kartu putih ringkas — derajat & nama arah, slider 8 posisi, tombol ±45°, dan 8 arah mata angin sebagai tombol teks kecil.
- Arah bawaan saat dibuka: **225° (menghadap pantai)**. Ketuk dua kali kompas = kembali ke tampilan awal.

### 4.9 Lokasi saya
- Titik biru dengan lingkaran akurasi transparan; denyut halus. Toast bila pengunjung di luar kawasan.

### 4.10 Toast
- Kapsul gelap kecil di atas tengah, teks putih 13 px, 2–3 detik.

### 4.11 Penanda offline
- Teks kecil abu "Offline" di header saat tidak ada sinyal.

### 4.12 Alat survei (sementara)
- Tombol "ambil koordinat" dipakai **selama survei saja**, lalu **dihapus** sebelum/sesudah rilis.

## 5. Peta ilustrasi

| Aspek | Ketentuan |
|---|---|
| Gaya | **Ilustrasi digital detail & realistis** yang menjiplak citra satelit (lihat §5.1). Objek 2.5D "berdiri" menghadap penonton; nuansa tenang & natural, **tidak kartun** |
| Kawasan inti | Detail tertinggi: setiap bangunan, warung, gazebo, dan pohon besar digambar **di posisi, ukuran, bentuk atap, dan warna aslinya** sesuai satelit & foto survei; ditambah suasana (payung, orang, kendaraan) secukupnya |
| Zona | UMKM: tanah salem berpaving · Homestay: rumput hijau · keduanya dibingkai jalan setapak hijau muda bertepi putih |
| Sekitar kawasan | **Mengikuti kondisi asli** (lihat §5.2): sawah, hutan/bukit, kebun, permukiman, jalan, dan sungai digambar di lokasi sebenarnya, bergaya ilustrasi hijau alami |
| Laut & pantai | Gradasi biru, buih ombak, pasir beriak, perahu, peselancar |
| Arah pandang | 8 arah (0°–315°), objek selalu tegak; rotasi dikunci per 45° |
| Label | Nama tempat sebagai teks bersih (Plus Jakarta Sans, halo putih tipis) di atas peta: Samudra Hindia, Sungai Cisawarna, Persawahan, Hutan; label zona berupa kapsul putih (§4.6) |
| Penyajian | Tile WebP per arah, zoom 16–19 |

### 5.1 Gaya ilustrasi: detail & realistis

Seluruh peta (kawasan inti dan sekitarnya) digambar sebagai **ilustrasi digital semi-realistis** dengan acuan utama foto satelit, bukan gambar kartun generik.

| Unsur | Ketentuan realistis |
|---|---|
| Bangunan | Jejak (footprint), orientasi, ukuran, dan **warna atap** mengikuti satelit (genteng merah-cokelat, seng abu-abu, atap biru, dll.); bentuk atap (limas/pelana) & jumlah lantai dari foto survei untuk kawasan inti |
| Vegetasi | Pohon kelapa, pohon rindang, semak, dan kebun digambar dengan tekstur daun, gradasi cahaya-bayangan, dan kepadatan sesuai satelit |
| Sawah | Petak mengikuti pematang asli; warna sesuai musim tanam yang terlihat di citra (hijau muda, hijau tua, kuning, cokelat bekas panen, tergenang) |
| Hutan & bukit | Kanopi rapat bertekstur; relief bukit dari data ketinggian dengan bayangan lembut |
| Jalan | Lebar, material (aspal/beton/tanah), dan alur sesuai aslinya; marka & tepi jalan |
| Pantai & laut | Warna pasir, pasir basah, buih ombak, dan gradasi kedalaman laut seperti di citra |
| Pencahayaan | Satu arah cahaya konsisten dengan bayangan lembut; detail tekstur halus |
| Warna | Natural seperti satelit tetapi **lebih cerah dan bersih** (sedikit disaturasi-naikkan), selaras dengan brand kit; tanpa garis tepi kartun yang tebal |
| Skala | Proporsi objek sesuai ukuran nyata; boleh sedikit dibesarkan (maks ±1,3×) agar tetap terbaca di HP |

Yang **tidak** dilakukan: menempatkan bangunan/pohon secara acak, membuat jalan/fasilitas yang tidak ada, atau memakai foto satelit mentah sebagai peta.

### 5.2 Luar kawasan mengikuti peta sesungguhnya

Area di sekitar kawasan inti tidak lagi berupa gambaran umum (bercak acak), tetapi **mengikuti tata guna lahan yang sebenarnya**, sehingga pengunjung yang membandingkan dengan pemandangan nyata atau Google Maps merasa petanya "benar".

| Unsur | Digambar sesuai | Sumber acuan |
|---|---|---|
| Jalan | Jalan raya & jalan desa asli (bukan jalan buatan), lebar sesuai kelasnya | OpenStreetMap + citra satelit |
| Sungai | Alur Sungai Cisawarna & anak sungai asli, termasuk muara | Citra satelit |
| Permukiman | Rumah ditempatkan di **sebaran bangunan asli** (bukan acak), mengikuti jalan | Jejak bangunan OpenStreetMap / citra satelit |
| Sawah | Petak sawah di lokasi sawah asli; arah pematang mengikuti pola asli | Citra satelit |
| Hutan & bukit | Batas hutan asli; relief bukit mengikuti kontur ketinggian | Citra satelit + data ketinggian (DEM) |
| Kebun / lahan campuran | Kebun kelapa & lahan campuran di lokasi aslinya | Citra satelit |
| Pantai | Garis pantai, gosong pasir di muara, karang | Citra satelit |

Ketentuan:
- **Gaya tetap ilustrasi** (bukan foto satelit mentah) dengan tingkat realisme seperti §5.1: warna hijau cerah, objek 2.5D, sesuai brand.
- Detail luar kawasan **lebih sederhana** daripada kawasan inti (lebih sedikit orang/kendaraan, objek lebih kecil), agar kawasan inti tetap menonjol.
- Batas penjiplakan: seluas area gambar (±2,4 × 2,5 km di sekitar Pantai Ciantir).
- Data hasil jiplakan disimpan di `data/geografi.json` (lapisan: jalan, sungai, permukiman, sawah, hutan, kebun) agar bisa diperbaiki bila ada yang meleset.
- Hasil dicek dengan menumpuk ilustrasi di atas citra satelit (lapisan Satelit) — jalan, sungai, dan tepi sawah harus berimpit.

## 6. Alur utama

### 6.1 Dibuka dari QR
```
scan QR (…?dari=gerbang)
   → logo memudar (±1 dtk) — peta dimuat di belakang
   → peta tampil, arah 225°, berpusat di lokasi QR, penanda "Anda di sini (Gerbang)"
   → toast singkat: "Ketuk ikon untuk info tempat"
```

### 6.2 Mencari & menghubungi UMKM
```
ketuk chip "Kuliner" → pin kuliner saja yang tampil
   → ketuk pin → pop-up (foto, nama, jam)
   → [WhatsApp] membuka chat dengan pesan awal: "Halo, saya lihat dari Peta Pantai Ciantir…"
```

### 6.3 Mencari homestay
```
ketuk zona Homestay → pop-up zona → [Lihat homestay di VisitSawarna] → visitsawarna.com (tab baru)
```

### 6.4 Keselamatan
```
ketuk tombol keselamatan → panel keselamatan → baca bendera / evakuasi → [Telepon 115] atau [Tunjukkan jalur evakuasi]
```

### 6.5 Ganti bahasa
```
ketuk ID | EN di header → seluruh teks antarmuka, kategori, label peta & isi info berganti seketika
```

## 7. Konten & aset

### Gaya bahasa
- Mengikuti brand kit: **ramah, singkat, sopan**, informasi praktis lebih dulu.
- Bahasa Inggris ditulis natural, bukan terjemahan kata per kata (mis. "Petunjuk Arah" → "Directions").

### Foto highlight
- **Data contoh:** foto dibuat otomatis berupa **potongan ilustrasi peta** di sekitar lokasi tiap tempat (gaya sama dengan peta), sehingga demo tetap terlihat lengkap.
- **Data asli:** diganti foto hasil survei — rasio 16:9, minimal 800 px lebar, dikompres WebP ±60 KB, tanpa wajah orang yang tidak memberi izin.

### Ikon
- Set ikon garis SVG khusus untuk 7 kategori + tombol (kompas, lokasi, rumah, lapisan, keselamatan, telepon, WhatsApp, bahasa).
- Ketebalan garis seragam, sudut membulat, satu warna (putih di pin, biru tua di tombol).

## 8. Aksesibilitas

- Kontras teks ≥ 4,5:1 (WCAG AA); tidak meletakkan teks putih di atas oranye.
- Target sentuh ≥ 44 px; jarak antar-tombol ≥ 8 px.
- Semua tombol ikon punya label teks tersembunyi (aria-label) dalam bahasa aktif.
- Menghormati pengaturan "kurangi gerakan".
- Informasi tidak hanya dibedakan lewat warna (kategori juga punya ikon & nama).

## 9. Perubahan dari versi sekarang

| Sekarang | Menjadi |
|---|---|
| Header putih dua baris, chip berwarna penuh | Kartu header satu baris + chip putih bergaris dengan titik warna |
| Kotak legenda kiri bawah | Dihapus (chip filter = legenda) |
| Ikon emoji, pin tetesan besar | Ikon garis SVG, pin lingkaran kecil (titik saat zoom jauh) |
| Pop-up tanpa foto (kotak warna + emoji) | Foto highlight (contoh: potongan ilustrasi) |
| Tidak ada info keselamatan khusus | Tombol putih ikon merah + panel keselamatan bersih + nomor darurat |
| Tidak ada pembuka | Logo memudar ±1 detik (sederhana) |
| Satu bahasa | Sakelar ID | EN |
| Tombol 📍 survei selalu tampil | Dipakai selama survei, lalu dihapus |
| Ilustrasi kartun dengan penempatan objek acak | Ilustrasi detail & realistis yang menjiplak citra satelit (§5.1) |
| Luar kawasan krem / perkiraan | Luar kawasan hijau **mengikuti peta sesungguhnya** (jalan, sungai, permukiman, sawah, hutan, bukit asli) |
| Arah awal 0° (utara) | Arah awal 225° (menghadap pantai) |
| Zona homestay tanpa tautan | Tombol ke visitsawarna.com |
| Label zona kapsul penuh warna, label "Samudra Hindia" huruf sambung | Kapsul putih + titik warna; semua label Plus Jakarta Sans |
| Tombol WhatsApp blok hijau, tombol mengambang berwarna-warni | WhatsApp tombol bergaris; semua tombol mengambang putih seragam |
| Kesan kartun taman wisata | **Clean design**: netral, satu aksen biru, banyak ruang kosong |
| Antarmuka polos tanpa karakter tempat | Sentuhan pesisir halus: palet pantai pagi, tepi ombak, tekstur pasir, ikon bahari, gerak riak, ilustrasi garis untuk keadaan kosong (§2.1) |

## 10. Risiko desain

| # | Risiko | Penanganan |
|---|---|---|
| D1 | Menjiplak ribuan bangunan & pohon secara detail butuh waktu besar, sementara rilis 6 Des | Kawasan inti dijiplak manual & detail; luar kawasan memakai data OpenStreetMap + penjiplakan semi-otomatis dari citra satelit |
| D2 | Citra satelit Esri bisa tidak terbaru (bangunan baru belum terlihat) | Lengkapi dengan foto & koordinat hasil survei lapangan |
| D3 | Gaya realistis membuat tile lebih besar | Tetap WebP, kualitas disesuaikan; uji ukuran unduhan awal < 1,5 MB (PRD §8) |
| D4 | Lisensi citra satelit | Citra hanya dipakai sebagai **acuan jiplakan**; yang ditampilkan adalah ilustrasi buatan sendiri (atribusi sumber data tetap dicantumkan) |
