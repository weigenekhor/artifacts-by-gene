import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const directory = process.argv[2] || "C:/Users/Gene/Desktop/Artifacts Images";
const catalogue = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const homepage = JSON.parse(await fs.readFile("content/homepage.json", "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const manifest = { sourceDirectory: directory, scannedAt: new Date().toISOString(), entries: [] };
for (const entry of [...catalogue.apps, homepage]) {
  const sourcePath = path.join(directory, entry.sourceFilename);
  const bytes = await fs.readFile(sourcePath);
  const stat = await fs.stat(sourcePath);
  const meta = await sharp(bytes).metadata();
  const dest = `assets/evidence/${entry.id}`;
  await fs.mkdir(dest, { recursive: true });
  await sharp(bytes).webp({ lossless: true, effort: 6 }).toFile(`${dest}/full.webp`);
  const sources = [];
  for (const width of [768, 1120].filter(w => w < meta.width)) {
    const src = `${dest}/width-${width}.webp`;
    await sharp(bytes).resize({ width, withoutEnlargement: true }).webp({ lossless: true, effort: 6 }).toFile(src);
    sources.push({ src, width });
  }
  sources.push({ src: `${dest}/full.webp`, width: meta.width });
  entry.capture = { src: `${dest}/full.webp`, width: meta.width, height: meta.height, sources,
    sourceSha256: hash(bytes), pixelSha256: hash(await sharp(bytes).ensureAlpha().raw().toBuffer()) };
  // Delete only obsolete generated width variants, never source files.
  for (const file of await fs.readdir(dest)) {
    if (/^width-\d+\.webp$/.test(file) && !sources.some(s => s.src === `${dest}/${file}`)) await fs.unlink(`${dest}/${file}`);
  }
  manifest.entries.push({ id: entry.id, name: entry.name || "ARTIFACTS homepage", sourceFilename: entry.sourceFilename,
    sourceModified: stat.mtime.toISOString(), sourceBytes: bytes.length, ...entry.capture });
  console.log(`${entry.id}: ${meta.width} × ${meta.height}, native pixels preserved`);
}
await fs.writeFile("content/apps.json", JSON.stringify(catalogue, null, 2) + "\n");
await fs.writeFile("content/homepage.json", JSON.stringify(homepage, null, 2) + "\n");
await fs.writeFile("content/source-manifest.json", JSON.stringify(manifest, null, 2) + "\n");
