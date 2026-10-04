// Shared by the static build and runtime: all geometry comes from Qt exports.
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function homeMarkup(model,layouts,key){
 const ref=layouts[key];
 return `<img class="home-background" src="assets/native/layouts/${key}-background.webp" width="${ref.width}" height="750" alt=""><div class="home-scroll"><div class="home-sheet" style="width:${ref.contentWidth}px;height:${ref.contentHeight}px"><img class="home-render" src="assets/native/layouts/${key}-content.webp" width="${ref.contentWidth}" height="${ref.contentHeight}" alt="ARTIFACTS applications"><div class="home-hotspots">${ref.cards.map(card=>{const app=model.apps.find(a=>a.sourceKey===card.key);return `<button type="button" class="app-tile" data-inspect-app="${app.id}" aria-label="About ${escape(app.name)}" style="left:${card.x}px;top:${card.y}px;width:${card.width}px;height:${card.height}px;--hover-render:url('assets/native/layouts/${key}-${card.key}.webp')"></button>`;}).join('')}</div></div></div>`;
}
export function panelPosition(anchor,bounds,width,height){
 const margin=12,gap=14;
 const right=anchor.right+gap,left=anchor.left-width-gap;
 let x=right+width<=bounds.right-margin?right:left>=bounds.left+margin?left:bounds.right-width-margin;
 let y=anchor.top+anchor.height/2-height/2;
 return {x:Math.max(bounds.left+margin,Math.min(x,bounds.right-width-margin)),y:Math.max(bounds.top+margin,Math.min(y,bounds.bottom-height-margin))};
}
