import fs from 'node:fs/promises';
import sharp from 'sharp';

// Keep every crawler and browser fallback on the same high-contrast design.
const source = await fs.readFile('assets/brand/artifacts-symbol.svg', 'utf8');
const badge = source.replace('  <g fill="#e9edf0">', '  <rect width="80" height="80" fill="#172934"/>\n  <g fill="#e9edf0" transform="translate(-1 2)">');
if (badge === source) throw new Error('The ARTIFACTS symbol source has changed');
await fs.writeFile('assets/favicon.svg', badge);
const sizes = [16, 24, 32, 48, 64, 96, 128, 180, 256];
const images = new Map(await Promise.all(sizes.map(async size => [
  size, await sharp(Buffer.from(badge), {density: 288}).resize(size, size).png().toBuffer(),
])));
for (const [size, path] of [
  [32, 'assets/brand/favicon-32.png'], [48, 'assets/brand/favicon-48.png'],
  [96, 'favicon.png'], [180, 'apple-touch-icon.png'],
]) await fs.writeFile(path, images.get(size));

const frames = sizes.filter(size => size !== 96 && size !== 180);
const directory = Buffer.alloc(6 + 16 * frames.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(frames.length, 4);
let offset = directory.length;
for (const [index, size] of frames.entries()) {
  const entry = 6 + index * 16;
  const png = images.get(size);
  directory[entry] = directory[entry + 1] = size % 256;
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += png.length;
}
await fs.writeFile('favicon.ico', Buffer.concat([directory, ...frames.map(size => images.get(size))]));
