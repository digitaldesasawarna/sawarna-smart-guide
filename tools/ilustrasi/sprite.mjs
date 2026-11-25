/*
 * Sprite 2.5D: objek "berdiri" menghadap penonton (dinding depan + samping terlihat).
 * Titik (0,0) = titik pijak di tanah (tengah bawah). Arah atas layar = -y.
 * Sprite selalu tegak di layar: generator memutar sprite sebesar sudut arah pandang.
 * Cahaya dari kiri atas layar → sisi kanan lebih gelap, bayangan jatuh ke kanan.
 * 1 unit ≈ 0,55 m (skala bangunan dilebihkan ±1,3× agar terbaca, seperti peta wisata).
 */
import { f1 } from "./simbol.mjs";

const bayangTanah = (rx, ry, dx = 0, op = 0.28) =>
  `<ellipse cx="${f1(dx)}" cy="1" rx="${f1(rx)}" ry="${f1(ry)}" fill="#152638" opacity="${op}" filter="url(#b4)"/>`;
const poly = (pts, fill, extra = "") => `<path d="M${pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join("L")}Z" fill="${fill}"${extra}/>`;

// ------------------------------------------------------------------ rumah
/*
 * w: lebar depan, dd: kedalaman samping, lantai: 1|2, atap: [terang, sedang, gelap], dinding, opsi.
 */
