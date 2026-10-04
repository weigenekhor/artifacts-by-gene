export const model=JSON.parse(document.querySelector('#artifacts-data').textContent);
export const state={theme:document.documentElement.dataset.theme,mode:document.documentElement.dataset.mode};
function persist(key,value){try{localStorage.setItem(`artifacts-${key}`,value);}catch{/* Private storage may be disabled. */}}
export function setTheme(theme){
 if(!model.themes.some(t=>t.id===theme))return;
 state.theme=theme;document.documentElement.dataset.theme=theme;persist('theme',theme);
 document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===theme)));
 document.querySelector('meta[name="theme-color"]').content=theme==='origin'?'#14181e':'#0d0e12';
 document.dispatchEvent(new CustomEvent('theme-change',{detail:{theme}}));
}
export function setMode(mode){
 if(!model.modes.some(m=>m.id===mode))return;
 state.mode=mode;document.documentElement.dataset.mode=mode;persist('mode',mode);
 document.querySelectorAll('[data-select-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.selectMode===mode)));
 document.dispatchEvent(new CustomEvent('mode-change',{detail:{mode}}));
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-theme-choice],[data-select-mode]');if(!button)return;if(button.dataset.themeChoice)setTheme(button.dataset.themeChoice);if(button.dataset.selectMode)setMode(button.dataset.selectMode);});
setTheme(state.theme);setMode(state.mode);
