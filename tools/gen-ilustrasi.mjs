#!/usr/bin/env node
/*
 * Generator ilustrasi peta Pantai Ciantir → assets/peta-ilustrasi.svg
 *
 *   node tools/gen-ilustrasi.mjs        (lalu: node tools/render-tiles.mjs)
 *
 * Input : js/data.js (zona, jalur, batas) + data/geografi.json (pantai, sungai, sawah, hutan)
 * Output: SVG presisi Web Mercator dengan batas = geografi.batasGambar. SVG ini hanya bahan;
 *         yang dipakai situs adalah potongan WebP hasil tools/render-tiles.mjs.
 * Gaya  : ilustrasi peta taman wisata, warna dari brand/tokens.css, simbol di tools/ilustrasi/simbol.mjs.
 * Acak  : seed tetap → hasil selalu sama selama data tidak berubah.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import * as S from "./ilustrasi/simbol.mjs";

const { f1 } = S;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8"), ctx);
const PETA = ctx.window.PETA;
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, "data/geografi.json"), "utf8"));

// ================================================================ proyeksi
const B = GEO.batasGambar;
const U = 200000; // unit per derajat bujur (1 unit ≈ 0,55 m)
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const KY = (U * 180) / Math.PI;
const W = (B.timur - B.barat) * U;
const H = (merc(B.utara) - merc(B.selatan)) * KY;
const P = ([lat, lng]) => [(lng - B.barat) * U, (merc(B.utara) - merc(lat)) * KY];
const pts = (arr) => arr.map(P);

// ================================================================ util geometri
const R = S.makeRng(20261125);
const { rnd, rr, pick } = R;
const d = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join("");
const dz = (p) => d(p) + "Z";
function smooth(p, closed = false) {
  if (p.length < 3) return d(p) + (closed ? "Z" : "");
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
function distSeg([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
const distLine = (p, line) => { let m = Infinity; for (let i = 1; i < line.length; i++) m = Math.min(m, distSeg(p, line[i - 1], line[i])); return m; };
function offset(line, dist) {
  return line.map((p, i) => {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [p[0] + (-dy / l) * dist, p[1] + (dx / l) * dist];
  });
}
// perhalus & rapatkan titik garis (agar offset/along mulus)
function densify(line, step = 30) {
  const out = [line[0]];
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1], [bx, by] = line[i], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 1; k <= n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  return out;
}
function along(line, step, start = 0) {
  const out = []; let carry = start;
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1], [bx, by] = line[i], L = Math.hypot(bx - ax, by - ay);
    const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    let t = carry;
    for (; t < L; t += step) out.push([ax + ((bx - ax) * t) / L, ay + ((by - ay) * t) / L, ang]);
    carry = t - L;
  }
  return out;
}
function poisson(poly, r, ok = () => true, tries = 30) {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const cell = r / Math.SQRT2, gw = Math.ceil((x1 - x0) / cell) + 1, grid = new Map(), out = [];
  const n = Math.ceil(((x1 - x0) * (y1 - y0)) / (r * r)) * tries;
  for (let k = 0; k < n; k++) {
    const p = [rr(x0, x1), rr(y0, y1)];
    const gx = Math.floor((p[0] - x0) / cell), gy = Math.floor((p[1] - y0) / cell);
    let bad = false;
    for (let i = -2; i <= 2 && !bad; i++) for (let j = -2; j <= 2 && !bad; j++) {
      const q = grid.get((gy + j) * gw + gx + i);
      if (q && Math.hypot(q[0] - p[0], q[1] - p[1]) < r) bad = true;
    }
    if (bad || !inside(p, poly) || !ok(p)) continue;
    grid.set(gy * gw + gx, p); out.push(p);
  }
  return out;
}
function noise(cell, s0) {
  const v = (i, j) => {
    let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(s0, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  return ([x, y]) => {
    const fx = x / cell, fy = y / cell, i = Math.floor(fx), j = Math.floor(fy), tx = fx - i, ty = fy - j;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    return (v(i, j) * (1 - sx) + v(i + 1, j) * sx) * (1 - sy) + (v(i, j + 1) * (1 - sx) + v(i + 1, j + 1) * sx) * sy;
  };
}
// potong garis menjadi bagian-bagian yang memenuhi syarat
function runs(line, ok) {
  const out = []; let cur = [];
  for (const p of line) { if (ok(p)) cur.push(p); else { if (cur.length > 2) out.push(cur); cur = []; } }
  if (cur.length > 2) out.push(cur);
  return out;
}
const use = (id, x, y, rot = 0, s = 1) =>
  `<use href="#${id}" transform="translate(${f1(x)} ${f1(y)})${rot ? ` rotate(${f1(rot)})` : ""}${s !== 1 ? ` scale(${Math.round(s * 100) / 100})` : ""}"/>`;

// ================================================================ geometri
const rect = [[0, 0], [W, 0], [W, H], [0, H]];
const spitLaut = pts(GEO.pantaiSpitLaut), spitDalam = pts(GEO.pantaiSpitDalam);
const laut = pts(GEO.pantaiLaut), dalam = pts(GEO.pantaiDalam);
const sungaiAsli = pts(GEO.sungai);
const sungai = densify([...sungaiAsli, (() => { const [a, b] = sungaiAsli.slice(-2); const l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [b[0] + ((b[0] - a[0]) / l) * 70, b[1] + ((b[1] - a[1]) / l) * 70]; })()], 40), sawah = pts(GEO.sawah), sawahU = pts(GEO.sawahUtara);
const hutan = pts(GEO.hutan), lapangan = pts(GEO.lapangan);
const batas = pts(PETA.batas);
const zUmkm = pts(PETA.zona.find((z) => z.id === "zona-umkm").koordinat);
const zHome = pts(PETA.zona.find((z) => z.id === "zona-homestay").koordinat);
const jalur = pts(PETA.jalur.koordinat);

const garisPantai = densify([...spitLaut, ...laut], 30);   // barat → selatan; laut di kanan
const dalamD = densify(dalam, 25), spitDalamD = densify(spitDalam, 25);
const daratan = [[0, 0], [W, 0], [W, H], [laut.at(-1)[0], H], ...laut.slice().reverse(), ...spitLaut.slice().reverse(), [0, spitLaut[0][1]]];
const pasirSpit = [...spitDalam, ...spitLaut.slice().reverse(), [0, spitDalam[0][1]]];
const pasirSelatan = [...dalam, ...laut.slice().reverse()];
const LS = 54; // lebar sungai

const diAir = (p) => !inside(p, daratan) || distLine(p, sungai) < LS / 2 + 12;
const diPasir = (p) => inside(p, pasirSpit) || inside(p, pasirSelatan);
const diSawah = (p) => inside(p, sawah) || inside(p, sawahU) || inside(p, lapangan);
const diHutan = (p) => inside(p, hutan);
const diZona = (p) => inside(p, zHome) || inside(p, zUmkm);

// ================================================================ jalan desa
const jalanUtara = runs(densify(offset(sungai, 78), 20), (p) => !diAir(p) && !diPasir(p) && p[0] > 60);
const atasJalur = jalur[0];
const jalanKeUtara = [densify([[atasJalur[0], atasJalur[1]], [atasJalur[0] + 30, atasJalur[1] - 260], [atasJalur[0] - 20, atasJalur[1] - 620], [atasJalur[0] + 10, -10]], 20)];
const jalanBelakangPantai = runs(densify(offset(dalamD, -165), 20), (p) => !diAir(p) && !diHutan(p) && !diSawah(p) && p[1] > dalamD[0][1] + 40);
const jalanDesa = [...jalanUtara, ...jalanKeUtara, ...jalanBelakangPantai];
const dekatJalan = (p, m) => jalanDesa.some((j) => distLine(p, j) < m) || distLine(p, jalur) < m;

// ================================================================ simbol (defs)
const defs = [S.defsUmum(), S.lainLain()];
const rumahIds = { limas: [], limasBesar: [], pelana: [], L: [], seng: [] };
const atapNama = Object.keys(S.ATAP).filter((k) => k !== "seng");
let k = 0;
for (const a of atapNama) {
  for (let v = 0; v < 2; v++) {
    const dinding = pick(S.DINDING);
    defs.push(S.rumahLimas(`rl${k}`, { atap: S.ATAP[a], dinding, jendela: 2, w: rr(26, 32), h: rr(19, 23) })); rumahIds.limas.push(`rl${k}`);
    defs.push(S.rumahLimas(`rb${k}`, { atap: S.ATAP[a], dinding, jendela: 3, w: rr(36, 42), h: rr(26, 30), wh: 8, pot: true, teras: v === 0 })); rumahIds.limasBesar.push(`rb${k}`);
    defs.push(S.rumahPelana(`rp${k}`, { atap: S.ATAP[a], dinding: pick(S.DINDING), w: rr(24, 30), h: rr(17, 21) })); rumahIds.pelana.push(`rp${k}`);
    k++;
  }
  defs.push(S.rumahL(`rL${a}`, { atap: S.ATAP[a], dinding: pick(S.DINDING), pot: true })); rumahIds.L.push(`rL${a}`);
}
for (let i = 0; i < 4; i++) { defs.push(S.rumahSeng(`rs${i}`, { dinding: pick(S.DINDING) })); rumahIds.seng.push(`rs${i}`); }
const lapakIds = S.TENDA.map((t, i) => (defs.push(S.lapak(`lp${i}`, t, { meja: i % 2 === 0 })), `lp${i}`));
defs.push(S.warungRumbia("wr"), S.saung("saung"));
const payungIds = S.PAYUNG.flatMap((t, i) => [(defs.push(S.payung(`py${i}`, t)), `py${i}`), (defs.push(S.payung(`pn${i}`, t, { kursi: false })), `pn${i}`)]);
const pohonIds = [];
S.DAUN.forEach((c, i) => [11, 15, 19].forEach((r, j) => { defs.push(S.pohonBulat(`pb${i}_${j}`, c, R, r)); pohonIds.push(`pb${i}_${j}`); }));
const kelapaIds = [0, 1, 2].map((i) => (defs.push(S.kelapa(`kl${i}`, [["#3E8A4E", "#58A563", "#9BD77F"], ["#4A9450", "#62AE62", "#A9DC86"], ["#3A7F48", "#4F985C", "#8CCB78"]][i], R, rr(16, 20))), `kl${i}`));
defs.push(S.pisang("ps", R), S.cemara("cm0", R, 11), S.cemara("cm1", R, 14));
defs.push(S.semak("sm0", R, "#E35D8C"), S.semak("sm1", R, "#F2C14E"), S.semak("sm2", R, null), S.semak("sm3", R, "#FFFFFF"));
const pohonAcak = () => (rnd() < 0.7 ? pick(pohonIds) : rnd() < 0.6 ? pick(kelapaIds) : "ps");

// pola (pattern) alam
defs.push(`
  <linearGradient id="gLaut" x1="0" y1="1" x2=".8" y2="0"><stop offset="0" stop-color="#1F5F9B"/><stop offset=".5" stop-color="#3A82C2"/><stop offset="1" stop-color="#5FA3D6"/></linearGradient>
  <pattern id="pOmbak" width="120" height="46" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
    <path d="M6 23q14 -10 28 0t28 0" stroke="#fff" stroke-opacity=".22" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M66 8q10 -6 20 0" stroke="#fff" stroke-opacity=".14" stroke-width="1.8" fill="none" stroke-linecap="round"/>
  </pattern>
  <pattern id="pKilau" width="260" height="200" patternUnits="userSpaceOnUse">
    ${Array.from({ length: 14 }, () => { const x = rr(0, 260), y = rr(0, 200); return `<path d="M${f1(x)} ${f1(y)}c${f1(rr(10, 25))} ${f1(rr(-8, 8))} ${f1(rr(25, 45))} ${f1(rr(-8, 8))} ${f1(rr(40, 70))} ${f1(rr(-4, 4))}" stroke="#fff" stroke-opacity=".08" stroke-width="${f1(rr(1.5, 3))}" fill="none" stroke-linecap="round"/>`; }).join("")}
  </pattern>
  <pattern id="pPasir" width="26" height="26" patternUnits="userSpaceOnUse">
    <circle cx="4" cy="6" r="1.2" fill="#C9AC78" opacity=".5"/><circle cx="17" cy="18" r="1" fill="#C9AC78" opacity=".4"/><circle cx="20" cy="5" r=".8" fill="#fff" opacity=".7"/><circle cx="9" cy="20" r=".7" fill="#fff" opacity=".6"/>
  </pattern>
  <pattern id="pRiak" width="60" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-38)">
    <path d="M0 8q15 -5 30 0t30 0" stroke="#D9BF8C" stroke-opacity=".35" stroke-width="1.2" fill="none"/>
  </pattern>
  <pattern id="pRumput" width="40" height="40" patternUnits="userSpaceOnUse">
    <path d="M6 26l2 -5l2 5M24 12l2 -5l2 5M30 34l1.6 -4l1.6 4" stroke="#8DBD68" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/>
    <circle cx="16" cy="30" r=".9" fill="#F7F3C8" opacity=".7"/>
  </pattern>
  <pattern id="pRumputTaman" width="28" height="28" patternUnits="userSpaceOnUse">
    <rect width="28" height="14" fill="#fff" opacity=".07"/><path d="M5 20l1.5 -4l1.5 4M18 8l1.5 -4l1.5 4" stroke="#7DB765" stroke-width="1" fill="none" opacity=".6"/>
  </pattern>
  <pattern id="pPaving" width="12" height="8" patternUnits="userSpaceOnUse">
    <rect width="12" height="8" fill="#F1D9C8"/><path d="M0 0H12M0 4H12M6 0V4M0 4V8M12 4V8" stroke="#D9B8A2" stroke-width=".7"/>
  </pattern>
  <pattern id="pSwMuda" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".75" fill="#3F8A4A" opacity=".75"/></pattern>
  <pattern id="pSwTumbuh" width="4" height="3.4" patternUnits="userSpaceOnUse"><path d="M0 1.7H4" stroke="#5E9A3C" stroke-width="1.3" opacity=".55"/></pattern>
  <pattern id="pSwMatang" width="4" height="3.4" patternUnits="userSpaceOnUse"><path d="M0 1.7H4" stroke="#B5A43A" stroke-width="1.3" opacity=".55"/></pattern>
  <pattern id="pSwPanen" width="5" height="4" patternUnits="userSpaceOnUse"><path d="M1 2l1 -1.4M3.5 3.2l.8 -1.2" stroke="#8C6E3E" stroke-width=".7" opacity=".7"/></pattern>
  <pattern id="pSwAir" width="30" height="20" patternUnits="userSpaceOnUse"><path d="M3 6h10M16 15h9" stroke="#fff" stroke-width="1.2" opacity=".55" stroke-linecap="round"/></pattern>
`);

// ================================================================ lapisan
const L = [];
const clip = (id, dd) => (L.push(`<clipPath id="${id}"><path d="${dd}"/></clipPath>`), `url(#${id})`);

// 1. laut
L.push(`<rect width="${f1(W)}" height="${f1(H)}" fill="url(#gLaut)"/>`);
L.push(`<path d="${smooth(garisPantai)}" stroke="#7CC0E6" stroke-width="520" fill="none" opacity=".55" filter="url(#b20)"/>`);
L.push(`<path d="${smooth(garisPantai)}" stroke="#9AD3EE" stroke-width="210" fill="none" opacity=".7" filter="url(#b20)"/>`);
L.push(`<path d="${smooth(offset(garisPantai, 40))}" stroke="#B9E3F2" stroke-width="70" fill="none" opacity=".7" filter="url(#b8)"/>`);
L.push(`<rect width="${f1(W)}" height="${f1(H)}" fill="url(#pKilau)"/><rect width="${f1(W)}" height="${f1(H)}" fill="url(#pOmbak)"/>`);
// garis ombak memecah
for (const [dd, sw, op, dash] of [[210, 3, 0.28, "70 60"], [150, 3.5, 0.38, "90 45"], [100, 4.5, 0.5, "120 30"], [62, 5.5, 0.7, "160 22"], [34, 6.5, 0.85, ""]])
  L.push(`<path d="${smooth(offset(garisPantai, dd))}" stroke="#fff" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`);
// buih renda
let renda = "";
for (const [x, y] of along(offset(garisPantai, 18), 7)) renda += `<circle cx="${f1(x + rr(-3, 3))}" cy="${f1(y + rr(-3, 3))}" r="${f1(rr(2, 5))}"/>`;
L.push(`<g fill="#fff" opacity=".8">${renda}</g>`);

// 2. daratan + variasi warna
const daratD = dz(daratan);
const cDarat = clip("cDarat", daratD);
L.push(`<path d="${daratD}" fill="#BFDD96"/>`);
let bercak = "";
for (let i = 0; i < 260; i++) bercak += `<ellipse cx="${f1(rr(0, W))}" cy="${f1(rr(0, H))}" rx="${f1(rr(60, 220))}" ry="${f1(rr(40, 150))}" fill="${pick(["#CDE5A4", "#B2D488", "#D6E9B0", "#A9CF80"])}" opacity=".55"/>`;
L.push(`<g clip-path="${cDarat}" filter="url(#b20)">${bercak}</g>`);
L.push(`<rect width="${f1(W)}" height="${f1(H)}" fill="url(#pRumput)" clip-path="${cDarat}"/>`);

// 3. hutan (dasar)
L.push(`<path d="${smooth(hutan, true)}" fill="#3F7F4C" filter="url(#b8)"/>`);

// 4. sawah
const nSw = noise(380, 5);
function sawahPetak(poly, ang, cw, ch) {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const Rr = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + cw * 2;
  const a = (ang * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const ni = Math.ceil((2 * Rr) / cw), nj = Math.ceil((2 * Rr) / ch);
  const lengkung = noise(600, 31);
  // simpul kisi: melengkung halus (mengikuti kontur) + sedikit acak
  const V = [];
  for (let i = 0; i <= ni; i++) {
    V[i] = [];
    for (let j = 0; j <= nj; j++) {
      const x0 = -Rr + i * cw, y0 = -Rr + j * ch;
      const wx = cx + x0 * ca - y0 * sa, wy = cy + x0 * sa + y0 * ca;
      const warp = (lengkung([wx, wy]) - 0.5) * ch * 2.2;
      V[i][j] = [x0 + rr(-cw * 0.18, cw * 0.18), y0 + warp + rr(-ch * 0.14, ch * 0.14)];
    }
  }
  let s = "", kanal = "";
  for (let i = 0; i < ni; i++) {
    for (let j = 0; j < nj; j++) {
      // kadang dua petak digabung agar ukurannya beragam
      const lebar = i < ni - 1 && rnd() < 0.3 ? 2 : 1;
      const q = [V[i][j], V[i + lebar][j], V[i + lebar][j + 1], V[i][j + 1]];
      const mx = q.reduce((t, v) => t + v[0], 0) / 4, my = q.reduce((t, v) => t + v[1], 0) / 4;
      const wx = cx + mx * ca - my * sa, wy = cy + mx * sa + my * ca;
      if (!inside([wx, wy], poly) && Math.min(...poly.map((pp) => Math.hypot(pp[0] - wx, pp[1] - wy))) > cw * 2) { if (lebar === 2) i; continue; }
      const inset = q.map(([x, y]) => [mx + (x - mx) * 0.9, my + (y - my) * 0.9]);
      const n = nSw([wx, wy]) + rr(-0.07, 0.07);
      const [fill, pat] = n < 0.22 ? ["#CDB27A", "pSwPanen"] : n < 0.36 ? ["#9FCDC2", "pSwMuda"] : n < 0.62 ? ["#8CC65C", "pSwTumbuh"] : n < 0.78 ? ["#A9D46A", "pSwTumbuh"] : ["#D9CF66", "pSwMatang"];
      const rot = rr(-12, 12), dd = smooth(inset, true);
      s += `<path d="${dd}" fill="${fill}"/><g transform="rotate(${f1(rot)} ${f1(mx)} ${f1(my)})"><path d="${dd}" fill="url(#${pat})" transform="rotate(${f1(-rot)} ${f1(mx)} ${f1(my)})"/></g>`;
      if (pat === "pSwMuda" && rnd() < 0.6) s += `<path d="${dd}" fill="url(#pSwAir)"/>`;
      s += `<path d="${dd}" fill="none" stroke="#5E7A3A" stroke-opacity=".18" stroke-width="1"/>`;
      if (lebar === 2) i += 0; // simpul dipakai bersama; petak berikutnya tetap jalan
    }
    if (rnd() < 0.07) kanal += `<path d="${smooth(V[i].map(([x, y]) => [x - 2, y]))}" stroke="#7FB8D8" stroke-width="3.2" fill="none"/>`;
  }
  const id = "cs" + Math.floor(rnd() * 1e6);
  return `<clipPath id="${id}"><path d="${smooth(poly, true)}"/></clipPath><g clip-path="url(#${id})"><path d="${dz(poly)}" fill="#D3DD98"/><path d="${dz(poly)}" fill="url(#pRumput)"/><g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${ang})">${s}${kanal}</g></g>`;
}
L.push(sawahPetak(sawah, -8, 70, 44));
L.push(sawahPetak(sawahU, 6, 64, 40));
L.push(sawahPetak(lapangan, -4, 52, 32));

// 5. dasar zona (dibatasi daratan, di bawah pasir)
L.push(`<g clip-path="${cDarat}">
  <path d="${smooth(zHome, true)}" fill="#CFEBC4"/><path d="${smooth(zHome, true)}" fill="url(#pRumputTaman)"/>
  <path d="${smooth(zHome, true)}" fill="none" stroke="#4E9F6A" stroke-opacity=".35" stroke-width="10" filter="url(#b4)"/>
  <path d="${smooth(zUmkm, true)}" fill="url(#pPaving)"/>
  <path d="${smooth(zUmkm, true)}" fill="#E0674F" opacity=".08"/>
  <path d="${smooth(zUmkm, true)}" fill="none" stroke="#E0674F" stroke-opacity=".35" stroke-width="10" filter="url(#b4)"/>
</g>`);

// 6. pasir & pantai
for (const poly of [pasirSpit, pasirSelatan]) {
  L.push(`<path d="${dz(poly)}" fill="#F1DDB4"/>`);
  L.push(`<path d="${dz(poly)}" fill="url(#pRiak)"/><path d="${dz(poly)}" fill="url(#pPasir)"/>`);
}
const cPasir = clip("cPasir", dz(pasirSpit) + dz(pasirSelatan));
L.push(`<g clip-path="${cPasir}"><path d="${smooth(garisPantai)}" stroke="#D9BC86" stroke-width="46" fill="none" filter="url(#b8)"/>
  <path d="${smooth(offset(dalamD, -6))}" stroke="#E8D3A6" stroke-width="18" fill="none" filter="url(#b8)" opacity=".7"/></g>`);
L.push(`<path d="${smooth(offset(garisPantai, 6))}" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".95"/>`);
L.push(`<path d="${smooth(offset(garisPantai, 11))}" stroke="#E9F6FB" stroke-width="5" fill="none" opacity=".7" stroke-dasharray="30 12"/>`);

// 7. sungai
const muara = sungaiAsli.at(-1);
L.push(`<ellipse cx="${f1(muara[0] - 40)}" cy="${f1(muara[1] + 40)}" rx="150" ry="90" fill="#A9D9E8" opacity=".55" filter="url(#b20)"/>`);
L.push(`<g clip-path="${cDarat}">`);
L.push(`<path d="${smooth(sungai)}" stroke="#A08A5E" stroke-width="${LS + 22}" fill="none" stroke-linecap="round" opacity=".6" filter="url(#b4)"/>`);
L.push(`<path d="${smooth(sungai)}" stroke="#4E8EC2" stroke-width="${LS + 6}" fill="none" stroke-linecap="round"/>`);
L.push(`<path d="${smooth(sungai)}" stroke="#6FAEDB" stroke-width="${LS - 8}" fill="none" stroke-linecap="round"/>`);
L.push(`<path d="${smooth(sungai)}" stroke="#8CC5E8" stroke-width="${LS * 0.35}" fill="none" stroke-linecap="round" opacity=".6"/>`);
L.push(`<path d="${smooth(offset(sungai, -9))}" stroke="#fff" stroke-width="1.8" fill="none" opacity=".5" stroke-dasharray="30 34"/>`);
L.push(`<path d="${smooth(offset(sungai, 11))}" stroke="#fff" stroke-width="1.4" fill="none" opacity=".4" stroke-dasharray="18 46"/>`);
L.push(`</g>`);
let gelagah = "";
for (const side of [1, -1]) for (const [x, y] of along(offset(sungai, side * (LS / 2 + 4)), 9)) if (rnd() < 0.7 && !diPasir([x, y]) && inside([x, y], daratan))
  gelagah += `<path d="M${f1(x)} ${f1(y)}l${f1(rr(-2, 2))} ${f1(rr(-5, -2))}M${f1(x + 2)} ${f1(y)}l${f1(rr(-1, 3))} ${f1(rr(-6, -3))}"/>`;
L.push(`<g stroke="#5E9A4A" stroke-width="1.2" stroke-linecap="round" opacity=".85">${gelagah}</g>`);

// 8. jalan desa & jalur utama
for (const j of jalanDesa) {
  L.push(`<path d="${smooth(j)}" stroke="#152638" stroke-width="20" fill="none" stroke-linecap="round" opacity=".18" filter="url(#b4)" transform="translate(3 4)"/>`);
  L.push(`<path d="${smooth(j)}" stroke="#B7AE9C" stroke-width="17" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  L.push(`<path d="${smooth(j)}" stroke="#DCD6C8" stroke-width="13" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
}
L.push(`<path d="${smooth(jalur)}" stroke="#152638" stroke-width="30" fill="none" stroke-linecap="round" opacity=".18" filter="url(#b4)" transform="translate(3 4)"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="#B9935C" stroke-width="28" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="#FFF3DA" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="#EAD7B2" stroke-width="22" fill="none" stroke-dasharray="1.2 6" stroke-linejoin="round"/>`);

// 9. jembatan gantung di persilangan jalur × sungai
(function () {
  for (let i = 1; i < jalur.length; i++) {
    const a = jalur[i - 1], b = jalur[i];
    for (let t = 0; t <= 1; t += 0.01) {
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      if (distLine(p, sungai) < 3) {
        const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, h = LS * 0.85;
        let papan = "";
        for (let x = -h; x <= h; x += 3.2) papan += `<path d="M${f1(x)} -8V8"/>`;
        L.push(`<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(ang)})">
          <rect x="${-h}" y="-9" width="${2 * h}" height="18" transform="translate(5 8)" fill="#0E2A46" opacity=".3" filter="url(#b4)"/>
          <rect x="${-h}" y="-8" width="${2 * h}" height="16" fill="#C49A63"/>
          <g stroke="#8C6A3E" stroke-width=".9">${papan}</g>
          <path d="M${-h} -9Q0 -5 ${h} -9M${-h} 9Q0 13 ${h} 9" stroke="#4A3626" stroke-width="2" fill="none"/>
          ${[-h - 4, h + 4].map((x) => `<rect x="${x - 3}" y="-13" width="6" height="6" fill="#7A5A3A"/><rect x="${x - 3}" y="7" width="6" height="6" fill="#7A5A3A"/>`).join("")}
        </g>`);
        return;
      }
    }
  }
})();

// ================================================================ objek (diurutkan atas → bawah)
const items = [], halaman = [];
const tambah = (p, svg) => items.push([p[1], svg]);
const bebas = (p) => !diAir(p) && !diPasir(p) && !dekatJalan(p, 16);
const luarZona = (p) => !diZona(p) && !diSawah(p) && !diHutan(p);
const nDesa = noise(520, 77);
const rumahAcak = () => {
  const r = rnd();
  return r < 0.5 ? pick(rumahIds.limas) : r < 0.82 ? pick(rumahIds.pelana) : pick(rumahIds.seng);
};
const terpakai = [];
const kosong = (p, r) => terpakai.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > r);

// rumah berderet di tepi jalan desa
for (const j of jalanDesa) {
  for (const [x, y, ang] of along(j, 36, rr(0, 20))) {
    for (const side of [1, -1]) {
      const a = (ang * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a), off = side * rr(30, 36);
      const p = [x + nx * off, y + ny * off];
      if (!bebas(p) || !luarZona(p) || !kosong(p, 30) || nDesa(p) < (inside(p, batas) ? 0.55 : 0.32)) continue;
      terpakai.push(p);
      halaman.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="26" ry="22" fill="#E3D9B5" opacity=".55"/>`);
      tambah(p, use(rumahAcak(), p[0], p[1], ang + (side > 0 ? 180 : 0) + rr(-4, 4)));
    }
  }
}
// rumah berkelompok di luar jalan
for (const p of poisson(rect, 40, (p) => bebas(p) && luarZona(p) && distLine(p, garisPantai) > 40)) {
  const n = nDesa(p) + Math.max(0, 1 - distLine(p, sungai) / 500) * 0.25;
  if (n > (inside(p, batas) ? 0.93 : 0.78) && kosong(p, 34)) {
    terpakai.push(p);
    halaman.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="24" ry="20" fill="#E3D9B5" opacity=".5"/>`);
    tambah(p, use(rumahAcak(), p[0], p[1], rr(-15, 15)));
  } else if (n > 0.4 && rnd() < 0.5 && kosong(p, 18)) tambah(p, use(pohonAcak(), p[0], p[1], rr(0, 360), rr(0.85, 1.25)));
}

// zona homestay
for (const p of poisson(zHome, 52, (p) => bebas(p) && distLine(p, zHome.concat([zHome[0]])) > 20 && kosong(p, 40))) {
  terpakai.push(p);
  halaman.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="30" ry="26" fill="#EAF6DF" opacity=".8"/>`);
  const ang = rr(-8, 8) + (distLine(p, jalur) < 70 ? 0 : 0);
  tambah(p, use(pick(rumahIds.limasBesar), p[0], p[1], ang));
  for (let i = 0; i < 2; i++) {
    const q = [p[0] + rr(-34, 34), p[1] + rr(18, 30)];
    if (bebas(q) && inside(q, zHome)) tambah(q, use(pick(["sm0", "sm1", "sm2", "sm3"]), q[0], q[1], rr(0, 360), rr(0.8, 1.2)));
  }
}
for (const p of poisson(zHome, 30, (p) => bebas(p) && kosong(p, 26)).filter(() => rnd() < 0.45))
  tambah(p, use(rnd() < 0.6 ? pick(pohonIds) : pick(kelapaIds), p[0], p[1], rr(0, 360), rr(0.8, 1.15)));
// lampu & bangku di sepanjang jalur
for (const [x, y, ang] of along(jalur, 46, 20)) {
  const a = (ang * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a);
  tambah([x, y], use("lampu", x + nx * 15, y + ny * 15));
  if (rnd() < 0.35) tambah([x, y], use("bangku", x - nx * 17, y - ny * 17, ang));
}

// zona UMKM: deret lapak menghadap laut, warung rumbia, saung
const dalamUmkm = (p) => inside(p, zUmkm);
for (const [dist, gap, jenis] of [[-34, 42, "lapak"], [-80, 56, "campur"], [-122, 64, "saung"], [-205, 50, "rumah"]]) {
  for (const [x, y, ang] of along(offset(dalamD, dist), gap, rr(0, gap))) {
    const p = [x + rr(-3, 3), y + rr(-3, 3)];
    if (!dalamUmkm(p) || diAir(p) || dekatJalan(p, 18) || !kosong(p, 26)) continue;
    terpakai.push(p);
    const id = jenis === "lapak" ? pick(lapakIds) : jenis === "campur" ? (rnd() < 0.5 ? "wr" : pick(lapakIds)) : jenis === "saung" ? "saung" : pick(rumahIds.pelana);
    tambah(p, use(id, p[0], p[1], ang + (jenis === "rumah" ? 180 : 0) + rr(-3, 3)));
  }
}
// payung + kursi di pasir
for (const [dist, gap] of [[30, 30], [62, 44]]) {
  for (const [x, y] of along(offset(dalamD, dist), gap, rr(0, 10))) {
    const p = [x + rr(-5, 5), y + rr(-5, 5)];
    if (!inside(p, pasirSelatan) || distLine(p, garisPantai) < 24) continue;
    if (!inside(p, zUmkm) && rnd() < 0.7) continue;
    tambah(p, use(pick(payungIds), p[0], p[1], rr(-20, 20)));
  }
}
// kelapa & cemara laut di tepi pantai
for (const line of [offset(dalamD, -10), offset(spitDalamD, 10)])
  for (const [x, y] of along(line, 26, 5)) {
    const p = [x + rr(-9, 9), y + rr(-9, 9)];
    if (diAir(p) || rnd() < 0.2 || !kosong(p, 14)) continue;
    tambah(p, use(rnd() < 0.7 ? pick(kelapaIds) : rnd() < 0.5 ? "cm0" : "cm1", p[0], p[1], rr(0, 360), rr(0.9, 1.3)));
  }

// pohon di pematang sawah + gubuk
for (const p of poisson(sawah, 140, (p) => !diAir(p))) tambah(p, use(rnd() < 0.5 ? pick(kelapaIds) : pick(pohonIds), p[0], p[1], rr(0, 360), rr(0.8, 1.1)));
for (const p of poisson(sawah, 320, (p) => !diAir(p))) tambah(p, use("gubuk", p[0], p[1], rr(-10, 10)));

// hutan: kanopi rapat berlapis
for (const p of poisson(hutan, 17, (p) => !diAir(p)))
  tambah(p, use(pick(pohonIds), p[0], p[1], rr(0, 360), rr(0.9, 1.5)));

items.sort((a, b) => a[0] - b[0]);
L.push(`<g>${halaman.join("")}</g>`);
L.push(`<g>${items.map((i) => i[1]).join("")}</g>`);

// 10. laut: perahu, peselancar, batu karang
for (const [x, y, ang] of along(offset(garisPantai, 300), 380, 150)) if (x > 40 && y > 40 && x < W - 40 && y < H - 40) L.push(use("perahu", x, y, ang + rr(-30, 30), 0.55));
for (const [x, y, ang] of along(offset(laut, 80), 110, 50).slice(2, 14)) L.push(use("papan", x + rr(-12, 12), y + rr(-12, 12), ang + rr(-70, 70)));
for (const ujung of [laut.at(-2)]) {
  for (let i = 0; i < 6; i++) {
    const p = [ujung[0] + rr(-40, 30), ujung[1] + rr(-20, 40)];
    if (inside(p, daratan) && !diPasir(p)) continue;
    L.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="12" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>`);
    L.push(use("batu", p[0], p[1], rr(0, 360), rr(0.8, 1.4)));
  }
}

// perahu nelayan ditarik ke pasir (spit & dekat muara)
for (const [x, y, ang] of along(offset(densify(spitLaut, 20), -24), 46, 30).slice(-9)) {
  if (!inside([x, y], pasirSpit) || rnd() < 0.3) continue;
  L.push(use("perahu", x, y, ang + 90 + rr(-15, 15), 0.5));
}

// 11. tabir lembut di luar kawasan (daratan saja)
L.push(`<path d="M0 0H${f1(W)}V${f1(H)}H0Z ${dz(batas)}" fill="#F3F6EE" fill-rule="evenodd" opacity=".3" clip-path="${cDarat}"/>`);

// ================================================================ tulis
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${f1(W)} ${f1(H)}" width="${Math.round(W)}" height="${Math.round(H)}">
<!-- Dibuat oleh tools/gen-ilustrasi.mjs, jangan edit manual. Batas: ${JSON.stringify(B)} -->
<defs>${defs.join("\n")}</defs>
${L.join("\n")}
</svg>`;
fs.mkdirSync(path.join(ROOT, "assets"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "assets/peta-ilustrasi.svg"), svg);
console.log(`assets/peta-ilustrasi.svg  ${Math.round(W)}×${Math.round(H)}  ${(svg.length / 1024).toFixed(0)} KB  ${items.length} objek`);