export function rumah(id, { w = 30, dd = 12, lantai = 1, atap, dinding, dindingSamping, balkon = false, teras = false, pagar = false, kayu = false }) {
  const [a1, a2, a3] = atap;
  const tl = 14; // tinggi per lantai
  const h = tl * lantai;
  const ox = dd * 0.9, oy = -dd * 0.55; // vektor kedalaman (ke kanan-atas)
  const x0 = -w / 2, x1 = w / 2;
  const samp = dindingSamping || "#D9C8AE";
  let s = bayangTanah(w * 0.75, 7, w * 0.25);
  // dinding samping (kanan)
  s += poly([[x1, 0], [x1 + ox, oy], [x1 + ox, oy - h], [x1, -h]], samp);
  // dinding depan
  s += `<rect x="${f1(x0)}" y="${f1(-h)}" width="${f1(w)}" height="${f1(h)}" fill="${dinding}"/>`;
  if (kayu) for (let y = -h + 2; y < 0; y += 2.6) s += `<path d="M${f1(x0)} ${f1(y)}H${f1(x1)}" stroke="#8A5A36" stroke-opacity=".25" stroke-width=".6"/>`;
  s += `<rect x="${f1(x0)}" y="-2" width="${f1(w)}" height="2" fill="#8D7A68" opacity=".6"/>`;
  // jendela & pintu per lantai
  for (let L = 0; L < lantai; L++) {
    const yb = -L * tl; // dasar lantai
    const nj = Math.max(2, Math.round(w / 11));
    for (let i = 0; i < nj; i++) {
      const cx = x0 + (w * (i + 0.5)) / nj;
      if (L === 0 && i === Math.floor(nj / 2)) {
        s += `<rect x="${f1(cx - 2.6)}" y="${f1(yb - 9.5)}" width="5.2" height="9.5" fill="url(#gKayu)"/><circle cx="${f1(cx + 1.4)}" cy="${f1(yb - 4.8)}" r=".5" fill="#F2C14E"/>`;
      } else {
        s += `<rect x="${f1(cx - 2.8)}" y="${f1(yb - 10)}" width="5.6" height="5.4" fill="url(#gKaca)" stroke="#fff" stroke-width=".8"/><path d="M${f1(cx)} ${f1(yb - 10)}V${f1(yb - 4.6)}" stroke="#fff" stroke-width=".5"/>`;
      }
    }
    // jendela samping
    s += poly([[x1 + ox * 0.35, oy * 0.35 + yb - 4.5], [x1 + ox * 0.65, oy * 0.65 + yb - 4.5], [x1 + ox * 0.65, oy * 0.65 + yb - 9.5], [x1 + ox * 0.35, oy * 0.35 + yb - 9.5]], "#7FA9CC");
  }
  if (balkon && lantai > 1) {
    s += `<rect x="${f1(x0 - 1)}" y="${f1(-tl - 1)}" width="${f1(w + 2)}" height="2.2" fill="#E8DCC8"/>`;
    for (let x = x0; x <= x1; x += 2.2) s += `<path d="M${f1(x)} ${f1(-tl - 1)}v-4.5" stroke="#FFFFFF" stroke-width=".7"/>`;
    s += `<path d="M${f1(x0 - 1)} ${f1(-tl - 5.5)}H${f1(x1 + 1)}" stroke="#FFFFFF" stroke-width="1.1"/>`;
  }
  // bayangan di bawah teritis
  s += `<rect x="${f1(x0)}" y="${f1(-h)}" width="${f1(w)}" height="2.2" fill="#000" opacity=".2"/>`;
  // atap perisai (limas)
  const e = 3, rh = 11 + w * 0.06; // emperan & tinggi atap
  const A = [x0 - e, -h + 1], Bp = [x1 + e, -h + 1], E = [x1 + e + ox, -h + 1 + oy], Fp = [x0 - e + ox, -h + 1 + oy];
  const r1 = [x0 + w * 0.28 + ox * 0.5, -h - rh + oy * 0.5], r2 = [x1 - w * 0.28 + ox * 0.5, -h - rh + oy * 0.5];
  s += poly([Fp, E, r2, r1], a3); // belakang
  s += poly([Bp, E, r2], a2); // samping kanan
  s += poly([A, Fp, r1], a2); // samping kiri
  s += poly([A, Bp, r2, r1], a1); // depan
  s += poly([A, Bp, r2, r1], "url(#pGenteng)");
  s += `<path d="M${f1(r1[0])} ${f1(r1[1])}L${f1(r2[0])} ${f1(r2[1])}" stroke="#fff" stroke-opacity=".55" stroke-width="1.1" stroke-linecap="round"/>`;
  s += `<path d="M${f1(A[0])} ${f1(A[1])}L${f1(Bp[0])} ${f1(Bp[1])}L${f1(E[0])} ${f1(E[1])}" stroke="#3A2A1E" stroke-opacity=".35" stroke-width=".8" fill="none"/>`;
  if (teras) s += `<rect x="${f1(x0 + 2)}" y="0" width="${f1(w - 4)}" height="3" fill="#D9CDB8"/><rect x="${f1(x0 + 2)}" y="0" width="${f1(w - 4)}" height=".8" fill="#000" opacity=".15"/>`;
  if (pagar) {
    for (let x = x0 - 4; x <= x1 + 4; x += 2.6) s += `<path d="M${f1(x)} 7v-4" stroke="#FFFFFF" stroke-width=".9"/>`;
    s += `<path d="M${f1(x0 - 4)} 4.5H${f1(x1 + 4)}" stroke="#FFFFFF" stroke-width=".9"/>`;
  }
  return `<g id="${id}">${s}</g>`;
}
// rumah panggung kayu beratap rumbia (cottage)
export function pondok(id) {
  const w = 24, ox = 10, oy = -6, h = 12;
  let s = bayangTanah(18, 6, 6);
  for (const x of [-10, -3, 4, 10]) s += `<rect x="${x - 0.8}" y="-5" width="1.6" height="5" fill="#6F4B37"/>`;
  s += poly([[w / 2, -5], [w / 2 + ox, -5 + oy], [w / 2 + ox, -5 + oy - h], [w / 2, -5 - h]], "#A87B52");
  s += `<rect x="${-w / 2}" y="${-5 - h}" width="${w}" height="${h}" fill="#C89A68"/>`;
  for (let y = -5 - h + 2; y < -5; y += 2.4) s += `<path d="M${-w / 2} ${f1(y)}H${w / 2}" stroke="#8A5A36" stroke-opacity=".35" stroke-width=".6"/>`;
  s += `<rect x="-2.5" y="${-5 - 9}" width="5" height="9" fill="#6F4B37"/><rect x="-10" y="${-5 - 9}" width="5" height="4.5" fill="url(#gKaca)"/><rect x="5" y="${-5 - 9}" width="5" height="4.5" fill="url(#gKaca)"/>`;
  s += `<rect x="-6" y="-5" width="12" height="1.6" fill="#8A5A36"/>`;
  const top = -5 - h;
  s += poly([[-w / 2 - 4, top + 2], [-w / 2 - 4 + ox, top + 2 + oy], [ox / 2, top - 16 + oy / 2]], "#B48B45");
  s += poly([[w / 2 + 4, top + 2], [w / 2 + 4 + ox, top + 2 + oy], [ox / 2, top - 16 + oy / 2]], "#9C7638");
  s += poly([[-w / 2 - 4, top + 2], [w / 2 + 4, top + 2], [ox / 2, top - 16 + oy / 2]], "#D2AE68");
  s += poly([[-w / 2 - 4, top + 2], [w / 2 + 4, top + 2], [ox / 2, top - 16 + oy / 2]], "url(#pRumbia)");
  return `<g id="${id}">${s}</g>`;
}

