// One score, one playhead. Physical layers settle, connections resolve, evidence is ordered.
export function animateThinking(cycle){
 const duration=12000,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=[];let playing=false,wasReduced=reduced.matches;
 const ease='cubic-bezier(.22,.61,.36,1)';
 function track(selector,frames){
  const target=cycle.querySelector(selector);if(!target)return;
  const animation=target.animate(frames.map(([time,frame])=>({offset:time/duration,...frame,easing:ease})),{duration,iterations:Infinity,fill:'both'});
  animation.pause();animation.currentTime=0;animations.push(animation);
 }
 for(let i=0;i<6;i++)track(`.layer-${i}`,[[0,{transform:'none'}],[500,{transform:'none'}],[1800,{transform:`translateY(${-i*1.3}px)`}],[2900,{transform:`translateY(${-i*1.3}px)`}],[3900,{transform:'none'}],[duration,{transform:'none'}]]);
 track('.retained-reference',[[0,{transform:'none'}],[500,{transform:'none'}],[1800,{transform:'translateY(-6.5px)'}],[2900,{transform:'translateY(-6.5px)'}],[3900,{transform:'none'}],[duration,{transform:'none'}]]);
 function signal(selector,start,end){track(selector,[[0,{opacity:0,strokeDasharray:1,strokeDashoffset:1}],[start,{opacity:0,strokeDashoffset:1}],[start+300,{opacity:.8,strokeDashoffset:1}],[end,{opacity:.8,strokeDashoffset:0}],[end+1000,{opacity:0,strokeDashoffset:0}],[duration,{opacity:0,strokeDashoffset:0}]]);}
 signal('.reference-signal',900,2000);signal('.plate-edge',1900,3000);
 ['back','left','right','front'].forEach((name,i)=>{const start=3800+i*160;track(`.block-${name}`,[[0,{transform:'none'}],[start,{transform:'none'}],[start+650,{transform:'translateY(-5px)'}],[start+1200,{transform:'translateY(-5px)'}],[start+2050,{transform:'none'}],[duration,{transform:'none'}]]);});
 signal('.structure-link',4300,5400);track('.block-check',[[0,{opacity:0}],[5100,{opacity:0}],[5700,{opacity:1}],[6900,{opacity:0}],[duration,{opacity:0}]]);
 for(let i=0;i<10;i++){const start=7300+i*95;track(`.sheet-${i}`,[[0,{transform:'none'}],[start,{transform:'none'}],[start+540,{transform:'translateY(-5px)'}],[start+1250,{transform:'none'}],[duration,{transform:'none'}]]);}
 function sync(){
  const run=cycle.dataset.motion==='running'&&cycle.dataset.revealed==='true'&&!reduced.matches;
  if(reduced.matches){animations.forEach(a=>{a.pause();a.currentTime=11200});playing=false;wasReduced=true;return;}
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
