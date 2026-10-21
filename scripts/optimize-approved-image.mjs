import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function args() {
  const values = new Map();
  for (let index = 2; index < process.argv.length; index += 2) {
    const key = process.argv[index];
    const value = process.argv[index + 1];
    if (!key?.startsWith('--') || !value || values.has(key)) throw new Error('Arguments must be unique --name value pairs.');
    values.set(key.slice(2), value);
  }
  return values;
}

const input = args();
const imageId = input.get('id');
const slug = input.get('slug');
const name = input.get('name');
const placeId = input.get('place-id');
const categoryId = input.get('category-id');
const sourceUrlText = input.get('source-url');
const credit = input.get('credit');
const alt = input.get('alt');
const rightsStatus = input.get('rights');
if (![imageId, slug, name, placeId, categoryId, sourceUrlText, credit, alt].every(Boolean)
  || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)
  || !['licensed', 'owner_granted', 'self_owned'].includes(rightsStatus)) {
  throw new Error('Provide --id --slug --name --place-id --category-id --source-url --credit --alt --rights.');
}
const sourceUrl = new URL(sourceUrlText);
if (sourceUrl.protocol !== 'https:') throw new Error('The credited source URL must use HTTPS.');
const manifestPath = path.join(ROOT, 'data/images.json');
const placesPath = path.join(ROOT, 'data/places.json');
const images = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const places = JSON.parse(await fs.readFile(placesPath, 'utf8'));
const place = places.find((item) => item.id === placeId && item.slug === slug);
if (!place || !place.imageIds.includes(imageId)) throw new Error('Add the new image ID to the matching place.imageIds before optimizing.');
if (![place.primaryCategory, ...place.secondaryCategories].includes(categoryId)) throw new Error('Image category must match the place.');
if (images.some((item) => item.id === imageId)) throw new Error(`Image ID ${imageId} already exists.`);
const sourceDirectory = path.resolve(ROOT, 'research-assets/approved-originals', slug);
const original = (await fs.readdir(sourceDirectory)).find((file) => file.startsWith(`${name}.source.`) && /\.(?:jpg|png|webp)$/.test(file));
if (!original) throw new Error('No approved original found. Run download-approved-image.mjs first.');
const originalPath = path.resolve(sourceDirectory, original);
if (!originalPath.startsWith(sourceDirectory + path.sep)) throw new Error('Unsafe source path.');
let sharp;
try { sharp = (await import('sharp')).default; }
catch { throw new Error('Install sharp as a local development dependency to create WebP: npm install --save-dev sharp'); }
const publicDirectory = path.resolve(ROOT, 'public/images/places', slug);
if (!publicDirectory.startsWith(path.resolve(ROOT, 'public/images/places') + path.sep)) throw new Error('Unsafe public path.');
await fs.mkdir(publicDirectory, { recursive: true });
const publishedPath = path.join(publicDirectory, `${name}.webp`);
const temporaryPath = `${publishedPath}.tmp`;
if (await fs.access(publishedPath).then(() => true).catch(() => false)) throw new Error('The public WebP already exists; do not overwrite without reviewing the current manifest.');
await sharp(originalPath).rotate().resize({ width: 1600, height: 1200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(temporaryPath);
await fs.rename(temporaryPath, publishedPath);
images.push({
  id: imageId, placeId, categoryId,
  researchPath: path.relative(ROOT, originalPath).replaceAll(path.sep, '/'),
  publishedPath: `/images/places/${slug}/${name}.webp`, sourceUrl: sourceUrl.href,
  credit, rightsStatus, publishAllowed: true, alt,
});
await fs.writeFile(manifestPath, `${JSON.stringify(images, null, 2)}\n`, 'utf8');
console.log(`Created ${path.relative(ROOT, publishedPath)} and updated data/images.json. Check the place page and credit before redeploying.`);
