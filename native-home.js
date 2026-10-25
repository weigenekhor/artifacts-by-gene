// Shared by the static build and runtime: all geometry comes from Qt exports.
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function homeMaterialMarkup(layouts,key){
 // Panels reveal a different crop; the desktop wafer stays anchored to the window.
 const materialKey=key.replace(/-(closed|navigation|information|both)$/,'-closed');
 const ref=layouts[materialKey],wafer=ref.wafer,theme=key.split('-')[0];
 return `<div class="home-material" aria-hidden="true"><img class="home-background" src="assets/native/layouts/${materialKey}-field.webp?v=20261024-preview" width="${ref.width}" height="750" alt=""><img class="home-wafer" src="assets/native/layouts/${theme}-wafer.webp?v=20261024-preview" alt="" style="left:${wafer.x}px;top:${wafer.y}px;width:${wafer.size}px;height:${wafer.size}px;transform-origin:${wafer.originX}% ${wafer.originY}%"><img class="home-light" src="assets/native/layouts/${materialKey}-light.webp?v=20261024-preview" width="${ref.width}" height="750" alt=""></div>`;
}
export function homeMarkup(model,layouts,key){
 const ref=layouts[key];
 return `<div class="home-scroll" style="right:${ref.contentHeight>722?4:26}px"><div class="home-sheet" style="width:${ref.contentWidth}px;height:${ref.contentHeight}px"><img class="home-render" src="assets/native/layouts/${key}-content.webp?v=20261024-preview" width="${ref.contentWidth}" height="${ref.contentHeight}" alt="ARTIFACTS applications"><div class="home-hotspots">${(ref.headings||[]).map(h=>`<h3 class="home-heading" style="left:${h.x}px;top:${h.y}px;width:${h.width}px;height:${h.height}px">${escape(h.text)}</h3>`).join('')}${ref.cards.map(card=>{const app=model.apps.find(a=>a.sourceKey===card.key);return `<button type="button" class="app-tile" data-inspect-app="${app.id}" aria-label="Open ${escape(app.name)} desktop layout" style="left:${card.x}px;top:${card.y}px;width:${card.width}px;height:${card.height}px;--hover-render:url('assets/native/layouts/${key}-${card.key}.webp?v=20261024-preview')">${card.label?`<span class="home-label" style="left:${card.label.x}px;top:${card.label.y}px;width:${card.label.width}px;height:${card.label.height}px;color:${card.label.color}">${escape(card.label.text)}</span>`:''}</button>`;}).join('')}</div></div></div>`;
}
export function panelPosition(anchor,bounds,width,height){
 const margin=12,gap=14;
 const right=anchor.right+gap,left=anchor.left-width-gap;
 let x=right+width<=bounds.right-margin?right:left>=bounds.left+margin?left:bounds.right-width-margin;
 let y=anchor.top+anchor.height/2-height/2;
 return {x:Math.max(bounds.left+margin,Math.min(x,bounds.right-width-margin)),y:Math.max(bounds.top+margin,Math.min(y,bounds.bottom-height-margin))};
}
