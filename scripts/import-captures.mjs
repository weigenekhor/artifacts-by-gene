import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const directory = process.argv[2] || "C:/Users/Gene/Desktop/Artifacts Images";
const catalogue = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const homepage = JSON.parse(await fs.readFile("content/homepage.json", "utf8"));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const manifest = { sourceDirectory: directory, scannedAt: new Date().toISOString(), entries: [] };
const entries = [...catalogue.apps.flatMap(app => app.images.map((image, index) => ({...image, id:app.id, name:app.name, slide:index + 1, target:image}))), {...homepage, slide:1, target:homepage}];
const supplied = (await fs.readdir(directory)).filter(file => /\.(png|webp|avif|jpe?g)$/i.test(file));
const unmapped = supplied.filter(file => !entries.some(entry => entry.sourceFilename === file));
if (unmapped.length) throw Error(`Unmapped source captures: ${unmapped.join(', ')}`);
for (const entry of entries) {
  const sourcePath = path.join(directory, entry.sourceFilename);
  const bytes = await fs.readFile(sourcePath);
  const stat = await fs.stat(sourcePath);
  const meta = await sharp(bytes).metadata();
  const dest = `assets/evidence/${entry.id}${entry.slide > 1 ? `/slide-${entry.slide}` : ''}`;
  await fs.mkdir(dest, { recursive: true });
  await sharp(bytes).webp({ lossless: true, effort: 4 }).toFile(`${dest}/full.webp`);
  const sources = [];
  // Keep large originals for the viewer; the page only requests screen-sized derivatives.
  const widths = entry.id === "homepage" ? [768, 1120, 1536, 2240, 2880] : [768, 1120, 1536, 2240];
  for (const width of widths.filter(w => w < meta.width)) {
    const src = `${dest}/width-${width}.webp`;
    await sharp(bytes).resize({ width, withoutEnlargement: true }).webp({ lossless: true, effort: 4 }).toFile(src);
    sources.push({ src, width });
  }
  if (meta.width <= widths.at(-1)) sources.push({ src: `${dest}/full.webp`, width: meta.width });
  entry.target.capture = { src: `${dest}/full.webp`, width: meta.width, height: meta.height, sources,
    sourceSha256: hash(bytes), pixelSha256: hash(await sharp(bytes).ensureAlpha().raw().toBuffer()) };
  // Delete only obsolete generated width variants, never source files.
  for (const file of await fs.readdir(dest)) {
    if (/^width-\d+\.webp$/.test(file) && !sources.some(s => s.src === `${dest}/${file}`)) await fs.unlink(`${dest}/${file}`);
  }
  manifest.entries.push({ id: entry.id, slide:entry.slide, name: entry.name || "ARTIFACTS homepage", sourceFilename: entry.sourceFilename,
    sourceModified: stat.mtime.toISOString(), sourceBytes: bytes.length, ...entry.target.capture });
  console.log(`${entry.id} / ${entry.slide}: ${meta.width} × ${meta.height}, native pixels preserved`);
}
await fs.writeFile("content/apps.json", JSON.stringify(catalogue, null, 2) + "\n");
await fs.writeFile("content/homepage.json", JSON.stringify(homepage, null, 2) + "\n");
await fs.writeFile("content/source-manifest.json", JSON.stringify(manifest, null, 2) + "\n");
