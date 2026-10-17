// A local showcase only: no monitoring, system notifications or server writes.
export const sampleNotifications=Object.freeze([
 {id:'pressure',category:'Limit exceeded',equipment:'AIX-04 · DEMO-1042',message:'Chamber pressure above upper limit',value:'154 mbar',limit:'150 mbar',time:'2 min ago',tone:'alert',unread:true},
 {id:'temperature',category:'Recovered',equipment:'AIX-02 · DEMO-1038',message:'Temperature back within limits',value:'1,045 °C',limit:'1,050 °C',time:'12 min ago',tone:'success',unread:true},
 {id:'valve',category:'Recovered excursion',equipment:'AIX-07 · DEMO-1031',message:'Throttle valve position returned to its normal range',value:'42%',limit:'80%',time:'25 min ago',tone:'success',unread:false}
]);
export function createNotificationState(){
 let items=sampleNotifications.map(item=>({...item})),filter='all';
 return {
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
 function close(focus=false){panel.hidden=true;trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus({preventScroll:true});}
 function render(){
  const badge=trigger.querySelector('[data-notification-badge]');badge.textContent=state.unread;badge.hidden=!state.unread;
  trigger.setAttribute('aria-label',`Notifications, ${state.unread} unread samples`);
  panel.querySelector('[data-notification-count]').textContent=`${state.unread} unread`;
  tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.notificationFilter===state.filter)));
  clear.disabled=!state.items.length;readAll.disabled=!state.unread;
  list.innerHTML=state.visible.map(item=>`<li class="notification-entry" data-notification-id="${item.id}" data-tone="${item.tone}" data-unread="${item.unread}"><div class="notification-entry-heading"><span class="notification-category">${glyph(item.tone)}${item.category}${item.unread?'<i aria-label="Unread"></i>':''}</span><span class="notification-time">${item.time}</span><button type="button" data-delete-notification="${item.id}" aria-label="Delete ${item.equipment} notification">${glyph('delete')}</button></div><h4>${item.equipment}</h4><p>${item.message}</p><dl><div><dt>Measured</dt><dd>${item.value}</dd></div><div><dt>Limit</dt><dd>${item.limit}</dd></div></dl>${item.unread?`<button type="button" class="notification-read" data-read-notification="${item.id}">Mark as read</button>`:''}</li>`).join('')||'<li class="notification-empty"><strong>All caught up</strong><p>No '+(state.filter==='unread'?'unread ':'')+'notifications</p></li>';
 }
 trigger.addEventListener('click',()=>{if(!panel.hidden){close();return;}render();panel.hidden=false;trigger.setAttribute('aria-expanded','true');closeButton.focus({preventScroll:true});});
 closeButton.addEventListener('click',()=>close(true));
 tabs.forEach(tab=>tab.addEventListener('click',()=>{state.select(tab.dataset.notificationFilter);render();}));
 const announce=text=>{panel.querySelector('[data-notification-status]').textContent=text;};
 clear.addEventListener('click',()=>{state.remove();render();announce('All samples deleted');tabs[0].focus({preventScroll:true});});
 readAll.addEventListener('click',()=>{state.read();render();announce('All marked as read');tabs[0].focus({preventScroll:true});});
 panel.querySelector('[data-reset-notifications]').addEventListener('click',()=>{state.reset();render();announce('Samples restored');});
 list.addEventListener('click',event=>{
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
