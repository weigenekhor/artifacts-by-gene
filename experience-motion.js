import {state,setEdition} from './state.js';

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

const heroElement=document.querySelector('.hero'),duet=heroElement.querySelector('.product-duet');
const states=[...duet.querySelectorAll('.product-state')];
const labels=states.map(element=>element.querySelector('.state-identifier'));
let fromField=false;
const hero=proximity(heroElement,(position,_y,inside)=>{
 const focus=smooth((position-.08)/.84),weights=[1-focus,focus];
 heroElement.style.setProperty('--focus',focus.toFixed(4));
 heroElement.style.setProperty('--legacy-weight',weights[0].toFixed(4));
 heroElement.style.setProperty('--pentimento-weight',weights[1].toFixed(4));
 states.forEach((element,index)=>{
  const weight=weights[index],direction=index?1:-1;
  // Fixed stacking avoids a visual pop when focus crosses the centre.
  element.style.transform=`translate3d(${direction*(18-30*weight)}px,${12-18*weight}px,0) rotateY(${direction*(1-weight)*1.2}deg) scale(${.94+.1*weight})`;
  element.style.opacity=String(.92+.08*weight);
 });
 if(inside){fromField=true;setEdition(focus<.5?'legacy':'pentimento');fromField=false;}
},{initial:state.edition==='legacy'?.42:.58,retain:true,geometry:duet,allowPointer:event=>!compact.matches&&!event.target.closest('.module-details')});
function editionChanged(){
 labels.forEach(label=>label.setAttribute('aria-pressed',String(label.dataset.selectEdition===state.edition)));
 duet.dataset.active=state.edition;
 if(!fromField)hero.settle(state.edition==='legacy'?0:1);
}
labels.forEach(label=>{label.disabled=false;label.addEventListener('click',()=>{setEdition(label.dataset.selectEdition);hero.settle(label.dataset.selectEdition==='legacy'?0:1);},options);});
document.addEventListener('experience-change',editionChanged,options);
labels.forEach(label=>label.setAttribute('aria-pressed',String(label.dataset.selectEdition===state.edition)));duet.dataset.active=state.edition;
// The scene owns visibility; the native texture alone owns its continuous rotation.
const motionObserver=new MutationObserver(()=>{duet.dataset.motion=heroElement.dataset.motion;});
motionObserver.observe(heroElement,{attributes:true,attributeFilter:['data-motion']});disposals.push(()=>motionObserver.disconnect());

const cycle=document.querySelector('.principle-cycle'),figures=[...cycle.querySelectorAll('.principle-figure')];
proximity(cycle,(x,y,inside)=>{
 figures.forEach((figure,index)=>{
  const local=(narrow.matches?y:x)*3-index-.5;
  const attention=inside?Math.exp(-local*local*3):.2;
  figure.style.setProperty('--attention',attention.toFixed(3));
  figure.querySelector('.reasoning-field').style.transform=`translate(${inside?clamp(local,-1,1)*-2:0}px,${inside?(y-.5)*-2:0}px)`;
 });
});

// One measured path carries the same packet through all three graphic coordinate systems.
function measureSpine(){
 const root=cycle.getBoundingClientRect(),drawings=figures.map(figure=>figure.querySelector('.principle-drawing').getBoundingClientRect());
 const point=(index,x,y)=>{
  const r=drawings[index],scale=Math.min(r.width/360,r.height/250);
  return [r.left-root.left+(r.width-360*scale)/2+x*scale,r.top-root.top+(r.height-250*scale)/2+y*scale];
 };
 let points;
 if(narrow.matches){points=[[0,0],...drawings.map(r=>[0,r.top-root.top+r.height/2]),[0,root.height]];}
 else points=[point(0,0,125),point(0,215,124),point(0,360,125),point(1,0,125),point(1,141,133),point(1,210,133),point(1,360,125),point(2,0,125),point(2,249,155),point(2,360,125)];
 const path=points.map((p,i)=>`${i?'L':'M'}${p.map(n=>n.toFixed(2)).join(' ')}`).join(' ');
 cycle.querySelector('.system-spine path').setAttribute('d',narrow.matches?path:`M0 ${point(0,0,125)[1].toFixed(2)} H${root.width.toFixed(2)}`);
 cycle.querySelector('.spine-packet').style.offsetPath=`path('${path}')`;
}
const spineResize=new ResizeObserver(measureSpine);spineResize.observe(cycle);measureSpine();
disposals.push(()=>spineResize.disconnect());
// Sequential resolution begins once, while subsequent reasoning cycles remain synchronized.
const revealObserver=new IntersectionObserver(entries=>{
 if(entries.some(entry=>entry.isIntersecting)){cycle.dataset.revealed='true';revealObserver.disconnect();}
},{threshold:.16});revealObserver.observe(cycle);disposals.push(()=>revealObserver.disconnect());
window.addEventListener('pagehide',event=>{if(!event.persisted){lifetime.abort();disposals.forEach(dispose=>dispose());}},options);
