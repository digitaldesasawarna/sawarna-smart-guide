#!/usr/bin/env node
/*
 * Generator ilustrasi peta Pantai Ciantir → assets/peta-ilustrasi.svg
 *
 *   node tools/gen-ilustrasi.mjs
 *
 * Input : js/data.js (zona, jalur, batas) + data/geografi.json (pantai, sungai, sawah, hutan)
 * Output: SVG yang posisinya presisi Web Mercator, ditempel di Leaflet lewat L.imageOverlay
 *         dengan batas = geografi.batasGambar.
 * Gaya  : flat illustration ala peta taman wisata, warna dari brand/tokens.css.
 * Acak  : memakai seed tetap → hasil selalu sama selama data tidak berubah.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8"), ctx);
const PETA = ctx.window.PETA;
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, "data/geografi.json"), "utf8"));

// ---------------------------------------------------------------- proyeksi
const B = GEO.batasGambar;
const U = 200000; // unit SVG per derajat bujur (1 unit ≈ 0,55 m)
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const KY = (U * 180) / Math.PI;
const W = (B.timur - B.barat) * U;
const H = (merc(B.utara) - merc(B.selatan)) * KY;
const P = ([lat, lng]) => [(lng - B.barat) * U, (merc(B.utara) - merc(lat)) * KY];
const pts = (arr) => arr.map(P);

// ---------------------------------------------------------------- util
let seed = 20261125;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const rr = (a, b) => a + rnd() * (b - a);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const f1 = (n) => Math.round(n * 10) / 10;
const d = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${f1(x)} ${f1(y)}`).join("");
const dz = (p) => d(p) + "Z";
// kurva halus (Catmull-Rom → Bezier)
function smooth(p, closed = false) {
  if (p.length < 3) return d(p) + (closed ? "Z" : "");
  const n = p.length, g = (i) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let s = `M${f1(p[0][0])} ${f1(p[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    s += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
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
const distLine = (p, line) => Math.min(...line.slice(1).map((b, i) => distSeg(p, line[i], b)));
// geser garis sejajar (sisi kanan arah jalan = positif)
function offset(line, dist) {
  return line.map((p, i) => {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return [p[0] + (-dy / l) * dist, p[1] + (dx / l) * dist];
  });
}
// titik-titik sepanjang garis setiap 'step' unit (+ arah)
function along(line, step, start = 0) {
  const out = []; let carry = start;
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1], [bx, by] = line[i], L = Math.hypot(bx - ax, by - ay);
    const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    for (let t = carry; t < L; t += step) out.push([ax + ((bx - ax) * t) / L, ay + ((by - ay) * t) / L, ang]);
    carry = (carry - L) % step; if (carry < 0) carry += step;
  }
  return out;
}
// sebaran Poisson-disk sederhana (dart throwing dgn grid)
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
// noise nilai halus (untuk mengelompokkan permukiman)
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
const use = (id, x, y, rot = 0, s = 1) =>
  `<use href="#${id}" transform="translate(${f1(x)} ${f1(y)})${rot ? ` rotate(${f1(rot)})` : ""}${s !== 1 ? ` scale(${Math.round(s * 100) / 100})` : ""}"/>`;

// ---------------------------------------------------------------- geometri
const rect = [[0, 0], [W, 0], [W, H], [0, H]];
const spitLaut = pts(GEO.pantaiSpitLaut), spitDalam = pts(GEO.pantaiSpitDalam);
const laut = pts(GEO.pantaiLaut), dalam = pts(GEO.pantaiDalam);
const sungai = pts(GEO.sungai), sawah = pts(GEO.sawah), sawahU = pts(GEO.sawahUtara);
const hutan = pts(GEO.hutan), lapangan = pts(GEO.lapangan);
const batas = pts(PETA.batas);
const zUmkm = pts(PETA.zona.find((z) => z.id === "zona-umkm").koordinat);
const zHome = pts(PETA.zona.find((z) => z.id === "zona-homestay").koordinat);
const jalur = pts(PETA.jalur.koordinat);

const pantai = [...laut, ...spitLaut.slice().reverse()]; // dipakai utk garis pantai penuh
const garisPantai = [...spitLaut, ...laut];            // barat → selatan, laut di sisi kanan
const daratan = [[0, 0], [W, 0], [W, H], [laut.at(-1)[0], H], ...laut.slice().reverse(), ...spitLaut.slice().reverse(), [0, spitLaut[0][1]]];
const pasirSpit = [...spitDalam, ...spitLaut.slice().reverse(), [0, spitDalam[0][1]]];
const pasirSelatan = [...dalam, ...laut.slice().reverse()];
const lebarSungai = 52;

const diAir = (p) => !inside(p, daratan) || distLine(p, sungai) < lebarSungai / 2 + 14;
const diPasir = (p) => inside(p, pasirSpit) || inside(p, pasirSelatan);

// ---------------------------------------------------------------- warna (brand/tokens.css)
const C = {
  lautDalam: "#2F73B0", laut: "#4C93CD", lautDangkal: "#86C3E8", buih: "#FFFFFF",
  pasir: "#F3E3C3", pasirBasah: "#E3CB9C", pasirTitik: "#D8BE8C",
  darat: "#C4E19C", daratGaris: "#B2D58A", rumput: "#9CC878",
  sungai: "#6FAEDB", sungaiTepi: "#4F8FC4",
  sawah: ["#B8DC86", "#A6D277", "#C8E59A", "#D9E89A", "#9FCB72"], pematang: "#E8F1CF",
  hutan: "#5E9E62", pohon: ["#4E9F6A", "#5FAE72", "#3F8F5A", "#6DB87A"],
  umkm: "#FBE3DC", umkmTepi: "#E0674F", home: "#DDF0E2", homeTepi: "#4E9F6A",
  jalur: "#C69A5B", jalurIsi: "#FFF6E3",
};

// ---------------------------------------------------------------- simbol
const atap = [["#D2603F", "#B54A2F"], ["#E8913A", "#C9742A"], ["#4F7FB8", "#3A6699"], ["#C2553A", "#9E4029"], ["#8E6A4E", "#73533B"], ["#5F9E7E", "#4B8366"]];
const rumah = (id, w, h, [ra, rb]) => `
  <g id="${id}">
    <ellipse cx="${f1(w * 0.18)}" cy="${f1(h * 0.62)}" rx="${f1(w * 0.62)}" ry="${f1(h * 0.42)}" fill="#1B2A3D" opacity=".16"/>
    <rect x="${f1(-w / 2 + 2)}" y="${f1(h * 0.18)}" width="${f1(w - 4)}" height="${f1(h * 0.32)}" fill="#FFF8EE" stroke="#9C7356" stroke-width="1"/>
    <rect x="${f1(-w * 0.08)}" y="${f1(h * 0.24)}" width="${f1(w * 0.16)}" height="${f1(h * 0.26)}" fill="#8A5A3B"/>
    <rect x="${f1(-w * 0.36)}" y="${f1(h * 0.25)}" width="${f1(w * 0.14)}" height="${f1(h * 0.12)}" fill="#9CCBEA"/>
    <rect x="${f1(w * 0.22)}" y="${f1(h * 0.25)}" width="${f1(w * 0.14)}" height="${f1(h * 0.12)}" fill="#9CCBEA"/>
    <path d="M${f1(-w / 2)} ${f1(h * 0.2)}L${f1(w / 2)} ${f1(h * 0.2)}L${f1(w * 0.22)} ${f1(-h * 0.15)}L${f1(-w * 0.22)} ${f1(-h * 0.15)}Z" fill="${ra}"/>
    <path d="M${f1(-w / 2)} ${f1(-h * 0.5)}L${f1(w / 2)} ${f1(-h * 0.5)}L${f1(w * 0.22)} ${f1(-h * 0.15)}L${f1(-w * 0.22)} ${f1(-h * 0.15)}Z" fill="${rb}"/>
    <path d="M${f1(-w / 2)} ${f1(-h * 0.5)}L${f1(-w * 0.22)} ${f1(-h * 0.15)}L${f1(-w / 2)} ${f1(h * 0.2)}Z" fill="${rb}" opacity=".85"/>
    <path d="M${f1(w / 2)} ${f1(-h * 0.5)}L${f1(w * 0.22)} ${f1(-h * 0.15)}L${f1(w / 2)} ${f1(h * 0.2)}Z" fill="${ra}" opacity=".9"/>
    <path d="M${f1(-w * 0.22)} ${f1(-h * 0.15)}H${f1(w * 0.22)}" stroke="#fff" stroke-opacity=".45" stroke-width="1.4"/>
  </g>`;
const tenda = [["#E0674F", "#fff"], ["#DF9232", "#fff"], ["#4677B4", "#fff"], ["#4E9F6A", "#fff"], ["#D35B9A", "#fff"]];
const lapak = (id, [a, b]) => {
  let s = "";
  for (let i = 0; i < 6; i++) s += `<rect x="${-15 + i * 5}" y="-11" width="5" height="16" fill="${i % 2 ? b : a}"/>`;
  return `
  <g id="${id}">
    <ellipse cx="4" cy="9" rx="19" ry="7" fill="#1B2A3D" opacity=".16"/>
    <rect x="-14" y="2" width="28" height="9" fill="#FFF3DC" stroke="#9C7356" stroke-width=".8"/>
    <rect x="-10" y="4" width="20" height="4" fill="#E9B36B"/>
    ${s}
    <path d="M-15 5 q2.5 3.5 5 0 q2.5 3.5 5 0 q2.5 3.5 5 0 q2.5 3.5 5 0 q2.5 3.5 5 0 q2.5 3.5 5 0" fill="${a}"/>
    <rect x="-15" y="-11" width="30" height="16" fill="none" stroke="#1B2A3D" stroke-opacity=".12"/>
  </g>`;
};
const payungW = [["#DF9232", "#fff"], ["#E0674F", "#FFE7A3"], ["#4677B4", "#fff"], ["#2A9DB5", "#FFF6E3"], ["#D35B9A", "#fff"]];
const payung = (id, [a, b]) => {
  let s = "";
  for (let i = 0; i < 8; i++) {
    const t0 = (i * Math.PI) / 4, t1 = ((i + 1) * Math.PI) / 4;
    s += `<path d="M0 0L${f1(11 * Math.cos(t0))} ${f1(11 * Math.sin(t0))}A11 11 0 0 1 ${f1(11 * Math.cos(t1))} ${f1(11 * Math.sin(t1))}Z" fill="${i % 2 ? b : a}"/>`;
  }
  return `<g id="${id}"><ellipse cx="6" cy="7" rx="11" ry="7" fill="#1B2A3D" opacity=".14"/>${s}<circle r="1.6" fill="#6B4A2B"/></g>`;
};
const kelapa = (id, c1, c2) => {
  let s = "";
  for (let i = 0; i < 7; i++) {
    const a = (i * 360) / 7 + 10;
    s += `<ellipse cx="0" cy="-8" rx="3.4" ry="9" fill="${i % 2 ? c1 : c2}" transform="rotate(${f1(a)})"/>`;
  }
  return `<g id="${id}"><ellipse cx="7" cy="8" rx="13" ry="7" fill="#1B2A3D" opacity=".15"/>${s}<circle r="2.6" fill="#8A6A43"/></g>`;
};
const pohon = (id, c) => `<g id="${id}"><ellipse cx="6" cy="7" rx="13" ry="8" fill="#1B2A3D" opacity=".16"/><circle r="12" fill="${c}"/><circle cx="-3.5" cy="-4" r="5.5" fill="#fff" opacity=".16"/></g>`;

const defs = `
<defs>
  <linearGradient id="gLaut" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="${C.lautDalam}"/><stop offset=".55" stop-color="${C.laut}"/><stop offset="1" stop-color="#7DB8E2"/>
  </linearGradient>
  <pattern id="pOmbak" width="90" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
    <path d="M4 19 q 11 -9 22 0 t 22 0" stroke="#fff" stroke-opacity=".28" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </pattern>
  <pattern id="pPasir" width="22" height="22" patternUnits="userSpaceOnUse">
    <circle cx="4" cy="6" r="1.3" fill="${C.pasirTitik}" opacity=".55"/><circle cx="15" cy="16" r="1.1" fill="${C.pasirTitik}" opacity=".45"/><circle cx="17" cy="4" r=".8" fill="#fff" opacity=".6"/>
  </pattern>
  <pattern id="pRumput" width="34" height="34" patternUnits="userSpaceOnUse">
    <path d="M6 22 l3 -6 l3 6 M22 12 l3 -6 l3 6" stroke="${C.rumput}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>
  </pattern>
  <pattern id="pHutan" width="96" height="84" patternUnits="userSpaceOnUse">
    <rect width="96" height="84" fill="${C.hutan}"/>
    ${[[12, 12, 0], [44, 8, 1], [76, 16, 2], [28, 38, 3], [62, 40, 0], [90, 46, 1], [8, 60, 2], [44, 68, 1], [78, 72, 3], [-6, 30, 1], [102, 30, 3], [20, 88, 2], [60, -4, 2]]
      .map(([x, y, k]) => `<circle cx="${x + 4}" cy="${y + 5}" r="15" fill="#2F6E45" opacity=".35"/><circle cx="${x}" cy="${y}" r="15" fill="${C.pohon[k]}"/><circle cx="${x - 4}" cy="${y - 5}" r="6" fill="#fff" opacity=".13"/>`).join("")}
  </pattern>
  ${atap.map((a, i) => rumah("r" + i, 30, 24, a)).join("")}
  ${atap.map((a, i) => rumah("rb" + i, 40, 30, a)).join("")}
  ${tenda.map((t, i) => lapak("l" + i, t)).join("")}
  ${payungW.map((t, i) => payung("u" + i, t)).join("")}
  ${kelapa("k0", "#3F8F5A", "#5FAE72")}${kelapa("k1", "#4E9F6A", "#7CC48C")}
  ${C.pohon.map((c, i) => pohon("t" + i, c)).join("")}
  <g id="saung"><ellipse cx="5" cy="8" rx="16" ry="8" fill="#1B2A3D" opacity=".15"/><path d="M-13 -13H13V13H-13Z" fill="#C8A15A"/><path d="M-13 -13L0 0L13 -13Z" fill="#B48B45"/><path d="M-13 13L0 0L13 13Z" fill="#D8B46C"/><path d="M-13 -13L0 0M13 -13L0 0M-13 13L0 0M13 13L0 0" stroke="#8C6A33" stroke-width="1"/></g>
  <g id="perahu"><ellipse cx="4" cy="5" rx="26" ry="7" fill="#1B2A3D" opacity=".12"/><path d="M-26 0Q-10 -9 26 0Q-10 9 -26 0Z" fill="#fff" stroke="#3A6699" stroke-width="1.4"/><path d="M-20 0Q-6 -5 20 0" stroke="#E0674F" stroke-width="2.4" fill="none"/><path d="M-30 -10L30 10M-30 10L30 -10" stroke="#8A6A43" stroke-width="1.6" opacity=".7"/></g>
  <g id="papan"><path d="M-14 0Q0 -5 14 0Q0 5 -14 0Z" fill="#DF9232" stroke="#fff" stroke-width="1"/><circle cx="2" cy="0" r="2.6" fill="#1B2A3D"/></g>
</defs>`;

// ---------------------------------------------------------------- lapisan
const L = [];
// 1. laut
L.push(`<rect width="${f1(W)}" height="${f1(H)}" fill="url(#gLaut)"/>`);
L.push(`<path d="${smooth(garisPantai)}" stroke="${C.lautDangkal}" stroke-width="420" fill="none" stroke-linecap="round" opacity=".55"/>`);
L.push(`<path d="${smooth(garisPantai)}" stroke="${C.lautDangkal}" stroke-width="180" fill="none" stroke-linecap="round" opacity=".7"/>`);
L.push(`<rect width="${f1(W)}" height="${f1(H)}" fill="url(#pOmbak)"/>`);
for (const [dd, sw, op, dash] of [[150, 4, 0.35, "60 40"], [95, 5, 0.5, "90 30"], [55, 6, 0.7, "140 24"], [26, 7, 0.9, ""]])
  L.push(`<path d="${smooth(offset(garisPantai, dd))}" stroke="${C.buih}" stroke-width="${sw}" fill="none" stroke-linecap="round" opacity="${op}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`);

// 2. daratan
const daratD = dz(daratan);
L.push(`<path d="${daratD}" fill="${C.darat}"/>`);
L.push(`<clipPath id="cDarat"><path d="${daratD}"/></clipPath>`);
L.push(`<rect width="${f1(W)}" height="${f1(H)}" fill="url(#pRumput)" clip-path="url(#cDarat)"/>`);

// 2b. zona (di bawah pasir agar pantai tetap berwarna pasir): dasar berwarna, tepi lembut (tanpa garis putus-putus)
const zona = (poly, isi, tepi) =>
  `<path d="${smooth(poly, true)}" fill="${isi}" opacity=".92"/><path d="${smooth(poly, true)}" fill="none" stroke="${tepi}" stroke-width="7" stroke-opacity=".35" stroke-linejoin="round"/><path d="${smooth(offset(poly, 0), true)}" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".7"/>`;
L.push(`<g clip-path="url(#cDarat)">${zona(zHome, C.home, C.homeTepi)}${zona(zUmkm, C.umkm, C.umkmTepi)}</g>`);

// 3. pasir
for (const poly of [pasirSpit, pasirSelatan]) {
  L.push(`<path d="${dz(poly)}" fill="${C.pasir}"/>`);
  L.push(`<path d="${dz(poly)}" fill="url(#pPasir)"/>`);
}
L.push(`<path d="${smooth(garisPantai)}" stroke="${C.pasirBasah}" stroke-width="22" fill="none" stroke-linecap="round"/>`);
L.push(`<path d="${smooth(offset(garisPantai, 9))}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".95"/>`);

// 4. sawah (petak berputar), lapangan
function petak(poly, ang, cw, ch) {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const R = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + cw;
  let s = "";
  for (let y = -R; y < R; y += ch) {
    let x = -R + rr(0, cw);
    while (x < R) {
      const w = cw * rr(0.7, 1.6);
      s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w - 3)}" height="${f1(ch - 3)}" rx="2" fill="${pick(C.sawah)}"/>`;
      x += w;
    }
  }
  const id = "c" + Math.floor(rnd() * 1e6);
  return `<clipPath id="${id}"><path d="${dz(poly)}"/></clipPath><g clip-path="url(#${id})"><path d="${dz(poly)}" fill="${C.pematang}"/><g transform="translate(${f1(cx)} ${f1(cy)}) rotate(${ang})">${s}</g></g>`;
}
L.push(petak(sawah, -8, 64, 40));
L.push(petak(sawahU, 6, 58, 38));
L.push(petak(lapangan, -4, 48, 30));

// 5. hutan
L.push(`<path d="${smooth(hutan, true)}" fill="url(#pHutan)"/>`);
L.push(`<path d="${smooth(hutan, true)}" fill="none" stroke="#3F8F5A" stroke-width="10" opacity=".35"/>`);

// 6. sungai
L.push(`<path d="${smooth(sungai)}" stroke="${C.sungaiTepi}" stroke-width="${lebarSungai + 10}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(sungai)}" stroke="${C.sungai}" stroke-width="${lebarSungai}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(offset(sungai, -8))}" stroke="#fff" stroke-width="2.2" fill="none" opacity=".45" stroke-dasharray="40 30"/>`);
L.push(`<path d="${smooth(offset(sungai, 10))}" stroke="#fff" stroke-width="1.8" fill="none" opacity=".35" stroke-dasharray="26 44"/>`);


// 8. jalur (di bawah bangunan agar bangunan tidak tertutup)
L.push(`<path d="${smooth(jalur)}" stroke="${C.jalur}" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="${C.jalurIsi}" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
L.push(`<path d="${smooth(jalur)}" stroke="${C.jalur}" stroke-width="2.4" fill="none" stroke-dasharray="1 11" stroke-linecap="round"/>`);

// jembatan di titik jalur menyeberang sungai
(function () {
  for (let i = 1; i < jalur.length; i++) {
    const a = jalur[i - 1], b = jalur[i];
    for (let t = 0; t <= 1; t += 0.02) {
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      if (distLine(p, sungai) < 4) {
        const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
        L.push(`<g transform="translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(ang)})">
          <ellipse cx="4" cy="8" rx="${lebarSungai * 0.75}" ry="10" fill="#1B2A3D" opacity=".18"/>
          <rect x="-${lebarSungai * 0.75}" y="-9" width="${lebarSungai * 1.5}" height="18" rx="2" fill="#B98C55"/>
          ${Array.from({ length: 12 }, (_, k) => `<path d="M${f1(-lebarSungai * 0.75 + 3 + k * lebarSungai * 0.125)} -9V9" stroke="#8C6A33" stroke-width="1.2"/>`).join("")}
          <path d="M-${lebarSungai * 0.75} -9H${lebarSungai * 0.75}M-${lebarSungai * 0.75} 9H${lebarSungai * 0.75}" stroke="#5A3E22" stroke-width="2.4"/>
          <circle cx="-${lebarSungai * 0.75}" cy="-9" r="3.4" fill="#5A3E22"/><circle cx="-${lebarSungai * 0.75}" cy="9" r="3.4" fill="#5A3E22"/>
          <circle cx="${lebarSungai * 0.75}" cy="-9" r="3.4" fill="#5A3E22"/><circle cx="${lebarSungai * 0.75}" cy="9" r="3.4" fill="#5A3E22"/>
        </g>`);
        return;
      }
    }
  }
})();

// 9. isi zona & desa
const dekatJalur = (p, m) => distLine(p, jalur) < m;
const bebas = (p) => !diAir(p) && !diPasir(p) && !dekatJalur(p, 22);
const items = []; // [y, svg] → diurutkan dari atas ke bawah agar tumpukan wajar

// Homestay: rumah besar, halaman, pohon
for (const p of poisson(zHome, 46, (p) => bebas(p) && distLine(p, zHome.concat([zHome[0]])) > 16))
  items.push([p[1], use("rb" + Math.floor(rnd() * atap.length), p[0], p[1], rr(-10, 10))]);
for (const p of poisson(zHome, 34, (p) => bebas(p)).filter(() => rnd() < 0.35))
  items.push([p[1], use(rnd() < 0.5 ? "t" + Math.floor(rnd() * 4) : "k" + (rnd() < 0.5 ? 0 : 1), p[0], p[1], rr(0, 360), rr(0.8, 1.15))]);

// UMKM: barisan lapak sejajar garis pantai, saung, payung di pasir
const dalamUmkm = (p) => inside(p, zUmkm);
for (const [dist, gap, jenis] of [[-30, 40, "lapak"], [-72, 44, "lapak"], [-112, 70, "saung"]]) {
  for (const [x, y, ang] of along(offset(dalam, dist), gap, rr(0, gap))) {
    const p = [x + rr(-4, 4), y + rr(-4, 4)];
    if (!dalamUmkm(p) || diAir(p) || dekatJalur(p, 20)) continue;
    items.push([p[1], jenis === "lapak" ? use("l" + Math.floor(rnd() * tenda.length), p[0], p[1], ang + rr(-4, 4)) : use("saung", p[0], p[1], ang)]);
  }
}
for (const [x, y] of along(offset(dalam, 26), 36, 10)) {
  const p = [x + rr(-6, 6), y + rr(-6, 6)];
  if (!inside(p, pasirSelatan)) continue;
  if (!inside(p, zUmkm) && rnd() < 0.6) continue;
  items.push([p[1], use("u" + Math.floor(rnd() * payungW.length), p[0], p[1], rr(0, 360), rr(0.9, 1.15))]);
}
// kelapa di sepanjang pantai (sisi darat)
for (const line of [offset(dalam, -10), offset(spitDalam, 10)])
  for (const [x, y] of along(line, 34, 5)) {
    const p = [x + rr(-10, 10), y + rr(-10, 10)];
    if (diAir(p) || rnd() < 0.25) continue;
    items.push([p[1], use("k" + (rnd() < 0.5 ? 0 : 1), p[0], p[1], rr(0, 360), rr(0.9, 1.3))]);
  }

// Desa (di luar zona): rumah kecil + pohon
const luarZona = (p) => !inside(p, zHome) && !inside(p, zUmkm) && !inside(p, sawah) && !inside(p, sawahU) && !inside(p, hutan) && !inside(p, lapangan);
const nDesa = noise(520, 77), nPohon = noise(260, 91);
const kandidatDesa = poisson(rect, 36, (p) => bebas(p) && luarZona(p) && distLine(p, garisPantai) > 30);
for (const p of kandidatDesa) {
  // permukiman lebih padat di tepi sungai & dekat pantai
  const dekat = Math.max(0, 1 - distLine(p, sungai) / 500) * 0.35 + Math.max(0, 1 - distLine(p, dalam) / 400) * 0.25;
  const n = nDesa(p) + dekat;
  const ambang = inside(p, batas) ? 0.95 : 0.74; // di dalam kawasan: lebih hijau agar zona menonjol
  if (n > ambang) items.push([p[1], use("r" + Math.floor(rnd() * atap.length), p[0], p[1], rr(-12, 12))]);
  else if (nPohon(p) > 0.45 && rnd() < 0.55) items.push([p[1], use(rnd() < 0.3 ? "k" + (rnd() < 0.5 ? 0 : 1) : "t" + Math.floor(rnd() * 4), p[0], p[1], rr(0, 360), rr(0.85, 1.3))]);
}
// pohon di pematang sawah & tepi hutan
for (const p of poisson(sawah, 120, (p) => !diAir(p))) items.push([p[1], use("t" + Math.floor(rnd() * 4), p[0], p[1], 0, rr(0.7, 1))]);
for (const [x, y] of along(hutan.concat([hutan[0]]), 26, 0)) {
  const p = [x + rr(-8, 8), y + rr(-8, 8)];
  if (!diAir(p)) items.push([p[1], use("t" + Math.floor(rnd() * 4), p[0], p[1], 0, rr(1, 1.35))]);
}

items.sort((a, b) => a[0] - b[0]);
L.push(`<g>${items.map((i) => i[1]).join("")}</g>`);

// 10. laut: perahu & peselancar
for (const [x, y, ang] of along(offset(garisPantai, 260), 420, 120)) if (x > 0 && y > 0 && x < W && y < H) L.push(use("perahu", x, y, ang + rr(-25, 25)));
for (const [x, y, ang] of along(offset(laut, 70), 130, 40).slice(2, 12)) L.push(use("papan", x + rr(-10, 10), y + rr(-10, 10), ang + rr(-60, 60)));

// 11. tabir di luar kawasan studi (zona fokus tanpa garis tegas)
L.push(`<path d="M0 0H${f1(W)}V${f1(H)}H0Z ${dz(batas)}" fill="#F2F6EE" fill-rule="evenodd" opacity=".34" clip-path="url(#cDarat)"/>`);

// ---------------------------------------------------------------- tulis
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(W)} ${f1(H)}" width="${Math.round(W)}" height="${Math.round(H)}">
<!-- Dibuat oleh tools/gen-ilustrasi.mjs — jangan edit manual. Batas: ${JSON.stringify(B)} -->
${defs}
${L.join("\n")}
</svg>`;
fs.mkdirSync(path.join(ROOT, "assets"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "assets/peta-ilustrasi.svg"), svg);
console.log(`assets/peta-ilustrasi.svg  ${Math.round(W)}×${Math.round(H)}  ${(svg.length / 1024).toFixed(0)} KB  ${items.length} objek`);
