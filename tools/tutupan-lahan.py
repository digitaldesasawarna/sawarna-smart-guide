#!/usr/bin/env python3
"""
Peta tutupan lahan dari citra satelit (docs/DESIGN.md §5.1): agar hutan, sawah, dan lahan terbuka
di ilustrasi berada di tempat yang sama dengan kenyataan, bukan poligon gambar tangan.

  python tools/tutupan-lahan.py [--debug FOLDER]

1. Mengambil citra Esri World Imagery zoom 17 di batasGambar (HANYA acuan; citra tidak disimpan di repo).
2. Mengelompokkan tiap sel ±4 m menjadi kelas tutupan lahan berdasarkan warna & tekstur.
3. Menulis data/tutupan.json: kisi kelas (dikodekan run-length per baris) di ruang unit generator.

Kelas: 0 tanah/rumput · 1 pepohonan · 2 sawah/ladang terbuka · 3 permukiman · 4 air
Nada sawah (untuk sel kelas 2, dari warna citra): 0 kering terang · 1 kering gelap · 2 tergenang · 3 hijau muda · 4 hijau
--debug FOLDER menyimpan citra & peta kelas berwarna ke FOLDER untuk dicek (jangan ke repo).
Butuh: Python 3 + Pillow.
"""
import colorsys, io, json, math, os, sys, time, urllib.request
from PIL import Image, ImageFilter, ImageStat

AKAR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEO = json.load(open(os.path.join(AKAR, "data", "geografi.json"), encoding="utf-8"))
B = GEO["batasGambar"]
UA = {"User-Agent": "sawarna-smart-guide/1.0 (peta wisata desa)"}
Z = 17
U = 200000                    # unit per derajat bujur (sama dengan tools/gen-ilustrasi.mjs)
KY = U * 180 / math.pi
SEL = 8                       # ukuran sel dalam unit (±4,4 m)
merc = lambda lat: math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))
W = (B["timur"] - B["barat"]) * U
H = (merc(B["utara"]) - merc(B["selatan"])) * KY
GW, GH = math.ceil(W / SEL), math.ceil(H / SEL)
debug = sys.argv[sys.argv.index("--debug") + 1] if "--debug" in sys.argv else None

def ambil(url, coba=3):
    for i in range(coba):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: return r.read()
        except Exception:
            if i == coba - 1: raise
            time.sleep(2 + i * 3)

# ---------------------------------------------------------------- 1. citra acuan
n2 = 256 * 2 ** Z
lon2x = lambda lng: (lng + 180) / 360 * n2
lat2y = lambda lat: (1 - merc(lat) / math.pi) / 2 * n2
tx0, tx1 = int(lon2x(B["barat"]) // 256), int(lon2x(B["timur"]) // 256)
ty0, ty1 = int(lat2y(B["utara"]) // 256), int(lat2y(B["selatan"]) // 256)
mosaik = Image.new("RGB", ((tx1 - tx0 + 1) * 256, (ty1 - ty0 + 1) * 256))
print(f"Citra acuan: {(tx1 - tx0 + 1) * (ty1 - ty0 + 1)} tile z{Z}…")
for tx in range(tx0, tx1 + 1):
    for ty in range(ty0, ty1 + 1):
        url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{Z}/{ty}/{tx}"
        mosaik.paste(Image.open(io.BytesIO(ambil(url))).convert("RGB"), ((tx - tx0) * 256, (ty - ty0) * 256))
        time.sleep(0.05)
# potong tepat ke batasGambar; x linear terhadap bujur, y linear terhadap Mercator → sama dengan unit generator
kotak = (lon2x(B["barat"]) - tx0 * 256, lat2y(B["utara"]) - ty0 * 256, lon2x(B["timur"]) - tx0 * 256, lat2y(B["selatan"]) - ty0 * 256)
citra = mosaik.crop(tuple(round(v) for v in kotak))
if debug: os.makedirs(debug, exist_ok=True); citra.save(os.path.join(debug, "citra.jpg"), quality=85)

# ---------------------------------------------------------------- 2. kelas per sel
K = 4  # piksel contoh per sisi sel
kecil = citra.resize((GW * K, GH * K), Image.LANCZOS)
halus = kecil.filter(ImageFilter.BoxBlur(1))
def kelas(r, g, b, kasar):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h *= 360
    if 165 <= h <= 215 and s > 0.18 and v < 0.62: return 4                 # air (laut/sungai kehijauan-biru)
    if (h < 40 or h > 330) and s > 0.32 and v > 0.30: return 3              # atap genteng/terakota
    if s < 0.12 and v > 0.62: return 3                                      # atap seng/beton, jalan
    if 55 <= h < 165 and v < 0.36 and (kasar > 9 or v < 0.26): return 1    # kanopi: hijau gelap & bertekstur
    if v < 0.24: return 1                                                   # bayangan kanopi
    if kasar < 11 and (s < 0.30 or 40 <= h < 75): return 2                  # bidang rata kusam = sawah/ladang
    return 0
def nada(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    h *= 360
    if 60 <= h < 170 and s > 0.22: return 3 if v > 0.5 else 4
    if v > 0.6: return 0
    if v > 0.44: return 1
    return 2
rle = lambda kode: ".".join((f"{kode[i]}{k - i}" if k - i > 1 else f"{kode[i]}") for i, k in _runs(kode))
def _runs(kode):
    i = 0
    while i < len(kode):
        k = i
        while k < len(kode) and kode[k] == kode[i]: k += 1
        yield i, k
        i = k
baris, barisNada = [], []
hitung = [0] * 5
px = halus.load()
for j in range(GH):
    kode, kodeNada = [], []
    for i in range(GW):
        kotak_sel = (i * K, j * K, i * K + K, j * K + K)
        st = ImageStat.Stat(kecil.crop(kotak_sel))
        r, g, b = st.mean
        kasar = sum(st.stddev) / 3
        c = kelas(r, g, b, kasar)
        hitung[c] += 1
        kode.append(c)
        kodeNada.append(nada(r, g, b))
    baris.append(rle(kode))
    barisNada.append(rle(kodeNada))
total = GW * GH
print("  kelas:", {n: f"{c * 100 / total:.0f}%" for n, c in zip(["tanah", "pohon", "sawah", "permukiman", "air"], hitung)})

if debug:
    WARNA = [(196, 214, 140), (46, 110, 60), (222, 205, 140), (200, 110, 80), (70, 140, 200)]
    peta = Image.new("RGB", (GW, GH))
    pp = peta.load()
    for j, rl in enumerate(baris):
        i = 0
        for seg in rl.split("."):
            c, n = int(seg[0]), int(seg[1:] or 1)
            for _ in range(n): pp[i, j] = WARNA[c]; i += 1
    peta.save(os.path.join(debug, "kelas.png"))

with open(os.path.join(AKAR, "data", "tutupan.json"), "w", encoding="utf-8") as f:
    json.dump({
        "_catatan": "Dibuat oleh tools/tutupan-lahan.py dari citra Esri World Imagery (acuan; citra tidak disimpan). "
                    "Kelas: 0 tanah/rumput, 1 pepohonan, 2 sawah/ladang, 3 permukiman, 4 air. Baris = run-length 'kelas[panjang]' dipisah titik.",
        "diambil": time.strftime("%Y-%m-%d"), "sel": SEL, "lebar": GW, "tinggi": GH, "baris": baris, "nada": barisNada,
    }, f, separators=(",", ":"))
print(f"data/tutupan.json ditulis ({GW}×{GH} sel)")
