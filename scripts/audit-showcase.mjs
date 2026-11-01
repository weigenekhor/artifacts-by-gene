/** Audit deployed assets and source provenance without changing source captures. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const source=process.argv[2];
const records=[];let bytes=0;
for(const app of model.apps)for(const capture of app.images){
 if(!capture.sha256||capture.sources.length!==[768,1280,1920,2560].filter(width=>width<=capture.width).length)throw Error('Import incomplete: '+capture.sourceFilename);
 const file=`${capture.base}/full.webp`,meta=await sharp(file).metadata();
 if(meta.width!==capture.width||meta.height!==capture.height)throw Error('Incorrect dimensions: '+file);
 if(source){
  const digest=crypto.createHash('sha256').update(await fs.readFile(path.join(source,capture.sourceFilename))).digest('hex');
  if(digest!==capture.sha256)throw Error('Source hash mismatch: '+capture.sourceFilename);
  const fullDigest=crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
  if(fullDigest!==digest)throw Error('Full-resolution asset differs from master: '+file);
 }
 for(const assetPath of [file,...capture.sources.map(s=>s.src)])bytes+=(await fs.stat(assetPath)).size;
 records.push({app:app.id,theme:capture.theme,source:capture.sourceFilename,sourceSha256:capture.sha256,width:meta.width,height:meta.height,full:file});
}
await fs.writeFile('content/capture-source-manifest.json',JSON.stringify({date:new Date().toISOString().slice(0,10),applications:model.apps.length,themes:model.themes,captures:records.length,encoding:'Full-size lossless native WebP masters; responsive WebP quality 94; shared masters retained in the Desktop archive',bytes,records},null,2)+'\n');
console.log(`${records.length} source hashes and full-size assets verified; ${(bytes/1e6).toFixed(1)} MB active screenshot assets.`);
