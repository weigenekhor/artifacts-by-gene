import {model,state} from './state.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const viewer=document.querySelector('#capture-viewer');
const num=n=>String(n).padStart(2,'0');
const cards=[];
let central=null,timer=null,progressAnimation=null,selectionFrame=0,viewerCard=null,viewerIndex=0,viewerRequest=0,returnFocus=null;
const INTERVAL=6500;
const caption=c=>`${c.caption}${c.theme==='shared'?'':` · ${c.theme==='origin'?'Origin':'Pentimento'}`}`;
const srcset=c=>c.sources.map(s=>`${s.src} ${s.width}w`).join(', ');
function makeImage(c,app,large=false){
 const img=new Image();img.alt=`${app.name} — ${c.caption}`;img.decoding='async';
 img.width=c.width;img.height=c.height;
 img.sizes=large?'90vw':'(max-width:760px) 94vw, (max-width:1300px) 46vw, 800px';
 img.srcset=srcset(c);img.src=`${c.base}/1280.webp`;
 return img;
}
function stopTimer(){clearTimeout(timer);timer=null;progressAnimation?.cancel();progressAnimation=null;if(central)central.element.dataset.autoplay='false';}
function eligible(card){return card&&card.visible&&!card.paused&&!card.hovered&&!card.focused&&!card.loading&&!document.hidden&&!viewer.open&&!reduced.matches;}
function schedule(){
 stopTimer();if(!eligible(central))return;
 const card=central;
 card.element.dataset.autoplay='true';
 progressAnimation=card.progress.animate([{width:'0%'},{width:'100%'}],{duration:INTERVAL,easing:'linear',fill:'forwards'});
 preloadNext(card);
 timer=setTimeout(async()=>{if(central===card&&eligible(card))await changeSlide(card,card.index+1);schedule();},INTERVAL);
}
function selectCentral(){
 selectionFrame=0;
 let next=null,distance=Infinity;
 for(const card of cards){
  if(!card.visible||card.element.closest('[data-mode]').dataset.mode!==state.mode)continue;
  const box=card.imageButton.getBoundingClientRect();
  const visibleHeight=Math.max(0,Math.min(box.bottom,innerHeight)-Math.max(box.top,62));
  if(visibleHeight<Math.min(box.height*.4,220))continue;
  const score=Math.abs((box.top+box.bottom)/2-innerHeight/2);
  if(score<distance){distance=score;next=card;}
 }
 if(next!==central){stopTimer();central=next;schedule();}
}
function requestSelection(){if(!selectionFrame)selectionFrame=requestAnimationFrame(selectCentral);}
function preloadNext(card){
 const capture=card.app.images[(card.index+1)%card.app.images.length];
 const img=new Image();img.src=`${capture.base}/1280.webp`;card.preload=img;
}
function updateCaption(card){
 card.element.querySelector('.gallery-count').innerHTML=`${num(card.index+1)} <span>/ ${num(card.app.images.length)}</span>`;
 card.element.querySelector('[data-slide-caption]').textContent=caption(card.app.images[card.index]);
 card.imageButton.setAttribute('aria-label',`Enlarge ${card.app.name}, capture ${card.index+1} of ${card.app.images.length}`);
}
async function changeSlide(card,index){
 const request=++card.request;
 const next=(index+card.app.images.length)%card.app.images.length;
 if(next===card.index)return;
 card.loading=true;
 const capture=card.app.images[next],image=makeImage(capture,card.app,card.element.classList.contains('gallery-feature'));
 try{await image.decode();}catch{card.loading=false;return;}
 if(request!==card.request)return;
 card.imageButton.querySelectorAll('img').forEach(img=>img.getAnimations().forEach(a=>a.cancel()));
 const old=card.imageButton.querySelector('img');
 card.imageButton.append(image);
 image.style.background='var(--frame)';
 if(!reduced.matches){const fade=image.animate([{opacity:0},{opacity:1}],{duration:420,easing:'cubic-bezier(.22,.61,.36,1)'});await fade.finished.catch(()=>{});}
 if(request!==card.request){old?.remove();return;}
 card.imageButton.querySelectorAll('img').forEach(img=>{if(img!==image)img.remove();});
 card.index=next;card.loading=false;updateCaption(card);
}
function manual(card,direction){stopTimer();changeSlide(card,card.index+direction).then(schedule);}
function swipe(element,callback){
 let start=null;
 element.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')start={x:e.clientX,y:e.clientY};});
 element.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.6){callback(dx<0?1:-1);element.dataset.swiped='true';setTimeout(()=>delete element.dataset.swiped,300);}});
 element.addEventListener('pointercancel',()=>start=null);
}
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){
  const card=cards.find(c=>c.element===entry.target);if(!card)continue;
  card.visible=entry.isIntersecting;
  if(entry.isIntersecting&&!card.entered){
   card.entered=true;
   if(!reduced.matches)card.element.animate([{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:500,easing:'cubic-bezier(.22,.61,.36,1)'});
  }
 }
 requestSelection();
},{threshold:[0,.2,.5,.8,1]});

