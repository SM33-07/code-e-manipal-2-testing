const { Jimp } = require('jimp');
const path = require('path');

async function processLogo() {
  const imagePath = path.join(__dirname, '..', 'public', 'logo-2.0.png');
  console.log('Reading image from:', imagePath);
  const image = await Jimp.read(imagePath);

  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Let's sample the top-left corner color to see what the background color is
  const cornerIdx = 0;
  const cr = image.bitmap.data[0];
  const cg = image.bitmap.data[1];
  const cb = image.bitmap.data[2];
  const ca = image.bitmap.data[3];
  console.log(`Corner color: R=${cr}, G=${cg}, B=${cb}, A=${ca}`);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  // 1. Find bounding box of non-background pixels and set background to transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      const a = image.bitmap.data[idx + 3];

      // If it is very close to the corner color, or if it is very close to white/light grey
      const isBg = (Math.abs(r - cr) < 15 && Math.abs(g - cg) < 15 && Math.abs(b - cb) < 15) || (r > 240 && g > 240 && b > 240);

      if (isBg) {
        image.bitmap.data[idx + 3] = 0; // Make transparent
      } else {
        // Part of the logo
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Bounding box: minX=${minX}, minY=${minY}, maxX=${maxX}, maxY=${maxY}`);

  if (maxX >= minX && maxY >= minY) {
    const padding = 15;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropW = Math.min(width - cropX, (maxX - minX) + padding * 2);
    const cropH = Math.min(height - cropY, (maxY - minY) + padding * 2);

    image.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
    await image.write(imagePath);
    console.log('Logo cropped and background made transparent successfully!');
  } else {
    console.log('No logo pixels detected.');
  }
}

processLogo().catch(console.error);
