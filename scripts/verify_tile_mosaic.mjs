import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function checkMosaic() {
  const composites = [
    // Pesisir row (y=34043)
    { input: 'assets/maps/tiles/16/52119/34043.png', left: 0, top: 0 },
    { input: 'assets/maps/tiles/16/52120/34043.png', left: 256, top: 0 },
    { input: 'assets/maps/tiles/16/52121/34043.png', left: 512, top: 0 },
    // Laut row (y=34044)
    { input: 'assets/maps/tiles/16/52119/34044.png', left: 0, top: 256 },
    { input: 'assets/maps/tiles/16/52120/34044.png', left: 256, top: 256 },
    { input: 'assets/maps/tiles/16/52121/34044.png', left: 512, top: 256 }
  ];

  const img = sharp({
    create: {
      width: 768,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite(composites);

  await img.png().toFile('study_tiles/illustrated_mosaic_768x512.png');
  console.log('Created study_tiles/illustrated_mosaic_768x512.png');

  // Also overlay on top of the satellite imagery to verify alignment!
  const satBackground = await sharp('study_tiles/sat_mosaic_768x768.jpg')
    .extract({ left: 0, top: 256, width: 768, height: 512 })
    .toBuffer();

  const comparison = sharp(satBackground)
    .composite([
      { input: 'study_tiles/illustrated_mosaic_768x512.png', blend: 'over', opacity: 0.85 }
    ]);

  await comparison.jpeg({ quality: 95 }).toFile('study_tiles/alignment_overlay_test.jpg');
  console.log('Created study_tiles/alignment_overlay_test.jpg for visual verification!');
}

checkMosaic();
