/** The desktop Suture picker, with standard keyboard menu interaction. */
export function appearanceMenu(shell,select){
 const trigger=shell.querySelector('[data-toggle-theme]'),menu=shell.querySelector('.theme-menu');
 const items=[...menu.querySelectorAll('[data-theme-choice]')];
 function close(restore=false){menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus({preventScroll:true});}
 function open(last=false){menu.hidden=false;trigger.setAttribute('aria-expanded','true');(last?items.at(-1):items.find(item=>item.getAttribute('aria-checked')==='true')||items[0]).focus({preventScroll:true});}
 trigger.addEventListener('click',()=>menu.hidden?open():close(true));
 trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(event.key==='ArrowUp');}});
 menu.addEventListener('click',event=>{const item=event.target.closest('[data-theme-choice]');if(item){select(item.dataset.themeChoice);close(true);}});
 menu.addEventListener('keydown',event=>{
  const index=items.indexOf(document.activeElement);
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
   items[next].focus({preventScroll:true});
  }else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);}
  else if(event.key==='Tab')close();
 });
 document.addEventListener('pointerdown',event=>{if(!event.target.closest('.theme-control'))close();});
 shell.addEventListener('focusout',event=>{if(!event.relatedTarget?.closest('.theme-control'))close();});
 document.addEventListener('experience-change',()=>close());
 return {close};
}
