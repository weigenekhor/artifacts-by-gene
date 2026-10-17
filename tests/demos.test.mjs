import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {initialDemo,chooseScene,sceneFor,sceneChoices} from '../demo-model.js';
import {nativeSceneMarkup} from '../demo-view.js';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const manifest=JSON.parse(await fs.readFile('content/native-demos.json','utf8'));
const themes=['imprimatura','tenebrismo','pentimento'];

test('Every application opens populated native sample data in all three appearances',()=>{
 assert.deepEqual(Object.keys(manifest.apps).sort(),model.apps.map(a=>a.id).sort());
 for(const app of model.apps){
  const record=manifest.apps[app.id];assert.equal(record.sourceKey,app.sourceKey);
  const ids=record.scenes.filter(s=>s.theme==='tenebrismo').map(s=>s.scene).sort();
  for(const theme of themes){
   assert.deepEqual(record.scenes.filter(s=>s.theme===theme).map(s=>s.scene).sort(),ids,app.id+' '+theme);
   const initial=sceneFor(record,theme,initialDemo(record).scene);
   assert.notEqual(initial.scene,'ready');assert.equal(initial.theme,theme);
   assert.ok(sceneChoices(record,theme).length>0);
   assert.equal(sceneFor(record,theme,'invalid').scene,record.initial);
  }
 }
});

test('Native views decode at double density and every measured hotspot stays inside its source viewport',async()=>{
 for(const [id,record] of Object.entries(manifest.apps))for(const scene of record.scenes){
  const meta=await sharp(scene.image).metadata();
  assert.equal(meta.width,scene.width*2,scene.image);assert.equal(meta.height,scene.height*2,scene.image);
  for(const c of scene.controls){
   assert.ok(c.x>=0&&c.y>=0&&c.width>0&&c.height>0,id+' '+c.text);
   assert.ok(c.x+c.width<=scene.width+2&&c.y+c.height<=scene.height+2,id+' '+c.text);
   for(const target of [c.action.target,...(c.action.options||[]).map(o=>o.target)].filter(Boolean)){
    assert.ok(record.scenes.some(s=>s.scene===target&&s.theme===scene.theme),id+' -> '+target);
   }
   if(c.action.download){assert.ok(!c.action.download.includes('..'));await fs.access(c.action.download);}
  }
  const markup=nativeSceneMarkup(model.apps.find(a=>a.id===id),record,scene);
  assert.match(markup,/rendered by ARTIFACTS using its sample inputs/);
  assert.equal((markup.match(/data-native-control=/g)||[]).length,scene.controls.length);
  assert.doesNotMatch(markup,/NaN|undefined|Infinity|<svg|<canvas/);
 }
});

test('Application-specific controls reach actual corresponding native outcomes',()=>{
 const find=(id,scene='1')=>sceneFor(manifest.apps[id],'tenebrismo',scene);
 const target=(id,label,scene='1')=>find(id,scene).controls.find(c=>c.text.trim()===label)?.action.target;
 assert.equal(target('aix-dt-assistant','Temperature Mapping'),'2');
 assert.equal(target('aix-dt-assistant','Weight Mapping','2'),'1');
 for(const scene of ['1','2']){
  const slots=find('aix-dt-assistant',scene).controls.find(c=>c.text==='Number of Slots').action.options;
  assert.deepEqual(slots.map(o=>o.label).sort(),['3 slots','4 slots','5 slots','6 slots','7 slots','8 slots']);
  for(const option of slots)assert.ok(option.target===scene||option.target.startsWith(scene+'-slots-'));
 }
 for(const [label,id] of [['Parameter Relationship','1'],['Wafer Map','2'],['Run Comparison','3'],['Distribution','4'],['Wafer Profile','5']])assert.equal(target('data-lens',label),id);
 assert.equal(target('data-lens','Statistics'),'1-statistics');
 assert.equal(target('data-lens','Wafer Average Correlations'),'1-wafer-average-correlations');
 for(const id of ['metria-spc','aperture-spc'])assert.equal(target(id,'Show Controls'),'1-show-controls');
 assert.equal(target('metria-spc','Compare Reactors','1-show-controls'),'2-show-controls');
 const types=find('aperture-spc','1-show-controls').controls.find(c=>c.action.options?.some(o=>o.label==='Scatter')).action.options;
 assert.equal(types.find(o=>o.label==='Box plot').target,'4-show-controls');
 assert.equal(target('papyrus-reader','Sequence Matcher Mode'),'2');
 for(const label of ['Inner Area','Outer Area','Inner Anchor','Outer Anchor'])assert.ok(find('lt-zone-assistant').controls.find(c=>c.text===label)?.action.options.length>1);
 for(const id of ['magus-spc-gan','magus-spc-legacy'])assert.equal(target(id,'Fetch SPC Data and Plot in Artifacts Web Report'),'3');
 assert.equal(target('gan-xml-assistant','Export Report'),'2');
 assert.equal(target('telemetry','12-Hour Analysis'),'3');
 assert.equal(target('topotracer','TopoPro Mode','2'),'1');
});

