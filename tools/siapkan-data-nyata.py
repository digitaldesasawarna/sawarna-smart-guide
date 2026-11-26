#!/usr/bin/env python3
"""
Menyiapkan data dunia nyata untuk ilustrasi peta (docs/DESIGN.md §5.1–5.2).

  python tools/siapkan-data-nyata.py

1. Mengambil bangunan, jalan, dan sungai dari OpenStreetMap (Overpass API) di batasGambar.
2. Mengambil citra satelit Esri zoom 18 HANYA sebagai acuan warna atap tiap bangunan
   (citra tidak disimpan dan tidak ditampilkan; yang disimpan hanya nama warna atap).
3. Menulis data/nyata.json, dipakai tools/gen-ilustrasi.mjs.

Data OSM © kontributor OpenStreetMap (ODbL) — atribusi wajib dicantumkan di peta.
Butuh: Python 3 + Pillow. Tanpa paket lain.
"""
import colorsys, io, json, math, os, sys, time, urllib.parse, urllib.request
from PIL import Image, ImageDraw

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO = json.load(open(os.path.join(AKAR, "data", "geografi.json"), encoding="utf-8"))
B = GEO["batasGambar"]
UA = {"User-Agent": "sawarna-smart-guide/1.0 (peta wisata desa)"}
Z = 18

def ambil(url, data=None, coba=3):
    for i in range(coba):
        try:
            req = urllib.request.Request(url, data=data, headers=UA)
            with urllib.request.urlopen(req, timeout=90) as r:
                return r.read()
        except Exception as e:
            if i == coba - 1: raise
            time.sleep(2 + i * 3)

# ---------------------------------------------------------------- 1. OSM
bbox = f'{B["selatan"]},{B["barat"]},{B["utara"]},{B["timur"]}'
q = f"""[out:json][timeout:90];
(way["building"]({bbox});way["highway"]({bbox});way["waterway"]({bbox}););
out body;>;out skel qt;"""
print("OSM: mengambil…")
osm = json.loads(ambil("https://overpass-api.de/api/interpreter", urllib.parse.urlencode({"data": q}).encode()))
node = {e["id"]: (e["lat"], e["lon"]) for e in osm["elements"] if e["type"] == "node"}
bangunan, jalan, air = [], [], []
for e in osm["elements"]:
    if e["type"] != "way" or "tags" not in e: continue
    tg = e["tags"]; pts = [node[n] for n in e["nodes"] if n in node]
    if len(pts) < 2: continue
    if "building" in tg and len(pts) >= 4:
        bangunan.append({"id": e["id"], "jenis": tg.get("building", "yes"), "poly": pts[:-1] if pts[0] == pts[-1] else pts})
    elif "highway" in tg:
        jalan.append({"kelas": tg["highway"], "nama": tg.get("name", ""), "garis": pts})
    elif "waterway" in tg:
        air.append({"kelas": tg["waterway"], "nama": tg.get("name", ""), "garis": pts})
print(f"  {len(bangunan)} bangunan, {len(jalan)} jalan, {len(air)} sungai/kali")

# ---------------------------------------------------------------- 2. warna atap dari citra (acuan saja)
def lon2x(lng): return (lng + 180) / 360 * 256 * 2 ** Z
def lat2y(lat): return (1 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / math.pi) / 2 * 256 * 2 ** Z
tx0, tx1 = int(lon2x(B["barat"]) // 256), int(lon2x(B["timur"]) // 256)
ty0, ty1 = int(lat2y(B["utara"]) // 256), int(lat2y(B["selatan"]) // 256)
W, H = (tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256
mosaik = Image.new("RGB", (W, H))
total = (tx1 - tx0 + 1) * (ty1 - ty0 + 1)
print(f"Citra acuan: {total} tile z{Z}…")
n = 0
for tx in range(tx0, tx1 + 1):
    for ty in range(ty0, ty1 + 1):
        url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{Z}/{ty}/{tx}"
        try:
            mosaik.paste(Image.open(io.BytesIO(ambil(url))).convert("RGB"), ((tx - tx0) * 256, (ty - ty0) * 256))
        except Exception as e:
            print("  gagal", tx, ty, e)
        n += 1
        if n % 50 == 0: print(f"  {n}/{total}")
        time.sleep(0.05)

def kelas_atap(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h *= 360
    if s < 0.16 and v > 0.42: return "seng"
    if 170 <= h <= 260 and s > 0.15: return "biru"
    if 70 <= h < 170 and s > 0.15: return "hijau"
    if v < 0.34: return "cokelat"
    if h < 14 or h > 340: return "merah" if s > 0.42 else "terakota"
    if h < 26: return "terakota"
    if h < 48: return "genteng"
    return "cokelat"

hitung = {}
for bg in bangunan:
    pts = [(lon2x(lng) - tx0 * 256, lat2y(lat) - ty0 * 256) for lat, lng in bg["poly"]]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, y0, x1, y1 = int(min(xs)), int(min(ys)), int(max(xs)) + 1, int(max(ys)) + 1
    if x1 - x0 < 1 or y1 - y0 < 1 or x0 < 0 or y0 < 0 or x1 > W or y1 > H:
        bg["atap"] = "terakota"; continue
    potong = mosaik.crop((x0, y0, x1, y1))
    topeng = Image.new("L", potong.size, 0)
    ImageDraw.Draw(topeng).polygon([(x - x0, y - y0) for x, y in pts], fill=255)
    px = [c for c, m in zip(potong.getdata(), topeng.getdata()) if m]
    if not px: px = list(potong.getdata())
    px.sort(key=lambda c: sum(c)); tengah = px[len(px) // 2]
    bg["atap"] = kelas_atap(*tengah)
    # luas (m²) dari poligon
    k = 111320 * math.cos(math.radians(bg["poly"][0][0]))
    luas = 0
    P = [(lng * k, lat * 110540) for lat, lng in bg["poly"]]
    for i in range(len(P)):
        a, c = P[i], P[(i + 1) % len(P)]
        luas += a[0] * c[1] - c[0] * a[1]
    bg["luas"] = round(abs(luas) / 2)
    hitung[bg["atap"]] = hitung.get(bg["atap"], 0) + 1
print("  warna atap:", hitung)

# ---------------------------------------------------------------- 3. tulis
r6 = lambda p: [round(p[0], 6), round(p[1], 6)]
keluar = {
    "_catatan": "Dibuat oleh tools/siapkan-data-nyata.py. Bangunan, jalan, sungai © kontributor OpenStreetMap (ODbL). "
                "Warna atap disimpulkan dari citra satelit Esri (acuan, citra tidak disimpan).",
    "diambil": time.strftime("%Y-%m-%d"),
    "bangunan": [{"id": b["id"], "atap": b.get("atap", "terakota"), "luas": b.get("luas", 0), "poly": [r6(p) for p in b["poly"]]} for b in bangunan],
    "jalan": [{"kelas": j["kelas"], "nama": j["nama"], "garis": [r6(p) for p in j["garis"]]} for j in jalan],
    "air": [{"kelas": a["kelas"], "nama": a["nama"], "garis": [r6(p) for p in a["garis"]]} for a in air],
}
with open(os.path.join(AKAR, "data", "nyata.json"), "w", encoding="utf-8") as f:
    json.dump(keluar, f, ensure_ascii=False, separators=(",", ":"))
print("data/nyata.json ditulis")
