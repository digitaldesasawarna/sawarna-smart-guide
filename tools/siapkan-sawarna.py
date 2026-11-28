#!/usr/bin/env python3
"""
Data peta besar Sawarna (docs/DESIGN.md §4.14): garis pantai, sungai, jalan utama, dan sebaran bangunan
dari OpenStreetMap untuk wilayah pesisir Sawarna (Karang Taraje – Legon Pari).

  python tools/siapkan-sawarna.py

Menulis data/sawarna.json. Data © kontributor OpenStreetMap (ODbL).
"""
import json, math, os, time, urllib.parse, urllib.request

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# batas peta besar (lintang/bujur): mencakup Karang Taraje di barat sampai Legon Pari di timur
BATAS = {"utara": -6.948, "selatan": -7.006, "barat": 106.242, "timur": 106.342}
UA = {"User-Agent": "peta-wisata-desa/1.0"}

def ambil(data, coba=3):
    for i in range(coba):
        try:
            req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=data, headers=UA)
            with urllib.request.urlopen(req, timeout=120) as r: return r.read()
        except Exception:
            if i == coba - 1: raise
            time.sleep(3 + i * 5)

bb = f'{BATAS["selatan"]},{BATAS["barat"]},{BATAS["utara"]},{BATAS["timur"]}'
q = f"""[out:json][timeout:110];
(way["natural"="coastline"]({bb});
 way["waterway"~"^(river|stream)$"]({bb});
 way["highway"~"^(primary|secondary|tertiary|unclassified|residential)$"]({bb});
 way["building"]({bb}););
out body;>;out skel qt;"""
print("OSM: mengambil…")
osm = json.loads(ambil(urllib.parse.urlencode({"data": q}).encode()))
node = {e["id"]: (e["lat"], e["lon"]) for e in osm["elements"] if e["type"] == "node"}
r6 = lambda p: [round(p[0], 6), round(p[1], 6)]
pantai, air, jalan, bangunan = [], [], [], []
for e in osm["elements"]:
    if e["type"] != "way" or "tags" not in e: continue
    tg = e["tags"]; pts = [node[n] for n in e["nodes"] if n in node]
    if len(pts) < 2: continue
    if tg.get("natural") == "coastline":
        pantai.append([r6(p) for p in pts])
    elif "waterway" in tg:
        air.append({"kelas": tg["waterway"], "nama": tg.get("name", ""), "garis": [r6(p) for p in pts]})
    elif "highway" in tg:
        jalan.append({"kelas": tg["highway"], "garis": [r6(p) for p in pts]})
    elif "building" in tg and len(pts) >= 3:
        la = sum(p[0] for p in pts) / len(pts); ln = sum(p[1] for p in pts) / len(pts)
        k = 111320 * math.cos(math.radians(la)); P = [(p[1] * k, p[0] * 110540) for p in pts]
        luas = abs(sum(P[i][0] * P[i - 1][1] - P[i - 1][0] * P[i][1] for i in range(len(P)))) / 2
        bangunan.append([round(la, 6), round(ln, 6), round(luas)])
print(f"  {len(pantai)} ruas pantai, {len(air)} sungai, {len(jalan)} jalan, {len(bangunan)} bangunan")
with open(os.path.join(AKAR, "data", "sawarna.json"), "w", encoding="utf-8") as f:
    json.dump({"_catatan": "Dibuat oleh tools/siapkan-sawarna.py. © kontributor OpenStreetMap (ODbL). bangunan = [lat, lng, luas m²].",
               "diambil": time.strftime("%Y-%m-%d"), "batas": BATAS, "pantai": pantai, "air": air, "jalan": jalan, "bangunan": bangunan},
              f, ensure_ascii=False, separators=(",", ":"))
print("data/sawarna.json ditulis")
