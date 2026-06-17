const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const dir = path.join(__dirname, '../public/images/backgrounds');

async function optimize() {
  const files = fs.readdirSync(dir);
  console.log(`Found ${files.length} files in backgrounds directory.`);

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    // Optimize PNGs, JPEGs, and webps (since Jimp can read webp in 1.6+ sometimes, but let's stick to png/jpg)
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;

    const inputPath = path.join(dir, file);
    const basename = path.basename(file, ext);
    // Output as jpeg
    const outputPath = path.join(dir, `${basename}.jpg`);

    console.log(`Optimizing ${file}...`);
    try {
      const image = await Jimp.read(inputPath);
      
      // Resize to max 1920 width if it's wider
      if (image.width > 1920) {
        console.log(`Resizing ${file} from ${image.width}px to 1920px width...`);
        image.resize({ w: 1920 });
      }

      // Get JPEG buffer with quality 75 and save it
      const buffer = await image.getBuffer('image/jpeg', { quality: 75 });
      fs.writeFileSync(outputPath, buffer);
      
      const oldSize = fs.statSync(inputPath).size;
      const newSize = fs.statSync(outputPath).size;
      console.log(`Saved ${basename}.jpg: ${(oldSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB`);
      
      // If we converted a PNG, remove it to save space
      if (ext === '.png') {
        fs.unlinkSync(inputPath);
        console.log(`Removed original PNG: ${file}`);
      }
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err);
    }
  }
}

optimize();
