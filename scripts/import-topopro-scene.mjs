// Software Qt cannot render WebGL. Reuse the verified, GPU-rendered desktop
// master from the existing capture archive, preserving its native viewport.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const app=model.apps.find(a=>a.sourceKey==='topotracer_tab');
const path='content/workspaces/topotracer_tab.json';
const records=JSON.parse(await fs.readFile(path,'utf8'));
for(const scene of records.filter(s=>s.scene==='1')){
 const capture=app.images.find(i=>i.theme===scene.theme);
 const bounds=scene.windowBounds;
 const source=`${capture.base}/full.webp`;
 const scale=capture.width/1536;
 await sharp(source).extract({left:Math.round(bounds.x*scale),top:Math.round(bounds.y*scale),width:Math.round(bounds.width*scale),height:Math.round(bounds.height*scale)}).resize(scene.width*2,scene.height*2).webp({lossless:true}).toFile(scene.image);
 scene.provenance={source,sha256:capture.sha256,method:'native-viewport-crop',windowBounds:bounds};
}
await fs.writeFile(path,JSON.stringify(records,null,2)+'\n');
console.log('Imported all three native TopoPro GPU captures.');