// ------------------------------------------------------------------ kios / warung pantai
export function kios(id, [c1, c2], { lebar = 26 } = {}) {
  const w = lebar, ox = 8, oy = -5, h = 13;
  let s = bayangTanah(w * 0.7, 6, 6);
  s += poly([[w / 2, 0], [w / 2 + ox, oy], [w / 2 + ox, oy - h], [w / 2, -h]], "#C9A27A");
  s += `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="#F3E1C2"/>`;
  // meja saji & barang
  s += `<rect x="${-w / 2 + 1}" y="-7" width="${w - 2}" height="7" fill="url(#gKayu)"/>`;
  for (let x = -w / 2 + 3; x < w / 2 - 2; x += 3.2) s += `<circle cx="${f1(x)}" cy="-8.4" r="1.3" fill="${["#E0674F", "#F2C14E", "#7DBE6A", "#4677B4", "#FFFFFF"][Math.abs(Math.round(x)) % 5]}"/>`;
  s += `<rect x="${-w / 2 + 2}" y="${-h + 1}" width="${w - 4}" height="3" fill="#9BC4E2" opacity=".7"/>`;
  // tenda bergaris miring ke depan
  const t = -h - 1, ta = t - 8;
  let gar = "";
  const n = 8;
  for (let i = 0; i < n; i++) {
    const xa = -w / 2 - 2 + ((w + 4) * i) / n, xb = -w / 2 - 2 + ((w + 4) * (i + 1)) / n;
    gar += poly([[xa + ox * 0.0, ta + oy * 0.6], [xb, ta + oy * 0.6], [xb - 0.8, t + 2], [xa - 0.8, t + 2]], i % 2 ? c2 : c1);
  }
  s += poly([[w / 2 + 2, ta + oy * 0.6], [w / 2 + 2 + ox, ta + oy * 1.6], [w / 2 + 2 + ox, t + 2 + oy], [w / 2 + 2, t + 2]], c1, ' opacity=".85"');
  s += gar;
  s += poly([[-w / 2 - 2.8, t + 2], [w / 2 + 1.2, t + 2], [w / 2 + 1.2, t + 4], [-w / 2 - 2.8, t + 4]], "#000", ' opacity=".12"');
  let val = "";
  for (let x = -w / 2 - 2.8; x < w / 2; x += 4) val += `<path d="M${f1(x)} ${f1(t + 2)}q2 3.6 4 0Z" fill="${Math.round((x + 40) / 4) % 2 ? c2 : c1}"/>`;
  s += val;
  // papan nama
  s += `<rect x="-6" y="${f1(ta + oy * 0.6 - 5)}" width="12" height="4.6" rx="1" fill="#FFFFFF" stroke="${c1}" stroke-width=".8"/>`;
  s += `<path d="M-4 ${f1(ta + oy * 0.6 - 2.7)}h8" stroke="${c1}" stroke-width="1.2"/>`;
  return `<g id="${id}">${s}</g>`;
}
export function warung(id) {
  const w = 34, ox = 10, oy = -6, h = 13;
  let s = bayangTanah(26, 7, 8);
  s += poly([[w / 2, 0], [w / 2 + ox, oy], [w / 2 + ox, oy - h], [w / 2, -h]], "#B98E61");
  s += `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="#E9CFA4"/>`;
  s += `<rect x="${-w / 2 + 3}" y="${-h + 3}" width="${w - 6}" height="${h - 7}" fill="#5A4030"/>`;
  s += `<rect x="${-w / 2 + 3}" y="-6" width="${w - 6}" height="3" fill="url(#gKayu)"/>`;
  for (let x = -w / 2 + 6; x < w / 2 - 4; x += 4) s += `<rect x="${x}" y="${-h + 5}" width="2" height="3" fill="${["#F2C14E", "#E0674F", "#7DBE6A"][Math.abs(x) % 3]}"/>`;
  const top = -h;
  s += poly([[-w / 2 - 5, top + 2], [-w / 2 - 5 + ox, top + 2 + oy], [ox / 2, top - 14 + oy / 2]], "#B48B45");
  s += poly([[w / 2 + 5, top + 2], [w / 2 + 5 + ox, top + 2 + oy], [ox / 2, top - 14 + oy / 2]], "#9C7638");
  s += poly([[-w / 2 - 5, top + 2], [w / 2 + 5, top + 2], [ox / 2, top - 14 + oy / 2]], "#D2AE68");
  s += poly([[-w / 2 - 5, top + 2], [w / 2 + 5, top + 2], [ox / 2, top - 14 + oy / 2]], "url(#pRumbia)");
  // meja & bangku depan
  s += `<rect x="${-w / 2 - 2}" y="4" width="14" height="2.2" fill="url(#gKayu)"/><rect x="${-w / 2}" y="6" width="1.2" height="3" fill="#6F4B37"/><rect x="${-w / 2 + 9}" y="6" width="1.2" height="3" fill="#6F4B37"/>`;
  return `<g id="${id}">${s}</g>`;
}
export function gazebo(id) {
  let s = bayangTanah(16, 5, 5);
  s += `<rect x="-13" y="-4" width="26" height="4" fill="#B98C5B"/>`;
  s += poly([[13, 0], [19, -4], [19, -8], [13, -4]], "#8E6740");
  for (const x of [-12, 11]) s += `<rect x="${x}" y="-20" width="1.6" height="16" fill="#7A5A3A"/>`;
  s += poly([[-17, -19], [20, -19], [24, -23], [2, -36]], "#9C7638");
  s += poly([[-17, -19], [20, -19], [2, -36]], "#D2AE68");
  s += poly([[-17, -19], [20, -19], [2, -36]], "url(#pRumbia)");
  return `<g id="${id}">${s}</g>`;
}

