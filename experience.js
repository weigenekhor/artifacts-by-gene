import { clamp, mix, phase, shotAt, frameFor } from "./motion-math.js";

const root=document.documentElement;
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const desktop=matchMedia("(min-width:1000px) and (min-height:660px)");
const data=JSON.parse(document.querySelector("#camera-data").textContent);
const byId=new Map(data.map(a=>[a.id,a]));
const hero=document.querySelector(".hero");
const heroStage=hero.querySelector(".hero-stage");
const heroTitle=hero.querySelector("h1");
const heroFact=hero.querySelector(".hero-fact");
const heroPrimary=hero.querySelector(".hero-plane--primary");
const heroRear=[...hero.querySelectorAll(".hero-plane--rear")];
const origin=document.querySelector(".origin");
const originStage=origin.querySelector(".origin-stage");
const originCopies=[...origin.querySelectorAll(".origin-copy")];
const originPlanes=[...origin.querySelectorAll(".origin-plane:not(.origin-home)")];
const originHome=origin.querySelector(".origin-home");
const originCount=origin.querySelector(".origin-count");
const originExit=origin.querySelector(".origin-exit");
const context=document.querySelector(".header-context");
const chapters=[...document.querySelectorAll("[data-chapter]")].map(el=>({
  el,run:el.querySelector(".film-run"),stage:el.querySelector(".film-stage"),top:0,range:0,
  scenes:[...el.querySelectorAll("[data-app]")].map(el=>({
    el,data:byId.get(el.dataset.app),visual:el.querySelector(".film-visual"),
    copy:el.querySelector(".film-copy"),slides:[...el.querySelectorAll(".capture-button")],
    caption:el.querySelector(".film-caption"),shots:[...el.querySelectorAll("[data-shot]")],
    controls:el.querySelector(".capture-controls"),count:el.querySelector(".capture-count"),
    track:el.querySelector(".film-images"),anchor:document.querySelector('[data-anchor="'+el.dataset.app+'"]'),
    ratios:[...el.querySelectorAll(".capture-button img")].map(img=>Number(img.getAttribute("width"))/Number(img.getAttribute("height"))),
    offset:0,span:0,current:0,lastLabel:"",mobileIndex:0
  }))
}));
let frame=0,last=0,dirty=true,position=scrollY,enabled=false,height=innerHeight,width=innerWidth;
let geo={heroTop:0,heroRange:1,originTop:0,originRange:1,geneTop:Infinity},focusX=0,focusY=0,pointerX=0,pointerY=0;
let previousContext="",previousActive=null,pendingFocus=null;
const style=(el,value)=>{el.style.transform=value;};
const promote=img=>{if(img.loading!=="eager") img.loading="eager";};
const transform=f=>"translate("+f.x*100+"%,"+f.y*100+"%) scale("+f.scale+")";

