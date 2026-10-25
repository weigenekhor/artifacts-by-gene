// A local showcase only: no monitoring, system notifications or server writes.
export const sampleNotifications=Object.freeze([
 {id:'pressure',category:'Limit exceeded',equipment:'AIX-04 · DEMO-1042',message:'Chamber pressure above upper limit',value:'154 mbar',limit:'150 mbar',time:'14:28',tone:'alert',unread:true},
 {id:'temperature',category:'Bubbler change due soon',equipment:'GAN4 · TMGa 1',message:'Estimated replacement in 5 days',value:'5 days',limit:'7-day reminder window',time:'14:25',tone:'alert',unread:true,bubbler:true},
 {id:'valve',category:'Telemetry',equipment:'Export complete',message:'Exported 12,480 records to C:\\Users\\Demo\\Documents\\Telemetry_All_tools_2026-10-24_to_2026-10-25.xlsx',value:'12,480 readings',limit:'Selected signals and dates',time:'14:05',tone:'success',unread:false}
]);
export function createNotificationState(storage){
 if(storage===undefined){try{storage=globalThis.localStorage;}catch{storage=null;}}
 let preferences={};try{preferences=JSON.parse(storage?.getItem('artifacts-showcase-notifications')||'{}')||{};}catch{}
 let items=sampleNotifications.map(item=>({...item})),filter='all',enabled=preferences.enabled!==false,mutes=preferences.mutes&&typeof preferences.mutes==='object'&&!Array.isArray(preferences.mutes)?preferences.mutes:{};
 items=items.filter(item=>!item.bubbler||Number(mutes[item.id]||0)<=Date.now());
 const save=()=>{try{storage?.setItem('artifacts-showcase-notifications',JSON.stringify({enabled,mutes}));}catch{}};
 return {
  get enabled(){return enabled;},setEnabled(value){enabled=Boolean(value);save();},
  muted(id,now=Date.now()){return Number(mutes[id]||0)>now;},
  mute(id,period,now=Date.now()){
   if(!sampleNotifications.some(item=>item.id===id&&item.bubbler)||!['today','week'].includes(period))return;
   const end=new Date(now);if(period==='today'){end.setHours(24,0,0,0);}else{end.setTime(now+7*24*60*60*1000);}
   mutes[id]=end.getTime();items=items.filter(item=>item.id!==id);save();
  },
  get items(){return items;},get filter(){return filter;},
  get unread(){return items.filter(item=>item.unread).length;},
  get visible(){return items.filter(item=>filter==='all'||item.unread);},
  select(value){if(['all','unread'].includes(value))filter=value;},
  dismiss(id){items=items.map(item=>item.id===id?{...item,unread:false,dismissed:true}:item);},
  read(id){items=items.map(item=>id==null||item.id===id?{...item,unread:false}:item);},
  remove(id){items=id==null?[]:items.filter(item=>item.id!==id);},
  reset(){items=sampleNotifications.filter(item=>!item.bubbler||Number(mutes[item.id]||0)<=Date.now()).map(item=>({...item}));filter='all';}
 };
}
export function notificationGlyph(kind,size=20){
 const paths={
  bell:'M3.8 14C5.4 12.5 5.4 11.8 5.4 7.7C5.4 1.3 14.6 1.3 14.6 7.7C14.6 11.8 14.6 12.5 16.2 14ZM8.2 16.1a1.8 1.8 0 0 0 3.6 0',
  bell_off:'M5.4 8C5.4 11.8 5.4 12.5 3.8 14H11M7.2 3.7C10.1 1.8 14.6 3.3 14.6 7.7V10.6M3 2.8L17.2 17M8.2 16.1a1.8 1.8 0 0 0 3.6 0',
  read:'M3 10 7 14 15 6M11 14 18 7',close:'M5 5 15 15M15 5 5 15',check:'M3 10 7 14 15 6',
  delete:'M4 5h12M8 3h4M8 8v6M12 8v6',alert:'M10 6v4m0 4h.01',success:'m6 10 3 3 5-6',info:'M10 9v5m0-8h.01'
 };
 const shape=kind==='more'?'<circle cx="5" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="10" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none"/>':`${['alert','success','info'].includes(kind)?'<circle cx="10" cy="10" r="7"/>':''}${kind==='delete'?'<rect x="5" y="5" width="10" height="12" rx="1"/>':''}<path d="${paths[kind]||paths.info}"/>`;
 return `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shape}</svg>`;
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function notificationCard(item){
 const id=esc(item.id);
 return `<li class="notification-entry" data-notification-id="${id}" data-tone="${item.tone}" data-unread="${item.unread}">
 <div class="notification-entry-heading"><span class="notification-category">${notificationGlyph(item.tone,18)}<span>${esc(item.category)}</span></span><span class="notification-time">${esc(item.time)}</span><div class="notification-menu-wrap"><button type="button" class="notification-icon-button" data-notification-options="${id}" aria-label="Notification actions" aria-haspopup="menu" aria-expanded="false">${notificationGlyph('more')}</button><div class="notification-entry-menu" data-notification-menu="${id}" role="menu" hidden><button role="menuitem" data-read-notification="${id}" ${item.unread?'':'disabled'}>Mark as read</button><button role="menuitem" data-dismiss-notification="${id}" ${item.dismissed?'disabled':''}>Dismiss notification</button><button role="menuitem" data-delete-notification="${id}">Delete notification</button></div></div></div>
 <h4>${esc(item.equipment)}</h4><p>${esc(item.message)}</p>
 ${item.id==='pressure'?`<p class="notification-measurement"><strong>${esc(item.value)}</strong> <span>/ Limit ${esc(item.limit)}</span></p>`:''}
 ${item.bubbler?`<div class="notification-snooze"><button type="button" data-mute-notification="${id}" data-period="today">Don't show again today</button><button type="button" data-mute-notification="${id}" data-period="week">Mute for 1 week</button></div>`:''}
 <div class="notification-entry-actions">${item.dismissed?'<span>Dismissed</span>':''}${item.unread?`<button type="button" data-read-notification="${id}">Mark as Read</button>`:''}<button type="button" class="notification-icon-button" data-delete-notification="${id}" aria-label="Delete ${esc(item.equipment)} notification">${notificationGlyph('delete')}</button></div></li>`;
}
export function notificationCentre(shell){
 const state=createNotificationState(),trigger=shell.querySelector('[data-notifications]'),panel=shell.querySelector('[data-notification-panel]'),list=panel.querySelector('[data-notification-list]'),tabs=[...panel.querySelectorAll('[data-notification-filter]')];
 const closeButton=panel.querySelector('[data-close-notifications]'),clear=panel.querySelector('[data-delete-notifications]'),readAll=panel.querySelector('[data-read-notifications]'),enabled=panel.querySelector('[data-notifications-enabled]');
 let menuId=null;
 const announce=text=>{panel.querySelector('[data-notification-status]').textContent=text;};
 function closeMenu(focus=false){
  if(menuId===null)return;
  const menu=list.querySelector(`[data-notification-menu="${menuId}"]`),button=list.querySelector(`[data-notification-options="${menuId}"]`);
  if(menu)menu.hidden=true;if(button){button.setAttribute('aria-expanded','false');if(focus)button.focus({preventScroll:true});}menuId=null;
 }
 function close(focus=false){closeMenu();panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus({preventScroll:true});}
 function render(){
  menuId=null;
  if(enabled){enabled.setAttribute('aria-pressed',String(state.enabled));enabled.innerHTML=notificationGlyph(state.enabled?'bell':'bell_off',16)+`<span>${state.enabled?'On':'Off'}</span>`;}
  const badge=trigger.querySelector('[data-notification-badge]');badge.textContent=state.unread;badge.hidden=!state.enabled||!state.unread;
  trigger.querySelector('[data-notification-bell]').innerHTML=notificationGlyph(state.enabled?'bell':'bell_off',22);
  panel.querySelector('[data-notification-header-icon]').innerHTML=notificationGlyph(state.enabled?'bell':'bell_off',22);
  trigger.setAttribute('aria-label',state.enabled?`Notifications, ${state.unread} new`:'Notifications off');
  const count=panel.querySelector('[data-notification-count]');count.textContent=`${state.unread} new`;count.hidden=!state.enabled||!state.unread;
  tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.notificationFilter===state.filter)));
  clear.disabled=!state.items.length;readAll.disabled=!state.unread;
  list.innerHTML=state.visible.map(notificationCard).join('')||`<li class="notification-empty">${notificationGlyph('check',24)}<strong>All Caught Up</strong><p>No new notifications</p></li>`;
 }
 trigger.addEventListener('click',()=>{if(!panel.hidden){close();return;}render();panel.hidden=false;trigger.setAttribute('aria-expanded','true');closeButton.focus({preventScroll:true});});
 closeButton.addEventListener('click',()=>close(true));
 tabs.forEach(tab=>tab.addEventListener('click',()=>{state.select(tab.dataset.notificationFilter);render();}));
 enabled.addEventListener('click',()=>{state.setEnabled(!state.enabled);announce(state.enabled?'Notifications on':'Notifications off');render();});
 clear.addEventListener('click',()=>{state.remove();render();announce('All notifications deleted');tabs[0].focus({preventScroll:true});});
 readAll.addEventListener('click',()=>{state.read();render();announce('All marked as read');tabs[0].focus({preventScroll:true});});
 list.addEventListener('click',event=>{
  const options=event.target.closest('[data-notification-options]');
  if(options){const id=options.dataset.notificationOptions,wasOpen=menuId===id;closeMenu();if(!wasOpen){menuId=id;const menu=list.querySelector(`[data-notification-menu="${id}"]`);menu.hidden=false;options.setAttribute('aria-expanded','true');menu.querySelector('button:not(:disabled)').focus({preventScroll:true});}return;}
  const mute=event.target.closest('[data-mute-notification]'),remove=event.target.closest('[data-delete-notification]'),read=event.target.closest('[data-read-notification]'),dismiss=event.target.closest('[data-dismiss-notification]');
  if(!mute&&!remove&&!read&&!dismiss)return;
  const row=event.target.closest('[data-notification-id]'),index=state.visible.findIndex(item=>item.id===row.dataset.notificationId);
  if(mute){state.mute(mute.dataset.muteNotification,mute.dataset.period);announce('Reminder muted');}
  else if(remove){state.remove(remove.dataset.deleteNotification);announce('Notification deleted');}
  else if(dismiss){state.dismiss(dismiss.dataset.dismissNotification);announce('Notification dismissed');}
  else{state.read(read.dataset.readNotification);announce('Marked as read');}
  render();const rows=[...list.querySelectorAll('.notification-entry')],next=rows[Math.min(index,rows.length-1)];
  (next?.querySelector('button')||tabs[0]).focus({preventScroll:true});
 });
 panel.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();if(menuId!==null)closeMenu(true);else close(true);}
  else if(menuId!==null&&['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   const buttons=[...list.querySelector(`[data-notification-menu="${menuId}"]`).querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);
   event.preventDefault();buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();
  }
 });
 trigger.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){event.preventDefault();event.stopPropagation();close();}});
 document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close();else if(menuId!==null&&!event.target.closest('.notification-menu-wrap'))closeMenu();});
 document.addEventListener('focusin',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!trigger.contains(event.target))close();else if(menuId!==null&&!event.target.closest('.notification-menu-wrap'))closeMenu();});
 render();
}
