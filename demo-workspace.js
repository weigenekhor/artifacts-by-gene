import {initialDemo,chooseScene,sceneFor,sceneChoices} from './demo-model.js';
import {nativeSceneMarkup,esc} from './demo-view.js';

export function demoWorkspace(shell,model,onHome){
 const manifest=JSON.parse(document.querySelector('#native-demo-data').textContent);
 const workspace=document.createElement('section');workspace.className='demo-workspace';workspace.hidden=true;workspace.setAttribute('aria-label','ARTIFACTS native sample walkthrough');shell.querySelector('.app-content').append(workspace);
 const states=new Map();let active=null,current=null,request=0;
 function resize(){const stage=workspace.querySelector('.native-demo-stage'),plane=workspace.querySelector('.native-demo-plane');if(stage&&plane&&current)plane.style.zoom=stage.clientWidth/current.width;}
 new ResizeObserver(resize).observe(workspace);
 function menuClose(){workspace.querySelector('.native-demo-menu')?.remove();workspace.querySelectorAll('[aria-expanded=true]').forEach(b=>b.setAttribute('aria-expanded','false'));}
 function footer(record,scene){return `<footer class="native-demo-footer"><span title="${esc(record.fixture)}. Selected controls replay recorded desktop results; no equipment connection or file processing runs here.">Native walkthrough · Sample data</span><label><span class="sr-only">Recorded application view</span><select data-native-scene>${sceneChoices(record,shell.dataset.theme).map(o=>`<option value="${o.value}"${o.value===(scene.transition?.parent||scene.scene)?' selected':''}>${esc(o.label)}</option>`).join('')}</select></label><button type="button" data-native-back${states.get(active)?.previous?'':' disabled'}>Back</button><button type="button" data-native-reset>Reset sample</button><button type="button" data-native-home>Home</button></footer>`;}
 async function render(){
  if(!active)return;
  const id=active,record=manifest.apps[id],app=model.apps.find(a=>a.id===id),scene=sceneFor(record,shell.dataset.theme,states.get(id).scene),token=++request;
  const focused=workspace.contains(document.activeElement),focusLabel=document.activeElement?.getAttribute('aria-label');
  workspace.setAttribute('aria-busy','true');
  if(current&&current.theme!==scene.theme)workspace.querySelector('.native-demo-stage')?.setAttribute('hidden','');
  try{const image=new Image();image.src=scene.image;await image.decode();}catch{if(token===request){workspace.removeAttribute('aria-busy');workspace.innerHTML='<p class="native-demo-error">The native sample could not load. Please refresh the page.</p>';}return;}
  if(token!==request||active!==id)return;
  current=scene;workspace.innerHTML=nativeSceneMarkup(app,record,scene)+footer(record,scene);workspace.removeAttribute('aria-busy');resize();
  if(focused){const same=[...workspace.querySelectorAll('[data-native-control]')].find(b=>b.getAttribute('aria-label')===focusLabel);(same||workspace.querySelector('[data-native-scene]'))?.focus({preventScroll:true});}
 }
 function close(){request++;active=null;current=null;workspace.hidden=true;shell.querySelector('.app-home').hidden=false;shell.querySelectorAll('[data-locate-app]').forEach(b=>b.removeAttribute('aria-current'));shell.querySelector('[data-home]').setAttribute('aria-current','page');}
 function open(id){
  if(!manifest.apps[id])return;active=id;if(!states.has(id))states.set(id,initialDemo(manifest.apps[id]));
  shell.querySelector('.app-home').hidden=true;workspace.hidden=false;shell.querySelector('[data-home]').removeAttribute('aria-current');
  shell.querySelectorAll('[data-locate-app]').forEach(b=>{if(b.dataset.locateApp===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  workspace.innerHTML='<p class="native-demo-loading" role="status">Loading native sample…</p>';render();workspace.scrollTop=0;
 }
 function go(id){if(!active)return;states.set(active,chooseScene(manifest.apps[active],states.get(active),id));render();}
 workspace.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-native-home')){close();onHome();return;}
  if(button.hasAttribute('data-native-reset')){go(manifest.apps[active].initial);return;}
  if(button.hasAttribute('data-native-back')){const previous=states.get(active)?.previous;if(previous)go(previous);return;}
  if(button.dataset.nativeTarget){go(button.dataset.nativeTarget);return;}
  if(!button.hasAttribute('data-native-control')||!current)return;
  const control=current.controls.filter(c=>c.action)[Number(button.dataset.nativeControl)],action=control?.action;if(!action)return;
  if(action.target){go(action.target);return;}
  if(action.download){const link=document.createElement('a');link.href=action.download;link.download=action.download.split('/').pop();link.click();return;}
  if(action.options){
   const wasOpen=button.getAttribute('aria-expanded')==='true';menuClose();if(wasOpen)return;
   button.setAttribute('aria-expanded','true');const menu=document.createElement('div');menu.className='native-demo-menu';menu.setAttribute('role','menu');
   menu.innerHTML=action.options.map(o=>`<button type="button" role="menuitem" data-native-target="${o.target}">${esc(o.label)}</button>`).join('');
   workspace.append(menu);const scale=workspace.querySelector('.native-demo-stage').clientWidth/current.width;
   menu.style.left=`${Math.max(6,Math.min(control.x*scale,workspace.clientWidth-230))}px`;menu.style.top=`${(control.y+control.height)*scale+4}px`;menu.querySelector('button')?.focus({preventScroll:true});
  }
 });
 workspace.addEventListener('change',e=>{if(e.target.matches('[data-native-scene]'))go(e.target.value);});
 workspace.addEventListener('keydown',e=>{const menu=workspace.querySelector('.native-demo-menu');if(!menu)return;if(e.key==='Escape'){e.stopPropagation();const trigger=workspace.querySelector('[aria-expanded=true]');menuClose();trigger?.focus();}if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const items=[...menu.querySelectorAll('button')],index=items.indexOf(document.activeElement);items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus();}});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.native-demo-menu,[data-native-control]'))menuClose();});
 return {open,close,refresh:()=>{if(active)render();},get active(){return active;}};
}