function measure(){
  height=innerHeight;width=innerWidth;
  if(enabled){
    for(const c of chapters){
      let offset=0;
      for(const scene of c.scenes){
        scene.offset=offset;scene.span=scene.data.duration*height;
        scene.anchor.style.top=(offset+scene.span*.12)+"px";
        offset+=scene.span;
      }
      c.range=offset;
      c.run.style.height=(offset+height)+"px";
    }
  }
  // All geometry is read once after writes, outside the scroll hot path.
  const heroRect=hero.getBoundingClientRect(),originRect=origin.getBoundingClientRect();
  geo={heroTop:heroRect.top+scrollY,heroRange:Math.max(1,heroRect.height-height),
    originTop:originRect.top+scrollY,originRange:Math.max(1,originRect.height-height),
    geneTop:document.querySelector(".gene").getBoundingClientRect().top+scrollY};
  for(const c of chapters){
    c.top=c.run.getBoundingClientRect().top+scrollY;
    for(const scene of c.scenes){
      if(!enabled) scene.anchor.style.top="";
      scene.staticTop=scene.el.getBoundingClientRect().top+scrollY;
    }
  }
  dirty=false;
}
function heroFrame(p){
  const reveal=phase(p,.02,.85),leave=phase(p,.16,.59);
  heroTitle.style.opacity=String(1-leave);
  style(heroTitle,"translate3d(0,"+(-65*leave)+"px,0) scale("+(1-.08*leave)+")");
  heroFact.style.opacity=String(1-phase(p,.05,.38));
  const endWidth=Math.min(1000,(height-210)*1.5,width*.78);
  const initialWidth=Math.min(width*.67,1110);
  const scale=mix(1,endWidth/initialWidth,reveal);
  const initialLeft=width-width*.04-initialWidth;
  const initialTop=height*.43;
  const x=mix(0,(width-endWidth)/2-initialLeft,reveal)+focusX*7*(1-reveal);
  const y=mix(0,(height-endWidth/1.5)/2+24-initialTop,reveal)+focusY*5*(1-reveal);
  heroPrimary.style.transformOrigin="0 0";
  style(heroPrimary,"translate3d("+x+"px,"+y+"px,0) rotateY("+(-12*(1-reveal)+focusX*1.6)+"deg) rotateX("+(5*(1-reveal)-focusY)+"deg) scale("+scale+")");
  for(const [i,el] of heroRear.entries()){
    const dir=i?1:-1;
    style(el,"translate3d("+(dir*reveal*width*.17)+"px,"+(-reveal*height*.13)+"px,0) rotateY("+(dir*-15+focusX*2)+"deg) scale("+(1-.12*reveal)+")");
    el.style.opacity=String(.6*(1-phase(p,.25,.94)));
  }
  const rgb=[mix(16,238,phase(p,.82,1)),mix(20,234,phase(p,.82,1)),mix(22,227,phase(p,.82,1))];
  heroStage.style.background="rgb("+rgb.join(",")+")";
  hero.querySelector(".hero-foot").style.opacity=String(1-phase(p,.1,.35));
}
function originFrame(p){
  const sequence=p*3.6;
  const active=Math.min(3,Math.floor(sequence));
  originCount.textContent="0"+(active+1)+" / 04";
  for(const [i,el] of originCopies.entries()){
    const enter=i===0?1:phase(sequence,i+.01,i+.16);
    const exit=i===3?0:phase(sequence,i+.76,i+.99);
    el.style.opacity=String(enter*(1-exit)*(i===3?1-phase(p,.94,1):1));
    el.setAttribute("aria-hidden",enter*(1-exit)<.1?"true":"false");
    style(el,"translate3d(0,"+((1-enter)*32-exit*24)+"px,0)");
  }
  // One tool has the frame to itself; only then does the field widen.
  const entries=[.06,.44,.58,.64,.70];
  const gathered=[[.49,.28,.50],[.64,.48,.50],[.45,.63,.38],[.74,.24,.37],[.66,.72,.36]];
  for(const [i,el] of originPlanes.entries()){
    const appear=phase(p,entries[i],entries[i]+.1);
    const gather=phase(p,.50,.79),end=phase(p,.79,.94);
    const [gx,gy,gs]=gathered[i];
    const x=mix(i===0?.49:.60,gx,gather)*width;
    const y=mix(i===0?.38:.55,gy,gather)*height+(1-appear)*height*.17;
    const scale=mix(i===0?.82:.68,gs,gather);
    style(el,"translate3d("+x+"px,"+y+"px,0) rotateY("+mix(-7,-2,gather)+"deg) scale("+scale+")");
    el.style.opacity=String(appear*(1-end));
    el.style.zIndex=String(5-i);
  }
  const resolve=phase(p,.75,.97);
  originHome.style.opacity=resolve>0?"1":"0";
  originHome.style.clipPath="inset(0 "+((1-resolve)*100)+"% 0 0)";
  const handoff=phase(p,.94,1);
  style(originHome,"translate3d("+((1-resolve)*100-handoff*width*.17)+"px,"+((1-resolve)*70-handoff*height*.06)+"px,0) rotateY("+(-10*(1-resolve))+"deg) scale("+mix(.8,1.12,resolve)+")");
  const surface=phase(p,.93,1);
  originStage.style.background="rgb("+[mix(16,230,surface),mix(20,231,surface),mix(22,222,surface)].join(",")+")";
  origin.querySelector(".origin-label").style.opacity=String(1-handoff);
  originExit.style.opacity=String(phase(p,.87,1));
  originExit.style.visibility=p>.85?"visible":"hidden";
}
function sceneFrame(scene,p,active){
  const visible=p>-.12&&p<1.12;
  scene.el.classList.toggle("is-onstage",visible);
  scene.el.classList.toggle("is-active",active);
  scene.el.inert=!active;
  if(!visible)return;
  const enter=phase(p,-.09,.12),exit=phase(p,.9,1.1);
  const opacity=enter*(1-exit);
  scene.copy.style.opacity=active?"1":"0";
  const direction=scene.data.entry==="left"?-1:scene.data.entry==="right"?1:0;
  const x=(1-enter)*direction*width*.19-exit*width*.09;
  const y=(1-enter)*(direction?32:90)-exit*70;
  const turn=(1-enter)*direction*-7+exit*-5;
  scene.visual.style.opacity=String(opacity);
  style(scene.visual,"translate3d("+x+"px,"+y+"px,0) rotateY("+turn+"deg) rotateX("+((1-enter)*3)+"deg) scale("+(1-(1-enter)*.17-exit*.13)+")");
  let shot=shotAt(scene.data.beats,p);
  [shot.a.image,shot.b.image].forEach(i=>promote(scene.slides[i].querySelector("img")));
  const ready=i=>{const image=scene.slides[i].querySelector("img");return image.complete&&image.naturalWidth>0;};
  if(!ready(shot.a.image)||!ready(shot.b.image)){
    const fallback=scene.data.beats.find(b=>b.image===scene.current&&ready(b.image))||scene.data.beats.find(b=>ready(b.image));
    if(fallback)shot={...shot,a:fallback,b:fallback,t:0,frame:frameFor(fallback.focus)};
  }
  const same=shot.a.image===shot.b.image;
  const chosen=same||shot.t<.5?shot.a.image:shot.b.image;
  scene.current=chosen;
  scene.visual.style.setProperty("--ratio",scene.ratios[chosen]);
  const label=shot.t<.5?shot.a.label:shot.b.label;
  if(label!==scene.lastLabel){scene.caption.textContent=label;scene.lastLabel=label;}
  scene.slides.forEach((button,i)=>{
    const on=i===shot.a.image||i===shot.b.image;
    button.style.visibility=on?"visible":"hidden";
    button.classList.toggle("is-current",i===chosen);
    button.inert=i!==chosen||!active;
    button.style.opacity=same?(i===chosen?"1":"0"):i===shot.b.image?String(shot.t):i===shot.a.image?"1":"0";
    if(on){
      const image=button.querySelector("img");promote(image);
      style(image,transform(same?shot.frame:frameFor(i===shot.a.image?shot.a.focus:shot.b.focus)));
    }
  });
  const currentShot=shot.t<.5?shot.index:shot.next;
  scene.shots.forEach((button,i)=>button.setAttribute("aria-current",i===currentShot?"step":"false"));
  const controls=scene.el.querySelector(".shot-nav");
  controls.style.opacity=active?"1":"0";
}
function render(time){
  frame=0;
  if(document.hidden)return;
  if(dirty)measure();
  const dt=Math.min(64,time-(last||time-16));last=time;
  const alpha=1-Math.exp(-dt/72);
  position=Math.abs(position-scrollY)<.15?scrollY:mix(position,scrollY,alpha);
  focusX=Math.abs(focusX-pointerX)<.002?pointerX:mix(focusX,pointerX,alpha);
  focusY=Math.abs(focusY-pointerY)<.002?pointerY:mix(focusY,pointerY,alpha);
  if(enabled){
    if(position<geo.heroTop+geo.heroRange+height)heroFrame(clamp((position-geo.heroTop)/geo.heroRange));
    if(position>geo.originTop-height && position<geo.originTop+geo.originRange+height)originFrame(clamp((position-geo.originTop)/geo.originRange));
  }
  let current=null;
  for(const c of chapters){
    if(enabled){
      const near=position>c.top-height&&position<c.top+c.range+height;
      if(!near)continue;
      const location=clamp(position-c.top,0,c.range-1);
      const active=c.scenes.findLast(s=>location>=s.offset)||c.scenes[0];
      for(const scene of c.scenes)sceneFrame(scene,(location-scene.offset)/scene.span,scene===active);
      if(position>=c.top-height*.2&&position<c.top+c.range+height*.5)current=active;
    }else{
      for(const scene of c.scenes)if(position+height*.45>=scene.staticTop)current=scene;
    }
  }
  if(position+height*.4>=geo.geneTop)current=null;
  const label=current?current.data.chapter+" / "+String(current.data.index).padStart(2,"0")+" of 17":"Engineering software";
  if(label!==previousContext){context.textContent=label;previousContext=label;}
  if(current!==previousActive){previousActive=current;}
  if(pendingFocus&&Math.abs(scrollY-pendingFocus.top)<2&&Math.abs(position-scrollY)<1){
    pendingFocus.scene.el.querySelector("h3").focus({preventScroll:true});pendingFocus=null;
  }
  if(enabled&&(position!==scrollY||focusX!==pointerX||focusY!==pointerY))frame=requestAnimationFrame(render);
  else last=0;
}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(render);}
function reset(){
  cancelAnimationFrame(frame);frame=0;last=0;position=scrollY;
  enabled=desktop.matches&&!reduced.matches;
  root.classList.toggle("cinematic",enabled);
  for(const el of [heroStage,heroTitle,heroFact,heroPrimary,...heroRear,hero.querySelector(".hero-foot"),originStage,origin.querySelector(".origin-label"),...originCopies,...originPlanes,originHome,originExit]){
    el.removeAttribute("style");el.removeAttribute("aria-hidden");
  }
  for(const c of chapters){
    c.run.style.height="";
    for(const scene of c.scenes){
      scene.el.id=enabled?"":scene.data.id;scene.anchor.id=enabled?scene.data.id:"";
      scene.el.inert=false;scene.el.classList.remove("is-active","is-onstage");
      scene.el.querySelector(".shot-nav").hidden=!enabled;
      scene.el.querySelector(".shot-nav").style.opacity="";
      scene.visual.removeAttribute("style");scene.copy.removeAttribute("style");
      scene.controls.hidden=enabled||scene.slides.length<2;
      scene.slides.forEach(slide=>{slide.removeAttribute("style");slide.inert=false;slide.classList.remove("is-current");slide.querySelector("img").style.transform="";});
      scene.anchor.style.top="";
    }
  }
  dirty=true;schedule();
}
function jump(id,beat=0,focus=false,animate=true){
  const chapter=chapters.find(c=>c.scenes.some(s=>s.data.id===id));
  const scene=chapter?.scenes.find(s=>s.data.id===id);
  if(!scene)return;
  if(dirty)measure();
  const p=.12+.73*beat/Math.max(1,scene.data.beats.length-1);
  const top=enabled?chapter.top+scene.offset+scene.span*p:scene.el.getBoundingClientRect().top+scrollY-90;
  if(focus)pendingFocus={scene,top};
  history.replaceState(null,"","#"+id);
  // Deliberate navigation only. Wheel/touch scrolling is never intercepted.
  scrollTo({top,behavior:reduced.matches||!animate?"instant":"smooth"});
}
for(const c of chapters)for(const scene of c.scenes){
  for(const button of scene.slides)button.querySelector("img").addEventListener("load",schedule);
  scene.shots.forEach(button=>button.addEventListener("click",()=>jump(scene.data.id,Number(button.dataset.shot))));
  const move=delta=>{
    scene.mobileIndex=clamp(scene.mobileIndex+delta,0,scene.slides.length-1);
    scene.track.scrollTo({left:scene.mobileIndex*(scene.track.clientWidth+16),behavior:reduced.matches?"instant":"smooth"});
  };
  scene.controls.querySelector(".capture-prev").addEventListener("click",()=>move(-1));
  scene.controls.querySelector(".capture-next").addEventListener("click",()=>move(1));
  scene.track.addEventListener("scroll",()=>{
    if(enabled)return;
    const w=scene.track.clientWidth+16;
    scene.mobileIndex=clamp(Math.round(scene.track.scrollLeft/w),0,scene.slides.length-1);
    scene.count.textContent=String(scene.mobileIndex+1).padStart(2,"0")+" / "+String(scene.slides.length).padStart(2,"0");
    scene.caption.textContent=scene.data.beats.find(beat=>beat.image===scene.mobileIndex).label;
  },{passive:true});
  scene.track.addEventListener("keydown",e=>{
    if(enabled||!["ArrowLeft","ArrowRight"].includes(e.key))return;
    e.preventDefault();move(e.key==="ArrowRight"?1:-1);
  });
}
root.classList.add("has-sequences");

