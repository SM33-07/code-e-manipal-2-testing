const { Jimp } = require('jimp');
const path = require('path');

async function analyze() {
  const imagePath = path.join(__dirname, '..', 'public', 'logo-2.0.png');
  const image = await Jimp.read(imagePath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  console.log(`Image dimensions: ${width}x${height}`);

  const rowCounts = [];
  for (let y = 0; y < height; y++) {
    let count = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = image.bitmap.data[idx + 3];
      if (alpha > 50) { // If pixel is somewhat visible
        count++;
      }
    }
    rowCounts.push(count);
  }

  // Print row counts in groups of 10 to see layout
  for (let i = 0; i < height; i += 10) {
    const slice = rowCounts.slice(i, i + 10);
    const avg = Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
    const bar = '*'.repeat(Math.min(50, Math.round(avg / 10)));
    console.log(`Rows ${String(i).padStart(3)} - ${String(Math.min(height - 1, i + 9)).padStart(3)}: [avg ${String(avg).padStart(3)} colored px] ${bar}`);
  }
}

analyze().catch(console.error);
