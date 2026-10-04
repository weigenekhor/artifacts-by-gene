import {model,state,products,setEdition,setTheme} from './state.js';
import {homeMarkup,panelPosition} from './native-home.js';
import {createPanelCache} from './panel-cache.js';
const stage=document.querySelector('.product-stage'),details=document.querySelector('.module-details'),picker=stage.querySelector('select');
const layouts=JSON.parse(document.querySelector('#native-layout-data').textContent),panels=JSON.parse(document.querySelector('#native-panel-data').textContent);
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(hover: none), (pointer: coarse), (max-width:1100px)');
const appFor=id=>model.apps.find(app=>app.id===id);
const cache=createPanelCache(async key=>{
 const image=new Image();image.className='native-panel';image.alt='';image.src=`assets/native/panels/${key}.webp`;
 await image.decode();return image;
});
let trigger=null,owner=null,activeKey='',request=0,timer,placementFrame=0;
function closeDetails(){clearTimeout(timer);request++;details.hidden=true;details.querySelector('.native-panel-motion').removeAttribute('src');trigger?.removeAttribute('aria-describedby');trigger=null;activeKey='';picker.value='';}
function placeDetails(target){
 const rect=target.getBoundingClientRect(),viewWidth=document.documentElement.clientWidth,scale=Math.min(1,(viewWidth-32)/372);
 const width=372*scale,height=Math.min(565*scale,innerHeight-32);
 const position=panelPosition(rect,{left:0,top:0,right:viewWidth,bottom:innerHeight},width,height);
 details.querySelector('.module-details-body').style.height=`${565*scale}px`;
 Object.assign(details.style,{width:`${width}px`,height:`${height}px`,left:`${position.x}px`,top:`${position.y}px`});
}
function panelKey(controller,app){
 const mode=model.expeditions.some(e=>e.mode===controller.mode&&e.apps.includes(app.id))?controller.mode:model.expeditions.find(e=>e.apps.includes(app.id)).mode;
 return `${controller.theme}-${mode}-${app.sourceKey}`;
}
async function showDetails(target,controller,id){
 const app=appFor(id||target.dataset.inspectApp);if(!app)return;
 const key=panelKey(controller,app);clearTimeout(timer);
 if(trigger===target&&activeKey===key)return;
 const started=performance.now(),entry=cache.get(key),token=++request;
 trigger?.removeAttribute('aria-describedby');trigger=target;owner=controller;activeKey=key;
 // First visits are warmed near the hero; subsequent visits perform no image decode or grid render.
 try{if(!entry.ready)await entry.promise;}catch{if(token===request)closeDetails();return;}
 if(token!==request)return;
 const current=details.querySelector('.native-panel');if(current!==entry.image)current.replaceWith(entry.image);
 const ref=panels[key],motion=details.querySelector('.native-panel-motion');
 details.querySelector('.module-details-scroll').scrollTop=0;
 details.querySelector('[data-panel-text]').textContent=`${app.name}. ${app.description} Version ${app.metadata.version}. Release ${app.metadata.release}.`;
 details.setAttribute('aria-label',`${app.name} information`);trigger.setAttribute('aria-describedby','module-details');
 motion.hidden=reduced.matches;
 if(!reduced.matches){motion.src=`assets/native/panels/${key}-motion.webp`;Object.assign(motion.style,{left:`${ref.motion.x/372*100}%`,top:`${ref.motion.y/565*100}%`,width:`${ref.motion.width/372*100}%`,height:`${ref.motion.height/565*100}%`});}
 const entering=details.hidden;placeDetails(target);details.hidden=false;
 if(entering&&!reduced.matches)details.animate([{opacity:0},{opacity:1}],{duration:140,easing:'cubic-bezier(.215,.61,.355,1)'});
 if(performance.getEntriesByName('ARTIFACTS / panel ready').length>=32)performance.clearMeasures('ARTIFACTS / panel ready');
 performance.measure('ARTIFACTS / panel ready',{start:started,end:performance.now()});
 const members=controller.reference().cards,index=members.findIndex(card=>card.key===app.sourceKey);
 for(const adjacent of [members[index-1],members[index+1]])if(adjacent)cache.warm(`${controller.theme}-${controller.mode}-${adjacent.key}`);
}
function scheduleClose(){clearTimeout(timer);timer=setTimeout(()=>{if(trigger===document.activeElement||details.contains(document.activeElement))return;closeDetails();},150);}
function trackPanel(){
 if(!trigger||placementFrame)return;
 placementFrame=requestAnimationFrame(()=>{placementFrame=0;if(!trigger)return;
  const box=trigger.getBoundingClientRect();
  if((box.bottom<0||box.top>innerHeight)&&trigger!==document.activeElement)closeDetails();else placeDetails(trigger);
 });
}
const controllers=products.map(product=>{
 const viewport=product.closest('.product-viewport'),home=product.querySelector('.app-home'),drawer=product.querySelector('.settings-drawer');
 const controller={product,theme:product.dataset.theme,mode:product.dataset.mode};
 let expanded=false,info=false,layoutTimer,lastScale=0,bounds=null,lastWarmed='';
 const key=()=>`${controller.theme}-${controller.mode}-${expanded?(info?'both':'navigation'):(info?'information':'closed')}`;
 controller.reference=()=>layouts[key()];
 function measure(){const value=viewport.clientWidth/1229;if(lastScale&&Math.abs(value-lastScale)>.0001&&owner===controller)closeDetails();product.style.transform=`scale(${value})`;lastScale=value;bounds=null;}
 new ResizeObserver(measure).observe(viewport);measure();
 function bindHomeScroll(){home.querySelector('.home-scroll').addEventListener('scroll',()=>{if(owner===controller){if(trigger===document.activeElement)trackPanel();else closeDetails();}},{passive:true});}
 bindHomeScroll();
 function renderHome(){
  const focus=home.contains(document.activeElement)?document.activeElement.dataset.inspectApp:null;
  const waferTime=home.querySelector('.home-wafer').getAnimations()[0]?.currentTime;
  home.innerHTML=homeMarkup(model,layouts,key());bounds=null;
  const rotation=home.querySelector('.home-wafer').getAnimations()[0];if(rotation&&waferTime!=null)rotation.currentTime=waferTime;
  bindHomeScroll();
  if(focus)home.querySelector(`[data-inspect-app="${focus}"]`)?.focus({preventScroll:true});
 }
 function updatePanels(){
  closeDetails();clearTimeout(layoutTimer);bounds=null;
  product.style.setProperty('--nav-shift',`${expanded?180:0}px`);product.style.setProperty('--panel-shift',`${(expanded?180:0)+(info?240:0)}px`);product.style.setProperty('--info-width',`${info?240:0}px`);
  product.classList.toggle('nav-expanded',expanded);product.classList.toggle('info-expanded',info);
  const expand=product.querySelector('[data-expand-nav]');expand.setAttribute('aria-expanded',String(expanded));expand.setAttribute('aria-label',expanded?'Collapse application navigation':'Expand application navigation');
  product.querySelector('[data-settings]').setAttribute('aria-expanded',String(info));drawer.inert=!info;drawer.setAttribute('aria-hidden',String(!info));
  if(reduced.matches)renderHome();else layoutTimer=setTimeout(renderHome,240);
 }
 product.addEventListener('pointerenter',()=>{bounds=viewport.getBoundingClientRect();});
 // Cache likely next panels from source coordinates, without measuring DOM on pointer movement.
 product.addEventListener('pointermove',e=>{
  if(!bounds||e.pointerType==='touch')return;
  const x=(e.clientX-bounds.left)/lastScale-84-(expanded?180:0)-(info?240:0),y=(e.clientY-bounds.top)/lastScale-63+home.querySelector('.home-scroll').scrollTop;
  let nearest=null,distance=Infinity;
  for(const card of controller.reference().cards){const d=(x-card.x-card.width/2)**2+(y-card.y-card.height/2)**2;if(d<distance){distance=d;nearest=card;}}
  if(nearest&&nearest.key!==lastWarmed&&distance<85000){lastWarmed=nearest.key;cache.warm(`${controller.theme}-${controller.mode}-${nearest.key}`);}
 },{passive:true});
 product.addEventListener('pointerover',e=>{const target=e.target.closest('[data-inspect-app]');if(target&&e.pointerType!=='touch'){if(coarse.matches)setEdition(controller.mode);showDetails(target,controller);}});
 product.addEventListener('pointerout',e=>{if(e.target.closest('[data-inspect-app]')&&!e.relatedTarget?.closest('[data-inspect-app],.module-details'))scheduleClose();});
 product.addEventListener('focusin',e=>{setEdition(controller.mode);if(e.target.matches('[data-inspect-app]'))showDetails(e.target,controller);});
 product.addEventListener('focusout',e=>{if(!e.relatedTarget?.closest('[data-inspect-app],.module-details'))scheduleClose();});
 product.addEventListener('click',e=>{
  const button=e.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-expand-nav')){expanded=!expanded;updatePanels();}
  if(button.hasAttribute('data-settings')){info=!info;updatePanels();}
  if(button.hasAttribute('data-home')){closeDetails();home.querySelector('.home-scroll').scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});}
  if(button.hasAttribute('data-theme-choice'))setTheme(button.dataset.themeChoice);
  if(button.hasAttribute('data-cycle-mode'))setEdition(controller.mode==='legacy'?'pentimento':'legacy');
  if(button.hasAttribute('data-inspect-app')&&coarse.matches){setEdition(controller.mode);showDetails(button,controller);}
 });
 product.querySelectorAll('button:not(.desktop-only)').forEach(button=>button.disabled=false);
 controller.warm=()=>controller.reference().cards.slice(0,4).forEach(card=>cache.warm(`${controller.theme}-${controller.mode}-${card.key}`));
 controller.closeDrawer=()=>{if(info){info=false;updatePanels();}};
 return controller;
});
const preloadObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){controllers.forEach(c=>c.warm());preloadObserver.disconnect();}},{rootMargin:'350px'});preloadObserver.observe(stage);
details.addEventListener('pointerenter',()=>clearTimeout(timer));details.addEventListener('pointerleave',scheduleClose);
details.addEventListener('focusout',e=>{if(!details.contains(e.relatedTarget))scheduleClose();});
const close=details.querySelector('[data-close-details]');close.disabled=false;close.addEventListener('click',()=>{const previous=trigger;closeDetails();previous?.focus({preventScroll:true});closeDetails();});
picker.addEventListener('change',()=>{if(picker.value)showDetails(picker,controllers.find(c=>c.mode===state.mode),picker.value);else closeDetails();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDetails();controllers.forEach(c=>c.closeDrawer());}});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.app-shell,.module-details,.mobile-app-picker'))closeDetails();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)closeDetails();});
// Scene emphasis can cross the midpoint while the pointer still inspects a native card.
// The card owns its panel; changing gallery edition must not dismiss that interaction.
document.addEventListener('experience-change',()=>{if(trigger&&owner.mode!==state.mode&&!trigger.matches(':hover,:focus')&&!details.matches(':hover,:focus-within'))closeDetails();});
window.addEventListener('scroll',trackPanel,{passive:true});reduced.addEventListener('change',closeDetails);
