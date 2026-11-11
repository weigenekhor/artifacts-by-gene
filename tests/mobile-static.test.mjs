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

test('Every public favicon keeps the ARTIFACTS mark legible on light pages',async()=>{
 const ico=await fs.readFile('favicon.ico');
 const frames=[];
 for(let index=0;index<ico.readUInt16LE(4);index++){
  const entry=6+16*index,size=ico[entry]||256;
  const start=ico.readUInt32LE(entry+12),length=ico.readUInt32LE(entry+8);
  frames.push([ico.subarray(start,start+length),size]);
 }
 assert.deepEqual(frames.map(([,size])=>size),[16,24,32,48,64,128,256]);
 const html=await fs.readFile('index.html','utf8');
 assert.match(html,/href="favicon.ico"/);assert.match(html,/sizes="96x96" href="favicon.png"/);
 assert.equal((html.match(/rel="icon" type="image\/png"/g)||[]).length,1);
 const luminance=rgb=>rgb.reduce((total,v,i)=>{
  const s=v/255;
  return total+[.2126,.7152,.0722][i]*(s<=.04045?s/12.92:((s+.055)/1.055)**2.4);
 },0);
 for(const [asset,size] of [
  ...frames,['favicon.png',96],['apple-touch-icon.png',180],['assets/favicon.svg',80],
  ['assets/brand/favicon-32.png',32],['assets/brand/favicon-48.png',48],
 ]){
  const {data,info}=await sharp(asset).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,size);assert.equal(info.height,size);
  const background=luminance([...data.subarray(0,3)]);
  let readable=0;
  for(let i=0;i<data.length;i+=4){
   assert.equal(data[i+3],255,'Favicon must have an opaque background');
   if((luminance([...data.subarray(i,i+3)])+.05)/(background+.05)>=7)readable++;
  }
  assert.ok((1.05/(background+.05))>=7,'Background must stand out on a white search page');
  assert.ok(readable>=size*size*.16,'The mark must retain contrast at the actual icon size');
 }
});
