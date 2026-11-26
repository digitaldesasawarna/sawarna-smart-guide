#!/usr/bin/env python3
"""
Membuat FOTO CONTOH (docs/DESIGN.md §7) untuk tiap titik di js/data.js: potongan ilustrasi peta
16:9 di sekitar lokasi tempat, dari tile arah 0° (objek tegak). Ganti dengan foto asli hasil survei.

  python tools/foto-contoh.py

Hasil: assets/foto/{id}.webp (640×360). Titik yang sudah punya kolom "foto" dilewati.
Butuh: Python 3 + Pillow, dan tile hasil tools/render-tiles.mjs.
"""
import math, os, re
from PIL import Image

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = open(os.path.join(AKAR, "js", "data.js"), encoding="utf-8").read()
titik = re.findall(r'\{\s*id:\s*"([^"]+)",\s*kategori:[^}]*?lat:\s*(-?[\d.]+),\s*lng:\s*(-?[\d.]+)', data)
KELUAR = os.path.join(AKAR, "assets", "foto")
os.makedirs(KELUAR, exist_ok=True)
LW, LH = 640, 360

def px(lat, lng, z):
    n = 256 * 2 ** z
    x = (lng + 180) / 360 * n
    y = (1 - math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) / math.pi) / 2 * n
    return x, y

def tile(z, x, y):
    f = os.path.join(AKAR, "assets", "tiles", "0", str(z), str(x), f"{y}.webp")
    return Image.open(f).convert("RGB") if os.path.exists(f) else None

for id_, lat, lng in titik:
    lat, lng = float(lat), float(lng)
    for z, skala in ((19, 1), (18, 2)):  # z19 bila ada; selain itu z18 diperbesar
        cx, cy = px(lat, lng, z)
        w, h = LW / skala, LH / skala
        x0, y0 = cx - w / 2, cy - h * 0.62  # tempat sedikit di bawah tengah (objek berdiri ke atas)
        tx0, ty0, tx1, ty1 = int(x0 // 256), int(y0 // 256), int((x0 + w) // 256), int((y0 + h) // 256)
        kanvas = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256), (76, 147, 205))
        ada = False
        for tx in range(tx0, tx1 + 1):
            for ty in range(ty0, ty1 + 1):
                t = tile(z, tx, ty)
                if t: kanvas.paste(t, ((tx - tx0) * 256, (ty - ty0) * 256)); ada = True
        if ada: break
    if not ada:
        print("  lewati (tile tidak ada):", id_); continue
    ox, oy = x0 - tx0 * 256, y0 - ty0 * 256
    foto = kanvas.crop((round(ox), round(oy), round(ox + w), round(oy + h)))
    if skala != 1: foto = foto.resize((LW, LH), Image.LANCZOS)
    foto.save(os.path.join(KELUAR, f"{id_}.webp"), "WEBP", quality=78, method=6)
    print("  foto", id_)
print(f"{len(titik)} titik -> assets/foto/")
