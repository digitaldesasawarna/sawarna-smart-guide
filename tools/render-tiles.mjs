#!/usr/bin/env node
/*
 * Memotong assets/peta-ilustrasi.svg menjadi tile WebP (256×256) → assets/tiles/{z}/{x}/{y}.webp
 *
 *   node tools/render-tiles.mjs
 *
 * Memakai Google Chrome / Microsoft Edge mode headless (tanpa instalasi paket tambahan).
 * Atur lokasi browser lewat variabel CHROME bila tidak ditemukan otomatis.
 *
 * Zoom 16–18 dirender untuk seluruh gambar; zoom 19 hanya untuk kawasan inti (batas + margin)
 * agar ukuran total tetap kecil. Di luar kawasan inti, zoom 19 memakai tile 18 yang diperbesar.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SVG = path.join(ROOT, "assets/peta-ilustrasi.svg");
const OUT = path.join(ROOT, "assets/tiles");
const GEO = JSON.parse(fs.readFileSync(path.join(ROOT, "data/geografi.json"), "utf8"));
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8"), ctx);
const PETA = ctx.window.PETA;
const KUALITAS = Number(process.env.QUALITY || 80);

const B = GEO.batasGambar;
const lats = PETA.batas.map((p) => p[0]), lngs = PETA.batas.map((p) => p[1]), M = 0.0015;
const INTI = { utara: Math.max(...lats) + M, selatan: Math.min(...lats) - M, barat: Math.min(...lngs) - M, timur: Math.max(...lngs) + M };
const LEVEL = [[16, B], [17, B], [18, B], [19, INTI]];

const lon2x = (lng, z) => ((lng + 180) / 360) * 256 * 2 ** z;
const lat2y = (lat, z) => ((1 - Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) / Math.PI) / 2) * 256 * 2 ** z;

// ---------------------------------------------------------------- Chrome
const kandidat = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].filter(Boolean);
const CHROME = kandidat.find((p) => fs.existsSync(p));
if (!CHROME) { console.error("Chrome/Edge tidak ditemukan. Set variabel CHROME ke lokasi chrome.exe"); process.exit(1); }

const profil = fs.mkdtempSync(path.join(os.tmpdir(), "render-tiles-"));
const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--remote-debugging-port=0", `--user-data-dir=${profil}`, "about:blank"], { stdio: "ignore" });
const portFile = path.join(profil, "DevToolsActivePort");
for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await new Promise((r) => setTimeout(r, 100));
const [port, wsPath] = fs.readFileSync(portFile, "utf8").trim().split("\n");
const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0;
const tunggu = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && tunggu.has(m.id)) { const [ok, no] = tunggu.get(m.id); tunggu.delete(m.id); m.error ? no(new Error(m.error.message)) : ok(m.result); }
};
const cdp = (method, params = {}, sessionId) => new Promise((ok, no) => { const i = ++id; tunggu.set(i, [ok, no]); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });

const { targetId } = await cdp("Target.createTarget", { url: "about:blank" });
const { sessionId } = await cdp("Target.attachToTarget", { targetId, flatten: true });
const page = (m, p) => cdp(m, p, sessionId);
await page("Page.enable");

// ---------------------------------------------------------------- render
// SVG dimuat sekali; tiap level zoom dirender per bongkah 2048 px ke <canvas>,
// lalu bongkah dipotong menjadi tile 256 px dan di-encode WebP oleh Chrome.
fs.rmSync(OUT, { recursive: true, force: true });
const svgTeks = fs.readFileSync(SVG, "utf8");
const muat = await page("Runtime.evaluate", {
  expression: `new Promise(r => {
    const i = document.createElement("img"); i.id = "i"; document.body.appendChild(i);
    i.onload = () => i.decode().then(() => r(i.naturalWidth)); i.onerror = () => r(-1);
    i.src = URL.createObjectURL(new Blob([${JSON.stringify(svgTeks)}], { type: "image/svg+xml" }));
  })`,
  awaitPromise: true,
});
if (muat.result.value <= 0) throw new Error("SVG gagal dimuat");

const BONGKAH = 8; // 8×8 tile per bongkah
let total = 0, bytes = 0;
for (const [z, R] of LEVEL) {
  const X0 = lon2x(B.barat, z), X1 = lon2x(B.timur, z), Y0 = lat2y(B.utara, z), Y1 = lat2y(B.selatan, z);
  const tx0 = Math.floor(lon2x(Math.max(R.barat, B.barat), z) / 256), tx1 = Math.floor((lon2x(Math.min(R.timur, B.timur), z) - 1e-6) / 256);
  const ty0 = Math.floor(lat2y(Math.min(R.utara, B.utara), z) / 256), ty1 = Math.floor((lat2y(Math.max(R.selatan, B.selatan), z) - 1e-6) / 256);
  let n = 0;
  for (let bx = tx0; bx <= tx1; bx += BONGKAH) {
    for (let by = ty0; by <= ty1; by += BONGKAH) {
      const nx = Math.min(BONGKAH, tx1 - bx + 1), ny = Math.min(BONGKAH, ty1 - by + 1);
      const arg = JSON.stringify({ X0, Y0, X1, Y1, bx, by, nx, ny, q: KUALITAS / 100 });
      const { result, exceptionDetails } = await page("Runtime.evaluate", {
        expression: `(async (a) => {
          const img = document.getElementById("i"), s = (a.X1 - a.X0) / img.naturalWidth, sy = (a.Y1 - a.Y0) / img.naturalHeight;
          const c = document.createElement("canvas"); c.width = a.nx * 256; c.height = a.ny * 256;
          const g = c.getContext("2d");
          g.setTransform(s, 0, 0, sy, a.X0 - a.bx * 256, a.Y0 - a.by * 256);
          g.drawImage(img, 0, 0);
          const t = document.createElement("canvas"); t.width = t.height = 256; const tg = t.getContext("2d");
          const out = {};
          for (let i = 0; i < a.nx; i++) for (let j = 0; j < a.ny; j++) {
            tg.clearRect(0, 0, 256, 256);
            tg.drawImage(c, i * 256, j * 256, 256, 256, 0, 0, 256, 256);
            out[(a.bx + i) + "/" + (a.by + j)] = t.toDataURL("image/webp", a.q).split(",")[1];
          }
          return out;
        })(${arg})`,
        awaitPromise: true, returnByValue: true,
      });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description || "gagal render");
      for (const [key, b64] of Object.entries(result.value)) {
        const [x, y] = key.split("/");
        const file = path.join(OUT, String(z), x, `${y}.webp`);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        const buf = Buffer.from(b64, "base64");
        fs.writeFileSync(file, buf);
        n++; bytes += buf.length;
      }
    }
  }
  total += n;
  console.log(`z${z}: ${n} tile`);
}
console.log(`selesai: ${total} tile, ${(bytes / 1024 / 1024).toFixed(1)} MB → assets/tiles`);
await cdp("Browser.close").catch(() => {});
ws.close();
proc.kill();
setTimeout(() => { try { fs.rmSync(profil, { recursive: true, force: true }); } catch {} process.exit(0); }, 500);
