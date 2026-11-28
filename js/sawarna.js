/*
 * Peta besar Sawarna (docs/DESIGN.md §4.14–4.15): halaman awal berisi pulau pesisir Sawarna dengan ikon khas
 * tiap wisata. Ketuk ikon → pop-up wisata (deskripsi, tiket, waktu terbaik, rute). "Lihat peta detail" membuka
 * peta detail (js/app.js); tombol "← Sawarna" kembali. Tautan dengan ?dari= / ?peta= langsung ke peta detail.
 */
(function () {
  const IS = window.ISO_SAWARNA, RUTE = window.RUTE;
  if (!IS || !RUTE) return;
  const { t, d } = window.I18N;
  const esc = window.escHtml;
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const VERSI = "sw1"; // naikkan setiap tile peta besar dirender ulang

  // ---------------------------------------------------------------- CRS isometrik peta besar (satu tampilan)
  const [A, B, C, D, E, F] = IS.m, det = A * D - C * B;
  const crs = L.extend({}, L.CRS.Earth, {
    code: "SAWARNA-BESAR", infinite: true,
    projection: {
      project(ll) {
        const x = (ll.lng - IS.barat) * IS.U, y = (IS.mercN - Math.log(Math.tan(Math.PI / 4 + (ll.lat * Math.PI) / 360))) * IS.KY;
        return L.point(A * x + C * y + E, B * x + D * y + F);
      },
      unproject(pt) {
        const X = pt.x - E, Y = pt.y - F, x = (D * X - C * Y) / det, y = (-B * X + A * Y) / det;
        return L.latLng(((2 * Math.atan(Math.exp(IS.mercN - y / IS.KY)) - Math.PI / 2) * 180) / Math.PI, x / IS.U + IS.barat);
      },
      bounds: L.bounds([0, 0], [IS.w, IS.h]),
    },
    transformation: new L.Transformation(1, 0, 1, 0),
    scale: (z) => IS.S0 * Math.pow(2, z - 18),
    zoom: (sk) => 18 + Math.log(sk / IS.S0) / Math.LN2,
  });

  const wisata = RUTE.tujuan.filter((w) => w.lokasi);
  const pusat = [wisata.reduce((s, w) => s + w.lokasi[0], 0) / wisata.length, wisata.reduce((s, w) => s + w.lokasi[1], 0) / wisata.length];
  const map = L.map("peta-besar", {
    crs, center: pusat, zoom: 15, zoomSnap: 0.25, zoomDelta: 1, wheelPxPerZoomLevel: 110, minZoom: 13, maxZoom: 17.5,
    zoomControl: false, zoomAnimation: !kurangiGerak, fadeAnimation: !kurangiGerak, markerZoomAnimation: !kurangiGerak,
  });
  map.attributionControl.setPrefix(false);
  const TileBesar = L.TileLayer.extend({
    _isValidTile(c) { const sk = IS.S0 * Math.pow(2, c.z - 18); return c.x >= 0 && c.y >= 0 && c.x * 256 < IS.w * sk && c.y * 256 < IS.h * sk; },
  });
  new TileBesar(`assets/tiles/sawarna/{z}/{x}/{y}.webp?v=${VERSI}`, {
    minNativeZoom: Math.min(...IS.zooms), maxNativeZoom: Math.max(...IS.zooms), noWrap: true, keepBuffer: 3, className: "ilustrasi",
    attribution: "Ilustrasi © KKN Sawarna · data © kontributor <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
  }).addTo(map);

  // batas: zoom terjauh = seluruh pulau terlihat; pusat dijaga agar layar tidak keluar dari gambar
  function aturZoomMin() {
    const s = map.getSize();
    const z = 18 + Math.log2((Math.min(s.x / IS.w, s.y / IS.h) * 1.05) / IS.S0);
    map.setMinZoom(Math.max(12, Math.ceil(z * 4) / 4));
  }
  function jagaBatas() {
    if (map._popup && map.hasLayer(map._popup)) return; // biarkan peta bergeser agar kartu pop-up tidak terpotong
    const sk = crs.scale(map.getZoom()), s = map.getSize(), c = map.project(map.getCenter());
    const jepit = (v, uk, layar) => (uk <= layar ? uk / 2 : Math.min(uk - layar / 2, Math.max(layar / 2, v)));
    const x = jepit(c.x, IS.w * sk, s.x), y = jepit(c.y, IS.h * sk, s.y);
    if (Math.abs(x - c.x) > 0.5 || Math.abs(y - c.y) > 0.5) map.panTo(map.unproject([x, y]), { animate: !kurangiGerak, duration: 0.3 });
  }
  map.on("moveend", jagaBatas);
  // ikon wisata mengecil saat jauh agar tidak saling menutupi, membesar bertahap saat didekati
  const aturSkalaIkon = () => map.getContainer().style.setProperty("--skala-iw", Math.min(1.15, Math.max(0.45, 0.45 + (map.getZoom() - 13.5) * 0.26)).toFixed(3));
  map.on("zoom", aturSkalaIkon);

  // ---------------------------------------------------------------- ikon wisata + pop-up
  const opsiPopup = { className: "popup-kartu", maxWidth: 320, minWidth: 260, autoPanPaddingTopLeft: [16, 76], autoPanPaddingBottomRight: [72, 84] };
  const lapisIkon = L.layerGroup().addTo(map);
  function kartuWisata(w) {
    const ke = `${w.lokasi[0]},${w.lokasi[1]}`;
    const info = (label, isi) => (isi ? `<p class="kw-info"><b>${label}</b> ${esc(isi)}</p>` : "");
    return `<article class="kartu kt ktw" aria-label="${esc(d(w, "nama"))}">
      <figure class="ktw-gambar" aria-hidden="true">${window.ikonWisata(w.id)}</figure>
      <div class="kt-isi">
        <h2 class="kt-nama">${esc(d(w, "nama"))}</h2>
        ${d(w, "deskripsi") ? `<p class="kt-desk">${esc(d(w, "deskripsi"))}</p>` : ""}
        ${info(t("rtTiket"), d(w, "tiket"))}${info(t("rtWaktu"), d(w, "waktu"))}
        <div class="kt-aksi ktw-aksi">
          <a class="tombol utama" href="https://www.google.com/maps/dir/?api=1&destination=${ke}" target="_blank" rel="noopener">${ikon("lokasi")}<span>${t("ruteGmaps")}</span></a>
          <button type="button" class="tombol garis" data-rute-wisata="${esc(w.id)}">${ikon("bus")}<span>${t("caraKeSawarna")}</span></button>
          ${w.peta ? `<button type="button" class="tombol garis" data-peta-detail="${esc(w.peta)}">${ikon("kompas")}<span>${t("lihatPetaDetail")}</span></button>` : ""}
        </div>
      </div>
    </article>`;
  }
  function buatIkon() {
    lapisIkon.clearLayers();
    for (const w of wisata) {
      const nama = d(w, "nama");
      const mk = L.marker(w.lokasi, {
        title: nama, alt: nama, riseOnHover: true, keyboard: true,
        icon: L.divIcon({ className: "pin-wisata", iconSize: [0, 0], html: `<div class="iw">${window.ikonWisata(w.id)}<span class="iw-nama">${esc(nama)}</span></div>` }),
      }).bindPopup(() => kartuWisata(w), opsiPopup);
      // dipasang sebelum addTo agar peristiwa "add" pertama ikut tertangkap (label aksesibel & keyboard)
      mk.on("add", () => {
        const el = mk.getElement();
        if (!el || el.dataset.kb) return;
        el.dataset.kb = "1"; el.setAttribute("role", "button"); el.setAttribute("aria-label", nama);
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mk.openPopup(); } });
      });
      mk.on("popupopen", () => mk.getElement()?.classList.add("dipilih")).on("popupclose", () => mk.getElement()?.classList.remove("dipilih"));
      mk.addTo(lapisIkon);
    }
  }
  map.getContainer().addEventListener("click", (e) => {
    const r = e.target.closest("[data-rute-wisata]"), p = e.target.closest("[data-peta-detail]");
    if (r) { map.closePopup(); window.bukaRute?.(r.dataset.ruteWisata, $("btn-rute")); }
    if (p) { map.closePopup(); keDetail(p.dataset.petaDetail); }
  }, true);

  // ---------------------------------------------------------------- pindah peta besar ↔ peta detail
  const judul = document.querySelector(".header h1");
  function aturMode(mode, simpanRiwayat) {
    document.body.dataset.mode = mode;
    judul.dataset.t = mode === "besar" ? "judulBesar" : "judul";
    judul.textContent = t(judul.dataset.t);
    $("btn-kembali").hidden = mode !== "detail";
    if (mode === "besar") { map.invalidateSize(); aturZoomMin(); } else window.petaDetail?.tampil();
    if (simpanRiwayat) history.pushState({ mode }, "", mode === "detail" ? "?peta=ciantir" : location.pathname);
  }
  function keDetail() { aturMode("detail", true); }
  function keBesar() {
    aturMode("besar", true);
    const ciantir = wisata.find((w) => w.peta);
    if (ciantir) map.setView(ciantir.lokasi, Math.max(map.getZoom(), 15), { animate: false });
  }
  $("btn-kembali").addEventListener("click", keBesar);
  addEventListener("popstate", (e) => aturMode(e.state?.mode || (new URLSearchParams(location.search).has("peta") ? "detail" : "besar"), false));

  // ---------------------------------------------------------------- bahasa & mulai
  function terapkanBahasa() {
    buatIkon();
    judul.textContent = t(judul.dataset.t || "judul");
    $("btn-kembali").innerHTML = `${ikon("kembali")}<span>Sawarna</span>`;
    $("btn-kembali").setAttribute("aria-label", t("kembaliSawarna"));
  }
  window.I18N.onChange(terapkanBahasa);
  terapkanBahasa();
  window.petaBesar = { map, keDetail, keBesar };

  const langsungDetail = params.has("dari") || params.has("peta");
  aturMode(langsungDetail ? "detail" : "besar", false);
  history.replaceState({ mode: document.body.dataset.mode }, "", location.href);
  if (!langsungDetail) {
    aturZoomMin();
    // mulai di sekitar Ciantir–Tanjung Layar; HP sedikit lebih dekat (geser kiri-kanan menyusuri pantai)
    const awal = wisata.filter((w) => w.id === "ciantir" || w.id === "tanjung-layar");
    const tengah = awal.length ? [awal.reduce((s, w) => s + w.lokasi[0], 0) / awal.length, awal.reduce((s, w) => s + w.lokasi[1], 0) / awal.length] : pusat;
    map.setView(innerWidth < 768 ? tengah : pusat, Math.max(map.getMinZoom(), innerWidth < 768 ? 14.75 : 14.5), { animate: false });
  }
  map.on("resize", aturZoomMin);
  aturSkalaIkon();
})();
