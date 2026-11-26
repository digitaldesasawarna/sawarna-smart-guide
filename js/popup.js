/*
 * Isi kartu pop-up (DESIGN §4.5, §4.6): foto → kategori → nama → deskripsi → jam → tombol.
 * Tanpa harga. WhatsApp hanya untuk UMKM yang sudah memberi izin.
 */
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const { t, d } = window.I18N;
  const KATEGORI_WA = ["kuliner", "sewa"];

  function foto(tt, k) {
    const src = tt.foto || `assets/foto/${tt.id}.webp`;
    return `<figure class="kt-foto" style="--c:${k.warna}">
      <img src="${esc(src)}" alt="${esc(d(tt, "nama"))}" loading="lazy" decoding="async"
        onerror="this.parentNode.classList.add('kosong');this.remove()">
      <span class="kt-foto-kosong" aria-hidden="true">${ikon(k.ikon)}</span>
    </figure>`;
  }

  function tombolWa(tt) {
    if (!KATEGORI_WA.includes(tt.kategori)) return "";
    if (tt.whatsapp) {
      const pesan = window.PETA.config.pesanWhatsApp[window.I18N.bahasa].replace("{nama}", d(tt, "nama"));
      return `<a class="tombol garis wa" href="https://wa.me/${encodeURIComponent(tt.whatsapp)}?text=${encodeURIComponent(pesan)}" target="_blank" rel="noopener">${ikon("whatsapp")}<span>${t("whatsapp")}</span></a>`;
    }
    if (tt.contoh) return `<button type="button" class="tombol garis wa" data-wa-contoh>${ikon("whatsapp")}<span>${t("whatsapp")}</span></button>`;
    return "";
  }

  window.buatPopupTitik = function (tt, k) {
    const arah = `https://www.google.com/maps/dir/?api=1&destination=${tt.lat},${tt.lng}&travelmode=walking`;
    const jam = tt.jam ? `<p class="kt-jam"><span>${t("buka")}</span> ${esc(tt.jam)}</p>` : "";
    return `<article class="kartu kt" aria-label="${esc(d(tt, "nama"))}">
      ${foto(tt, k)}
      <div class="kt-isi">
        <p class="kt-kategori"><span class="titik" style="--c:${k.warna}"></span>${esc(d(k, "label"))}${tt.contoh ? `<span class="kt-contoh">${t("dataContoh")}</span>` : ""}</p>
        <h2 class="kt-nama">${esc(d(tt, "nama"))}</h2>
        ${d(tt, "deskripsi") ? `<p class="kt-desk">${esc(d(tt, "deskripsi"))}</p>` : ""}
        ${jam}
        <div class="kt-aksi">
          <a class="tombol utama" href="${arah}" target="_blank" rel="noopener">${ikon("arah")}<span>${t("arah")}</span></a>
          ${tombolWa(tt)}
        </div>
      </div>
    </article>`;
  };

  window.buatPopupZona = function (z) {
    const tombol = z.tautan === "visitSawarna"
      ? `<a class="tombol utama" href="${esc(window.PETA.config.visitSawarna)}" target="_blank" rel="noopener"><span>${t("zonaHomestay")}</span>${ikon("luar")}</a>`
      : `<button type="button" class="tombol utama" data-fokus-zona="${esc(z.id)}">${ikon("filter")}<span>${t("zonaUmkm")}</span></button>`;
    return `<article class="kartu kt kz" aria-label="${esc(d(z, "nama"))}">
      <div class="kt-isi">
        <p class="kt-kategori"><span class="titik" style="--c:${z.warna}"></span>${window.I18N.bahasa === "en" ? "Area" : "Zona"}</p>
        <h2 class="kt-nama">${esc(d(z, "nama"))}</h2>
        <p class="kt-desk">${esc(d(z, "deskripsi"))}</p>
        <div class="kt-aksi">${tombol}</div>
      </div>
    </article>`;
  };

  window.escHtml = esc;
})();
