import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// Explicit ownership is in the manifest. Never scan subdirectories or infer apps.
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-native-captures.mjs <source-image-folder>');
const model = JSON.parse(await fs.readFile('content/apps.json','utf8'));
const encoding = 'webp-q100-v1';
sharp.cache(false);
sharp.concurrency(2);
for (const app of model.apps) {
 for (const capture of app.images) {
  const input = await fs.readFile(path.join(source,capture.sourceFilename));
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  if (capture.sha256===hash && capture.encoding===encoding && await fs.access(`${capture.base}/full.webp`).then(()=>true,()=>false)) continue;
  const meta = await sharp(input).metadata();
  await fs.mkdir(capture.base,{recursive:true});
  // Full native dimensions; highest-quality WebP, not a lossless archival copy.
  // The untouched PNG remains in the source folder; never upscale or crop.
  await sharp(input).webp({quality:100,smartSubsample:true,effort:3}).toFile(`${capture.base}/full.webp`);
  capture.width=meta.width; capture.height=meta.height; capture.sha256=hash; capture.encoding=encoding;
  capture.sources=[];
  for (const width of [768,1280,1920,2560]) {
   if (width>meta.width) continue;
   const src=`${capture.base}/${width}.webp`;
   await sharp(input).resize({width,withoutEnlargement:true}).webp({quality:94,smartSubsample:true,effort:2}).toFile(src);
   capture.sources.push({src,width});
  }
  console.log(`${app.name}: ${capture.sourceFilename} (${meta.width}×${meta.height})`);
 }
 await fs.writeFile('content/apps.json',JSON.stringify(model,null,2)+'\n');
}
console.log('Capture import complete. Source PNGs unchanged.');
