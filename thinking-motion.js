// One score, one playhead. Native animations share an exact start time and pause together.
// Times: friction .3–2.2, transfer .75, structure 2.95–4.85, transfer .75,
// refinement 5.6–7.5, settle .7, rest 2.6, quiet reset .5 seconds.
export function animateThinking(cycle){
 const duration=11300,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const animations=[],ease='cubic-bezier(.22,.61,.36,1)';
 let playing=false,wasReduced=reduced.matches;
 function frames(base,steps){
  return [{offset:0,...base,easing:ease},...steps.map(([time,value])=>({offset:time/duration,easing:ease,...value})),{offset:10800/duration,...steps.at(-1)[1],easing:ease},{offset:1,...base}];
 }
 function track(selector,base,steps){
  const target=cycle.querySelector(selector);
  if(!target)return null;
  const animation=target.animate(frames(base,steps),{duration,iterations:Infinity,fill:'both'});
  animation.pause();animation.currentTime=0;animations.push(animation);return animation;
 }
 function draw(selector,start,end){
  const target=cycle.querySelector(selector);
  if(!target)return null;
  target.style.strokeDasharray='1';
  return track(selector,{strokeDashoffset:1},[[start,{strokeDashoffset:1}],[end,{strokeDashoffset:0}]]);
 }
 // Evidence moves into register in sequence, then its actual connecting strokes propagate.
 track('.evidence-a',{transform:'translate(-14px,-8px)',opacity:.45},[[300,{transform:'translate(-14px,-8px)',opacity:.45}],[700,{transform:'translate(0,0)',opacity:1}]]);
 draw('.route-a',550,1050);
 track('.evidence-b',{transform:'translate(-16px,12px)',opacity:.4},[[900,{transform:'translate(-16px,12px)',opacity:.4}],[1350,{transform:'translate(0,0)',opacity:1}]]);
 draw('.route-b',1200,1700);
 track('.retained-context',{transform:'translate(8px,0)'},[[1500,{transform:'translate(8px,0)'}],[2000,{transform:'translate(0,0)'}]]);
 track('.friction-mark',{opacity:.2},[[500,{opacity:1}],[1700,{opacity:1}],[2100,{opacity:.3}]]);
 draw('.comparison-match',1700,2100);
 track('.comparison-match',{transform:'translateY(8px)'},[[1600,{transform:'translateY(8px)'}],[2100,{transform:'translateY(0)'}]]);
 track('.signal-compare',{transform:'translate(199px,122px)',opacity:0},[[2000,{transform:'translate(199px,122px)',opacity:0}],[2100,{transform:'translate(220px,122px)',opacity:1}],[2200,{transform:'translate(278px,122px)',opacity:1}],[2250,{transform:'translate(280px,122px)',opacity:0}]]);

 // Separate paths converge onto the retained row, with two individually drawn checks.
 track('.repeat-upper',{transform:'translateY(0)',opacity:.8},[[2950,{transform:'translateY(0)',opacity:.8}],[3500,{transform:'translateY(19px)',opacity:.12}]]);
 track('.repeat-lower',{transform:'translateY(0)',opacity:.8},[[3150,{transform:'translateY(0)',opacity:.8}],[3700,{transform:'translateY(-17px)',opacity:.12}]]);
 draw('.route-structure',3150,4200);draw('.check-mark-a',3500,3850);draw('.check-mark-b',4000,4350);
 track('.structure-packet',{transform:'translate(89px,131px)',opacity:0},[[3200,{transform:'translate(89px,131px)',opacity:0}],[3280,{transform:'translate(89px,131px)',opacity:1}],[3600,{transform:'translate(129px,131px)',opacity:1}],[3850,{transform:'translate(153px,131px)',opacity:1}],[4100,{transform:'translate(198px,131px)',opacity:1}],[4380,{transform:'translate(222px,131px)',opacity:1}],[4750,{transform:'translate(278px,131px)',opacity:1}],[4850,{transform:'translate(278px,131px)',opacity:0}]]);
 track('.normalised-output',{transform:'translateY(9px)',opacity:.2},[[4400,{transform:'translateY(9px)',opacity:.2}],[4850,{transform:'translateY(0)',opacity:1}]]);

 // Evidence changes a retained condition, adjusts its value, then returns a feedback trace.
 track('.clarity-focus',{fill:'#192c23',stroke:'#7d9a8c'},[[5600,{fill:'#192c23',stroke:'#7d9a8c'}],[6000,{fill:'#344139',stroke:'#dfc6a0'}],[7500,{fill:'#22362a',stroke:'#b9d0bf'}]]);
 draw('.evidence-response',5650,6300);
 track('.adjustment circle',{transform:'translateX(-12px)',fill:'#192c23'},[[6150,{transform:'translateX(-12px)',fill:'#dfc6a0'}],[6950,{transform:'translateX(16px)',fill:'#dfc6a0'}],[7500,{transform:'translateX(12px)',fill:'#b9d0bf'}]]);
 draw('.resolved-check',6900,7350);
 track('.working-structure',{transform:'translate(0,0)'},[[6600,{transform:'translate(0,0)'}],[7450,{transform:'translate(-4px,-4px)'}],[8200,{transform:'translate(0,0)'}]]);
 draw('.feedback-route',7300,8100);
 track('.signal-feedback',{offsetPath:'path("M237 108C290 80 246 34 187 40")',offsetDistance:'0%',transform:'none',opacity:0},[[7300,{offsetDistance:'0%',opacity:0}],[7370,{offsetDistance:'0%',opacity:1}],[8100,{offsetDistance:'100%',opacity:1}],[8250,{offsetDistance:'100%',opacity:0}]]);

 const packet=track('.spine-packet',{opacity:0},[[2200,{opacity:0}],[2250,{opacity:1}],[2920,{opacity:1}],[2950,{opacity:0}],[4850,{opacity:0}],[4900,{opacity:1}],[5570,{opacity:1}],[5600,{opacity:0}]]);
 function measure(){
  const root=cycle.getBoundingClientRect(),drawings=[...cycle.querySelectorAll('.principle-drawing')].map(e=>e.getBoundingClientRect());
  const narrow=matchMedia('(max-width:760px)').matches;
  function point(index,x,y){const r=drawings[index],scale=Math.min(r.width/360,r.height/250);return [r.left-root.left+(r.width-360*scale)/2+x*scale,r.top-root.top+(r.height-250*scale)/2+y*scale];}
  const a=narrow?[0,point(0,0,125)[1]]:point(0,280,125),b=narrow?[0,point(1,0,125)[1]]:point(1,72,125);
  const c=narrow?b:point(1,280,125),d=narrow?[0,point(2,0,125)[1]]:point(2,104,125);
  cycle.querySelector('.system-spine path').setAttribute('d',narrow?`M0 0V${root.height}`:`M0 ${a[1]}H${root.width}`);
  const position=p=>`translate(${p[0]}px,${p[1]-1}px) rotate(${narrow?90:0}deg)`;
  packet.effect.setKeyframes(frames({transform:position(a),opacity:0},[
   [2200,{transform:position(a),opacity:0}],[2250,{transform:position(a),opacity:1,easing:'linear'}],
   [2920,{transform:position(b),opacity:1}],[2950,{transform:position(b),opacity:0}],
   [4850,{transform:position(c),opacity:0}],[4900,{transform:position(c),opacity:1,easing:'linear'}],
   [5570,{transform:position(d),opacity:1}],[5600,{transform:position(d),opacity:0}]
  ]));
 }
 function sync(){
  const run=cycle.dataset.motion==='running'&&cycle.dataset.revealed==='true'&&!reduced.matches;
  if(reduced.matches){animations.forEach(a=>{a.pause();a.currentTime=8200;});playing=false;wasReduced=true;return;}
  if(run===playing)return;
  const time=wasReduced?0:animations[0].currentTime||0;wasReduced=false;
  animations.forEach(a=>{a.pause();a.currentTime=time;});
  if(run){const start=document.timeline.currentTime-time;animations.forEach(a=>{a.play();a.startTime=start;});}
  playing=run;
 }
 const observer=new MutationObserver(sync);observer.observe(cycle,{attributes:true,attributeFilter:['data-motion','data-revealed']});
 const resize=new ResizeObserver(measure);resize.observe(cycle);measure();
 reduced.addEventListener('change',sync);sync();
 return ()=>{observer.disconnect();resize.disconnect();reduced.removeEventListener('change',sync);animations.forEach(a=>a.cancel());};
}