// ------------------------------------------------------------------ pantai
export function payung(id, [a, b]) {
  let s = bayangTanah(12, 4, 7, 0.22);
  // kursi pantai
  s += poly([[-12, 2], [-3, 2], [-1, -2.5], [-9, -2.5]], "#FFFFFF", ' stroke="#9DB0C2" stroke-width=".5"');
  s += poly([[-9, -2.5], [-1, -2.5], [-2.5, -6], [-8, -6]], "#DCE6EE");
  s += `<path d="M0 0V-19" stroke="#7A5A3A" stroke-width="1.2"/>`;
  let seg = "";
  const n = 8, R = 13, top = -19;
  for (let i = 0; i < n; i++) {
    const x0 = -R + (2 * R * i) / n, x1 = -R + (2 * R * (i + 1)) / n;
    seg += `<path d="M0 ${top - 6}L${f1(x0)} ${top + 2}Q${f1((x0 + x1) / 2)} ${top + 3.6} ${f1(x1)} ${top + 2}Z" fill="${i % 2 ? b : a}"/>`;
  }
  s += seg + `<path d="M0 ${top - 6}L${-R} ${top + 2}L${R} ${top + 2}Z" fill="url(#gPayung)"/><circle cx="0" cy="${top - 6}" r="1" fill="#fff"/>`;
  return `<g id="${id}">${s}</g>`;
}
export function orang(id, baju, celana = "#2D3A4A", kulit = "#C98A5A", rambut = "#2B1D14") {
  return `<g id="${id}"><ellipse cx="1.5" cy=".6" rx="3" ry="1" fill="#152638" opacity=".3"/>
    <path d="M-1 0V-4.4M1 0V-4.4" stroke="${celana}" stroke-width="1.3" stroke-linecap="round"/>
    <rect x="-1.8" y="-8.6" width="3.6" height="4.6" rx="1.2" fill="${baju}"/>
    <path d="M-1.9 -7.6l-.8 3M1.9 -7.6l.8 3" stroke="${kulit}" stroke-width=".9" stroke-linecap="round"/>
    <circle cx="0" cy="-10.2" r="1.7" fill="${kulit}"/><path d="M-1.7 -10.6a1.7 1.7 0 0 1 3.4 0Z" fill="${rambut}"/></g>`;
}
export function perenang(id, warna) {
  return `<g id="${id}"><ellipse cx="0" cy="0" rx="4" ry="1.4" fill="none" stroke="#fff" stroke-width=".8" opacity=".9"/><circle cx="0" cy="-1" r="1.5" fill="#C98A5A"/><path d="M-1.5 -1.4a1.5 1.5 0 0 1 3 0Z" fill="${warna}"/></g>`;
}
export const peselancar = (id) => `<g id="${id}"><path d="M-9 1Q0 -2 9 1Q0 3 -9 1Z" fill="#F2C14E" stroke="#fff" stroke-width=".7"/><path d="M-12 3q6 -4 12 0t12 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".9"/>
  <path d="M-1 0l-1.5 -4M1.5 0l1 -4" stroke="#2D3A4A" stroke-width="1.2" stroke-linecap="round"/><rect x="-1.8" y="-8.4" width="3.6" height="4.6" rx="1.2" fill="#E0674F" transform="rotate(-12 0 -6)"/>
  <path d="M-2 -7l-4 1.5M2 -7.2l4 -1.6" stroke="#C98A5A" stroke-width=".9" stroke-linecap="round"/><circle cx="-.6" cy="-10" r="1.6" fill="#C98A5A"/></g>`;
