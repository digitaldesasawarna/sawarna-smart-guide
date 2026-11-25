/*
 * Pustaka simbol ilustrasi (gaya peta taman wisata, sudut pandang atas sedikit miring).
 * Cahaya dari kiri atas → bayangan ke kanan bawah.
 * 1 unit ≈ 0,55 m. Semua simbol berpusat di (0,0) dan dipakai lewat <use href="#id">.
 */
export const f1 = (n) => Math.round(n * 10) / 10;

export function makeRng(seed) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return { rnd, rr: (a, b) => a + rnd() * (b - a), pick: (arr) => arr[Math.floor(rnd() * arr.length)] };
}

// ------------------------------------------------------------------ palet
export const ATAP = {
  terakota: ["#E07E55", "#C9623C", "#A94D2F"],
  genteng: ["#EC9F55", "#D4823C", "#B4692D"],
  cokelat: ["#A8785A", "#8C6046", "#6F4B37"],
  biru: ["#6B9AD0", "#5280B8", "#3F6798"],
  hijau: ["#79AE8C", "#5F9474", "#4B7A5E"],
  merah: ["#DA5F52", "#BE4A3F", "#9C3B33"],
  seng: ["#C3CBD3", "#A6B1BC", "#8B97A4"],
};
export const DINDING = ["#FFF8EE", "#F7E8CB", "#FDF0D5", "#EDF3F7", "#F5E2D3", "#FFFFFF", "#E9F1E1"];
export const TENDA = [["#E0674F", "#FFFFFF"], ["#DF9232", "#FFFFFF"], ["#4677B4", "#FFFFFF"], ["#4E9F6A", "#FFFFFF"], ["#D35B9A", "#FFFFFF"], ["#2A9DB5", "#FFF6E3"]];
export const PAYUNG = [["#DF9232", "#FFFFFF"], ["#E0674F", "#FFE7A3"], ["#4677B4", "#FFFFFF"], ["#2A9DB5", "#FFF6E3"], ["#D35B9A", "#FFFFFF"], ["#F2C14E", "#4677B4"]];
export const DAUN = [
  ["#2F7A45", "#3F9157", "#6CBF74"],
  ["#3B8A4E", "#4FA060", "#85CC7E"],
  ["#2C6E48", "#3B845A", "#62AE78"],
  ["#4E8F3E", "#65A84C", "#98CE6A"],
  ["#2E6A3A", "#407F48", "#5FA060"],
];

// ------------------------------------------------------------------ defs umum
export const defsUmum = () => `
  <filter id="b2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="b4" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="b8" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="b20" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>
  <pattern id="pGenteng" width="6" height="3" patternUnits="userSpaceOnUse"><path d="M0 2.6H6" stroke="#000" stroke-opacity=".16" stroke-width=".7"/><path d="M3 0V2.6" stroke="#000" stroke-opacity=".07" stroke-width=".5"/></pattern>
  <pattern id="pSeng" width="2.4" height="10" patternUnits="userSpaceOnUse"><path d="M1.2 0V10" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/></pattern>
  <pattern id="pRumbia" width="5" height="4" patternUnits="userSpaceOnUse"><path d="M0 3.5Q2.5 1.5 5 3.5" stroke="#7A5A2C" stroke-opacity=".35" stroke-width=".7" fill="none"/></pattern>
  <linearGradient id="gKaca" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CFE6F5"/><stop offset="1" stop-color="#6E9CC6"/></linearGradient>
  <linearGradient id="gKayu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B98457"/><stop offset="1" stop-color="#8A5A36"/></linearGradient>
`;

const bayang = (d, dx = 6, dy = 7, op = 0.3, f = "b4") =>
  `<path d="${d}" transform="translate(${dx} ${dy})" fill="#152638" opacity="${op}" filter="url(#${f})"/>`;
const rectD = (x, y, w, h) => `M${f1(x)} ${f1(y)}h${f1(w)}v${f1(h)}h${f1(-w)}Z`;

