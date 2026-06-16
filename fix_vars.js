const fs = require('fs');
const glob = require('glob');
const files = glob.sync('{app,components}/**/*.{ts,tsx}');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let newContent = content.replace(/var\(--\[(#[A-Fa-f0-9]+)\]\)/g, '$1');
  if (content !== newContent) {
    fs.writeFileSync(f, newContent);
    console.log('Fixed', f);
  }
});