export const bananaBoat = (id) => `<g id="${id}"><ellipse cx="0" cy="2" rx="16" ry="3" fill="#fff" opacity=".6"/>
  <path d="M-14 0Q-15 -4 -10 -4H10Q15 -4 14 0Q0 3 -14 0Z" fill="#F2C14E" stroke="#C99A1E" stroke-width=".6"/>
  ${[-8, -2, 4].map((x, i) => `<rect x="${x - 1.4}" y="-9" width="2.8" height="4.6" rx="1" fill="${["#E0674F", "#4677B4", "#D35B9A"][i]}"/><circle cx="${x}" cy="-10.4" r="1.4" fill="#C98A5A"/>`).join("")}
  <path d="M14 -1L30 -2" stroke="#fff" stroke-width=".6"/></g>`;
export const kapal = (id) => `<g id="${id}"><ellipse cx="2" cy="2" rx="22" ry="3.4" fill="#0E2A46" opacity=".25" filter="url(#b2)"/>
  <path d="M-20 -4H20L15 3H-15Z" fill="#8C4A2F"/><path d="M-20 -4H20L19 -2H-19Z" fill="#E7EEF4"/>
  <rect x="-7" y="-12" width="12" height="8" fill="#F7F1E3" stroke="#8C4A2F" stroke-width=".6"/><rect x="-5" y="-10.5" width="3" height="3" fill="#7FA9CC"/><rect x="0" y="-10.5" width="3" height="3" fill="#7FA9CC"/>
  <path d="M10 -4V-22M10 -22L-14 -4" stroke="#5A3E22" stroke-width=".8"/><path d="M-24 -4H24" stroke="#fff" stroke-width=".5" opacity=".7"/>
  <path d="M-30 -2L30 -2" stroke="#7A5A2C" stroke-width="1" opacity=".6"/></g>`;
export const perahu = (id) => `<g id="${id}"><ellipse cx="2" cy="1.5" rx="16" ry="2.5" fill="#152638" opacity=".25" filter="url(#b2)"/>
  <path d="M-15 -3Q0 -5 15 -3L11 2H-11Z" fill="#FFFFFF" stroke="#3A6699" stroke-width=".8"/><path d="M-13 -1.4H13" stroke="#E0674F" stroke-width="1.4"/>
  <path d="M-20 0H20" stroke="#7A5A2C" stroke-width=".9"/></g>`;
export const camar = (id) => `<g id="${id}"><path d="M-4 0q2 -2.5 4 0q2 -2.5 4 0" stroke="#fff" stroke-width="1" fill="none" stroke-linecap="round"/></g>`;

// ------------------------------------------------------------------ pepohonan
export function pohon(id, [c1, c2, c3], rng, r = 12) {
  const cy = -r - 8;
  let s = bayangTanah(r * 0.95, r * 0.38, r * 0.45);
  s += `<path d="M-1.4 0L-1 ${f1(cy + r * 0.4)}H1L1.4 0Z" fill="#7A5A3A"/>`;
  s += `<circle cx="0" cy="${f1(cy)}" r="${r}" fill="${c1}"/>`;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rng.rr(-0.3, 0.3), dd = r * rng.rr(0.45, 0.62);
    s += `<circle cx="${f1(Math.cos(a) * dd)}" cy="${f1(cy + Math.sin(a) * dd * 0.85)}" r="${f1(r * rng.rr(0.42, 0.55))}" fill="${c1}"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const a = Math.PI * 1.25 + rng.rr(-1, 1), dd = r * rng.rr(0.2, 0.5);
    s += `<circle cx="${f1(Math.cos(a) * dd)}" cy="${f1(cy + Math.sin(a) * dd)}" r="${f1(r * rng.rr(0.3, 0.42))}" fill="${c2}"/>`;
  }
  for (let i = 0; i < 4; i++) {
    const a = Math.PI * 1.25 + rng.rr(-0.6, 0.6), dd = r * rng.rr(0.3, 0.55);
    s += `<circle cx="${f1(Math.cos(a) * dd)}" cy="${f1(cy + Math.sin(a) * dd)}" r="${f1(r * rng.rr(0.16, 0.24))}" fill="${c3}" opacity=".9"/>`;
  }
  s += `<path d="M${f1(r * 0.2)} ${f1(cy + r * 0.95)}a${r} ${f1(r * 0.6)} 0 0 0 ${f1(r * 0.75)} ${f1(-r * 0.6)}" fill="#152638" opacity=".12"/>`;
  return `<g id="${id}">${s}</g>`;
}
export function kelapa(id, [c1, c2, c3], rng, tinggi = 30) {
  const lean = rng.rr(-6, 6);
  const tx = lean, ty = -tinggi;
  let s = `<ellipse cx="${f1(10)}" cy="1" rx="12" ry="4" fill="#152638" opacity=".22" filter="url(#b4)"/>`;
  s += `<path d="M-1.6 0Q${f1(lean * 0.2)} ${f1(-tinggi * 0.5)} ${f1(tx - 1)} ${f1(ty)}H${f1(tx + 1)}Q${f1(lean * 0.2 + 2.4)} ${f1(-tinggi * 0.5)} 1.6 0Z" fill="#9C7A55"/>`;
  for (let y = -3; y > ty + 2; y -= 2.6) s += `<path d="M${f1(-1.6 + (lean * -y) / tinggi)} ${f1(y)}h3" stroke="#6F5238" stroke-width=".5"/>`;
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + ((i / (n - 1)) - 0.5) * Math.PI * 1.9 + rng.rr(-0.1, 0.1);
    const L = rng.rr(13, 17), droop = 7 + Math.abs(Math.cos(a)) * 5;
    const ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * 0.55 + droop;
    const mx = tx + Math.cos(a) * L * 0.55, my = ty + Math.sin(a) * L * 0.45 - 3;
    s += `<path d="M${f1(tx)} ${f1(ty)}Q${f1(mx)} ${f1(my - 2)} ${f1(ex)} ${f1(ey)}Q${f1(mx)} ${f1(my + 3)} ${f1(tx)} ${f1(ty)}Z" fill="${i % 2 ? c1 : c2}"/>`;
    let lf = "";
    for (let t = 0.2; t < 0.95; t += 0.1) {
      const px = (1 - t) * (1 - t) * tx + 2 * (1 - t) * t * mx + t * t * ex, py = (1 - t) * (1 - t) * ty + 2 * (1 - t) * t * (my - 0.5) + t * t * ey;
      lf += `M${f1(px)} ${f1(py)}l${f1(Math.cos(a + 1.2) * 3.4)} ${f1(Math.sin(a + 1.2) * 2.4 + 1.6)}M${f1(px)} ${f1(py)}l${f1(Math.cos(a - 1.2) * 3.4)} ${f1(Math.sin(a - 1.2) * 2.4 + 1.6)}`;
    }
    s += `<path d="${lf}" stroke="${c3}" stroke-width=".9" stroke-linecap="round" opacity=".85"/>`;
  }
  s += `<circle cx="${f1(tx - 1.6)}" cy="${f1(ty + 2)}" r="1.9" fill="#8C6A33"/><circle cx="${f1(tx + 1.5)}" cy="${f1(ty + 2.4)}" r="1.9" fill="#9BA84A"/>`;
  return `<g id="${id}">${s}</g>`;
}
export function pisang(id, rng) {
  let s = bayangTanah(10, 3.5, 5, 0.22);
  s += `<path d="M-1.4 0L-1 -10H1L1.4 0Z" fill="#8FA45A"/>`;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i / 5 - 0.5) * Math.PI * 1.5, L = rng.rr(11, 15);
    const ex = Math.cos(a) * L, ey = -10 + Math.sin(a) * L * 0.8 + 3;
    s += `<path d="M0 -10Q${f1(ex * 0.5 - 3)} ${f1(-10 + (ey + 10) * 0.5 - 4)} ${f1(ex)} ${f1(ey)}Q${f1(ex * 0.5 + 3)} ${f1(-10 + (ey + 10) * 0.5 + 2)} 0 -10Z" fill="${i % 2 ? "#7CC04E" : "#99D35F"}"/><path d="M0 -10L${f1(ex)} ${f1(ey)}" stroke="#5E9E3A" stroke-width=".5"/>`;
  }
  return `<g id="${id}">${s}</g>`;
}
export function cemara(id, rng) {
  let s = bayangTanah(8, 3, 5, 0.22);
  s += `<rect x="-1" y="-6" width="2" height="6" fill="#6F4B37"/>`;
  for (let k = 0; k < 4; k++) {
    const y = -6 - k * 7, w = 10 - k * 2;
    s += `<path d="M${-w} ${y}L0 ${y - 12}L${w} ${y}Z" fill="${k % 2 ? "#3D7A52" : "#4A8A5E"}"/><path d="M0 ${y - 12}L${w} ${y}L${w * 0.3} ${y}Z" fill="#2F6343" opacity=".5"/>`;
  }
  return `<g id="${id}">${s}</g>`;
}
export function semak(id, rng, bunga) {
  let s = bayangTanah(8, 2.5, 3, 0.2);
  for (let i = 0; i < 6; i++) s += `<circle cx="${f1(rng.rr(-6, 6))}" cy="${f1(rng.rr(-8, -3))}" r="${f1(rng.rr(3.2, 4.8))}" fill="${i < 3 ? "#4F9A55" : "#6DB46A"}"/>`;
  if (bunga) for (let i = 0; i < 8; i++) s += `<circle cx="${f1(rng.rr(-7, 7))}" cy="${f1(rng.rr(-11, -3))}" r="1.1" fill="${bunga}"/>`;
  return `<g id="${id}">${s}</g>`;
}

