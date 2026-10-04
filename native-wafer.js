// The actual desktop wafer's geometry and 1°/s drift, without a rendering loop.
const content=document.querySelector('.app-content'),wafer=document.querySelector('.native-wafer'),shell=document.querySelector('.app-shell');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let visible=true,dragging=false,previousAngle=0,rotation=0;
const animation=wafer.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:360000,iterations:Infinity,easing:'linear'});
const geometry={x:0,y:0,radius:0};
function layout(){
 const width=content.clientWidth,height=content.clientHeight;
 const scale=Math.max((width+(shell.classList.contains('nav-expanded')?160:0))/1672,height/941);
 const s=540*scale/585,cx=width-222*scale,cy=height-464*scale;
 wafer.style.setProperty('--wafer-size',`${1254*s}px`);
 wafer.style.setProperty('--wafer-left',`${cx-626*s}px`);
 wafer.style.setProperty('--wafer-top',`${cy-617*s}px`);
 geometry.x=cx;geometry.y=cy;geometry.radius=585*s;
}
function sync(){if(!visible||document.hidden||reduced.matches||shell.dataset.view!=='home'||dragging)animation.pause();else animation.play();}
new ResizeObserver(layout).observe(content);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(shell);
new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['data-view']});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
function backgroundHit(e){
 if(e.target.closest('button,a,input,select,.module-details')||shell.dataset.view!=='home'||e.pointerType==='touch')return null;
 const rect=content.getBoundingClientRect(),x=e.clientX-rect.left-geometry.x,y=e.clientY-rect.top-geometry.y;
 return Math.hypot(x,y)<geometry.radius?Math.atan2(y,x)*180/Math.PI:null;
}
content.addEventListener('pointerdown',e=>{const angle=backgroundHit(e);if(angle===null)return;dragging=true;previousAngle=angle;rotation=Number(animation.currentTime||0)/1000;sync();content.setPointerCapture(e.pointerId);content.style.cursor='grabbing';});
content.addEventListener('pointermove',e=>{
 if(!dragging){content.style.cursor=backgroundHit(e)===null?'':'grab';return;}
 const rect=content.getBoundingClientRect(),angle=Math.atan2(e.clientY-rect.top-geometry.y,e.clientX-rect.left-geometry.x)*180/Math.PI;
 rotation+=(angle-previousAngle+540)%360-180;previousAngle=angle;animation.currentTime=((rotation%360)+360)%360*1000;
});
function release(){dragging=false;content.style.cursor='';sync();}
content.addEventListener('pointerup',release);content.addEventListener('pointercancel',release);
layout();sync();
