#!/usr/bin/env node
/*
 * Peta besar Sawarna (docs/DESIGN.md §4.14) → assets/ilustrasi/peta-sawarna.svg + js/iso-sawarna.js
 *
 *   python tools/siapkan-sawarna.py && python tools/tutupan-lahan.py --sawarna && python tools/pulau-sawarna.py
 *   node tools/gen-sawarna.mjs && node tools/render-tiles.mjs sawarna
 *
 * Gaya RINGAN: pulau di atas awan yang sama dengan peta detail, tetapi objek besar & sederhana agar terbaca
 * pada zoom jauh (14–17): hutan sebagai pohon besar, desa sebagai kelompok rumah kecil, sungai & jalan utama,
 * pantai, dan laut dengan perahu. Ikon khas wisata TIDAK digambar di sini (marker HTML di aplikasi).
 * Satu tampilan saja: arah 225° (menghadap laut), sudut kamera bawaan.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import * as S from "./ilustrasi/simbol.mjs";
import * as SP from "./ilustrasi/sprite.mjs";
import * as ISO from "./ilustrasi/isometrik.mjs";
import { defsPulau, lapisPulau } from "./ilustrasi/pulau.mjs";

const { f1 } = S;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "data/sawarna.json"), "utf8"));
const B = DATA.batas;
const U = 200000, KY = (U * 180) / Math.PI;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const W = (B.timur - B.barat) * U, H = (merc(B.utara) - merc(B.selatan)) * KY;
const P = ([lat, lng]) => [(lng - B.barat) * U, (merc(B.utara) - merc(lat)) * KY];
const pts = (a) => a.map(P);
const R = S.makeRng(20261129), { rnd, rr, pick } = R;

// ---------------------------------------------------------------- util geometri
const dpath = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join("");
const dz = (p) => dpath(p) + "Z";
function smooth(p, closed = false) {
  if (p.length < 3) return dpath(p) + (closed ? "Z" : "");
  const n = p.length, g = (i) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let s = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    s += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return s + (closed ? "Z" : "");
}
function inside([x, y], poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const distSeg = ([px, py], [ax, ay], [bx, by]) => { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
const distLine = (p, g) => { let m = Infinity; for (let i = 1; i < g.length; i++) m = Math.min(m, distSeg(p, g[i - 1], g[i])); return m; };
function offset(line, d) {
  return line.map((p, i) => { const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] + (-dy / l) * d, p[1] + (dx / l) * d]; });
}
function densify(line, step) {
  const out = [line[0]];
  for (let i = 1; i < line.length; i++) { const [ax, ay] = line[i - 1], [bx, by] = line[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step)); for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]); }
  return out;
}
function along(line, step, start = 0) {
  const out = []; let carry = start;
  for (let i = 1; i < line.length; i++) { const [ax, ay] = line[i - 1], [bx, by] = line[i], L = Math.hypot(bx - ax, by - ay); let t = carry; for (; t < L; t += step) out.push([ax + ((bx - ax) * t) / L, ay + ((by - ay) * t) / L]); carry = t - L; }
  return out;
}
function poisson(poly, r, ok, tries = 25) {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]), [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const cell = r / Math.SQRT2, gw = Math.ceil((x1 - x0) / cell) + 1, grid = new Map(), out = [], n = Math.ceil(((x1 - x0) * (y1 - y0)) / (r * r)) * tries;
  for (let k = 0; k < n; k++) {
    const p = [rr(x0, x1), rr(y0, y1)], gx = Math.floor((p[0] - x0) / cell), gy = Math.floor((p[1] - y0) / cell);
    let bad = false;
    for (let i = -2; i <= 2 && !bad; i++) for (let j = -2; j <= 2 && !bad; j++) { const q = grid.get((gy + j) * gw + gx + i); if (q && Math.hypot(q[0] - p[0], q[1] - p[1]) < r) bad = true; }
    if (bad || !inside(p, poly) || !ok(p)) continue;
    grid.set(gy * gw + gx, p); out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------- geometri dasar
const ruas = DATA.pantai.filter((r) => r[0][0] !== r.at(-1)[0] || r[0][1] !== r.at(-1)[1]);
let pantaiLL = ruas[0];
for (const r of ruas.slice(1)) if (Math.hypot(pantaiLL.at(-1)[0] - r[0][0], pantaiLL.at(-1)[1] - r[0][1]) < 1e-5) pantaiLL = pantaiLL.concat(r.slice(1));
const pantai = densify(pts(pantaiLL).filter(([x]) => x > -3000 && x < W + 3000), 30); // barat → timur, darat di utara
const daratan = [...pantai, [pantai.at(-1)[0], -3000], [pantai[0][0], -3000]];
const diDarat = (p) => inside(p, daratan);
const pulau = densify([...pts(DATA.pulau), pts(DATA.pulau)[0]], 60).slice(0, -1);
const diPulau = (p) => inside(p, pulau);
const sungai = DATA.air.filter((a) => a.kelas === "river").map((a) => densify(pts(a.garis), 20));
const anakSungai = DATA.air.filter((a) => a.kelas !== "river").map((a) => densify(pts(a.garis), 20));
const jalan = DATA.jalan.map((j) => ({ kelas: j.kelas, garis: densify(pts(j.garis), 20) }));

// tutupan lahan (kelas per sel) dari tools/tutupan-lahan.py --sawarna
const TP = (() => {
  const t = JSON.parse(fs.readFileSync(path.join(ROOT, "data/tutupan-sawarna.json"), "utf8"));
  const g = new Uint8Array(t.lebar * t.tinggi);
  t.baris.forEach((rl, j) => { let i = j * t.lebar; for (const seg of rl.split(".")) { const c = +seg[0], n = seg.length > 1 ? +seg.slice(1) : 1; g.fill(c === 4 ? 0 : c, i, i + n); i += n; } });
  return { sel: t.sel, w: t.lebar, h: t.tinggi, g };
})();
const kelasDi = ([x, y]) => { const i = Math.floor(x / TP.sel), j = Math.floor(y / TP.sel); return i < 0 || j < 0 || i >= TP.w || j >= TP.h ? 0 : TP.g[j * TP.w + i]; };
// kepadatan kelas di sekitar titik (5×5 sel) — penempatan objek lebih tenang daripada per sel
const kepadatan = ([x, y], c) => { const i0 = Math.floor(x / TP.sel), j0 = Math.floor(y / TP.sel); let n = 0, t = 0;
  for (let j = j0 - 2; j <= j0 + 2; j++) for (let i = i0 - 2; i <= i0 + 2; i++) { if (i < 0 || j < 0 || i >= TP.w || j >= TP.h) continue; t++; if (TP.g[j * TP.w + i] === c) n++; } return t ? n / t : 0; };
function png(w, h, rgba) {
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const pot = (j, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(j), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  const m = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) rgba.copy(m, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pot("IHDR", ih), pot("IDAT", zlib.deflateSync(m, { level: 9 })), pot("IEND", Buffer.alloc(0))]).toString("base64");
}
const gambarKelas = (warna) => { const b = Buffer.alloc(TP.w * TP.h * 4); TP.g.forEach((c, i) => warna[c].forEach((v, k) => (b[i * 4 + k] = v))); return `data:image/png;base64,${png(TP.w, TP.h, b)}`; };

// ---------------------------------------------------------------- simbol
const defs = [S.defsUmum(), defsPulau(), `
  <linearGradient id="gLaut" x1="0" y1="1" x2=".8" y2="0"><stop offset="0" stop-color="#2A6FAE"/><stop offset=".5" stop-color="#3A82C2"/><stop offset="1" stop-color="#5FA3D6"/></linearGradient>
  <pattern id="pPetak" width="70" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)"><rect width="70" height="46" fill="#CFC59C"/><rect x="3" y="3" width="64" height="40" fill="#D6CEA6"/><path d="M0 0H70M0 0V46" stroke="#EFE8CC" stroke-width="5"/></pattern>`];
const ids = { pohon: [], kelapa: [], rumah: [] };
S.DAUN.forEach((c, i) => { defs.push(SP.pohon(`p${i}`, c, R, 13)); ids.pohon.push(`p${i}`); });
[["#3E8A4E", "#58A563", "#9BD77F"], ["#4A9450", "#62AE62", "#A9DC86"]].forEach((c, i) => { defs.push(SP.kelapa(`c${i}`, c, R, 30)); ids.kelapa.push(`c${i}`); });
["terakota", "genteng", "merah", "seng", "cokelat"].forEach((a, i) => { defs.push(SP.rumah(`r${i}`, { w: 30, dd: 13, atap: S.ATAP[a], dinding: pick(S.DINDING), dindingSamping: "#D6CABB" })); ids.rumah.push(`r${i}`); });
defs.push(SP.kapal("kapal"), SP.perahu("perahu"), SP.peselancar("selancar"));

// ---------------------------------------------------------------- lapisan tanah (unit peta)
const L = [];
L.push(`<rect x="-3000" y="-3000" width="${f1(W + 6000)}" height="${f1(H + 6000)}" fill="url(#gLaut)"/>`);
for (const [d, sw, op] of [[260, 6, 0.3], [170, 7, 0.4], [100, 9, 0.55], [50, 11, 0.8]])
  L.push(`<path d="${smooth(offset(pantai, d))}" stroke="#fff" stroke-width="${sw}" fill="none" opacity="${op}" stroke-dasharray="${d > 120 ? "180 90" : ""}"/>`);
L.push(`<path d="${smooth(offset(pantai, 24))}" stroke="#BFE6F5" stroke-width="40" fill="none" opacity=".8"/>`);
L.push(`<clipPath id="cDarat"><path d="${dz(daratan)}"/></clipPath>`);
L.push(`<path d="${dz(daratan)}" fill="#BCDB92"/>`);
L.push(`<image href="${gambarKelas([[0, 0, 0, 0], [86, 150, 84, 255], [210, 205, 158, 255], [216, 205, 178, 230]])}" x="0" y="0" width="${f1(W)}" height="${f1(H)}" preserveAspectRatio="none" clip-path="url(#cDarat)" filter="url(#b8)"/>`);
L.push(`<mask id="mSawah" maskUnits="userSpaceOnUse" x="0" y="0" width="${f1(W)}" height="${f1(H)}"><image href="${gambarKelas([[0, 0, 0, 255], [0, 0, 0, 255], [255, 255, 255, 255], [0, 0, 0, 255]])}" x="0" y="0" width="${f1(W)}" height="${f1(H)}" preserveAspectRatio="none"/></mask>`);
L.push(`<rect x="0" y="0" width="${f1(W)}" height="${f1(H)}" fill="url(#pPetak)" mask="url(#mSawah)" clip-path="url(#cDarat)" opacity=".9"/>`);
// pantai berpasir
L.push(`<g clip-path="url(#cDarat)"><path d="${smooth(pantai)}" stroke="#F1DDB4" stroke-width="130" fill="none"/><path d="${smooth(offset(pantai, -55))}" stroke="#E6D3A6" stroke-width="18" fill="none" opacity=".6"/></g>`);
L.push(`<path d="${smooth(offset(pantai, 6))}" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>`);
// sungai & anak sungai
for (const s of sungai) {
  L.push(`<path d="${smooth(s)}" stroke="#3F8088" stroke-width="56" fill="none" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#cDarat)"/>`);
  L.push(`<path d="${smooth(s)}" stroke="#5FA3A5" stroke-width="40" fill="none" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#cDarat)"/>`);
}
for (const s of anakSungai) L.push(`<path d="${smooth(s)}" stroke="#5FA3A5" stroke-width="20" fill="none" stroke-linecap="round" clip-path="url(#cDarat)"/>`);
// jalan
for (const j of [...jalan].sort((a, b) => (a.kelas === "tertiary") - (b.kelas === "tertiary"))) {
  const lb = j.kelas === "tertiary" ? 44 : j.kelas === "unclassified" ? 30 : 22;
  L.push(`<path d="${smooth(j.garis)}" stroke="#FFFFFF" stroke-width="${lb}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  L.push(`<path d="${smooth(j.garis)}" stroke="#C7CCD1" stroke-width="${lb - 10}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
}

// ---------------------------------------------------------------- objek berdiri (unit peta, digambar tegak di layar)
const SK = 3.2; // pembesar objek agar terbaca dari jauh
const objek = [];
const tambah = (p, id, s) => objek.push({ x: p[0], y: p[1], id, s });
const dekatJalan = (p, m) => jalan.some((j) => distLine(p, j.garis) < m);
const dekatSungai = (p, m) => sungai.some((s) => distLine(p, s) < m);
// desa: sel 80 unit berisi bangunan OSM atau kelas permukiman → satu rumah kecil
const sel = 85, isiDesa = new Map();
for (const [la, ln] of DATA.bangunan) { const [x, y] = P([la, ln]); isiDesa.set(`${Math.floor(x / sel)},${Math.floor(y / sel)}`, [x, y]); }
for (let j = 0; j < TP.h; j++) for (let i = 0; i < TP.w; i++) if (TP.g[j * TP.w + i] === 3) { const x = (i + 0.5) * TP.sel, y = (j + 0.5) * TP.sel, k = `${Math.floor(x / sel)},${Math.floor(y / sel)}`; if (!isiDesa.has(k) && kepadatan([x, y], 3) > 0.25) isiDesa.set(k, [x, y]); }
const rumahDesa = [...isiDesa.values()].filter((p) => diPulau(p) && diDarat(p) && !dekatSungai(p, 50) && distLine(p, pantai) > 70);
for (const p of rumahDesa) tambah([p[0] + rr(-15, 15), p[1] + rr(-15, 15)], pick(ids.rumah), rr(1.9, 2.3));
const terpakai = (p, r) => rumahDesa.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < r);
// hutan & kebun
for (const p of poisson(pulau, 70, (p) => diDarat(p) && kepadatan(p, 1) > 0.45 && !dekatJalan(p, 30) && !dekatSungai(p, 45) && distLine(p, pantai) > 80 && !terpakai(p, 60)))
  tambah(p, rnd() < 0.82 ? pick(ids.pohon) : pick(ids.kelapa), SK * rr(0.85, 1.25));
// pohon jarang di lahan terbuka
for (const p of poisson(pulau, 160, (p) => diDarat(p) && kepadatan(p, 0) > 0.5 && !dekatJalan(p, 30) && !terpakai(p, 60)))
  if (rnd() < 0.5) tambah(p, rnd() < 0.5 ? pick(ids.kelapa) : pick(ids.pohon), SK * rr(0.8, 1.05));
// kelapa di belakang pantai
for (const [x, y] of along(offset(pantai, -85), 75, 10)) { const p = [x + rr(-15, 15), y + rr(-15, 15)]; if (rnd() < 0.75 && diPulau(p) && diDarat(p) && !dekatSungai(p, 40)) tambah(p, pick(ids.kelapa), SK * rr(0.85, 1.1)); }
// laut: perahu nelayan & kapal, peselancar
for (const [x, y] of along(offset(pantai, 230), 650, 200)) if (diPulau([x, y]) && !diDarat([x, y]) && rnd() < 0.7) tambah([x, y], rnd() < 0.5 ? "kapal" : "perahu", 2.6);
for (const [x, y] of along(offset(pantai, 110), 180, 40)) if (diPulau([x, y]) && !diDarat([x, y]) && rnd() < 0.35) tambah([x, y], "selancar", 2.4);

// ---------------------------------------------------------------- tulis (satu tampilan: 225°)
const ARAH = 225, KEDALAMAN = 520, SKALA_PULAU = 3.4;
const MARGIN = { kiri: 900, kanan: 900, atas: 700, bawah: 1000 };
const t = ISO.matriks(ARAH, W, H, ISO.ISO_K);
{
  const Pa = ISO.proyektor(t.m), pp = pulau.map(([x, y]) => Pa(x, y));
  const x0 = Math.min(...pp.map((q) => q[0])) - MARGIN.kiri, x1 = Math.max(...pp.map((q) => q[0])) + MARGIN.kanan;
  const y0 = Math.min(...pp.map((q) => q[1])) - MARGIN.atas, y1 = Math.max(...pp.map((q) => q[1])) + KEDALAMAN + MARGIN.bawah;
  t.m[4] = Math.round((t.m[4] - x0) * 1e6) / 1e6; t.m[5] = Math.round((t.m[5] - y0) * 1e6) / 1e6;
  t.w = Math.round(x1 - x0); t.h = Math.round(y1 - y0);
}
const Pr = ISO.proyektor(t.m);
const air = pulau.map((q, i) => { const r = pulau[(i + 1) % pulau.length], m = [(q[0] + r[0]) / 2, (q[1] + r[1]) / 2]; return !diDarat(m) || dekatSungai(m, 40); });
const lapis = lapisPulau(pulau, Pr, { D: KEDALAMAN, air, skala: SKALA_PULAU });
const isi = objek.filter((o) => diPulau([o.x, o.y])).map((o) => { const [X, Y] = Pr(o.x, o.y); return [Y, `<use href="#${o.id}" transform="translate(${f1(X)} ${f1(Y)}) scale(${Math.round(o.s * 0.85 * 100) / 100})"/>`]; }).sort((a, b) => a[0] - b[0]);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${t.w} ${t.h}" width="${t.w}" height="${t.h}">
<!-- Dibuat oleh tools/gen-sawarna.mjs, jangan edit manual. Peta besar Sawarna, arah 225°. -->
<defs>${defs.join("\n")}<clipPath id="cPulau"><path d="${smooth(pulau, true)}"/></clipPath></defs>
${lapis.belakang}
${lapis.tepi}
<g transform="matrix(${t.m.join(" ")})" clip-path="url(#cPulau)">${L.join("\n")}</g>
<g>${isi.map((i) => i[1]).join("")}</g>
${lapis.depan}
</svg>`;
const DIR = path.join(ROOT, "assets/ilustrasi");
fs.mkdirSync(DIR, { recursive: true });
fs.writeFileSync(path.join(DIR, "peta-sawarna.svg"), svg);
const ZOOM = [14, 15, 16, 17];
fs.writeFileSync(path.join(DIR, "peta-sawarna.json"), JSON.stringify({ arah: ARAH, m: t.m, w: t.w, h: t.h, inti: [0, 0, t.w, t.h], zooms: ZOOM }));
fs.writeFileSync(path.join(ROOT, "js/iso-sawarna.js"), `/* Dibuat oleh tools/gen-sawarna.mjs — proyeksi isometrik peta besar Sawarna (satu tampilan, 225°). */
window.ISO_SAWARNA = ${JSON.stringify({ U, KY, barat: B.barat, mercN: merc(B.utara), S0: ISO.S0, m: t.m, w: t.w, h: t.h, zooms: ZOOM })};
`);
console.log(`assets/ilustrasi/peta-sawarna.svg ${t.w}×${t.h} ${(svg.length / 1024).toFixed(0)} KB · ${isi.length} objek, ${rumahDesa.length} rumah desa`);