test('Per-app state is immutable, validated and preserved when changing appearance',()=>{
 const record=manifest.apps['data-lens'],initial=initialDemo(record),changed=chooseScene(record,initial,'4');
 assert.equal(initial.scene,'1');assert.equal(changed.scene,'4');assert.equal(changed.previous,'1');
 assert.equal(chooseScene(record,changed,'not-a-scene'),changed);
 for(const theme of themes)assert.equal(sceneFor(record,theme,changed.scene).scene,'4');
 assert.equal(initialDemo(manifest.apps.telemetry).scene,'1');
});

test('Application Info and home typography remain live at their measured source bounds',async()=>{
 const html=await fs.readFile('index.html','utf8'),layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 assert.doesNotMatch(html,/data-info-image/);assert.match(html,/class="info-wordmark">ARTIFACTS/);
 assert.match(html,/<dt>AGE<\/dt><dd data-info-age>/);assert.match(html,/class="info-link info-support"/);
 for(const ref of Object.values(layouts))for(const card of ref.cards){assert.ok(card.label.text);assert.ok(card.label.width>0);assert.ok(card.label.x+card.label.width<=card.width);}
});

test('Walkthroughs do not manufacture measurements or connect to desktop systems',async()=>{
 for(const file of ['demo-model.js','demo-view.js','demo-workspace.js']){
  const src=await fs.readFile(file,'utf8');
  assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|type="file"|Math\.random|sampleRows|demoCSV/);
 }
 assert.doesNotMatch(JSON.stringify(manifest),/C:[\\/]|file:\/\/|localhost|127\.0\.0\.1/);
});

test('Original atmospheric backdrop is restored and ARTIFACTS has the requested larger hierarchy',async()=>{
 const {execFileSync}=await import('node:child_process');
 const baseline=execFileSync('git',['show','0a692cc:shell.css'],{encoding:'utf8'});
 const current=await fs.readFile('shell.css','utf8');
 const block=s=>s.slice(s.indexOf('.product-environment{'),s.indexOf('.product-duet{')).replaceAll('\r\n','\n');
 assert.equal(block(current),block(baseline));
 const css=await fs.readFile('site.css','utf8');
 assert.match(css,/\.hero h1\{font-size:clamp\(72px,10\.6vw,152px\)/);
 assert.match(css,/font-size:clamp\(48px,14vw,98px\)/);
});

test('Workspace events preserve native results, navigation and theme state; stale decodes cannot overwrite newer views',async()=>{
 const {demoWorkspace}=await import('../demo-workspace.js');
 const saved={document:globalThis.document,Image:globalThis.Image,ResizeObserver:globalThis.ResizeObserver};
 const makeNode=()=>({hidden:false,innerHTML:'',scrollTop:0,clientWidth:1161,style:{},attributes:{},handlers:{},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]||null;},removeAttribute(k){delete this.attributes[k];},addEventListener(k,v){this.handlers[k]=v;},contains(){return false;},focus(){},append(){},querySelectorAll(){return [];}});
 const workspace=makeNode(),home=makeNode(),homeButton=makeNode(),stage=makeNode(),plane=makeNode(),select=makeNode(),nav=model.apps.map(a=>({...makeNode(),dataset:{locateApp:a.id}}));
 workspace.querySelector=s=>s==='.native-demo-stage'?stage:s==='.native-demo-plane'?plane:s==='[data-native-scene]'?select:null;
 const shell={dataset:{theme:'tenebrismo'},querySelector(s){return s==='.app-content'?{append(){}}:s==='.app-home'?home:homeButton;},querySelectorAll(){return nav;}};
 const pending=[];let delay=false;
 globalThis.document={querySelector(){return {textContent:JSON.stringify(manifest)};},createElement(){return workspace;},addEventListener(){},activeElement:null};
 globalThis.Image=class{decode(){return delay?new Promise(resolve=>pending.push(resolve)):Promise.resolve();}};
 globalThis.ResizeObserver=class{observe(){}};
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 let returned=0;
 try{
  const controller=demoWorkspace(shell,model,()=>returned++);
  const click=attrs=>workspace.handlers.click({target:{closest(){return {dataset:attrs,hasAttribute(k){return Object.hasOwn(attrs,k);}};}}});
  controller.open('data-lens');await flush();assert.equal(home.hidden,true);assert.match(workspace.innerHTML,/datalens_tab-1-tenebrismo/);
  workspace.handlers.change({target:{matches(){return true;},value:'4'}});await flush();assert.match(workspace.innerHTML,/datalens_tab-4-tenebrismo/);
  controller.open('telemetry');await flush();controller.open('data-lens');await flush();assert.match(workspace.innerHTML,/datalens_tab-4-tenebrismo/);
  shell.dataset.theme='pentimento';controller.refresh();await flush();assert.match(workspace.innerHTML,/datalens_tab-4-pentimento/);
  click({'data-native-back':''});await flush();assert.match(workspace.innerHTML,/datalens_tab-1-pentimento/);
  delay=true;controller.open('data-lens');controller.open('telemetry');pending.pop()();await flush();assert.match(workspace.innerHTML,/sentry_tab-1-pentimento/);pending.pop()();await flush();assert.match(workspace.innerHTML,/sentry_tab-1-pentimento/);
  controller.refresh();click({'data-native-home':''});pending.pop()();await flush();assert.equal(controller.active,null);assert.equal(returned,1);assert.equal(workspace.hidden,true);assert.equal(home.hidden,false);
 }finally{Object.assign(globalThis,saved);}
});
