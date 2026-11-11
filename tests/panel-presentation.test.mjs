import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import {panelTextStyle,layoutPanelText} from '../panel-presentation.js';

const references=JSON.parse(await fs.readFile('content/panel-reference.json','utf8'));

test('Every live panel label scales with its source artwork, independently of browser zoom',()=>{
 for(const [key,ref] of Object.entries(references))for(const scale of [1,.9,.8,.625]){
  const live={children:ref.text.map(()=>({style:{}}))};
  layoutPanelText(live,ref,scale);
  for(let i=0;i<ref.text.length;i++){
   const text=ref.text[i],style=live.children[i].style;
   assert.ok(Math.abs(parseFloat(style.fontSize)/text.size-scale)<1e-12,key);
   assert.ok(Math.abs(parseFloat(style.left)/100*ref.width*scale-text.x*scale)<1e-9,key);
   assert.ok(Math.abs(parseFloat(style.height)/100*ref.height*scale-text.height*scale)<1e-9,key);
   assert.ok(!Object.values(style).some(value=>String(value).includes('cqw')),key);
   // The expedition and metadata remain single-line as in native Qt.
   if(!text.top&&text.size<17)assert.equal(style.whiteSpace,'nowrap',`${key}: ${text.text}`);
  }
 }
});

test('Resize updates existing label nodes and restores the original dimensions without accumulating scale',()=>{
 const ref=references['tenebrismo-pentimento-pyra_tab'];
 const live={children:ref.text.map(()=>({style:{}}))},nodes=[...live.children];
 for(const scale of [.7,1,.8,1])layoutPanelText(live,ref,scale);
 assert.deepEqual(live.children,nodes);
 assert.equal(live.children[0].style.fontSize,'13px');
 assert.equal(panelTextStyle(ref.text[1]).whiteSpace,'normal');
 assert.equal(live.children[0].style.justifyContent,'center');
});

test('Native hover materials remain opaque behind text in all three appearances',async()=>{
 for(const theme of ['imprimatura','tenebrismo','pentimento']){
  const {data,info}=await sharp(`assets/native/panels/${theme}-pentimento-pyra_tab.webp`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Rounded outer corners intentionally retain transparency.
  for(const [x,y] of [[80,60],[400,230],[40,550],[400,1080]]){
   assert.equal(data[(y*info.width+x)*info.channels+3],255,theme);
  }
 }
});

test('Published hover styles receive content hashes and have explicit, opaque layer ordering',async()=>{
 const html=await fs.readFile('index.html','utf8');
 for(const file of ['shell.css','panel-details.css','site.js']){
  const hash=createHash('sha256').update(await fs.readFile(file)).digest('hex').slice(0,10);
  assert.ok(html.includes(`${file}?v=${hash}`),file);
 }
 const css=await fs.readFile('panel-details.css','utf8');
 assert.match(css,/\.module-details\{container-type:normal;background:#[a-f0-9]{6}\}/);
 assert.match(css,/\.native-panel\{position:absolute;inset:0;z-index:0/);
 assert.match(css,/\.native-panel-motion\{z-index:1\}/);
 assert.match(css,/\.native-panel-text\{z-index:2\}/);
 const shell=await fs.readFile('native-shell.js','utf8');
 assert.doesNotMatch(shell,/details\.animate\(/,'The panel must not expose underlying content during an opacity animation');
});