// ------------------------------------------------------------------ rumah
// Rumah limas (atap perisai) dengan dinding depan terlihat.
export function rumahLimas(id, { w = 30, h = 22, wh = 7, atap, dinding, jendela = 2, pot = false, teras = false }) {
  const [a1, a2, a3] = atap;
  const r = h * 0.46, x0 = -w / 2, x1 = w / 2, y0 = -h / 2 - wh / 2, y1 = h / 2 - wh / 2, ym = (y0 + y1) / 2;
  const roof = `M${x0} ${y1}L${x1} ${y1}L${x1 - r} ${ym}L${x0 + r} ${ym}Z`;
  const back = `M${x0} ${y0}L${x1} ${y0}L${x1 - r} ${ym}L${x0 + r} ${ym}Z`;
  const kiri = `M${x0} ${y0}L${x0 + r} ${ym}L${x0} ${y1}Z`;
  const kanan = `M${x1} ${y0}L${x1 - r} ${ym}L${x1} ${y1}Z`;
  const outline = rectD(x0, y0, w, h);
  let jdl = "";
  const n = jendela, lebar = w - 4;
  for (let i = 0; i < n; i++) {
    const cx = x0 + 2 + (lebar * (i + 0.5)) / n + (i >= n / 2 ? 3 : -3);
    jdl += `<rect x="${f1(cx - 2.6)}" y="${f1(y1 + 1.8)}" width="5.2" height="3.4" fill="url(#gKaca)" stroke="#6F5440" stroke-width=".5"/>`;
  }
  const pintu = `<rect x="-2.2" y="${f1(y1 + 1.2)}" width="4.4" height="${f1(wh - 1.2)}" fill="url(#gKayu)"/>`;
  const terasEl = teras
    ? `<rect x="${f1(x0 + 3)}" y="${f1(y1 + wh)}" width="${f1(w - 6)}" height="3.5" fill="#D9CDB8"/><rect x="${f1(x0 + 3)}" y="${f1(y1 + wh)}" width="${f1(w - 6)}" height="1" fill="#000" opacity=".12"/>`
    : "";
  const potEl = pot
    ? `<circle cx="${f1(x0 + 2.5)}" cy="${f1(y1 + wh + 1.5)}" r="2.6" fill="#4FA060"/><circle cx="${f1(x1 - 2.5)}" cy="${f1(y1 + wh + 1.5)}" r="2.6" fill="#62AE78"/><circle cx="${f1(x1 - 3.2)}" cy="${f1(y1 + wh + 0.8)}" r=".9" fill="#E35D8C"/>`
    : "";
  return `<g id="${id}">
    ${bayang(rectD(x0, y0, w, h + wh), 6, 6, 0.32)}
    <rect x="${f1(x0 + 1.2)}" y="${f1(y1 - 1)}" width="${f1(w - 2.4)}" height="${f1(wh + 1)}" fill="${dinding}"/>
    <rect x="${f1(x0 + 1.2)}" y="${f1(y1 + wh - 1.4)}" width="${f1(w - 2.4)}" height="1.4" fill="#8D7A68" opacity=".55"/>
    ${jdl}${pintu}${terasEl}
    <rect x="${f1(x0 + 1.2)}" y="${f1(y1)}" width="${f1(w - 2.4)}" height="1.8" fill="#000" opacity=".22"/>
    <path d="${roof}" fill="${a1}"/><path d="${kiri}" fill="${a2}"/><path d="${kanan}" fill="${a3}"/><path d="${back}" fill="${a3}"/>
    <path d="${outline}" fill="url(#pGenteng)"/>
    <path d="M${x0 + r} ${ym}H${x1 - r}" stroke="#fff" stroke-opacity=".55" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M${x0} ${y0}L${x0 + r} ${ym}M${x1} ${y0}L${x1 - r} ${ym}M${x0} ${y1}L${x0 + r} ${ym}M${x1} ${y1}L${x1 - r} ${ym}" stroke="#fff" stroke-opacity=".3" stroke-width=".7"/>
    <path d="${outline}" fill="none" stroke="#3A2A1E" stroke-opacity=".35" stroke-width=".7"/>
    ${potEl}
  </g>`;
}
// Rumah pelana (dua bidang atap)
export function rumahPelana(id, { w = 28, h = 20, wh = 7, atap, dinding }) {
  const [a1, , a3] = atap;
  const x0 = -w / 2, x1 = w / 2, y0 = -h / 2 - wh / 2, y1 = h / 2 - wh / 2, ym = (y0 + y1) / 2 + 1;
  return `<g id="${id}">
    ${bayang(rectD(x0, y0, w, h + wh), 6, 6, 0.32)}
    <rect x="${f1(x0 + 1)}" y="${f1(y1 - 1)}" width="${f1(w - 2)}" height="${f1(wh + 1)}" fill="${dinding}"/>
    <rect x="${f1(x0 + 1)}" y="${f1(y1 + wh - 1.4)}" width="${f1(w - 2)}" height="1.4" fill="#8D7A68" opacity=".55"/>
    <rect x="${f1(x0 + 4)}" y="${f1(y1 + 1.8)}" width="5" height="3.4" fill="url(#gKaca)" stroke="#6F5440" stroke-width=".5"/>
    <rect x="${f1(x1 - 9)}" y="${f1(y1 + 1.8)}" width="5" height="3.4" fill="url(#gKaca)" stroke="#6F5440" stroke-width=".5"/>
    <rect x="-2" y="${f1(y1 + 1.2)}" width="4" height="${f1(wh - 1.2)}" fill="url(#gKayu)"/>
    <rect x="${f1(x0 + 1)}" y="${f1(y1)}" width="${f1(w - 2)}" height="1.8" fill="#000" opacity=".22"/>
    <path d="${rectD(x0, ym, w, y1 - ym)}" fill="${a1}"/><path d="${rectD(x0, y0, w, ym - y0)}" fill="${a3}"/>
    <path d="${rectD(x0, y0, w, h)}" fill="url(#pGenteng)"/>
    <path d="M${x0} ${ym}H${x1}" stroke="#fff" stroke-opacity=".6" stroke-width="1.2"/>
    <path d="${rectD(x0, y0, w, h)}" fill="none" stroke="#3A2A1E" stroke-opacity=".35" stroke-width=".7"/>
  </g>`;
}
// Rumah L (dua massa)
export function rumahL(id, opt) {
  const a = rumahLimas(id + "a", { ...opt, w: 30, h: 20 });
  const b = rumahLimas(id + "b", { ...opt, w: 16, h: 24, jendela: 1 });
  return `<g id="${id}">${a.replace(/^<g id="[^"]+">/, '<g>')}<g transform="translate(14 -9)">${b.replace(/^<g id="[^"]+">/, '<g>')}</g></g>`;
}
// Rumah kampung kecil, atap seng
export function rumahSeng(id, { w = 20, h = 15, wh = 6, dinding }) {
  const [a1, a2, a3] = ATAP.seng;
  const x0 = -w / 2, y0 = -h / 2 - wh / 2, y1 = h / 2 - wh / 2;
  return `<g id="${id}">
    ${bayang(rectD(x0, y0, w, h + wh), 5, 5, 0.3)}
    <rect x="${f1(x0 + 1)}" y="${f1(y1 - 1)}" width="${f1(w - 2)}" height="${f1(wh + 1)}" fill="${dinding}"/>
    <rect x="-1.8" y="${f1(y1 + 1)}" width="3.6" height="${f1(wh - 1)}" fill="url(#gKayu)"/>
    <rect x="${f1(x0 + 3)}" y="${f1(y1 + 1.6)}" width="4" height="3" fill="url(#gKaca)"/>
    <rect x="${f1(x0 + 1)}" y="${f1(y1)}" width="${f1(w - 2)}" height="1.5" fill="#000" opacity=".22"/>
    <path d="M${x0} ${y0}H${-x0 * 1}V${y1}H${x0}Z" fill="${a2}"/>
    <path d="M${x0} ${y0}H${-x0}V${f1((y0 + y1) / 2)}H${x0}Z" fill="${a3}"/>
    <path d="M${x0} ${y0}H${-x0}V${y1}H${x0}Z" fill="url(#pSeng)"/>
    <path d="M${x0} ${f1((y0 + y1) / 2)}H${-x0}" stroke="${a1}" stroke-width="1.2"/>
    <path d="M${x0} ${y0}H${-x0}V${y1}H${x0}Z" fill="none" stroke="#3A2A1E" stroke-opacity=".3" stroke-width=".6"/>
  </g>`;
}

