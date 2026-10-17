import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {nodeMarkup,layoutVariant,desktopWorkspace} from '../desktop-workspace.js';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const layouts=Object.fromEntries(await Promise.all(model.apps.map(async app=>[app.id,JSON.parse(await fs.readFile(`content/desktop-layouts/${app.id}.json`,'utf8'))])));
const flatten=node=>[node,...(node.children||[]).flatMap(flatten)];

test('Every registered app has source-provenanced layouts for all themes and sidebar widths',()=>{
 for(const app of model.apps){
  const data=layouts[app.id];assert.equal(data.sourceKey,app.sourceKey);assert.match(data.sourceSHA256,/^[a-f0-9]{64}$/);assert.ok(data.source.endsWith('.py'));
  assert.deepEqual(Object.keys(data.states),['initial']);
  assert.deepEqual(Object.keys(data.states.initial),['closed','navigation','information','both']);
  for(const [size,variants] of Object.entries(data.states.initial)){
   assert.deepEqual(Object.keys(variants).sort(),['imprimatura','pentimento','tenebrismo']);
   for(const [theme,variant] of Object.entries(variants)){
    assert.equal(variant.availableWidth,{closed:1159,navigation:979,information:941,both:761}[size]);assert.ok(variant.width>=variant.availableWidth);assert.ok(variant.height>=700&&variant.height<=743);assert.equal(variant.tree.width,variant.width);assert.equal(variant.tree.height,variant.height);
    assert.deepEqual(variant.unsupported,[],`${app.id}/${size}/${theme}`);
    const nodes=flatten(variant.tree);assert.equal(new Set(nodes.map(n=>n.id)).size,nodes.length);
    for(const node of nodes){for(const key of ['x','y','width','height'])assert.ok(Number.isFinite(node[key]));assert.ok(node.width>0&&node.height>0);}
   }
  }
 }
});

test('Workspace markup retains measured widgets, text and coordinates without screenshots or invented results',()=>{
 for(const [id,data] of Object.entries(layouts))for(const variants of Object.values(data.states.initial))for(const [theme,variant] of Object.entries(variants)){
  const html=nodeMarkup(variant.tree,id+'-'+theme),nodes=flatten(variant.tree);
  assert.doesNotMatch(html,/<img\b|<(?:\w+:)?image\b|<iframe\b|<canvas\b|data:image|Interactive demo|Sample data|Reset sample|demo-footer|NaN/);
  assert.equal([...html.matchAll(/data-native-id=/g)].length,nodes.length);
  for(const n of nodes){assert.ok(html.includes(`left:${n.x}px;top:${n.y}px;width:${n.width}px;height:${n.height}px`),`${id}/${n.id}`);}
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,`${id} vector IDs`);
 }
});

test('Starting layouts contain actual desktop prompts and no loaded engineering samples',()=>{
 const nodes=id=>flatten(layouts[id].states.initial.closed.tenebrismo.tree);
 const texts=id=>nodes(id).map(n=>n.text||'').join('\n');
 assert.match(texts('aix-dt-assistant'),/Weight Mapping/);assert.match(texts('aix-dt-assistant'),/Baseplate Weights/);
 assert.ok(nodes('aix-dt-assistant').filter(n=>n.kind==='input').every(n=>!n.text));
 assert.match(texts('topotracer'),/Measurement Values/);assert.ok(nodes('topotracer').filter(n=>n.kind==='textarea').every(n=>!n.text));
 assert.match(texts('papyrus-reader'),/Raw Mode|SequenceMatcher/);
 assert.ok(nodes('altus-lotviewer').some(n=>n.kind==='table'&&!n.rows.length));
 assert.match(texts('gan-temp-diagnoser'),/Roller Coaster/);assert.match(texts('gan-temp-diagnoser'),/Select one observation/);
 assert.equal(nodes('gan-temp-diagnoser').find(n=>n.kind==='select').value,-1);
});

test('Theme selection uses the matching native colours and drawer geometry without scaling controls',()=>{
 const data=layouts.topotracer;
 for(const theme of ['imprimatura','tenebrismo','pentimento'])for(const width of [1161,981,943,763]){
  const expected={1161:'closed',981:'navigation',943:'information',763:'both'}[width];
  assert.equal(layoutVariant(data,theme,width),data.states.initial[expected][theme]);
 }
 const colors=Object.values(data.states.initial.closed).map(v=>flatten(v.tree).find(n=>n.kind==='button').style.color);
 assert.equal(new Set(colors).size,3);
});

test('Only the native layout renderer is connected to the product shell',async()=>{
 const shell=await fs.readFile('native-shell.js','utf8'),build=await fs.readFile('scripts/build-native.mjs','utf8'),runtime=await fs.readFile('desktop-workspace.js','utf8');
 assert.match(shell,/import \{desktopWorkspace\}/);assert.doesNotMatch(shell,/demoWorkspace|demo-workspace/);
 assert.match(build,/desktop-workspace\.css/);assert.doesNotMatch(build,/demo\.css|native-demo-data/);
 assert.doesNotMatch(runtime,/demo-data|assets\/native\/workspaces|createObjectURL|renderDemo|Math\.random/);
 for(const file of ['demo-workspace.js','demo-analysis.js','demo-model.js','content/demo-data','assets/native/workspaces'])await assert.rejects(fs.access(file));
 const home=await fs.readFile('native-home.js','utf8');assert.doesNotMatch(home,/sample demo/);
});

test('Application navigation, theme refresh and stale fetches preserve the selected native layout',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch,ResizeObserver:globalThis.ResizeObserver};
 const element=()=>({hidden:false,innerHTML:'',clientWidth:1161,attrs:{},handlers:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},append(){},addEventListener(k,v){this.handlers[k]=v;}});
 const container=element(),parent=element(),home=element(),homeButton=element();
 const nav=model.apps.map(a=>({...element(),dataset:{locateApp:a.id}}));
 const shell={dataset:{theme:'tenebrismo'},querySelector:s=>s==='.app-content'?parent:s==='.app-home'?home:homeButton,querySelectorAll:()=>nav};
 let wait=false;const pending=[];
 globalThis.document={createElement:()=>container};globalThis.ResizeObserver=undefined;
 globalThis.fetch=async url=>{const id=url.match(/desktop-layouts\/(.*?)\.json/)[1];if(wait)await new Promise(resolve=>pending.push({id,resolve}));return {ok:true,json:async()=>layouts[id]};};
 try{
  const controller=desktopWorkspace(shell,model);await controller.open('topotracer');assert.match(container.innerHTML,/Measurement Values/);assert.equal(container.hidden,false);
  shell.dataset.theme='pentimento';controller.refresh();assert.match(container.innerHTML,/#736c78|#736C78/);
  parent.clientWidth=763;controller.refresh();assert.ok(container.innerHTML.includes('width:761px;height:743px'));
  wait=true;const a=controller.open('data-lens'),b=controller.open('aix-dt-assistant');pending.find(p=>p.id==='aix-dt-assistant').resolve();await b;pending.find(p=>p.id==='data-lens').resolve();await a;
  assert.equal(controller.active,'aix-dt-assistant');assert.match(container.innerHTML,/Weight Mapping/);
  controller.close();assert.equal(container.hidden,true);assert.equal(controller.active,null);assert.equal(homeButton.attrs['aria-current'],'page');
 }finally{Object.assign(globalThis,previous);}
});
