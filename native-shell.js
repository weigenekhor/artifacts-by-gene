import {model,state,product,setMode} from './state.js';
import {homeMarkup,panelPosition} from './native-home.js';
const stage=product.closest('.product-stage'),viewport=stage.querySelector('.product-viewport');
const home=product.querySelector('.app-home'),drawer=product.querySelector('.settings-drawer');
const details=document.querySelector('.module-details'),picker=stage.querySelector('select');
const layouts=JSON.parse(document.querySelector('#native-layout-data').textContent);
const panels=JSON.parse(document.querySelector('#native-panel-data').textContent);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const coarse=matchMedia('(hover: none), (pointer: coarse)');
let expanded=false,info=false,timer,layoutTimer,trigger=null,activeApp=null,request=0,lastScale=0;
const appFor=id=>model.apps.find(app=>app.id===id);
const layoutKey=()=>`${state.theme}-${state.mode}-${expanded?(info?'both':'navigation'):(info?'information':'closed')}`;
function closeDetails(){clearTimeout(timer);request++;details.hidden=true;details.querySelector('.native-panel-motion').removeAttribute('src');trigger?.removeAttribute('aria-describedby');trigger=null;activeApp=null;picker.value='';}
function scale(){
 const value=viewport.clientWidth/1229;
 if(lastScale&&Math.abs(value-lastScale)>.0001)closeDetails();
 product.style.transform=`scale(${value})`;lastScale=value;
}
new ResizeObserver(scale).observe(viewport);scale();
function renderHome(){
 const restore=home.contains(document.activeElement)?document.activeElement.dataset.inspectApp:null;
 home.innerHTML=homeMarkup(model,layouts,layoutKey());
 const sheet=home.querySelector('.home-sheet');
 if(!reduced.matches)sheet.animate([{opacity:.5},{opacity:1}],{duration:175,easing:'cubic-bezier(.215,.61,.355,1)'});
 home.querySelector('.home-scroll').addEventListener('scroll',()=>{
  if(trigger===document.activeElement)placeDetails(trigger);else closeDetails();
 },{passive:true});
 if(restore)home.querySelector(`[data-inspect-app="${restore}"]`)?.focus({preventScroll:true});
}
function updatePanels(){
 closeDetails();clearTimeout(layoutTimer);
 const shift=(expanded?180:0)+(info?240:0);
 product.style.setProperty('--nav-shift',`${expanded?180:0}px`);
 product.style.setProperty('--panel-shift',`${shift}px`);
 product.style.setProperty('--info-width',`${info?240:0}px`);
 product.classList.toggle('nav-expanded',expanded);product.classList.toggle('info-expanded',info);
 product.querySelector('[data-expand-nav]').setAttribute('aria-expanded',String(expanded));
 product.querySelector('[data-expand-nav]').setAttribute('aria-label',expanded?'Collapse application navigation':'Expand application navigation');
 product.querySelector('[data-settings]').setAttribute('aria-expanded',String(info));drawer.inert=!info;drawer.setAttribute('aria-hidden',String(!info));
 // Freeze the old native layout while the panels move, then use the native reflow.
 if(reduced.matches)renderHome();else layoutTimer=setTimeout(renderHome,240);
}
function placeDetails(target){
 const rect=(target||viewport).getBoundingClientRect();
 const viewWidth=document.documentElement.clientWidth;
 const scale=Math.min(1,(viewWidth-32)/372);
 const width=372*scale,height=Math.min(565*scale,innerHeight-32);
 details.querySelector(".module-details-body").style.height=`${565*scale}px`;
 const position=panelPosition(rect,{left:0,top:0,right:viewWidth,bottom:innerHeight},width,height);
 details.style.width=`${width}px`;details.style.height=`${height}px`;details.style.left=`${position.x}px`;details.style.top=`${position.y}px`;
}
async function showDetails(target,id){
 const app=appFor(id||target?.dataset.inspectApp);if(!app)return;
 clearTimeout(timer);if(trigger===target&&activeApp===app)return;
 trigger?.removeAttribute('aria-describedby');trigger=target;activeApp=app;
 const mode=model.expeditions.some(e=>e.mode===state.mode&&e.apps.includes(app.id))?state.mode:model.expeditions.find(e=>e.apps.includes(app.id)).mode;
 const key=`${state.theme}-${mode}-${app.sourceKey}`,ref=panels[key],token=++request;
 const image=new Image();image.src=`assets/native/panels/${key}.webp`;
 try{await image.decode();}catch{return;}
 if(token!==request)return;
 const panel=details.querySelector('.native-panel'),motion=details.querySelector('.native-panel-motion');
 panel.src=image.src;panel.alt='';details.querySelector('.module-details-scroll').scrollTop=0;
 const group=model.expeditions.find(e=>e.mode===mode&&e.apps.includes(app.id));
 details.querySelector('[data-panel-text]').textContent=`${group.label}. ${app.name}. ${app.description} Version ${app.metadata.version}. Release ${app.metadata.release}.`;
 details.setAttribute('aria-label',`${app.name} information`);trigger?.setAttribute('aria-describedby','module-details');
 motion.hidden=reduced.matches;
 if(!reduced.matches){motion.src=`assets/native/panels/${key}-motion.webp`;Object.assign(motion.style,{left:`${ref.motion.x/372*100}%`,top:`${ref.motion.y/565*100}%`,width:`${ref.motion.width/372*100}%`,height:`${ref.motion.height/565*100}%`});}
 placeDetails(target);const entering=details.hidden;details.hidden=false;
 if(entering&&!reduced.matches)details.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:160,easing:'cubic-bezier(.215,.61,.355,1)'});
}
function scheduleClose(){
 clearTimeout(timer);
 timer=setTimeout(()=>{
  if(trigger===document.activeElement||details.contains(document.activeElement))return;
  closeDetails();
 },150);
}
product.addEventListener('pointerover',e=>{const target=e.target.closest('[data-inspect-app]');if(target&&e.pointerType!=='touch')showDetails(target);});
product.addEventListener('pointerout',e=>{if(e.target.closest('[data-inspect-app]')&&!e.relatedTarget?.closest('[data-inspect-app],.module-details'))scheduleClose();});
product.addEventListener('focusin',e=>{if(e.target.matches('[data-inspect-app]'))showDetails(e.target);});
product.addEventListener('focusout',e=>{if(!e.relatedTarget?.closest('[data-inspect-app],.module-details'))scheduleClose();});
details.addEventListener('pointerenter',()=>clearTimeout(timer));details.addEventListener('pointerleave',scheduleClose);
details.addEventListener('focusout',e=>{if(!details.contains(e.relatedTarget))scheduleClose();});
details.querySelector('[data-close-details]').addEventListener('click',()=>{const previous=trigger;closeDetails();previous?.focus({preventScroll:true});closeDetails();});
product.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-expand-nav')){expanded=!expanded;updatePanels();}
 if(button.hasAttribute('data-settings')){info=!info;updatePanels();}
 if(button.hasAttribute('data-home')){closeDetails();home.querySelector('.home-scroll').scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});}
 if(button.hasAttribute('data-cycle-mode'))setMode(state.mode==='legacy'?'pentimento':'legacy');
 // Touch has no hover: tapping reveals only the same native information panel.
 if(button.hasAttribute('data-inspect-app')&&coarse.matches)showDetails(button);
});
picker.addEventListener('change',()=>picker.value?showDetails(picker,picker.value):closeDetails());
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDetails();if(info){info=false;updatePanels();}}});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.app-shell,.module-details,.mobile-app-picker'))closeDetails();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)closeDetails();});
let placementFrame=0;
window.addEventListener('scroll',()=>{
 if(!trigger||placementFrame)return;
 placementFrame=requestAnimationFrame(()=>{
  placementFrame=0;if(!trigger)return;
  const box=trigger.getBoundingClientRect();
  if((box.bottom<0||box.top>innerHeight)&&trigger!==document.activeElement)closeDetails();else placeDetails(trigger);
 });
},{passive:true});
reduced.addEventListener('change',closeDetails);
document.addEventListener('theme-change',()=>{closeDetails();clearTimeout(layoutTimer);drawer.querySelector('img').src=`assets/native/panels/${state.theme}-info.webp`;renderHome();});
document.addEventListener('mode-change',()=>{
 closeDetails();clearTimeout(layoutTimer);
 product.querySelector('[data-mode-name]').textContent=model.modes.find(m=>m.id===state.mode).name;
 product.querySelector('[data-mode-range]').textContent=model.modes.find(m=>m.id===state.mode).range;
 product.querySelector('[data-cycle-mode]').setAttribute('aria-label',`Switch to ${state.mode==='legacy'?'Pentimento':'Legacy'} mode`);
 renderHome();
});
product.querySelectorAll('button:not(.desktop-only)').forEach(button=>button.disabled=false);
details.querySelector('[data-close-details]').disabled=false;
drawer.querySelector('img').src=`assets/native/panels/${state.theme}-info.webp`;
document.dispatchEvent(new Event('mode-change'));
