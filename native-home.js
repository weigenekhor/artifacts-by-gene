// Shared by the static build and runtime: all geometry comes from Qt exports.
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function homeMarkup(model,layouts,key){
 const ref=layouts[key],wafer=ref.wafer,theme=key.split('-')[0];
 return `<div class="home-material" aria-hidden="true"><img class="home-background" src="assets/native/layouts/${key}-field.webp" width="${ref.width}" height="750" alt=""><img class="home-wafer" src="assets/native/layouts/${theme}-wafer.webp" alt="" style="left:${wafer.x}px;top:${wafer.y}px;width:${wafer.size}px;height:${wafer.size}px;transform-origin:${wafer.originX}% ${wafer.originY}%"><img class="home-light" src="assets/native/layouts/${key}-light.webp" width="${ref.width}" height="750" alt=""></div><div class="home-scroll"><div class="home-sheet" style="width:${ref.contentWidth}px;height:${ref.contentHeight}px"><img class="home-render" src="assets/native/layouts/${key}-content.webp" width="${ref.contentWidth}" height="${ref.contentHeight}" alt="ARTIFACTS applications"><div class="home-hotspots">${ref.cards.map(card=>{const app=model.apps.find(a=>a.sourceKey===card.key);return `<button type="button" class="app-tile" data-inspect-app="${app.id}" aria-label="About ${escape(app.name)}" style="left:${card.x}px;top:${card.y}px;width:${card.width}px;height:${card.height}px;--hover-render:url('assets/native/layouts/${key}-${card.key}.webp')"></button>`;}).join('')}</div></div></div>`;
}
export function panelPosition(anchor,bounds,width,height){
 const margin=12,gap=14;
 const right=anchor.right+gap,left=anchor.left-width-gap;
 let x=right+width<=bounds.right-margin?right:left>=bounds.left+margin?left:bounds.right-width-margin;
 let y=anchor.top+anchor.height/2-height/2;
 return {x:Math.max(bounds.left+margin,Math.min(x,bounds.right-width-margin)),y:Math.max(bounds.top+margin,Math.min(y,bounds.bottom-height-margin))};
}