// ------------------------------------------------------------------ jalan & fasilitas
export const lampu = (id) => `<g id="${id}"><ellipse cx="3" cy=".8" rx="3" ry="1" fill="#152638" opacity=".3"/><path d="M0 0V-20" stroke="#3A4A5C" stroke-width="1.1"/><path d="M0 -20q3 -1 4 1" stroke="#3A4A5C" stroke-width="1" fill="none"/><circle cx="4" cy="-18.6" r="1.6" fill="#FFE7A3" stroke="#3A4A5C" stroke-width=".5"/></g>`;
export const umbul = (id) => `<g id="${id}"><path d="M0 0V-30Q4 -32 6 -28" stroke="#8C8C8C" stroke-width=".9" fill="none"/><path d="M0.5 -29Q6 -27 4 -18Q2 -12 5 -6L0.5 -6Z" fill="#D64545"/><path d="M0.5 -18Q3 -16 2.5 -12Q2 -9 3 -6H0.5Z" fill="#FFFFFF"/></g>`;
export const mobil = (id, warna) => `<g id="${id}"><ellipse cx="2" cy="1" rx="10" ry="2.4" fill="#152638" opacity=".3" filter="url(#b2)"/>
  <path d="M-9 0V-4Q-9 -6 -7 -6L-4 -10H5L8 -6Q10 -6 10 -4V0Z" fill="${warna}"/><path d="M-3.4 -9.2H1V-6H-5.6Z M2 -9.2H4.6L6.8 -6H2Z" fill="#BFDCEF"/>
  <circle cx="-5" cy="0" r="1.8" fill="#1F2937"/><circle cx="6" cy="0" r="1.8" fill="#1F2937"/><path d="M-9 -3H10" stroke="#fff" stroke-opacity=".35" stroke-width=".6"/></g>`;
