#!/usr/bin/env python3
"""
Bentuk "pulau" peta besar Sawarna: daratan pesisir sejauh ±1,3 km dari garis pantai ditambah pita laut
±170 m, dari Karang Taraje (barat) sampai Legon Pari (timur). Dihitung di kisi raster lalu ditelusuri
menjadi poligon halus (aman untuk teluk sempit & tanjung).

  python tools/pulau-sawarna.py      (setelah tools/siapkan-sawarna.py)

Menambahkan kolom "pulau" (daftar [lat, lng]) ke data/sawarna.json.
"""
import json, math, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(AKAR, "data", "sawarna.json")
D = json.load(open(FILE, encoding="utf-8"))
B = D["batas"]; U = 200000; KY = U * 180 / math.pi
merc = lambda l: math.log(math.tan(math.pi / 4 + math.radians(l) / 2))
P = lambda la, ln: ((ln - B["barat"]) * U, (merc(B["utara"]) - merc(la)) * KY)
inv = lambda x, y: ((2 * math.atan(math.exp(merc(B["utara"]) - y / KY)) - math.pi / 2) * 180 / math.pi, x / U + B["barat"])
W, H = (B["timur"] - B["barat"]) * U, (merc(B["utara"]) - merc(B["selatan"])) * KY

BUJUR = (106.2735, 106.3285)   # rentang pulau: sedikit di luar Karang Bokor & Legon Pari
DARAT, LAUT = 2100, 300        # unit (1 unit ≈ 0,55 m)

# garis pantai OSM (barat → timur, darat di utara): ruas yang bersambung
ruas = [r for r in D["pantai"] if r[0] != r[-1]]
pantai = ruas[0]
for r in ruas[1:]:
    pantai = pantai + r[1:] if math.dist(pantai[-1], r[0]) < 1e-5 else pantai
pu = [P(*p) for p in pantai]
daratan = pu + [(pu[-1][0], -2000), (pu[0][0], -2000)]
bagian = [P(*p) for p in pantai if BUJUR[0] <= p[1] <= BUJUR[1]]

K = 8  # unit per piksel
x0, y0 = -1500, -1500
Wr, Hr = int((W + 3000) / K), int((H + 3000) / K)
ke = lambda p: ((p[0] - x0) / K, (p[1] - y0) / K)
def garis_tebal(titik, r):
    im = Image.new("L", (Wr, Hr), 0); d = ImageDraw.Draw(im)
    d.line([ke(p) for p in titik], fill=255, width=int(2 * r / K), joint="curve")
    for p in (titik[0], titik[-1]): x, y = ke(p); rr = r / K; d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=255)
    return im
darat = Image.new("L", (Wr, Hr), 0); ImageDraw.Draw(darat).polygon([ke(p) for p in daratan], fill=255)
pita_darat = garis_tebal(bagian, DARAT)
pita_laut = garis_tebal(bagian, LAUT)
pulau = ImageChops.lighter(ImageChops.darker(darat, pita_darat), ImageChops.darker(ImageChops.invert(darat), pita_laut))
# haluskan: tutup lekuk sempit, buang tonjolan kecil
pulau = pulau.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.MinFilter(25)).filter(ImageFilter.MedianFilter(9))

# telusur kontur luar (Moore) + sederhanakan (RDP)
px = pulau.load()
isi = lambda x, y: 0 <= x < Wr and 0 <= y < Hr and px[x, y] > 127
mulai = next((x, y) for y in range(Hr) for x in range(Wr) if isi(x, y))
ARAH = [(-1, 0), (-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1)]
kontur = [mulai]; c = mulai; bl = (mulai[0] - 1, mulai[1])
for langkah in range(1000000):
    nb = [(c[0] + dx, c[1] + dy) for dx, dy in ARAH]; i = nb.index(bl)
    for k in range(1, 9):
        q = nb[(i + k) % 8]
        if isi(*q): bl = nb[(i + k - 1) % 8]; c = q; break
    if c == mulai and langkah > 2: break
    kontur.append(c)
def rdp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]; dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        dd = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L
        if dd > dmax: dmax, idx = dd, i
    return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps) if dmax > eps else [pts[0], pts[-1]]
jauh = max(range(len(kontur)), key=lambda i: math.hypot(kontur[i][0] - kontur[0][0], kontur[i][1] - kontur[0][1]))
sed = rdp(kontur[:jauh + 1], 1.0)[:-1] + rdp(kontur[jauh:] + [kontur[0]], 1.0)[:-1]
D["pulau"] = [[round(a, 6), round(b, 6)] for a, b in (inv(x * K + x0, y * K + y0) for x, y in sed)]
json.dump(D, open(FILE, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(f"pulau: {len(D['pulau'])} titik -> data/sawarna.json")
if "--debug" in os.sys.argv: pulau.save(os.sys.argv[os.sys.argv.index("--debug") + 1])
