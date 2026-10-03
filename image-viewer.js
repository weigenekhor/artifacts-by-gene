const viewer=document.querySelector(".image-viewer");
const slot=viewer.querySelector(".viewer-image");
const closeButton=viewer.querySelector(".viewer-close");
const zoomButton=viewer.querySelector(".viewer-zoom");
const status=viewer.querySelector(".viewer-status");
const title=viewer.querySelector(".viewer-name");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
let trigger=null,ticket=0,closing=0,opening=0,position=0;

function zoom(){
  const image=slot.querySelector("img");if(!image)return;
  const on=!slot.classList.contains("is-zoomed");
  slot.style.setProperty("--zoom-width",Math.min(image.naturalWidth||image.width,innerWidth*2.5)+"px");
  slot.classList.toggle("is-zoomed",on);
  zoomButton.setAttribute("aria-pressed",String(on));
  zoomButton.textContent=on?"Fit image −":"Zoom in +";
  if(!on){slot.scrollTop=0;slot.scrollLeft=0;}
}
function finishClose(){clearTimeout(closing);closing=0;viewer.close();}
function close(){
  if(!viewer.open||closing)return;
  ticket++;cancelAnimationFrame(opening);viewer.classList.remove("is-visible");
  if(reduced.matches)finishClose();else closing=setTimeout(finishClose,180);
}
async function open(button){
  if(viewer.open)return;
  const request=++ticket;trigger=button;position=scrollY;
  const source=button.querySelector("img");
  const preview=new Image();
  preview.alt=source.alt;preview.width=Number(source.getAttribute("width"));preview.height=Number(source.getAttribute("height"));
  preview.src=source.currentSrc||source.src;slot.replaceChildren(preview);
  title.textContent=button.dataset.name;
  viewer.setAttribute("aria-label",button.dataset.name+" — screenshot inspection");
  status.textContent="Loading original capture…";
  slot.classList.remove("is-zoomed");
  zoomButton.setAttribute("aria-pressed","false");zoomButton.textContent="Zoom in +";
  document.documentElement.classList.add("modal-open");
  viewer.showModal();closeButton.focus({preventScroll:true});
  opening=requestAnimationFrame(()=>{opening=requestAnimationFrame(()=>viewer.classList.add("is-visible"));});
  const full=new Image();full.alt=source.alt;full.decoding="async";full.src=button.dataset.full;
  try{
    await full.decode();if(request!==ticket||!viewer.open)return;
    full.width=full.naturalWidth;full.height=full.naturalHeight;slot.replaceChildren(full);status.textContent="";
  }catch{if(request===ticket&&viewer.open)status.textContent="Original unavailable. The screen-sized capture is shown.";}
}
if(typeof viewer.showModal==="function"){
  document.documentElement.classList.add("has-viewer");
  for(const button of document.querySelectorAll(".capture-button")){
    button.disabled=false;
    button.addEventListener("click",()=>open(button));
  }
}
closeButton.addEventListener("click",close);
zoomButton.addEventListener("click",zoom);
viewer.addEventListener("cancel",e=>{e.preventDefault();close();});
slot.addEventListener("click",e=>{if(e.target.tagName==="IMG")zoom();else if(e.target===slot)close();});
viewer.addEventListener("close",()=>{
  ticket++;cancelAnimationFrame(opening);clearTimeout(closing);closing=0;
  viewer.classList.remove("is-visible");document.documentElement.classList.remove("modal-open");
  slot.replaceChildren();slot.classList.remove("is-zoomed");status.textContent="";
  trigger?.focus({preventScroll:true});
  if(scrollY!==position)scrollTo({top:position,behavior:"instant"});
  trigger=null;
});
reduced.addEventListener("change",()=>{if(closing&&reduced.matches)finishClose();});

