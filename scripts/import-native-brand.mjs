import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
const source=process.argv[2];
if(!source)throw new Error('Supply the desktop resources/images folder.');
await sharp(path.join(source,'artifacts_wallpaper.jpg')).resize({width:2560,withoutEnlargement:true}).webp({quality:91}).toFile('assets/native/wallpaper.webp');
await fs.copyFile(path.join(source,'artifacts-symbol.svg'),'assets/brand/artifacts-symbol.svg');
console.log('Imported original desktop wallpaper and symbol.');
