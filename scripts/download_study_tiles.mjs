import fs from 'fs';
import path from 'path';

const outDir = path.resolve('study_tiles');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const tilesToStudy = [
  // Coastline row (Pesisir & Garis Pantai & Ombak)
  { z: 16, x: 52119, y: 34043, desc: 'pesisir_barat' },
  { z: 16, x: 52120, y: 34043, desc: 'pesisir_tengah_surfing' },
  { z: 16, x: 52121, y: 34043, desc: 'pesisir_timur_karang' },
  // Ocean row (Laut Lepas Samudra Hindia)
  { z: 16, x: 52119, y: 34044, desc: 'laut_barat' },
  { z: 16, x: 52120, y: 34044, desc: 'laut_tengah' },
  { z: 16, x: 52121, y: 34044, desc: 'laut_timur' },
  // Also land/coast transition row just north (Daratan & Pohon Kelapa & Warung Pesisir)
  { z: 16, x: 52119, y: 34042, desc: 'daratan_barat' },
  { z: 16, x: 52120, y: 34042, desc: 'daratan_tengah' },
  { z: 16, x: 52121, y: 34042, desc: 'daratan_timur' }
];

async function downloadTiles() {
  console.log('Downloading Google Maps study tiles...');
  for (const t of tilesToStudy) {
    // 1. Satellite
    const satUrl = `https://mt1.google.com/vt/lyrs=s&x=${t.x}&y=${t.y}&z=${t.z}`;
    const satRes = await fetch(satUrl);
    const satBuf = Buffer.from(await satRes.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `sat_${t.z}_${t.x}_${t.y}_${t.desc}.jpg`), satBuf);

    // 2. Hybrid (clean without POI)
    const hybUrl = `https://mt1.google.com/vt/lyrs=y&apistyle=s.t:33|p.v:off&x=${t.x}&y=${t.y}&z=${t.z}`;
    const hybRes = await fetch(hybUrl);
    const hybBuf = Buffer.from(await hybRes.arrayBuffer());
    fs.writeFileSync(path.join(outDir, `hyb_${t.z}_${t.x}_${t.y}_${t.desc}.jpg`), hybBuf);

    console.log(`Downloaded z=${t.z}, x=${t.x}, y=${t.y} (${t.desc}) -> Sat: ${satBuf.length}b, Hyb: ${hybBuf.length}b`);
  }
  console.log('Done downloading tiles.');
}

downloadTiles();
