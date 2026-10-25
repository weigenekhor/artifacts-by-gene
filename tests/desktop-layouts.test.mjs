import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {nodeMarkup,layoutVariant,desktopWorkspace} from '../desktop-workspace.js';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const layouts=Object.fromEntries(await Promise.all(model.apps.map(async app=>[app.id,JSON.parse(await fs.readFile(`content/desktop-layouts/${app.id}.json`,'utf8'))])));
const flatten=node=>[node,...(node.children||[]).flatMap(flatten)];

test('Every exported scroll area has one browser scroll owner and hides only its duplicate Qt rails',async()=>{
 let areas=0,rails=0;
 for(const data of Object.values(layouts))for(const variants of Object.values(data.states.initial))for(const variant of Object.values(variants)){
  const nodes=flatten(variant.tree),html=nodeMarkup(variant.tree);
  const tags=[...html.matchAll(/<[^>]+data-native-id="([^"]+)"[^>]*>/g)];
  const tagFor=id=>tags.find(tag=>tag[1]===id)?.[0];
  const railIds=new Set();
  for(const node of nodes){
   if(!(node.children||[]).some(child=>child.scroll))continue;
   areas++;
   assert.match(tagFor(node.id),/class="[^"]*\bdesktop-scroll(?: |")/);
   assert.match(tagFor(node.id),/tabindex="0"/);
   for(const child of node.children){
    if(child.scroll){
     assert.match(tagFor(child.id),/desktop-scroll-viewport/);
     assert.doesNotMatch(tagFor(child.id),/\bdesktop-scroll(?: |")/);
    }
    const bars=(child.children||[]).filter(n=>n.class==='QScrollBar');
    if(!bars.length)continue;
    rails+=bars.length;railIds.add(child.id);
    assert.match(tagFor(child.id),/desktop-scroll-chrome/);
    for(const bar of bars){
     const property=bar.height>bar.width?'width':'height';
     assert.ok(tagFor(node.id).includes(`--native-scroll-${property}:${bar[property]}px`));
    }
   }
  }
  for(const node of nodes)if(!railIds.has(node.id))assert.doesNotMatch(tagFor(node.id),/desktop-scroll-chrome/);
 }
 assert.equal(areas,180);assert.ok(rails>0);
 const css=await fs.readFile('desktop-workspace.css','utf8');
 assert.match(css,/\.desktop-scroll-chrome\{display:none\}/);
 assert.match(css,/\.desktop-scroll-viewport\{overflow:visible\}/);
 // Decorative surfaces must not extend under the real scrollbar and create
 // horizontal overflow. Content widths and genuine horizontal scrolling stay.
 assert.match(css,/\.desktop-scroll>\.desktop-container-surface\{width:100%!important;height:100%!important\}/);
 assert.match(css,/\.desktop-scroll\{overflow:auto\}/);
 assert.match(css,/@supports selector\(::-webkit-scrollbar\)[\s\S]*?scrollbar-width:auto;scrollbar-color:auto/);
});

test('Data Lens content fits the desktop scrollbar allocation in all twelve variants',()=>{
 for(const variants of Object.values(layouts['data-lens'].states.initial))for(const variant of Object.values(variants)){
  const area=flatten(variant.tree).find(n=>(n.children||[]).some(c=>c.scroll));
  const viewport=area.children.find(n=>n.scroll);
  const vertical=area.children.flatMap(n=>n.children||[]).find(n=>n.class==='QScrollBar'&&n.height>n.width);
  assert.equal(viewport.x+viewport.width+vertical.width,area.width);
  assert.equal(viewport.height,area.height);
  for(const content of viewport.children)assert.ok(content.x+content.width<=viewport.width);
 }
});

test('MET Compiler scrolls its renamed viewport while keeping its footer fixed',()=>{
 for(const variants of Object.values(layouts['gan-met-compiler'].states.initial))for(const variant of Object.values(variants)){
  const nodes=flatten(variant.tree),area=nodes.find(n=>n.name==='dashboardScroll');
  const viewport=area.children.find(n=>n.name==='dashboardViewport');
  assert.equal(viewport.scroll,true);
  assert.ok(viewport.children.some(n=>n.height>viewport.height));
  assert.match(nodeMarkup(area),/desktop-box desktop-scroll"/);
  assert.ok(!flatten(area).some(n=>n.name==='compile'));
  assert.equal(nodes.find(n=>n.name==='compile').text,'Compile & Save');
 }
});

test('Metria Plot and every painted button retain native rounded clipping',()=>{
 let buttons=0;
 for(const data of Object.values(layouts))for(const variants of Object.values(data.states.initial))for(const variant of Object.values(variants)){
  for(const button of flatten(variant.tree).filter(n=>n.kind==='button')){
   const html=nodeMarkup(button);buttons++;
   assert.ok(button.chrome,`${data.id}/${button.name||button.text}: missing native button artwork`);
   assert.ok(html.includes(`width:${button.width}px;height:${button.height}px`));
   assert.ok(html.includes(`font-size:${button.style.fontSize}px`));
   if(button.style['border-radius'])assert.ok(html.includes(`border-radius:${button.style['border-radius']}`));
   if(button.style['text-align']==='left')assert.ok(html.includes('justify-content:flex-start'));
   if(button.name==='plesseySpcPrimary'){
    assert.equal(button.text,'Plot');assert.equal(button.width,108);assert.equal(button.height,34);
    assert.ok(button.chrome);assert.equal(button.style['border-radius'],'4px');
   }
  }
 }
 assert.ok(buttons>1000);
});

test('Metria Plot has one continuous native outline in every theme and panel arrangement',()=>{
 const palettes={imprimatura:['#365872','#d2af79'],tenebrismo:['#202426','#a5b6bc'],pentimento:['#453744','#a78c9c']};
 let count=0;
 for(const variants of Object.values(layouts['metria-spc'].states.initial))for(const [theme,variant] of Object.entries(variants)){
  const button=flatten(variant.tree).find(n=>n.name==='plesseySpcPrimary');
  const [fill,stroke]=palettes[theme];count++;
  assert.equal(button.width,108);assert.equal(button.height,34);
  assert.equal(button.chrome,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 34"><rect x="0.5" y="0.5" width="107" height="33" rx="3.5" fill="${fill}" stroke="${stroke}" stroke-width="1"/></svg>`);
  assert.match(nodeMarkup(button),/desktop-chrome/);
 }
 assert.equal(count,12);
});

test('Scrollbar colours and geometry match the shared desktop theme rules',async()=>{
 const css=await fs.readFile('desktop-workspace.css','utf8');
 for(const color of ['#4F605E','#71847F','#93AAA5','#444D51','#A3ADB1','#BCC9CD','#5A555E','#81777F','#BDA98E'])assert.ok(css.includes(color));
 assert.match(css,/width:var\(--native-scroll-width,22px\)/);
 assert.match(css,/scrollbar-track:vertical\{margin:5px 0\}/);
 assert.match(css,/border-width:1px 6px;border-radius:11px \/ 6px;min-height:42px/);
 assert.match(css,/scrollbar-thumb:hover\{background-color:var\(--scroll-hover\)\}/);
 assert.match(css,/scrollbar-thumb:active\{background-color:var\(--scroll-pressed\)\}/);
 assert.match(css,/scrollbar-button\{display:none;width:0;height:0\}/);
});

test('Expanded home pages reserve the native scrollbar without moving their content',async()=>{
 const {homeMarkup}=await import('../native-home.js');
 const home=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 for(const[key,ref]of Object.entries(home)){
  const right=ref.contentHeight>722?4:26;
  assert.match(homeMarkup(model,home,key),new RegExp(`class="home-scroll" data-home-overflow="${ref.contentHeight>722}" style="right:${right}px"`));
  const contentWidth=ref.width-18-right-(ref.contentHeight>722?22:0);
  assert.equal(contentWidth,ref.contentWidth,key);
 }
});

test('Home scrollbar visibility matches native Qt across editions and panel arrangements',async()=>{
 const {homeMarkup}=await import('../native-home.js');
 const home=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 let overflowing=0;
 for(const [key,ref]of Object.entries(home)){
  const needed=key.includes('-legacy-')&&!key.endsWith('-closed');
  assert.equal(ref.contentHeight>ref.height-28,needed,key);
  assert.ok(homeMarkup(model,home,key).includes(`data-home-overflow="${needed}"`),key);
  if(needed)overflowing++;
  else for(const card of ref.cards)assert.ok(card.y+card.height<=ref.height-28,key);
 }
 assert.equal(overflowing,9);
 const css=await fs.readFile('shell.css','utf8');
 assert.match(css,/\.home-scroll\{[^}]*overflow:hidden/);
 assert.match(css,/\.home-scroll\[data-home-overflow=true\]\{overflow-y:auto\}/);
 assert.match(css,/\.panels-moving \.home-scroll\[data-home-overflow\]\{overflow:hidden\}/);
});

test('Native-painted surfaces do not receive a second CSS frame',()=>{
 let painted=0,ordinary=0;
 for(const data of Object.values(layouts))for(const variants of Object.values(data.states.initial))for(const variant of Object.values(variants)){
  for(const node of flatten(variant.tree)){
   const markup=nodeMarkup({...node,children:[]});
   if(node.chrome||node.vector){
    painted++;
    const ownStyle=markup.match(/data-native-id="[^"]+" style="([^"]*)"/)[1];
    assert.doesNotMatch(ownStyle,/(?:^|;)(?:border(?![^:;]*radius)|background)[^:;]*:/);
    if(node.kind!=='box')for(const [property,value] of Object.entries(node.style).filter(([k])=>/radius/i.test(k)))assert.ok(ownStyle.includes(`${property}:${value}`));
    if(node.kind==='box')assert.doesNotMatch(markup,/desktop-container-surface/);
   }else if(node.kind==='box'&&node.style.border&&node.style.border!=='none'){
    ordinary++;assert.match(markup,/desktop-container-surface/);
    assert.ok(markup.includes('border:'+node.style.border));
   }
  }
 }
 assert.ok(painted>100);assert.ok(ordinary>100);
});

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
 const previous={document:globalThis.document,fetch:globalThis.fetch,ResizeObserver:globalThis.ResizeObserver,requestIdleCallback:globalThis.requestIdleCallback,cancelIdleCallback:globalThis.cancelIdleCallback};
 const element=()=>({hidden:false,innerHTML:'',clientWidth:1161,attrs:{},handlers:{},classList:{add(){},remove(){}},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},append(){},replaceChildren(node){this.innerHTML=node?.html||'';},addEventListener(k,v){this.handlers[k]=v;}});
 const container=element(),parent=element(),home=element(),homeButton=element();
 const nav=model.apps.map(a=>({...element(),dataset:{locateApp:a.id}}));
 const shell={dataset:{theme:'tenebrismo'},querySelector:s=>s==='.app-content'?parent:s==='.app-home'?home:homeButton,querySelectorAll:()=>nav};
 let wait=false;const pending=[];
 let builds=0,idleId=0,moving=false;const idle=new Map();
 shell.classList={contains:()=>moving};
 globalThis.requestIdleCallback=callback=>{idle.set(++idleId,callback);return idleId;};
 globalThis.cancelIdleCallback=id=>idle.delete(id);
 const idleStep=(time=50)=>{const [id,callback]=idle.entries().next().value;idle.delete(id);callback({timeRemaining:()=>time});};
 globalThis.document={createElement:tag=>tag==='template'?{content:{firstElementChild:null},set innerHTML(html){builds++;this.content.firstElementChild={html};}}:container};globalThis.ResizeObserver=undefined;
 globalThis.fetch=async url=>{const id=url.match(/desktop-layouts\/(.*?)\.json/)[1];if(wait)await new Promise(resolve=>pending.push({id,resolve}));return {ok:true,json:async()=>layouts[id]};};
 try{
  const controller=desktopWorkspace(shell,model);await controller.open('topotracer');assert.match(container.innerHTML,/Measurement Values/);assert.equal(container.hidden,false);
  assert.equal(builds,1);moving=true;idleStep();assert.equal(builds,1);
  moving=false;idleStep(2);assert.equal(builds,1);
  while(idle.size)idleStep();assert.equal(builds,4);
  for(const width of [981,763,943,1161]){parent.clientWidth=width;controller.refresh();}
  assert.equal(builds,4,'visited arrangements must reuse prepared DOM nodes');
  shell.dataset.theme='pentimento';controller.refresh();assert.match(container.innerHTML,/#736c78|#736C78/);
  parent.clientWidth=763;controller.refresh();assert.ok(container.innerHTML.includes('width:761px;height:743px'));
  wait=true;const a=controller.open('data-lens'),b=controller.open('aix-dt-assistant');pending.find(p=>p.id==='aix-dt-assistant').resolve();await b;pending.find(p=>p.id==='data-lens').resolve();await a;
  assert.equal(controller.active,'aix-dt-assistant');assert.match(container.innerHTML,/Weight Mapping/);
  controller.close();assert.equal(container.hidden,true);assert.equal(controller.active,null);assert.equal(homeButton.attrs['aria-current'],'page');assert.equal(idle.size,0);
  globalThis.requestIdleCallback=undefined;globalThis.cancelIdleCallback=undefined;wait=false;
  await controller.open('topotracer');const lazyBuilds=builds;
  controller.refresh();assert.equal(builds,lazyBuilds,'browsers without idle callbacks reuse the current layout');
  controller.close();assert.equal(container.innerHTML,'');
 }finally{Object.assign(globalThis,previous);}
});
