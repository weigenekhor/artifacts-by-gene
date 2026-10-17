import {DEMOS,initialDemo,csv,caseObservations} from './demo-model.js';
import {esc,button,empty} from './demo-view.js';
import {lensView,metrologyView,metriaView,magusView,telemetryView} from './demo-analysis.js';
import {assignmentView,zonesView,diagnosisView,topoView} from './demo-engineering.js';
import {operationsView,documentView,compilerView} from './demo-operations.js';

export function renderDemo(id,data,state){
 const kind=DEMOS[id].kind;
 if(kind==='lens')return lensView(data,state);
 if(kind==='metria')return metriaView(data,state);
 if(kind==='aperture')return metrologyView(kind,data,state);
 if(kind==='magus')return magusView(data,state);
 if(kind==='telemetry')return telemetryView(data,state);
 if(kind==='assignment')return assignmentView(state);
 if(kind==='zones')return zonesView(state);
 if(kind==='diagnosis')return diagnosisView(data,state);
 if(kind==='topo')return topoView(data,state);
 if(kind==='reader'||kind==='xml')return documentView(kind,data,state);
 if(kind==='compiler'||kind==='report')return compilerView(kind,data,state);
 return operationsView(kind,data,state);
}
export function demoWorkspace(shell,model,onHome){
 const workspace=document.createElement('section');workspace.className='demo-workspace';workspace.hidden=true;workspace.setAttribute('aria-label','Interactive ARTIFACTS sample workspace');shell.querySelector('.app-content').append(workspace);
 const states=new Map(),fixtures=new Map();let active=null,rows=[],request=0;
 const tooltip=document.createElement('div');tooltip.className='demo-tooltip';tooltip.hidden=true;workspace.append(tooltip);
 function state(){return states.get(active);}
 function download(text,name,type='text/csv;charset=utf-8'){
  const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function draw(){
  if(!active||!fixtures.has(active))return;
  const s=state(),data=fixtures.get(active),app=model.apps.find(a=>a.id===active),scroll=workspace.scrollTop;
  const focused=workspace.contains(document.activeElement)?document.activeElement:null,key=focused?.dataset.field,action=focused?.dataset.action,value=focused?.dataset.value;
  const cursor=focused?.type==='text'?focused.selectionStart:null;
  const result=s.loaded?renderDemo(active,data,s):{rows:[],html:empty('The sample is cleared. Load the example to start again.')+button('Load Example','sample')};rows=result.rows;
  workspace.innerHTML=`<header class="demo-app-header"><h2>${esc(app.name)}</h2></header><div class="demo-app-body" data-kind="${DEMOS[active].kind}">${result.html}</div><footer class="demo-footer"><span>Interactive demo · Sample data</span><span role="status">${esc(s.notice||'')}</span>${button('Reset sample','reset')}${button('Home','home')}</footer>`;
  workspace.append(tooltip);tooltip.hidden=true;workspace.scrollTop=scroll;
  if(focused){const replacement=[...workspace.querySelectorAll('input,select,textarea,button')].find(el=>key?el.dataset.field===key:el.dataset.action===action&&el.dataset.value===value);replacement?.focus({preventScroll:true});if(cursor!==null&&replacement?.type==='text')replacement.setSelectionRange(cursor,cursor);}
 }
 function close(){request++;active=null;rows=[];workspace.hidden=true;shell.querySelector('.app-home').hidden=false;shell.querySelectorAll('[data-locate-app]').forEach(b=>b.removeAttribute('aria-current'));shell.querySelector('[data-home]').setAttribute('aria-current','page');}
 async function open(id){
  if(!DEMOS[id])return;active=id;const token=++request;
  shell.querySelector('.app-home').hidden=true;workspace.hidden=false;shell.querySelector('[data-home]').removeAttribute('aria-current');
  shell.querySelectorAll('[data-locate-app]').forEach(b=>{if(b.dataset.locateApp===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(!fixtures.has(id)){
   workspace.innerHTML='<p class="demo-empty" role="status">Loading sample measurements…</p>';
   try{const file=DEMOS[id].file;let data={};if(file){const response=await fetch(`content/demo-data/${file}.json?v=20261017-live`);if(!response.ok)throw Error('Sample file unavailable');data=await response.json();}fixtures.set(id,data);}
   catch{if(active===id&&request===token)workspace.innerHTML=empty('The sample could not load. Please try again.')+button('Retry','retry');return;}
  }
  if(active!==id||request!==token)return;
  if(!states.has(id)){const initial=initialDemo(id,fixtures.get(id));if(DEMOS[id].kind==='magus')initial.days=30;states.set(id,initial);}
  draw();workspace.scrollTop=0;
 }
 function reset(){const next=initialDemo(active,fixtures.get(active));if(DEMOS[active].kind==='magus')next.days=30;states.set(active,next);}
 function setField(key,value){
  const s=state();if(key.includes('.')){const [name,index]=key.split('.');s[name][Number(index)]=value===''?'':Number(value);}
  else if(key==='valuesText')s.values=String(value).trim().split(/[\s,;]+/).map(Number);
  else s[key]=value;
  if(['query','filter','filter2','y','mode','sheet'].includes(key))s.page=0;
  if(key==='count')s.count=Math.min(8,Math.max(3,Number(value)||5));
  if(key==='outerMin'&&Number(value)>Number(s.outerMax))s.outerMax=value;
  if(key==='outerMax'&&Number(value)<Number(s.outerMin))s.outerMin=value;
  if(key==='diagnosis')s.observations=caseObservations(fixtures.get(active),Number(value));
  if(key==='mode'&&DEMOS[active].kind==='aperture'&&value==='Scatter'&&s.x==='DominantWavelength')s.x='Thickness';
  if(key==='mode'&&DEMOS[active].kind==='metria')s.filter=value==='Single Reactor'?'Reactor C':'All';
  if(key==='mode'&&DEMOS[active].kind==='compiler'){s.compiled=false;s.roles=value==='Plessey'?['Plato','Bow','Growth Plan','Limits']:['LayTec','Plato','XRR','XRD'];}
  s.notice='';
 }
 workspace.addEventListener('click',event=>{
  const b=event.target.closest('[data-action]');if(!b)return;
  const {action,value}=b.dataset;
  if(action==='home'){close();onHome();return;}
  if(action==='retry'){open(active);return;}
  if(!state())return;const s=state();
  if(action==='reset')reset();
  if(action==='sample'){if(!s.loaded)reset();else{const {mode,count}=s;reset();Object.assign(state(),{mode,count,notice:'Sample inputs restored.'});if(DEMOS[active].kind==='compiler'&&mode==='Plessey')state().roles=['Plato','Bow','Growth Plan','Limits'];}}
  if(action==='set'){const split=value.indexOf('|');setField(value.slice(0,split),value.slice(split+1));}
  if(action==='toggle')s[value]=!s[value];
  if(action==='set'&&value.startsWith('tab|'))s.expanded=true;
  if(action==='page')s.page=Math.max(0,Number(value));
  if(action==='sort'){s.descending=s.sort===value?!s.descending:false;s.sort=value;}
  if(action==='font')s.fontSize=Math.min(18,Math.max(9,(s.fontSize||11)+Number(value)));
  if(action==='observe'){s.observations||=caseObservations(fixtures.get(active),Number(s.diagnosis));s.observations[b.dataset.key]=value;}
  if(action==='clear-observations')s.observations={};
  if(action==='clear'){if(DEMOS[active].kind==='assignment'){s.baseline=Array(8).fill('');s.weights=Array(8).fill('');s.withbp=Array(8).fill('');}else s.loaded=false;}
  if(action==='compare'){s.compare=true;s.query='';}
  if(action==='swap'){[s.reference,s.target]=[s.target,s.reference];s.compare=true;}
  if(action==='role'){s.roles=s.roles.includes(value)?s.roles.filter(r=>r!==value):[...s.roles,value];s.compiled=false;}
  if(action==='compile'){s.compiled=true;s.notice='Sample measurements compiled. Download the current result below.';}
  if(action==='plot'){
   if(s.values.length!==fixtures.get(active).coordinates.length||s.values.some(v=>!Number.isFinite(v))){s.notice='Enter exactly 49 finite numeric measurements.';}
   else{s.plotted=s.values.slice();s.notice='Surface and profiles recalculated from your measurements.';}
  }
  if(action==='export'){
   if(['xml','reader'].includes(DEMOS[active].kind)){
    const columns=Object.keys(rows[0]||{}),title=model.apps.find(a=>a.id===active).name;
    const report=`<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(title)} sample report</title><style>body{font:14px/1.5 system-ui;margin:40px;color:#252a2d}table{border-collapse:collapse;width:100%}th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd;white-space:pre-wrap}th{background:#eef0f1}</style><h1>${esc(title)}</h1><p>Sample comparison · ${esc(s.reference)} → ${esc(s.target)}</p><table><thead><tr>${columns.map(k=>`<th>${esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${columns.map(k=>`<td>${esc(r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></html>`;
    download(report,`${active}-sample-report.html`,'text/html;charset=utf-8');
   }else download(csv(rows),`${active}-sample.csv`);
   s.notice=`Exported ${rows.length} sample rows.`;
  }
  // Loading an example replaces cleared/edited engineering inputs, as in Qt.
  if(action==='sample'&&['assignment','topo'].includes(DEMOS[active].kind)){const {mode,count}=s;reset();Object.assign(state(),{mode,count});}
  draw();
 });
 // Commit an edited field before its button action. Otherwise blur/change can
 // rebuild the DOM between pointerdown and click and swallow Plot or Compare.
 workspace.addEventListener('pointerdown',event=>{
  const action=event.target.closest('[data-action]'),field=document.activeElement;
  if(!action||!field?.dataset?.field||!workspace.contains(field)||!['INPUT','TEXTAREA'].includes(field.tagName))return;
  if(field.type==='number'&&!field.validity.valid)return;
  event.preventDefault();setField(field.dataset.field,field.type==='checkbox'?field.checked:field.value);
 });
 workspace.addEventListener('change',event=>{
  const el=event.target;if(!el.dataset.field||!state())return;
  if(el.type==='number'&&!el.validity.valid){state().notice='Enter a valid number.';return;}
  setField(el.dataset.field,el.type==='checkbox'?el.checked:el.value);draw();
 });
 // Preserve the document editors and their text selection while scrolling.
 let syncing=false;
 workspace.addEventListener('scroll',e=>{if(syncing||!e.target.hasAttribute?.('data-document-scroll')||state()?.sync===false)return;syncing=true;workspace.querySelectorAll('[data-document-scroll]').forEach(el=>{if(el!==e.target){el.scrollTop=e.target.scrollTop;el.scrollLeft=e.target.scrollLeft;}});requestAnimationFrame(()=>syncing=false);},true);
 workspace.addEventListener('pointermove',e=>{
  const target=e.target.closest('[data-tooltip]');if(!target){tooltip.hidden=true;return;}
  tooltip.textContent=target.dataset.tooltip;tooltip.hidden=false;
  const rect=workspace.getBoundingClientRect(),scale=rect.width/workspace.clientWidth;
  tooltip.style.left=`${Math.min(workspace.clientWidth-250,Math.max(4,(e.clientX-rect.left)/scale+12))}px`;
  tooltip.style.top=`${Math.max(4,(e.clientY-rect.top)/scale+workspace.scrollTop-60)}px`;
 });
 workspace.addEventListener('pointerleave',()=>tooltip.hidden=true);
 return {open,close,refresh:()=>{if(active)draw();},get active(){return active;}};
}
