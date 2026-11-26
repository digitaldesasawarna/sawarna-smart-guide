/*
 * Teks antarmuka dwibahasa (Indonesia / English).
 * Bahasa awal mengikuti bahasa HP; pilihan pengguna disimpan di perangkat.
 */
(function () {
  const TEKS = {
    id: {
      judul: "Pantai Ciantir",
      bahasa: "Bahasa",
      semua: "Semua",
      filter: "Saring tempat",
      arah: "Petunjuk Arah",
      whatsapp: "WhatsApp",
      waContoh: "Nomor WhatsApp diisi setelah survei lapangan",
      buka: "Buka",
      dataContoh: "Data contoh",
      keselamatan: "Info keselamatan",
      kompas: "Arah pandang peta",
      lokasi: "Lokasi saya",
      jumlahTempat: "{n} tempat",
      perbesar: "Perbesar",
      perkecil: "Perkecil",
      tutup: "Tutup",
      arahPandang: "Arah pandang",
      menghadap: "Menghadap {x}",
      arahNama: ["Utara", "Timur Laut", "Timur", "Tenggara", "Selatan", "Barat Daya", "Barat", "Barat Laut"],
      arahSingkat: ["U", "TL", "T", "TG", "S", "BD", "B", "BL"],
      putarKiri: "Putar 45° ke kiri",
      putarKanan: "Putar 45° ke kanan",
      tipsArah: "Pilih arah pandang untuk melihat kawasan dari sisi lain. Ketuk dua kali tombol kompas untuk kembali ke tampilan awal.",
      lokasiCari: "Mencari lokasi Anda…",
      lokasiLuar: "Anda berada di luar kawasan Pantai Ciantir",
      lokasiGagal: "Lokasi tidak terbaca. Aktifkan GPS dan izinkan akses lokasi.",
      andaDiSini: "Anda di sini",
      zonaUmkm: "Tampilkan UMKM di zona ini",
      zonaHomestay: "Lihat homestay di VisitSawarna",
      menampilkan: "Menampilkan {x}",
      offline: "Offline",
      offlinePesan: "Sinyal surut? Peta tetap bisa dipakai.",
      onlinePesan: "Tersambung kembali",
      keselamatanJudul: "Keselamatan di pantai",
      benderaJudul: "Arti bendera pantai",
      arusJudul: "Arus balik",
      evakuasiJudul: "Evakuasi tsunami",
      tunjukkan: "Tunjukkan jalur di peta",
      evakuasiTampil: "Jalur evakuasi ditampilkan. Ikuti ke titik kumpul.",
      titikKumpul: "Titik kumpul",
      nomorJudul: "Nomor darurat",
      telepon: "Telepon {x}",
      nomorMenyusul: "Nomor menyusul",
      koordinat: "Ambil koordinat (survei)",
      koordinatAktif: "Ketuk peta untuk menyalin koordinat",
      koordinatMati: "Mode koordinat mati",
      koordinatDisalin: "Koordinat disalin",
      memuat: "Memuat peta",
    },
    en: {
      judul: "Ciantir Beach",
      bahasa: "Language",
      semua: "All",
      filter: "Filter places",
      arah: "Directions",
      whatsapp: "WhatsApp",
      waContoh: "WhatsApp number will be added after the field survey",
      buka: "Open",
      dataContoh: "Sample data",
      keselamatan: "Safety info",
      kompas: "Map orientation",
      lokasi: "My location",
      jumlahTempat: "{n} places",
      perbesar: "Zoom in",
      perkecil: "Zoom out",
      tutup: "Close",
      arahPandang: "View direction",
      menghadap: "Facing {x}",
      arahNama: ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest"],
      arahSingkat: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
      putarKiri: "Rotate 45° left",
      putarKanan: "Rotate 45° right",
      tipsArah: "Pick a view direction to see the area from another side. Double-tap the compass to reset the view.",
      lokasiCari: "Finding your location…",
      lokasiLuar: "You're outside the Ciantir Beach area",
      lokasiGagal: "Can't read your location. Turn on GPS and allow location access.",
      andaDiSini: "You are here",
      zonaUmkm: "Show shops in this area",
      zonaHomestay: "Browse homestays on VisitSawarna",
      menampilkan: "Showing {x}",
      offline: "Offline",
      offlinePesan: "Lost signal? The map still works.",
      onlinePesan: "Back online",
      keselamatanJudul: "Beach safety",
      benderaJudul: "Beach flags",
      arusJudul: "Rip currents",
      evakuasiJudul: "Tsunami evacuation",
      tunjukkan: "Show route on map",
      evakuasiTampil: "Evacuation route shown. Follow it to the assembly point.",
      titikKumpul: "Assembly point",
      nomorJudul: "Emergency numbers",
      telepon: "Call {x}",
      nomorMenyusul: "Number coming soon",
      koordinat: "Pick coordinates (survey)",
      koordinatAktif: "Tap the map to copy coordinates",
      koordinatMati: "Coordinate mode off",
      koordinatDisalin: "Coordinates copied",
      memuat: "Loading map",
    },
  };

  let bahasa = "id";
  try { bahasa = localStorage.getItem("sw-bahasa") || ""; } catch {}
  if (bahasa !== "id" && bahasa !== "en") bahasa = (navigator.language || "id").toLowerCase().startsWith("id") ? "id" : "en";

  const pendengar = [];
  window.I18N = {
    get bahasa() { return bahasa; },
    set(b) {
      if (b === bahasa || !TEKS[b]) return;
      bahasa = b;
      try { localStorage.setItem("sw-bahasa", b); } catch {}
      document.documentElement.lang = b;
      pendengar.forEach((f) => f(b));
    },
    onChange(f) { pendengar.push(f); },
    // teks antarmuka
    t(kunci, vars) {
      let s = TEKS[bahasa][kunci] ?? TEKS.id[kunci] ?? kunci;
      if (vars && typeof s === "string") for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
      return s;
    },
    // teks dari data: kolom biasa (ID) atau kolom _en
    d(obj, kolom) {
      if (!obj) return "";
      return (bahasa === "en" && obj[kolom + "_en"]) || obj[kolom] || "";
    },
  };
  document.documentElement.lang = bahasa;
})();
