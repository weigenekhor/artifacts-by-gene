/** Whole elapsed local calendar years and months since 28 August 2022. */
export function calendarAge(date=new Date()){
 let months=(date.getFullYear()-2022)*12+date.getMonth()-7;
 if(date.getDate()<28)months--;
 months=Math.max(0,months);
 return `${Math.floor(months/12)}y ${months%12}m`;
}
export function maintainApplicationAge(element){
 let timer;
 function update(){
  clearTimeout(timer);const now=new Date(),value=calendarAge(now);
  if(element.textContent!==value)element.textContent=value;
  const midnight=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  timer=setTimeout(update,Math.max(25,Math.min(60000,midnight-now+25)));
 }
 const visible=()=>{if(!document.hidden)update();};
 document.addEventListener('visibilitychange',visible);
 window.addEventListener('pageshow',update);
 window.addEventListener('pagehide',()=>clearTimeout(timer));
 update();
}
