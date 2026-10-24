// A local showcase only: no monitoring, system notifications or server writes.
export const sampleNotifications=Object.freeze([
 {id:'pressure',category:'Limit exceeded',equipment:'AIX-04 · DEMO-1042',message:'Chamber pressure above upper limit',value:'154 mbar',limit:'150 mbar',time:'2 min ago',tone:'alert',unread:true},
 {id:'temperature',category:'Bubbler change due soon',equipment:'GAN4 · TMGa 1',message:'Estimated replacement in 5 days',value:'5 days',limit:'7-day reminder window',time:'On opening ARTIFACTS',tone:'alert',unread:true,bubbler:true},
 {id:'valve',category:'Export complete',equipment:'Telemetry',message:'Selected readings exported successfully',value:'12,480 readings',limit:'Selected signals and dates',time:'25 min ago',tone:'success',unread:false}
]);
export function createNotificationState(storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 let preferences={};try{preferences=JSON.parse(storage?.getItem('artifacts-showcase-notifications')||'{}')||{};}catch{}
 let items=sampleNotifications.map(item=>({...item})),filter='all',enabled=preferences.enabled!==false,mutes=preferences.mutes&&typeof preferences.mutes==='object'&&!Array.isArray(preferences.mutes)?preferences.mutes:{};
 const save=()=>{try{storage?.setItem('artifacts-showcase-notifications',JSON.stringify({enabled,mutes}));}catch{}};
 return {
  get enabled(){return enabled;},setEnabled(value){enabled=Boolean(value);save();},
  muted(id,now=Date.now()){return Number(mutes[id]||0)>now;},
  mute(id,period,now=Date.now()){
   if(!sampleNotifications.some(item=>item.id===id&&item.bubbler)||!['today','week'].includes(period))return;
   const end=new Date(now);if(period==='today'){end.setHours(24,0,0,0);}else{end.setTime(now+7*24*60*60*1000);}
   mutes[id]=end.getTime();save();
  },
  get items(){return items;},get filter(){return filter;},
  get unread(){return items.filter(item=>item.unread).length;},
  get visible(){return items.filter(item=>filter==='all'||item.unread);},
  select(value){if(['all','unread'].includes(value))filter=value;},
  read(id){items=items.map(item=>id==null||item.id===id?{...item,unread:false}:item);},
  remove(id){items=id==null?[]:items.filter(item=>item.id!==id);},
  reset(){items=sampleNotifications.map(item=>({...item}));filter='all';}
 };
}
const glyph=(kind)=>`<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind==='delete'?'<path d="M4 5h12M8 3h4M8 8v6M12 8v6"/><rect x="5" y="5" width="10" height="12" rx="1"/>':`<circle cx="10" cy="10" r="7"/><path d="${kind==='alert'?'M10 6v4m0 4h.01':'m6 10 3 3 5-6'}"/>`}</svg>`;
export function notificationCentre(shell){
 const state=createNotificationState(),trigger=shell.querySelector('[data-notifications]'),panel=shell.querySelector('[data-notification-panel]'),list=panel.querySelector('[data-notification-list]'),tabs=[...panel.querySelectorAll('[data-notification-filter]')];
 const closeButton=panel.querySelector('[data-close-notifications]'),clear=panel.querySelector('[data-delete-notifications]'),readAll=panel.querySelector('[data-read-notifications]');
 const enabled=panel.querySelector('[data-notifications-enabled]');
 function close(focus=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus({preventScroll:true});}
 function render(){
  if(enabled)enabled.checked=state.enabled;
  const badge=trigger.querySelector('[data-notification-badge]');badge.textContent=state.unread;badge.hidden=!state.unread;
  trigger.setAttribute('aria-label',`Notifications, ${state.unread} unread samples`);
  panel.querySelector('[data-notification-count]').textContent=`${state.unread} unread`;
  tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.notificationFilter===state.filter)));
  clear.disabled=!state.items.length;readAll.disabled=!state.unread;
  list.innerHTML=state.visible.map(item=>`<li class="notification-entry" data-notification-id="${item.id}" data-tone="${item.tone}" data-unread="${item.unread}"><div class="notification-entry-heading"><span class="notification-category">${glyph(item.tone)}${item.category}</span><span class="notification-time">${item.time}</span><button type="button" data-delete-notification="${item.id}" aria-label="Delete ${item.equipment} notification">${glyph('delete')}</button></div><h4>${item.equipment}</h4><p>${item.message}</p><dl><div><dt>${item.bubbler?'Estimate':item.id==='valve'?'Exported':'Measured'}</dt><dd>${item.value}</dd></div><div><dt>${item.bubbler?'Reminder':item.id==='valve'?'Scope':'Limit'}</dt><dd>${item.limit}</dd></div></dl>${item.bubbler?`<div class="notification-snooze">${state.muted(item.id)?'<span>Reminder muted</span>':''}<button type="button" data-mute-notification="${item.id}" data-period="today">Don't show again today</button><button type="button" data-mute-notification="${item.id}" data-period="week">Mute for 1 week</button></div>`:''}${item.unread?`<button type="button" class="notification-read" data-read-notification="${item.id}">Mark as read</button>`:''}</li>`).join('')||'<li class="notification-empty"><strong>All caught up</strong><p>No '+(state.filter==='unread'?'unread ':'')+'notifications</p></li>';
 }
 trigger.addEventListener('click',()=>{if(!panel.hidden){close();return;}render();panel.hidden=false;trigger.setAttribute('aria-expanded','true');closeButton.focus({preventScroll:true});});
 closeButton.addEventListener('click',()=>close(true));
 tabs.forEach(tab=>tab.addEventListener('click',()=>{state.select(tab.dataset.notificationFilter);render();}));
 const announce=text=>{panel.querySelector('[data-notification-status]').textContent=text;};
 enabled?.addEventListener('change',()=>{state.setEnabled(enabled.checked);announce(state.enabled?'Showcase notifications enabled':'Showcase notifications disabled; history remains available');render();});
 clear.addEventListener('click',()=>{state.remove();render();announce('All samples deleted');tabs[0].focus({preventScroll:true});});
 readAll.addEventListener('click',()=>{state.read();render();announce('All marked as read');tabs[0].focus({preventScroll:true});});
 panel.querySelector('[data-reset-notifications]').addEventListener('click',()=>{state.reset();render();announce('Samples restored');});
 list.addEventListener('click',event=>{
  const mute=event.target.closest('[data-mute-notification]');
  if(mute){state.mute(mute.dataset.muteNotification,mute.dataset.period);render();announce('Sample reminder muted');return;}
  const remove=event.target.closest('[data-delete-notification]'),read=event.target.closest('[data-read-notification]');
  if(!remove&&!read)return;
  const row=event.target.closest('[data-notification-id]'),index=state.visible.findIndex(item=>item.id===row.dataset.notificationId);
  if(remove){state.remove(remove.dataset.deleteNotification);announce('Notification deleted');}else{state.read(read.dataset.readNotification);announce('Marked as read');}
  render();const rows=[...list.querySelectorAll('.notification-entry')],next=rows[Math.min(index,rows.length-1)];
  (next?.querySelector('button')||tabs[0]).focus({preventScroll:true});
 });
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}});
 trigger.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();close();}});
 document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close();});
 document.addEventListener('focusin',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close();});
 render();
}
