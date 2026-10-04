import { model, state, setMode } from './state.js';
import { motionStrip } from './native-motion.js';

const shell=document.querySelector('.app-shell');
const home=document.querySelector('.app-home');
const details=document.querySelector('.module-details');
const drawer=document.querySelector('.settings-drawer');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let openRequest=0;
const shellCache=new Map();
const shellStatus=document.querySelector('[data-shell-status]');
let activeApp=null, returnCard=null, detailTimer, previewTimer, detailTrigger=null,restoringFocus=false;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const appFor=id=>model.apps.find(a=>a.id===id);
const allowed=id=>model.expeditions.some(e=>e.mode===state.mode&&e.apps.includes(id));
function closeDetails(){clearTimeout(detailTimer);clearInterval(previewTimer);details.hidden=true;detailTrigger=null;}
async function openApp(id,trigger){
 if(!allowed(id))return;
 closeDetails();
 const request=++openRequest,app=appFor(id);
 shellStatus.textContent=`Opening ${app.name}…`;
 let page=shell.querySelector(`[data-page="${id}"]`);
 if(!page){
  if(!shellCache.has(id))shellCache.set(id,fetch(app.shellPath).then(response=>{if(!response.ok)throw Error('Shell unavailable');return response.text();}).catch(error=>{shellCache.delete(id);throw error;}));
  try{
   const markup=await shellCache.get(id);
   if(request!==openRequest)return;
   const template=document.createElement('template');template.innerHTML=markup;
   page=template.content.querySelector('.app-page');
   if(!page)throw Error('Shell unavailable');
   shell.querySelector('.app-content').append(page);
   if(app.sourceKey==='dt_tab')updateSlots();
   if(app.sourceKey==='laytec_tab')updateZones();
  }catch{if(request===openRequest)shellStatus.textContent='Interface could not load. Select the application to try again.';return;}
 }
 if(request!==openRequest)return;
 shellStatus.textContent='Interactive preview · processing runs in the desktop application';
 returnCard=trigger?.classList.contains('app-tile')?trigger:returnCard;
 shell.querySelectorAll('.app-page').forEach(p=>p.hidden=p!==page);
 activeApp=id;home.hidden=true;shell.dataset.view='app';
 drawer.hidden=true;shell.classList.remove('nav-expanded');
 shell.querySelector('[data-expand-nav]').setAttribute('aria-expanded','false');
 setCurrent();
 page.classList.remove('entering');
 if(!reduced.matches){void page.offsetWidth;page.classList.add('entering');}
 page.querySelector('h2').focus({preventScroll:true});
 shell.dispatchEvent(new CustomEvent('app-opened',{detail:{id}}));
}
function goHome(restore=true){
 openRequest++;shellStatus.textContent='Explore the interactive application';
 closeDetails();shell.querySelectorAll('.app-page').forEach(p=>p.hidden=true);
 activeApp=null;home.hidden=false;shell.dataset.view='home';drawer.hidden=true;setCurrent();
 shell.dispatchEvent(new Event('home-opened'));
 if(restore){const candidate=returnCard?.checkVisibility()?returnCard:home.querySelector(`[data-mode="${state.mode}"] .app-tile`);restoringFocus=true;candidate?.focus({preventScroll:true});restoringFocus=false;}
}
function setCurrent(){
 shell.querySelectorAll('[data-open-app],[data-home]').forEach(b=>{
  const current=activeApp?b.dataset.openApp===activeApp:b.hasAttribute('data-home');
  if(current)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
 });
 shell.querySelectorAll('[data-settings]').forEach(b=>b.setAttribute('aria-expanded',String(!drawer.hidden)));
}
function showDetails(trigger){
 clearTimeout(detailTimer);clearInterval(previewTimer);
 if(!trigger||home.hidden||shell.clientWidth<=700)return;
 detailTrigger=trigger;
 const app=appFor(trigger.dataset.openApp),expedition=model.expeditions.find(e=>e.id===trigger.dataset.expedition);
 const capture=app.images.find(i=>i.theme===state.theme)||app.images[0];
 details.innerHTML=`<span class="module-category">${escapeHTML(expedition.label)}</span><div class="module-identity"><img src="${app.icon}" alt="" width="58" height="58"><h3>${escapeHTML(state.mode==='legacy'?app.legacyName:app.name)}</h3></div><p class="module-description">${escapeHTML(app.description)}</p><div class="module-motion" aria-hidden="true">${motionStrip(app.sourceKey)}</div><dl><dt>Version</dt><dd>${escapeHTML(app.metadata.version)}</dd><dt>Release</dt><dd>${escapeHTML(app.metadata.release)}</dd></dl><img class="module-preview" src="${capture.base}/768.webp" alt="${escapeHTML(app.name)} interface preview" width="336" height="198">`;
 const root=shell.getBoundingClientRect(),rect=trigger.getBoundingClientRect();
 const width=Math.min(372,root.width-64),height=Math.min(565,root.height-64);
 let left=rect.right-root.left+12;
 if(left+width>root.width-14)left=Math.max(14,rect.left-root.left-width-12);
 const top=Math.max(50,Math.min(rect.top-root.top,root.height-height-28));
 details.style.left=`${left}px`;details.style.top=`${top}px`;details.hidden=false;
 const captures=app.images.filter(i=>i.theme===state.theme||i.theme==='shared');let preview=0;
 if(captures.length>1&&!reduced.matches)previewTimer=setInterval(()=>{if(document.hidden||details.hidden)return;preview=(preview+1)%captures.length;details.querySelector('.module-preview').src=`${captures[preview].base}/768.webp`;},1800);
}
home.addEventListener('pointerover',e=>{const tile=e.target.closest('.app-tile');if(tile&&e.pointerType!=='touch'&&tile!==detailTrigger)showDetails(tile);});
home.addEventListener('pointerout',e=>{if(e.target.closest('.app-tile')&&!e.relatedTarget?.closest('.app-tile,.module-details'))detailTimer=setTimeout(closeDetails,150);});
home.addEventListener('focusin',e=>{const tile=e.target.closest('.app-tile');if(tile&&!restoringFocus&&matchMedia('(hover:hover)').matches)showDetails(tile);});
home.addEventListener('focusout',e=>{if(!e.relatedTarget?.closest('.app-tile,.module-details'))closeDetails();});
details.addEventListener('pointerenter',()=>clearTimeout(detailTimer));
details.addEventListener('pointerleave',()=>{detailTimer=setTimeout(closeDetails,150);});
home.addEventListener('scroll',closeDetails,{passive:true});
window.addEventListener('resize',closeDetails,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)closeDetails();});
reduced.addEventListener('change',closeDetails);
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)closeDetails();}).observe(shell);