// ------------------------------------------------------------------ warung / lapak pantai
export function lapak(id, [c1, c2], { meja = true } = {}) {
  let garis = "";
  for (let i = 0; i < 7; i++) garis += `<rect x="${f1(-15 + i * (30 / 7))}" y="-12" width="${f1(30 / 7 + 0.1)}" height="16" fill="${i % 2 ? c2 : c1}"/>`;
  let val = "";
  for (let i = 0; i < 6; i++) val += `<path d="M${-15 + i * 5} 4q2.5 4 5 0Z" fill="${i % 2 ? c2 : c1}" stroke="#000" stroke-opacity=".08" stroke-width=".4"/>`;
  const mejaEl = meja
    ? `<circle cx="-4" cy="21" r="5" fill="#152638" opacity=".25" filter="url(#b2)"/>
       <circle cx="-6" cy="19" r="4.2" fill="url(#gKayu)"/><circle cx="-6" cy="19" r="4.2" fill="none" stroke="#6F4B37" stroke-width=".5"/>
       <circle cx="-11.5" cy="20" r="1.8" fill="#E9E3D6"/><circle cx="-0.5" cy="20" r="1.8" fill="#E9E3D6"/><circle cx="-6" cy="24.5" r="1.8" fill="#E9E3D6"/>
       <circle cx="-7" cy="18.2" r=".9" fill="#E0674F"/><circle cx="-5" cy="19.6" r=".9" fill="#F2C14E"/>`
    : "";
  return `<g id="${id}">
    ${bayang(rectD(-16, -12, 32, 26), 6, 6, 0.32)}
    <rect x="-14" y="3" width="28" height="9" fill="#F3E1C2"/>
    <rect x="-14" y="10" width="28" height="2" fill="#A97B4E"/>
    <rect x="-12" y="5.5" width="24" height="3.2" fill="#C99B62"/>
    <circle cx="-8" cy="7" r="1.1" fill="#E0674F"/><circle cx="-5" cy="7" r="1.1" fill="#F2C14E"/><circle cx="-2" cy="7" r="1.1" fill="#7DBE6A"/><circle cx="1" cy="7" r="1.1" fill="#4677B4"/><circle cx="4" cy="7" r="1.1" fill="#E0674F"/><circle cx="7" cy="7" r="1.1" fill="#F2C14E"/>
    ${garis}
    <rect x="-15" y="-12" width="30" height="16" fill="url(#gAwning)"/>
    ${val}
    <rect x="-15" y="-12" width="30" height="16" fill="none" stroke="#1B2A3D" stroke-opacity=".18" stroke-width=".6"/>
    ${mejaEl}
  </g>`;
}
// Warung beratap rumbia (lebih besar)
export function warungRumbia(id) {
  return `<g id="${id}">
    ${bayang(rectD(-20, -14, 40, 32), 7, 7, 0.32)}
    <rect x="-17" y="4" width="34" height="9" fill="#EFD9B3"/>
    <rect x="-15" y="6" width="9" height="7" fill="#8A5A36"/><rect x="-3" y="6" width="16" height="4" fill="#C99B62"/>
    <rect x="-17" y="4" width="34" height="1.8" fill="#000" opacity=".22"/>
    <path d="M-20 -14H20V6H-20Z" fill="#C9A25E"/>
    <path d="M-20 6L0 -4L20 6Z" fill="#D9B470"/><path d="M-20 -14L0 -4L20 -14Z" fill="#B48B45"/>
    <path d="M-20 -14H20V6H-20Z" fill="url(#pRumbia)"/>
    <path d="M-20 -14L0 -4L20 -14M-20 6L0 -4L20 6" stroke="#8C6A33" stroke-opacity=".5" stroke-width=".8" fill="none"/>
    <path d="M-20 6q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0q2 2.5 4 0" fill="#B48B45"/>
  </g>`;
}
// Saung / gazebo
export function saung(id) {
  return `<g id="${id}">
    ${bayang("M-14 -14H14V14H-14Z", 6, 6, 0.3)}
    <path d="M-14 -14H14V14H-14Z" fill="#C9A25E"/>
    <path d="M-14 14L0 0L14 14Z" fill="#DDB874"/><path d="M-14 -14L0 0L-14 14Z" fill="#C9A25E"/>
    <path d="M14 -14L0 0L14 14Z" fill="#B48B45"/><path d="M-14 -14L0 0L14 -14Z" fill="#A67F3E"/>
    <path d="M-14 -14H14V14H-14Z" fill="url(#pRumbia)"/>
    <path d="M-14 -14L14 14M14 -14L-14 14" stroke="#7A5A2C" stroke-opacity=".55" stroke-width=".9"/>
    <circle r="2" fill="#7A5A2C"/>
  </g>`;
}

