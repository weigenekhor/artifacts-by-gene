export const model=JSON.parse(document.querySelector('#artifacts-data').textContent);
export const products=[...document.querySelectorAll('.app-shell')];
// Mode and theme are independent controls. The desktop app can show either visual treatment in either mode.
export const modes={legacy:{name:'Legacy',range:'I–IV'},pentimento:{name:'Pentimento',range:'V–VI'}};
export const themes=Object.fromEntries(model.themes.map(theme=>[theme.id,theme.name]));
// Every page load starts in Tenebrismo; appearance choices last for this visit.
// Desktop preference persistence is independent and unchanged.
let storedMode=model.defaultMode;
try{storedMode=localStorage.getItem('artifacts-mode')||localStorage.getItem('artifacts-edition')||storedMode;}catch{}
if(!Object.hasOwn(modes,storedMode))storedMode=model.defaultMode;
export const state={edition:storedMode,mode:storedMode,theme:'tenebrismo'};
export function setEdition(edition){
 if(!Object.hasOwn(modes,edition)||edition===state.mode)return;
 Object.assign(state,{edition,mode:edition});
 try{localStorage.setItem('artifacts-mode',edition);localStorage.setItem('artifacts-edition',edition);}catch{}
 document.dispatchEvent(new CustomEvent('experience-change',{detail:{...state}}));
}
export const setTheme=theme=>{if(!Object.hasOwn(themes,theme)||theme===state.theme)return;state.theme=theme;document.dispatchEvent(new CustomEvent('experience-change',{detail:{...state}}));};
export const themedCaptures=app=>app.images.filter(image=>image.theme===state.theme);
