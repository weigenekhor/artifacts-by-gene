import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile('image-viewer.js','utf8');
function fixture(){
 const frames=new Map(),timers=new Map(),loads=[];let next=0,focused=null;
 const element=()=>({listeners:{},classes:new Set(),children:[],textContent:'',open:false,style:{setProperty(){}},
   addEventListener(k,fn){this.listeners[k]=fn},setAttribute(k,v){this[k]=v},
   replaceChildren(...v){this.children=v},focus(){focused=this},
   get classList(){return {add:k=>this.classes.add(k),remove:k=>this.classes.delete(k)}},
   showModal(){this.open=true},close(){this.open=false;this.listeners.close?.()}});
 const modal=element(),close=element(),slot=element(),status=element(),root=element(),button=element();
 modal.querySelector=s=>s==='.viewer-close'?close:s==='.viewer-image'?slot:status;
 button.dataset={name:'Met Compiler',full:'full.webp'};button.disabled=true;
 button.querySelector=()=>({alt:'Compiler evidence',currentSrc:'small.webp',getAttribute:k=>k==='width'?'5700':'3800'});
 const motion={matches:false,addEventListener(k,fn){this.change=fn}};
 const context=vm.createContext({scrollY:2200,matchMedia:()=>motion,
  document:{querySelector:()=>modal,querySelectorAll:()=>[button],documentElement:root},
  Image:class{decode(){return new Promise((resolve,reject)=>loads.push({resolve,reject,image:this}))}},
  requestAnimationFrame:fn=>{const id=++next;frames.set(id,fn);return id},cancelAnimationFrame:id=>frames.delete(id),
  setTimeout:fn=>{const id=++next;timers.set(id,fn);return id},clearTimeout:id=>timers.delete(id),
  scrollTo:({top})=>context.scrollY=top});
 vm.runInContext(source,context);
 return {modal,close,slot,status,root,button,context,frames,timers,loads,motion,
  focused:()=>focused,paint:()=>{for(let n=0;n<2;n++){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn())}},
  finish:()=>{const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())}};
}
const f=fixture();
assert.equal(f.button.disabled,false);
const first=f.button.listeners.click();f.paint();
assert.equal(f.modal.open,true);assert.equal(f.focused(),f.close);
assert.ok(f.root.classes.has('viewer-open'));assert.ok(f.modal.classes.has('is-visible'));
let prevented=false;f.modal.listeners.keydown({key:'Tab',preventDefault:()=>prevented=true});
assert.ok(prevented);assert.equal(f.focused(),f.close);
f.modal.listeners.click({target:f.slot.children[0]});assert.equal(f.timers.size,0,'Image click must not close');
f.modal.listeners.cancel({preventDefault:()=>{}});f.finish();
assert.equal(f.modal.open,false);assert.equal(f.focused(),f.button);assert.equal(f.context.scrollY,2200);
f.loads[0].resolve();await first;assert.equal(f.slot.children.length,0,'Late decode cannot revive a dismissed image');
const second=f.button.listeners.click();f.paint();f.loads[1].image.naturalWidth=5700;f.loads[1].resolve();await second;
assert.equal(f.slot.children[0].src,'full.webp');assert.equal(f.status.textContent,'');
f.modal.listeners.click({target:f.slot});f.finish();assert.equal(f.modal.open,false,'Backdrop closes');
f.motion.matches=true;
const third=f.button.listeners.click();f.close.listeners.click();
assert.equal(f.modal.open,false);assert.equal(f.frames.size,0,'Closing cancels queued opening frames');
f.loads[2].reject();await third;
assert.ok(!f.root.classes.has('viewer-open'));assert.equal(f.focused(),f.button);
console.log('PASS: viewer focus containment/restoration, scroll lock, close paths, inside-image clicks, reduced motion and stale decode cancellation.');
