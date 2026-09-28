import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";
const [id, source] = process.argv.slice(2);
const catalogue = JSON.parse(await fs.readFile("content/apps.json", "utf8"));
const app = catalogue.apps.find((a) => a.id === id);
if (!app || !source)
  throw new Error(
    "Usage: node scripts/prepare-capture.mjs <app-id> <native-capture.png>",
  );
const metadata = await sharp(source).metadata();
if (metadata.format !== "png" || metadata.width < 2560)
  throw new Error(
    "Provide a native PNG capture at least 2560 px wide. Do not enlarge an existing screenshot.",
  );
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const region = app.detailImages[0].region;
const crop = {
  left: Math.round((region.left / app.width) * metadata.width),
  top: Math.round((region.top / app.height) * metadata.height),
  width: Math.round((region.width / app.width) * metadata.width),
  height: Math.round((region.height / app.height) * metadata.height),
};
await sharp(source).webp({ lossless: true, effort: 6 }).toFile(app.heroImage);
await sharp(source)
  .resize({ width: 1280, withoutEnlargement: true })
  .webp({ lossless: true, effort: 6 })
  .toFile(app.responsiveImage);
await sharp(source)
  .resize({ width: 480, withoutEnlargement: true })
  .webp({ quality: 88, effort: 6 })
  .toFile(app.thumbnail);
await sharp(source)
  .extract(crop)
  .webp({ lossless: true, effort: 6 })
  .toFile(app.detailImages[0].src);
Object.assign(app, {
  width: metadata.width,
  height: metadata.height,
  sourceFile: path.basename(source),
  sourceQuality:
    metadata.width >= 3840 && metadata.height >= 2160
      ? "native-4k"
      : "native-capture",
  needsRecapture: false,
  sourceSha256: hash(await fs.readFile(source)),
  sourcePixelSha256: hash(await sharp(source).ensureAlpha().raw().toBuffer()),
  heroSha256: hash(await fs.readFile(app.heroImage)),
});
Object.assign(app.detailImages[0], {
  width: crop.width,
  height: crop.height,
  region: crop,
});
await fs.writeFile(
  "content/apps.json",
  JSON.stringify(catalogue, null, 2) + "\n",
);
console.log(
  `Prepared ${app.name}: ${app.width} × ${app.height}. Check captureNote and detail region in content/apps.json, then run pnpm build.`,
);
