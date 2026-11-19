import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { neutralTitleMark } from './neutral-title-mark.mjs';

// Explicit ownership (including theme-relative paths) is in the manifest.
const [source,...ids] = process.argv.slice(2);
if (!source) throw new Error('Usage: node scripts/import-native-captures.mjs <source-image-folder> [app-id ...]');
const model = JSON.parse(await fs.readFile('content/apps.json','utf8'));
for (const id of ids) if (!model.apps.some(app => app.id===id)) throw new Error(`Unknown application: ${id}`);
sharp.cache(false);
sharp.concurrency(2);
for (const app of model.apps) {
 if (ids.length && !ids.includes(app.id)) continue;
 for (const capture of app.images) {
  const sourceRoot=path.resolve(source),inputPath=path.resolve(sourceRoot,capture.sourceFilename);
  if(!inputPath.startsWith(sourceRoot+path.sep))throw new Error('Capture path must stay inside the approved source folder');
  const input = await fs.readFile(inputPath);
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  const meta = await sharp(input).metadata();
  const patch = await neutralTitleMark(input, capture.theme, meta.width);
  const encoding = patch ? 'webp-lossless-neutral-title-v1' : 'webp-lossless-native-v2';
  if ((capture.sourceSha256 || capture.sha256) === hash && capture.encoding === encoding &&
      await fs.access(`${capture.base}/full.webp`).then(()=>true,()=>false)) continue;
  await fs.mkdir(capture.base,{recursive:true});
  const display = patch ? await sharp(input).composite([patch]).webp({lossless: true, effort: 2}).toBuffer() : input;
  await fs.writeFile(`${capture.base}/full.webp`, display);
  if (patch) capture.sourceSha256 = hash;
  else delete capture.sourceSha256;
  capture.width=meta.width; capture.height=meta.height;
  capture.sha256=crypto.createHash('sha256').update(display).digest('hex');
  capture.encoding=encoding;
  capture.sources=[];
  for (const width of [768,1280,1920,2560]) {
   if (width>meta.width) continue;
   const src=`${capture.base}/${width}.webp`;
   await sharp(display).resize({width,withoutEnlargement:true}).webp({quality:94,smartSubsample:true,effort:2}).toFile(src);
   capture.sources.push({src,width});
  }
  console.log(`${app.name}: ${capture.sourceFilename} (${meta.width}×${meta.height})`);
 }
 await fs.writeFile('content/apps.json',JSON.stringify(model,null,2)+'\n');
}
console.log('Capture import complete. Source masters unchanged.');
