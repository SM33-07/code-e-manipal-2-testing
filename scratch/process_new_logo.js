const { Jimp } = require('jimp');
const path = require('path');

async function processNewLogo() {
  const srcPath = 'C:\\Users\\SOHAM\\.gemini\\antigravity-ide\\brain\\d228f365-504d-401b-adce-45064324d05f\\media__1781613211087.png';
  const fullDest = path.join(__dirname, '..', 'public', 'logo-2.0-full.png');
  const navDest = path.join(__dirname, '..', 'public', 'logo-2.0-navbar.png');

  console.log('Reading new logo from:', srcPath);
  const image = await Jimp.read(srcPath);

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Top-left pixel is background
  const cr = image.bitmap.data[0];
  const cg = image.bitmap.data[1];
  const cb = image.bitmap.data[2];
  const ca = image.bitmap.data[3];
  console.log(`Background sample: R=${cr}, G=${cg}, B=${cb}, A=${ca}`);

  // Create alpha channel mask to clear white background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];

      // If it is very close to white/off-white background
      const isBg = (Math.abs(r - cr) < 15 && Math.abs(g - cg) < 15 && Math.abs(b - cb) < 15) || (r > 240 && g > 240 && b > 240);
      if (isBg) {
        image.bitmap.data[idx + 3] = 0; // Set to transparent
      }
    }
  }

  // Create clone for navbar and full versions
  const fullImage = image.clone();
  
  // Find bounding box for full logo
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (image.bitmap.data[idx + 3] > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Full logo bounding box: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);

  if (maxX >= minX && maxY >= minY) {
    const pad = 10;
    const cx = Math.max(0, minX - pad);
    const cy = Math.max(0, minY - pad);
    const cw = Math.min(width - cx, (maxX - minX) + pad * 2);
    const ch = Math.min(height - cy, (maxY - minY) + pad * 2);

    fullImage.crop({ x: cx, y: cy, w: cw, h: ch });
    await fullImage.write(fullDest);
    console.log(`Saved new full logo: ${cw}x${ch} at ${fullDest}`);
  }

  // Analyze rows of the cropped full image to find where the tagline starts.
  // The tagline is "A Tradition of Excellence, A Future of Code." at the bottom.
  // Let's print row pixel counts to locate the gap.
  const croppedWidth = fullImage.bitmap.width;
  const croppedHeight = fullImage.bitmap.height;
  const rowCounts = [];
  for (let y = 0; y < croppedHeight; y++) {
    let count = 0;
    for (let x = 0; x < croppedWidth; x++) {
      const idx = (y * croppedWidth + x) * 4;
      if (fullImage.bitmap.data[idx + 3] > 30) count++;
    }
    rowCounts.push(count);
  }

  for (let i = 0; i < croppedHeight; i++) {
    console.log(`Row ${String(i).padStart(3)}: ${rowCounts[i]} px`);
  }
}

processNewLogo().catch(console.error);
