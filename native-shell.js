import {model,state,product,setMode} from './state.js';

const stage=product.closest('.product-stage');
const viewport=stage.querySelector('.product-viewport');
const home=product.querySelector('.app-home');
const details=product.querySelector('.module-details');
const drawer=product.querySelector('.settings-drawer');
const capture=stage.querySelector('.product-capture');
const controls=stage.querySelector('.product-capture-controls');
const status=stage.querySelector('[data-shell-status]');
const picker=stage.querySelector('select');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const imageCache=new Map();
let activeApp=null,activeImages=[],index=0,request=0,returnTrigger=null,detailTimer,detailTrigger=null;
const appFor=id=>model.apps.find(a=>a.id===id);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function layout(){product.style.transform=`scale(${viewport.clientWidth/1229})`;closeDetails();}
new ResizeObserver(layout).observe(viewport);layout();
function closeDetails(){clearTimeout(detailTimer);details.hidden=true;detailTrigger=null;}
function showDetails(tile){
 if(!tile||activeApp||viewport.clientWidth<700)return;
 clearTimeout(detailTimer);detailTrigger=tile;
 const app=appFor(tile.dataset.openApp),group=model.expeditions.find(e=>e.id===tile.dataset.expedition);
 const image=app.images.find(c=>c.theme===state.theme)||app.images[0];
 details.innerHTML=`<span class="module-category">${escapeHTML(group.label)}</span><div class="module-identity"><img src="${app.icon}" width="58" height="58" alt=""><h3>${escapeHTML(app.name)}</h3></div><p>${escapeHTML(app.description)}</p><img class="module-preview" src="${image.base}/768.webp" width="336" height="198" alt="${escapeHTML(app.name)} interface"><dl><dt>Version</dt><dd>${escapeHTML(app.metadata.version)}</dd><dt>Release</dt><dd>${escapeHTML(app.metadata.release)}</dd></dl>`;
 const left=Number.parseFloat(tile.style.left)+66,top=Number.parseFloat(tile.style.top)+50;
 details.style.left=`${left+tile.offsetWidth+384<1229?left+tile.offsetWidth+12:Math.max(18,left-384)}px`;
 details.style.top=`${Math.min(Math.max(50,top),310)}px`;
 details.hidden=false;
}
home.addEventListener('pointerover',e=>{const tile=e.target.closest('.app-tile');if(tile&&e.pointerType!=='touch'&&tile!==detailTrigger)showDetails(tile);});
home.addEventListener('pointerout',e=>{if(e.target.closest('.app-tile')&&!e.relatedTarget?.closest('.app-tile,.module-details'))detailTimer=setTimeout(closeDetails,120);});
home.addEventListener('focusin',e=>{if(e.target.matches('.app-tile'))showDetails(e.target);});
home.addEventListener('focusout',e=>{if(!e.relatedTarget?.closest('.app-tile,.module-details'))closeDetails();});
details.addEventListener('pointerenter',()=>clearTimeout(detailTimer));
details.addEventListener('pointerleave',closeDetails);
document.addEventListener('visibilitychange',()=>{if(document.hidden)closeDetails();});
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)closeDetails();}).observe(stage);

