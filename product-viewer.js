import {WINDOW_WIDTH,WINDOW_HEIGHT,fitWindow,boundZoom,anchoredScroll} from './viewer-geometry.js';

const stage=document.querySelector('.product-stage'),viewport=stage.querySelector('.product-viewport'),shell=viewport.querySelector('.app-shell');
const compact=matchMedia('(max-width:1100px)');
const icon=path=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
const launch=document.createElement('button');launch.type='button';launch.className='product-preview-action';launch.setAttribute('aria-label','Explore ARTIFACTS in full screen');launch.setAttribute('aria-haspopup','dialog');
launch.innerHTML=`<span>Explore ARTIFACTS ${icon('M8 4h12v12M20 4 5 19')}</span>`;
viewport.after(launch);
const dialog=document.createElement('dialog');dialog.className='product-viewer';dialog.setAttribute('aria-label','Explore ARTIFACTS');
dialog.innerHTML=`<header class="product-viewer-header"><h2>ARTIFACTS</h2><button type="button" data-viewer-close aria-label="Close ARTIFACTS viewer" autofocus>${icon('m6 6 12 12M18 6 6 18')}</button></header><div class="product-viewer-tools" role="group" aria-label="View magnification"><button type="button" data-viewer-out aria-label="Zoom out">${icon('M5 12h14')}</button><output aria-label="Magnification"></output><button type="button" data-viewer-in aria-label="Zoom in">${icon('M5 12h14M12 5v14')}</button><button type="button" data-viewer-fit>Fit</button><button type="button" data-viewer-actual aria-label="Actual size">100%</button></div><div class="product-viewer-scroll"><div class="product-viewer-plane"><div class="product-viewer-pan" aria-hidden="true"></div></div></div><footer class="product-viewer-footer"><button type="button" data-viewer-move aria-pressed="true">Move view</button><button type="button" data-viewer-interact aria-pressed="false">Use app</button><p class="product-viewer-hint">Drag to move · Pinch or use + to zoom</p></footer>`;
// Retain the same window, DOM state and listeners under product-stage.
stage.append(dialog);
const scroller=dialog.querySelector('.product-viewer-scroll'),plane=dialog.querySelector('.product-viewer-plane'),pan=dialog.querySelector('.product-viewer-pan');
const placeholder=document.createElement('div');placeholder.className='product-preview-placeholder';placeholder.style.aspectRatio='1229 / 820';
let zoom=1,fit=1,moving=true,previousOverflow='',restoreFocus=null;
const pointers=new Map();let gesture=null;
function mode(move){moving=move;pan.hidden=!move;shell.inert=move;dialog.querySelector('[data-viewer-move]').setAttribute('aria-pressed',String(move));dialog.querySelector('[data-viewer-interact]').setAttribute('aria-pressed',String(!move));dialog.querySelector('.product-viewer-hint').textContent=move?'Drag to move · Pinch or use + to zoom':'Select controls in the app · Move view to pan';pointers.clear();gesture=null;}
function draw(next,x=scroller.clientWidth/2,y=scroller.clientHeight/2){
 const old=zoom;zoom=boundZoom(next,fit);
 const position=anchoredScroll({left:scroller.scrollLeft,top:scroller.scrollTop,oldWidth:WINDOW_WIDTH*old,oldHeight:WINDOW_HEIGHT*old,newWidth:WINDOW_WIDTH*zoom,newHeight:WINDOW_HEIGHT*zoom,viewWidth:scroller.clientWidth,viewHeight:scroller.clientHeight,x,y,ratio:zoom/old});
 viewport.style.width=`${WINDOW_WIDTH*zoom}px`;viewport.style.height=`${WINDOW_HEIGHT*zoom}px`;
 plane.style.width=`${WINDOW_WIDTH*zoom+32}px`;plane.style.height=`${WINDOW_HEIGHT*zoom+32}px`;
 scroller.scrollLeft=position.left;scroller.scrollTop=position.top;
 dialog.querySelector('output').value=`${Math.round(zoom*100)}%`;
 dialog.querySelector('[data-viewer-out]').disabled=zoom<=fit+.001;dialog.querySelector('[data-viewer-in]').disabled=zoom>=2;
}
function resize(){if(!dialog.open)return;const wasFit=Math.abs(zoom-fit)<.002;fit=fitWindow(scroller.clientWidth,scroller.clientHeight);draw(wasFit?fit:zoom);}
new ResizeObserver(resize).observe(scroller);
function open(){
 if(dialog.open)return;
 restoreFocus=document.activeElement;viewport.replaceWith(placeholder);plane.prepend(viewport);stage.dataset.viewerOpen='';
 previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';document.documentElement.classList.add('product-viewer-open');
 document.dispatchEvent(new Event('product-viewer-open')); document.querySelector('.module-details').hidden=true;
 dialog.showModal();fit=fitWindow(scroller.clientWidth,scroller.clientHeight);zoom=fit;draw(fit);mode(true);
 scroller.scrollLeft=0;scroller.scrollTop=0;
}
function restore(){
 placeholder.replaceWith(viewport);viewport.style.removeProperty('width');viewport.style.removeProperty('height');delete stage.dataset.viewerOpen;
 document.documentElement.classList.remove('product-viewer-open');document.body.style.overflow=previousOverflow;shell.inert=compact.matches;
 pointers.clear();gesture=null;restoreFocus?.focus({preventScroll:true});
}
launch.addEventListener('click',open);
dialog.addEventListener('click',event=>{if(event.target.closest('a[href^="#"]'))dialog.close();});
// Escape closes the viewer without also collapsing the desktop information pane.
dialog.addEventListener('keydown',event=>{if(event.key==='Escape')event.stopPropagation();});
dialog.querySelector('[data-viewer-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',restore);
dialog.querySelector('[data-viewer-fit]').addEventListener('click',()=>draw(fit));
dialog.querySelector('[data-viewer-actual]').addEventListener('click',()=>draw(1));
dialog.querySelector('[data-viewer-in]').addEventListener('click',()=>draw(zoom*1.4));
dialog.querySelector('[data-viewer-out]').addEventListener('click',()=>draw(zoom/1.4));
dialog.querySelector('[data-viewer-move]').addEventListener('click',()=>mode(true));dialog.querySelector('[data-viewer-interact]').addEventListener('click',()=>mode(false));
function startGesture(){const points=[...pointers.values()];gesture=points.length===2?{distance:Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y),zoom}:points.length===1?{...points[0],left:scroller.scrollLeft,top:scroller.scrollTop}:null;}
pan.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();pan.setPointerCapture(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});startGesture();});
pan.addEventListener('pointermove',event=>{
 if(!pointers.has(event.pointerId)||!gesture)return;
 pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});const points=[...pointers.values()];
 if(points.length===2&&gesture.distance){const rect=scroller.getBoundingClientRect();draw(gesture.zoom*Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y)/gesture.distance,(points[0].x+points[1].x)/2-rect.left,(points[0].y+points[1].y)/2-rect.top);}
 else if(points.length===1&&gesture.left!==undefined){scroller.scrollLeft=gesture.left+gesture.x-event.clientX;scroller.scrollTop=gesture.top+gesture.y-event.clientY;}
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])pan.addEventListener(type,event=>{pointers.delete(event.pointerId);startGesture();});
pan.addEventListener('wheel',event=>{if(event.ctrlKey){event.preventDefault();const rect=scroller.getBoundingClientRect();draw(zoom*Math.exp(-event.deltaY*.01),event.clientX-rect.left,event.clientY-rect.top);}}, {passive:false});
function sync(){if(!compact.matches&&dialog.open)dialog.close();shell.inert=dialog.open?moving:compact.matches;}
compact.addEventListener('change',sync);sync();
