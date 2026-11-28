/*
 * "Pulau di atas awan": tebing tanah berlapis, air terjun di tepi laut, dan awan di sekeliling pulau.
 * Dipakai peta besar Sawarna (tools/gen-sawarna.mjs). Peta detail masih memakai salinan setara di
 * tools/gen-ilustrasi.mjs (lapisPulau) — satukan ke modul ini saat peta detail dirender ulang.
 */
import { f1 } from "./simbol.mjs";

// definisi awan (3 bentuk gumpalan) + gradien air terjun & tebing
export const defsPulau = () => [
  [[-42, 2, 22], [-14, -12, 30], [20, -6, 25], [46, 4, 17]],
  [[-30, 0, 26], [4, -16, 32], [36, -2, 22]],
  [[-48, 4, 16], [-22, -8, 24], [8, -14, 28], [38, -4, 22], [60, 6, 14]],
].map((bola, i) => `<g id="awan${i}"><ellipse cx="4" cy="16" rx="${f1(Math.max(...bola.map((b) => Math.abs(b[0]) + b[2])) * 0.95)}" ry="9" fill="#BFD6E6" opacity=".55"/>
  ${bola.map(([x, y, r]) => `<circle cx="${x}" cy="${y + 5}" r="${r}" fill="#DCEAF3"/>`).join("")}
  ${bola.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF"/>`).join("")}
  <rect x="${Math.min(...bola.map((b) => b[0] - b[2] * 0.7))}" y="2" width="${f1(Math.max(...bola.map((b) => b[0] + b[2] * 0.7)) - Math.min(...bola.map((b) => b[0] - b[2] * 0.7)))}" height="14" rx="7" fill="#FFFFFF"/></g>`).join("") +
  `<linearGradient id="gAirTerjun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4E98CB"/><stop offset=".12" stop-color="#6FB3E0"/>
   <stop offset=".55" stop-color="#A9D8F2" stop-opacity=".95"/><stop offset=".85" stop-color="#E4F4FC" stop-opacity=".75"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>
   <linearGradient id="gTebing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FA84E"/><stop offset=".07" stop-color="#5E9444"/><stop offset=".08" stop-color="#A4744B"/>
   <stop offset=".45" stop-color="#8A5E3D"/><stop offset=".7" stop-color="#755645"/><stop offset="1" stop-color="#5C4538"/></linearGradient>`;

/*
 * pulau: titik tepi pulau (unit peta), P: proyektor ke layar, air[i]: sisi i (pulau[i]→pulau[i+1]) berupa air.
 * D: kedalaman tebing (unit layar). skala: pembesar ukuran garis, awan, & jarak (peta besar dilihat lebih jauh).
 * Hasil: { belakang, tepi, depan } — susun: belakang → tepi → permukaan pulau → objek → depan.
 */
export function lapisPulau(pulau, P, { D, air, skala = 1 }) {
  const pp = pulau.map(([x, y]) => P(x, y)), n = pp.length, k = skala;
  const cp = [pp.reduce((t, q) => t + q[0], 0) / n, pp.reduce((t, q) => t + q[1], 0) / n];
  const acak = (i, s) => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };
  const gerigi = (i) => { const u = i / 6, kk = Math.floor(u), t = u - kk, h = t * t * (3 - 2 * t); return 0.8 + 0.35 * (acak(kk, 1) * (1 - h) + acak(kk + 1, 1) * h); };
  const titikAir = (i) => air[i] || air[(i - 1 + n) % n];
  const bawah = pp.map(([x, y], i) => [x - (x - cp[0]) * 0.06, y + D * (titikAir(i) ? 1.25 : gerigi(i))]);
  const muka = [];
  for (let i = 0; i < n; i++) {
    const a = pp[i], b = pp[(i + 1) % n];
    let nx = b[1] - a[1], ny = -(b[0] - a[0]);
    if (nx * ((a[0] + b[0]) / 2 - cp[0]) + ny * ((a[1] + b[1]) / 2 - cp[1]) < 0) { nx = -nx; ny = -ny; }
    if (ny < -0.5 * Math.hypot(nx, ny)) continue;
    muka.push({ i, z: (a[1] + b[1]) / 2, a, b, ba: bawah[i], bb: bawah[(i + 1) % n], terang: -nx / (Math.hypot(nx, ny) || 1) });
  }
  muka.sort((u, v) => u.z - v.z);
  const dd = (q) => q.map(([x, y], j) => `${j ? "L" : "M"}${f1(x)} ${f1(y)}`).join("") + "Z";
  let latarTanah = "";
  for (let i = 0; i < n; i++) { const w = air[i] ? "#6FB3E0" : "#5E4535";
    latarTanah += `<path d="${dd([pp[i], pp[(i + 1) % n], bawah[(i + 1) % n], bawah[i]])}" fill="${air[i] ? "url(#gAirTerjun)" : w}" stroke="${w}" stroke-width="${air[i] ? 0 : 1.5 * k}"/>`; }
  latarTanah += `<path d="${dd(bawah.filter((_, i) => !titikAir(i)))}" fill="#5E4535"/>`;
  let tebing = "", lapisan = "", akar = "", aliran = "", kabut = "", buih = "";
  for (const f of muka) {
    if (air[f.i]) {
      tebing += `<path d="${dd([f.a, f.b, f.bb, f.ba])}" fill="url(#gAirTerjun)"/>`;
      const pj = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), jml = Math.max(1, Math.round(pj / (7 * k)));
      for (let j = 0; j < jml; j++) {
        const t = (j + 0.5) / jml, x = f.a[0] + (f.b[0] - f.a[0]) * t, y = f.a[1] + (f.b[1] - f.a[1]) * t, yb = f.ba[1] + (f.bb[1] - f.ba[1]) * t;
        aliran += `M${f1(x)} ${f1(y + 2 * k)}V${f1(y + (yb - y) * (0.45 + 0.5 * acak(f.i * 7 + j, 12)))}`;
      }
      buih += `M${f1(f.a[0])} ${f1(f.a[1])}L${f1(f.b[0])} ${f1(f.b[1])}`;
      const xm = (f.ba[0] + f.bb[0]) / 2, ym = (f.ba[1] + f.bb[1]) / 2;
      kabut += `<circle cx="${f1(xm + (acak(f.i, 13) - 0.5) * 10 * k)}" cy="${f1(ym - 6 * k)}" r="${f1((14 + 12 * acak(f.i, 14)) * k)}"/>`;
      continue;
    }
    tebing += `<path d="${dd([f.a, f.b, f.bb, f.ba])}" fill="url(#gTebing)" stroke="url(#gTebing)" stroke-width="${f1(1.2 * k)}"/>`;
    if (f.terang > 0.2) tebing += `<path d="${dd([f.a, f.b, f.bb, f.ba])}" fill="#FFFFFF" opacity="${f1(f.terang * 0.12)}"/>`;
    for (const t of [0.3, 0.55, 0.8]) {
      const p1 = [f.a[0] + (f.ba[0] - f.a[0]) * t, f.a[1] + (f.ba[1] - f.a[1]) * t], p2 = [f.b[0] + (f.bb[0] - f.b[0]) * t, f.b[1] + (f.bb[1] - f.b[1]) * t];
      lapisan += `M${f1(p1[0])} ${f1(p1[1])}L${f1(p2[0])} ${f1(p2[1])}`;
    }
    if (acak(f.i, 3) < 0.12) { const x = f.a[0], y = f.a[1] + 6 * k; akar += `M${f1(x)} ${f1(y)}q${f1((-3 + 6 * acak(f.i, 4)) * k)} ${f1(10 * k)} ${f1((-2 + 4 * acak(f.i, 5)) * k)} ${f1((14 + 14 * acak(f.i, 6)) * k)}`; }
  }
  const xs = pp.map((q) => q[0]), lebar = Math.max(...xs) - Math.min(...xs), yBawah = Math.max(...bawah.map((q) => q[1]));
  let belakang = `<ellipse cx="${f1(cp[0])}" cy="${f1(yBawah - D * 0.3)}" rx="${f1(lebar * 0.55)}" ry="${f1(D * 0.55)}" fill="#FFFFFF" opacity=".55" filter="url(#b20)"/>`;
  for (let i = 0; i < n; i += Math.max(1, Math.floor(n / 30))) {
    const [x, y] = pp[i], vx = x - cp[0], vy = y - cp[1], l = Math.hypot(vx, vy) || 1, jauh = (50 + 90 * acak(i, 7)) * k;
    belakang += `<use href="#awan${i % 3}" transform="translate(${f1(x + (vx / l) * jauh)} ${f1(y + (vy / l) * jauh * 0.6 + 20 * k)}) scale(${f1((0.9 + 0.8 * acak(i, 8)) * k)})"/>`;
  }
  let depan = "";
  const yAtasDepan = (x) => Math.max(...pp.filter((q) => Math.abs(q[0] - x) < 30 * k).map((q) => q[1]), -Infinity);
  for (let i = 0; i < muka.length; i += 4) {
    const f = muka[i], s = (0.9 + 0.9 * acak(f.i, 9)) * k, x = (f.ba[0] + f.bb[0]) / 2 + (acak(f.i, 10) - 0.5) * 40 * k, y = (f.ba[1] + f.bb[1]) / 2 + (10 + 40 * acak(f.i, 11)) * k;
    if (y - 45 * s < yAtasDepan(x) + 25 * k) continue;
    depan += `<use href="#awan${f.i % 3}" transform="translate(${f1(x)} ${f1(y)}) scale(${f1(s)})"/>`;
  }
  const tepi = `<g>${tebing}<path d="${lapisan}" stroke="#4E3A2C" stroke-opacity=".35" stroke-width="${f1(1.6 * k)}" fill="none"/><path d="${akar}" stroke="#4E3A2C" stroke-opacity=".6" stroke-width="${f1(1 * k)}" fill="none"/>
    ${muka.filter((f) => !air[f.i]).map((f) => `<path d="M${f1(f.a[0])} ${f1(f.a[1])}L${f1(f.b[0])} ${f1(f.b[1])}" stroke="#5E9A45" stroke-width="${f1(4 * k)}" stroke-linecap="round"/>`).join("")}
    <path d="${aliran}" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="${f1(1.3 * k)}" stroke-linecap="round" fill="none" stroke-dasharray="${[14, 6, 4, 6].map((v) => f1(v * k)).join(" ")}"/>
    <path d="${buih}" stroke="#F2FAFE" stroke-width="${f1(3.2 * k)}" stroke-linecap="round" fill="none"/>
    <g fill="#FFFFFF" opacity=".85" filter="url(#b4)">${kabut}</g></g>`;
  return { belakang: `<g>${belakang}${latarTanah}</g>`, tepi, depan: `<g>${depan}</g>` };
}
