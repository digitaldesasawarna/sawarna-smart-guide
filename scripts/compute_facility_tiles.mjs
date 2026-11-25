function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const rad = lat * Math.PI / 180;
  const x = Math.floor((lng + 180) / 360 * n);
  const y = Math.floor((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * n);
  const px = ((lng + 180) / 360 * n - x) * 256;
  const py = ((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * n - y) * 256;
  return { z: zoom, x, y, px: Math.round(px), py: Math.round(py) };
}

const pts = [
  { name: 'Jembatan Gantung', lat: -6.981878, lng: 106.3038 },
  { name: 'Homestay Pesisir', lat: -6.986467, lng: 106.30625 },
  { name: 'Sentra Kuliner', lat: -6.987556, lng: 106.3066 },
  { name: 'Pantai Ciantir Utama', lat: -6.989267, lng: 106.307 },
  { name: 'Pos Balawista', lat: -6.989189, lng: 106.30725 },
  { name: 'Spot Surfing (Ombak)', lat: -6.990822, lng: 106.3086 },
  { name: 'Garis Pantai Barat', lat: -6.9880, lng: 106.3015 },
  { name: 'Garis Pantai Timur', lat: -6.9915, lng: 106.3120 },
  { name: 'Laut Lepas Ciantir', lat: -6.9940, lng: 106.307 }
];

console.log('=== EXACT TILE & PIXEL POSITION FOR BEACH & OCEAN (ZOOM 16) ===');
pts.forEach(p => {
  const t = latLngToTile(p.lat, p.lng, 16);
  console.log(`${p.name.padEnd(25)} -> Tile: z=16, x=${t.x}, y=${t.y} | Pixel: [px=${t.px}, py=${t.py}]`);
});

console.log('\n=== EXACT TILE & PIXEL POSITION FOR BEACH & OCEAN (ZOOM 17) ===');
pts.forEach(p => {
  const t = latLngToTile(p.lat, p.lng, 17);
  console.log(`${p.name.padEnd(25)} -> Tile: z=17, x=${t.x}, y=${t.y} | Pixel: [px=${t.px}, py=${t.py}]`);
});
