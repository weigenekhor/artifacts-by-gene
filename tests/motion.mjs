import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile("chapter-motion.js", "utf8");
function fixture({reduce=false, wide=true}={}) {
  const listeners = new Map(), frames = new Map(), classes = new Set();
  let sequence=0, time=0, measurements=0;
  const style = () => {
    const values = new Map();
    return {values,setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)};
  };
  const stage = {style:style(),removeAttribute:()=>stage.style.values.clear(),getBoundingClientRect:()=>{measurements++;return {height:900};}};
  const container = {getBoundingClientRect:()=>{measurements++;return {left:64,width:1312};}};
  const hero = {getBoundingClientRect:()=>{measurements++;return {top:80-context.scrollY,height:1485};},querySelector:()=>container};
  const image = {style:style()};
  const beat = {dataset:{motion:"chapter"},style:style(),nextElementSibling:{querySelector:()=>image},
    getBoundingClientRect:()=>{measurements++;return {top:1900-context.scrollY};}};
  const reduced={matches:reduce,addEventListener:(_,fn)=>listeners.set("reduced",fn)};
  const desktop={matches:wide,addEventListener:(_,fn)=>listeners.set("desktop",fn)};
  const context=vm.createContext({
    matchMedia:q=>q.includes("reduced-motion")?reduced:desktop,
    innerHeight:900,innerWidth:1440,scrollY:0,
    requestAnimationFrame:fn=>{const id=++sequence;frames.set(id,fn);return id;},
    cancelAnimationFrame:id=>frames.delete(id),
    addEventListener:(k,fn)=>listeners.set(k,fn),
    document:{hidden:false,
      documentElement:{classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k)}},
      querySelector:selector=>selector===".hero"?hero:stage,querySelectorAll:()=>[beat],
      fonts:{ready:{then:fn=>fn()}},addEventListener:(k,fn)=>listeners.set(k,fn)}
  });
  vm.runInContext(source,context);
  function settle(){
    let count=0;
    while(frames.size){
      assert.ok(count++<100,"Animation must sleep after settling");
      const pending=[...frames.values()];frames.clear();time+=16;pending.forEach(fn=>fn(time));
    }
    return count;
  }
  return {context,listeners,frames,classes,stage,beat,image,reduced,desktop,settle,measurements:()=>measurements};
}
const normal=fixture();
normal.settle();
assert.ok(normal.classes.has("motion-hero"));
const firstX=parseFloat(normal.stage.style.values.get("--image-x"));
const measured=normal.measurements();
normal.context.scrollY=400;normal.listeners.get("scroll")();normal.listeners.get("scroll")();
assert.equal(normal.frames.size,1,"Scroll events share one frame");
assert.ok(normal.settle()>1,"Scroll response is damped");
assert.ok(parseFloat(normal.stage.style.values.get("--image-x"))<firstX);
assert.equal(normal.stage.style.values.get("--title-opacity"),"0.0000","Identity clears before the fact enters its space");
assert.equal(normal.measurements(),measured,"No layout reads during scroll");
normal.context.scrollY=1800;normal.listeners.get("scroll")();normal.settle();
assert.equal(normal.stage.style.values.get("--hero-surface"),"23 25 28");
assert.equal(normal.image.style.values.get("--entry"),"1.0000");
normal.context.scrollY=0;normal.listeners.get("scroll")();normal.settle();
assert.equal(parseFloat(normal.stage.style.values.get("--image-x")),firstX,"Reverse scroll uses the same composition");
normal.context.document.hidden=true;normal.listeners.get("visibilitychange")();normal.listeners.get("scroll")();
assert.equal(normal.frames.size,0,"Hidden tabs do not render");
normal.reduced.matches=true;normal.listeners.get("reduced")();
assert.equal(normal.classes.size,0);assert.equal(normal.stage.style.values.size,0);assert.equal(normal.beat.style.values.size,0);
assert.equal(fixture({reduce:true}).frames.size,0,"Reduced motion never starts a timeline");
const narrow=fixture({wide:false});narrow.settle();
assert.equal(narrow.classes.size,0);assert.equal(narrow.stage.style.values.size,0,"Mobile hero remains in natural flow");
console.log("PASS: bounded hero, reversible progress, batched frames, cached geometry, idle/hidden suspension and reduced-motion restoration.");
