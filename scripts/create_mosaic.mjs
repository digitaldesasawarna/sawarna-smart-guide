import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = path.resolve('study_tiles');

async function buildMosaic() {
  const cols = [52119, 52120, 52121];
  const rows = [34042, 34043, 34044]; // Daratan, Pesisir, Laut

  const composites = [];

  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols.length; c++) {
      const x = cols[c];
      const y = rows[r];
      const filename = `sat_16_${x}_${y}_*.jpg`;
      const match = fs.readdirSync(dir).find(f => f.startsWith(`sat_16_${x}_${y}_`));
      if (match) {
        composites.push({
          input: path.join(dir, match),
          left: c * 256,
          top: r * 256
        });
      }
    }
  }

  // Create 768 x 768 composite image
  const mosaic = sharp({
    create: {
      width: 768,
      height: 768,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  }).composite(composites);

  await mosaic.jpeg({ quality: 95 }).toFile(path.join(dir, 'sat_mosaic_768x768.jpg'));
  console.log('Created sat_mosaic_768x768.jpg');

  // Also create with hybrid overlay
  const hybComposites = [];
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols.length; c++) {
      const x = cols[c];
      const y = rows[r];
      const match = fs.readdirSync(dir).find(f => f.startsWith(`hyb_16_${x}_${y}_`));
      if (match) {
        hybComposites.push({
          input: path.join(dir, match),
          left: c * 256,
          top: r * 256
        });
      }
    }
  }

  const hybMosaic = sharp({
    create: {
      width: 768,
      height: 768,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  }).composite(hybComposites);

  await hybMosaic.jpeg({ quality: 95 }).toFile(path.join(dir, 'hyb_mosaic_768x768.jpg'));
  console.log('Created hyb_mosaic_768x768.jpg');
}

buildMosaic();
