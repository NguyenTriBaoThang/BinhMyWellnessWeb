const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const images = JSON.parse(fs.readFileSync(path.join(root, 'data/images.json'), 'utf8'));

function checkPath(relativePath, allowedPrefix, label) {
  if (!relativePath.startsWith(allowedPrefix) || relativePath.includes('..') || relativePath.includes('\\')) {
    throw new Error(`${label} contains an unsafe path: ${relativePath}`);
  }
  const absolute = path.resolve(root, relativePath);
  if (!absolute.startsWith(`${root}${path.sep}`) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    throw new Error(`${label} does not exist: ${relativePath}`);
  }
}

for (const image of images) {
  if (image.researchPath) checkPath(image.researchPath, 'research-assets/', `Image ${image.id} research asset`);
  if (image.publishAllowed) checkPath(`public${image.publishedPath}`, 'public/images/places/', `Image ${image.id} public asset`);
  else if (image.publishedPath) throw new Error(`Image ${image.id} has a public path without publication rights.`);
}

console.log(`Checked ${images.length} image manifest entries; no unlicensed image is published.`);
