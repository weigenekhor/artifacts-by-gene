import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const read = async file => JSON.parse(await fs.readFile(file,"utf8"));
const [{apps},chapters,homepage,cameras] = await Promise.all([
  read("content/apps.json"),read("content/expeditions.json"),read("content/homepage.json"),read("content/cinematography.json")
]);
const esc = v => String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const num = n => String(n).padStart(2,"0");
const url = (src,c) => src+"?v="+c.sourceSha256.slice(0,10);
const img = (slide,sizes="90vw",priority=false) => {
  const c=slide.capture;
  return '<img src="'+url(c.sources.find(s=>s.width===1120).src,c)+'" srcset="'+c.sources.map(s=>url(s.src,c)+" "+s.width+"w").join(", ")+'" sizes="'+sizes+'" width="'+c.width+'" height="'+c.height+'" alt="'+esc(slide.alt||"ARTIFACTS homepage")+'" loading="'+(priority?"eager":"lazy")+'" '+(priority?'fetchpriority="high" ':"")+'decoding="async">';
};
if(apps.length!==17 || chapters.flatMap(c=>c.apps).join()!==apps.map(a=>a.id).join()) throw Error("Canonical order changed");
for(const app of apps){
  const camera=cameras[app.id];
  if(!camera || !camera.beats.length) throw Error("Missing camera: "+app.id);
  const seen = new Set();
  for(const beat of camera.beats){
    if(!app.images[beat.image]) throw Error("Unknown capture: "+app.id);
    seen.add(beat.image);
    const {x,y,width,height}=beat.focus;
    if(x<0||y<0||width<=0||height<=0||x+width>1.001||y+height>1.001) throw Error("Invalid focus: "+app.id);
  }
  if(seen.size!==app.images.length) throw Error("Camera must include all captures: "+app.id);
}
const chapterFor = app => chapters.find(c=>c.apps.includes(app.id));
const index = (dialog=false) => chapters.map((c,i)=>
  '<div class="index-group"><p class="index-group-label"><span>'+["I","II","III","IV"][i]+'</span>'+esc(c.name)+'</p>'+
  c.apps.map(id=>{
    const a=apps.find(a=>a.id===id);
    return '<a class="index-link'+(a.index===1?" is-current":"")+'" href="#'+id+'" '+(!dialog?'data-index-target="'+id+'"':"")+'><span>'+num(a.index)+'</span><strong>'+esc(a.name)+'</strong><span class="index-arrow" aria-hidden="true">↗</span></a>';
  }).join("")+'</div>').join("");
const planes=[
  '<figure class="hero-plane hero-plane--primary">'+img(homepage,"(min-width:1000px) 1000px, 96vw",true)+'</figure>',
  ...[0,16].map((i,j)=>'<figure class="hero-plane hero-plane--rear hero-plane--rear-'+j+'">'+img(apps[i].images[0],"(min-width:1000px) 640px, 60vw")+'</figure>')
].join("");
const previews=apps.map((a,i)=>'<figure class="index-preview-image'+(i?"":" is-current")+'" data-preview="'+a.id+'" '+(i?'hidden':"")+'>'+img(a.images[0],"(min-width:1000px) 860px, 92vw")+'</figure>').join("");
const originPlanes=[0,7,11,4,16].map((i,j)=>'<figure class="origin-plane" data-plane="'+j+'">'+img(apps[i].images[0],"(min-width:1000px) 750px, 90vw")+'<figcaption>'+esc(apps[i].name)+'</figcaption></figure>').join("")+
  '<figure class="origin-plane origin-home">'+img(homepage,"(min-width:1000px) 950px, 90vw")+'</figure>';
