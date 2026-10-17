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
 // A shared six-second cadence keeps all three studies visibly alive.
 for(let i=0;i<6;i++)track(`.layer-${i}`,[[0,{transform:'none'}],[400,{transform:'none'}],[1800,{transform:`translateY(${(2.5-i)*7}px)`}],[3000,{transform:`translateY(${(2.5-i)*7}px)`}],[4700,{transform:'none'}],[duration,{transform:'none'}]]);
 track('.retained-reference',[[0,{transform:'none'}],[400,{transform:'none'}],[1800,{transform:'translateY(-17.5px)'}],[3000,{transform:'translateY(-17.5px)'}],[4700,{transform:'none'}],[duration,{transform:'none'}]]);
 track('.plate-edge',[[0,{transform:'none'}],[400,{transform:'none'}],[1800,{transform:'translateY(-17.5px)'}],[3000,{transform:'translateY(-17.5px)'}],[4700,{transform:'none'}],[duration,{transform:'none'}]]);
 function signal(selector,start,end){track(selector,[[0,{opacity:0,strokeDasharray:1,strokeDashoffset:1}],[start,{opacity:0,strokeDashoffset:1}],[start+200,{opacity:1,strokeDashoffset:1}],[end,{opacity:1,strokeDashoffset:0}],[end+1000,{opacity:0,strokeDashoffset:0}],[duration,{opacity:0,strokeDashoffset:0}]]);}
 signal('.reference-signal',700,1800);signal('.plate-edge',1700,2900);
 const travel={back:'translate(0px,-16px)',left:'translate(-14px,4px)',right:'translate(14px,4px)',front:'translate(0px,16px)'};
 ['back','left','right','front'].forEach((name,i)=>{const start=250+i*140;track(`.block-${name}`,[[0,{transform:'none'}],[start,{transform:'none'}],[start+950,{transform:travel[name]}],[2600,{transform:travel[name]}],[4100,{transform:'none'}],[duration,{transform:'none'}]]);});
 signal('.structure-link',2700,3800);track('.block-check',[[0,{opacity:0}],[3500,{opacity:0}],[4000,{opacity:1}],[4900,{opacity:1}],[5500,{opacity:0}],[duration,{opacity:0}]]);
 for(let i=0;i<10;i++){const start=350+i*100;track(`.sheet-${i}`,[[0,{transform:'none'}],[start,{transform:'none'}],[start+800,{transform:`translate(${(4.5-i)*2}px,${-18-i*1.4}px)`}],[2900+i*70,{transform:`translate(${(4.5-i)*2}px,${-18-i*1.4}px)`}],[4400+i*70,{transform:'none'}],[duration,{transform:'none'}]]);}
 signal('.evidence-signal',3300,4500);
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
