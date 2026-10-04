import {model,state,setEdition,setTheme} from './state.js';
import {homeMarkup,panelPosition} from './native-home.js';
import {createPanelCache} from './panel-cache.js';

const stage=document.querySelector('.product-stage');
const shell=document.querySelector('.app-shell');
const stateBox=shell.closest('.product-state');
const home=shell.querySelector('.app-home');
const drawer=shell.querySelector('.settings-drawer');
const details=document.querySelector('.module-details');
const layouts=JSON.parse(document.querySelector('#native-layout-data').textContent);
const panels=JSON.parse(document.querySelector('#native-panel-data').textContent);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(hover: none), (pointer: coarse), (max-width:1100px)');
const appFor=id=>model.apps.find(app=>app.id===id);
const cache=createPanelCache(async key=>{const image=new Image();image.className='native-panel';image.alt='';image.src=`assets/native/panels/${key}.webp`;await image.decode();return image;});
const motionCache=new Map();
function warmMotion(source){
 if(!source)return Promise.resolve();
 const cached=motionCache.get(source);
 if(cached)return cached;
 const image=new Image();image.decoding='async';image.src=source;
 const promise=image.decode().catch(()=>{});
 motionCache.set(source,promise);
 return promise;
}
const hoverImagePromises=new Map();
function warmHoverImage(source){
 if(!source||hoverImagePromises.has(source))return;
 const image=new Image();image.decoding='async';image.src=source;
 hoverImagePromises.set(source,image.decode().catch(()=>{}));
}
let trigger=null,activeKey='',request=0,timer,placementFrame=0;
const controller={product:shell,theme:shell.dataset.theme,mode:shell.dataset.mode,reference:()=>layouts[`${controller.theme}-${controller.mode}-${expanded?(info?'both':'navigation'):(info?'information':'closed')}`]};
let expanded=false,info=false,layoutTimer,lastScale=0,bounds=null,lastWarmed='';
function closeDetails(){clearTimeout(timer);request++;details.hidden=true;const motion=details.querySelector('.native-panel-motion');motion.hidden=true;motion.removeAttribute('src');trigger?.removeAttribute('aria-describedby');trigger=null;activeKey='';}
function placeDetails(target){const rect=target.getBoundingClientRect(),viewWidth=document.documentElement.clientWidth,scale=Math.min(1,(viewWidth-32)/372),width=372*scale,height=Math.min(565*scale,innerHeight-32),position=panelPosition(rect,{left:0,top:0,right:viewWidth,bottom:innerHeight},width,height);details.querySelector('.module-details-body').style.height=`${565*scale}px`;Object.assign(details.style,{width:`${width}px`,height:`${height}px`,left:`${position.x}px`,top:`${position.y}px`});}
function panelKey(app){const mode=model.expeditions.some(e=>e.mode===controller.mode&&e.apps.includes(app.id))?controller.mode:model.expeditions.find(e=>e.apps.includes(app.id)).mode;return `${controller.theme}-${mode}-${app.sourceKey}`;}
async function showDetails(target,id){
 const app=appFor(id||target.dataset.inspectApp);if(!app)return;
 const key=panelKey(app);clearTimeout(timer);if(trigger===target&&activeKey===key)return;
 const entry=cache.get(key),ref=panels[key],motionSource=!reduced.matches&&ref?.motion?`assets/native/panels/${key}-motion.webp`:'';
 const motionReady=motionSource?warmMotion(motionSource):Promise.resolve(),token=++request;
 trigger?.removeAttribute('aria-describedby');trigger=target;activeKey=key;
 try{if(!entry.ready)await entry.promise;}catch{if(token===request)closeDetails();return;}
 if(token!==request)return;
 const current=details.querySelector('.native-panel');if(current!==entry.image)current.replaceWith(entry.image);
 const motion=details.querySelector('.native-panel-motion');details.querySelector('.module-details-scroll').scrollTop=0;details.querySelector('[data-panel-text]').textContent=`${app.name}. ${app.description} Version ${app.metadata.version}. Release ${app.metadata.release}.`;details.setAttribute('aria-label',`${app.name} information`);trigger.setAttribute('aria-describedby','module-details');
 const entering=details.hidden;placeDetails(target);details.hidden=false;if(entering&&!reduced.matches)details.animate([{opacity:0},{opacity:1}],{duration:140,easing:'cubic-bezier(.215,.61,.355,1)'});
 motion.hidden=true;motion.removeAttribute('src');
 if(motionSource){Object.assign(motion.style,{left:`${ref.motion.x/372*100}%`,top:`${ref.motion.y/565*100}%`,width:`${ref.motion.width/372*100}%`,height:`${ref.motion.height/565*100}%`});motionReady.then(()=>{if(token!==request||details.hidden||activeKey!==key)return;motion.src=motionSource;motion.hidden=false;});}
 const members=controller.reference().cards||[],index=members.findIndex(card=>card.key===app.sourceKey);for(const adjacent of [members[index-1],members[index+1]])if(adjacent)cache.warm(`${controller.theme}-${controller.mode}-${adjacent.key}`);
}
function scheduleClose(){clearTimeout(timer);timer=setTimeout(()=>{if(trigger===document.activeElement||details.contains(document.activeElement))return;closeDetails();},150);}
function trackPanel(){if(!trigger||placementFrame)return;placementFrame=requestAnimationFrame(()=>{placementFrame=0;if(!trigger)return;const box=trigger.getBoundingClientRect();if((box.bottom<0||box.top>innerHeight)&&trigger!==document.activeElement)closeDetails();else placeDetails(trigger);});}
function clearLocate(){shell.querySelectorAll('.app-tile.is-located').forEach(tile=>tile.classList.remove('is-located'));}
function locate(id){clearLocate();const tile=home.querySelector(`[data-inspect-app="${CSS.escape(id)}"]`);tile?.classList.add('is-located');}
function bindHomeScroll(){home.querySelector('.home-scroll')?.addEventListener('scroll',()=>{if(trigger){if(trigger===document.activeElement)trackPanel();else closeDetails();}},{passive:true});}
function renderHome(){const focus=home.contains(document.activeElement)?document.activeElement.dataset.inspectApp:null;const wafer=home.querySelector('.home-wafer'),waferTime=wafer?.getAnimations()[0]?.currentTime;home.innerHTML=homeMarkup(model,layouts,`${controller.theme}-${controller.mode}-${expanded?(info?'both':'navigation'):(info?'information':'closed')}`);bindHomeScroll();const rotation=home.querySelector('.home-wafer')?.getAnimations()[0];if(rotation&&waferTime!=null)rotation.currentTime=waferTime;if(focus)home.querySelector(`[data-inspect-app="${CSS.escape(focus)}"]`)?.focus({preventScroll:true});}
function warmActiveAssets(){
 const cards=controller.reference().cards||[];
 cards.forEach(card=>cache.warm(`${controller.theme}-${controller.mode}-${card.key}`));
 home.querySelectorAll('.app-tile').forEach(tile=>{
  const value=tile.style.getPropertyValue('--hover-render');
  const match=value.match(/url\((?:["']?)(.*?)(?:["']?)\)/);
  if(match)warmHoverImage(match[1]);
 });
}
function updatePanels(){closeDetails();clearTimeout(layoutTimer);bounds=null;controller.product.style.setProperty('--nav-shift',`${expanded?180:0}px`);controller.product.style.setProperty('--panel-shift',`${(expanded?180:0)+(info?240:0)}px`);controller.product.style.setProperty('--info-width',`${info?240:0}px`);controller.product.classList.toggle('nav-expanded',expanded);controller.product.classList.toggle('info-expanded',info);const expand=controller.product.querySelector('[data-expand-nav]');expand.setAttribute('aria-expanded',String(expanded));expand.setAttribute('aria-label',expanded?'Collapse application navigation':'Expand application navigation');controller.product.querySelector('[data-settings]').setAttribute('aria-expanded',String(info));drawer.inert=!info;drawer.setAttribute('aria-hidden',String(!info));if(reduced.matches)renderHome();else layoutTimer=setTimeout(renderHome,240);}
function applyEdition(){
 closeDetails();controller.theme=state.theme;controller.mode=state.mode;
 const modeName=state.mode==='legacy'?'Legacy':'Pentimento',themeName=state.theme==='origin'?'Origin':'Pentimento';
 shell.dataset.theme=state.theme;shell.dataset.mode=state.mode;
 shell.setAttribute('aria-label',`${modeName}, ${themeName} theme, ARTIFACTS application`);
 stateBox.dataset.edition=state.mode;
 stateBox.querySelector('[data-mode-label]').textContent=modeName;
 shell.querySelector('[data-mode-range]').textContent=state.mode==='legacy'?'I–IV':'V–VI';
 shell.querySelector('[data-mode-name]').textContent=modeName;
 shell.querySelector('[data-cycle-mode]').setAttribute('aria-label',`Switch to ${state.mode==='legacy'?'Pentimento':'Legacy'} mode`);
 shell.querySelector('[data-info-image]').src=`assets/native/panels/${state.theme}-info.webp`;
 shell.querySelectorAll('[data-theme-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===state.theme)));
 renderHome();warmActiveAssets();
}
new ResizeObserver(()=>{const value=stage.querySelector('.product-viewport').clientWidth/1229;if(lastScale&&Math.abs(value-lastScale)>.0001)closeDetails();shell.style.transform=`translateZ(0) scale(${value})`;lastScale=value;bounds=null;}).observe(stage.querySelector('.product-viewport'));
bindHomeScroll();
shell.addEventListener('pointerenter',()=>{bounds=stage.querySelector('.product-viewport').getBoundingClientRect();});
shell.addEventListener('pointermove',e=>{if(!bounds||e.pointerType==='touch')return;const x=(e.clientX-bounds.left)/lastScale-84-(expanded?180:0)-(info?240:0),y=(e.clientY-bounds.top)/lastScale-63+home.querySelector('.home-scroll').scrollTop;let nearest=null,distance=Infinity;for(const card of controller.reference().cards||[]){const d=(x-card.x-card.width/2)**2+(y-card.y-card.height/2)**2;if(d<distance){distance=d;nearest=card;}}if(nearest&&nearest.key!==lastWarmed&&distance<85000){lastWarmed=nearest.key;cache.warm(`${controller.theme}-${controller.mode}-${nearest.key}`);}}, {passive:true});
shell.addEventListener('pointerover',e=>{const locateButton=e.target.closest('[data-locate-app]');if(locateButton){locate(locateButton.dataset.locateApp);return;}const target=e.target.closest('[data-inspect-app]');if(target&&e.pointerType!=='touch')showDetails(target);});
shell.addEventListener('pointerout',e=>{if(e.target.closest('[data-locate-app]')){clearLocate();return;}if(e.target.closest('[data-inspect-app]')&&!e.relatedTarget?.closest('[data-inspect-app],.module-details'))scheduleClose();});
shell.addEventListener('focusin',e=>{if(e.target.matches('[data-locate-app]'))locate(e.target.dataset.locateApp);if(e.target.matches('[data-inspect-app]'))showDetails(e.target);});
shell.addEventListener('focusout',e=>{if(e.target.matches('[data-locate-app]'))clearLocate();if(!e.relatedTarget?.closest('[data-inspect-app],.module-details'))scheduleClose();});
shell.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;if(button.hasAttribute('data-expand-nav')){expanded=!expanded;updatePanels();}if(button.hasAttribute('data-settings')){info=!info;updatePanels();}if(button.hasAttribute('data-home')){closeDetails();home.querySelector('.home-scroll')?.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});}if(button.hasAttribute('data-theme-choice'))setTheme(button.dataset.themeChoice);if(button.hasAttribute('data-cycle-mode'))setEdition(controller.mode==='legacy'?'pentimento':'legacy');if(button.hasAttribute('data-inspect-app')&&coarse.matches)showDetails(button);});
shell.querySelectorAll('button:not(.desktop-only)').forEach(button=>button.disabled=false);
controller.warm=warmActiveAssets;
const preloadObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){controller.warm();preloadObserver.disconnect();}},{rootMargin:'350px'});preloadObserver.observe(stage);
details.addEventListener('pointerenter',()=>clearTimeout(timer));details.addEventListener('pointerleave',scheduleClose);details.addEventListener('focusout',e=>{if(!details.contains(e.relatedTarget))scheduleClose();});details.querySelector('[data-close-details]').disabled=false;details.querySelector('[data-close-details]').addEventListener('click',()=>{const previous=trigger;closeDetails();previous?.focus({preventScroll:true});});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDetails();if(info){info=false;updatePanels();}}});document.addEventListener('pointerdown',e=>{if(!e.target.closest('.app-shell,.module-details'))closeDetails();});document.addEventListener('visibilitychange',()=>{if(document.hidden)closeDetails();});window.addEventListener('scroll',trackPanel,{passive:true});document.addEventListener('experience-change',applyEdition);reduced.addEventListener('change',closeDetails);applyEdition();document.documentElement.classList.add('native-ready');
