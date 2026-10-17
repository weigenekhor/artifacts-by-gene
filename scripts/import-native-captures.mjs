import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// Explicit ownership (including theme-relative paths) is in the manifest.
const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-native-captures.mjs <source-image-folder>');
const model = JSON.parse(await fs.readFile('content/apps.json','utf8'));
const encoding = 'webp-q100-v1';
sharp.cache(false);
sharp.concurrency(2);
for (const app of model.apps) {
 for (const capture of app.images) {
  const sourceRoot=path.resolve(source),inputPath=path.resolve(sourceRoot,capture.sourceFilename);
  if(!inputPath.startsWith(sourceRoot+path.sep))throw new Error('Capture path must stay inside the approved source folder');
  const input = await fs.readFile(inputPath);
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  if (capture.sha256===hash && capture.encoding===encoding && await fs.access(`${capture.base}/full.webp`).then(()=>true,()=>false)) continue;
  const meta = await sharp(input).metadata();
  await fs.mkdir(capture.base,{recursive:true});
  // Preserve the supplied Upscayl 4x dimensions. Web-optimized full image;
  // the untouched lossless master remains in the Desktop archive.
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
console.log('Capture import complete. Source masters unchanged.');
