// Geometry translated from the desktop ModuleMotionStrip, not engineering results.
// This small illustration runs only while the actual source hover panel is open.
export function motionStrip(key){
 let marks='';
 if(key==='topotracer_tab'){
  for(const radius of [14,24,35,47,60,74])marks+=`<ellipse cx="164" cy="52" rx="${radius*1.52}" ry="${radius*.5}" opacity="${.2+radius/120}"/>`;
 }else if(['xml_tab','xmlll_tab','sap_tab'].includes(key)){
  for(let side=0;side<2;side++)for(let i=0;i<5;i++)marks+=`<path d="M${28+side*168} ${20+i*14}h${94-i*8}" opacity="${.3+i*.12}"/>`;
 }else if(key==='wafercount_tab'){
  for(let row=0;row<4;row++)for(let col=0;col<8;col++)marks+=`<circle cx="${28+col*40}" cy="${20+row*21}" r="4" fill="currentColor" opacity="${.25+(row+col)%4*.15}"/>`;
 }else if(key==='laytec_tab'||key==='dt_tab'){
  for(let i=0;i<7;i++)marks+=`<path d="M24 90  ${60+i*40} ${20+Math.abs(i-3)*8}" opacity="${.2+i*.1}"/>`;
 }else if(key==='metro_tab'){
  marks='<rect x="26" y="18" width="118" height="68" rx="7"/><rect x="214" y="24" width="94" height="56" rx="7"/>';
  for(let i=0;i<3;i++)marks+=`<path d="M228 ${38+i*14}h66"/><path d="M44 ${34+i*18}h80" opacity=".35"/>`;
 }else{
  for(let lane=0;lane<3;lane++){let points='';for(let i=0;i<11;i++)points+=`${22+i*29},${26+lane*26+Math.sin(i*.92+lane*1.5)*6} `;marks+=`<polyline points="${points}" opacity="${.35+lane*.23}"/>`;}
 }
 return `<svg viewBox="0 0 336 104" fill="none" stroke="currentColor" stroke-width="1.35">${marks}<path class="scanner" d="M168 12V92" opacity=".45" stroke="#e5e8ec"/></svg>`;
}
