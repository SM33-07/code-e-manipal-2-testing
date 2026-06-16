const { Jimp } = require('jimp');
const path = require('path');

async function main() {
  const srcPath = path.join(__dirname, '..', 'public', 'logo-2.0.png');
  const fullDest = path.join(__dirname, '..', 'public', 'logo-2.0-full.png');
  const navDest = path.join(__dirname, '..', 'public', 'logo-2.0-navbar.png');
  const tagDest = path.join(__dirname, '..', 'public', 'logo-2.0-tagline.png');

  // Let's load the clean logo first
  const image = await Jimp.read(srcPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  console.log(`Original Dimensions: ${width}x${height}`);

  // Create two clones for full and navbar versions
  const fullImage = image.clone();
  const navImage = image.clone();
  const tagImage = image.clone();

  // Crop the navbar version to row 198 (excluding the tagline below it)
  navImage.crop({ x: 0, y: 0, w: width, h: 198 });
  
  // Crop the tagline version to row 198 onwards
  tagImage.crop({ x: 0, y: 198, w: width, h: height - 198 });

  // Tight crop the navbar version
  let minX1 = width, minY1 = 198, maxX1 = 0, maxY1 = 0;
  for (let y = 0; y < 198; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (navImage.bitmap.data[idx + 3] > 50) {
        if (x < minX1) minX1 = x;
        if (x > maxX1) maxX1 = x;
        if (y < minY1) minY1 = y;
        if (y > maxY1) maxY1 = y;
      }
    }
  }
  if (maxX1 >= minX1 && maxY1 >= minY1) {
    const pad = 10;
    const cx = Math.max(0, minX1 - pad);
    const cy = Math.max(0, minY1 - pad);
    const cw = Math.min(width - cx, (maxX1 - minX1) + pad * 2);
    const ch = Math.min(198 - cy, (maxY1 - minY1) + pad * 2);
    navImage.crop({ x: cx, y: cy, w: cw, h: ch });
    await navImage.write(navDest);
    console.log(`Saved navbar version: ${cw}x${ch}`);
  }

  // Tight crop the tagline version
  let minX2 = width, minY2 = height - 198, maxX2 = 0, maxY2 = 0;
  for (let y = 0; y < height - 198; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (tagImage.bitmap.data[idx + 3] > 50) {
        if (x < minX2) minX2 = x;
        if (x > maxX2) maxX2 = x;
        if (y < minY2) minY2 = y;
        if (y > maxY2) maxY2 = y;
      }
    }
  }
  if (maxX2 >= minX2 && maxY2 >= minY2) {
    const pad = 10;
    const cx = Math.max(0, minX2 - pad);
    const cy = Math.max(0, minY2 - pad);
    const cw = Math.min(width - cx, (maxX2 - minX2) + pad * 2);
    const ch = Math.min((height - 198) - cy, (maxY2 - minY2) + pad * 2);
    tagImage.crop({ x: cx, y: cy, w: cw, h: ch });
    await tagImage.write(tagDest);
    console.log(`Saved tagline version: ${cw}x${ch}`);
  }

  // Save the full version (which is already cropped tightly in public/logo-2.0.png)
  await fullImage.write(fullDest);
  console.log(`Saved full version: ${width}x${height}`);
}

main().catch(console.error);
