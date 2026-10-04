import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import sharp from 'sharp';

const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const html=await fs.readFile('index.html','utf8');

test('Canonical collection is unique, ordered and complete; no fabricated app pages ship',()=>{
 const ids=new Set(model.apps.map(a=>a.id));
 assert.equal(ids.size,model.apps.length);
 assert.equal(html.split('data-gallery-app="').length-1,ids.size);
 assert.equal(html.split('data-page="').length-1,0);
 assert.equal(new Set(model.apps.map(app=>app.order)).size,model.apps.length);
 assert.deepEqual([...html.matchAll(/data-gallery-app="([^"]+)"/g)].map(match=>match[1]),[...model.apps].sort((a,b)=>a.order-b.order).map(app=>app.id));
 for(const {id:mode} of model.modes){
  const members=model.expeditions.filter(e=>e.mode===mode).flatMap(e=>e.apps);
  assert.equal(new Set(members).size,members.length);
  members.forEach(id=>assert.ok(ids.has(id),id));
 }
 assert.deepEqual(new Set(model.expeditions.flatMap(e=>e.apps)),ids);
 for(const app of model.apps)assert.equal(html.split(`data-gallery-app="${app.id}"`).length-1,1,app.name);
});

test('All explicitly mapped captures decode, preserve composition and have no missing derivatives',async()=>{
 const names=new Set();
 for(const app of model.apps){
  assert.ok(app.images.length>0,app.name);
  assert.ok(app.images.some(i=>i.theme==='pentimento'),app.name);
  await fs.access(app.icon);
  for(const capture of app.images){
   assert.ok(!names.has(capture.sourceFilename),capture.sourceFilename);
   names.add(capture.sourceFilename);
   assert.ok(!/empty|homepage|[\\/]/i.test(capture.sourceFilename));
   assert.match(capture.sha256,/^[a-f0-9]{64}$/);
   for(const {src,width} of [...capture.sources,{src:`${capture.base}/full.webp`,width:capture.width}]){
    const meta=await sharp(src).metadata();
    assert.equal(meta.width,width,src);
    assert.ok(Math.abs(meta.height-meta.width*capture.height/capture.width)<=1,src);
    assert.ok(meta.width<=capture.width,src);
   }
  }
 }
 assert.equal(names.size,model.apps.reduce((count,app)=>count+app.images.length,0));
});

test('Built page links resolve under a Pages subpath as well as the custom domain',async()=>{
 const ids=new Set([...html.matchAll(/\bid="([^" ]+)"/g)].map(m=>m[1]));
 const urls=new Set([...html.matchAll(/(?:src|href)="([^"<>]+)"/g)].map(m=>m[1]));
 for(const url of urls){
  if(/^(https?:|mailto:|data:)/.test(url))continue;
  if(url.startsWith('#')){assert.ok(ids.has(url.slice(1)),url);continue;}
  assert.ok(!url.startsWith('/'),`Root-relative path: ${url}`);
  await fs.access(url.split('?')[0]);
 }
 assert.equal((await fs.readFile('CNAME','utf8')).trim(),'artifactsbygene.com');
 assert.match(html,/<title>Artifacts by Gene<\/title>/);
 const social=html.match(/property="og:image" content="https:\/\/artifactsbygene.com\/([^"]+)"/);
 assert.ok(social);await fs.access(social[1]);
 assert.doesNotMatch(html,/C:[\\/]|<canvas|<iframe|experience\.js|image-viewer\.js|three years|I built|WebGL/i);
 assert.match(html,/Built against inefficiency\./);
 assert.match(html,/mailto:weigenekhor@gmail\.com/);
 assert.match(html,/https:\/\/www.linkedin.com\/in\/weigenekhor\//);
});

test('Mode and theme switch independently; captures follow theme and blocked storage is safe',async()=>{
 const events=[];
 const context={JSON,CustomEvent:class{constructor(name,options){this.detail=options.detail;}},localStorage:{getItem(){throw Error('Disabled');},setItem(){throw Error('Disabled');}},document:{querySelector(){return {textContent:JSON.stringify(model)};},querySelectorAll(){return [];},dispatchEvent(e){events.push(e);}}};
 vm.createContext(context);
 vm.runInContext((await fs.readFile('state.js','utf8')).replaceAll('export ',''),context);
 for(const [mode,theme] of [['legacy','pentimento'],['legacy','origin'],['pentimento','origin'],['pentimento','pentimento']]){
  const priorTheme=vm.runInContext('state.theme',context);
  vm.runInContext(`setEdition('${mode}');`,context);
  assert.equal(vm.runInContext('state.theme',context),priorTheme,'Mode must preserve theme');
  vm.runInContext(`setTheme('${theme}');setTheme('unknown');setEdition('unknown');`,context);
  assert.equal(vm.runInContext('state.theme',context),theme);
  assert.equal(vm.runInContext('state.mode',context),mode,'Theme must preserve mode');
  assert.ok(vm.runInContext('model.apps.every(app=>themedCaptures(app).length>0&&themedCaptures(app).every(c=>c.theme===state.theme))',context));
 }
 assert.equal(events.length,4);
 const count=events.length;vm.runInContext("setEdition('pentimento');setTheme('pentimento')",context);assert.equal(events.length,count);
 assert.equal(html.split('class="product-state"').length-1,1);
 assert.match(html,/data-theme="pentimento" data-mode="pentimento"/);
});

test('Native panel cache coalesces first decode, reuses ready imagery and evicts old entries',async()=>{
 const {createPanelCache}=await import('../panel-cache.js');
 const calls=[];const cache=createPanelCache(async key=>{calls.push(key);if(key==='bad')throw Error('missing');return {key};},2);
 const first=cache.get('a');assert.equal(cache.get('a'),first);await first.promise;
 assert.equal(first.ready,true);assert.equal(cache.get('a').image,first.image);
 await cache.get('b').promise;cache.get('a');await cache.get('c').promise;
 assert.equal(cache.size,2);assert.deepEqual(calls,['a','b','c']);
 await cache.get('b').promise;assert.deepEqual(calls,['a','b','c','b']);
 await assert.rejects(cache.get('bad').promise);await assert.rejects(cache.get('bad').promise);
 assert.equal(calls.filter(x=>x==='bad').length,2);
});

test('Carousel touch intent preserves vertical scroll and ignores mouse/cancelled gestures',async()=>{
 const source=await fs.readFile('gallery.js','utf8');
 const handlers={},moves=[];
 const element={dataset:{},addEventListener(name,handler){handlers[name]=handler;}};
 const context={element,moves,setTimeout(fn){fn();}};vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('function swipe('),source.indexOf('const observer='))+"swipe(element,direction=>moves.push(direction));",context);
 const start=()=>handlers.pointerdown({pointerType:'touch',clientX:180,clientY:200});
 start();handlers.pointerup({clientX:172,clientY:450});assert.equal(moves.length,0);
 start();handlers.pointerup({clientX:70,clientY:205});assert.deepEqual(moves,[1]);
 start();handlers.pointerup({clientX:295,clientY:195});assert.deepEqual(moves,[1,-1]);
 start();handlers.pointercancel();handlers.pointerup({clientX:50,clientY:200});assert.equal(moves.length,2);
 handlers.pointerdown({pointerType:'mouse',clientX:180,clientY:200});handlers.pointerup({clientX:50,clientY:200});assert.equal(moves.length,2);
});

test('Autoplay pauses for visibility, interaction, loading, modal and reduced motion',async()=>{
 const source=await fs.readFile('gallery.js','utf8');
 const context={document:{hidden:false},viewer:{open:false},reduced:{matches:false}};vm.createContext(context);
 vm.runInContext(source.slice(source.indexOf('function eligible('),source.indexOf('function schedule(')),context);
 const card={app:{images:[{},{}]},visible:true,paused:false,hovered:false,focused:false,loading:false};context.card=card;
 const eligible=()=>vm.runInContext('eligible(card)',context);
 assert.equal(eligible(),true);
 for(const key of ['paused','hovered','focused','loading']){card[key]=true;assert.equal(eligible(),false,key);card[key]=false;}
 card.visible=false;assert.equal(eligible(),false);card.visible=true;
 context.viewer.open=true;assert.equal(eligible(),false);context.viewer.open=false;
 context.document.hidden=true;assert.equal(eligible(),false);context.document.hidden=false;
 context.reduced.matches=true;assert.equal(eligible(),false);
});

test('Every native panel geometry keeps its source cards accessible and aligned',async()=>{
 const references=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 assert.equal(Object.keys(references).length,16);
 for(const [key,ref] of Object.entries(references)){
  const [,mode]=key.split('-');
  const expected=model.expeditions.filter(e=>e.mode===mode).flatMap(e=>e.apps).map(id=>model.apps.find(a=>a.id===id).sourceKey);
  assert.deepEqual(ref.cards.map(card=>card.key),expected);
  for(const [suffix,width,height,density] of [['field',ref.width,ref.height,1],['light',ref.width,ref.height,1],['content',ref.contentWidth,ref.contentHeight,2]]){
   const meta=await sharp(`assets/native/layouts/${key}-${suffix}.webp`).metadata();
   assert.equal(meta.width,width*density);assert.equal(meta.height,height*density);
  }
  assert.ok(ref.wafer.size>0&&Number.isFinite(ref.wafer.x)&&Number.isFinite(ref.wafer.y),key);
  assert.ok(ref.wafer.originX>0&&ref.wafer.originX<100&&ref.wafer.originY>0&&ref.wafer.originY<100);
  for(const card of ref.cards){
   assert.ok(card.x>=0&&card.y>=0&&card.x+card.width<=ref.contentWidth&&card.y+card.height<=ref.contentHeight,key+' '+card.key);
   const hover=await sharp(`assets/native/layouts/${key}-${card.key}.webp`).metadata();
   assert.equal(hover.width,card.width*2);assert.equal(hover.height,card.height*2);
  }
 }
 const body=html.slice(html.indexOf('<section class="principles'));
 assert.doesNotMatch(body,/data-select-mode|data-cycle-mode|data-theme-choice|gallery-expedition/);
});

test('Native details assets match all available tools and retain readable, bounded motion areas',async()=>{
 const references=JSON.parse(await fs.readFile('content/panel-reference.json','utf8'));
 for(const theme of ['origin','pentimento'])for(const mode of model.modes){
  for(const id of model.expeditions.filter(e=>e.mode===mode.id).flatMap(e=>e.apps)){
   const key=`${theme}-${mode.id}-${model.apps.find(a=>a.id===id).sourceKey}`,ref=references[key];
   assert.ok(ref,key);assert.equal(ref.width,372);assert.equal(ref.height,565);
   const meta=await sharp(`assets/native/panels/${key}.webp`).metadata();
   assert.equal(meta.width,744);assert.equal(meta.height,1130);
   const motion=await sharp(`assets/native/panels/${key}-motion.webp`,{animated:true}).metadata();
   assert.ok((motion.pages||1)<=32);
   if(motion.delay)assert.equal(motion.delay.reduce((sum,time)=>sum+time,0),1792);
   assert.equal(motion.width,ref.motion.width*2);
   assert.ok(ref.motion.x>=0&&ref.motion.y>=0&&ref.motion.x+ref.motion.width<=372&&ref.motion.y+ref.motion.height<=565,key);
  }
 }
});

test('Hover positioning keeps full panels inside small, landscape and desktop viewports',async()=>{
 const {panelPosition}=await import('../native-home.js');
 for(const [vw,vh] of [[390,844],[844,390],[1280,900],[2560,1440]]){
  const scale=Math.min(1,(vw-32)/372),w=372*scale,h=Math.min(565*scale,vh-32);
  for(const [x,y] of [[0,0],[vw/2,vh/2],[vw-40,vh-40]]){
   const point=panelPosition({left:x,right:x+40,top:y,height:40},{left:0,top:0,right:vw,bottom:vh},w,h);
   assert.ok(point.x>=12&&point.y>=12&&point.x+w<=vw-12+.001&&point.y+h<=vh-12+.001);
  }
 }
});

test('Hero inspection cannot launch screenshot pages and closing credit contains only approved content',async()=>{
 const shell=await fs.readFile('native-shell.js','utf8');
 assert.doesNotMatch(shell,/openApp|showCapture|data-open-app|product-capture/);
 assert.doesNotMatch(html,/Artifacts for Gene/);
 assert.match(html,/data-product-status>Pentimento</);
 const credit=html.slice(html.indexOf('<section class="authorship'),html.indexOf('<footer class="ending'));
 const words=credit.replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 assert.equal(words,'BUILT BY GENE The work is personal. The standard isn’t. Wei Gene Khor | artifactsbygene.com Email LinkedIn');
});

test('Gallery body clicks advance while the dedicated expand control remains separate',async()=>{
 const card=html.slice(html.indexOf('<article class=\"gallery-app'),html.indexOf('</article>')+10);
 assert.match(card,/class=\"open-capture\" data-lightbox/);
 assert.match(card,/class=\"gallery-image\" data-advance/);
 assert.doesNotMatch(card,/class=\"gallery-image\" data-lightbox/);
 const source=await fs.readFile('gallery.js','utf8');
 assert.match(source,/card\.imageButton\.addEventListener\('click',\(\)=>[^;]*manual\(card,1\)/s);
 assert.match(source,/event\.stopPropagation\(\)/);
 assert.match(source,/positions:\{\}/);
});

test('Thinking graphics use one coordinated motion controller and native windows remain pointer-active',async()=>{
 const source=await fs.readFile('experience-motion.js','utf8');
 const motion=await fs.readFile('thinking-motion.js','utf8');
 const shell=await fs.readFile('shell.css','utf8');
 assert.match(source,/animateThinking\(cycle\)/);
 assert.match(motion,/One score, one playhead/);
 assert.match(motion,/signal\('\.reference-signal'/);
 assert.match(motion,/signal\('\.structure-link'/);
 assert.match(motion,/\.sheet-\$\{i\}/);
 assert.match(source,/productVisibility\.observe\(product\)/);
 assert.match(source,/setPointerCapture/);
 assert.doesNotMatch(shell,/\.app-shell\{pointer-events:none\}/);
});

test('Requested gallery emphasis, exact supporting copy and theme-free captions survive the build',()=>{
 assert.deepEqual(model.apps.filter(app=>app.featured).map(app=>app.id),['topotracer','gan-met-compiler','gan-temp-diagnoser','aix-dt-assistant','metria-spc','data-lens']);
 assert.match(html,/A coherent system of tools for analysis, diagnosis, automation, and engineering workflows\./);
 for(const caption of html.matchAll(/<span data-slide-caption>(.*?)<\/span>/g))assert.doesNotMatch(caption[1],/Origin|Pentimento/);
 assert.doesNotMatch(html,/data-shell=|app-workspace|shellPath/);
});
