import path from 'path';
import sharp from 'sharp';

const dir = path.resolve('study_tiles');

async function findShorelineInTile(filename, label) {
  const filePath = path.join(dir, filename);
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // In each column x (from 0 to 255), let's find the y where sand ends and water/surf begins
  // Sand typically has higher Red (R > 110, G > 110, B < 110)
  // Water has higher Blue/Green relative to Red (B > R or G > R + 10)
  // Surf/foam has high brightness (R > 180, G > 180, B > 180)
  const shorelinePoints = [];

  for (let x = 0; x < width; x += 16) {
    let shorelineY = -1;
    for (let y = height - 1; y >= 0; y--) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Detect transition from water/surf to sand
      // Water: b >= r and b > 90
      // Sand: r > 120 and r >= b
      if (r > 125 && g > 125 && r >= b - 5) {
        shorelineY = y;
        break;
      }
    }
    shorelinePoints.push({ x, y: shorelineY });
  }

  console.log(`\nShoreline curve in ${label}:`);
  console.log(shorelinePoints.map(p => `(${p.x}, ${p.y})`).join(' -> '));
  return shorelinePoints;
}

async function run() {
  await findShorelineInTile('sat_16_52119_34043_pesisir_barat.jpg', 'Tile 52119 (Barat)');
  await findShorelineInTile('sat_16_52120_34043_pesisir_tengah_surfing.jpg', 'Tile 52120 (Tengah)');
  await findShorelineInTile('sat_16_52121_34043_pesisir_timur_karang.jpg', 'Tile 52121 (Timur)');
}

run();
