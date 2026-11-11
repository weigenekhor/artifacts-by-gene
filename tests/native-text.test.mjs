import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {nativeText} from '../native-text.js';
import {homeMarkup} from '../native-home.js';

test('Fixed desktop copy retains its intended physical font and geometry under a 16px minimum font',()=>{
 for(const minimum of [0,12,16,24,32])for(const size of [9,10,11,11.5,12,13,13.333,17]){
  const markup=nativeText('ARTIFACTS',{width:168,height:40,size});
  const logicalFont=Number(markup.match(/font:400 ([\d.]+)px/)[1]);
  const [,logicalWidth,logicalHeight]=markup.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  assert.ok(Math.abs(Math.max(minimum,logicalFont)*168/logicalWidth-size)<1e-10);
  assert.equal(logicalHeight/logicalWidth,40/168);
  assert.match(markup,/role="img" aria-label="ARTIFACTS"/);
 }
});

test('All native Home variants keep their existing labels, button names, coordinates and theme colours',async()=>{
 const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
 const layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 for(const [key,ref] of Object.entries(layouts)){
  const html=homeMarkup(model,layouts,key);
  assert.equal((html.match(/data-inspect-app=/g)||[]).length,ref.cards.length,key);
  assert.equal((html.match(/class="native-text"/g)||[]).length,ref.cards.length+ref.headings.length,key);
  for(const card of ref.cards){
   assert.ok(html.includes(`left:${card.x}px;top:${card.y}px;width:${card.width}px;height:${card.height}px`),key);
   assert.ok(html.includes(`color:${card.label.color}`),key);
  }
 }
});

test('The title bar and navigation use bounded native typography without replacing accessible control labels',async()=>{
 const html=await fs.readFile('index.html','utf8');
 assert.match(html,/class="app-greeting"><svg class="native-text"[^>]*data-native-copy="Hello, Gene\. Welcome to ARTIFACTS\."/);
 for(const attribute of ['data-mode-range','data-mode-name','data-product-status'])assert.match(html,new RegExp(`${attribute}><svg class="native-text"`));
 assert.match(html,/data-cycle-mode aria-label=/);
 assert.match(html,/data-home aria-label="Home"/);
 const originalHome=html.slice(html.indexOf('<div class="home-scroll"'),html.indexOf('<footer class="app-status"'));
 assert.doesNotMatch(originalHome,/font:\d+ (?:9|1[0-5])px/,'Native typography must not be independently clamped to 16px');
});

test('Source text is escaped and wrapped descriptions keep the same source bounds',()=>{
 const svg=nativeText('A & B <script> "test"',{width:334,height:34,size:13,wrap:true,top:true});
 assert.ok(svg.includes('A &amp; B &lt;script&gt; &quot;test&quot;'));
 assert.doesNotMatch(svg,/<script>/);
 assert.match(svg,/width="334" height="34" viewBox="0 0 2672 272"/);
 assert.match(svg,/white-space:normal/);
 assert.match(svg,/align-items:flex-start/);
});
