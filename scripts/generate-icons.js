import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const faviconPath = path.join(publicDir, 'favicon.svg');
const svgContent = fs.readFileSync(faviconPath, 'utf8');

// Extract all <path ...> elements from favicon.svg
const pathMatches = svgContent.match(/<path[\s\S]*?\/>/g) || [];
const paths = pathMatches.join('\n');

// Create 512x512 SVG with vibrant #F6821F brand orange background & centered logo
const pwaSvgSquare = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <style type="text/css">
      .fil0 {fill:#FFFFFF;}
    </style>
  </defs>
  <!-- Brand Orange Background -->
  <rect width="512" height="512" fill="#F6821F"/>
  <!-- Centered White Bakid Multimedia Logo -->
  <g transform="translate(64, 64) scale(0.46316)">
    ${paths}
  </g>
</svg>`;

// Create rounded version for apple-touch-icon
const pwaSvgRounded = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <style type="text/css">
      .fil0 {fill:#FFFFFF;}
    </style>
  </defs>
  <rect width="512" height="512" rx="100" fill="#F6821F"/>
  <g transform="translate(64, 64) scale(0.46316)">
    ${paths}
  </g>
</svg>`;

async function generate() {
  const svgBuffer = Buffer.from(pwaSvgSquare);
  const roundedSvgBuffer = Buffer.from(pwaSvgRounded);

  // Write SVGs with background
  fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), pwaSvgSquare);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), pwaSvgSquare);

  // Generate 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512x512.png'));
  console.log('Created icon-512x512.png');

  // Generate 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192x192.png'));
  console.log('Created icon-192x192.png');

  // Generate 180x180 Apple Touch Icon PNG
  await sharp(roundedSvgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');
}

generate().catch(console.error);
