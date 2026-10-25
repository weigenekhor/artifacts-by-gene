import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createWorkspaceViewCache} from '../workspace-view-cache.js';
import {homeMarkup,homeMaterialMarkup} from '../native-home.js';
const digest=value=>createHash('sha256').update(value).digest('hex');
const baseline=JSON.parse(await fs.readFile(new URL('./fixtures/panel-appearance.json',import.meta.url),'utf8'));

test('Repeated panel arrangements reuse identical nodes without rebuilding their widget trees',()=>{
 let builds=0;const cache=createWorkspaceViewCache(variant=>({variant,build:++builds,scrollTop:0}));
 const variants=Array.from({length:4},()=>({}));
 const first=variants.map(v=>cache.get('metria-tenebrismo',v));first[0].scrollTop=120;
 for(let i=0;i<40;i++)for(let j=0;j<4;j++)assert.equal(cache.get('metria-tenebrismo',variants[j]),first[j]);
 assert.equal(builds,4);assert.equal(cache.size,4);assert.equal(first[0].scrollTop,120);
});

test('View cache releases other apps and themes and remains bounded',()=>{
 let builds=0;const cache=createWorkspaceViewCache(()=>({number:++builds}));
 const variant={};const original=cache.get('metria-tenebrismo',variant);
 assert.notEqual(cache.get('metria-pentimento',variant),original);assert.equal(cache.size,1);
 assert.notEqual(cache.get('telemetry-pentimento',variant),original);assert.equal(cache.size,1);
 for(let i=0;i<20;i++)cache.get('telemetry-pentimento',{});
 assert.equal(cache.size,4);cache.clear();assert.equal(cache.size,0);
});

test('Fixed material preserves byte-identical home content for every theme and sidebar arrangement',async()=>{
 const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
 const layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 for(const key of Object.keys(layouts)){
  const after=homeMarkup(model,layouts,key);
  assert.equal(digest(after.replace(/ data-home-overflow="(?:true|false)"/,'')),baseline.homeContent[key],key);assert.doesNotMatch(after,/home-material|home-wafer/);
  const closed=key.replace(/-(closed|navigation|information|both)$/,'-closed');
  assert.equal(homeMaterialMarkup(layouts,key),homeMaterialMarkup(layouts,closed));
  assert.doesNotMatch(homeMaterialMarkup(layouts,key),/app-tile|home-sheet|home-scroll/);
 }
});

test('Panel motion keeps navigation and info appearance rules and animation timing',async()=>{
 const after=await fs.readFile('shell.css','utf8');
 // Notifications have their own fidelity checks; this baseline guards the navigation/info panels.
 const strip=s=>s.split('\n').filter(line=>!line.includes('notification')).join('\n').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\.panels-moving[^{}]+\{[^{}]*\}/g,'').replace(/\s+/g,'');
 // Only the background anchoring changes; retain the previous CSS baseline for every other rule.
 const priorAnchor=after.replace(/\n\.home-scroll\[data-home-overflow=true\]\{[^}]+\}/,'').replace(/\n\.panels-moving \.home-scroll\[data-home-overflow\]\{[^}]+\}/,'').replace('.home-scroll{position:absolute;inset:14px 26px 14px 18px;overflow:hidden;', '.home-scroll{position:absolute;inset:14px 26px 14px 18px;overflow:auto;').replace('.home-material{position:absolute;left:66px;top:49px;width:1161px;height:750px;overflow:hidden;pointer-events:none}', '.home-material{position:absolute;inset:0;overflow:hidden;pointer-events:none}');
 assert.equal(digest(strip(priorAnchor)),baseline.cssWithoutNotifications);
 const shell=await fs.readFile('native-shell.js','utf8');
 assert.match(shell,/clearTimeout\(layoutTimer\)/);
 assert.match(shell,/classList\.toggle\('panels-moving',!reduced\.matches\)/);
 assert.match(shell,/classList\.remove\('panels-moving'\);renderHome\(\);\},240/);
 assert.match(shell,/if\(workspaces\.active\|\|homeKey===key\)return/);
 assert.match(shell,/if\(shell\.dataset\.materialKey!==materialKey\)/);
 assert.match(shell,/workspaces\.close\(\);renderHome\(\)/);
});
