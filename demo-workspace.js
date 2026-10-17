import {initialDemo,reduceDemo,exportRows,demoCSV} from './demo-model.js';
import {demoMarkup} from './demo-view.js';

export function demoWorkspace(shell,model,onHome){
 const workspace=document.createElement('section');workspace.className='demo-workspace';workspace.hidden=true;workspace.setAttribute('aria-label','Interactive application demo');shell.querySelector('.app-content').append(workspace);
 const states=new Map();let active=null;
 const render=()=>{
  if(!active)return;
  const focused=workspace.contains(document.activeElement)?document.activeElement:null;
  const selector=focused?.matches('select')?`[data-demo-filter="${focused.dataset.demoFilter}"]`:focused?.dataset.demoAction?`[data-demo-action="${focused.dataset.demoAction}"]${focused.dataset.value?`[data-value="${focused.dataset.value}"]`:''}`:null;
  workspace.innerHTML=demoMarkup(model.apps.find(a=>a.id===active),states.get(active));
  if(selector)workspace.querySelector(selector)?.focus({preventScroll:true});
 };
 function close(){active=null;workspace.hidden=true;shell.querySelector('.app-home').hidden=false;shell.querySelectorAll('[data-locate-app]').forEach(b=>b.removeAttribute('aria-current'));shell.querySelector('[data-home]').setAttribute('aria-current','page');}
 function open(id){
  if(!model.apps.some(a=>a.id===id))return;
  active=id;if(!states.has(id))states.set(id,initialDemo(id));
  shell.querySelector('.app-home').hidden=true;workspace.hidden=false;
  shell.querySelector('[data-home]').removeAttribute('aria-current');
  shell.querySelectorAll('[data-locate-app]').forEach(b=>{if(b.dataset.locateApp===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  render();workspace.scrollTop=0;workspace.querySelector('h2').setAttribute('tabindex','-1');workspace.querySelector('h2').focus({preventScroll:true});
 }
 workspace.addEventListener('click',event=>{
  const button=event.target.closest('[data-demo-action]');if(!button||button.disabled)return;
  const type=button.dataset.demoAction;
  if(type==='home'){close();onHome();return;}
  if(type==='export'){
   const url=URL.createObjectURL(new Blob([demoCSV(exportRows(states.get(active)))],{type:'text/csv;charset=utf-8'}));
   const link=document.createElement('a');link.href=url;link.download=`ARTIFACTS-${active}-sample.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
   states.set(active,{...states.get(active),notice:'Sample data exported as CSV.'});render();return;
  }
  states.set(active,reduceDemo(states.get(active),{type,value:type==='view'?Number(button.dataset.value):button.dataset.value}));render();
 });
 workspace.addEventListener('change',event=>{
  const select=event.target.closest('[data-demo-filter]');if(!select)return;
  states.set(active,reduceDemo(states.get(active),{type:'filter',index:Number(select.dataset.demoFilter),value:Number(select.value)}));render();
 });
 return {open,close,get active(){return active;}};
}