const slide=(app,s,i)=>'<button class="capture-button" data-capture="'+i+'" data-full="'+url(s.capture.src,s.capture)+'" data-name="'+esc(app.name)+'" aria-label="Inspect '+esc(app.name)+', capture '+(i+1)+'" aria-haspopup="dialog" type="button" disabled>'+img(s,"(min-width:1000px) 90vw, 100vw")+'</button>';
const article=app=>{
  const camera=cameras[app.id],c=chapterFor(app);
  return '<article class="film-scene'+(app.index===17?" film-finale":"")+'" id="'+app.id+'" data-app="'+app.id+'" aria-labelledby="'+app.id+'-title">'+
    '<header class="film-copy"><div><p class="film-number">'+num(app.index)+' <span>/ 17</span></p><h3 id="'+app.id+'-title" tabindex="-1">'+esc(app.name)+'</h3></div><p class="film-value">'+esc(app.valueLine)+'</p></header>'+
    '<figure class="film-visual"><div class="film-viewport"><div class="film-images">'+app.images.map((s,i)=>slide(app,s,i)).join("")+'</div></div>'+
    '<figcaption><span class="film-caption">'+esc(camera.beats[0].label)+'</span><span class="film-view">Click to inspect ↗</span></figcaption></figure>'+
    '<div class="capture-controls" hidden><button class="capture-prev" type="button" aria-label="Previous '+esc(app.name)+' capture">←</button><span class="capture-count">01 / '+num(app.images.length)+'</span><button class="capture-next" type="button" aria-label="Next '+esc(app.name)+' capture">→</button></div>'+
    '<nav class="shot-nav" aria-label="'+esc(app.name)+' camera sequence" hidden>'+camera.beats.map((b,i)=>'<button type="button" data-shot="'+i+'" aria-label="'+esc(b.label)+'"><span></span></button>').join("")+'</nav>'+
    '</article>';
};
const sections=chapters.map((c,i)=>{
  const group=c.apps.map(id=>apps.find(a=>a.id===id));
  return '<section class="expedition expedition--'+c.id+'" id="'+c.id+'" data-chapter="'+c.id+'" aria-labelledby="'+c.id+'-title">'+
    '<header class="chapter-heading container"><p class="eyebrow">Expedition '+["I","II","III","IV"][i]+'<span>'+num(group[0].index)+'—'+num(group.at(-1).index)+'</span></p><h2 id="'+c.id+'-title">'+esc(c.name)+'</h2><p class="chapter-descriptor">'+esc(c.descriptor)+'</p></header>'+
    '<div class="film-run"><div class="film-stage container">'+group.map(article).join("")+'</div><div class="film-anchors" aria-hidden="true">'+group.map(a=>'<span data-anchor="'+a.id+'"></span>').join("")+'</div></div>'+
    '</section>';
}).join("");
let html=await fs.readFile("content/page.html","utf8");
const symbol=(await fs.readFile("assets/brand/artifacts-symbol.svg","utf8")).replace("<svg ",'<svg class="brand-symbol" aria-hidden="true" focusable="false" ').replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g,"").replaceAll('fill="#e9edf0"','fill="currentColor"');
const data=apps.map(a=>({id:a.id,index:a.index,name:a.name,chapter:chapterFor(a).name,value:a.valueLine,...cameras[a.id]}));
for(const [key,value] of Object.entries({BRAND:symbol,HERO_PLANES:planes,APP_INDEX:index(),INDEX_PREVIEWS:previews,ORIGIN_PLANES:originPlanes,EXPEDITIONS:sections,DIALOG_INDEX:index(true),CAMERA_DATA:'<script type="application/json" id="camera-data">'+JSON.stringify(data).replaceAll("<","\\u003c")+'</script>'})) html=html.replace("<!-- "+key+" -->",value);
for(const asset of ["styles.css","experience.js","image-viewer.js"]){
 const revision=createHash("sha256").update(await fs.readFile(asset)).digest("hex").slice(0,10);
 html=html.replace('"'+asset+'"','"'+asset+'?v='+revision+'"');
}
await fs.writeFile("index.html",html);
console.log("Built 17 application films, 35 real captures, 4 Expeditions.");

