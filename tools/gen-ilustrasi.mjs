#!/usr/bin/env node
/*
 * Generator ilustrasi peta Pantai Ciantir → assets/ilustrasi/peta-{arah}.svg (8 arah pandang)
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
import * as SP from "./ilustrasi/sprite.mjs";
import * as ISO from "./ilustrasi/isometrik.mjs";

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
// sungai utama: alur Cisawarna dari OpenStreetMap (stream hulu + river di muara) agar tidak menimpa rumah;
// garis gambar tangan di data/geografi.json hanya cadangan bila data OSM tidak ada
const fileNyata = path.join(ROOT, "data/nyata.json");
const NY = fs.existsSync(fileNyata) ? JSON.parse(fs.readFileSync(fileNyata, "utf8")) : null;
const sungaiOSM = (() => {
  if (!NY) return null;
  const dekat = (u, v) => Math.hypot(u[0] - v[0], u[1] - v[1]) < 0.0005;
  const hilir = NY.air.filter((a) => a.kelas === "river");
  const hulu = NY.air.find((a) => a.kelas === "stream" && hilir.some((r) => dekat(r.garis[0], a.garis.at(-1))));
  if (!hulu) return null;
  const muara = hilir.find((r) => dekat(r.garis[0], hulu.garis.at(-1)));
  const m = 0.003, diBatas = ([la, ln]) => la < B.utara + m && la > B.selatan - m && ln > B.barat - m && ln < B.timur + m;
  return { hulu, garis: pts([...hulu.garis.filter(diBatas), ...muara.garis.slice(1)]) };
})();
const sungaiAsli = sungaiOSM ? sungaiOSM.garis : pts(GEO.sungai);
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
const LS = 46; // lebar sungai (±25 m)

const diAir = (p) => !inside(p, daratan) || distLine(p, sungai) < LS / 2 + 12;
const diPasir = (p) => inside(p, pasirSpit) || inside(p, pasirSelatan);
const diSawah = (p) => inside(p, sawah) || inside(p, sawahU) || inside(p, lapangan);
const diHutan = (p) => inside(p, hutan);
const diZona = (p) => inside(p, zHome) || inside(p, zUmkm);

// ================================================================ data nyata (OSM + warna atap dari citra)
const luasPoly = (q) => { let a = 0; for (let i = 0; i < q.length; i++) { const [x1, y1] = q[i], [x2, y2] = q[(i + 1) % q.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
const pusatPoly = (q) => [q.reduce((t, v) => t + v[0], 0) / q.length, q.reduce((t, v) => t + v[1], 0) / q.length];
const bangunanNyata = NY ? NY.bangunan.map((b) => { const q = pts(b.poly); // "hijau" di citra hampir selalu kanopi pohon yang menutupi atap → pakai warna atap umum
  return { osm: b.id, atap: b.atap === "hijau" ? pick(["terakota", "terakota", "genteng", "cokelat"]) : b.atap, luas: b.luas, poly: q, c: pusatPoly(q) }; })
  .filter((b) => b.c[0] > 0 && b.c[1] > 0 && b.c[0] < W && b.c[1] < H)
  .filter((b) => !b.poly.some((q) => distLine(q, sungai) < LS / 2 + 3)) : []; // tidak ada rumah di atas sungai
const LEBAR_JALAN = { primary: 26, secondary: 24, tertiary: 22, unclassified: 16, residential: 14, service: 11, track: 9, footway: 7, path: 7, steps: 7 };
const jalanNyata = NY ? NY.jalan.filter((j) => LEBAR_JALAN[j.kelas]).map((j) => ({ kelas: j.kelas, lebar: LEBAR_JALAN[j.kelas], garis: densify(pts(j.garis), 20) })) : [];
const kaliNyata = NY ? NY.air.filter((a) => a.kelas !== "river" && a !== sungaiOSM?.hulu).map((a) => densify(pts(a.garis), 20)) : [];

// ================================================================ jalan desa
const jalanUtara = runs(densify(offset(sungai, 78), 20), (p) => !diAir(p) && !diPasir(p) && p[0] > 60);
const atasJalur = jalur[0];
const jalanKeUtara = [densify([[atasJalur[0], atasJalur[1]], [atasJalur[0] + 30, atasJalur[1] - 260], [atasJalur[0] - 20, atasJalur[1] - 620], [atasJalur[0] + 10, -10]], 20)];
const jalanBelakangPantai = runs(densify(offset(dalamD, -165), 20), (p) => !diAir(p) && !diHutan(p) && !diSawah(p) && p[1] > dalamD[0][1] + 40);
const jalanDesa = NY ? jalanNyata.map((j) => j.garis) : [...jalanUtara, ...jalanKeUtara, ...jalanBelakangPantai];
const dekatJalan = (p, m) => jalanDesa.some((j) => distLine(p, j) < m) || distLine(p, jalur) < m;

// ================================================================ simbol (defs)
const defs = [S.defsUmum(), S.lainLain()];
const ATAPS = Object.keys(S.ATAP).filter((k) => k !== "seng");
const ids = { rumahAtap: {}, rumah2Atap: {}, rumah: [], rumah2: [], seng: [], pondok: ["pondok"], kios: [], pohon: [], kelapa: [], semak: [], orang: [], mobil: [], payung: [] };
let k = 0;
for (const a of ATAPS) {
  for (let v = 0; v < 2; v++) {
    defs.push(SP.rumah(`r${k}`, { w: rr(24, 32), dd: rr(10, 14), atap: S.ATAP[a], dinding: pick(S.DINDING), dindingSamping: pick(["#D9C8AE", "#CDBB9F", "#D6CABB", "#C9BBA8"]), teras: v === 0 })); ids.rumah.push(`r${k}`); (ids.rumahAtap[a] ||= []).push(`r${k}`);
    defs.push(SP.rumah(`h${k}`, { w: rr(30, 38), dd: rr(13, 16), lantai: 2, atap: S.ATAP[a], dinding: pick(S.DINDING), balkon: true, teras: true, pagar: v === 1, kayu: v === 1 && rnd() < 0.5 })); ids.rumah2.push(`h${k}`); (ids.rumah2Atap[a] ||= []).push(`h${k}`);
    k++;
  }
}
for (let i = 0; i < 4; i++) { defs.push(SP.rumah(`s${i}`, { w: rr(18, 22), dd: 9, atap: S.ATAP.seng, dinding: pick(S.DINDING) })); ids.seng.push(`s${i}`); }
defs.push(SP.pondok("pondok"), SP.warung("warung"), SP.gazebo("gazebo"), SP.tiangReklame("reklame"), SP.spanduk("spanduk"), SP.papan("papan"));
S.TENDA.forEach((t, i) => { defs.push(SP.kios(`k${i}`, t, { lebar: i % 2 ? 24 : 28 })); ids.kios.push(`k${i}`); });
S.PAYUNG.forEach((t, i) => { defs.push(SP.payung(`u${i}`, t)); ids.payung.push(`u${i}`); });
S.DAUN.forEach((c, i) => [9, 12, 15].forEach((r, j) => { defs.push(SP.pohon(`p${i}_${j}`, c, R, r)); ids.pohon.push(`p${i}_${j}`); }));
[["#3E8A4E", "#58A563", "#9BD77F"], ["#4A9450", "#62AE62", "#A9DC86"], ["#3A7F48", "#4F985C", "#8CCB78"]].forEach((c, i) => { defs.push(SP.kelapa(`c${i}`, c, R, rr(26, 34))); ids.kelapa.push(`c${i}`); });
defs.push(SP.pisang("pisang", R), SP.cemara("cemara", R));
[["sm0", "#E35D8C"], ["sm1", "#F2C14E"], ["sm2", null], ["sm3", "#FFFFFF"], ["sm4", "#D64545"]].forEach(([id, b]) => { defs.push(SP.semak(id, R, b)); ids.semak.push(id); });
["#E0674F", "#4677B4", "#F2C14E", "#4E9F6A", "#D35B9A", "#FFFFFF", "#2A9DB5", "#7A5FB8"].forEach((c, i) => { defs.push(SP.orang(`o${i}`, c, pick(["#2D3A4A", "#4677B4", "#8C6A3E", "#2D3A4A"]))); ids.orang.push(`o${i}`); });
["#E0674F", "#FFFFFF", "#4677B4", "#C3CBD3", "#2D3A4A"].forEach((c, i) => { defs.push(SP.mobil(`m${i}`, c)); ids.mobil.push(`m${i}`); });
defs.push(SP.motor("motor"), SP.lampu("lampu2"), SP.umbul("umbul"), SP.batu("batu2"), SP.peselancar("selancar"), SP.bananaBoat("banana"), SP.kapal("kapal"), SP.perahu("perahu2"), SP.camar("camar"));
["#E0674F", "#F2C14E", "#2D3A4A"].forEach((c, i) => defs.push(SP.perenang(`renang${i}`, c)));
const pickAtap = (peta, atap) => pick(peta[atap] || peta.terakota);
const pohonAcak = () => (rnd() < 0.68 ? pick(ids.pohon) : rnd() < 0.7 ? pick(ids.kelapa) : "pisang");

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
    <rect width="12" height="8" fill="#F5BFA6"/><path d="M0 0H12M0 4H12M6 0V4M0 4V8M12 4V8" stroke="#E4A184" stroke-width=".7"/>
  </pattern>
  <pattern id="pPolosSawah" width="40" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><path d="M0 0H40M0 0V26" stroke="#FFFFFF" stroke-width="2" opacity=".8"/></pattern>
  <pattern id="pPolosHutan" width="34" height="30" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="7" fill="#BFD9A2"/><circle cx="26" cy="22" r="8" fill="#BFD9A2"/></pattern>
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
const nSw = noise(190, 5);
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
      // dominan hijau (padi tumbuh), sesekali baru tanam / menguning / panen
      const [fill, pat] = n < 0.12 ? ["#CDB27A", "pSwPanen"] : n < 0.22 ? ["#9FD0BE", "pSwMuda"] : n < 0.5 ? ["#7DBE4F", "pSwTumbuh"] : n < 0.78 ? ["#94CC5E", "pSwTumbuh"] : n < 0.9 ? ["#A9D46A", "pSwTumbuh"] : ["#D3D069", "pSwMatang"];
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
  <path d="${smooth(zHome, true)}" fill="#9ED47C"/><path d="${smooth(zHome, true)}" fill="url(#pRumputTaman)"/>
  <path d="${smooth(zUmkm, true)}" fill="url(#pPaving)"/>
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
for (const k of kaliNyata) {
  L.push(`<path d="${smooth(k)}" stroke="#4E8EC2" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round" clip-path="${cDarat}"/>`);
  L.push(`<path d="${smooth(k)}" stroke="#7DB8E2" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" clip-path="${cDarat}"/>`);
}
const daftarJalan = NY ? [...jalanNyata].sort((a, b) => a.lebar - b.lebar) : jalanDesa.map((g) => ({ kelas: "residential", lebar: 14, garis: g }));
for (const j of daftarJalan) {
  const tanah = j.kelas === "track" || j.kelas === "path" || j.kelas === "footway";
  L.push(`<path d="${smooth(j.garis)}" stroke="#152638" stroke-width="${j.lebar + 2}" fill="none" stroke-linecap="round" opacity=".16" filter="url(#b4)" transform="translate(3 4)"/>`);
  L.push(`<path d="${smooth(j.garis)}" stroke="#FFFFFF" stroke-width="${j.lebar}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  L.push(`<path d="${smooth(j.garis)}" stroke="${tanah ? "#E8DCC0" : j.lebar >= 20 ? "#C9CED4" : "#D9EBC6"}" stroke-width="${j.lebar - 5}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (j.lebar >= 20) L.push(`<path d="${smooth(j.garis)}" stroke="#FFFFFF" stroke-width="1.4" fill="none" stroke-dasharray="10 12" opacity=".9"/>`);
}
L.push(`<path d="${smooth(jalur)}" stroke="#152638" stroke-width="30" fill="none" stroke-linecap="round" opacity=".18" filter="url(#b4)" transform="translate(3 4)"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="#FFFFFF" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="#B5BBC2" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="#A3AAB2" stroke-width="24" fill="none" stroke-dasharray="14 30 6 40" stroke-linejoin="round" opacity=".6"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="#FFFFFF" stroke-width="1.4" fill="none" stroke-dasharray="10 12" opacity=".9"/>`);
// cincin jalan setapak bertepi putih yang membingkai tiap zona
for (const z of [zHome, zUmkm]) {
  L.push(`<g clip-path="${cDarat}"><path d="${smooth(z, true)}" fill="none" stroke="#152638" stroke-width="20" opacity=".14" filter="url(#b4)" transform="translate(3 4)"/>
    <path d="${smooth(z, true)}" fill="none" stroke="#FFFFFF" stroke-width="17" stroke-linejoin="round"/>
    <path d="${smooth(z, true)}" fill="none" stroke="#D9EBC6" stroke-width="11" stroke-linejoin="round"/></g>`);
}

// 9. jembatan busur baja biru (foto survei) pada ruas jalur yang melintasi sungai
const jembatan = (() => {
  for (let i = 1; i < jalur.length; i++) {
    const a = jalur[i - 1], b = jalur[i];
    for (let t = 0; t <= 1; t += 0.02) if (distLine([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], sungai) < 3) return { a, b };
  }
  return null;
})();
if (jembatan) {
  const { a, b } = jembatan, ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, pj = Math.hypot(b[0] - a[0], b[1] - a[1]);
  L.push(`<g transform="translate(${f1(a[0])} ${f1(a[1])}) rotate(${f1(ang)})">
    <rect x="-4" y="-11" width="${f1(pj + 8)}" height="22" transform="translate(4 7)" fill="#0E2A46" opacity=".3" filter="url(#b4)"/>
    <rect x="-4" y="-11" width="${f1(pj + 8)}" height="22" fill="#8F969D"/>
    <rect x="-4" y="-8" width="${f1(pj + 8)}" height="16" fill="#AEB4BA"/>
    <path d="M-4 0H${f1(pj + 4)}" stroke="#fff" stroke-width="1" stroke-dasharray="6 6" opacity=".8"/>
    <path d="M-4 -10.5H${f1(pj + 4)}M-4 10.5H${f1(pj + 4)}" stroke="#2E78C7" stroke-width="1.6"/>
  </g>`);
}

// ================================================================ objek berdiri (sprite 2.5D)
// Setiap objek disimpan sebagai {x, y, id, s}; saat menulis tiap arah pandang, objek diputar
// agar tegak di layar lalu diurutkan dari belakang ke depan.
const sprite = [], halaman = [];
const tambah = (p, id, s = 1) => sprite.push({ x: p[0], y: p[1], id, s });
const bebas = (p) => !diAir(p) && !diPasir(p) && !dekatJalan(p, 16);
const luarZona = (p) => !diZona(p) && !diSawah(p) && !diHutan(p);
const nDesa = noise(520, 77);
const rumahAcak = () => (rnd() < 0.72 ? pick(ids.rumah) : rnd() < 0.5 ? pick(ids.seng) : pick(ids.rumah2));
const terpakai = [];
const kosong = (p, r) => terpakai.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > r);
const halamanDi = (p, rx, ry, c = "#E3D9B5", op = 0.55) => halaman.push(`<ellipse cx="${f1(p[0])}" cy="${f1(p[1])}" rx="${rx}" ry="${ry}" fill="${c}" opacity="${op}"/>`);

const daftarGedung = [];
// bangunan di simpang pintu masuk (id OSM) → jenis khusus sesuai foto survei
const PINTU_KHUSUS = { 630693849: "minimarket1", 630693960: "minimarket2", 630693847: "rumahKayu" };
if (NY) {
  // setiap bangunan OSM digambar di jejak aslinya: tapak + objek 2.5D dengan warna atap dari citra
  const jejak = [];
  for (const bg of bangunanNyata) {
    const luasU = luasPoly(bg.poly);
    jejak.push(`<path d="${dz(bg.poly)}" fill="#CDBE9C" opacity=".55"/>`);
    terpakai.push(bg.c);
    // jenis bangunan → diekstrusi isometrik dari jejak aslinya (tools/ilustrasi/isometrik.mjs)
    let jenis;
    if (PINTU_KHUSUS[bg.osm]) jenis = PINTU_KHUSUS[bg.osm];
    else if (inside(bg.c, zUmkm)) jenis = bg.luas < 45 ? "kios" : bg.luas < 110 ? "warung" : "rumah";
    else if (inside(bg.c, zHome)) jenis = bg.luas > 70 ? "rumah2" : "rumah";
    else jenis = bg.atap === "seng" ? "seng" : bg.luas > 150 ? "rumah2" : "rumah";
    daftarGedung.push({ id: daftarGedung.length, osm: bg.osm, poly: bg.poly, c: bg.c, jenis, atap: bg.atap });
    void luasU;
  }
  halaman.push(...jejak);
  // pekarangan: semak & pohon di sela rumah
  for (const p of poisson(rect, 26, (p) => bebas(p) && !diSawah(p) && !diHutan(p) && kosong(p, 16) && terpakai.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 60)))
    if (rnd() < 0.45) tambah(p, rnd() < 0.7 ? pohonAcak() : pick(ids.semak), rr(0.8, 1.15));
} else {
// rumah berderet di tepi jalan desa
for (const j of jalanDesa) {
  for (const [x, y, ang] of along(j, 44, rr(0, 20))) {
    for (const side of [1, -1]) {
      const a = (ang * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a), off = side * rr(30, 36);
      const p = [x + nx * off, y + ny * off];
      if (!bebas(p) || !luarZona(p) || !kosong(p, 36) || nDesa(p) < (inside(p, batas) ? 0.55 : 0.32)) continue;
      terpakai.push(p); halamanDi(p, 26, 22); tambah(p, rumahAcak());
      if (rnd() < 0.35) { const q = [p[0] + rr(-20, 20), p[1] + rr(10, 20)]; if (bebas(q)) tambah(q, pick(ids.semak)); }
    }
  }
}
// rumah berkelompok & kebun di luar jalan
for (const p of poisson(rect, 40, (p) => bebas(p) && luarZona(p) && distLine(p, garisPantai) > 40)) {
  const n = nDesa(p) + Math.max(0, 1 - distLine(p, sungai) / 500) * 0.25;
  if (n > (inside(p, batas) ? 0.93 : 0.78) && kosong(p, 38)) { terpakai.push(p); halamanDi(p, 24, 20); tambah(p, rumahAcak()); }
  else if (n > 0.4 && rnd() < 0.55 && kosong(p, 16)) tambah(p, pohonAcak(), rr(0.85, 1.2));
}

// zona homestay: rumah 2 lantai berbalkon, pondok kayu, taman bunga
for (const p of poisson(zHome, 56, (p) => bebas(p) && distLine(p, zHome.concat([zHome[0]])) > 22 && kosong(p, 44))) {
  terpakai.push(p); halamanDi(p, 32, 26, "#EAF6DF", 0.85);
  const r = rnd();
  tambah(p, r < 0.6 ? pick(ids.rumah2) : r < 0.82 ? "pondok" : pick(ids.rumah));
  for (let i = 0; i < 3; i++) {
    const q = [p[0] + rr(-34, 34), p[1] + rr(14, 30)];
    if (bebas(q) && inside(q, zHome)) tambah(q, pick(ids.semak), rr(0.8, 1.15));
  }
}
for (const p of poisson(zHome, 30, (p) => bebas(p) && kosong(p, 24)).filter(() => rnd() < 0.42)) tambah(p, rnd() < 0.55 ? pick(ids.pohon) : pick(ids.kelapa), rr(0.8, 1.1));

}
// jalur utama: lampu, umbul-umbul, pejalan kaki, gapura di pintu masuk
const jalurD = densify(jalur, 10);
for (const [x, y, ang] of along(jalurD, 48, 24)) {
  const a = (ang * Math.PI) / 180, nx = -Math.sin(a), ny = Math.cos(a), sisi = Math.round(x + y) % 2 ? 1 : -1;
  tambah([x + nx * 15 * sisi, y + ny * 15 * sisi], "lampu2");
  if (rnd() < 0.55) tambah([x + rr(-5, 5), y + rr(-5, 5)], pick(ids.orang));
}
{
  // simpang Jl. Sawarna: reklame & motor di depan minimarket, spanduk kopi, papan info, mobil putih di depan rumah kayu
  const pintu = jalur[0], gd = (osm) => daftarGedung.find((g) => g.osm === osm);
  const ke = (u, v, t) => [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t];
  const m1 = gd(630693849), m2 = gd(630693960), rk = gd(630693847);
  if (m1) {
    const depan = ke(m1.c, pintu, 0.62);
    tambah(ke(m1.c, pintu, 0.85), "reklame");
    tambah([depan[0] - 6, depan[1] + 2], "spanduk");
    for (let i = 0; i < 3; i++) tambah([depan[0] - 10 + i * 6, depan[1] - 6], "motor");
  }
  if (m2) {
    const depan = ke(m2.c, pintu, 0.6);
    tambah([depan[0] + 8, depan[1]], "reklame");
    for (let i = 0; i < 2; i++) tambah([depan[0] - 6 + i * 6, depan[1] + 4], "motor");
  }
  if (rk) tambah(ke(rk.c, pintu, 0.55), "m1");
  const [a, b] = jalurD;
  tambah([pintu[0] + (b[0] - a[0]) * 1.4 + 12, pintu[1] + (b[1] - a[1]) * 1.4], "papan");
}

// zona UMKM: deret kios menghadap laut, warung, gazebo, rumah toko di belakang
const dalamUmkm = (p) => inside(p, zUmkm);
for (const [dist, gap, jenis] of NY ? [] : [[-34, 38, "kios"], [-82, 50, "campur"], [-124, 60, "gazebo"], [-205, 46, "rumah"]]) {
  for (const [x, y] of along(offset(dalamD, dist), gap, rr(0, gap))) {
    const p = [x + rr(-3, 3), y + rr(-3, 3)];
    if (!dalamUmkm(p) || diAir(p) || dekatJalan(p, 18) || !kosong(p, 28)) continue;
    terpakai.push(p);
    tambah(p, jenis === "kios" ? pick(ids.kios) : jenis === "campur" ? (rnd() < 0.5 ? "warung" : pick(ids.kios)) : jenis === "gazebo" ? "gazebo" : pick(ids.rumah));
    if (jenis !== "rumah" && rnd() < 0.6) tambah([p[0] + rr(-14, 14), p[1] + rr(10, 18)], pick(ids.orang));
  }
}
// pantai: payung, pengunjung, perenang, peselancar
for (const [dist, gap] of [[28, 30], [58, 40]]) {
  for (const [x, y] of along(offset(dalamD, dist), gap, rr(0, 10))) {
    const p = [x + rr(-5, 5), y + rr(-5, 5)];
    if (!inside(p, pasirSelatan) || distLine(p, garisPantai) < 22) continue;
    if (!inside(p, zUmkm) && rnd() < 0.7) continue;
    tambah(p, pick(ids.payung));
    if (rnd() < 0.7) tambah([p[0] + rr(-12, 12), p[1] + rr(4, 14)], pick(ids.orang));
  }
}
for (const [x, y] of along(offset(laut, 6), 34, 10)) if (rnd() < 0.45 && inside([x, y], pasirSelatan)) tambah([x, y], pick(ids.orang));
for (const [x, y] of along(offset(laut, 26), 40, 20).slice(0, 26)) if (rnd() < 0.55) tambah([x + rr(-6, 6), y + rr(-6, 6)], `renang${Math.floor(rnd() * 3)}`);
for (const [x, y] of along(offset(laut, 75), 90, 40).slice(1, 10)) if (rnd() < 0.7) tambah([x + rr(-14, 14), y + rr(-14, 14)], "selancar");

// kelapa & cemara laut di tepi pantai
for (const line of [offset(dalamD, -10), offset(spitDalamD, 10)])
  for (const [x, y] of along(line, 24, 5)) {
    const p = [x + rr(-9, 9), y + rr(-9, 9)];
    if (diAir(p) || rnd() < 0.2 || !kosong(p, 12)) continue;
    tambah(p, rnd() < 0.75 ? pick(ids.kelapa) : "cemara", rr(0.9, 1.25));
  }

// kendaraan di jalan desa
for (const j of NY ? jalanNyata.filter((x) => x.lebar >= 14).map((x) => x.garis) : [...jalanKeUtara, ...jalanUtara])
  for (const [x, y] of along(j, 150, rr(20, 80))) if (rnd() < 0.7) tambah([x, y], rnd() < 0.6 ? pick(ids.mobil) : "motor");

// sawah: pohon di pematang + gubuk
for (const p of poisson(sawah, 140, (p) => !diAir(p))) tambah(p, rnd() < 0.5 ? pick(ids.kelapa) : pick(ids.pohon), rr(0.8, 1.05));
for (const p of poisson(sawah, 320, (p) => !diAir(p))) tambah(p, "gazebo", 0.6);

// batu di tepi sungai
for (const side of [1, -1]) for (const [x, y] of along(offset(sungai, side * (LS / 2 + 6)), 70, 30)) if (rnd() < 0.4 && !diPasir([x, y]) && inside([x, y], daratan)) tambah([x, y], "batu2", rr(0.8, 1.3));

// taman di dalam kawasan (di luar zona): pepohonan & semak rimbun ala taman wisata
for (const p of poisson(batas, 20, (p) => bebas(p) && !diZona(p) && !diSawah(p) && kosong(p, 14) && distLine(p, batas.concat([batas[0]])) > 14))
  if (rnd() < 0.62) tambah(p, rnd() < 0.62 ? pohonAcak() : pick(ids.semak), rr(0.85, 1.2));

// hutan: pepohonan rapat
for (const p of poisson(hutan, 15, (p) => !diAir(p))) tambah(p, pick(ids.pohon), rr(1, 1.5));

L.push(`<g>${halaman.join("")}</g>`);

// laut: kapal, perahu, banana boat, camar
const spriteLaut = [];
for (const [x, y] of along(offset(garisPantai, 320), 420, 160)) if (x > 40 && y > 40 && x < W - 40 && y < H - 40) spriteLaut.push({ x, y, id: rnd() < 0.5 ? "kapal" : "perahu2", s: 1 });
for (const [x, y] of along(offset(laut, 150), 400, 120).slice(0, 3)) spriteLaut.push({ x, y, id: "banana", s: 1 });
for (let i = 0; i < 24; i++) { const [x, y] = pick(along(offset(garisPantai, rr(80, 500)), 60)); spriteLaut.push({ x: x + rr(-30, 30), y: y + rr(-30, 30), id: "camar", s: rr(0.8, 1.3) }); }
for (const [x, y] of along(offset(densify(spitLaut, 20), -24), 46, 30).slice(-9)) if (inside([x, y], pasirSpit) && rnd() < 0.7) sprite.push({ x, y, id: "perahu2", s: 1 });
for (const ujung of [laut.at(-2)]) for (let i = 0; i < 6; i++) {
  const p = [ujung[0] + rr(-40, 30), ujung[1] + rr(-20, 40)];
  if (inside(p, daratan) && !diPasir(p)) continue;
  L.push(`<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="12" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>`);
  sprite.push({ x: p[0], y: p[1], id: "batu2", s: rr(1, 1.6) });
}

// ================================================================ tulis: satu SVG per arah pandang
// ---------- luar kawasan: pemandangan hijau (sawah terasering, perbukitan, desa)
const diKawasan = (o) => inside([o.x, o.y], batas);
const luar = [];
const cLuar = `M0 0H${f1(W)}V${f1(H)}H0Z ${dz(batas)}`;
luar.push(`<clipPath id="cLuarDarat"><path d="${daratD}"/></clipPath><clipPath id="cLuar"><path d="${cLuar}" clip-rule="evenodd"/></clipPath>`);

// sawah tambahan di lahan terbuka (jauh dari desa, sungai, jalan, pantai, hutan)
const nLahan = noise(520, 77);
let masker = "";
const sel = 34;
for (let x = sel / 2; x < W; x += sel) for (let y = sel / 2; y < H; y += sel) {
  const p = [x, y];
  if (inside(p, batas) || !inside(p, daratan) || diPasir(p) || diHutan(p) || inside(p, sawah) || inside(p, sawahU)) continue;
  if (distLine(p, sungai) < 60 || dekatJalan(p, 34) || distLine(p, garisPantai) < 90) continue;
  if (nLahan(p) > 0.6 || terpakai.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 46)) continue;
  masker += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${sel * 0.78}"/>`;
}
luar.push(`<clipPath id="cSawahLuar">${masker}</clipPath>`);
luar.push(`<g clip-path="url(#cLuar)"><g clip-path="url(#cSawahLuar)">${sawahPetak(rect, -6, 64, 40)}</g></g>`);

// perbukitan: bayangan lembut berbentuk bukit di hutan & lahan timur
let bukit = "";
const pusatBukit = poisson(hutan, 260, () => true);
for (const [x, y] of pusatBukit) {
  const rx = rr(170, 280), ry = rx * rr(0.55, 0.75);
  bukit += `<ellipse cx="${f1(x + rx * 0.18)}" cy="${f1(y + ry * 0.22)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="#1E4F2E" opacity=".34"/>`;
  bukit += `<ellipse cx="${f1(x - rx * 0.12)}" cy="${f1(y - ry * 0.18)}" rx="${f1(rx * 0.72)}" ry="${f1(ry * 0.62)}" fill="#D6F2B5" opacity=".34"/>`;
}
luar.push(`<g clip-path="url(#cLuarDarat)"><g filter="url(#b20)">${bukit}</g></g>`);
// bingkai kawasan: jalan setapak lebar bertepi putih (hanya di darat)
luar.push(`<g clip-path="url(#cLuarDarat)"><path d="${dz(batas)}" fill="none" stroke="#152638" stroke-width="26" opacity=".14" filter="url(#b4)" transform="translate(3 4)"/>
  <path d="${dz(batas)}" fill="none" stroke="#FFFFFF" stroke-width="22" stroke-linejoin="round"/><path d="${dz(batas)}" fill="none" stroke="#CFE6B8" stroke-width="14" stroke-linejoin="round"/></g>`);
const spriteDalam = sprite; // semua objek berdiri ditampilkan (dalam & luar kawasan)

// ================================================================ tulis: peta isometrik per arah pandang
const ARAH = process.argv[2] ? [Number(process.argv[2])] : [0, 45, 90, 135, 180, 225, 270, 315];
const DIR = path.join(ROOT, "assets/ilustrasi");
fs.mkdirSync(DIR, { recursive: true });
const dasar = L.join("\n") + "\n" + luar.join("\n");
const semuaArah = {};
for (const a of [0, 45, 90, 135, 180, 225, 270, 315]) {
  semuaArah[a] = ISO.matriks(a, W, H);
  const Pa = ISO.proyektor(semuaArah[a].m), bi = batas.map(([x, y]) => Pa(x, y));
  // kotak kawasan inti (untuk tile zoom 19)
  semuaArah[a].inti = [Math.min(...bi.map((p) => p[0])) - 120, Math.min(...bi.map((p) => p[1])) - 140, Math.max(...bi.map((p) => p[0])) + 120, Math.max(...bi.map((p) => p[1])) + 80].map(Math.round);
}

for (const a of ARAH) {
  const { m, w, h } = semuaArah[a];
  const P = ISO.proyektor(m);
  const isi = [];
  // objek berdiri (pohon, orang, payung, kendaraan, perahu…) tetap tegak di layar
  for (const o of [...spriteLaut, ...sprite]) {
    const [X, Y] = P(o.x, o.y);
    const sk = o.s * 0.85;
    isi.push([Y, `<use href="#${o.id}" transform="translate(${f1(X)} ${f1(Y)}) scale(${Math.round(sk * 100) / 100})"/>`]);
  }
  // bangunan diekstrusi dari jejak asli
  for (const g of daftarGedung) isi.push([P(g.c[0], g.c[1])[1] + 2, ISO.gedung(g, P, S.TENDA)]);
  // rangka jembatan busur biru di atas lantai jembatan
  if (jembatan) isi.push(...ISO.jembatanBusur(jembatan.a, jembatan.b, P));
  isi.sort((u, v) => u[0] - v[0]);
  const inti = semuaArah[a].inti;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<!-- Dibuat oleh tools/gen-ilustrasi.mjs (isometrik), jangan edit manual. Arah pandang ${a}°. -->
<defs>${defs.join("\n")}${ISO.defsIso()}</defs>
<rect width="${w}" height="${h}" fill="#3F86C4"/>
<g transform="matrix(${m.join(" ")})">${dasar}</g>
<g>${isi.map((i) => i[1]).join("")}</g>
</svg>`;
  fs.writeFileSync(path.join(DIR, `peta-${a}.svg`), svg);
  fs.writeFileSync(path.join(DIR, `peta-${a}.json`), JSON.stringify({ arah: a, m, w, h, inti }));
  console.log(`assets/ilustrasi/peta-${a}.svg  ${w}×${h}  ${(svg.length / 1024).toFixed(0)} KB`);
}

// parameter proyeksi untuk aplikasi (Leaflet CRS khusus) — selalu lengkap 8 arah
fs.writeFileSync(path.join(ROOT, "js/iso.js"), `/* Dibuat oleh tools/gen-ilustrasi.mjs — parameter proyeksi isometrik per arah pandang. */
window.ISO = ${JSON.stringify({ U, KY, barat: B.barat, mercN: merc(B.utara), S0: ISO.S0, arah: semuaArah })};
`);
console.log(`${sprite.length + spriteLaut.length} objek berdiri, ${daftarGedung.length} bangunan isometrik`);
