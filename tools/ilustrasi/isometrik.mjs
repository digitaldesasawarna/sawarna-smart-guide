/*
 * Proyeksi isometrik (dimetrik 2:1, gaya Icograms / Rod Hunt) dan ekstrusi bangunan dari jejak asli.
 *
 * Koordinat peta (unit generator, y ke selatan) → layar isometrik untuk arah pandang `a`
 * (arah yang dihadapi = atas layar): putar sebesar −a, lalu tekan sumbu y menjadi 0,5.
 *   X = A·x + C·y + E,  Y = B·x + D·y + F
 * Matriks yang sama dipakai Leaflet (js/iso.js) sehingga marker & GPS tetap tepat.
 */
import { f1, ATAP, DINDING } from "./simbol.mjs";

export const ISO_K = 0.5;     // tekanan vertikal (2:1)
export const S0 = 0.932;      // piksel per unit pada zoom 18 (sama dengan versi sebelumnya)
const PAD = 90;

export function matriks(a, W, H) {
  const t = (-a * Math.PI) / 180, cs = Math.cos(t), sn = Math.sin(t), cx = W / 2, cy = H / 2;
  const mentah = (x, y) => [cs * (x - cx) - sn * (y - cy), ISO_K * (sn * (x - cx) + cs * (y - cy))];
  const sd = [[0, 0], [W, 0], [W, H], [0, H]].map(([x, y]) => mentah(x, y));
  const minX = Math.min(...sd.map((p) => p[0])) - PAD, maxX = Math.max(...sd.map((p) => p[0])) + PAD;
  const minY = Math.min(...sd.map((p) => p[1])) - PAD * 1.4, maxY = Math.max(...sd.map((p) => p[1])) + PAD;
  const m = [cs, ISO_K * sn, -sn, ISO_K * cs, -cs * cx + sn * cy - minX, -ISO_K * (sn * cx + cs * cy) - minY];
  return { m: m.map((v) => Math.round(v * 1e6) / 1e6), w: Math.round(maxX - minX), h: Math.round(maxY - minY) };
}
export const proyektor = ([A, B, C, D, E, F]) => (x, y) => [A * x + C * y + E, B * x + D * y + F];

