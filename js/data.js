/*
 * Data peta Pantai Ciantir.
 * Koordinat [lat, lng] (WGS84). Teks dwibahasa: kolom biasa = Indonesia, akhiran _en = Inggris.
 * Titik layanan memakai kolom yang sama dengan Google Sheets pokdarwis (docs/PRD.md §7):
 *   id, kategori, nama, nama_en, lat, lng, deskripsi, deskripsi_en, whatsapp, jam, foto, aktif
 * Semua titik di bawah masih DATA CONTOH (contoh: true) sampai survei lapangan.
 * whatsapp: isi HANYA dengan izin pemilik, format 62xxxxxxxxxx.
 */
window.PETA = {
  config: {
    pusat: [-6.9850, 106.3087], // tengah antara dua kawasan (UMKM & Homestay)
    zoomAwal: 17,
    zoomMin: 15, // pulau utuh muat di layar HP
    zoomMaks: 19,
    arahAwal: 225, // menghadap pantai (Barat Daya) — PRD F9
    visitSawarna: "https://visitsawarna.com",
    pesanWhatsApp: {
      id: "Halo, saya lihat {nama} dari Peta Pantai Ciantir. ",
      en: "Hello, I found {nama} on the Pantai Ciantir map. ",
    },
  },

  // Peta ilustrasi: tile WebP hasil tools/gen-ilustrasi.mjs + tools/render-tiles.mjs.
  // Batas HARUS sama dengan data/geografi.json → batasGambar. Zoom 19 hanya ada di kawasan inti.
  ilustrasi: {
    tiles: "assets/tiles/{arah}/{z}/{x}/{y}.webp?v=iso11", // naikkan ?v= setiap tile dirender ulang (hindari cache lama) // satu set per arah pandang (0, 45, … 315)
    batas: [[-6.9960, 106.2960], [-6.9735, 106.3180]],
    marginInti: 0.0015,
  },

  // Label nama tempat di atas ilustrasi. tipe: laut | sungai | alam
  label: [
    { teks: "Pantai Ciantir", teks_en: "Ciantir Beach", lokasi: [-6.985272, 106.308475], tipe: "alam", zoomMin: 18, putar: 58 },
    { teks: "Sungai Cisawarna", teks_en: "Cisawarna River", lokasi: [-6.98064, 106.30797], tipe: "sungai", zoomMin: 17, putar: -2 },
  ],

  // Kategori titik: warna (diredam, DESIGN §2) + ikon garis (js/ikon.js)
  kategori: {
    kuliner:     { label: "Kuliner & UMKM",   label_en: "Food & shops",      ikon: "toko",     warna: "#C9822B" },
    sewa:        { label: "Sewa & Jasa",      label_en: "Rentals",           ikon: "selancar", warna: "#2A8FA5" },
    fasilitas:   { label: "Tiket & Parkir",   label_en: "Tickets & parking", ikon: "tiket",    warna: "#6E5AA8" },
    dasar:       { label: "Toilet & Ibadah",  label_en: "Toilets & prayer",  ikon: "toilet",   warna: "#6B7A8F" },
    keselamatan: { label: "Keselamatan",      label_en: "Safety",            ikon: "pelampung", warna: "#C94545" },
    spot:        { label: "Spot Wisata",      label_en: "Sights",            ikon: "kamera",   warna: "#BF5A8C" },
    info:        { label: "Informasi",        label_en: "Information",       ikon: "info",     warna: "#2F8F74" },
    akses:       { label: "Akses",            label_en: "Access",            ikon: "gerbang",  warna: "#3F6DA6" },
  },

  // Wilayah Ciantir yang ditampilkan sebagai "pulau di atas awan" (ditaksir dari gambar batas yang dikirim pengguna,
  // dicocokkan dengan koordinat Pintu 1, Pintu 2, dan Parkir). Di luar poligon ini peta dikosongkan.
  pulau: [
    [-6.981127, 106.306327], [-6.980937, 106.306276], [-6.980636, 106.306214], [-6.980363, 106.306211],
    [-6.980115, 106.306253], [-6.979835, 106.306301], [-6.97955, 106.306316], [-6.978882, 106.306336],
    [-6.978706, 106.306493], [-6.978615, 106.306632], [-6.978493, 106.306985], [-6.978505, 106.307158],
    [-6.978523, 106.307398], [-6.978563, 106.30763], [-6.978626, 106.307859], [-6.978691, 106.308083],
    [-6.978711, 106.308299], [-6.978714, 106.308522], [-6.97873, 106.308741], [-6.978842, 106.308946],
    [-6.978961, 106.309143], [-6.979083, 106.309332], [-6.979191, 106.309517], [-6.979294, 106.309703],
    [-6.979386, 106.30989], [-6.979517, 106.310061], [-6.979622, 106.310264], [-6.979677, 106.31039],
    [-6.980146, 106.310961], [-6.980365, 106.311017], [-6.98062, 106.310999], [-6.980877, 106.310983],
    [-6.981105, 106.310972], [-6.981327, 106.310946], [-6.98154, 106.310907], [-6.981739, 106.310879],
    [-6.981927, 106.310847], [-6.982105, 106.310815], [-6.982276, 106.310783], [-6.982438, 106.310746],
    [-6.982597, 106.310708], [-6.982751, 106.310667], [-6.982894, 106.310629], [-6.983034, 106.310583],
    [-6.983177, 106.310555], [-6.983315, 106.310538], [-6.983461, 106.310525], [-6.983592, 106.310481],
    [-6.983723, 106.310423], [-6.983858, 106.310367], [-6.983983, 106.310299], [-6.984088, 106.310195],
    [-6.984194, 106.310105], [-6.984306, 106.310029], [-6.984423, 106.309953], [-6.984603, 106.309965],
    [-6.984841, 106.310019], [-6.985131, 106.310083], [-6.985472, 106.31016], [-6.985868, 106.310247],
    [-6.986276, 106.310319], [-6.986436, 106.310141], [-6.986492, 106.309914], [-6.986569, 106.309706],
    [-6.986638, 106.309498], [-6.986681, 106.309288], [-6.986704, 106.309071], [-6.986706, 106.308849],
    [-6.986711, 106.308636], [-6.986729, 106.308429], [-6.986712, 106.308218], [-6.986643, 106.308015],
    [-6.986579, 106.307818], [-6.98652, 106.307623], [-6.986447, 106.307436], [-6.986354, 106.307261],
    [-6.986278, 106.307087], [-6.986219, 106.306909], [-6.986159, 106.306736], [-6.986084, 106.306568],
    [-6.986012, 106.306404], [-6.985924, 106.306245], [-6.985837, 106.306086], [-6.985735, 106.305936],
    [-6.985631, 106.305781], [-6.985523, 106.305643], [-6.985404, 106.305511], [-6.985282, 106.305373],
    [-6.985151, 106.305247], [-6.98502, 106.305123], [-6.98488, 106.305009], [-6.984737, 106.304901],
    [-6.984584, 106.304797], [-6.98443, 106.304697], [-6.984269, 106.304609], [-6.984105, 106.304526],
    [-6.983937, 106.30445], [-6.98376, 106.304381], [-6.983588, 106.30432], [-6.983405, 106.304271],
    [-6.983223, 106.304223], [-6.983034, 106.304191], [-6.982848, 106.304143], [-6.98265, 106.304057],
    [-6.982445, 106.303977], [-6.982217, 106.30394], [-6.98208, 106.304178], [-6.981966, 106.304504],
    [-6.981857, 106.304754], [-6.981761, 106.304967], [-6.98167, 106.305163], [-6.981601, 106.305359],
    [-6.981544, 106.305546], [-6.981496, 106.305722], [-6.98145, 106.305886], [-6.981407, 106.306034],
    [-6.981374, 106.306135],
  ],

  // Batas kawasan inti
  batas: [
    [-6.97896, 106.30762], [-6.97961, 106.31097], [-6.98966, 106.31070],
    [-6.99026, 106.30616], [-6.98270, 106.30231], [-6.98111, 106.30795],
  ],

  // Kawasan: tampil sebagai satu marker saat peta jauh; titik di dalam poligonnya muncul saat zoom dekat
  zona: [
    {
      id: "zona-umkm",
      nama: "Kawasan UMKM Pantai", nama_en: "Beach market",
      warna: "#E0674F", ikon: "toko",
      label: [-6.985575, 106.3086], // titik marker kawasan dari Google Maps (dikirim pengguna, 27 Nov 2026)
      deskripsi: "Deretan warung, kuliner laut, sewa papan selancar, dan fasilitas bilas di sepanjang Pantai Ciantir.",
      deskripsi_en: "Food stalls, seafood, surfboard rentals and showers along Ciantir Beach.",
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
      nama: "Kawasan Homestay", nama_en: "Homestay area",
      warna: "#4E9F6A", ikon: "rumah",
      label: [-6.98235, 106.3088],
      tautan: "visitSawarna", // homestay tidak punya pin; arahkan ke visitsawarna.com (PRD F2)
      deskripsi: "Rumah warga yang menyediakan penginapan, 5–10 menit jalan kaki ke pantai.",
      deskripsi_en: "Village homes offering stays, a 5–10 minute walk from the beach.",
      koordinat: [
        [-6.98297, 106.30699], [-6.98174, 106.30809], [-6.98141, 106.30877],
        [-6.98160, 106.30987], [-6.98283, 106.31001], [-6.98392, 106.31001],
        [-6.98474, 106.31042], [-6.98543, 106.30960], [-6.98433, 106.30891],
        [-6.98392, 106.30822], [-6.98379, 106.30767],
      ],
    },
  ],

  // Jalur ke Pantai Ciantir, koordinat dari Google Maps (dikirim pengguna, 27 Nov 2026).
  // jalur  : dari Pintu Masuk Ciantir 1 (khusus motor) lewat jembatan biru.
  // jalur2 : dari Pintu Masuk Ciantir 2 (mobil & motor), lalu belok kanan menyatu dengan jalur 1 di dekat pantai.
  jalur: {
    nama: "Jalur dari Pintu Masuk Ciantir 1", nama_en: "Route from Ciantir Entrance 1",
    koordinat: [
      [-6.979919, 106.310192], [-6.980014, 106.310217], [-6.980147, 106.310253], [-6.980308, 106.310283],
      [-6.980647, 106.310325], [-6.980781, 106.310267], [-6.980928, 106.310247], [-6.981058, 106.310256],
      [-6.981089, 106.310203], [-6.981128, 106.310014], [-6.981244, 106.309961], [-6.981333, 106.309767],
      [-6.981417, 106.309767], [-6.981492, 106.309786], [-6.981575, 106.309747], [-6.981675, 106.309778],
      [-6.981822, 106.309831], [-6.981956, 106.309858], [-6.982067, 106.309892], [-6.982158, 106.30985],
      [-6.982242, 106.309789], [-6.982317, 106.309786], [-6.982467, 106.309783], [-6.982494, 106.309594],
      [-6.982731, 106.309589], [-6.983281, 106.309575], [-6.983367, 106.309572], [-6.983728, 106.309547],
      [-6.983939, 106.309364], [-6.984333, 106.309331], [-6.984522, 106.309231], [-6.985236, 106.308811],
    ],
  },
  jalur2: {
    nama: "Jalur dari Pintu Masuk Ciantir 2", nama_en: "Route from Ciantir Entrance 2",
    koordinat: [
      [-6.978961, 106.306647], [-6.979311, 106.306611], [-6.980589, 106.306683], [-6.9809, 106.306725],
      [-6.981189, 106.306778], [-6.981489, 106.306844], [-6.981933, 106.306994], [-6.982156, 106.307203],
      [-6.982492, 106.307528], [-6.982711, 106.307656], [-6.983006, 106.307919], [-6.983303, 106.308194],
      [-6.98375, 106.308628], [-6.983986, 106.308783], [-6.984242, 106.308964], [-6.984486, 106.309228],
      [-6.984522, 106.309231], [-6.985236, 106.308811],
    ],
  },
  // Jembatan biru (rangka busur) menurut OpenStreetMap; dilalui jalur 1
  jembatan: [[-6.980036, 106.310231], [-6.980329, 106.310302]],

  // Info keselamatan statis (PRD F4). Nomor lokal = contoh sampai survei.
  keselamatan: {
    bendera: [
      { warna: "#2E8B57", nama: "Hijau", nama_en: "Green", arti: "Laut relatif tenang. Tetap berenang di area yang diawasi.", arti_en: "Calm water. Still swim only where lifeguards watch." },
      { warna: "#E0B21B", nama: "Kuning", nama_en: "Yellow", arti: "Hati-hati, ombak atau arus sedang. Jangan berenang terlalu jauh.", arti_en: "Take care, moderate waves or currents. Stay close to shore." },
      { warna: "#C94545", nama: "Merah", nama_en: "Red", arti: "Berbahaya. Dilarang berenang.", arti_en: "Dangerous. No swimming." },
    ],
    arusBalik: "Arus balik (rip current) sering muncul di sela ombak. Jika terseret, jangan melawan arus: berenanglah sejajar pantai, lalu kembali ke darat.",
    arusBalik_en: "Rip currents often form between breaking waves. If caught, don't fight it: swim parallel to the shore, then back to land.",
    evakuasi: {
      teks: "Saat peringatan tsunami atau gempa kuat, segera menjauh dari pantai lewat jalur utama menuju titik kumpul di dataran tinggi.",
      teks_en: "After a tsunami warning or strong earthquake, leave the beach at once along the main path to the assembly point on higher ground.",
      titikKumpul: [-6.98200, 106.30985],
      jalur: [
        [-6.98650, 106.30880], [-6.98496, 106.30830], [-6.98474, 106.30850], [-6.98392, 106.30877],
        [-6.98256, 106.30932], [-6.98200, 106.30985],
      ],
    },
    nomor: [
      { nama: "Panggilan darurat", nama_en: "Emergency", nomor: "112" },
      { nama: "Basarnas (SAR laut)", nama_en: "Search & rescue (Basarnas)", nomor: "115" },
      { nama: "Ambulans", nama_en: "Ambulance", nomor: "119" },
      { nama: "Polisi", nama_en: "Police", nomor: "110" },
      { nama: "Pemadam kebakaran", nama_en: "Fire brigade", nomor: "113" },
      { nama: "Pos Balawista Ciantir", nama_en: "Ciantir lifeguard post", nomor: "", contoh: true },
      { nama: "Puskesmas terdekat", nama_en: "Nearest clinic", nomor: "", contoh: true },
    ],
  },

  // Titik layanan (data contoh). Homestay tidak diberi pin — lihat zona-homestay.
  titik: [
    // Koordinat pintu masuk dari Google Maps (dikirim pengguna, 27 Nov 2026). Loket tiket berada di titik Pintu 1.
    { id: "pintu-masuk", kategori: "akses", nama: "Pintu Masuk Ciantir 1 & Loket Tiket", nama_en: "Ciantir Entrance 1 & ticket booth", lat: -6.979842, lng: 106.310189, jam: "24 jam",
      deskripsi: "Khusus motor, lewat jembatan biru. Bayar retribusi masuk di loket di sini.", deskripsi_en: "Motorbikes only, across the blue bridge. Pay the entrance fee at the booth here.", contoh: true, aktif: true },
    { id: "parkir-wisata", kategori: "fasilitas", nama: "Parkir Wisata Pantai Ciantir", nama_en: "Ciantir Beach visitor parking", lat: -6.980319, lng: 106.306825, jam: "24 jam",
      deskripsi: "Tempat parkir mobil dan motor di jalur dari Pintu Masuk Ciantir 2.", deskripsi_en: "Car and motorbike parking on the route from Ciantir Entrance 2.", contoh: true, aktif: true },
    { id: "pintu-masuk-2", kategori: "akses", nama: "Pintu Masuk Ciantir 2", nama_en: "Ciantir Entrance 2", lat: -6.978961, lng: 106.306647, jam: "24 jam",
      deskripsi: "Bisa dilalui mobil dan motor.", deskripsi_en: "Open to cars and motorbikes.", contoh: true, aktif: true },
    { id: "warung-seafood", kategori: "kuliner", nama: "Warung Seafood Bu Ani", nama_en: "Bu Ani's Seafood", lat: -6.98532, lng: 106.30844, jam: "08.00–21.00", whatsapp: "",
      deskripsi: "Ikan dan cumi bakar segar hasil tangkapan nelayan setempat.", deskripsi_en: "Fresh grilled fish and squid from local fishermen.", contoh: true, aktif: true },
    { id: "warung-kelapa", kategori: "kuliner", // di luar wilayah Ciantir (pulau) → tidak ditampilkan
      nama: "Kelapa Muda Pak Udin", nama_en: "Pak Udin's Coconuts", lat: -6.98719, lng: 106.30926, jam: "07.00–18.30", whatsapp: "",
      deskripsi: "Kelapa muda dan gorengan sambil menunggu matahari terbenam.", deskripsi_en: "Young coconuts and fritters while you wait for sunset.", contoh: true, aktif: false },
    { id: "oleh-oleh", kategori: "kuliner", nama: "Oleh-oleh Khas Sawarna", nama_en: "Sawarna Souvenirs", lat: -6.98620, lng: 106.30905, jam: "08.00–20.00", whatsapp: "",
      deskripsi: "Keripik, ikan asin, dan kerajinan tangan warga.", deskripsi_en: "Chips, salted fish and local handicrafts.", contoh: true, aktif: true },
    { id: "kopi-pantai", kategori: "kuliner", nama: "Kopi Pantai Ciantir", nama_en: "Ciantir Beach Coffee", lat: -6.98380, lng: 106.30700, jam: "07.00–22.00", whatsapp: "",
      deskripsi: "Kopi tubruk dan mi rebus dengan pemandangan laut.", deskripsi_en: "Local coffee and noodles with a sea view.", contoh: true, aktif: true },
    { id: "sewa-surfing", kategori: "sewa", nama: "Sewa Papan Selancar Ciantir", nama_en: "Ciantir Surf Rental", lat: -6.98478, lng: 106.30775, jam: "07.00–17.00", whatsapp: "",
      deskripsi: "Papan selancar, bodyboard, dan instruktur lokal.", deskripsi_en: "Surfboards, bodyboards and local instructors.", contoh: true, aktif: true },
    { id: "kamar-bilas", kategori: "dasar", nama: "Toilet & Kamar Bilas", nama_en: "Toilets & showers", lat: -6.98599, lng: 106.30871, jam: "06.00–19.00",
      deskripsi: "Toilet umum dan kamar bilas air tawar.", deskripsi_en: "Public toilets and freshwater showers.", contoh: true, aktif: true },
    // Koordinat masjid, TIC, dan Pantai Ciantir dari Google Maps (dikirim pengguna, 27 Nov 2026)
    { id: "masjid", kategori: "dasar", nama: "Masjid", nama_en: "Mosque", lat: -6.984608, lng: 106.308764, jam: "24 jam",
      deskripsi: "Masjid dengan tempat wudu, dekat pantai.", deskripsi_en: "Mosque with an ablution area, near the beach.", contoh: true, aktif: true },
    { id: "tic", kategori: "info", nama: "Gedung TIC (Tourists International Center)", nama_en: "TIC building (Tourists International Center)", lat: -6.984636, lng: 106.309047,
      deskripsi: "Pusat informasi wisata: tanya rute, keselamatan, dan layanan di Pantai Ciantir.", deskripsi_en: "Visitor information centre: ask about routes, safety and services at Ciantir Beach.", contoh: true, aktif: true },
    { id: "pos-balawista", kategori: "keselamatan", nama: "Pos Balawista", nama_en: "Lifeguard post", lat: -6.98505, lng: 106.30734, jam: "07.00–17.00",
      deskripsi: "Pos penjaga pantai. Laporkan keadaan darurat di sini.", deskripsi_en: "Lifeguard post. Report emergencies here.", contoh: true, aktif: true },
    { id: "titik-kumpul", kategori: "keselamatan", nama: "Titik Kumpul Evakuasi", nama_en: "Evacuation assembly point", lat: -6.98200, lng: 106.30985,
      deskripsi: "Tujuan evakuasi saat peringatan tsunami. Tunggu di sini sampai ada pengumuman aman.", deskripsi_en: "Go here after a tsunami warning. Wait until it is declared safe.", contoh: true, aktif: true },
    { id: "spot-surfing", kategori: "spot", nama: "Spot Selancar Ciantir", nama_en: "Ciantir Surf Break", lat: -6.98532, lng: 106.30584, jam: "Pagi, April–Oktober",
      deskripsi: "Ombak konsisten yang diminati peselancar. Waspadai arus balik.", deskripsi_en: "Consistent waves popular with surfers. Watch for rip currents.", contoh: true, aktif: true },
    { id: "spot-sunset", kategori: "spot", nama: "Spot Matahari Terbenam", nama_en: "Sunset spot", lat: -6.98204, lng: 106.30542, jam: "17.15–18.00",
      deskripsi: "Pasir landai menghadap barat, tempat terbaik melihat senja.", deskripsi_en: "Wide west-facing sand, the best place to watch the sunset.", contoh: true, aktif: true },
  ],

  // Kode titik QR (?dari=...) → id titik tempat QR dipasang
  qr: { gerbang: "pintu-masuk", loket: "pintu-masuk", gerbang2: "pintu-masuk-2", umkm: "warung-seafood", balawista: "pos-balawista" },
};
