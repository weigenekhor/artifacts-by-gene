import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createPanelMovies} from '../panel-movies.js';

function fixture(){
 const loads=[],attached=[],pending=new Map(),signals=new Map();let allowed=true;
 const player=createPanelMovies({allowed:()=>allowed,load:(key,signal)=>{
  signals.set(key,signal);
  loads.push(key);return new Promise((resolve,reject)=>pending.set(key,{resolve,reject}));
 },attach:image=>attached.push(image)});
 function ready(key){const image={key,style:{},hidden:true,removals:0,clears:0,
  remove(){this.removals++;},removeAttribute(name){assert.equal(name,'src');this.clears++;}};
  pending.get(key).resolve(image);return image;
 }
 return {player,loads,attached,pending,ready,signals,disable(){allowed=false;}};
}

test('Warm, show and repeat hover reuse the same decoded movie and geometry',async()=>{
 const f=fixture();f.player.warm('a');const image=f.ready('a');await Promise.resolve();
 assert.equal(await f.player.show('a',{left:'5%',width:'90%'}),true);
 assert.equal(f.attached[0],image);assert.equal(image.style.width,'90%');
 f.player.hide();assert.equal(image.hidden,true);assert.equal(image.clears,0);
 await f.player.show('a',{width:'80%'});
 assert.deepEqual(f.loads,['a']);assert.equal(f.attached[1],image);assert.equal(image.style.width,'80%');
});

test('Late loads cannot replace a new card or reopen a dismissed panel',async()=>{
 const f=fixture();const a=f.player.show('a',{}),b=f.player.show('b',{});
 const image=f.ready('b');assert.equal(await b,true);
 f.ready('a');assert.equal(await a,false);assert.deepEqual(f.attached,[image]);
 const c=f.player.show('c',{});f.player.hide();f.ready('c');assert.equal(await c,false);
 assert.deepEqual(f.attached,[image]);
});

test('Bounded movie cache protects visible movie and releases evicted and late images',async()=>{
 const f=fixture();const a=f.player.show('a',{});const visible=f.ready('a');await a;
 f.player.warm('b');const b=f.ready('b');await Promise.resolve();f.player.warm('c');
 assert.equal(f.player.size,2);assert.equal(b.clears,1);assert.equal(visible.clears,0);
 assert.equal(f.signals.get('b').aborted,true);assert.equal(f.signals.get('a').aborted,false);
 f.player.clear();assert.equal(visible.clears,1);assert.equal(f.player.size,0);
 const late=f.ready('c');await Promise.resolve();assert.equal(late.clears,1);assert.equal(f.player.size,0);
 assert.equal(f.signals.get('c').aborted,true);
});

test('Failure can retry; reduced motion and hidden documents never attach a movie',async()=>{
 const f=fixture();const a=f.player.show('a',{});f.pending.get('a').reject(Error('missing'));
 assert.equal(await a,false);assert.equal(f.player.size,0);
 const retry=f.player.show('a',{});f.disable();f.ready('a');assert.equal(await retry,false);
 f.player.warm('b');assert.equal(await f.player.show('c',{}),false);
 assert.deepEqual(f.loads,['a','a']);assert.deepEqual(f.attached,[]);
});

test('Hero keeps geometry, low-motion fallback, visibility cleanup and current asset URL',async()=>{
 const source=await fs.readFile('native-shell.js','utf8');
 assert.match(source,/allowed:\(\)=>!reduced.matches&&!document.hidden/);
 assert.match(source,/motion.webp\?v=20261025-fluid-movies/);
 assert.match(source,/movies.show\(key,\{left:`\$\{ref.motion.x\/372\*100\}%`/);
 assert.match(source,/if\(document.hidden\)\{closeDetails\(\);movies.clear\(\);\}/);
 assert.match(source,/reduced.addEventListener\('change',\(\)=>\{closeDetails\(\);movies.clear\(\);\}\)/);
 assert.doesNotMatch(source,/motionCache|warmMotion|motionReady/);
});

test('Every mapped movie has audited bytes, retained dimensions and matching native scene samples',async()=>{
 const refs=JSON.parse(await fs.readFile('content/panel-reference.json','utf8'));
 const manifest=JSON.parse(await fs.readFile('content/panel-motion-manifest.json','utf8'));
 assert.deepEqual(Object.keys(manifest).sort(),Object.keys(refs).sort());
 let dense=0,preserved=0;
 for(const [key,entry] of Object.entries(manifest)){
  const bytes=await fs.readFile(`assets/native/panels/${key}-motion.webp`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,key);
  assert.equal(bytes.length,entry.bytes);assert.equal(entry.width,refs[key].motion.width*2);
  assert.equal(entry.height,refs[key].motion.height*2);
  assert.equal(entry.baseline_phase_rmse.length,4);
  assert.ok(entry.baseline_phase_rmse.every(value=>value<2),key);
  if(entry.preserved_discrete_or_static){preserved++;assert.ok(entry.baseline_phase_rmse.every(value=>value===0));}
  else{dense++;assert.equal(entry.frames,112);assert.equal(entry.frame_ms,16);}
 }
 assert.equal(dense,69);assert.equal(preserved,12);
});
