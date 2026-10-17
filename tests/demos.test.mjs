import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {demoSpecs,initialDemo,reduceDemo,sampleRows,filterOptions,summarize,demoCSV} from '../demo-model.js';
import {demoMarkup} from '../demo-view.js';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));

test('Every registered app has an interactive sample, and every view renders finite results',()=>{
 assert.deepEqual(Object.keys(demoSpecs).sort(),model.apps.map(a=>a.id).sort());
 for(const app of model.apps){
  const cfg=demoSpecs[app.id];assert.ok(cfg.views.length>=2);
  for(let view=0;view<cfg.views.length;view++){
   const state=reduceDemo(initialDemo(app.id),{type:'view',value:view});
   const markup=demoMarkup(app,state);
   assert.match(markup,/Interactive demo · Sample data/);
   assert.doesNotMatch(markup,/NaN|undefined|Infinity/);
   assert.match(markup,/data-demo-action="run"/);
   assert.match(markup,/data-demo-action="export"/);
   assert.match(markup,/data-demo-action="view" data-value="0"/);
   assert.ok(markup.includes(cfg.views[view]),app.id);
   for(const svg of markup.matchAll(/<svg[\s\S]*?<\/svg>/g))assert.match(svg[0],/role="img" aria-label=/);
  }
 }
});

test('All filter combinations render without empty-chart or nonfinite coordinate errors',()=>{
 for(const app of model.apps){
  const cfg=demoSpecs[app.id];
  for(let view=0;view<cfg.views.length;view++)for(let a=0;a<filterOptions(cfg.filters[0]).length;a++)for(let b=0;b<filterOptions(cfg.filters[1]).length;b++){
   let s=reduceDemo(initialDemo(app.id),{type:'view',value:view});
   s=reduceDemo(s,{type:'filter',index:0,value:a});s=reduceDemo(s,{type:'filter',index:1,value:b});
   assert.doesNotMatch(demoMarkup(app,s),/NaN|undefined|Infinity/,`${app.id} view ${view} filters ${a}/${b}`);
  }
 }
});

test('Run, clear, reset, filters and statistics operate on isolated, deterministic sample data',()=>{
 for(const app of model.apps){
  const original=initialDemo(app.id),rows=sampleRows(original);
  assert.deepEqual(sampleRows(initialDemo(app.id)),rows);
  const run=reduceDemo(original,{type:'run'});assert.equal(original.revision,0);assert.equal(run.revision,1);assert.notDeepEqual(sampleRows(run),rows);
  const clear=reduceDemo(run,{type:'clear'});assert.deepEqual(sampleRows(clear),[]);assert.match(demoMarkup(app,clear),/No sample loaded/);
  assert.deepEqual(reduceDemo(clear,{type:'reset'}),original);
  assert.deepEqual(reduceDemo(original,{type:'view',value:999}),original);
  assert.deepEqual(reduceDemo(original,{type:'filter',index:3,value:1}),original);
  const selected=reduceDemo(original,{type:'filter',index:0,value:1});assert.equal(original.filters[0],0);assert.notDeepEqual(sampleRows(selected),rows);
  assert.equal(summarize(rows).count,rows.length);assert.ok(summarize(rows).sd>0);
  assert.match(demoMarkup(app,reduceDemo(original,{type:'tab',value:'statistics'})),/data-value="statistics" aria-pressed="true"/);
  assert.equal(demoCSV(rows).split('\r\n').length,rows.length+1);
 }
 const reactor=reduceDemo(initialDemo('metria-spc'),{type:'filter',index:0,value:1});
 assert.ok(sampleRows(reactor).every(row=>row.equipment==='Reactor C'));
 const review=reduceDemo(initialDemo('altus-lotviewer'),{type:'filter',index:1,value:2});
 assert.ok(sampleRows(review).every(row=>row.status==='Review required'));
});

test('Application Info and every home state use live typography with measured source bounds',async()=>{
 const html=await fs.readFile('index.html','utf8'),layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 assert.doesNotMatch(html,/data-info-image/);assert.match(html,/class="info-wordmark">ARTIFACTS/);
 assert.match(html,/<dt>AGE<\/dt><dd data-info-age>/);assert.match(html,/class="info-link info-support"/);
 for(const ref of Object.values(layouts)){
  assert.ok(ref.headings.length>=2);
  for(const card of ref.cards){assert.ok(card.label.text);assert.ok(card.label.width>0);assert.ok(card.label.height>0);assert.ok(card.label.x+card.label.width<=card.width);}
 }
});

test('Demonstrations cannot access equipment or send uploaded data',async()=>{
 for(const file of ['demo-model.js','demo-view.js','demo-workspace.js']){
  const src=await fs.readFile(file,'utf8');assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|type="file"/);
 }
});

test('Workspace event wiring opens apps, applies controls, remembers each app and returns Home',async()=>{
 const {demoWorkspace}=await import('../demo-workspace.js');
 const makeNode=()=>({hidden:false,innerHTML:'',scrollTop:0,attributes:{},handlers:{},className:'',setAttribute(k,v){this.attributes[k]=v;},removeAttribute(k){delete this.attributes[k];},addEventListener(k,v){this.handlers[k]=v;},contains(){return false;},querySelector(){return {setAttribute(){},focus(){}};}});
 const workspace=makeNode(),home=makeNode(),homeButton=makeNode(),nav=model.apps.map(a=>({...makeNode(),dataset:{locateApp:a.id}}));
 const shell={querySelector(s){return s==='.app-content'?{append(){}}:s==='.app-home'?home:homeButton;},querySelectorAll(){return nav;}};
 const previous=globalThis.document;globalThis.document={createElement(){return workspace;},activeElement:null};
 let returned=0;
 try{
  const controller=demoWorkspace(shell,model,()=>returned++);
  const click=(action,value)=>workspace.handlers.click({target:{closest(){return {dataset:{demoAction:action,value},disabled:false};}}});
  controller.open('data-lens');assert.equal(home.hidden,true);assert.equal(workspace.hidden,false);assert.match(workspace.innerHTML,/Parameter Relationship/);
  click('view','1');assert.match(workspace.innerHTML,/data-value="1" aria-pressed="true"/);
  click('run');assert.match(workspace.innerHTML,/sample set 2/);
  workspace.handlers.change({target:{closest(){return {dataset:{demoFilter:'0'},value:'2'};}}});
  assert.match(workspace.innerHTML,/<option value="2" selected>Thickness/);
  controller.open('telemetry');controller.open('data-lens');assert.match(workspace.innerHTML,/data-value="1" aria-pressed="true"/);
  click('clear');assert.match(workspace.innerHTML,/No sample loaded/);click('reset');assert.doesNotMatch(workspace.innerHTML,/No sample loaded/);
  click('home');assert.equal(returned,1);assert.equal(home.hidden,false);assert.equal(workspace.hidden,true);assert.equal(controller.active,null);assert.equal(homeButton.attributes['aria-current'],'page');
 }finally{globalThis.document=previous;}
});