async function showCapture(next){
 if(!activeApp)return;
 const token=++request;
 index=(next+activeImages.length)%activeImages.length;
 const item=activeImages[index];
 const src=`${item.base}/${viewport.clientWidth*devicePixelRatio>1300?'2560':'1280'}.webp`;
 const loading=capture.querySelector('.capture-status');
 loading.hidden=false;loading.textContent='Loading capture…';
 status.textContent=`Opening ${activeApp.name}`;
 if(!imageCache.has(src)){
  const image=new Image();image.src=src;
  imageCache.set(src,image.decode().then(()=>src).catch(error=>{imageCache.delete(src);throw error;}));
 }
 try{await imageCache.get(src);}catch{if(token===request){loading.textContent='Capture could not load. Use the next capture to try again.';status.textContent=loading.textContent;}return;}
 if(token!==request||!activeApp)return;
 const image=capture.querySelector('img');
 image.src=src;image.alt=`${activeApp.name} — ${item.caption}`;image.width=item.width;image.height=item.height;
 loading.hidden=true;
 if(!reduced.matches)image.animate([{opacity:.35},{opacity:1}],{duration:240,easing:'ease-out'});
 stage.querySelector('[data-product-count]').textContent=`${index+1} / ${activeImages.length}`;
 stage.querySelector('[data-product-name]').textContent=activeApp.name;
 controls.querySelectorAll('button[data-product-prev],button[data-product-next]').forEach(b=>b.disabled=activeImages.length<2);
 status.textContent=`${activeApp.name}, capture ${index+1} of ${activeImages.length}`;
}
function openApp(id,trigger){
 const app=appFor(id);if(!app)return;
 closeDetails();returnTrigger=trigger||returnTrigger;activeApp=app;
 activeImages=app.images.filter(c=>c.theme===state.theme||c.theme==='shared');
 if(!activeImages.length)activeImages=app.images;
 product.hidden=true;capture.hidden=false;controls.hidden=false;
 stage.querySelector('.product-home-status').hidden=true;picker.value=id;
 capture.querySelector('img').removeAttribute('src');
 stage.querySelector('[data-product-name]').textContent=app.name;
 stage.querySelector('[data-product-count]').textContent='';
 controls.querySelectorAll('[data-product-prev],[data-product-next]').forEach(button=>button.disabled=activeImages.length<2);
 showCapture(0);
 stage.querySelector('[data-product-home]').focus({preventScroll:true});
}
function goHome(){
 request++;activeApp=null;capture.hidden=true;product.hidden=false;controls.hidden=true;
 stage.querySelector('.product-home-status').hidden=false;picker.value='';status.textContent='ARTIFACTS homepage';
 layout();
 if(returnTrigger?.getBoundingClientRect().width)returnTrigger.focus({preventScroll:true});
 closeDetails();
}
function settings(){
 const info=model.softwareInfo;
 drawer.querySelector('.settings-content').innerHTML=`<h4>ARTIFACTS</h4><p>${escapeHTML(info.description)}</p>${Object.entries(info.details).map(([key,value])=>`<div><span>${escapeHTML(key)}</span><strong>${escapeHTML(value)}</strong></div>`).join('')}`;
 drawer.hidden=!drawer.hidden;product.querySelectorAll('[data-settings]').forEach(b=>b.setAttribute('aria-expanded',String(!drawer.hidden)));
}
product.addEventListener('click',e=>{
 const button=e.target.closest('button');if(!button)return;
 if(button.hasAttribute('data-open-app'))openApp(button.dataset.openApp,button);
 if(button.hasAttribute('data-home'))goHome();
 if(button.hasAttribute('data-cycle-mode'))setMode(state.mode==='legacy'?'pentimento':'legacy');
 if(button.hasAttribute('data-expand-nav')){closeDetails();product.classList.toggle('nav-expanded');button.setAttribute('aria-expanded',String(product.classList.contains('nav-expanded')));}
 if(button.hasAttribute('data-settings'))settings();
});
stage.querySelector('[data-product-home]').addEventListener('click',goHome);
stage.querySelector('[data-product-prev]').addEventListener('click',()=>showCapture(index-1));
stage.querySelector('[data-product-next]').addEventListener('click',()=>showCapture(index+1));
picker.addEventListener('change',()=>picker.value?openApp(picker.value,picker):goHome());
stage.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(activeApp)goHome();else{closeDetails();drawer.hidden=true;}}
 if(activeApp&&e.target!==picker&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();showCapture(index+(e.key==='ArrowLeft'?-1:1));}
});
document.addEventListener('theme-change',()=>{closeDetails();if(activeApp)openApp(activeApp.id);});
document.addEventListener('mode-change',()=>{
 closeDetails();drawer.hidden=true;
 product.querySelectorAll('[data-mode-name]').forEach(el=>el.textContent=model.modes.find(m=>m.id===state.mode).name);
 product.querySelectorAll('[data-mode-range]').forEach(el=>el.textContent=model.modes.find(m=>m.id===state.mode).range);
 product.querySelector('[data-cycle-mode]').setAttribute('aria-label',`Switch to ${state.mode==='legacy'?'Pentimento':'Legacy'} mode`);
});
document.dispatchEvent(new Event('mode-change'));
