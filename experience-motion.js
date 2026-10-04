import {state,setEdition} from './state.js';
import {animateThinking} from './thinking-motion.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover: hover) and (pointer: fine)');
const narrow=matchMedia('(max-width:760px)');
const compact=matchMedia('(max-width:1100px)');
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const smooth=value=>{value=clamp(value);return value*value*(3-2*value);};
const lifetime=new AbortController(),options={signal:lifetime.signal};
const disposals=[];

// One damped sample drives each field. Leaving the hero retains focus instead of reversing it.
function proximity(surface,update,{initial=.5,retain=false,geometry=surface,allowPointer=()=>true}={}){
 let bounds,visible=false,inside=false,frame=0,last=0,x=initial,y=.5,tx=x,ty=y;
 function render(now){
  frame=0;const dt=Math.min(40,now-last||16);last=now;
  const amount=1-Math.exp(-dt/82);x+=(tx-x)*amount;y+=(ty-y)*amount;
  update(x,y,inside);
  if(Math.abs(tx-x)+Math.abs(ty-y)>.0003)schedule();
 }
 function schedule(){if(!frame&&visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(render);}
 function measure(){bounds=geometry.getBoundingClientRect();}
 function pointer(event){
  if(!allowPointer(event)||!fine.matches||reduced.matches||event.pointerType==='touch')return;
  inside=true;if(!bounds)measure();
  tx=clamp((event.clientX-bounds.left)/bounds.width);ty=clamp((event.clientY-bounds.top)/bounds.height);schedule();
 }
 surface.addEventListener('pointerenter',event=>{measure();pointer(event);},options);
 surface.addEventListener('pointermove',pointer,{...options,passive:true});
 surface.addEventListener('pointerleave',()=>{inside=false;if(!retain){tx=.5;ty=.5;}schedule();},options);
 const resize=new ResizeObserver(()=>{bounds=null;});resize.observe(geometry);
 window.addEventListener('scroll',()=>{bounds=null;},{...options,passive:true});
 function sync(){
  const running=visible&&!document.hidden&&!reduced.matches;
  surface.dataset.motion=running?'running':'paused';
  if(!running){cancelAnimationFrame(frame);frame=0;}
  else{last=0;schedule();}
  if(reduced.matches){x=tx;y=ty;update(x,y,false);}
 }
 const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});observer.observe(geometry);
 document.addEventListener('visibilitychange',sync,options);reduced.addEventListener('change',sync,options);
 disposals.push(()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();});
 update(x,y,false);
 return {settle(value){tx=value;ty=.5;if(reduced.matches){x=tx;update(x,y,false);}else schedule();},get inside(){return inside;}};
}

const heroElement=document.querySelector('.hero'),product=heroElement.querySelector('.product-duet');
let heroX=.5,heroY=.5,targetX=.5,targetY=.5,raf=0;
function heroFrame(now){raf=0;const dt=Math.min(40,now-(heroFrame.last||now));heroFrame.last=now;const ease=1-Math.exp(-dt/48);heroX+=(targetX-heroX)*ease;heroY+=(targetY-heroY)*ease;product.style.setProperty('--hero-rotate-y',`${(heroX-.5)*.8}deg`);product.style.setProperty('--hero-rotate-x',`${(.5-heroY)*.45}deg`);product.style.setProperty('--hero-shift-x',`${(heroX-.5)*3}px`);product.style.setProperty('--hero-shift-y',`${(heroY-.5)*2}px`);if(Math.abs(targetX-heroX)+Math.abs(targetY-heroY)>.0005&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(heroFrame);}
function scheduleHero(){if(!raf&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(heroFrame);}
if(fine.matches){heroElement.addEventListener('pointermove',e=>{const r=product.getBoundingClientRect();targetX=clamp((e.clientX-r.left)/r.width);targetY=clamp((e.clientY-r.top)/r.height);scheduleHero();},{passive:true,signal:options.signal});heroElement.addEventListener('pointerleave',()=>{targetX=.5;targetY=.5;scheduleHero();},{signal:options.signal});}
product.style.setProperty('--hero-rotate-y','0deg');product.style.setProperty('--hero-rotate-x','0deg');
const motionObserver=new MutationObserver(()=>{product.dataset.motion=heroElement.dataset.motion;});motionObserver.observe(heroElement,{attributes:true,attributeFilter:['data-motion']});disposals.push(()=>{motionObserver.disconnect();cancelAnimationFrame(raf);});

const cycle=document.querySelector('.principle-cycle'),figures=[...cycle.querySelectorAll('.principle-figure')];
proximity(cycle,(x,y,inside)=>{
 figures.forEach((figure,index)=>{
  const local=(narrow.matches?y:x)*3-index-.5;
  const attention=inside?Math.exp(-local*local*3):.2;
  figure.style.setProperty('--attention',attention.toFixed(3));
  figure.querySelector('.reasoning-field').style.transform=`translate(${inside?clamp(local,-1,1)*-2:0}px,${inside?(y-.5)*-2:0}px)`;
 });
});

disposals.push(animateThinking(cycle));
// Sequential resolution begins once, while subsequent reasoning cycles remain synchronized.
const revealObserver=new IntersectionObserver(entries=>{
 if(entries.some(entry=>entry.isIntersecting)){cycle.dataset.revealed='true';revealObserver.disconnect();}
},{threshold:.16});revealObserver.observe(cycle);disposals.push(()=>revealObserver.disconnect());
window.addEventListener('pagehide',event=>{if(!event.persisted){lifetime.abort();disposals.forEach(dispose=>dispose());}},options);
