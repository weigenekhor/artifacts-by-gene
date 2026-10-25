import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {homeMaterialMarkup} from '../native-home.js';

test('Wafer uses the same full-window geometry for all 24 panel/theme/edition states',async()=>{
 const layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 for(const key of Object.keys(layouts)){
  const closed=key.replace(/-(closed|navigation|information|both)$/,'-closed');
  assert.equal(homeMaterialMarkup(layouts,key),homeMaterialMarkup(layouts,closed));
  const ref=layouts[closed].wafer;
  assert.ok(homeMaterialMarkup(layouts,key).includes(`width:${ref.size}px;height:${ref.size}px`));
 }
 const css=await fs.readFile('shell.css','utf8');
 assert.match(css,/\.home-material\{position:absolute;left:66px;top:49px;width:1161px;height:750px;overflow:hidden;pointer-events:none\}/);
 const source=await fs.readFile('scripts/native-ui.mjs','utf8');
 assert.ok(source.includes('${homeMaterialMarkup(layouts,`${theme}-${mode}-closed`)}<div class="app-content">'));
 const motion=await fs.readFile('experience-motion.js','utf8');
 assert.match(motion,/product\.querySelector\('\.home-wafer'\)/);
 const runtime=await fs.readFile('native-shell.js','utf8');
 assert.match(runtime,/const materialKey=`\$\{controller.theme\}-\$\{controller.mode\}-closed`/);
 assert.match(runtime,/if\(shell.dataset.materialKey!==materialKey\)/);
 assert.match(runtime,/rotation.currentTime=waferTime/);
});

test('Website lists use serial commas in app summaries, hover copy, metadata and tooltips',async()=>{
 const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
 const byId=Object.fromEntries(model.apps.map(app=>[app.id,app]));
 assert.equal(byId['aperture-spc'].purpose,'Context-aware metrology SPC, analysis, and distributions.');
 assert.equal(byId.telemetry.purpose,'Production-tool signals, equipment history, and sensor analysis.');
 for(const [id,phrase]of [['gan-met-compiler','validation, safe append, and conflict checking'],['data-lens','run comparisons, distributions, and wafer-level correlations'],['telemetry','examines sensor behaviour, and supports equipment planning']])assert.ok(byId[id].description.includes(phrase));
 const panels=JSON.parse(await fs.readFile('content/panel-reference.json','utf8'));
 for(const [key,panel]of Object.entries(panels)){
  const app=model.apps.find(app=>key.endsWith('-'+app.sourceKey));
  if(['gan-met-compiler','data-lens','telemetry'].includes(app?.id))assert.ok(panel.text.some(item=>item.text===app.description));
 }
 assert.match(await fs.readFile('index.html','utf8'),/analysis, diagnosis, comparison, and reporting/);
 const old=['Choose runs, wafers or measurement ranges','Plot appearance, fits, axes and linked views','Files, sessions and workspace','Choose the search period, drives and folders.','Global calculation defaults, SPC detection rules and data source','reset chart exploration and plot again'];
 for(const file of await fs.readdir('content/desktop-layouts')){
  const source=await fs.readFile('content/desktop-layouts/'+file,'utf8');
  for(const phrase of old)assert.ok(!source.includes(phrase),file+': '+phrase);
 }
});
