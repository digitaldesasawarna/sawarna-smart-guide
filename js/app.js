/*
 * Sawarna Smart Guide — logika peta (docs/PRD.md F1–F6, F9; docs/DESIGN.md §3–4, §6).
 */
(function () {
  const PETA = window.PETA;
  const { config, kategori, batas, zona, label, ilustrasi, keselamatan } = PETA;
  const titik = PETA.titik.filter((x) => x.aktif !== false);
  const { t, d } = window.I18N;
  const esc = window.escHtml;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ================================================================ peta dasar
  // CRS isometrik per arah pandang (parameter dari js/iso.js, dibuat tools/gen-ilustrasi.mjs)
  const ISO = window.ISO;
  const crsCache = {};
  function crsArah(a) {
    if (crsCache[a]) return crsCache[a];
    const { m: [A, B, C, D, E, F], w, h } = ISO.arah[a];
    const det = A * D - C * B;
    const projection = {
      project(ll) {
        const x = (ll.lng - ISO.barat) * ISO.U;
        const y = (ISO.mercN - Math.log(Math.tan(Math.PI / 4 + (ll.lat * Math.PI) / 360))) * ISO.KY;
        return L.point(A * x + C * y + E, B * x + D * y + F);
      },
      unproject(pt) {
        const X = pt.x - E, Y = pt.y - F;
        const x = (D * X - C * Y) / det, y = (-B * X + A * Y) / det;
        return L.latLng(((2 * Math.atan(Math.exp(ISO.mercN - y / ISO.KY)) - Math.PI / 2) * 180) / Math.PI, x / ISO.U + ISO.barat);
      },
      bounds: L.bounds([0, 0], [w, h]),
    };
    return (crsCache[a] = L.extend({}, L.CRS.Earth, {
      code: "SAWARNA-ISO-" + a, projection, infinite: true,
      transformation: new L.Transformation(1, 0, 1, 0),
      scale: (z) => ISO.S0 * Math.pow(2, z - 18),
      zoom: (sk) => 18 + Math.log(sk / ISO.S0) / Math.LN2,
    }));
  }
  // batas gambar (latlng) untuk arah tertentu: sudut gambar dikembalikan ke latlng
  const batasLatLng = (a, kotak) => {
    const crs = crsArah(a), { w, h } = ISO.arah[a], k = kotak || [0, 0, w, h];
    return L.latLngBounds([[k[0], k[1]], [k[2], k[1]], [k[2], k[3]], [k[0], k[3]]].map(([x, y]) => crs.projection.unproject(L.point(x, y))));
  };
  let arahAktif = config.arahAwal;
  let batasGambar = batasLatLng(arahAktif);
  const layarKecil = innerWidth < 768;
  const zoomAwal = layarKecil ? config.zoomAwal - 1 : config.zoomAwal;
  const norm = (v) => ((Math.round(v) % 360) + 360) % 360;
  const map = L.map("map", {
    center: config.pusat,
    zoom: zoomAwal,
    crs: crsArah(config.arahAwal),
    zoomSnap: 1, // tile ilustrasi hanya ada di zoom bulat (16–19)
    minZoom: config.zoomMin,
    maxZoom: config.zoomMaks,
    maxBounds: batasGambar.pad(0.05),
    maxBoundsViscosity: 1,
    zoomControl: false,
    zoomAnimation: !kurangiGerak,
    fadeAnimation: !kurangiGerak,
    markerZoomAnimation: !kurangiGerak,
  });
  map.attributionControl.setPrefix(false);

  function aturZoomMin() {
    const z = Math.max(config.zoomMin, Math.ceil(map.getBoundsZoom(batasGambar, true)));
    map.setMinZoom(z);
    if (map.getZoom() < z) map.setZoom(z);
  }
  aturZoomMin();
  map.on("resize", aturZoomMin);
  const aturJauh = () => map.getContainer().classList.toggle("jauh", map.getZoom() <= 16);
  map.on("zoomend", aturJauh);
  aturJauh();

  // Marker yang bisa difokus: Enter/Spasi membuka kartunya, diumumkan sebagai tombol (better-accessibility)
  const bisaKeyboard = (mk) => mk.on("add", () => {
    const el = mk.getElement();
    if (!el || el.dataset.kb) return;
    el.dataset.kb = "1";
    el.setAttribute("role", "button");
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mk.fire("click", { latlng: mk.getLatLng() }); }
    });
  });

  // ---------- lapisan ilustrasi (8 arah), satelit, peta jalan
  const opsiTile = { arah: config.arahAwal, noWrap: true, keepBuffer: 4, className: "ilustrasi", attribution: "Ilustrasi © KKN Sawarna · data © kontributor <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>" };
  const tileIlustrasi = [
    L.tileLayer(ilustrasi.tiles, { ...opsiTile, minNativeZoom: 16, maxNativeZoom: 18, maxZoom: 19 }),
    L.tileLayer(ilustrasi.tiles, { ...opsiTile, minZoom: 19, minNativeZoom: 19, maxNativeZoom: 19, maxZoom: 19 }),
  ];
  // zoom 19 hanya dirender untuk kawasan inti
  const aturBatasInti = (a) => { tileIlustrasi[1].options.bounds = batasLatLng(a, ISO.arah[a].inti); };
  aturBatasInti(config.arahAwal);

  // label nama tempat & zona
  const lapisLabel = L.layerGroup();
  function buatLabel() {
    lapisLabel.clearLayers();
    label.forEach((l) => lapisLabel.addLayer(L.marker(l.lokasi, {
      interactive: false, keyboard: false, zoomMin: l.zoomMin || 0,
      icon: L.divIcon({ className: `label-peta label-${l.tipe}`, iconSize: [0, 0],
        html: `<span>${esc(d(l, "teks"))}</span>` }),
    })));
    zona.forEach((z) => lapisLabel.addLayer(bisaKeyboard(L.marker(z.label, {
      interactive: true, keyboard: true, zoomMin: 16, title: d(z, "nama"), alt: d(z, "nama"),
      icon: L.divIcon({ className: "label-peta label-zona", iconSize: [0, 0], html: `<span style="--c:${z.warna}">${esc(d(z, "nama"))}</span>` }),
    }).on("click", () => poligonZona[z.id].openPopup(L.latLng(z.label))))));
    setTimeout(aturLabel);
  }
  function aturLabel() {
    const z = map.getZoom();
    lapisLabel.eachLayer((mk) => mk.getElement() && mk.getElement().classList.toggle("sembunyi", z < mk.options.zoomMin));
  }
  map.on("zoomend", aturLabel);

  const gambar = L.layerGroup([...tileIlustrasi, lapisLabel]).addTo(map);
  const satelit = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Citra © Esri" });
  const jalan = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" });
  const LAPIS = { ilustrasi: gambar, satelit, jalan };
  let lapisKini = "ilustrasi";

  // indikator memuat (garis ombak)
  const elMuat = $("muat");
  let memuat = 0;
  [...tileIlustrasi, satelit, jalan].forEach((tl) => {
    tl.on("loading", () => { memuat++; elMuat.hidden = false; });
    tl.on("load", () => { memuat = Math.max(0, memuat - 1); if (!memuat) elMuat.hidden = true; });
  });

  // ================================================================ zona
  let modeIlustrasi = true;
  const gayaZona = (z, sorot) => modeIlustrasi
    ? { color: "#fff", weight: sorot ? 2.5 : 0, opacity: .9, fillColor: "#fff", fillOpacity: sorot ? .14 : 0 }
    : { color: z.warna, weight: 2, opacity: 1, fillColor: z.warna, fillOpacity: sorot ? .3 : .16 };
  const poligonZona = {};
  const lapisZona = L.layerGroup().addTo(map);
  const opsiPopup = { className: "popup-kartu", maxWidth: 300, minWidth: 240, autoPanPaddingTopLeft: [16, 130], autoPanPaddingBottomRight: [72, 24] };
  zona.forEach((z) => {
    const p = L.polygon(z.koordinat, gayaZona(z, false)).addTo(lapisZona);
    p.on("mouseover", () => p.setStyle(gayaZona(z, true)));
    p.on("mouseout", () => p.setStyle(gayaZona(z, false)));
    p.bindPopup(() => buatPopupZona(z), opsiPopup);
    poligonZona[z.id] = p;
  });

  // ================================================================ pin titik
  const ikonPin = (k) => L.divIcon({
    className: "pin", iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
    html: `<div class="pin-bulat" style="--c:${k.warna}">${ikon(k.ikon)}</div>`,
  });
  const grupKategori = {};
  Object.keys(kategori).forEach((id) => (grupKategori[id] = L.layerGroup().addTo(map)));
  const markerTitik = {};
  function buatPin() {
    Object.values(grupKategori).forEach((g) => g.clearLayers());
    titik.forEach((tt) => {
      const k = kategori[tt.kategori];
      if (!k) return console.warn("Kategori tidak dikenal:", tt.kategori);
      const mk = bisaKeyboard(L.marker([tt.lat, tt.lng], { icon: ikonPin(k), title: d(tt, "nama"), alt: d(tt, "nama"), riseOnHover: true }))
        .bindPopup(() => buatPopupTitik(tt, k), opsiPopup)
        .on("popupopen", () => mk.getElement()?.classList.add("dipilih"))
        .on("popupclose", () => mk.getElement()?.classList.remove("dipilih"))
        .addTo(grupKategori[tt.kategori]);
      markerTitik[tt.id] = mk;
    });
  }

  // ================================================================ filter
  const elFilter = $("filter");
  const semuaKat = Object.keys(kategori).filter((id) => titik.some((x) => x.kategori === id));
  const aktif = new Set(semuaKat);
  function buatChip() {
    elFilter.setAttribute("aria-label", t("filter"));
    elFilter.innerHTML = `<button type="button" class="chip" data-kat="*">${t("semua")}</button>` +
      semuaKat.map((id) => `<button type="button" class="chip" data-kat="${id}"><span class="titik" style="--c:${kategori[id].warna}"></span>${esc(d(kategori[id], "label"))}</button>`).join("");
    terapkanFilter();
  }
  function terapkanFilter() {
    Object.entries(grupKategori).forEach(([id, g]) => (aktif.has(id) ? map.addLayer(g) : map.removeLayer(g)));
    elFilter.querySelectorAll(".chip").forEach((b) => {
      const id = b.dataset.kat;
      b.setAttribute("aria-pressed", String(id === "*" ? aktif.size === semuaKat.length : aktif.has(id) && aktif.size < semuaKat.length));
    });
  }
  const setFilter = (ids) => { aktif.clear(); ids.forEach((i) => aktif.add(i)); terapkanFilter(); };
  elFilter.addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    const id = b.dataset.kat;
    if (id === "*") return setFilter(semuaKat);
    if (aktif.size === semuaKat.length) setFilter([id]);
    else { aktif.has(id) ? aktif.delete(id) : aktif.add(id); if (!aktif.size) semuaKat.forEach((i) => aktif.add(i)); terapkanFilter(); }
  });

  // klik di dalam pop-up (Leaflet menghentikan propagasi → fase capture)
  map.getContainer().addEventListener("click", (e) => {
    const fz = e.target.closest("[data-fokus-zona]");
    if (fz) {
      const z = zona.find((x) => x.id === fz.dataset.fokusZona);
      setFilter(semuaKat.filter((id) => id === "kuliner" || id === "sewa"));
      map.closePopup();
      map.flyToBounds(poligonZona[z.id].getBounds(), { padding: [40, 40], duration: kurangiGerak ? 0 : .6 });
      toast(t("menampilkan", { x: d(z, "nama") }));
    }
    if (e.target.closest("[data-wa-contoh]")) toast(t("waContoh"));
  }, true);

  // ================================================================ toast
  const elToast = $("toast");
  let tToast;
  function toast(pesan, lama = 2800) {
    elToast.textContent = pesan;
    elToast.classList.add("tampil");
    clearTimeout(tToast);
    tToast = setTimeout(() => elToast.classList.remove("tampil"), lama);
  }

  // ================================================================ panel kecil (satu terbuka sekaligus)
  const PANEL = { "panel-arah": $("btn-kompas"), "panel-lapisan": $("btn-lapisan") };
  function bukaPanel(id, buka) {
    Object.entries(PANEL).forEach(([pid, btn]) => {
      const b = pid === id ? buka : false;
      $(pid).hidden = !b;
      btn.setAttribute("aria-expanded", String(b));
    });
    if (buka) $(id).querySelector("button, input")?.focus({ preventScroll: true });
  }
  document.addEventListener("click", (e) => {
    const tp = e.target.closest("[data-tutup]");
    if (!tp) return;
    const id = tp.dataset.tutup;
    if (id === "panel-aman") $("panel-aman").close();
    else { bukaPanel(id, false); PANEL[id].focus(); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const terbuka = Object.keys(PANEL).find((pid) => !$(pid).hidden);
    if (terbuka) { bukaPanel(terbuka, false); PANEL[terbuka].focus(); }
  });

  // ================================================================ arah pandang (8 arah, kunci 45°)
  const btnKompas = $("btn-kompas"), elRange = $("pa-range");
  btnKompas.innerHTML = ikonKompas();
  const arahKini = () => arahAktif;
  // ganti arah pandang = ganti sistem koordinat isometrik; pusat & zoom dipertahankan
  function terapkanCrs() {
    const pusat = map.getCenter(), z = map.getZoom();
    const crs = lapisKini === "ilustrasi" ? crsArah(arahAktif) : L.CRS.EPSG3857;
    batasGambar = lapisKini === "ilustrasi" ? batasLatLng(arahAktif) : L.latLngBounds(ilustrasi.batas);
    map.options.crs = crs;
    map.setMaxBounds(batasGambar.pad(0.05));
    map.setView(pusat, z, { reset: true });
  }
  function setArah(a) {
    a = (Math.round(norm(a) / 45) * 45) % 360;
    if (a === arahAktif) return perbaruiArah();
    arahAktif = a;
    tileIlustrasi.forEach((tl) => (tl.options.arah = a));
    aturBatasInti(a);
    if (lapisKini === "ilustrasi") terapkanCrs();
    perbaruiArah();
  }
  const selisih = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  void selisih;
  function buatPreset() {
    const nama = t("arahNama"), singkat = t("arahSingkat");
    $("pa-preset").innerHTML = nama.map((n, i) => `<button type="button" data-derajat="${i * 45}" aria-label="${n}, ${i * 45}°">${singkat[i]}</button>`).join("");
    perbaruiArah();
  }
  function perbaruiArah() {
    const b = arahKini(), i = Math.round(b / 45) % 8;
    elRange.value = b;
    $("pa-derajat").textContent = b + "°";
    $("pa-nama").textContent = t("menghadap", { x: t("arahNama")[i] });
    btnKompas.querySelector(".jarum").style.transform = `rotate(${-b}deg)`;
    btnKompas.setAttribute("aria-label", `${t("kompas")}: ${t("menghadap", { x: t("arahNama")[i] })}`);
    $("pa-preset").querySelectorAll("button").forEach((c) => c.setAttribute("aria-pressed", String(+c.dataset.derajat === b)));
  }
  elRange.addEventListener("change", () => setArah(+elRange.value));
  $("panel-arah").addEventListener("click", (e) => {
    const c = e.target.closest("[data-derajat]"), st = e.target.closest("[data-step]");
    if (c) setArah(+c.dataset.derajat);
    if (st) setArah(arahKini() + +st.dataset.step);
  });
  btnKompas.addEventListener("click", () => bukaPanel("panel-arah", $("panel-arah").hidden));
  btnKompas.addEventListener("dblclick", () => { bukaPanel("panel-arah", false); keAwal(); });
  function keAwal() {
    setArah(config.arahAwal);
    map.flyTo(config.pusat, zoomAwal, { duration: kurangiGerak ? 0 : .6 });
  }

  // ================================================================ tampilan peta
  $("panel-lapisan").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lapis]");
    if (!b || b.dataset.lapis === lapisKini) return;
    map.removeLayer(LAPIS[lapisKini]);
    lapisKini = b.dataset.lapis;
    map.addLayer(LAPIS[lapisKini]);
    LAPIS[lapisKini].bringToBack?.();
    modeIlustrasi = lapisKini === "ilustrasi";
    terapkanCrs();
    map.getContainer().classList.toggle("mode-lain", !modeIlustrasi);
    zona.forEach((z) => poligonZona[z.id].setStyle(gayaZona(z, false)));
    $("panel-lapisan").querySelectorAll("[data-lapis]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
  });
  $("btn-lapisan").addEventListener("click", () => bukaPanel("panel-lapisan", $("panel-lapisan").hidden));
  $("btn-plus").addEventListener("click", () => map.zoomIn());
  $("btn-minus").addEventListener("click", () => map.zoomOut());

  // ================================================================ lokasi saya
  let posMarker, posAkurasi, lacak = false, pertama = true;
  const btnLokasi = $("btn-lokasi");
  const ikonSaya = (teks) => L.divIcon({ className: "saya", iconSize: [18, 18], iconAnchor: [9, 9],
    html: `<div class="saya-titik"></div>${teks ? `<div class="saya-label">${esc(teks)}</div>` : ""}` });
  btnLokasi.addEventListener("click", () => {
    if (lacak) {
      map.stopLocate(); lacak = false; btnLokasi.setAttribute("aria-pressed", "false");
      posMarker && map.removeLayer(posMarker); posAkurasi && map.removeLayer(posAkurasi);
      posMarker = posAkurasi = null; pertama = true;
      return;
    }
    lacak = true; btnLokasi.setAttribute("aria-pressed", "true");
    toast(t("lokasiCari"));
    map.locate({ watch: true, enableHighAccuracy: true });
  });
  map.on("locationfound", (e) => {
    if (!posMarker) {
      posAkurasi = L.circle(e.latlng, { radius: e.accuracy, color: "#3F6DA6", weight: 1, fillOpacity: .08, interactive: false }).addTo(map);
      posMarker = L.marker(e.latlng, { icon: ikonSaya(), zIndexOffset: 1000, keyboard: false }).addTo(map);
    } else { posMarker.setLatLng(e.latlng); posAkurasi.setLatLng(e.latlng).setRadius(e.accuracy); }
    if (pertama) {
      pertama = false;
      if (L.latLngBounds(batas).contains(e.latlng)) map.flyTo(e.latlng, 18, { duration: kurangiGerak ? 0 : .6 });
      else toast(t("lokasiLuar"));
    }
  });
  map.on("locationerror", () => { toast(t("lokasiGagal"), 4000); lacak = false; pertama = true; btnLokasi.setAttribute("aria-pressed", "false"); });

  // ================================================================ keselamatan (dialog)
  const dlgAman = $("panel-aman");
  const lapisEvak = L.layerGroup();
  const bendera = (w) => `<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M7 25V4" stroke="#6B7A8F" stroke-width="1.6" stroke-linecap="round"/><path d="M8 5h13l-2.5 4.5L21 14H8z" fill="${w}"/></svg>`;
  function buatAman() {
    const k = keselamatan;
    $("aman-isi").innerHTML = `
      <section class="aman-bagian"><h3>${t("benderaJudul")}</h3>
        <ul class="bendera-daftar">${k.bendera.map((b) => `<li>${bendera(b.warna)}<p><b>${esc(d(b, "nama"))}</b><span>${esc(d(b, "arti"))}</span></p></li>`).join("")}</ul></section>
      <section class="aman-bagian"><h3>${t("arusJudul")}</h3><p class="aman-info">${esc(d(k, "arusBalik"))}</p></section>
      <section class="aman-bagian"><h3>${t("evakuasiJudul")}</h3><p>${esc(d(k.evakuasi, "teks"))}</p>
        <button type="button" class="tombol-teks" id="btn-evak">${ikon("lari")}<span>${t("tunjukkan")}</span></button></section>
      <section class="aman-bagian"><h3>${t("nomorJudul")}</h3>
        <ul class="nomor-daftar">${k.nomor.map((n) => `<li><p class="nm"><b>${esc(d(n, "nama"))}</b><span>${n.nomor ? esc(n.nomor) : t("nomorMenyusul")}</span></p>${
          n.nomor ? `<a href="tel:${esc(n.nomor)}" aria-label="${esc(t("telepon", { x: d(n, "nama") }))}">${ikon("telepon")}</a>` : `<span class="kosong" aria-hidden="true">${ikon("telepon")}</span>`}</li>`).join("")}</ul></section>`;
    $("btn-evak").addEventListener("click", tunjukkanEvakuasi);
  }
  function gambarEvakuasi() {
    lapisEvak.clearLayers();
    const ev = keselamatan.evakuasi;
    L.polyline(ev.jalur, { color: "#fff", weight: 9, opacity: .9, lineCap: "round", lineJoin: "round", interactive: false }).addTo(lapisEvak);
    L.polyline(ev.jalur, { color: "#2E8B57", weight: 5, dashArray: "1 10", lineCap: "round", interactive: false }).addTo(lapisEvak);
    L.marker(ev.titikKumpul, { icon: ikonSaya(t("titikKumpul")), keyboard: false }).addTo(lapisEvak);
  }
  function tunjukkanEvakuasi() {
    dlgAman.close();
    const ev = keselamatan.evakuasi;
    gambarEvakuasi();
    lapisEvak.addTo(map);
    map.flyToBounds(L.latLngBounds(ev.jalur), { padding: [80, 80], duration: kurangiGerak ? 0 : .8 });
    toast(t("evakuasiTampil"), 4000);
  }
  let pemicuAman = null;
  $("btn-aman").addEventListener("click", (e) => { pemicuAman = e.currentTarget; dlgAman.showModal(); });
  dlgAman.addEventListener("close", () => pemicuAman?.focus());
  dlgAman.addEventListener("click", (e) => { if (e.target === dlgAman) dlgAman.close(); }); // klik di luar lembar

  // ================================================================ riak saat ditekan
  document.addEventListener("pointerdown", (e) => {
    if (kurangiGerak) return;
    const el = e.target.closest(".fab, .chip");
    if (!el) return;
    el.classList.remove("riak"); void el.offsetWidth; el.classList.add("riak");
  });
  document.addEventListener("animationend", (e) => e.target.classList?.remove("riak"));

  // ================================================================ offline
  const elOff = $("tanda-offline");
  elOff.innerHTML = `${ikon("offline")}<span></span>`;
  function aturOnline(beriTahu) {
    elOff.hidden = navigator.onLine;
    elOff.querySelector("span").textContent = t("offline");
    if (beriTahu) toast(navigator.onLine ? t("onlinePesan") : t("offlinePesan"));
  }
  addEventListener("online", () => aturOnline(true));
  addEventListener("offline", () => aturOnline(true));

  // ================================================================ mode survei (?survei=1) — dihapus setelah survei
  const btnKoor = $("btn-koordinat");
  let modeKoor = false;
  if (params.get("survei") === "1") btnKoor.hidden = false;
  btnKoor.addEventListener("click", () => {
    modeKoor = !modeKoor;
    btnKoor.setAttribute("aria-pressed", String(modeKoor));
    map.getContainer().style.cursor = modeKoor ? "crosshair" : "";
    toast(modeKoor ? t("koordinatAktif") : t("koordinatMati"));
  });
  map.on("click", (e) => {
    if (!modeKoor) return;
    const teks = `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;
    navigator.clipboard?.writeText(teks).catch(() => {});
    toast(`${t("koordinatDisalin")}: ${teks}`);
  });

  // ================================================================ bahasa
  const FAB = { "btn-aman": ["pelampung", "keselamatan"], "btn-lokasi": ["lokasi", "lokasi"], "btn-lapisan": ["lapisan", "lapisan"],
    "btn-plus": ["plus", "perbesar"], "btn-minus": ["minus", "perkecil"], "btn-koordinat": ["koordinat", "koordinat"] };
  Object.entries(FAB).forEach(([id, [ik]]) => ($(id).innerHTML = ikon(ik)));
  document.querySelectorAll("[data-tutup]").forEach((b) => (b.innerHTML = ikon("tutup")));
  document.querySelector('[data-step="-45"]').innerHTML = ikon("minus");
  document.querySelector('[data-step="45"]').innerHTML = ikon("plus");
  function terapkanBahasa() {
    document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = t(el.dataset.t)));
    Object.entries(FAB).forEach(([id, [, kunci]]) => $(id).setAttribute("aria-label", t(kunci)));
    document.querySelectorAll("[data-tutup]").forEach((b) => b.setAttribute("aria-label", t("tutup")));
    document.querySelector('[data-step="-45"]').setAttribute("aria-label", t("putarKiri"));
    document.querySelector('[data-step="45"]').setAttribute("aria-label", t("putarKanan"));
    elRange.setAttribute("aria-label", t("arahPandang"));
    $("muat").setAttribute("aria-label", t("memuat"));
    document.querySelector(".bahasa").setAttribute("aria-label", t("bahasa"));
    document.querySelectorAll("[data-bahasa]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.bahasa === window.I18N.bahasa)));
    map.closePopup();
    buatChip(); buatPin(); buatLabel(); buatPreset(); buatAman(); aturOnline(false);
    if (map.hasLayer(lapisEvak)) gambarEvakuasi();
  }
  document.querySelector(".bahasa").addEventListener("click", (e) => {
    const b = e.target.closest("[data-bahasa]");
    if (b) window.I18N.set(b.dataset.bahasa);
  });
  window.I18N.onChange(terapkanBahasa);
  terapkanBahasa();

  // ================================================================ dibuka dari QR (?dari=gerbang)
  const dari = params.get("dari");
  const idQr = dari && (PETA.qr[dari] || dari);
  const titikQr = idQr && titik.find((x) => x.id === idQr);
  if (titikQr) {
    map.setView([titikQr.lat, titikQr.lng], 18, { animate: false });
    L.marker([titikQr.lat, titikQr.lng], { icon: ikonSaya(`${t("andaDiSini")} · ${d(titikQr, "nama")}`), zIndexOffset: 900, keyboard: false, interactive: false }).addTo(map);
  }

  // ================================================================ layar pembuka (±1 detik, bisa dilewati)
  const elPembuka = $("pembuka");
  const mulai = performance.now();
  let pembukaSelesai = false;
  function tutupPembuka() {
    if (pembukaSelesai) return;
    pembukaSelesai = true;
    elPembuka.classList.add("selesai");
    setTimeout(() => elPembuka.remove(), 350);
  }
  elPembuka.addEventListener("pointerdown", tutupPembuka);
  addEventListener("keydown", tutupPembuka, { once: true });
  const minimal = kurangiGerak ? 500 : 1000;
  tileIlustrasi[0].once("load", () => setTimeout(tutupPembuka, Math.max(0, minimal - (performance.now() - mulai))));
  setTimeout(tutupPembuka, 2200); // batas atas bila tile lambat (sinyal lemah)
})();
