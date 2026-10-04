export const model=JSON.parse(document.querySelector('#artifacts-data').textContent);
export const products=[...document.querySelectorAll('.app-shell')];
// Two coherent editions, one active source of truth. Independent theme/mode pairs are impossible.
export const editions={legacy:{theme:'origin',mode:'legacy'},pentimento:{theme:'pentimento',mode:'pentimento'}};
export const state={edition:'pentimento',...editions.pentimento};
try{const saved=localStorage.getItem('artifacts-edition');if(editions[saved])Object.assign(state,{edition:saved},editions[saved]);}catch{}
export function setEdition(edition){
 if(!editions[edition]||edition===state.edition)return;
 Object.assign(state,{edition},editions[edition]);
 try{localStorage.setItem('artifacts-edition',edition);}catch{}
 document.dispatchEvent(new CustomEvent('experience-change',{detail:{...state}}));
}
export const setTheme=theme=>{if(theme==='origin'||theme==='pentimento')setEdition(theme==='origin'?'legacy':'pentimento');};
export const themedCaptures=app=>app.images.filter(image=>image.theme===state.theme);
