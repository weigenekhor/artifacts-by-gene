import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {principles} from '../scripts/principles.mjs';

test('Every thinking figure has a closing sentence and the requested hero introduction',async()=>{
 for(const principle of principles)assert.ok(principle.handoff?.endsWith('.'));
 const html=await fs.readFile('index.html','utf8');
 assert.match(html,/ARTIFACTS \/ 19 APPLICATIONS BUILT AGAINST INEFFICIENCY/);
 assert.equal((html.match(/class="reasoning-handoff"/g)||[]).length,3);
 assert.match(html,/class="info-header"><span>Application Info<\/span>/);
});

test('Thinking timelines are bounded, visible, synchronized and honor reduced motion',async()=>{
 const source=(await fs.readFile('thinking-motion.js','utf8')).replace('export function','function');
 const tracks=[];let sync,change,disconnected=false,removed=false;
 const reduced={matches:false,addEventListener:(name,fn)=>change=fn,removeEventListener:()=>removed=true};
 const cycle={dataset:{motion:'running',revealed:'true'},querySelector:selector=>({animate:(frames,options)=>{
  const track={selector,frames,options,currentTime:0,pause(){this.playing=false;},play(){this.playing=true;},cancel(){this.cancelled=true;}};tracks.push(track);return track;
 }})};
 const context={matchMedia:()=>reduced,document:{timeline:{currentTime:100}},MutationObserver:class{constructor(fn){sync=fn;}observe(){}disconnect(){disconnected=true;}}};
 vm.createContext(context);vm.runInContext(source,context);context.cycle=cycle;vm.runInContext('dispose=animateThinking(cycle)',context);
 assert.ok(tracks.length>=25);
 for(const t of tracks){assert.equal(t.options.duration,6000);assert.equal(t.playing,true);assert.equal(t.startTime,100);let last=-1;for(const f of t.frames){assert.ok(f.offset>=last&&f.offset<=1,t.selector);last=f.offset;}}
 for(const selector of ['.layer-5','.block-left','.sheet-9'])assert.ok(tracks.find(t=>t.selector===selector).frames.some(f=>f.transform&&f.transform!=='none'));
 assert.ok(tracks.find(t=>t.selector==='.evidence-signal').frames.some(f=>f.opacity===1));
 cycle.dataset.motion='paused';sync();assert.ok(tracks.every(t=>!t.playing));
 reduced.matches=true;change();assert.ok(tracks.every(t=>!t.playing&&t.currentTime===5900));
 reduced.matches=false;cycle.dataset.motion='running';change();assert.ok(tracks.every(t=>t.playing&&t.currentTime===0));
 vm.runInContext('dispose()',context);assert.ok(disconnected&&removed&&tracks.every(t=>t.cancelled));
});

test('Information panel uses the current desktop width and separated titlebar',async()=>{
 const css=await fs.readFile('shell.css','utf8'),shell=await fs.readFile('native-shell.js','utf8');
 assert.match(css,/\.settings-drawer\{width:218px/);
 assert.match(css,/\.app-titlebar\{left:calc\(60px \+ var\(--panel-shift\)\)/);
 assert.match(css,/\.info-header\{height:44px/);
 assert.doesNotMatch(shell,/info\?240:0/);
 const layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 for(const [key,ref] of Object.entries(layouts)){
  const expected=key.endsWith('-information')?943:key.endsWith('-both')?763:key.endsWith('-navigation')?981:1161;
  assert.equal(ref.width,expected,key);
 }
});
