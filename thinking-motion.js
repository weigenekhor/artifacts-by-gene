// One score, one playhead. Physical layers settle, connections resolve, evidence is ordered.
export function animateThinking(cycle){
 const duration=6000,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=[];let playing=false,wasReduced=reduced.matches;
 const ease='cubic-bezier(.22,.61,.36,1)';
 function track(selector,frames){
  const target=cycle.querySelector(selector);if(!target)return;
  const animation=target.animate(frames.map(([time,frame])=>({offset:time/duration,...frame,easing:ease})),{duration,iterations:Infinity,fill:'both'});
  animation.pause();animation.currentTime=0;animations.push(animation);
 }
 // Friction: reveal the existing layers, then bring them back into one stack.
 // The top layer owns its wafer; no independently animated outline can drift.
 for(let i=0;i<6;i++)track(`.layer-${i}`,[[0,{transform:'none'}],[350,{transform:'none'}],[1500,{transform:`translateY(${(2.5-i)*6}px)`}],[2400,{transform:`translateY(${(2.5-i)*6}px)`}],[4100,{transform:'none'}],[duration,{transform:'none'}]]);
 // Structure: whole solids separate, then each returns to its exact anchor.
 const travel={back:'translate(0px,-14px)',left:'translate(-16px,8px)',right:'translate(16px,8px)',front:'translate(0px,16px)'};
 ['back','left','right','front'].forEach((name,i)=>{
  track(`.block-${name}`,[[0,{transform:'none'}],[350,{transform:'none'}],[1450,{transform:travel[name]}],[2100+i*220,{transform:travel[name]}],[3000+i*220,{transform:'none'}],[duration,{transform:'none'}]]);
  track(`.block-${name} .instrument-face`,[[0,{fill:'#101317',stroke:'#88919c'}],[2100+i*220,{fill:'#101317',stroke:'#88919c'}],[2750+i*220,{fill:'#1b232b',stroke:'#becbd6'}],[3800+i*220,{fill:'#101317',stroke:'#88919c'}],[duration,{fill:'#101317',stroke:'#88919c'}]]);
 });
 // Refinement: a review advances through the existing planes, one at a time.
 for(let i=0;i<10;i++){
  const start=450+i*320;
  track(`.sheet-${i}`,[[0,{transform:'none'}],[start,{transform:'none'}],[start+350,{transform:'translateY(-16px)'}],[start+650,{transform:'translateY(-16px)'}],[start+1000,{transform:'none'}],[duration,{transform:'none'}]]);
  track(`.sheet-${i} .instrument-face`,[[0,{fill:'#101317',stroke:'#88919c'}],[start,{fill:'#101317',stroke:'#88919c'}],[start+350,{fill:'#1b232b',stroke:'#becbd6'}],[start+1000,{fill:'#101317',stroke:'#88919c'}],[duration,{fill:'#101317',stroke:'#88919c'}]]);
 }
 function sync(){
  const run=cycle.dataset.motion==='running'&&cycle.dataset.revealed==='true'&&!reduced.matches;
  if(reduced.matches){animations.forEach(a=>{a.pause();a.currentTime=5900});playing=false;wasReduced=true;return;}
  if(run===playing)return;
  const time=wasReduced?0:(animations[0]?.currentTime||0);wasReduced=false;
  animations.forEach(a=>{a.pause();a.currentTime=time});
  if(run){const start=(document.timeline.currentTime||0)-time;animations.forEach(a=>{a.play();a.startTime=start});}
  playing=run;
 }
 const observer=new MutationObserver(sync);observer.observe(cycle,{attributes:true,attributeFilter:['data-motion','data-revealed']});
 reduced.addEventListener('change',sync);sync();
 return()=>{observer.disconnect();reduced.removeEventListener('change',sync);animations.forEach(a=>a.cancel())};
}
