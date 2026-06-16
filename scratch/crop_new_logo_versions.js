const { Jimp } = require('jimp');
const path = require('path');

async function cropNavbarLogo() {
  const fullPath = path.join(__dirname, '..', 'public', 'logo-2.0-full.png');
  const navDest = path.join(__dirname, '..', 'public', 'logo-2.0-navbar.png');

  console.log('Reading full logo from:', fullPath);
  const image = await Jimp.read(fullPath);

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Clone and crop to row 193
  const navImage = image.clone();
  navImage.crop({ x: 0, y: 0, w: width, h: 193 });

  // Tight crop the navbar version horizontally/vertically
  let minX = width, minY = 193, maxX = 0, maxY = 0;
  for (let y = 0; y < 193; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (navImage.bitmap.data[idx + 3] > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX >= minX && maxY >= minY) {
    const pad = 10;
    const cx = Math.max(0, minX - pad);
    const cy = Math.max(0, minY - pad);
    const cw = Math.min(width - cx, (maxX - minX) + pad * 2);
    const ch = Math.min(193 - cy, (maxY - minY) + pad * 2);

    navImage.crop({ x: cx, y: cy, w: cw, h: ch });
    await navImage.write(navDest);
    console.log(`Saved new navbar logo: ${cw}x${ch} at ${navDest}`);
  }
}

cropNavbarLogo().catch(console.error);
