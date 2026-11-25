(function () {
  const { config, kategori, batas, zona, jalur, titik } = window.PETA;

  // ---------- Peta dasar ----------
  const batasBounds = L.latLngBounds(batas).pad(0.15);
  const layarKecil = window.innerWidth < 768;
  const zoomAwal = layarKecil ? config.zoomAwal - 0.5 : config.zoomAwal;
  const map = L.map("map", {
    center: config.pusat,
    zoom: zoomAwal,
    zoomSnap: 0.5,
    minZoom: config.zoomMin,
    maxZoom: config.zoomMaks,
    maxBounds: batasBounds,
    maxBoundsViscosity: 1.0,
    zoomControl: false,
  });
  L.control.zoom({ position: "bottomright" }).addTo(map);

  const satelit = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxZoom: 19, attribution: "Citra &copy; Esri" }
  ).addTo(map);
  const jalan = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  });

  // ---------- Batas, zona, jalur ----------
  const lapisBatas = L.polygon(batas, {
    color: "#facc15", weight: 3, fill: false, dashArray: "8 6", interactive: false,
  }).addTo(map);

  const lapisZona = L.layerGroup().addTo(map);
  const poligonZona = {};
  zona.forEach((z) => {
    const p = L.polygon(z.koordinat, {
      color: z.warna, weight: 2.5, fillColor: z.warna, fillOpacity: 0.22,
    });
    p.on("mouseover", () => p.setStyle({ fillOpacity: 0.38 }));
    p.on("mouseout", () => p.setStyle({ fillOpacity: 0.22 }));
    p.bindPopup(() => buatPopupZona(z, ringkasZona(z)), { className: "popup-zona", maxWidth: 280 });
    p.bindTooltip(z.nama, { sticky: true, className: "tip-zona" });
    p.addTo(lapisZona);
    poligonZona[z.id] = p;
  });

  const lapisJalur = L.polyline(jalur.koordinat, {
    color: "#3b82f6", weight: 5, opacity: 0.9, lineCap: "round",
  })
    .bindTooltip(`🚶 ${jalur.nama}<br><small>${jalur.keterangan}</small>`, { sticky: true })
    .addTo(map);

  L.control
    .layers(
      { "🛰️ Satelit": satelit, "🗺️ Peta jalan": jalan },
      { "Zona kawasan": lapisZona, "Jalur utama": lapisJalur, "Batas kawasan": lapisBatas },
      { position: "topright", collapsed: true }
    )
    .addTo(map);

  // ---------- Marker titik layanan ----------
  const ikonPin = (k) =>
    L.divIcon({
      className: "pin",
      html: `<div class="pin-body" style="--c:${k.warna}"><span>${k.ikon}</span></div>`,
      iconSize: [34, 42],
      iconAnchor: [17, 40],
      popupAnchor: [0, -38],
    });

  const grupKategori = {};
  Object.keys(kategori).forEach((id) => (grupKategori[id] = L.layerGroup().addTo(map)));

  titik.forEach((t) => {
    const k = kategori[t.kategori];
    if (!k) return console.warn("Kategori tidak dikenal:", t);
    L.marker(t.lokasi, { icon: ikonPin(k), title: t.nama, riseOnHover: true })
      .bindPopup(() => buatPopupTitik(t, k), { maxWidth: 300, minWidth: 260, className: "popup-titik", autoPanPadding: [20, 80] })
      .addTo(grupKategori[t.kategori]);
  });

  // ---------- Ringkasan zona (titik di dalam poligon) ----------
  function diDalam([lat, lng], poly) {
    let masuk = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [yi, xi] = poly[i], [yj, xj] = poly[j];
      if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) masuk = !masuk;
    }
    return masuk;
  }
  function ringkasZona(z) {
    const hitung = {};
    titik.forEach((t) => { if (diDalam(t.lokasi, z.koordinat)) hitung[t.kategori] = (hitung[t.kategori] || 0) + 1; });
    return Object.entries(hitung).map(([id, jumlah]) => ({ ...kategori[id], id, jumlah }));
  }

  // ---------- Filter kategori ----------
  const aktif = new Set(Object.keys(kategori));
  const elFilter = document.getElementById("filter");
  const jumlahPerKategori = titik.reduce((a, t) => ((a[t.kategori] = (a[t.kategori] || 0) + 1), a), {});

  elFilter.innerHTML =
    `<button class="chip semua" data-kat="*">Semua</button>` +
    Object.entries(kategori)
      .filter(([id]) => jumlahPerKategori[id])
      .map(([id, k]) =>
        `<button class="chip" data-kat="${id}" style="--c:${k.warna}"><span class="dot"></span>${k.ikon} ${k.label}<span class="n">${jumlahPerKategori[id]}</span></button>`)
      .join("");

  function terapkanFilter() {
    Object.entries(grupKategori).forEach(([id, g]) => (aktif.has(id) ? map.addLayer(g) : map.removeLayer(g)));
    elFilter.querySelectorAll(".chip[data-kat]").forEach((b) => {
      const id = b.dataset.kat;
      b.classList.toggle("on", id === "*" ? aktif.size === Object.keys(kategori).length : aktif.has(id));
    });
  }
  function setFilter(ids) {
    aktif.clear();
    ids.forEach((i) => aktif.add(i));
    terapkanFilter();
  }
  elFilter.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    const id = b.dataset.kat;
    const semua = Object.keys(kategori);
    if (id === "*") return setFilter(semua);
    // Klik pertama saat semua aktif = fokus ke satu kategori; berikutnya = toggle
    if (aktif.size === semua.length) setFilter([id]);
    else {
      aktif.has(id) ? aktif.delete(id) : aktif.add(id);
      if (!aktif.size) semua.forEach((i) => aktif.add(i));
      terapkanFilter();
    }
  });
  terapkanFilter();

  // Tombol "Tampilkan layanan di zona ini" di dalam pop-up zona
  // (capture phase: Leaflet menghentikan propagasi klik dari dalam pop-up)
  map.getContainer().addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fokus-zona]");
    if (!btn) return;
    const z = zona.find((x) => x.id === btn.dataset.fokusZona);
    const ids = ringkasZona(z).map((r) => r.id);
    setFilter(ids.length ? ids : z.kategori);
    map.closePopup();
    map.flyToBounds(poligonZona[z.id].getBounds(), { padding: [30, 30], duration: 0.6 });
    toast(`Menampilkan layanan di ${z.nama}`);
  }, true);

  // ---------- Legenda zona ----------
  document.getElementById("legend").innerHTML =
    zona.map((z) => `<div><span class="sw" style="--c:${z.warna}"></span>${z.nama}</div>`).join("") +
    `<div><span class="sw line" style="--c:#3b82f6"></span>${jalur.nama}</div>` +
    `<div><span class="sw dash" style="--c:#facc15"></span>Batas kawasan</div>`;

  // ---------- Toast ----------
  const elToast = document.getElementById("toast");
  let tToast;
  function toast(msg) {
    elToast.textContent = msg;
    elToast.classList.add("show");
    clearTimeout(tToast);
    tToast = setTimeout(() => elToast.classList.remove("show"), 2800);
  }

  // ---------- Tombol aksi ----------
  document.getElementById("btn-reset").addEventListener("click", () => {
    map.flyTo(config.pusat, zoomAwal, { duration: 0.6 });
  });

  // Lokasi saya
  let posMarker, posAkurasi, lacak = false;
  const btnLokasi = document.getElementById("btn-lokasi");
  btnLokasi.addEventListener("click", () => {
    if (lacak) {
      map.stopLocate();
      lacak = false;
      btnLokasi.classList.remove("active");
      posMarker && map.removeLayer(posMarker);
      posAkurasi && map.removeLayer(posAkurasi);
      posMarker = posAkurasi = null;
      return;
    }
    lacak = true;
    btnLokasi.classList.add("active");
    toast("Mencari lokasi Anda…");
    map.locate({ watch: true, enableHighAccuracy: true });
  });
  let pertama = true;
  map.on("locationfound", (e) => {
    if (!posMarker) {
      posMarker = L.marker(e.latlng, {
        icon: L.divIcon({ className: "me", html: '<div class="me-dot"></div>', iconSize: [20, 20] }),
        zIndexOffset: 1000,
      }).bindTooltip("Anda di sini", { direction: "top", offset: [0, -10] }).addTo(map);
      posAkurasi = L.circle(e.latlng, { radius: e.accuracy, color: "#2563eb", weight: 1, fillOpacity: 0.1, interactive: false }).addTo(map);
    } else {
      posMarker.setLatLng(e.latlng);
      posAkurasi.setLatLng(e.latlng).setRadius(e.accuracy);
    }
    if (pertama) {
      pertama = false;
      if (L.latLngBounds(batas).contains(e.latlng)) map.flyTo(e.latlng, 18);
      else toast("Anda berada di luar kawasan Pantai Ciantir");
    }
  });
  map.on("locationerror", () => {
    toast("Lokasi tidak bisa diakses. Pastikan GPS & izin lokasi aktif.");
    lacak = false;
    pertama = true;
    btnLokasi.classList.remove("active");
  });

  // Mode ambil koordinat (untuk survei / input data)
  let modeKoordinat = false;
  const btnKoor = document.getElementById("btn-koordinat");
  btnKoor.addEventListener("click", () => {
    modeKoordinat = !modeKoordinat;
    btnKoor.classList.toggle("active", modeKoordinat);
    map.getContainer().classList.toggle("picking", modeKoordinat);
    toast(modeKoordinat ? "Klik peta untuk menyalin koordinat" : "Mode koordinat mati");
  });
  map.on("click", (e) => {
    if (!modeKoordinat) return;
    const teks = `[${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}]`;
    L.popup({ className: "popup-koor" })
      .setLatLng(e.latlng)
      .setContent(`<code>${teks}</code><br><small>Disalin ke clipboard</small>`)
      .openOn(map);
    navigator.clipboard?.writeText(teks).catch(() => {});
  });
})();
