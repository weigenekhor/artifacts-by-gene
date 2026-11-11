// Use the same source-coordinate scale for artwork and live text. Container
// query font units can diverge from the image's scale under browser zoom.
export function panelTextStyle(text, scale=1, width=372, height=565){
 return {
  left:`${text.x/width*100}%`,top:`${text.y/height*100}%`,
  width:`${text.width/width*100}%`,height:`${text.height/height*100}%`,
  fontSize:`${text.size*scale}px`,fontWeight:text.weight,color:text.color,
  textAlign:text.align,justifyContent:text.align==='right'?'flex-end':text.align==='center'?'center':'flex-start',
  alignItems:text.top?'flex-start':'center',
  // Qt only wraps titles and descriptions, never the expedition or metadata.
  whiteSpace:text.top||text.size>=17?'normal':'nowrap'
 };
}

export function layoutPanelText(live, reference, scale=1){
 for(let i=0;i<live.children.length;i++){
  Object.assign(live.children[i].style,panelTextStyle(reference.text[i],scale,reference.width,reference.height));
 }
}