function settings(){
 const body=drawer.querySelector('.settings-content');
 const info=model.softwareInfo;
 body.innerHTML=`<h4>ARTIFACTS</h4><p>${escapeHTML(info.description)}</p><div class="info-divider">──── · ────</div>${Object.entries(info.details).map(([label,value])=>`<div><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong></div>`).join('')}`;
 drawer.hidden=!drawer.hidden;setCurrent();
}
shell.addEventListener('click',async e=>{
 const button=e.target.closest('button,a');if(!button)return;
 if(button.hasAttribute('data-open-app'))openApp(button.dataset.openApp,button);
 if(button.hasAttribute('data-home'))goHome();
 if(button.hasAttribute('data-cycle-mode'))setMode(state.mode==='legacy'?'pentimento':'legacy');
 if(button.hasAttribute('data-expand-nav')){closeDetails();shell.classList.toggle('nav-expanded');button.setAttribute('aria-expanded',String(shell.classList.contains('nav-expanded')));}
 if(button.hasAttribute('data-settings'))settings();
 if(button.hasAttribute('data-help'))document.querySelector('#preview-help').showModal();
 if(button.hasAttribute('data-toggle-region')){
  const region=button.closest('.app-workspace').querySelector(`[data-region="${button.dataset.toggleRegion}"]`);
  region.hidden=!region.hidden;button.setAttribute('aria-expanded',String(!region.hidden));
  if(/^(Hide|Show) /.test(button.textContent))button.textContent=button.textContent.replace(/^(Hide|Show)/,region.hidden?'Show':'Hide');
 }
 if(button.hasAttribute('data-tab')){
  button.parentElement.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  updateTabs(button);
 }
 if(button.hasAttribute('data-local-toggle'))button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));
 if(button.hasAttribute('data-reset')){const form=button.closest('form');form.reset();if(form.dataset.shell==='dt_tab')form.querySelectorAll('input[type="number"]').forEach(input=>input.value='');form.querySelectorAll('input[type="range"]').forEach(input=>input.dispatchEvent(new Event('input',{bubbles:true})));}
 if(button.hasAttribute('data-clear-check')){const labels=button.closest('form').querySelectorAll('.check');labels.forEach(l=>{if(l.textContent.trim()===button.dataset.clearCheck)l.querySelector('input').checked=false;});}
 if(button.hasAttribute('data-reader-size')){const area=button.closest('form').querySelector('.reader-empty');const size=Math.max(10,Math.min(24,Number(area.dataset.size||13)+Number(button.dataset.readerSize)));area.dataset.size=size;area.style.fontSize=`${size}px`;}
});
shell.addEventListener('submit',e=>e.preventDefault());
shell.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!details.hidden)closeDetails();else if(!drawer.hidden){drawer.hidden=true;setCurrent();}else if(activeApp)goHome();}});
shell.addEventListener('change',e=>{
 if(e.target.closest('.anchor-picker'))updateZones();
 if(e.target.closest('.thermal-observations')){
  const form=e.target.closest('form'),groups=[...form.querySelectorAll('.observation-groups .native-panel')];
  const missing=groups.filter(group=>!group.querySelector('input:checked')).map(group=>group.querySelector('h4').textContent);
  const status=form.querySelector('.diagnosis-empty p');
  status.textContent=missing.length?`Missing: ${missing.join(', ')}`:'Selections ready. Diagnosis is available in the desktop application.';
 }
});
shell.addEventListener('input',e=>{
 const input=e.target;if(input.type==='range'){input.parentElement.querySelector('output').value=input.value;}
 if(input.hasAttribute('data-outer-min'))input.value=Math.min(+input.value,+shell.querySelector('[data-outer-max]').value);
 if(input.hasAttribute('data-outer-max'))input.value=Math.max(+input.value,+shell.querySelector('[data-outer-min]').value);
 if(input.matches('[data-slots]'))updateSlots();
 if(input.closest('.baseplate-inputs'))updateAssignmentState();
 if(input.closest('[data-shell="laytec_tab"]'))updateZones();
});
document.addEventListener('theme-change',()=>{if(detailTrigger)showDetails(detailTrigger);});
document.addEventListener('mode-change',()=>{
 openRequest++;shellStatus.textContent=activeApp?'Interactive preview · processing runs in the desktop application':'Explore the interactive application';
 closeDetails();if(activeApp&&!allowed(activeApp))goHome(false);
 document.querySelectorAll('[data-mode-name]').forEach(el=>el.textContent=model.modes.find(m=>m.id===state.mode).name);
 document.querySelectorAll('[data-mode-range]').forEach(el=>el.textContent=model.modes.find(m=>m.id===state.mode).range);
 document.querySelector('[data-cycle-mode]').setAttribute('aria-label',`Switch to ${state.mode==='legacy'?'Pentimento':'Legacy'} mode`);
});

