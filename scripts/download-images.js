/**
 * Downloads the real photos used across the site (gallery, achievements, about
 * section) and saves them locally in src/assets/, instead of hot-linking them
 * from Unsplash. Uses only Node's built-in https module — no extra deps.
 *
 * Run once after cloning the project (needs internet access):
 *   node scripts/download-images.js
 *   # or: npm run images:download
 */
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', 'src', 'assets');

// Same photos the project already used, just fetched once and stored locally.
const IMAGES = [
  { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80', out: 'gallery/gallery-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80', out: 'gallery/gallery-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80', out: 'gallery/gallery-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=80', out: 'gallery/gallery-4.jpg' },
  { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80', out: 'gallery/gallery-5.jpg' },
  { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&q=80', out: 'gallery/gallery-6.jpg' },
  { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80', out: 'gallery/gallery-7.jpg' },
  { url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=900&q=80', out: 'gallery/gallery-8.jpg' },
  { url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1400&q=80', out: 'achievements/languages.jpg' },
  { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1400&q=80', out: 'achievements/programming.jpg' },
];

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error(`Too many redirects for ${url}`));
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(download(res.headers.location, dest, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Downloading ${IMAGES.length} images into src/assets/ ...`);
  for (const { url, out } of IMAGES) {
    const dest = path.join(ROOT, out);
    process.stdout.write(`  - ${out} ... `);
    try {
      await download(url, dest);
      console.log('done');
    } catch (err) {
      console.log(`FAILED (${err.message})`);
    }
  }
  console.log('Done. You can now run `npm run dev` — images are served locally.');
}

main();
