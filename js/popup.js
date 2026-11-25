/*
 * Pembuat isi pop-up. Struktur setiap pop-up:
 *   1. Kepala   : foto (atau ikon kategori), label kategori, nama
 *   2. Deskripsi
 *   3. Detail   : khusus per kategori (lihat BAGIAN_KHUSUS)
 *   4. Tombol   : Petunjuk Arah + kontak (WhatsApp / Telepon) bila ada
 */
(function () {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const baris = (ikon, label, nilai) =>
    nilai == null || nilai === "" ? "" :
    `<div class="pp-row"><span class="pp-ico">${ikon}</span><span class="pp-key">${esc(label)}</span><span class="pp-val">${esc(nilai)}</span></div>`;

  const daftarHarga = (judul, items) =>
    !items || !items.length ? "" :
    `<div class="pp-sub">${esc(judul)}</div><table class="pp-price">${items
      .map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</table>`;

  const chips = (items) =>
    !items || !items.length ? "" :
    `<div class="pp-chips">${items.map((f) => `<span>${esc(f)}</span>`).join("")}</div>`;

  const BENDERA = {
    hijau:  { teks: "Aman untuk berenang", warna: "#16a34a" },
    kuning: { teks: "Hati-hati, ombak sedang", warna: "#ca8a04" },
    merah:  { teks: "Dilarang berenang", warna: "#dc2626" },
  };

  // Bagian detail khusus per kategori
  const BAGIAN_KHUSUS = {
    homestay: (i) =>
      baris("💰", "Harga", i.harga) +
      baris("🛏️", "Kamar", i.kamar && `${i.kamar} kamar`) +
      baris("📍", "Ke pantai", i.jarakPantai) +
      baris("👤", "Pemilik", i.pemilik) +
      chips(i.fasilitas),
    kuliner: (i) => baris("🕒", "Jam buka", i.jam) + daftarHarga("Menu andalan", i.menu),
    sewa: (i) =>
      baris("🕒", "Jam buka", i.jam) +
      baris("🧑‍🏫", "Instruktur", i.instruktur ? "Tersedia" : "Tidak tersedia") +
      daftarHarga("Harga sewa", i.harga),
    fasilitas: (i) => baris("🕒", "Jam", i.jam) + baris("📦", "Kapasitas", i.kapasitas) + daftarHarga("Tarif", i.tarif),
    dasar: (i) => baris("💰", "Biaya", i.biaya) + baris("🕒", "Jam", i.jam) + baris("💧", "Air", i.air),
    keselamatan: (i) => {
      const b = BENDERA[i.bendera];
      const bendera = b
        ? `<div class="pp-flag" style="--flag:${b.warna}"><span class="pp-flag-dot"></span>Bendera ${esc(i.bendera)}: ${esc(b.teks)}</div>`
        : "";
      return bendera + baris("🕒", "Jam jaga", i.jam) + baris("⚠️", "Catatan", i.catatan);
    },
    spot: (i) =>
      baris("⏰", "Waktu terbaik", i.waktuTerbaik) + baris("🥾", "Kesulitan", i.kesulitan) + baris("⚠️", "Catatan", i.catatan),
    akses: (i) =>
      baris("🛣️", "Kondisi jalan", i.kondisiJalan) + baris("🚗", "Mobil", i.aksesMobil) + baris("🕒", "Jam", i.jam),
  };

  function tombol(t) {
    const [lat, lng] = t.lokasi;
    const arah = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    const k = t.kontak || {};
    let html = `<a class="pp-btn primary" href="${arah}" target="_blank" rel="noopener">🧭 Petunjuk Arah</a>`;
    if (k.wa) html += `<a class="pp-btn wa" href="https://wa.me/${encodeURIComponent(k.wa)}" target="_blank" rel="noopener">💬 WhatsApp</a>`;
    if (k.telp) html += `<a class="pp-btn" href="tel:${encodeURIComponent(k.telp)}">📞 Telepon</a>`;
    if (!k.wa && !k.telp && ["homestay", "kuliner", "sewa", "keselamatan"].includes(t.kategori))
      html += `<span class="pp-btn disabled" title="Belum ada izin/kontak dari pemilik">💬 Kontak belum tersedia</span>`;
    return `<div class="pp-actions">${html}</div>`;
  }

  window.buatPopupTitik = function (t, kat) {
    const foto = t.foto
      ? `<img class="pp-photo" src="${esc(t.foto)}" alt="${esc(t.nama)}" loading="lazy">`
      : `<div class="pp-photo placeholder" style="--c:${kat.warna}"><span>${kat.ikon}</span></div>`;
    const detail = (BAGIAN_KHUSUS[t.kategori] || (() => ""))(t.info || {});
    return `
      <article class="pp">
        ${foto}
        <div class="pp-body">
          <div class="pp-tags">
            <span class="pp-badge" style="--c:${kat.warna}">${kat.ikon} ${esc(kat.label)}</span>
            ${t.contoh ? '<span class="pp-dummy">Data contoh</span>' : ""}
          </div>
          <h3 class="pp-title">${esc(t.nama)}</h3>
          ${t.deskripsi ? `<p class="pp-desc">${esc(t.deskripsi)}</p>` : ""}
          ${detail ? `<div class="pp-detail">${detail}</div>` : ""}
          ${tombol(t)}
        </div>
      </article>`;
  };

  window.buatPopupZona = function (z, ringkasan) {
    const isi = ringkasan.length
      ? `<ul class="pz-list">${ringkasan.map((r) => `<li>${r.ikon} ${esc(r.label)} <b>${r.jumlah}</b></li>`).join("")}</ul>`
      : "";
    return `
      <article class="pz" style="--c:${z.warna}">
        <div class="pz-head"><span class="pz-swatch"></span><h3>${esc(z.nama)}</h3></div>
        <p>${esc(z.deskripsi)}</p>
        ${isi}
        <button class="pp-btn primary" data-fokus-zona="${esc(z.id)}">Tampilkan layanan di zona ini</button>
      </article>`;
  };
})();
