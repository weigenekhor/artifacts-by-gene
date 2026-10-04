export const model=JSON.parse(document.querySelector('#artifacts-data').textContent);
export const product=document.querySelector('.app-shell');
export const state={theme:product.dataset.theme,mode:product.dataset.mode};
try{for(const key of ['theme','mode']){const saved=localStorage.getItem(`artifacts-${key}`);if((key==='theme'?model.themes:model.modes).some(item=>item.id===saved))state[key]=saved;}}catch{}
function persist(key,value){try{localStorage.setItem(`artifacts-${key}`,value);}catch{/* Private storage may be disabled. */}}
export function setTheme(theme){
 if(!model.themes.some(t=>t.id===theme))return;
 state.theme=theme;product.dataset.theme=theme;persist('theme',theme);
 product.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme)));
 document.dispatchEvent(new CustomEvent('theme-change',{detail:{theme}}));
}
export function setMode(mode){
 if(!model.modes.some(m=>m.id===mode))return;
 state.mode=mode;product.dataset.mode=mode;persist('mode',mode);
 document.dispatchEvent(new CustomEvent('mode-change',{detail:{mode}}));
}
product.addEventListener('click',e=>{const button=e.target.closest('[data-theme-choice],[data-select-mode]');if(!button)return;if(button.dataset.themeChoice)setTheme(button.dataset.themeChoice);if(button.dataset.selectMode)setMode(button.dataset.selectMode);});
setTheme(state.theme);setMode(state.mode);
