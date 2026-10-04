import fs from 'node:fs/promises';
import sharp from 'sharp';
import path from 'node:path';

// Inputs are rendered by the real desktop HomeWidget, never reconstructed UI.
await fs.mkdir('assets/native/home',{recursive:true});
for(const file of await fs.readdir('.qa/home-export')){
 if(!file.endsWith('.png'))continue;
 const name=file.slice(0,-4);
 await sharp(`.qa/home-export/${file}`).webp({quality:96,smartSubsample:true}).toFile(`assets/native/home/${name}.webp`);
 if(/^(origin|pentimento)-(legacy|pentimento)$/.test(name)){
  await sharp(`.qa/home-export/${file}`).resize({width:1161}).webp({quality:96,smartSubsample:true}).toFile(`assets/native/home/${name}-1161.webp`);
 }
}
// Optional source capture for the no-JavaScript homepage fallback.
if(process.argv[2]){
 await sharp(path.join(process.argv[2],'Homepage 2.png')).resize({width:1920,withoutEnlargement:true}).webp({quality:96,smartSubsample:true}).toFile('assets/native/home/homepage-fallback.webp');
}
console.log('Prepared native home views and source-rendered hover states.');