// Index previews stay real, and focus has the same behaviour as pointer hover.
const previews=[...document.querySelectorAll("[data-preview]")];
let previewId=data[0].id,previewTicket=0;
async function preview(id){
  if(id===previewId)return;
  const el=previews.find(p=>p.dataset.preview===id);if(!el)return;
  const ticket=++previewTicket,img=el.querySelector("img");promote(img);
  try{await img.decode();}catch{return;}
  if(ticket!==previewTicket)return;
  previews.forEach(p=>{p.hidden=p!==el;p.classList.toggle("is-current",p===el);});
  if(!reduced.matches)el.animate([{opacity:.3,transform:"translateX(12px) rotateY(-2deg)"},{opacity:1,transform:"none"}],{duration:360,easing:"cubic-bezier(.22,.68,.15,1)"});
  const app=byId.get(id);
  document.querySelector("[data-preview-number]").textContent=String(app.index).padStart(2,"0")+" / 17";
  document.querySelector("[data-preview-chapter]").textContent=app.chapter;
  document.querySelector("[data-preview-name]").textContent=app.name;
  document.querySelector("[data-preview-value]").textContent=app.value;
  document.querySelectorAll("[data-index-target]").forEach(a=>a.classList.toggle("is-current",a.dataset.indexTarget===id));
  previewId=id;
}
document.querySelectorAll("[data-index-target]").forEach(a=>{
  a.addEventListener("pointerenter",()=>preview(a.dataset.indexTarget));
  a.addEventListener("focus",()=>preview(a.dataset.indexTarget));
});
const indexDialog=document.querySelector(".index-dialog");
let indexTrigger=null;
document.querySelectorAll(".index-open").forEach(a=>a.addEventListener("click",e=>{
  if(typeof indexDialog.showModal!=="function")return;
  e.preventDefault();indexTrigger=a;indexDialog.showModal();root.classList.add("modal-open");
}));
indexDialog.querySelector(".index-close").addEventListener("click",()=>indexDialog.close());
indexDialog.addEventListener("click",e=>{if(e.target===indexDialog)indexDialog.close();});
indexDialog.addEventListener("close",()=>{root.classList.remove("modal-open");indexTrigger?.focus({preventScroll:true});});
document.addEventListener("click",e=>{
  const a=e.target.closest('a[href^="#"]');if(!a)return;
  const id=a.getAttribute("href").slice(1);
  if(byId.has(id)){e.preventDefault();if(indexDialog.open)indexDialog.close();jump(id,0,true);}
  else if(indexDialog.open && id==="gene")indexDialog.close();
});
heroStage.addEventListener("pointermove",e=>{
  if(!enabled||e.pointerType!=="mouse")return;
  pointerX=clamp(e.clientX/width*2-1,-1,1);pointerY=clamp(e.clientY/height*2-1,-1,1);schedule();
},{passive:true});
heroStage.addEventListener("pointerleave",()=>{pointerX=pointerY=0;schedule();});
addEventListener("scroll",schedule,{passive:true});
addEventListener("resize",()=>{dirty=true;schedule();},{passive:true});
addEventListener("pageshow",()=>{dirty=true;schedule();});
document.addEventListener("visibilitychange",()=>{
  if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else{position=scrollY;dirty=true;schedule();}
});
reduced.addEventListener("change",reset);desktop.addEventListener("change",reset);
document.fonts.ready.then(()=>{dirty=true;schedule();});
new ResizeObserver(()=>{dirty=true;schedule();}).observe(document.querySelector(".gene"));
reset();
if(byId.has(location.hash.slice(1)))document.fonts.ready.then(()=>requestAnimationFrame(()=>jump(location.hash.slice(1),0,false,false)));

