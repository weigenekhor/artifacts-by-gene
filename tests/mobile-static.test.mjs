import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';

test('Mobile hero has the exact desktop aspect ratio at both source resolutions',async()=>{
 for(const width of [1229,2458]){
  const meta=await sharp(`assets/hero/tenebrismo-${width}.webp`).metadata();
  assert.equal(meta.width,width);assert.equal(meta.width/meta.height,1229/820);
 }
 const html=await fs.readFile('index.html','utf8');
 const block=html.match(/<div class="mobile-product">(.*?)<div class="product-rig">/s)?.[1];
 assert.ok(block);assert.match(block,/width="2458" height="1640"/);
 assert.doesNotMatch(block,/<button|<a\s|onclick=/);
 assert.doesNotMatch(await fs.readFile('site.js','utf8'),/product-viewer/);
});

test('Browser icon variants share the packaged desktop icon source and stable URLs',async()=>{
 const ico=await fs.readFile('favicon.ico');
 for(const [size,name] of [[32,'favicon-32.png'],[48,'favicon-48.png'],[256,'artifacts-app-icon.png']]){
  const offset=Array.from({length:ico.readUInt16LE(4)},(_,i)=>6+i*16).find(p=>(ico[p]||256)===size);
  const start=ico.readUInt32LE(offset+12),length=ico.readUInt32LE(offset+8);
  assert.deepEqual(await fs.readFile(`assets/brand/${name}`),ico.subarray(start,start+length));
 }
 const html=await fs.readFile('index.html','utf8');
 assert.match(html,/href="favicon.ico"/);assert.match(html,/sizes="48x48" href="assets\/brand\/favicon-48.png"/);
 const fallback=await fs.readFile('assets/favicon.svg','utf8');
 assert.ok(fallback.includes((await fs.readFile('assets/brand/artifacts-app-icon.png')).toString('base64')));
});