// ------------------------------------------------------------------ payung & kursi pantai
export function payung(id, [a, b], { kursi = true } = {}) {
  let s = "";
  const R = 12;
  for (let i = 0; i < 8; i++) {
    const t0 = (i * Math.PI) / 4, t1 = ((i + 1) * Math.PI) / 4;
    s += `<path d="M0 0L${f1(R * Math.cos(t0))} ${f1(R * Math.sin(t0))}Q${f1(R * 0.92 * Math.cos((t0 + t1) / 2))} ${f1(R * 0.92 * Math.sin((t0 + t1) / 2))} ${f1(R * Math.cos(t1))} ${f1(R * Math.sin(t1))}Z" fill="${i % 2 ? b : a}"/>`;
  }
  const kursiEl = kursi
    ? `<g transform="translate(3 15) rotate(8)"><path d="M-7 -3h6v13h-6Z M2 -3h6v13h-6Z" fill="#152638" opacity=".2" transform="translate(2 2)" filter="url(#b2)"/>
       <rect x="-7" y="-3" width="6" height="13" rx="1.2" fill="#FFFFFF" stroke="#8FA3B5" stroke-width=".5"/><rect x="-7" y="-3" width="6" height="4" rx="1.2" fill="#DCE6EE"/>
       <rect x="2" y="-3" width="6" height="13" rx="1.2" fill="#FFFFFF" stroke="#8FA3B5" stroke-width=".5"/><rect x="2" y="-3" width="6" height="4" rx="1.2" fill="#DCE6EE"/>
       <rect x="-5" y="3" width="2" height="4" fill="${a}" opacity=".8"/></g>`
    : "";
  return `<g id="${id}">${kursiEl}
    <circle cx="8" cy="9" r="12" fill="#152638" opacity=".22" filter="url(#b4)"/>
    ${s}
    <circle r="${R}" fill="url(#gPayung)"/>
    <circle r="${R}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".6"/>
    <circle r="1.6" fill="#FFFFFF" stroke="#6B4A2B" stroke-width=".6"/>
  </g>`;
}

