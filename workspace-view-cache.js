// Keep only the four sidebar arrangements of the current app and theme.
// Reusing the actual nodes avoids reparsing SVGs and reconstructing widgets
// every time a drawer is opened or closed.
export function createWorkspaceViewCache(build){
 let scope=null;
 const views=new Map();
 return {
  get(key,variant){
   if(scope!==key){views.clear();scope=key;}
   if(!views.has(variant)){
    if(views.size===4)views.delete(views.keys().next().value);
    views.set(variant,build(variant,key));
   }
   return views.get(variant);
  },
  clear(){views.clear();scope=null;},
  get size(){return views.size;}
 };
}
