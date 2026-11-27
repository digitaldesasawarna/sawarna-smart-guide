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
  // sudut kamera (tilt): pilihan dari js/iso.js, tiap pilihan punya set tile sendiri.
  // Bawaan = sudut saat ini ("sedang"); pilihan pengunjung diingat di perangkatnya saja.
  const MIRING = ISO.miring || [{ id: "sedang", akhiran: "" }];
  const MIRING_AWAL = ISO.miringAwal || "sedang";
  const KUNCI_MIRING = "sawarna-sudut-kamera";
  let miringAktif = (() => { try { const v = localStorage.getItem(KUNCI_MIRING); return MIRING.some((m) => m.id === v) ? v : MIRING_AWAL; } catch { return MIRING_AWAL; } })();
  // kunci tampilan = arah + akhiran sudut kamera, mis. "225" (bawaan) atau "225-t38"
  const kunci = (a = arahAktif, mr = miringAktif) => `${a}${(MIRING.find((m) => m.id === mr) || MIRING[0]).akhiran}`;
  // HP: satu tingkat lebih jauh agar semua marker kawasan (gambaran besar) muat di layar sempit
  const zoomAwal = innerWidth < 768 ? config.zoomAwal - 1 : config.zoomAwal;
  const norm = (v) => ((Math.round(v) % 360) + 360) % 360;
  const map = L.map("map", {
    center: config.pusat,
    zoom: zoomAwal,
    crs: crsArah(kunci()),
    // zoom halus: berhenti tiap ¼ tingkat (roda mouse & cubit), tombol +/− tetap satu tingkat.
    // Tile ilustrasi ada di zoom bulat 16–19; di antaranya Leaflet memakai tile terdekat yang diskalakan.
    zoomSnap: 0.25,
    zoomDelta: 1,
    wheelPxPerZoomLevel: 110,
    wheelDebounceTime: 30,
    minZoom: config.zoomMin,
    maxZoom: config.zoomMaks,
    zoomControl: false,
    zoomAnimation: !kurangiGerak,
    fadeAnimation: !kurangiGerak,
    markerZoomAnimation: !kurangiGerak,
  });
  map.attributionControl.setPrefix(false);

  // Batas peta dihitung di ruang piksel gambar. maxBounds & getBoundsZoom Leaflet memakai kotak lintang/bujur
  // dan hanya dua sudutnya, sehingga salah pada proyeksi isometrik yang berputar (zoom & geser terkunci).
  function aturZoomMin() {
    const { w, h } = ISO.arah[kunci()], s = map.getSize();
    let z = 18 + Math.log2((Math.max(s.x / w, s.y / h) * 0.85) / ISO.S0); // gambar (hampir) menutupi layar
    z = Math.min(config.zoomMaks, Math.max(config.zoomMin, Math.ceil(z)));
    map.setMinZoom(z);
    if (map.getZoom() < z) map.setZoom(z);
  }
  // pusat peta dijaga agar layar tidak keluar dari gambar
  function jagaBatas() {
    const { w, h } = ISO.arah[kunci()], sk = map.options.crs.scale(map.getZoom()), s = map.getSize();
    const c = map.project(map.getCenter());
    const jepit = (v, uk, layar) => (uk <= layar ? uk / 2 : Math.min(uk - layar / 2, Math.max(layar / 2, v)));
    const x = jepit(c.x, w * sk, s.x), y = jepit(c.y, h * sk, s.y);
    if (Math.abs(x - c.x) > 0.5 || Math.abs(y - c.y) > 0.5) map.panTo(map.unproject([x, y]), { animate: !kurangiGerak, duration: 0.3 });
  }
  aturZoomMin();
  map.on("resize", aturZoomMin);
  map.on("moveend", jagaBatas);
  // ukuran marker mengikuti zoom secara bertahap (CSS --skala-*, transisi 250 ms selaras animasi zoom)
  function aturSkala() {
    const z = map.getZoom(), el = map.getContainer();
    el.style.setProperty("--skala-pin", Math.min(1.12, Math.max(0.8, 0.8 + (z - 16) * 0.1)).toFixed(3));
    el.style.setProperty("--skala-kw", Math.min(1.12, Math.max(0.86, 0.86 + (z - 16) * 0.14)).toFixed(3));
  }
  map.on("zoom", aturSkala);
  aturSkala();

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

  // ---------- lapisan ilustrasi (8 arah pandang)
  const opsiTile = { arah: kunci(), noWrap: true, keepBuffer: 4, className: "ilustrasi", attribution: "Ilustrasi © KKN Sawarna · data © kontributor <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>" };
  const tileIlustrasi = [
    L.tileLayer(ilustrasi.tiles, { ...opsiTile, minNativeZoom: 16, maxNativeZoom: 18, maxZoom: 19 }),
    L.tileLayer(ilustrasi.tiles, { ...opsiTile, minZoom: 19, minNativeZoom: 19, maxNativeZoom: 19, maxZoom: 19 }),
  ];
  // zoom 19 hanya dirender untuk kawasan inti
  const aturBatasInti = (a) => { tileIlustrasi[1].options.bounds = batasLatLng(a, ISO.arah[a].inti); };
  aturBatasInti(kunci());

  // label nama tempat & zona
  const lapisLabel = L.layerGroup();
  function buatLabel() {
    lapisLabel.clearLayers();
    label.forEach((l) => lapisLabel.addLayer(L.marker(l.lokasi, {
      interactive: false, keyboard: false, zoomMin: l.zoomMin || 0,
      icon: L.divIcon({ className: `label-peta label-${l.tipe}`, iconSize: [0, 0],
        html: `<span>${esc(d(l, "teks"))}</span>` }),
    })));
    setTimeout(aturLabel);
  }
  function aturLabel() {
    const z = map.getZoom();
    lapisLabel.eachLayer((mk) => mk.getElement() && mk.getElement().classList.toggle("sembunyi", z < mk.options.zoomMin));
  }
  map.on("zoomend", aturLabel);

  L.layerGroup([...tileIlustrasi, lapisLabel]).addTo(map);

  // indikator memuat (garis ombak)
  const elMuat = $("muat");
  let memuat = 0;
  tileIlustrasi.forEach((tl) => {
    tl.on("loading", () => { memuat++; elMuat.hidden = false; });
    tl.on("load", () => { memuat = Math.max(0, memuat - 1); if (!memuat) elMuat.hidden = true; });
  });

  // ================================================================ kawasan (marker bertingkat per zoom)
  // Zoom jauh (< ZOOM_DETAIL): satu marker per kawasan mewakili isinya; titik di dalam kawasan disembunyikan.
  // Zoom dekat (>= ZOOM_DETAIL): marker kawasan hilang, titik detail di dalamnya muncul.
  const ZOOM_DETAIL = 18;
  const opsiPopup = { className: "popup-kartu", maxWidth: 300, minWidth: 240, autoPanPaddingTopLeft: [16, 130], autoPanPaddingBottomRight: [72, 24] };
  const dalamPoligon = ([la, ln], poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ai, bi] = poly[i], [aj, bj] = poly[j];
      if (bi > ln !== bj > ln && la < ((aj - ai) * (ln - bi)) / (bj - bi) + ai) c = !c;
    }
    return c;
  };
  // titik keselamatan selalu tampil di semua zoom, tidak dirangkum ke kawasan
  const kawasanDari = (tt) => tt.kategori === "keselamatan" ? undefined : zona.find((z) => dalamPoligon([tt.lat, tt.lng], z.koordinat));
  const lapisKawasan = L.layerGroup().addTo(map);
  function buatKawasan() {
    lapisKawasan.clearLayers();
    zona.forEach((z) => {
      const isi = titik.filter((tt) => kawasanDari(tt) === z && aktif.has(tt.kategori)).length;
      const nama = d(z, "nama"), judul = isi ? `${nama}: ${t("jumlahTempat", { n: isi })}` : nama;
      // cukup ikon; nama kawasan tetap terbaca lewat judul (tooltip) & label aksesibel
      const mk = bisaKeyboard(L.marker(z.label, {
        title: judul, alt: nama, riseOnHover: true, zIndexOffset: 500,
        icon: L.divIcon({ className: "pin-kawasan", iconSize: [0, 0],
          html: `<div class="kw" style="--c:${z.warna}">${ikon(z.ikon || "toko")}</div>` }),
      }));
      mk.on("add", () => mk.getElement()?.setAttribute("aria-label", judul));
      if (isi && !z.tautan) mk.on("click", () => masukKawasan(z));
      else mk.bindPopup(() => buatPopupZona(z), opsiPopup);
      mk.addTo(lapisKawasan);
    });
  }
  function masukKawasan(z) {
    map.closePopup();
    map.flyTo(z.label, Math.max(ZOOM_DETAIL, map.getZoom()), { duration: kurangiGerak ? 0 : .6 });
    toast(t("menampilkan", { x: d(z, "nama") }));
  }
  const aturTingkat = () => map.getContainer().classList.toggle("tingkat-detail", map.getZoom() >= ZOOM_DETAIL - 0.25);
  map.on("zoom", aturTingkat);
  aturTingkat();

  // ================================================================ pin titik
  const ikonPin = (k, diKawasan) => L.divIcon({
    className: diKawasan ? "pin pin-dalam" : "pin", iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
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
      const mk = bisaKeyboard(L.marker([tt.lat, tt.lng], { icon: ikonPin(k, !!kawasanDari(tt)), title: d(tt, "nama"), alt: d(tt, "nama"), riseOnHover: true }))
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
    buatKawasan();
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
      masukKawasan(zona.find((x) => x.id === fz.dataset.fokusZona));
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
  const PANEL = { "panel-arah": $("btn-kompas") };
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
    map.options.crs = crsArah(kunci());
    map.setView(pusat, z, { reset: true });
    aturZoomMin();
    jagaBatas();
  }
  function setArah(a) {
    a = (Math.round(norm(a) / 45) * 45) % 360;
    if (a === arahAktif) return perbaruiArah();
    arahAktif = a;
    gantiTampilan();
    perbaruiArah();
  }
  // tile & sistem koordinat mengikuti kunci tampilan (arah + sudut kamera)
  function gantiTampilan() {
    tileIlustrasi.forEach((tl) => (tl.options.arah = kunci()));
    aturBatasInti(kunci());
    terapkanCrs();
  }
  function setMiring(id) {
    if (id === miringAktif || !MIRING.some((m) => m.id === id)) return perbaruiMiring();
    miringAktif = id;
    try { localStorage.setItem(KUNCI_MIRING, id); } catch { /* penyimpanan tidak tersedia: pilihan berlaku sampai halaman ditutup */ }
    gantiTampilan();
    perbaruiMiring();
  }
  function buatMiring() {
    const nama = t("miringNama");
    $("pm-pilihan").innerHTML = MIRING.map((m) => `<button type="button" data-miring="${m.id}">${esc(nama[m.id] || m.id)}</button>`).join("");
    perbaruiMiring();
  }
  function perbaruiMiring() {
    $("pm-pilihan").querySelectorAll("[data-miring]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.miring === miringAktif)));
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
    const c = e.target.closest("[data-derajat]"), st = e.target.closest("[data-step]"), mr = e.target.closest("[data-miring]");
    if (mr) setMiring(mr.dataset.miring);
    if (c) setArah(+c.dataset.derajat);
    if (st) setArah(arahKini() + +st.dataset.step);
  });
  btnKompas.addEventListener("click", () => bukaPanel("panel-arah", $("panel-arah").hidden));
  btnKompas.addEventListener("dblclick", () => { bukaPanel("panel-arah", false); keAwal(); });
  function keAwal() {
    setMiring(MIRING_AWAL);
    setArah(config.arahAwal);
    map.flyTo(config.pusat, zoomAwal, { duration: kurangiGerak ? 0 : .6 });
  }

  // ================================================================ zoom
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
    // flyToBounds memakai kotak lintang/bujur yang salah pada proyeksi isometrik → terbang ke tengah jalur
    map.flyTo(L.latLngBounds(ev.jalur).getCenter(), 18, { duration: kurangiGerak ? 0 : .8 });
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
  const FAB = { "btn-aman": ["pelampung", "keselamatan"], "btn-lokasi": ["lokasi", "lokasi"],
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
    buatChip(); buatPin(); buatLabel(); buatPreset(); buatMiring(); buatAman(); aturOnline(false);
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