// ------------------------------------------------------------------ pepohonan
export function pohonBulat(id, [c1, c2, c3], rng, r = 14) {
  let s = `<circle cx="${f1(r * 0.5)}" cy="${f1(r * 0.55)}" r="${f1(r * 1.02)}" fill="#152638" opacity=".3" filter="url(#b4)"/>`;
  s += `<circle r="${r}" fill="${c1}"/>`;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rng.rr(-0.3, 0.3), dd = r * rng.rr(0.45, 0.62);
    s += `<circle cx="${f1(Math.cos(a) * dd)}" cy="${f1(Math.sin(a) * dd)}" r="${f1(r * rng.rr(0.42, 0.55))}" fill="${c1}"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rng.rr(-0.3, 0.3), dd = r * rng.rr(0.3, 0.5);
    s += `<circle cx="${f1(Math.cos(a) * dd - r * 0.12)}" cy="${f1(Math.sin(a) * dd - r * 0.12)}" r="${f1(r * rng.rr(0.32, 0.42))}" fill="${c2}"/>`;
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * 1.25 + rng.rr(-0.7, 0.7), dd = r * rng.rr(0.25, 0.5);
    s += `<circle cx="${f1(Math.cos(a) * dd)}" cy="${f1(Math.sin(a) * dd)}" r="${f1(r * rng.rr(0.18, 0.26))}" fill="${c3}" opacity=".9"/>`;
  }
  for (let i = 0; i < 10; i++) {
    const a = rng.rr(0, Math.PI * 2), dd = r * rng.rr(0.1, 0.9);
    s += `<circle cx="${f1(Math.cos(a) * dd)}" cy="${f1(Math.sin(a) * dd)}" r="${f1(rng.rr(0.6, 1.2))}" fill="${rng.rnd() < 0.5 ? c3 : c1}" opacity=".7"/>`;
  }
  return `<g id="${id}">${s}</g>`;
}
export function kelapa(id, [c1, c2, c3], rng, L = 17) {
  let shadow = "", body = "", leaf = "";
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rng.rr(-0.2, 0.2), len = L * rng.rr(0.85, 1.1), bend = rng.rr(-0.35, 0.35);
    const pt = (t) => {
      const ang = a + bend * t * t;
      return [Math.cos(ang) * len * t, Math.sin(ang) * len * t];
    };
    const [ex, ey] = pt(1), [mx, my] = pt(0.55);
    shadow += `M0 0Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}`;
    // siluet pelepah
    const nx = -Math.sin(a), ny = Math.cos(a), wdt = 3.2;
    body += `<path d="M0 0Q${f1(mx + nx * wdt)} ${f1(my + ny * wdt)} ${f1(ex)} ${f1(ey)}Q${f1(mx - nx * wdt)} ${f1(my - ny * wdt)} 0 0Z" fill="${i % 2 ? c1 : c2}"/>`;
    // anak daun
    for (let t = 0.18; t < 0.98; t += 0.09) {
      const [px, py] = pt(t), [qx, qy] = pt(Math.max(0, t - 0.12)), l = 4.2 * (1 - t * 0.6);
      const dx = (px - qx), dy = (py - qy), m = Math.hypot(dx, dy) || 1, ux = dx / m, uy = dy / m;
      for (const sgn of [1, -1]) {
        const tx = px + (-uy * sgn * 0.9 + ux * 0.45) * l, ty = py + (ux * sgn * 0.9 + uy * 0.45) * l;
        leaf += `M${f1(px)} ${f1(py)}L${f1(tx)} ${f1(ty)}`;
      }
    }
    leaf += `M0 0Q${f1(mx)} ${f1(my)} ${f1(ex)} ${f1(ey)}`;
  }
  return `<g id="${id}">
    <path d="${shadow}" transform="translate(9 10)" stroke="#152638" stroke-width="5" stroke-opacity=".3" fill="none" filter="url(#b2)"/>
    ${body}
    <path d="${leaf}" stroke="${c3}" stroke-width="1.15" stroke-linecap="round" fill="none" opacity=".9"/>
    <circle cx="1.5" cy="1" r="2.4" fill="#7A5A2C"/><circle cx="-1.6" cy="1.8" r="2.1" fill="#8C6A33"/><circle cx="0" cy="-1.6" r="2.1" fill="#9BA84A"/>
  </g>`;
}
export function pisang(id, rng) {
  let s = "";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 360 + rng.rr(-15, 15), l = rng.rr(13, 17);
    s += `<g transform="rotate(${f1(a)})"><path d="M0 0C4 -3 ${f1(l * 0.6)} -5 ${f1(l)} -1C${f1(l * 0.6)} 4 4 3 0 0Z" fill="${i % 2 ? "#7CC04E" : "#93CF5F"}"/>
      <path d="M0 0Q${f1(l * 0.5)} -1 ${f1(l)} -1" stroke="#5E9E3A" stroke-width=".7" fill="none"/>
      <path d="M${f1(l * 0.35)} -2.2l1 -1.6M${f1(l * 0.6)} -2.5l1.2 -1.5M${f1(l * 0.5)} 1.5l1 1.3" stroke="#5E9E3A" stroke-width=".5"/></g>`;
  }
  return `<g id="${id}"><circle cx="8" cy="9" r="13" fill="#152638" opacity=".25" filter="url(#b4)"/>${s}<circle r="2" fill="#6B8F3A"/></g>`;
}
export function cemara(id, rng, r = 12) {
  let a = "", b = "";
  const n = 22;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2, rr1 = r * rng.rr(0.85, 1.05), rr2 = r * 0.45;
    a += `${i ? "L" : "M"}${f1(Math.cos(t) * rr1)} ${f1(Math.sin(t) * rr1)}L${f1(Math.cos(t + Math.PI / n) * rr2)} ${f1(Math.sin(t + Math.PI / n) * rr2)}`;
    b += `${i ? "L" : "M"}${f1(Math.cos(t + 0.1) * rr1 * 0.65 - 1.5)} ${f1(Math.sin(t + 0.1) * rr1 * 0.65 - 1.5)}L${f1(Math.cos(t + Math.PI / n) * rr2 * 0.5 - 1.5)} ${f1(Math.sin(t + Math.PI / n) * rr2 * 0.5 - 1.5)}`;
  }
  return `<g id="${id}"><path d="${a}Z" transform="translate(7 8)" fill="#152638" opacity=".28" filter="url(#b2)"/><path d="${a}Z" fill="#3D7A52"/><path d="${b}Z" fill="#5C9C6C"/><circle r="1.6" fill="#6B4A2B"/></g>`;
}
export function semak(id, rng, bunga) {
  let s = `<ellipse cx="4" cy="5" rx="10" ry="7" fill="#152638" opacity=".25" filter="url(#b2)"/>`;
  for (let i = 0; i < 5; i++) s += `<circle cx="${f1(rng.rr(-5, 5))}" cy="${f1(rng.rr(-4, 4))}" r="${f1(rng.rr(3.5, 5.5))}" fill="${i < 3 ? "#4F9A55" : "#6DB46A"}"/>`;
  if (bunga) for (let i = 0; i < 7; i++) s += `<circle cx="${f1(rng.rr(-6, 6))}" cy="${f1(rng.rr(-5, 4))}" r="1.1" fill="${bunga}"/>`;
  return `<g id="${id}">${s}</g>`;
}

