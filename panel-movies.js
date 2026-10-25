// Retain the prepared image itself, not merely its completed loading promise.
// Two entries cover the visible movie and the next nearby card without keeping
// all 81 animated images resident. Detached images have no visible playback.
export function createPanelMovies({load,attach,allowed=()=>true,limit=2}){
 const entries=new Map();let generation=0,current=null;
 function release(entry){entry.abort.abort();entry.image?.remove();entry.image?.removeAttribute('src');}
 function get(key){
  if(entries.has(key)){const entry=entries.get(key);entries.delete(key);entries.set(key,entry);return entry;}
  const entry={image:null,promise:null,abort:new AbortController()};
  entry.promise=load(key,entry.abort.signal).then(image=>{
   if(entries.get(key)!==entry){image.removeAttribute('src');return null;}
   entry.image=image;return image;
  }).catch(error=>{if(entries.get(key)===entry)entries.delete(key);throw error;});
  entries.set(key,entry);
  while(entries.size>limit){
   const oldest=[...entries.keys()].find(candidate=>candidate!==current);
   const evicted=entries.get(oldest);entries.delete(oldest);release(evicted);
  }
  return entry;
 }
 function hide(){
  generation++;if(current!==null){const image=entries.get(current)?.image;if(image){image.hidden=true;image.remove();}}
  current=null;
 }
 return {
  warm(key){if(allowed()&&key)get(key).promise.catch(()=>{});},
  async show(key,geometry){
   hide();if(!allowed()||!key)return false;
   const token=generation;current=key;
   try{
    const image=await get(key).promise;
    if(!image||token!==generation||current!==key||!allowed())return false;
    Object.assign(image.style,geometry);image.hidden=false;attach(image);return true;
   }catch{if(token===generation)current=null;return false;}
  },
  hide,
  clear(){hide();for(const entry of entries.values())release(entry);entries.clear();},
  get size(){return entries.size;}
 };
}
