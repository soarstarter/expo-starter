#!/usr/bin/env node
/* eslint-disable */
/**
 * Generate icon / adaptive-icon / splash / favicon variants from a single source PNG.
 *
 * Usage:
 *   node scripts/generate-assets.js [source.png]
 *
 * If no source is given, defaults to assets/source/icon.png (a 1024x1024 PNG you provide).
 *
 * Outputs:
 *   assets/images/icon.png            1024x1024
 *   assets/images/adaptive-icon.png   1024x1024 (foreground, transparent padding)
 *   assets/images/splash.png          2048x2048 centered on background color
 *   assets/images/favicon.png         48x48
 */

const path = require('path');
const fs = require('fs');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('sharp is required. Install it with: pnpm add -D sharp');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'images');
const DEFAULT_SOURCE = path.join(ROOT, 'assets', 'source', 'icon.png');
const SPLASH_BG = process.env.SPLASH_BACKGROUND || '#ffffff';

async function main() {
  const source = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;
  if (!fs.existsSync(source)) {
    console.error(`Source file not found: ${source}`);
    console.error('Provide a 1024x1024 PNG and re-run.');
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const tasks = [
    {
      name: 'icon.png',
      promise: sharp(source).resize(1024, 1024).png().toFile(path.join(OUT_DIR, 'icon.png')),
    },
    {
      name: 'adaptive-icon.png',
      promise: sharp(source)
        .resize(1024, 1024)
        .extend({
          top: 192,
          bottom: 192,
          left: 192,
          right: 192,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .resize(1024, 1024)
        .png()
        .toFile(path.join(OUT_DIR, 'adaptive-icon.png')),
    },
    {
      name: 'splash.png',
      promise: sharp({
        create: {
          width: 2048,
          height: 2048,
          channels: 4,
          background: SPLASH_BG,
        },
      })
        .composite([
          {
            input: await sharp(source).resize(768, 768).toBuffer(),
            gravity: 'center',
          },
        ])
        .png()
        .toFile(path.join(OUT_DIR, 'splash.png')),
    },
    {
      name: 'favicon.png',
      promise: sharp(source).resize(48, 48).png().toFile(path.join(OUT_DIR, 'favicon.png')),
    },
  ];

  for (const { name, promise } of tasks) {
    await promise;
    console.log(`  wrote assets/images/${name}`);
  }
  console.log('\nDone. Splash background:', SPLASH_BG);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
