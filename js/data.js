/*
 * Data peta Pantai Ciantir.
 * Semua koordinat memakai format [lat, lng] (WGS84).
 * Titik layanan di bawah masih DATA CONTOH: ganti dengan hasil survei lapangan.
 * Tips: aktifkan tombol "📍 Ambil koordinat" di peta untuk menyalin koordinat suatu titik.
 */
window.PETA = {
  config: {
    judul: "Peta Pantai Ciantir",
    subjudul: "Desa Sawarna · Lebak, Banten",
    pusat: [-6.9840, 106.3077],
    zoomAwal: 17,
    zoomMin: 16,
    zoomMaks: 19,
  },

  // Peta ilustrasi (dibuat oleh tools/gen-ilustrasi.mjs). Batas HARUS sama dengan data/geografi.json → batasGambar.
  ilustrasi: {
    url: "assets/peta-ilustrasi.svg",
    batas: [[-6.9960, 106.2960], [-6.9735, 106.3180]],
  },

  // Label nama tempat di atas ilustrasi. tipe: laut | sungai | zona | alam
  label: [
    { teks: "Samudra Hindia", lokasi: [-6.9850, 106.3012], tipe: "laut", zoomMin: 16 },
    { teks: "Pantai Ciantir", lokasi: [-6.9857, 106.3083], tipe: "alam", zoomMin: 17.5, putar: 58 },
    { teks: "Sungai Cisawarna", lokasi: [-6.98035, 106.3125], tipe: "sungai", zoomMin: 17, putar: -2 },
    { teks: "Kawasan UMKM Pantai", lokasi: [-6.9876, 106.3085], tipe: "zona", warna: "#E0674F", zoomMin: 16 },
    { teks: "Kawasan Homestay", lokasi: [-6.98235, 106.3088], tipe: "zona", warna: "#4E9F6A", zoomMin: 16 },
    { teks: "Persawahan", lokasi: [-6.9822, 106.3135], tipe: "alam", zoomMin: 17 },
    { teks: "Hutan", lokasi: [-6.9905, 106.3135], tipe: "alam", zoomMin: 17 },
  ],

  // Kategori layanan: warna pin + ikon + label filter
  kategori: {
    homestay:    { label: "Homestay",        ikon: "🏠", warna: "#4E9F6A" },
    kuliner:     { label: "Kuliner",         ikon: "🍜", warna: "#DF9232" },
    sewa:        { label: "Sewa & Jasa",     ikon: "🏄", warna: "#2A9DB5" },
    fasilitas:   { label: "Tiket & Parkir",  ikon: "🎫", warna: "#7A5FB8" },
    dasar:       { label: "Toilet & Ibadah", ikon: "🚻", warna: "#6B7A8F" },
    keselamatan: { label: "Keselamatan",     ikon: "⛑️", warna: "#D64545" },
    spot:        { label: "Spot Wisata",     ikon: "📸", warna: "#D35B9A" },
    akses:       { label: "Akses",           ikon: "🚪", warna: "#4677B4" },
  },

  // Batas kawasan studi (garis kuning)
  batas: [
    [-6.97896, 106.30762], [-6.97961, 106.31097], [-6.98966, 106.31070],
    [-6.99026, 106.30616], [-6.98270, 106.30231], [-6.98111, 106.30795],
  ],

  // Zona berwarna yang bisa diklik
  zona: [
    {
      id: "zona-umkm",
      nama: "Kawasan UMKM Pantai",
      warna: "#E0674F",
      kategori: ["kuliner", "sewa", "dasar"],
      deskripsi: "Deretan warung, kuliner laut, sewa papan surfing, dan fasilitas bilas di sepanjang bibir Pantai Ciantir.",
      koordinat: [
        [-6.98224, 106.30494], [-6.98197, 106.30577], [-6.98304, 106.30693],
        [-6.98395, 106.30775], [-6.98441, 106.30858], [-6.98458, 106.30905],
        [-6.98559, 106.30960], [-6.98666, 106.30953], [-6.98827, 106.31008],
        [-6.98961, 106.31063], [-6.98974, 106.30981], [-6.98800, 106.30899],
        [-6.98666, 106.30816], [-6.98545, 106.30734], [-6.98411, 106.30638],
        [-6.98297, 106.30542],
      ],
    },
    {
      id: "zona-homestay",
      nama: "Kawasan Homestay",
      warna: "#4E9F6A",
      kategori: ["homestay"],
      deskripsi: "Permukiman warga yang menyediakan penginapan, sekitar 5–10 menit jalan kaki ke pantai.",
      koordinat: [
        [-6.98297, 106.30699], [-6.98174, 106.30809], [-6.98141, 106.30877],
        [-6.98160, 106.30987], [-6.98283, 106.31001], [-6.98392, 106.31001],
        [-6.98474, 106.31042], [-6.98543, 106.30960], [-6.98433, 106.30891],
        [-6.98392, 106.30822], [-6.98379, 106.30767],
      ],
    },
  ],

  // Jalur utama (garis biru): pintu masuk → homestay → pantai
  jalur: {
    nama: "Jalur Utama ke Pantai",
    keterangan: "Jalan kaki ± 10 menit dari pintu masuk ke kawasan UMKM pantai.",
    koordinat: [
      [-6.97961, 106.30960], [-6.98010, 106.31001], [-6.98092, 106.30960],
      [-6.98169, 106.30927], [-6.98256, 106.30932], [-6.98392, 106.30877],
      [-6.98474, 106.30850], [-6.98496, 106.30830],
    ],
  },

  /*
   * Titik layanan. Field umum: id, nama, kategori, lokasi, deskripsi, foto (url, opsional), contoh (true = dummy).
   * Field khusus per kategori ada di "info" (lihat js/popup.js untuk cara tampilnya).
   * kontak.wa / kontak.telp: isi HANYA dengan izin pemilik. Format 62xxxxxxxxxx.
   */
  titik: [
    {
      id: "pintu-masuk", nama: "Pintu Masuk Pantai", kategori: "akses",
      lokasi: [-6.97961, 106.30960], contoh: true,
      deskripsi: "Gerbang utama menuju Pantai Ciantir dari arah jalan desa.",
      info: { kondisiJalan: "Jalan cor, bisa dilalui motor", aksesMobil: "Mobil parkir sebelum gerbang", jam: "24 jam" },
    },
    {
      id: "loket-tiket", nama: "Loket Tiket Masuk", kategori: "fasilitas",
      lokasi: [-6.98000, 106.30925], contoh: true,
      deskripsi: "Pembayaran retribusi masuk kawasan wisata.",
      info: { tarif: [["Dewasa", "Rp10.000"], ["Anak-anak", "Rp5.000"]], jam: "06.00–18.00" },
    },
    {
      id: "parkir-motor", nama: "Parkir Motor", kategori: "fasilitas",
      lokasi: [-6.98045, 106.31010], contoh: true,
      deskripsi: "Area parkir motor dekat pintu masuk.",
      info: { tarif: [["Motor", "Rp5.000"]], kapasitas: "± 100 motor", jam: "24 jam" },
    },
    {
      id: "homestay-a", nama: "Homestay Contoh A", kategori: "homestay",
      lokasi: [-6.98205, 106.30930], contoh: true,
      deskripsi: "Rumah warga dengan kamar tamu bersih dan halaman luas.",
      info: { harga: "Rp150.000–250.000 / malam", kamar: 4, fasilitas: ["Kipas angin", "KM dalam", "Parkir motor"], jarakPantai: "± 400 m", pemilik: "Nama pemilik" },
    },
    {
      id: "homestay-b", nama: "Homestay Contoh B", kategori: "homestay",
      lokasi: [-6.98300, 106.30800], contoh: true,
      deskripsi: "Dekat jalur utama, cocok untuk rombongan keluarga.",
      info: { harga: "Rp300.000 / malam", kamar: 6, fasilitas: ["AC", "KM dalam", "Wi-Fi", "Sarapan"], jarakPantai: "± 300 m", pemilik: "Nama pemilik" },
    },
    {
      id: "homestay-c", nama: "Homestay Contoh C", kategori: "homestay",
      lokasi: [-6.98400, 106.30960], contoh: true,
      deskripsi: "Suasana tenang di dekat sawah.",
      info: { harga: "Rp120.000 / malam", kamar: 3, fasilitas: ["Kipas angin", "KM luar"], jarakPantai: "± 350 m", pemilik: "Nama pemilik" },
    },
    {
      id: "warung-seafood", nama: "Warung Seafood Contoh", kategori: "kuliner",
      lokasi: [-6.98532, 106.30844], contoh: true,
      deskripsi: "Ikan dan cumi bakar segar hasil tangkapan nelayan setempat.",
      info: { menu: [["Ikan bakar", "Rp35.000"], ["Cumi goreng", "Rp30.000"], ["Nasi + lalap", "Rp7.000"]], jam: "08.00–21.00" },
    },
    {
      id: "warung-kelapa", nama: "Warung Kelapa Muda Contoh", kategori: "kuliner",
      lokasi: [-6.98719, 106.30926], contoh: true,
      deskripsi: "Kelapa muda dan gorengan sambil menunggu sunset.",
      info: { menu: [["Kelapa muda", "Rp15.000"], ["Mi instan", "Rp10.000"]], jam: "07.00–18.30" },
    },
    {
      id: "sewa-surfing", nama: "Sewa Papan Surfing Contoh", kategori: "sewa",
      lokasi: [-6.98478, 106.30775], contoh: true,
      deskripsi: "Penyewaan papan surfing dan bodyboard, tersedia instruktur lokal.",
      info: { harga: [["Papan surfing", "Rp50.000 / jam"], ["Bodyboard", "Rp25.000 / jam"], ["Instruktur", "Rp150.000 / sesi"]], instruktur: true, jam: "07.00–17.00" },
    },
    {
      id: "kamar-bilas", nama: "Toilet & Kamar Bilas", kategori: "dasar",
      lokasi: [-6.98599, 106.30871], contoh: true,
      deskripsi: "Toilet umum dan kamar bilas air tawar.",
      info: { biaya: "Rp3.000", jam: "06.00–19.00", air: "Air tawar tersedia" },
    },
    {
      id: "mushola", nama: "Mushola", kategori: "dasar",
      lokasi: [-6.98498, 106.30899], contoh: true,
      deskripsi: "Tempat ibadah dengan tempat wudu.",
      info: { biaya: "Gratis", jam: "24 jam", air: "Tempat wudu tersedia" },
    },
    {
      id: "pos-balawista", nama: "Pos Balawista", kategori: "keselamatan",
      lokasi: [-6.98505, 106.30734], contoh: true,
      deskripsi: "Pos penjaga pantai. Laporkan keadaan darurat di sini.",
      info: { bendera: "kuning", jam: "07.00–17.00", catatan: "Berenang hanya di area yang diawasi" },
    },
    {
      id: "titik-kumpul", nama: "Titik Kumpul Evakuasi", kategori: "keselamatan",
      lokasi: [-6.98200, 106.30985], contoh: true,
      deskripsi: "Titik kumpul saat peringatan tsunami. Ikuti jalur menjauhi pantai ke arah dataran tinggi.",
      info: { jam: "Selalu terbuka", catatan: "Jangan kembali ke pantai sebelum ada pengumuman aman" },
    },
    {
      id: "spot-surfing", nama: "Spot Surfing Ciantir", kategori: "spot",
      lokasi: [-6.98532, 106.30584], contoh: true,
      deskripsi: "Ombak Ciantir dikenal konsisten dan diminati peselancar.",
      info: { waktuTerbaik: "Pagi hari, April–Oktober", kesulitan: "Menengah–mahir", catatan: "Waspadai arus balik" },
    },
    {
      id: "spot-sunset", nama: "Spot Sunset", kategori: "spot",
      lokasi: [-6.98204, 106.30542], contoh: true,
      deskripsi: "Pasir landai menghadap barat, cocok untuk foto matahari terbenam.",
      info: { waktuTerbaik: "17.15–18.00", kesulitan: "Mudah", catatan: "Bawa senter untuk jalan pulang" },
    },
  ],
};