// ---------------------------------------------------------------- bantu warna
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const keHex = (r) => "#" + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const terang = (c, k) => keHex(hex(c).map((v) => v + (k > 0 ? (255 - v) * k : v * k)));
const hashAngka = (n) => { let h = 2166136261; for (const ch of String(n)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
const d = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join("") + "Z";
const GARIS = `stroke="#26313D" stroke-opacity=".42" stroke-width=".7" stroke-linejoin="round"`;
// cahaya dari kiri atas layar: bidang menghadap kiri lebih terang
const bayangBidang = (warna, nx, ny) => {
  const l = Math.hypot(nx, ny) || 1;
  return terang(warna, (-nx / l) * 0.12 - (ny / l < 0.3 ? 0.06 : 0) - 0.04);
};

/*
 * Bangunan isometrik dari jejak OSM.
 * g: { poly (unit peta), c, jenis: rumah|rumah2|kios|warung|seng, atap, id }, P: proyektor
 */
export function gedung(g, P, TENDA) {
  const r = hashAngka(g.id);
  const base = g.poly.map(([x, y]) => P(x, y));
  const n = base.length;
  const c = base.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0]);
  const h = { rumah2: 19, kios: 7, warung: 8, seng: 9 }[g.jenis] ?? 11;
  const dinding = g.jenis === "kios" ? "#F3E1C2" : g.jenis === "warung" ? "#E9CFA4" : DINDING[Math.floor(r * DINDING.length)];
  const tenda = TENDA[Math.floor(r * TENDA.length)];
  const atap = g.jenis === "kios" ? [tenda[0], terang(tenda[0], -0.12), terang(tenda[0], -0.25)]
    : g.jenis === "warung" ? ["#D9B470", "#B48B45", "#9C7638"]
    : ATAP[g.jenis === "seng" ? "seng" : g.atap] || ATAP.terakota;
  let s = `<path d="${d(base.map(([x, y]) => [x + 5, y + 2.5]))}" fill="#152638" opacity=".2"/>`;

  // dinding yang menghadap penonton, dari belakang ke depan
  const dindingTampak = [];
  for (let k = 0; k < n; k++) {
    const p = base[k], q = base[(k + 1) % n];
    let nx = q[1] - p[1], ny = -(q[0] - p[0]);
    if (nx * ((p[0] + q[0]) / 2 - c[0]) + ny * ((p[1] + q[1]) / 2 - c[1]) < 0) { nx = -nx; ny = -ny; }
    if (ny <= 0.02 * Math.hypot(nx, ny)) continue;
    dindingTampak.push({ p, q, nx, ny, z: (p[1] + q[1]) / 2 });
  }
  dindingTampak.sort((u, v) => u.z - v.z);
  for (const w of dindingTampak) {
    const { p, q } = w, warna = bayangBidang(dinding, w.nx, w.ny);
    s += `<path d="${d([p, q, [q[0], q[1] - h], [p[0], p[1] - h]])}" fill="${warna}" ${GARIS}/>`;
    // jendela & pintu (bangunan kecil cukup satu deret)
    const pj = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (pj < 7 || g.jenis === "kios") continue;
    const lantai = g.jenis === "rumah2" ? 2 : 1, jml = Math.max(1, Math.floor(pj / 9));
    for (let L = 0; L < lantai; L++) {
      const y0 = h * (L + 0.32) / lantai, y1 = h * (L + 0.72) / lantai;
      for (let j = 0; j < jml; j++) {
        const t0 = (j + 0.32) / jml, t1 = (j + 0.68) / jml;
        const a0 = [p[0] + (q[0] - p[0]) * t0, p[1] + (q[1] - p[1]) * t0], a1 = [p[0] + (q[0] - p[0]) * t1, p[1] + (q[1] - p[1]) * t1];
        const pintu = L === 0 && j === Math.floor(jml / 2) && w.nx * w.nx < w.ny * w.ny * 4;
        const ya = pintu ? 0 : y0;
        s += `<path d="${d([[a0[0], a0[1] - ya], [a1[0], a1[1] - ya], [a1[0], a1[1] - y1], [a0[0], a0[1] - y1]])}" fill="${pintu ? "#8A5A36" : "#7FA9CC"}" stroke="#fff" stroke-opacity=".6" stroke-width=".5"/>`;
      }
    }
  }

  // atap
  const top = base.map(([x, y]) => [x, y - h]);
  if (n === 4 && g.jenis !== "kios") {
    const pm = g.poly, len = (i, j) => Math.hypot(pm[j][0] - pm[i][0], pm[j][1] - pm[i][1]);
    const panjang01 = len(0, 1) >= len(1, 2);
    const [i0, i1, i2, i3] = panjang01 ? [0, 1, 2, 3] : [1, 2, 3, 0]; // sisi panjang: i0–i1 & i2–i3
    const pendek = Math.min(len(0, 1), len(1, 2));
    const naik = pendek * 0.42 + 3;
    const mid = (u, v) => [(top[u][0] + top[v][0]) / 2, (top[u][1] + top[v][1]) / 2 - naik];
    let R1 = mid(i1, i2), R2 = mid(i3, i0);
    if (g.jenis !== "rumah2" && g.jenis !== "warung") { // limas: bubungan dipendekkan
      const kt = 0.28; const a = R1, b = R2;
      R1 = [a[0] + (b[0] - a[0]) * kt, a[1] + (b[1] - a[1]) * kt];
      R2 = [b[0] + (a[0] - b[0]) * kt, b[1] + (a[1] - b[1]) * kt];
    }
    const bidang = [
      [top[i0], top[i1], R1, R2],      // sisi panjang 1
      [top[i2], top[i3], R2, R1],      // sisi panjang 2
      [top[i1], top[i2], R1],          // ujung 1
      [top[i3], top[i0], R2],          // ujung 2
    ].map((poly) => {
      const cz = poly.reduce((t, v) => t + v[1], 0) / poly.length;
      const e0 = poly[0], e1 = poly[1], mx = (e0[0] + e1[0]) / 2, my = (e0[1] + e1[1]) / 2;
      return { poly, z: my, nx: mx - c[0], ny: my - (c[1] - h) + 0.001, cz };
    }).sort((u, v) => u.z - v.z);
    for (const b of bidang) {
      const tl = Math.hypot(b.nx, b.ny) || 1;
      const k = (-b.nx / tl) * 0.14 + (b.ny / tl) * 0.06;
      s += `<path d="${d(b.poly)}" fill="${terang(atap[0], k - 0.02)}" ${GARIS}/>`;
    }
    s += `<path d="M${f1(R1[0])} ${f1(R1[1])}L${f1(R2[0])} ${f1(R2[1])}" stroke="#fff" stroke-opacity=".5" stroke-width=".9"/>`;
  } else {
    s += `<path d="${d(top)}" fill="${atap[1]}" ${GARIS}/>`;
    if (g.jenis === "kios") s += `<path d="${d(top)}" fill="url(#pGarisTenda)"/>`;
    else s += `<path d="${d(top.map(([x, y]) => [c[0] + (x - c[0]) * 0.8, (y - (c[1] - h)) * 0.8 + c[1] - h]))}" fill="${atap[0]}" opacity=".7"/>`;
  }
  return s;
}

export const defsIso = () => `<pattern id="pGarisTenda" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="2" height="4" fill="#fff" opacity=".75"/></pattern>`;
