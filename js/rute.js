/*
 * "Cara ke Sawarna" — panduan rute dari kota asal ke tiap tempat wisata.
 * Sumber: keterangan warga setempat (survei KKN, November 2026). Waktu & ongkos adalah PERKIRAAN;
 * periksa ulang sebelum rilis dan perbarui kolom `diperbarui`.
 * Teks dwibahasa: kolom biasa = Indonesia, akhiran _en = Inggris.
 * Deskripsi wisata: draf, perlu diperiksa tim/pokdarwis. Koordinat wisata: OpenStreetMap kecuali ditandai; `null` = belum ada → Google Maps mencari nama tempat.
 */
window.RUTE = {
  diperbarui: "2026-11-28",

  // ---------------------------------------------------------------- kota asal → Desa Sawarna
  asal: [
    {
      id: "jakarta", nama: "Jakarta", nama_en: "Jakarta",
      catatan: "Dari Bekasi, Tangerang, atau Serang, ikuti rute tol yang sama menuju Tol Serang–Rangkasbitung.",
      catatan_en: "From Bekasi, Tangerang or Serang, take the same toll route towards the Serang–Rangkasbitung toll road.",
      pribadi: {
        rute: "Tol Serang–Rangkasbitung, keluar di Rangkasbitung → Gunung Kencana → Malingping → Bayah → Sawarna. Jalan aspal mulus dan relatif stabil.",
        rute_en: "Serang–Rangkasbitung toll road, exit at Rangkasbitung → Gunung Kencana → Malingping → Bayah → Sawarna. Smooth, fairly stable asphalt.",
        waktu: "±5 jam · akhir pekan/libur panjang 6–7 jam", waktu_en: "About 5 hours · 6–7 hours on weekends/long holidays",
      },
      umum: [
        {
          judul: "KRL + DAMRI (paling nyaman)", judul_en: "Commuter train + DAMRI (most comfortable)",
          langkah: [
            ["KRL ke Stasiun Rangkasbitung.", "Commuter train (KRL) to Rangkasbitung Station."],
            ["Bus/Elf DAMRI KSPN dari luar Stasiun Rangkasbitung ke Bayah/Sawarna · berangkat 07.30 & 11.30 · ±3–4 jam · Rp60.000.", "DAMRI KSPN bus/minibus from outside Rangkasbitung Station to Bayah/Sawarna · departs 07:30 & 11:30 · about 3–4 hours · IDR 60,000."],
            ["Bila turun di Bayah: ojek atau angkot/Elf arah Cisolok ke Sawarna · 20–30 menit · ojek Rp20.000–30.000.", "If you get off in Bayah: motorbike taxi (ojek) or minibus towards Cisolok to Sawarna · 20–30 min · ojek IDR 20,000–30,000."],
          ],
        },
        {
          judul: "Bus dari Terminal Kalideres", judul_en: "Bus from Kalideres Terminal",
          langkah: [
            ["Bus PO Rudi (Rudi Jaya Kusumah) dari Terminal Kalideres ke Bayah · berangkat pagi–sore · 5–6 jam · Rp100.000–120.000.", "PO Rudi (Rudi Jaya Kusumah) bus from Kalideres Terminal to Bayah · departs morning–afternoon · 5–6 hours · IDR 100,000–120,000."],
            ["Dari Bayah: ojek atau angkot/Elf ke Sawarna · 20–30 menit · ojek Rp20.000–30.000.", "From Bayah: ojek or minibus to Sawarna · 20–30 min · ojek IDR 20,000–30,000."],
          ],
        },
      ],
    },
    {
      id: "rangkasbitung", nama: "Rangkasbitung", nama_en: "Rangkasbitung",
      pribadi: {
        rute: "Rangkasbitung → Gunung Kencana → Malingping → Bayah → Sawarna.",
        rute_en: "Rangkasbitung → Gunung Kencana → Malingping → Bayah → Sawarna.",
        waktu: "±3–4 jam", waktu_en: "About 3–4 hours",
      },
      umum: [
        {
          judul: "DAMRI KSPN atau shuttle", judul_en: "DAMRI KSPN or shuttle",
          langkah: [
            ["Bus/Elf DAMRI KSPN dari luar Stasiun Rangkasbitung · berangkat 07.30 & 11.30 · ±3–4 jam · Rp60.000. Alternatif: shuttle BTM rute Rangkasbitung–Bayah (pesan lewat situs/aplikasi resmi BTM).", "DAMRI KSPN bus/minibus from outside Rangkasbitung Station · departs 07:30 & 11:30 · about 3–4 hours · IDR 60,000. Alternative: BTM shuttle on the Rangkasbitung–Bayah route (book via BTM's official site/app)."],
            ["Dari Bayah: ojek atau angkot/Elf ke Sawarna · 20–30 menit · ojek Rp20.000–30.000.", "From Bayah: ojek or minibus to Sawarna · 20–30 min · ojek IDR 20,000–30,000."],
          ],
        },
      ],
    },
    {
      id: "bogor", nama: "Bogor", nama_en: "Bogor",
      pribadi: {
        rute: "Ciawi → Cikidang/Cibadak → Pelabuhan Ratu → Cisolok → Sawarna. Rawan macet di Cibadak; jalur berkelok tajam.",
        rute_en: "Ciawi → Cikidang/Cibadak → Pelabuhan Ratu → Cisolok → Sawarna. Often congested around Cibadak; sharp bends.",
        waktu: "±4 jam · akhir pekan 5–6 jam", waktu_en: "About 4 hours · 5–6 hours on weekends",
      },
      umum: [
        {
          judul: "Lewat Pelabuhan Ratu", judul_en: "Via Pelabuhan Ratu",
          langkah: [
            ["Elf/L300 atau bus jurusan Bogor–Pelabuhan Ratu dari Terminal Baranangsiang.", "Minibus (Elf/L300) or bus to Pelabuhan Ratu from Baranangsiang Terminal."],
            ["Elf Pelabuhan Ratu–Sawarna · 1–2 rit sehari sekitar 10.00–12.00 · ±1,5–2 jam · Rp25.000–35.000.", "Pelabuhan Ratu–Sawarna minibus · 1–2 trips a day around 10:00–12:00 · about 1.5–2 hours · IDR 25,000–35,000."],
            ["Bila tertinggal: Elf arah Bayah, turun di Simpang Ciawi/Cisolok, lanjut ojek ke Sawarna. Elf umumnya berhenti beroperasi setelah pukul 15.00–16.00.", "If you miss it: minibus towards Bayah, get off at Simpang Ciawi/Cisolok, then ojek to Sawarna. Minibuses usually stop after 15:00–16:00."],
          ],
        },
      ],
    },
    {
      id: "bandung", nama: "Bandung", nama_en: "Bandung",
      pribadi: {
        rute: "Cianjur → Sukabumi → Cibadak → Pelabuhan Ratu → Cisolok → Sawarna.",
        rute_en: "Cianjur → Sukabumi → Cibadak → Pelabuhan Ratu → Cisolok → Sawarna.",
        waktu: "±6–7 jam · libur panjang bisa 8–9 jam (macet di Sukabumi)", waktu_en: "About 6–7 hours · up to 8–9 hours on long holidays (Sukabumi traffic)",
      },
      umum: [
        {
          judul: "Bus + Elf lewat Sukabumi", judul_en: "Bus + minibus via Sukabumi",
          langkah: [
            ["Bus Bandung–Sukabumi (mis. MGI).", "Bus from Bandung to Sukabumi (e.g. MGI)."],
            ["Bus Sukabumi–Pelabuhan Ratu.", "Bus from Sukabumi to Pelabuhan Ratu."],
            ["Elf Pelabuhan Ratu–Sawarna · 1–2 rit sehari sekitar 10.00–12.00 · ±1,5–2 jam · Rp25.000–35.000 (bila tertinggal: Elf arah Bayah, turun di Simpang Ciawi/Cisolok, lanjut ojek).", "Pelabuhan Ratu–Sawarna minibus · 1–2 trips a day around 10:00–12:00 · about 1.5–2 hours · IDR 25,000–35,000 (if you miss it: minibus towards Bayah, get off at Simpang Ciawi/Cisolok, then ojek)."],
          ],
        },
      ],
    },
    {
      id: "pelabuhan-ratu", nama: "Pelabuhan Ratu", nama_en: "Pelabuhan Ratu",
      pribadi: {
        rute: "Pelabuhan Ratu → Cisolok → Sawarna. Isi bensin penuh di SPBU COCO Cisolok.",
        rute_en: "Pelabuhan Ratu → Cisolok → Sawarna. Fill up at the COCO Cisolok petrol station.",
        waktu: "±1,5–2 jam", waktu_en: "About 1.5–2 hours",
      },
      umum: [
        {
          judul: "Elf dari Terminal Pelabuhan Ratu", judul_en: "Minibus from Pelabuhan Ratu Terminal",
          langkah: [
            ["Elf Pelabuhan Ratu–Sawarna · 1–2 rit sehari sekitar 10.00–12.00 · ±1,5–2 jam · Rp25.000–35.000.", "Pelabuhan Ratu–Sawarna minibus · 1–2 trips a day around 10:00–12:00 · about 1.5–2 hours · IDR 25,000–35,000."],
            ["Bila tertinggal: Elf arah Bayah, turun di Simpang Ciawi/Cisolok, lanjut ojek. Elf umumnya berhenti beroperasi setelah pukul 15.00–16.00.", "If you miss it: minibus towards Bayah, get off at Simpang Ciawi/Cisolok, then ojek. Minibuses usually stop after 15:00–16:00."],
          ],
        },
      ],
    },
  ],

  // ---------------------------------------------------------------- hal penting di perjalanan
  peringatan: [
    ["Jalur Cikidang (rute Sukabumi) dan turunan menjelang Cisolok sangat curam. Di perbukitan Gunung Kencana dan Cikidang kabut tebal sering turun sore/malam, penerangan minim, dan rawan longsor saat hujan deras.",
     "The Cikidang road (Sukabumi route) and the descent towards Cisolok are very steep. In the Gunung Kencana and Cikidang hills thick fog often falls in the late afternoon/evening, street lighting is poor, and landslides can happen in heavy rain."],
    ["SPBU terakhir: SPBU COCO Cisolok (lewat Pelabuhan Ratu) atau SPBU di Kota Bayah (lewat Malingping). Di Sawarna hanya ada bensin eceran.",
     "Last petrol stations: COCO Cisolok (via Pelabuhan Ratu) or in Bayah town (via Malingping). Sawarna only has small roadside fuel sellers."],
    ["Mobil pribadi, SUV, dan minibus (Hiace/Elf) bisa sampai parkir utama desa. Bus pariwisata besar tidak bisa masuk desa (jembatan sempit) dan parkir di lapangan/terminal luar di seberang pintu masuk kawasan.",
     "Cars, SUVs and minibuses (Hiace/Elf) can reach the main village car park. Large tour buses cannot enter the village (narrow bridge) and park at the field/terminal outside, across from the area entrance."],
    ["Ojek wisata mangkal di depan lapangan sepak bola desa atau dekat jembatan masuk utama · sekali jalan Rp15.000–25.000 · borongan keliling 4 pantai utama Rp100.000–150.000 per motor seharian.",
     "Tourist ojeks wait in front of the village football field or near the main entrance bridge · one way IDR 15,000–25,000 · full-day tour of the 4 main beaches IDR 100,000–150,000 per motorbike."],
  ],

  // ---------------------------------------------------------------- dari Desa Sawarna ke tiap wisata
  tujuan: [
    {
      id: "ciantir", nama: "Pantai Ciantir", nama_en: "Ciantir Beach", lokasi: [-6.985272, 106.308475],
      deskripsi: "Pantai berpasir putih yang luas dengan ombak favorit peselancar, sekaligus pusat kuliner dan homestay Sawarna.",
      deskripsi_en: "A wide white-sand beach with waves loved by surfers, and the hub of Sawarna's food stalls and homestays.",
      peta: "ciantir", // punya peta detail
      akses: "Mobil tidak bisa masuk (jembatan gantung desa sempit); motor bisa sampai dekat pantai. Jalan kaki dari parkir mobil ±15–20 menit.",
      akses_en: "Cars cannot enter (narrow village suspension bridge); motorbikes can get close to the beach. About 15–20 minutes on foot from the car park.",
      parkir: "Parkir utama desa · motor Rp5.000 · mobil Rp20.000–25.000 per malam.", parkir_en: "Main village car park · motorbike IDR 5,000 · car IDR 20,000–25,000 per night.",
      tiket: "Rp10.000/orang, tiket terusan desa (berlaku juga untuk Tanjung Layar dan Legon Pari), dibayar di pos gerbang utama desa.",
      tiket_en: "IDR 10,000/person, village combined ticket (also valid for Tanjung Layar and Legon Pari), paid at the main village gate.",
      waktu: "", keamanan: "Relatif aman untuk anak dan lansia bila didampingi.", keamanan_en: "Fairly safe for children and older visitors when accompanied.",
      sinyal: "Sinyal cukup baik untuk beberapa operator besar.", sinyal_en: "Signal is fairly good for the major operators.",
    },
    {
      id: "tanjung-layar", nama: "Tanjung Layar", nama_en: "Tanjung Layar", lokasi: [-6.994269, 106.307067],
      deskripsi: "Dua batu karang raksasa menjulang seperti layar kapal, ikon Sawarna. Paling indah dan aman didekati saat air surut di sore hari.",
      deskripsi_en: "Two giant rocks rising like ship sails, Sawarna's icon. Best and safest to approach at low tide in the late afternoon.",
      akses: "Mobil tidak bisa masuk (jembatan gantung desa sempit); motor bisa sampai dekat pantai. Jalan kaki dari parkir mobil ±15–20 menit.",
      akses_en: "Cars cannot enter (narrow village suspension bridge); motorbikes can get close. About 15–20 minutes on foot from the car park.",
      parkir: "Parkir utama desa · motor Rp5.000 · mobil Rp20.000–25.000 per malam.", parkir_en: "Main village car park · motorbike IDR 5,000 · car IDR 20,000–25,000 per night.",
      tiket: "Rp10.000/orang, tiket terusan desa, dibayar di pos gerbang utama desa.", tiket_en: "IDR 10,000/person, village combined ticket, paid at the main village gate.",
      waktu: "Sore hari saat air laut surut: bisa berjalan mendekati batu karang 'layar' dengan aman. Jangan datang saat air pasang karena jalurnya terendam ombak besar.",
      waktu_en: "Late afternoon at low tide, when you can safely walk up to the 'sail' rocks. Avoid high tide: the path is flooded by big waves.",
      keamanan: "", sinyal: "Sinyal cukup baik untuk beberapa operator besar.", sinyal_en: "Signal is fairly good for the major operators.",
    },
    {
      id: "legon-pari", nama: "Pantai Legon Pari", nama_en: "Legon Pari Beach", lokasi: [-6.987852, 106.323781],
      deskripsi: "Teluk yang lebih tenang di timur Sawarna, tempat perahu nelayan bersandar; pemandangan teluk dan karangnya memikat.",
      deskripsi_en: "A calmer bay east of Sawarna where fishing boats moor, with lovely views of the bay and its reefs.",
      akses: "Hanya motor, lewat jalan setapak semen yang sempit dan menanjak di sela rumah warga. Mobil parkir di luar (pemancingan/jalan utama), lalu jalan kaki ±1,5–2 km (30–45 menit). Jembatan semen aksesnya kadang sedang diperbaiki.",
      akses_en: "Motorbikes only, along a narrow, steep concrete path between houses. Cars park outside (fishing pond/main road), then walk about 1.5–2 km (30–45 min). The concrete access bridge is sometimes under repair.",
      parkir: "", tiket: "Rp10.000/orang, tiket terusan desa, dibayar di pos gerbang utama desa.", tiket_en: "IDR 10,000/person, village combined ticket, paid at the main village gate.",
      waktu: "", keamanan: "Jalur licin saat hujan dan banyak semen berlumut; kurang disarankan untuk lansia.", keamanan_en: "Slippery when it rains, with mossy concrete; not recommended for older visitors.",
      sinyal: "Sinyal sangat lemah, sering tidak ada. Simpan peta/rute sebelum berangkat.", sinyal_en: "Very weak or no signal. Save maps/routes before you go.",
    },
    {
      id: "goa-langir", nama: "Pantai Goa Langir", nama_en: "Goa Langir Beach", lokasi: [-6.975127, 106.29043],
      deskripsi: "Pantai dengan goa karang di tebing tepi laut yang bisa dijelajahi saat air surut.",
      deskripsi_en: "A beach with a sea cave in the cliffs that you can explore at low tide.",
      akses: "Mobil dan motor bisa sampai parkir dekat lokasi di tepi jalan raya Sawarna–Bayah; lalu jalan kaki 3–5 menit.",
      akses_en: "Cars and motorbikes can reach the car park by the Sawarna–Bayah main road; then a 3–5 minute walk.",
      parkir: "Motor Rp3.000–5.000 · mobil Rp25.000.", parkir_en: "Motorbike IDR 3,000–5,000 · car IDR 25,000.",
      tiket: "Rp10.000/orang, dibayar di pos masuk Goa Langir.", tiket_en: "IDR 10,000/person, paid at the Goa Langir entrance.",
      waktu: "Bibir pantai dan mulut goa hanya aman dijelajahi saat air surut; saat pasang tinggi ombak bisa sampai ke dinding tebing.",
      waktu_en: "The shore and cave mouth are only safe to explore at low tide; at high tide waves can reach the cliff wall.",
      keamanan: "Relatif aman untuk anak dan lansia bila didampingi.", keamanan_en: "Fairly safe for children and older visitors when accompanied.",
      sinyal: "Sinyal lemah di dalam area goa.", sinyal_en: "Weak signal inside the cave area.",
    },
    {
      id: "karang-bokor", nama: "Pantai Karang Bokor", nama_en: "Karang Bokor Beach", lokasi: [-6.97797, 106.27875], // koordinat dari tim KKN
      deskripsi: "Pantai berkarang besar dengan deburan ombak, di tepi jalan raya Sawarna–Bayah.",
      deskripsi_en: "A beach of big rocks and crashing waves, right by the Sawarna–Bayah road.",
      akses: "Mobil dan motor bisa sampai parkir dekat lokasi di tepi jalan raya Sawarna–Bayah; lalu jalan kaki 3–5 menit.",
      akses_en: "Cars and motorbikes can reach the car park by the Sawarna–Bayah main road; then a 3–5 minute walk.",
      parkir: "Motor Rp3.000–5.000 · mobil Rp25.000.", parkir_en: "Motorbike IDR 3,000–5,000 · car IDR 25,000.",
      tiket: "Rp20.000/orang (dikelola Perhutani, bukan desa).", tiket_en: "IDR 20,000/person (managed by Perhutani, not the village).",
      waktu: "", keamanan: "Relatif aman untuk anak dan lansia bila didampingi.", keamanan_en: "Fairly safe for children and older visitors when accompanied.",
      sinyal: "",
    },
  ],
};
