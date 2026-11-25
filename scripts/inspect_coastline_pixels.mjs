import path from 'path';
import sharp from 'sharp';

const dir = path.resolve('study_tiles');

async function analyzeTile(filename, label) {
  const filePath = path.join(dir, filename);
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let oceanCount = 0;
  let sandCount = 0;
  let vegCount = 0;
  let waveCount = 0;

  // Let's sample rows from top (y=0) to bottom (y=255)
  // At each 16 pixels, let's detect average RGB
  const rowSamples = [];
  for (let y = 0; y < height; y += 16) {
    let rSum = 0, gSum = 0, bSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      rSum += data[idx];
      gSum += data[idx + 1];
      bSum += data[idx + 2];
    }
    const r = Math.round(rSum / width);
    const g = Math.round(gSum / width);
    const b = Math.round(bSum / width);
    
    // Classify
    let zone = 'Unknown';
    if (b > r + 15 && b > g) zone = 'Ocean (Deep Water)';
    else if (r > 130 && g > 115 && b > 80 && Math.abs(r - g) < 40) zone = 'Sand / Beach';
    else if (g > r && g > b) zone = 'Vegetation (Land/Trees)';
    else if (r > 180 && g > 180 && b > 180) zone = 'Surf / White Wave';
    else if (b > 70 && g > 70 && r < 70) zone = 'Shallow / Coastal Water';
    else zone = `Water/Mixed (R:${r} G:${g} B:${b})`;

    rowSamples.push({ y, r, g, b, zone });
  }

  console.log(`\n=== TILE: ${label} (${filename}) ===`);
  rowSamples.forEach(s => {
    console.log(`  y=${String(s.y).padStart(3, ' ')}: RGB(${String(s.r).padStart(3, ' ')}, ${String(s.g).padStart(3, ' ')}, ${String(s.b).padStart(3, ' ')}) -> ${s.zone}`);
  });
}

async function run() {
  await analyzeTile('sat_16_52119_34043_pesisir_barat.jpg', 'Pesisir Barat (x=52119, y=34043)');
  await analyzeTile('sat_16_52120_34043_pesisir_tengah_surfing.jpg', 'Pesisir Tengah Ciantir (x=52120, y=34043)');
  await analyzeTile('sat_16_52121_34043_pesisir_timur_karang.jpg', 'Pesisir Timur (x=52121, y=34043)');
  await analyzeTile('sat_16_52120_34044_laut_tengah.jpg', 'Laut Tengah Samudra (x=52120, y=34044)');
}

run();
