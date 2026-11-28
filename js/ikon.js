/*
 * Ikon garis Sawarna Smart Guide (24×24, currentColor, sudut membulat).
 * Satu set untuk seluruh antarmuka; ketebalan garis diatur lewat CSS (--ikon-garis).
 */
(function () {
  const P = {
    // kategori
    toko: '<path d="M4 10v9h16v-9"/><path d="M3 10l2-5h14l2 5"/><path d="M3 10c0 1.4 1.3 2.5 3 2.5S9 11.4 9 10c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5"/><path d="M10 19v-4h4v4"/>',
    selancar: '<path d="M17.5 3.5c2.5 2.5-.5 9-5 13.5S4.6 22.5 3.6 20.4c-1-2.1 2.5-8 7-12.5s4.4-6.9 6.9-4.4z"/><path d="M8.5 15.5l7-7"/>',
    tiket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/><path d="M14 7v10" stroke-dasharray="2 2.2"/>',
    toilet: '<circle cx="7.5" cy="5" r="1.6"/><circle cx="16.5" cy="5" r="1.6"/><path d="M5.5 21v-6H4.5V10a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 10.5 10v5h-1v6"/><path d="M15 21v-4h-2l2-7.5h3l2 7.5h-2v4"/><path d="M12 3v18"/>',
    pelampung: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/>',
    kamera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".9" fill="currentColor"/>',
    kembali: '<path d="M15 5l-7 7 7 7"/>',
    bus: '<rect x="4" y="3.5" width="16" height="14" rx="2.5"/><path d="M4 10h16M8 20.5v-3M16 20.5v-3"/><circle cx="8" cy="14" r=".9" fill="currentColor"/><circle cx="16" cy="14" r=".9" fill="currentColor"/>',
    jam: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    gerbang: '<path d="M3 21V7l4-3 4 3v14"/><path d="M13 21V7l4-3 4 3v14"/><path d="M11 10h2M11 14h2"/><path d="M3 21h18"/>',
    // tombol
    kompas: '<circle cx="12" cy="12" r="9"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
    lokasi: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/>',
    lapisan: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    tutup: '<path d="M6 6l12 12M18 6L6 18"/>',
    arah: '<path d="M12 3l7 18-7-4-7 4z"/>',
    telepon: '<path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    ombak: '<path d="M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><path d="M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2"/><path d="M8 9c0-3 2.5-5 5.5-5 1.5 0 3 .8 3.5 2-1.5-.5-3 0-3.5 1.5"/>',
    bendera: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
    lari: '<circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 2v4"/><path d="M6 12l3-4 4 1 2 4 3 1"/>',
    rumah: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    luar: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    offline: '<path d="M3 3l18 18"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 12.5a10 10 0 0 1 4-2.4M19 12.5a10 10 0 0 0-2.6-1.8"/><circle cx="12" cy="20" r=".8" fill="currentColor"/>',
    koordinat: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  };
  // WhatsApp: glif berisi (bentuk merek dikenali), tetap currentColor
  const WA = '<path fill="currentColor" stroke="none" d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.4 4.8 5-1.3A9.8 9.8 0 1 0 12 2.2zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.5-.3z"/>';
  window.ikon = (nama, kelas = "") =>
    `<svg class="ikon ${kelas}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${nama === "whatsapp" ? WA : P[nama] || ""}</svg>`;
  // Kompas bergaya pelaut (mawar angin), jarum utara merah tipis
  window.ikonKompas = () => `<svg class="kompas-mawar" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="1"/>
    <g class="jarum"><path d="M20 4.5l3 15.5h-6z" fill="#C94545"/><path d="M20 35.5l3-15.5h-6z" fill="currentColor" fill-opacity=".35"/>
    <path d="M4.5 20l15.5-2v4zM35.5 20l-15.5-2v4z" fill="currentColor" fill-opacity=".18"/><circle cx="20" cy="20" r="1.8" fill="#fff" stroke="currentColor" stroke-width="1"/></g></svg>`;
})();
