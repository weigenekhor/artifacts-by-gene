import {state,setEdition} from './state.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,value));
const smooth=value=>{value=clamp(value);return value*value*(3-2*value);};
// Geometry is read only on entry/resize/scroll, never in the interpolation frame.
function proximity(surface,update,rest){
 let bounds=null,visible=false,inside=false,frame=0,last=0,x=.5,y=.5,tx=.5,ty=.5;
 function render(now){
  frame=0;const dt=Math.min(40,now-last||16);last=now;
  const damping=1-Math.exp(-dt/110);x+=(tx-x)*damping;y+=(ty-y)*damping;
  update(x,y,inside);
  if(visible&&!reduced.matches&&(Math.abs(tx-x)+Math.abs(ty-y)>.0005))frame=requestAnimationFrame(render);
 }
 function schedule(){if(!frame&&visible){last=0;frame=requestAnimationFrame(render);}}
 function measure(){bounds=surface.getBoundingClientRect();}
 surface.addEventListener('pointerenter',e=>{if(!fine.matches||reduced.matches)return;inside=true;measure();tx=clamp((e.clientX-bounds.left)/bounds.width);ty=clamp((e.clientY-bounds.top)/bounds.height);schedule();});
 surface.addEventListener('pointermove',e=>{if(!inside||!bounds)return;tx=clamp((e.clientX-bounds.left)/bounds.width);ty=clamp((e.clientY-bounds.top)/bounds.height);schedule();},{passive:true});
 surface.addEventListener('pointerleave',()=>{inside=false;[tx,ty]=rest();schedule();});
 new ResizeObserver(measure).observe(surface);window.addEventListener('scroll',()=>{if(inside)measure();},{passive:true});
 const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0});visibility.observe(surface);
 function sync(){
  const running=visible&&!document.hidden&&!reduced.matches;
  surface.dataset.motion=running?'running':'paused';
  if(!running&&frame){cancelAnimationFrame(frame);frame=0;}
  if(running)schedule();else if(reduced.matches){inside=false;[x,y]=rest();update(x,y,false);}
 }
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 return {settle(a,b=.5){tx=a;ty=b;if(reduced.matches){x=tx;y=ty;update(x,y,false);}else schedule();},get inside(){return inside;}};
}
const duet=document.querySelector('.product-duet'),legacy=duet.querySelector('[data-edition="legacy"]'),pentimento=duet.querySelector('[data-edition="pentimento"]');
const hero=proximity(duet,(x,y,inside)=>{
 const weight=inside?smooth((x-.18)/.64):x;
 const l=1-weight,p=weight,dy=(y-.5)*8;
 legacy.style.transform=`translate3d(${-12*l}px,${20*p+dy*l}px,0) scale(${.94+.06*l}) rotate(${-1.1*p}deg)`;
 pentimento.style.transform=`translate3d(${12*p}px,${20*l-dy*p}px,0) scale(${.94+.06*p}) rotate(${1.1*l}deg)`;
 legacy.style.opacity=String(.84+.16*l);pentimento.style.opacity=String(.84+.16*p);
 legacy.style.zIndex=weight<.5?'2':'1';pentimento.style.zIndex=weight>=.5?'2':'1';
 if(inside)setEdition(weight<.5?'legacy':'pentimento');
},()=>[state.edition==='legacy'?.2:.8,.5]);
function editionChanged(){
 document.querySelectorAll('[data-select-edition]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.selectEdition===state.edition)));
 duet.dataset.active=state.edition;
 if(!hero.inside)hero.settle(state.edition==='legacy'?.2:.8);
}
document.querySelectorAll('[data-select-edition]').forEach(button=>{button.disabled=false;button.addEventListener('click',()=>{setEdition(button.dataset.selectEdition);hero.settle(button.dataset.selectEdition==='legacy'?0:1);});});
document.addEventListener('experience-change',editionChanged);editionChanged();

const cycle=document.querySelector('.principle-cycle'),figures=[...cycle.querySelectorAll('.principle-figure')];
const cycleNarrow=matchMedia('(max-width:760px)');
proximity(cycle,(x,y,inside)=>{
 const vertical=cycleNarrow.matches;
 figures.forEach((figure,index)=>{
  const local=(vertical?y:x)*3-index-.5,attention=inside?Math.exp(-local*local*3):.24;
  figure.style.setProperty('--attention',attention.toFixed(3));
  figure.querySelector('.reasoning-field').style.transform=`translate(${inside?clamp(local,-1,1)*-3:0}px,${inside?(y-.5)*-3:0}px)`;
 });
},()=>[.5,.5]);
