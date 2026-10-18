export const WINDOW_WIDTH=1229,WINDOW_HEIGHT=820;
export function fitWindow(width,height){return Math.max(.1,Math.min(1,(width-32)/WINDOW_WIDTH,(height-32)/WINDOW_HEIGHT));}
export function boundZoom(value,fit){return Math.max(fit,Math.min(2,value));}
// Keep the same native point under the zoom anchor, including centered fit views.
export function anchoredScroll({left,top,oldWidth,oldHeight,newWidth,newHeight,viewWidth,viewHeight,x,y,ratio}){
 const oldX=Math.max(16,(viewWidth-oldWidth)/2),oldY=Math.max(16,(viewHeight-oldHeight)/2);
 const newX=Math.max(16,(viewWidth-newWidth)/2),newY=Math.max(16,(viewHeight-newHeight)/2);
 return {left:Math.max(0,newX+(left+x-oldX)*ratio-x),top:Math.max(0,newY+(top+y-oldY)*ratio-y)};
}