function updateTabs(button){
 const group=button.parentElement.dataset.tabs,index=Number(button.dataset.tab),form=button.closest('form');
 if(group==='dt-mode'){
  form.dataset.mapping=index?'temperature':'weight';
  form.querySelector('[data-dt-heading]').textContent=index?'Temperature-Based Reassignment':'Weight-Based Initial Assignment';updateSlots();
 }
 if(group==='compiler-mode'){
  // Input visibility follows the source's two workflows; it never starts compilation.
  form.dataset.compilerMode=index;
 }
 if(group==='lens-mode')form.querySelector('select[aria-label="Variables"]').options[0].textContent=['Variables','Wafer Parameter','Run Parameter','Distribution Variable','Profile Parameter'][index];
 if(group==='reader-mode')form.querySelector('.reader-empty').setAttribute('aria-label',`${button.textContent} · empty comparison`);
}
function updateSlots(){
 const form=shell.querySelector('[data-shell="dt_tab"]'),count=Number(form.querySelector('[data-slots]').value);
 const isTemperature=form.dataset.mapping==='temperature';
 const columns=form.querySelector('.baseplate-inputs');
 const previous=[...columns.children].map(col=>[...col.querySelectorAll('input')].map(i=>i.value));
 columns.innerHTML=['Without Baseplates',isTemperature?'With Baseplates':'Baseplate Weights'].map((title,col)=>`<div><h4>${title}</h4>${Array.from({length:count},(_,i)=>`<label class="field"><span>${col?'BP':'S'}${i+1}</span><input type="number" step="any" aria-label="${title} ${i+1}" placeholder="–" value="${escapeHTML(previous[col]?.[i]||'')}"></label>`).join('')}</div>`).join('');
 const svg=form.querySelector('.reactor-geometry');
 svg.querySelectorAll('.reactor-pocket,text').forEach(el=>el.remove());
 for(let i=0;i<count;i++){const angle=-Math.PI/2+i*2*Math.PI/count,x=300+Math.cos(angle)*195,y=300+Math.sin(angle)*195;svg.insertAdjacentHTML('beforeend',`<circle class="reactor-pocket" cx="${x}" cy="${y}" r="${count>6?55:83}"/><text x="${x}" y="${y-40}" text-anchor="middle">S${i+1}</text>`);}
 updateAssignmentState();
}
function updateAssignmentState(){
 const form=shell.querySelector('[data-shell="dt_tab"]');
 const missing=[...form.querySelectorAll('.baseplate-inputs input')].filter(i=>i.value==='').length;
 form.querySelector('.assignment-status').textContent=missing?'Assignment: awaiting complete inputs':'Inputs ready · calculation runs in the desktop application';
 form.querySelector('.assignment-status + .muted').textContent=missing?`${missing} input values missing.`:'No assignment has been calculated in this browser preview.';
}
function updateZones(){
 const form=shell.querySelector('[data-shell="laytec_tab"]'),svg=form.querySelector('.zone-rays');
 const ranges=[...form.querySelectorAll('input[type="range"]')].map(i=>Number(i.value));
 const anchors=[...form.querySelectorAll('.anchor-picker input:checked')].map(i=>Number(i.value));
 const content=[];
 for(let g=0;g<2;g++){
  const base=-90+anchors[g]*72,spread=ranges[0],radius=194;
  for(const offset of (g?[-ranges[2],-ranges[1],ranges[1],ranges[2]]:[-spread,spread])){const angle=(base+offset)*Math.PI/180,x=300+Math.cos(angle)*radius,y=300+Math.sin(angle)*radius;content.push(`<g class="${g?'outer-zone':'inner-zone'}"><path d="M300 300L${x} ${y}"/><circle cx="${x}" cy="${y}" r="4"/><text x="${x+7}" y="${y-6}">${offset>0?'+':''}${offset}°</text></g>`);}
 }
 svg.innerHTML=content.join('');
}
document.dispatchEvent(new Event('mode-change'));

export {openApp,goHome};