// ------------------------------------------------------------------ lain-lain
export const lainLain = () => `
  <linearGradient id="gAwning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".55" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="gPayung" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>
  <g id="perahu">
    <path d="M-30 0Q-12 -10 30 0Q-12 10 -30 0Z" transform="translate(5 6)" fill="#0E2A46" opacity=".3" filter="url(#b2)"/>
    <path d="M-30 0Q-12 -10 30 0Q-12 10 -30 0Z" fill="#FFFFFF" stroke="#3A6699" stroke-width="1.3"/>
    <path d="M-26 0Q-10 -7 26 0Q-10 7 -26 0Z" fill="#E7EEF4"/>
    <path d="M-24 -2.6Q-6 -7 24 -.8" stroke="#E0674F" stroke-width="2.2" fill="none"/>
    <path d="M-34 -12L34 12M-34 12L34 -12" stroke="#7A5A2C" stroke-width="1.5"/>
    <rect x="-4" y="-2" width="8" height="4" fill="#4677B4"/>
  </g>
  <g id="papan"><path d="M-15 0Q0 -5.5 15 0Q0 5.5 -15 0Z" fill="#F2C14E" stroke="#fff" stroke-width="1"/><path d="M-12 0H12" stroke="#E0674F" stroke-width="1"/><circle cx="2" cy="0" r="2.8" fill="#3B2A22"/><path d="M1 -2.5L-2 -7M1 2.5L-2 7" stroke="#C98A5A" stroke-width="1.6" stroke-linecap="round"/></g>
  <g id="batu"><path d="M-9 2L-6 -6L2 -8L9 -3L8 5L-1 8Z" transform="translate(3 3)" fill="#0E2A46" opacity=".25" filter="url(#b2)"/><path d="M-9 2L-6 -6L2 -8L9 -3L8 5L-1 8Z" fill="#8E8A82"/><path d="M-6 -6L2 -8L9 -3L1 -1Z" fill="#B3AEA4"/><path d="M-9 2L-6 -6L1 -1L-1 8Z" fill="#9F9A91"/></g>
  <g id="lampu"><circle cx="2" cy="2" r="2.5" fill="#152638" opacity=".3" filter="url(#b2)"/><circle r="2.2" fill="#3A4A5C"/><circle r="1.2" fill="#FFE7A3"/></g>
  <g id="bangku"><rect x="-6" y="-2" width="12" height="4" rx="1" fill="url(#gKayu)"/><rect x="-6" y="-2" width="12" height="4" rx="1" fill="none" stroke="#6F4B37" stroke-width=".5"/></g>
  <g id="motor"><rect x="-1.6" y="-5" width="3.2" height="10" rx="1.6" fill="#2D3A4A"/><rect x="-1.2" y="-2" width="2.4" height="4" fill="#D64545"/></g>
  <g id="gubuk"><rect x="-8" y="-8" width="16" height="16" transform="translate(4 4)" fill="#152638" opacity=".25" filter="url(#b2)"/><path d="M-8 -8H8V8H-8Z" fill="#C9A25E"/><path d="M-8 -8L8 8M8 -8L-8 8" stroke="#8C6A33" stroke-width=".8"/><path d="M-8 -8H8V8H-8Z" fill="url(#pRumbia)"/></g>
`;
