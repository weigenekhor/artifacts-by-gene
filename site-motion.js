const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const narrow=matchMedia('(max-width:760px), (max-height:520px)');
const ease='cubic-bezier(.215,.61,.355,1)';
const running=new Set();
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
let frame=0,rest=90,originTop=0;
function measure(){
 rest=Math.max(32,(innerHeight-stage.offsetHeight)/2);
 originTop=sequence.getBoundingClientRect().top+scrollY;
 stage.style.setProperty('--product-rest',`${rest}px`);schedule();
}
function render(){
 frame=0;
 if(reduced.matches||narrow.matches){hero.style.removeProperty('--product-x');hero.style.removeProperty('--intro-y');hero.style.removeProperty('--intro-opacity');credit.style.removeProperty('transform');credit.style.removeProperty('opacity');return;}
 const top=sequence.getBoundingClientRect().top;
 const approach=smooth((originTop-top)/Math.max(1,originTop-rest));
 hero.style.setProperty('--product-x',`${(1-approach)*36}px`);
 hero.style.setProperty('--intro-y',`${-28*approach}px`);
 hero.style.setProperty('--intro-opacity',`${1-.62*approach}`);
 const finish=smooth((innerHeight*.96-ending.getBoundingClientRect().top)/(innerHeight*.2));
 credit.style.transform=`translate3d(0,${-10*finish}px,0)`;credit.style.opacity=`${1-.12*finish}`;
}
function schedule(){if(!frame)frame=requestAnimationFrame(render);}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure,{passive:true});
new ResizeObserver(measure).observe(stage);measure();
// The product arrives as one composed object. Scroll takes over its horizontal position.
animate(stage.querySelector('.product-rig'),[{opacity:0},{opacity:1}],{duration:650});
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
reduced.addEventListener('change',()=>{if(reduced.matches)for(const motion of running)motion.finish();measure();});
narrow.addEventListener('change',measure);
