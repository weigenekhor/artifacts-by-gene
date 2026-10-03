import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
const source=await fs.readFile("image-viewer.js","utf8");
function fixture(){
 const frames=new Map(),timers=new Map(),loads=[];let next=0,focused=null;
 const el=()=>({listeners:{},attrs:{},classes:new Set(),children:[],textContent:"",open:false,style:{setProperty(){}},
 addEventListener(k,fn){this.listeners[k]=fn},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},
 replaceChildren(...v){this.children=v},focus(){focused=this},
 get classList(){return {add:k=>this.classes.add(k),remove:k=>this.classes.delete(k),contains:k=>this.classes.has(k),toggle:(k,on)=>on?this.classes.add(k):this.classes.delete(k)}},
 showModal(){this.open=true},close(){this.open=false;this.listeners.close?.()}});
 const modal=el(),close=el(),zoom=el(),slot=el(),status=el(),title=el(),root=el(),button=el();
 modal.querySelector=s=>({".viewer-close":close,".viewer-zoom":zoom,".viewer-image":slot,".viewer-status":status,".viewer-name":title})[s];
 slot.querySelector=()=>slot.children[0];
 button.dataset={name:"Data Lens",full:"full.webp"};button.disabled=true;
 button.querySelector=()=>({alt:"Wafer maps",currentSrc:"small.webp",getAttribute:k=>k==="width"?"10240":"5520"});
 const motion={matches:false,addEventListener(k,fn){this.change=fn}};
 const context=vm.createContext({scrollY:2200,innerWidth:1440,matchMedia:()=>motion,
 document:{querySelector:()=>modal,querySelectorAll:()=>[button],documentElement:root},
 Image:class{decode(){return new Promise((resolve,reject)=>loads.push({resolve,reject,image:this}))}},
 requestAnimationFrame:fn=>{const id=++next;frames.set(id,fn);return id},cancelAnimationFrame:id=>frames.delete(id),
 setTimeout:fn=>{const id=++next;timers.set(id,fn);return id},clearTimeout:id=>timers.delete(id),scrollTo:({top})=>context.scrollY=top});
 vm.runInContext(source,context);
 return {modal,close,zoom,slot,status,title,root,button,context,frames,timers,loads,motion,focused:()=>focused,
 paint(){for(let n=0;n<2;n++){const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn())}},
 finish(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())}};
}
const f=fixture();
assert.equal(f.button.disabled,false);
const firstOpen=f.button.listeners.click();f.paint();
assert.equal(f.modal.open,true);assert.equal(f.focused(),f.close);assert.equal(f.title.textContent,"Data Lens");
assert.ok(f.root.classes.has("modal-open"));
f.zoom.listeners.click();assert.ok(f.slot.classes.has("is-zoomed"));assert.equal(f.zoom.attrs["aria-pressed"],"true");
f.zoom.listeners.click();assert.ok(!f.slot.classes.has("is-zoomed"));
f.modal.listeners.cancel({preventDefault(){}});f.finish();
assert.equal(f.modal.open,false);assert.equal(f.focused(),f.button);assert.equal(f.context.scrollY,2200);
f.loads[0].resolve();await firstOpen;assert.equal(f.slot.children.length,0,"Stale original cannot revive a closed dialog");
const secondOpen=f.button.listeners.click();f.paint();f.loads[1].image.naturalWidth=10240;f.loads[1].image.naturalHeight=5520;f.loads[1].resolve();await secondOpen;
assert.equal(f.slot.children[0].src,"full.webp");assert.equal(f.status.textContent,"");
f.slot.listeners.click({target:f.slot});f.finish();assert.equal(f.modal.open,false);
f.motion.matches=true;const thirdOpen=f.button.listeners.click();f.close.listeners.click();
assert.equal(f.modal.open,false);assert.equal(f.frames.size,0);assert.ok(!f.root.classes.has("modal-open"));
f.loads[2].reject();await thirdOpen;
console.log("PASS: selected original, fit/zoom, Escape, backdrop, focus and scroll restoration, stale decoding and reduced-motion close.");