export const motor = (id) => `<g id="${id}"><ellipse cx="1" cy=".8" rx="5" ry="1.2" fill="#152638" opacity=".3"/><circle cx="-3.4" cy="-1.6" r="1.6" fill="none" stroke="#1F2937" stroke-width="1"/><circle cx="3.4" cy="-1.6" r="1.6" fill="none" stroke="#1F2937" stroke-width="1"/><path d="M-3 -2.6H2L3.6 -5" stroke="#D64545" stroke-width="1.6"/><rect x="-1.4" y="-9" width="2.8" height="4" rx="1" fill="#4677B4"/><circle cx="0" cy="-10.4" r="1.4" fill="#2D3A4A"/></g>`;
export function gapura(id, teks = "PANTAI CIANTIR") {
  let s = bayangTanah(34, 6, 10);
  const tiang = (x) => `<rect x="${x - 4}" y="-26" width="8" height="26" fill="#B85C3A"/><rect x="${x + 4}" y="-28" width="3" height="28" fill="#8E4429"/>
    ${[-4, -10, -16, -22].map((y) => `<path d="M${x - 4} ${y}h8" stroke="#E7B39A" stroke-width=".6"/>`).join("")}
    <path d="M${x - 6} -26L${x} -34L${x + 7} -26Z" fill="#7A3A22"/><rect x="${x - 5}" y="-27" width="11" height="2" fill="#E2C9A0"/>`;
  s += tiang(-22) + tiang(22);
  s += `<rect x="-26" y="-36" width="52" height="9" fill="#E9D3A9" stroke="#8E4429" stroke-width="1"/>`;
  s += `<text x="0" y="-29.6" font-family="Arial, Helvetica, sans-serif" font-size="5.4" font-weight="700" text-anchor="middle" fill="#7A3A22">${teks}</text>`;
  s += `<path d="M-32 -36L0 -50L32 -36Z" fill="#C9623C"/><path d="M-32 -36L0 -50L32 -36Z" fill="url(#pGenteng)"/><path d="M0 -50L32 -36L36 -39L4 -52Z" fill="#A94D2F"/>`;
  s += `<path d="M-6 -51h12" stroke="#7A3A22" stroke-width="2"/>`;
  return `<g id="${id}">${s}</g>`;
}
export const batu = (id) => `<g id="${id}"><ellipse cx="2" cy="1" rx="8" ry="2" fill="#152638" opacity=".25" filter="url(#b2)"/><path d="M-7 0Q-8 -5 -3 -7Q2 -9 6 -5Q8 -2 7 0Z" fill="#8E8A82"/><path d="M-3 -7Q2 -9 6 -5Q3 -5 0 -4Q-2 -5 -3 -7Z" fill="#B3AEA4"/></g>`;
