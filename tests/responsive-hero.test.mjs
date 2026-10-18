import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {homeMarkup} from '../native-home.js';

const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));

test('Responsive grouping retains every native app once, in its original Expedition, across themes and panel states',()=>{
 for(const [key,ref] of Object.entries(layouts)){
  const html=homeMarkup(model,layouts,key);
  const ids=[...html.matchAll(/data-inspect-app="([^"]+)"/g)].map(m=>m[1]);
  const expected=ref.cards.map(card=>model.apps.find(a=>a.sourceKey===card.key).id);
  assert.deepEqual(ids,expected,key);
  assert.equal(new Set(ids).size,ids.length,key);
  const groups=[...html.matchAll(/<section class="home-group">([\s\S]*?)<\/section>/g)].map(m=>m[1]);
  assert.equal(groups.length,ref.headings.length,key);
  groups.forEach((group,i)=>{
   assert.ok(group.includes(ref.headings[i].text),key);
   const cards=ref.cards.filter(c=>c.y>=ref.headings[i].y&&c.y<(ref.headings[i+1]?.y??Infinity));
   assert.deepEqual([...group.matchAll(/data-inspect-app="([^"]+)"/g)].map(m=>m[1]),cards.map(c=>model.apps.find(a=>a.sourceKey===c.key).id),key);
  });
 }
});

test('Compact cards reuse native artwork and retain unchanged desktop coordinates and live labels',()=>{
 for(const [key,ref] of Object.entries(layouts)){
  const html=homeMarkup(model,layouts,key);
  const cards=[...html.matchAll(/<button[^>]*class="app-tile"[\s\S]*?<\/button>/g)].map(m=>m[0]);
  cards.forEach((markup,i)=>{
   const card=ref.cards[i];
   assert.ok(markup.includes(`left:${card.x}px;top:${card.y}px;width:${card.width}px;height:${card.height}px;`),key);
   assert.ok(markup.includes(`viewBox="${card.x} ${card.y} ${card.width} ${card.height}"`),key);
   assert.ok(markup.includes(`href="assets/native/layouts/${key}-content.webp`),key);
   assert.ok(markup.includes('class="home-label"'),key);
  });
  assert.ok(html.includes('class="home-render"'),key);
 }
});
