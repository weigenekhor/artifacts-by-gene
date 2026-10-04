import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import sharp from 'sharp';

const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const html=await fs.readFile('index.html','utf8');

test('Actual source membership: 15 Legacy, 10 Pentimento, 17 distinct apps',()=>{
 const ids=new Set(model.apps.map(a=>a.id));
 assert.equal(ids.size,17);
 for(const [mode,count] of [['legacy',15],['pentimento',10]]){
  const members=model.expeditions.filter(e=>e.mode===mode).flatMap(e=>e.apps);
  assert.equal(new Set(members).size,count);
  members.forEach(id=>assert.ok(ids.has(id),id));
 }
 assert.deepEqual(new Set(model.expeditions.flatMap(e=>e.apps)),ids);
 for(const app of model.apps)assert.equal(html.split(`data-page="${app.id}"`).length-1,1,app.name);
});

test('All 58 explicitly mapped captures decode, preserve composition and have no missing derivatives',async()=>{
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
 assert.equal(names.size,58);
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
 assert.match(html,/Built for engineering that has to be right\./);
 assert.match(html,/mailto:weigenekhor@gmail\.com/);
 assert.match(html,/https:\/\/www.linkedin.com\/in\/weigenekhor\//);
});

test('Single theme and edition state synchronizes all controls, survives unavailable storage and rejects unknown values',async()=>{
 const events=[],buttons=['origin','pentimento'].flatMap(theme=>Array.from({length:3},()=>({dataset:{themeChoice:theme},setAttribute(k,v){this[k]=v;}})));
 const modeButtons=['legacy','pentimento'].map(mode=>({dataset:{selectMode:mode},setAttribute(k,v){this[k]=v;}}));
 const root={dataset:{theme:'pentimento',mode:'pentimento'}};
 const context={JSON,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},localStorage:{setItem(){throw Error('Disabled storage');}},document:{documentElement:root,querySelector(s){return s==='#artifacts-data'?{textContent:JSON.stringify(model)}:{};},querySelectorAll(s){return s==='[data-theme-choice]'?buttons:modeButtons;},addEventListener(){},dispatchEvent(e){events.push(e);}}};
 vm.createContext(context);
 vm.runInContext((await fs.readFile('state.js','utf8')).replaceAll('export ',''),context);
 vm.runInContext("setTheme('origin');setMode('legacy');setTheme('unknown');setMode('unknown');",context);
 assert.equal(root.dataset.theme,'origin');assert.equal(root.dataset.mode,'legacy');
 buttons.forEach(b=>assert.equal(b['aria-pressed'],String(b.dataset.themeChoice==='origin')));
 modeButtons.forEach(b=>assert.equal(b['aria-pressed'],String(b.dataset.selectMode==='legacy')));
 assert.equal(events.at(-1).type,'mode-change');
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
 const card={visible:true,paused:false,hovered:false,focused:false,loading:false};context.card=card;
 const eligible=()=>vm.runInContext('eligible(card)',context);
 assert.equal(eligible(),true);
 for(const key of ['paused','hovered','focused','loading']){card[key]=true;assert.equal(eligible(),false,key);card[key]=false;}
 card.visible=false;assert.equal(eligible(),false);card.visible=true;
 context.viewer.open=true;assert.equal(eligible(),false);context.viewer.open=false;
 context.document.hidden=true;assert.equal(eligible(),false);context.document.hidden=false;
 context.reduced.matches=true;assert.equal(eligible(),false);
});
