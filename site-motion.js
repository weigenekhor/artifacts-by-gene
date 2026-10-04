const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const timing={duration:640,easing:'cubic-bezier(.22,.61,.36,1)'};
const running=new Set();
function animate(element,frames,options=timing){
 if(reduced.matches)return;
 const motion=element.animate(frames,options);running.add(motion);
 motion.finished.catch(()=>{}).finally(()=>running.delete(motion));
}
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  if(!entry.isIntersecting)continue;
  observer.unobserve(entry.target);
  animate(entry.target,[{opacity:.55,transform:'translateY(12px)'},{opacity:1,transform:'none'}]);
  for(const path of entry.target.querySelectorAll('.diagram-route')){
   const length=path.getTotalLength();
   animate(path,[{strokeDasharray:`${length}`,strokeDashoffset:length},{strokeDasharray:`${length}`,strokeDashoffset:0}],{duration:1100,easing:timing.easing,delay:150});
  }
 }
},{threshold:.15});
document.querySelectorAll('[data-reveal],.product-stage').forEach(element=>observer.observe(element));
reduced.addEventListener('change',()=>{if(reduced.matches)for(const animation of running)animation.finish();});
