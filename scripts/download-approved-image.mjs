import { lookup } from 'node:dns/promises';
import fs from 'node:fs/promises';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_BYTES = 8 * 1024 * 1024;
const TIMEOUT_MS = 10_000;

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

function isPublicIpv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b, c] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || (b === 0 && c <= 2) || (b === 88 && c === 99)))
    || (a === 198 && (b === 18 || b === 19 || b === 51)) || (a === 203 && b === 0 && c === 113)) return false;
  return true;
}

function assertImage(bytes, mime) {
  if (mime === 'image/jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return '.jpg';
  if (mime === 'image/png' && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return '.png';
  if (mime === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return '.webp';
  throw new Error('Response MIME and image signature do not match a supported JPEG, PNG or WebP file.');
}

function requestPinned(url, address) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, {
      method: 'GET',
      headers: { accept: 'image/jpeg,image/png,image/webp', 'user-agent': 'BinhMyDuKy-ApprovedAssetImporter/1.0' },
      servername: url.hostname,
      timeout: TIMEOUT_MS,
      lookup(hostname, options, callback) {
        if (hostname !== url.hostname) return callback(new Error('Unexpected DNS lookup host.'));
        if (options?.all) return callback(null, [{ address, family: 4 }]);
        callback(null, address, 4);
      },
    }, (response) => {
      if ((response.statusCode ?? 500) >= 300 && (response.statusCode ?? 500) < 400) {
        response.resume();
        reject(new Error('Redirects are disabled. Add the final HTTPS source URL to the allowlist.'));
        return;
      }
      if (response.statusCode !== 200) { response.resume(); reject(new Error(`Image source returned HTTP ${response.statusCode}.`)); return; }
      const length = Number(response.headers['content-length'] ?? 0);
      if (length > MAX_BYTES) { response.destroy(); reject(new Error('Image exceeds the 8 MB limit.')); return; }
      const mime = String(response.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) { response.destroy(); reject(new Error(`Unsupported MIME type: ${mime || 'missing'}.`)); return; }
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > MAX_BYTES) { response.destroy(new Error('Image exceeds the 8 MB limit.')); return; }
        chunks.push(chunk);
      });
      response.on('end', () => {
        try { resolve({ bytes: Buffer.concat(chunks), mime }); }
        catch (error) { reject(error); }
      });
      response.on('error', reject);
    });
    request.on('timeout', () => request.destroy(new Error('Image download timed out after 10 seconds.')));
    request.on('error', reject);
    request.end();
  });
}

const input = args();
const sourceText = input.get('url');
const name = input.get('name');
const slug = input.get('slug');
if (!sourceText || !name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
  throw new Error('Usage: node scripts/download-approved-image.mjs --url https://... --slug place-slug --name source-name');
}

const sourceUrl = new URL(sourceText);
if (sourceUrl.protocol !== 'https:' || sourceUrl.username || sourceUrl.password || (sourceUrl.port && sourceUrl.port !== '443')) throw new Error('Only direct HTTPS URLs without credentials or custom ports are allowed.');
const allowlist = JSON.parse(await fs.readFile(path.join(ROOT, 'data/image-download-allowlist.json'), 'utf8'));
if (!Array.isArray(allowlist.approvedHosts) || !allowlist.approvedHosts.includes(sourceUrl.hostname.toLowerCase())) throw new Error(`Host ${sourceUrl.hostname} is not in data/image-download-allowlist.json.`);
const addresses = await lookup(sourceUrl.hostname, { all: true, verbatim: true });
if (!addresses.length || addresses.some((entry) => entry.family !== 4 || !isPublicIpv4(entry.address))) throw new Error('The source hostname must resolve only to public IPv4 addresses.');
const response = await requestPinned(sourceUrl, addresses[0].address);
const extension = assertImage(response.bytes, response.mime);
const directory = path.resolve(ROOT, 'research-assets/approved-originals', slug);
if (!directory.startsWith(path.resolve(ROOT, 'research-assets/approved-originals') + path.sep)) throw new Error('Unsafe output directory.');
await fs.mkdir(directory, { recursive: true });
const output = path.join(directory, `${name}.source${extension}`);
await fs.writeFile(output, response.bytes, { flag: 'wx' });
console.log(`Saved ${path.relative(ROOT, output)} (${response.bytes.length} bytes). Verify permission and credit before publication.`);
