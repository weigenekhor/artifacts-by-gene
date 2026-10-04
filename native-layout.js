import {state,product} from './state.js';

const home=product.querySelector('.app-home');
const content=product.querySelector('.app-content');
// Follow HomePage._layout_module_cards: reserve background space, keep one
// source-sized card width, then fit columns. Phones get the deliberate compact layout.
function layout(){
 if(home.hidden)return;
 if(product.clientWidth<=700){home.style.removeProperty('--tile-width');home.style.removeProperty('--tile-height');home.style.removeProperty('--columns');return;}
 const scale=Math.max(content.clientWidth/1672,content.clientHeight/941);
 const available=Math.max(160,home.clientWidth-44-Math.max(140,Math.round(230*scale)));
 const labels=[...home.querySelectorAll(`[data-mode="${state.mode}"] .app-tile span`)];
 const measured=Math.max(148,...labels.map(label=>Math.ceil(label.getBoundingClientRect().width)+26));
 const width=Math.min(measured,Math.max(140,Math.floor((available-36)/4)));
 const columns=Math.max(1,Math.min(state.mode==='legacy'?6:4,Math.floor((available+12)/(width+12))));
 home.style.setProperty('--tile-width',`${width}px`);
 home.style.setProperty('--tile-height',`${Math.round(width*132/168)}px`);
 home.style.setProperty('--columns',columns);
}
const resize=new ResizeObserver(layout);resize.observe(content);
document.addEventListener('mode-change',layout);
product.addEventListener('home-opened',layout);
document.fonts.ready.then(layout);
layout();
