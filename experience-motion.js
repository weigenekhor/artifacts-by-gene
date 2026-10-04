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
  inside=true;if(!bounds)return;
  tx=clamp((event.clientX-bounds.left)/bounds.width);ty=clamp((event.clientY-bounds.top)/bounds.height);schedule();
 }
 surface.addEventListener('pointerenter',event=>{measure();pointer(event);},options);
 surface.addEventListener('pointermove',pointer,{...options,passive:true});
 surface.addEventListener('pointerleave',()=>{inside=false;if(!retain){tx=.5;ty=.5;}schedule();},options);
 const resize=new ResizeObserver(()=>{bounds=null;});resize.observe(geometry);
 window.addEventListener('scroll',()=>{bounds=null;requestAnimationFrame(()=>{if(!bounds)measure();});},{...options,passive:true});
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
let heroX=.5,heroY=.5,targetX=.5,targetY=.5,raf=0,heroBounds=null;
function heroFrame(now){raf=0;const dt=Math.min(40,now-(heroFrame.last||now));heroFrame.last=now;const ease=1-Math.exp(-dt/48);heroX+=(targetX-heroX)*ease;heroY+=(targetY-heroY)*ease;product.style.setProperty('--hero-rotate-y',`${(heroX-.5)*.8}deg`);product.style.setProperty('--hero-rotate-x',`${(.5-heroY)*.45}deg`);product.style.setProperty('--hero-shift-x',`${(heroX-.5)*3}px`);product.style.setProperty('--hero-shift-y',`${(heroY-.5)*2}px`);if(Math.abs(targetX-heroX)+Math.abs(targetY-heroY)>.0005&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(heroFrame);}
function scheduleHero(){if(!raf&&!reduced.matches&&!document.hidden)raf=requestAnimationFrame(heroFrame);}
function measureHero(){heroBounds=product.getBoundingClientRect();}
if(fine.matches){
 heroElement.addEventListener('pointerenter',measureHero,{signal:options.signal});
 heroElement.addEventListener('pointermove',e=>{
  // The pointer path is hot. Bounds are sampled only on entry and invalidated by layout changes.
  if(!heroBounds)return;
  targetX=clamp((e.clientX-heroBounds.left)/heroBounds.width);targetY=clamp((e.clientY-heroBounds.top)/heroBounds.height);scheduleHero();
 },{passive:true,signal:options.signal});
 heroElement.addEventListener('pointerleave',()=>{targetX=.5;targetY=.5;scheduleHero();},{signal:options.signal});
 const heroResize=new ResizeObserver(()=>{heroBounds=null;});heroResize.observe(product);
 window.addEventListener('resize',()=>{heroBounds=null;},{...options,passive:true});
 window.addEventListener('scroll',()=>{heroBounds=null;requestAnimationFrame(()=>{if(!heroBounds)measureHero();});},{...options,passive:true});
 disposals.push(()=>heroResize.disconnect());
}
product.style.setProperty('--hero-rotate-y','0deg');product.style.setProperty('--hero-rotate-x','0deg');
// The native texture rotates on the compositor, only while the product is visible.
let productVisible=false;
function syncProductMotion(){product.dataset.motion=productVisible&&!document.hidden&&!reduced.matches?'running':'paused';}
const productVisibility=new IntersectionObserver(entries=>{productVisible=entries[0].isIntersecting;syncProductMotion();});
productVisibility.observe(product);
document.addEventListener('visibilitychange',syncProductMotion,options);
reduced.addEventListener('change',()=>{syncProductMotion();if(reduced.matches){targetX=heroX=.5;targetY=heroY=.5;cancelAnimationFrame(raf);raf=0;product.style.setProperty('--wafer-look-x','0px');product.style.setProperty('--wafer-look-y','0px');}},options);
// Dragging the unoccupied wafer field changes the same rotation playhead; releasing resumes it.
const home=product.querySelector('.app-home');let waferDrag=null;
home.addEventListener('pointerdown',event=>{
 if(event.pointerType==='touch'||event.button!==0||reduced.matches||event.target.closest('button,a'))return;
 const rotation=home.querySelector('.home-wafer')?.getAnimations().find(a=>a.animationName==='native-wafer-rotation');
 if(!rotation)return;
 waferDrag={pointer:event.pointerId,x:event.clientX,time:rotation.currentTime||0,rotation};
 product.dataset.waferDragging='true';home.setPointerCapture(event.pointerId);event.preventDefault();
},options);
home.addEventListener('pointermove',event=>{
 if(!waferDrag||event.pointerId!==waferDrag.pointer)return;
 waferDrag.rotation.currentTime=((waferDrag.time+(event.clientX-waferDrag.x)*260)%120000+120000)%120000;
},{...options,passive:true});
function releaseWafer(){waferDrag=null;delete product.dataset.waferDragging;}
home.addEventListener('pointerup',releaseWafer,options);home.addEventListener('pointercancel',releaseWafer,options);home.addEventListener('lostpointercapture',releaseWafer,options);
disposals.push(()=>{productVisibility.disconnect();cancelAnimationFrame(raf);});

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
