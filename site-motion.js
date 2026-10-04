const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const narrow=matchMedia('(max-width:1100px), (max-height:520px)');
const ease='cubic-bezier(.215,.61,.355,1)';
const running=new Set();
const lifetime=new AbortController(),options={signal:lifetime.signal};
const clamp=n=>Math.max(0,Math.min(1,n));
const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
function animate(element,frames,options){
 if(reduced.matches)return;
 const motion=element.animate(frames,{fill:'backwards',easing:ease,...options});running.add(motion);
 motion.finished.catch(()=>{}).finally(()=>running.delete(motion));
}
// A single event-driven scroll pass controls the two handoffs; nothing runs at rest.
const hero=document.querySelector('.hero');
const sequence=hero.querySelector('.hero-sequence'),stage=hero.querySelector('.product-stage');
const credit=document.querySelector('.author-credit'),ending=document.querySelector('.ending');
const opening=document.querySelector('.experience-opening'),principles=document.querySelector('.principles'),cycle=document.querySelector('.principle-cycle');
let frame=0,rest=90,originTop=0,thinkingTop=0,cycleTop=0,endingTop=0;
function measure(){
 rest=Math.max(32,(innerHeight-stage.offsetHeight)/2);
 originTop=sequence.getBoundingClientRect().top+scrollY;
 thinkingTop=principles.getBoundingClientRect().top+scrollY;
 cycleTop=cycle.getBoundingClientRect().top+scrollY;
 endingTop=ending.getBoundingClientRect().top+scrollY;
 const base=opening.getBoundingClientRect(),product=stage.getBoundingClientRect(),thinking=principles.getBoundingClientRect(),seam=stage.querySelector('.system-seam').getBoundingClientRect();
 const x=thinking.left-base.left-25,startX=product.left-base.left;
 const startY=originTop+seam.top-product.top-base.top-scrollY;
 const endY=cycleTop-base.top-scrollY+cycle.querySelector('.principle-drawing').offsetHeight/2;
 const endX=thinking.left-base.left;
 const path=`M${startX} ${startY} H${x+36} Q${x} ${startY} ${x} ${startY+36} V${endY-24} Q${x} ${endY} ${endX} ${endY}`;
 opening.querySelectorAll('.experience-thread path').forEach(line=>line.setAttribute('d',path));
 stage.style.setProperty('--product-rest',`${rest}px`);schedule();
}
function render(){
 frame=0;
 if(reduced.matches||narrow.matches){hero.style.removeProperty('--product-x');hero.style.removeProperty('--intro-y');hero.style.removeProperty('--intro-opacity');hero.style.removeProperty('--product-presence');opening.style.removeProperty('--handoff');credit.style.removeProperty('transform');credit.style.removeProperty('opacity');return;}
 const approach=smooth(scrollY/Math.max(1,originTop-rest));
 const handoff=smooth((scrollY+innerHeight*.85-thinkingTop)/Math.max(1,cycleTop-thinkingTop+innerHeight*.24));
 hero.style.setProperty('--product-x',`${(1-approach)*18}px`);
 hero.style.setProperty('--intro-y',`${-22*approach}px`);
 hero.style.setProperty('--intro-opacity',`${1-.48*approach}`);
 hero.style.setProperty('--product-presence',`${1-.24*handoff}`);
 opening.style.setProperty('--handoff',handoff.toFixed(4));
 const finish=smooth((innerHeight*.96-endingTop+scrollY)/(innerHeight*.2));
 credit.style.transform=`translate3d(0,${-10*finish}px,0)`;credit.style.opacity=`${1-.12*finish}`;
}
function schedule(){if(!frame)frame=requestAnimationFrame(render);}
window.addEventListener('scroll',schedule,{...options,passive:true});window.addEventListener('resize',measure,{...options,passive:true});
const geometry=new ResizeObserver(measure);geometry.observe(stage);geometry.observe(opening);geometry.observe(document.querySelector('.applications'));measure();
// Entry uses inner wrappers, leaving continuous focus and scroll on separate transform owners.
animate(stage.querySelector('.product-environment'),[{opacity:0},{opacity:1}],{duration:650,delay:150});
stage.querySelectorAll('.state-arrival').forEach((element,index)=>{
 animate(element,[{opacity:0,transform:`translate3d(${index?14:-14}px,12px,0) scale(.984)`},{opacity:1,transform:'none'}],{duration:620,delay:300+index*150});
 animate(element.querySelector('.home-material'),[{opacity:.25},{opacity:1}],{duration:430,delay:700});
 animate(element.querySelector('.home-render'),[{opacity:.3},{opacity:1}],{duration:430,delay:710+index*60});
 animate(element.querySelector('.state-identifier'),[{opacity:0},{opacity:1}],{duration:350,delay:900+index*120});
});
const creditsObserver=new IntersectionObserver(entries=>{
 if(!entries[0].isIntersecting)return;creditsObserver.disconnect();
 const part=name=>credit.querySelector(`[data-credit="${name}"]`);
 animate(part('label'),[{opacity:0},{opacity:1}],{duration:300});
 animate(part('name'),[{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:560,delay:180});
 animate(part('identity'),[{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:430,delay:310});
 animate(part('rule'),[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:450,delay:440});
 animate(part('email'),[{opacity:0,transform:'translateX(-11px)'},{opacity:1,transform:'none'}],{duration:400,delay:620});
 animate(part('linkedin'),[{opacity:0,transform:'translateX(11px)'},{opacity:1,transform:'none'}],{duration:400,delay:650});
},{threshold:.4});creditsObserver.observe(credit);
reduced.addEventListener('change',()=>{if(reduced.matches)for(const motion of running)motion.finish();measure();},options);
narrow.addEventListener('change',measure,options);
window.addEventListener('pagehide',event=>{if(!event.persisted){lifetime.abort();geometry.disconnect();creditsObserver.disconnect();cancelAnimationFrame(frame);for(const motion of running)motion.cancel();}},options);
