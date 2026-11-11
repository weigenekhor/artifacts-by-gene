const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// The product is a fixed-coordinate desktop preview. Keep its typography in
// that same coordinate system: a browser minimum font must not enlarge text
// independently of the native controls. Ordinary website text is unaffected.
// HTML inside the SVG remains live/selectable; the larger logical font is
// scaled by the viewBox, including normal browser zoom and display density.
export function nativeText(text,{width,height,size=12,weight=400,align='left',wrap=false,top=false,lineHeight=1.2,letterSpacing=0,family='Segoe UI'}={}){
 const factor=8,w=width*factor,h=height*factor;
 return `<svg class="native-text" data-native-copy="${escape(text)}" width="${width}" height="${height}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escape(text)}" style="display:block;width:${width}px;height:${height}px;max-width:100%;flex-shrink:0"><foreignObject width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;display:flex;align-items:${top?'flex-start':'center'};color:inherit"><p style="width:100%;margin:0;padding:0;border:0;font:${weight} ${size*factor}px/${lineHeight} '${escape(family)}',sans-serif;letter-spacing:${letterSpacing*factor}px;white-space:${wrap?'normal':'nowrap'};text-align:${align};color:inherit">${escape(text)}</p></div></foreignObject></svg>`;
}
