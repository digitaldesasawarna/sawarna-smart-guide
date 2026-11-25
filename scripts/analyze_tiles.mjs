import fs from 'fs';
import path from 'path';

function latLngToTile(lat, lng, zoom) {
  const n = Math.pow(2, zoom);
  const rad = lat * Math.PI / 180;
  const x = Math.floor((lng + 180) / 360 * n);
  const y = Math.floor((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * n);
  return { x, y, z: zoom };
}

function tileToLatLngBounds(x, y, zoom) {
  const n = Math.pow(2, zoom);
  const toLat = (yTile) => {
    const sinh = Math.sinh(Math.PI * (1 - 2 * yTile / n));
    return Math.atan(sinh) * 180 / Math.PI;
  };
  const toLng = (xTile) => (xTile / n) * 360 - 180;

  const north = toLat(y);
  const south = toLat(y + 1);
  const west = toLng(x);
  const east = toLng(x + 1);
  return { north, south, west, east };
}

// Kawasan Pantai Ciantir
const bounds = {
  north: -6.9790,
  south: -6.9930,
  west: 106.3000,
  east: 106.3140
};

console.log('=== ANALISIS GRID TILES PANTAI CIANTIR ===\n');

for (const z of [16, 17]) {
  const nw = latLngToTile(bounds.north, bounds.west, z);
  const se = latLngToTile(bounds.south, bounds.east, z);
  console.log(`Zoom ${z}:`);
  console.log(`X: ${nw.x} s/d ${se.x} (Total ${se.x - nw.x + 1} kolom)`);
  console.log(`Y: ${nw.y} s/d ${se.y} (Total ${se.y - nw.y + 1} baris)`);
  console.log(`Total tiles di area ini: ${(se.x - nw.x + 1) * (se.y - nw.y + 1)} tiles`);

  for (let y = nw.y; y <= se.y; y++) {
    for (let x = nw.x; x <= se.x; x++) {
      const b = tileToLatLngBounds(x, y, z);
      console.log(`  z=${z}, x=${x}, y=${y} -> Lat: [${b.south.toFixed(5)}, ${b.north.toFixed(5)}], Lng: [${b.west.toFixed(5)}, ${b.east.toFixed(5)}]`);
    }
  }
  console.log('');
}
