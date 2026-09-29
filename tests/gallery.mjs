import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source=await fs.readFile('gallery.js','utf8');
function fixture(reduced=false){
 let observer,mutation,id=0;
 const timers=new Map(),loads=[];
 const element=()=>({listeners:{},attrs:{},hidden:false,inert:false,classes:new Set(),textContent:'',
   addEventListener(type,handler){this.listeners[type]=handler},setAttribute(k,v){this.attrs[k]=v},
   animate(){return {cancel(){}}},
   get classList(){return {contains:k=>this.classes.has(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)}},
   focus(){document.activeElement=this}});
 const slides=Array.from({length:3},(_,i)=>{const slide=element();slide.dataset={name:'Data Lens'};slide.hidden=i>0;
   slide.image={loading:'lazy',decode:()=>new Promise((resolve,reject)=>loads.push({resolve,reject}))};
   slide.querySelector=()=>slide.image;return slide;});
 slides[0].classes.add('is-active');
 const controls=element(),play=element(),count=element(),progress=element(),previous=element(),next=element(),stage=element(),root=element(),modal=element();
 const lookup={'.gallery-controls':controls,'.gallery-play':play,'.gallery-count':count,'.gallery-progress span':progress,'.gallery-previous':previous,'.gallery-next':next,'.capture-slides':stage};
 const gallery=element();gallery.querySelector=s=>lookup[s];gallery.querySelectorAll=()=>slides;gallery.contains=e=>[...slides,play,previous,next].includes(e);
 const motion={matches:reduced,addEventListener(k,fn){this.change=fn}};
 const document={hidden:false,activeElement:null,documentElement:root,querySelectorAll:()=>[gallery],querySelector:()=>modal,listeners:{},addEventListener(k,fn){this.listeners[k]=fn}};
 vm.runInNewContext(source,{document,matchMedia:()=>motion,
  IntersectionObserver:class{constructor(fn){observer=fn}observe(){}},MutationObserver:class{constructor(fn){mutation=fn}observe(){}},
  setTimeout:(fn,delay)=>{timers.set(++id,{fn,delay});return id},clearTimeout:id=>timers.delete(id)});
 return {slides,play,count,previous,next,stage,gallery,timers,loads,document,motion,root,
  enter:()=>observer([{isIntersecting:true,intersectionRatio:1}]),leave:()=>observer([{isIntersecting:false,intersectionRatio:0}]),
  mutate:()=>mutation(),auto:()=>[...timers.values()].filter(t=>t.delay===5500),
  fire:()=>{for(const [i,t] of timers)if(t.delay===5500){timers.delete(i);t.fn();break}},
  resolve:async i=>{loads[i].resolve();await Promise.resolve();await Promise.resolve();}};
}
const f=fixture();
assert.equal(f.auto().length,0,'Offscreen gallery must sleep');f.enter();assert.equal(f.auto().length,1);
f.fire();await f.resolve(0);assert.ok(f.slides[1].classes.has('is-active'));assert.ok(f.slides[0].inert);assert.equal(f.count.textContent,'02 / 03');
f.gallery.listeners.pointerenter({pointerType:'mouse'});assert.equal(f.auto().length,0);
f.gallery.listeners.pointerleave();assert.equal(f.auto().length,1);
f.document.hidden=true;f.document.listeners.visibilitychange();assert.equal(f.auto().length,0);
f.document.hidden=false;f.document.listeners.visibilitychange();assert.equal(f.auto().length,1);
f.root.classes.add('viewer-open');f.mutate();assert.equal(f.auto().length,0);
f.root.classes.delete('viewer-open');f.mutate();assert.equal(f.auto().length,1);
f.next.listeners.click();await f.resolve(1);assert.equal(f.count.textContent,'03 / 03');assert.equal(f.auto().length,0,'Manual navigation pauses');
f.next.listeners.click();f.next.listeners.click();await f.resolve(3);await f.resolve(2);assert.equal(f.count.textContent,'02 / 03','Late decode must not override newer navigation');
f.gallery.listeners.keydown({key:'ArrowLeft',preventDefault(){}});await f.resolve(4);assert.equal(f.count.textContent,'01 / 03');
f.stage.listeners.pointerdown({pointerType:'touch',clientX:220,clientY:100});f.stage.listeners.pointerup({clientX:120,clientY:102});await f.resolve(5);
let suppressed=false;f.stage.listeners.click({preventDefault(){},stopImmediatePropagation(){suppressed=true}});assert.ok(suppressed,'Swipe must not open viewer');
f.play.listeners.click();assert.equal(f.auto().length,1);f.leave();assert.equal(f.auto().length,0);
const r=fixture(true);r.enter();assert.equal(r.auto().length,0,'Reduced motion starts manual');r.next.listeners.click();await r.resolve(0);assert.equal(r.count.textContent,'02 / 03');
console.log('PASS: slideshow playback, offscreen/hover/modal/hidden suspension, keyboard, swipe, race protection and reduced motion.');