for(const element of document.querySelectorAll('[data-gallery-app]')){
 const app=model.apps.find(a=>a.id===element.dataset.galleryApp);
 const card={element,app,index:Number(element.dataset.initialSlide),request:0,loading:false,visible:false,paused:false,hovered:false,focused:false,imageButton:element.querySelector('.gallery-image'),progress:element.querySelector('.gallery-progress>span')};
 cards.push(card);
 element.querySelectorAll('button').forEach(b=>b.disabled=false);
 element.querySelector('[data-previous]').addEventListener('click',()=>manual(card,-1));
 element.querySelector('[data-next]').addEventListener('click',()=>manual(card,1));
 element.querySelector('.gallery-play').addEventListener('click',e=>{
  card.paused=!card.paused;const button=e.currentTarget;button.setAttribute('aria-pressed',String(card.paused));button.setAttribute('aria-label',`${card.paused?'Play':'Pause'} ${app.name} slideshow`);button.innerHTML=card.paused?'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>':'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';schedule();
 });
 element.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'){card.hovered=true;if(central===card)stopTimer();}});
 element.addEventListener('pointerleave',()=>{card.hovered=false;if(central===card)schedule();});
 element.addEventListener('focusin',()=>{card.focused=true;if(central===card)stopTimer();});
 element.addEventListener('focusout',e=>{if(!element.contains(e.relatedTarget)){card.focused=false;schedule();}});
 element.addEventListener('keydown',e=>{if(viewer.open)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();manual(card,e.key==='ArrowRight'?1:-1);}});
 element.querySelectorAll('[data-lightbox]').forEach(button=>button.addEventListener('click',()=>{if(!card.imageButton.dataset.swiped)openViewer(card,button);}));
 swipe(card.imageButton,direction=>manual(card,direction));
 observer.observe(element);
 if(state.theme!=='pentimento'){
  const first=app.images.findIndex(c=>c.theme===state.theme);
  if(first>=0){
   card.index=first;
   const image=makeImage(app.images[first],app,element.classList.contains('gallery-feature'));
   image.loading='lazy';card.imageButton.replaceChildren(image);updateCaption(card);
  }
 }
}
window.addEventListener('scroll',requestSelection,{passive:true});
window.addEventListener('resize',requestSelection,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTimer();else{requestSelection();schedule();}});
document.addEventListener('mode-change',()=>{stopTimer();central=null;requestSelection();});
document.addEventListener('theme-change',()=>{
 // Theme changes affect site materials; original screenshots retain their real pixels.
 // Only align an untouched card with the corresponding theme on initial inspection.
 requestSelection();
});
function reducedChanged(){
 stopTimer();document.querySelectorAll('.gallery-play').forEach(button=>{button.disabled=reduced.matches;button.title=reduced.matches?'Automatic slideshow disabled for reduced motion':'';});schedule();
}
reduced.addEventListener('change',reducedChanged);reducedChanged();

async function openViewer(card,trigger){
 stopTimer();viewerCard=card;viewerIndex=card.index;returnFocus=trigger;
 document.documentElement.style.overflow='hidden';viewer.showModal();
 viewer.querySelector('[data-viewer-close]').focus();
 await showViewerSlide(viewerIndex);
}
async function showViewerSlide(index){
 if(!viewerCard)return;
 const request=++viewerRequest,app=viewerCard.app;
 viewerIndex=(index+app.images.length)%app.images.length;
 const capture=app.images[viewerIndex],current=document.querySelector('#viewer-image'),loading=viewer.querySelector('.image-loading');
 document.querySelector('#viewer-title').textContent=app.name;
 document.querySelector('#viewer-caption').textContent=caption(capture);
 document.querySelector('#viewer-count').textContent=`${num(viewerIndex+1)} / ${num(app.images.length)}`;
 document.querySelector('#viewer-original').href=`${capture.base}/full.webp`;
 loading.hidden=false;
 const next=makeImage(capture,app,true);
 next.srcset='';next.src=`${capture.base}/2560.webp`;
 try{await next.decode();}catch{if(request===viewerRequest){loading.textContent='Capture could not load. Try the full-resolution link.';}return;}
 if(request!==viewerRequest||!viewer.open)return;
 current.srcset='';current.src=next.src;current.alt=next.alt;current.width=capture.width;current.height=capture.height;
 loading.hidden=true;loading.textContent='Loading capture…';
 const preload=new Image();preload.src=`${app.images[(viewerIndex+1)%app.images.length].base}/2560.webp`;
}
viewer.querySelector('[data-viewer-close]').addEventListener('click',()=>viewer.close());
viewer.querySelector('[data-viewer-prev]').addEventListener('click',()=>showViewerSlide(viewerIndex-1));
viewer.querySelector('[data-viewer-next]').addEventListener('click',()=>showViewerSlide(viewerIndex+1));
viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showViewerSlide(viewerIndex+(e.key==='ArrowRight'?1:-1));}});
swipe(viewer.querySelector('.lightbox-image-wrap'),direction=>showViewerSlide(viewerIndex+direction));
viewer.addEventListener('close',()=>{
 viewerRequest++;document.documentElement.style.overflow='';
 if(viewerCard)changeSlide(viewerCard,viewerIndex);
 viewerCard=null;returnFocus?.focus({preventScroll:true});schedule();
 document.querySelector('#viewer-image').removeAttribute('src');
});
window.addEventListener('pagehide',()=>{stopTimer();observer.disconnect();if(selectionFrame)cancelAnimationFrame(selectionFrame);selectionFrame=0;});
window.addEventListener('pageshow',e=>{if(e.persisted){cards.forEach(card=>observer.observe(card.element));requestSelection();}});
