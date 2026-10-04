// Decode once and reuse the actual image element. Bounded residency avoids retaining every panel.
export function createPanelCache(load,limit=10){
 const entries=new Map();
 function get(key){
  if(entries.has(key)){const entry=entries.get(key);entries.delete(key);entries.set(key,entry);return entry;}
  const entry={ready:false,image:null,promise:null};
  entry.promise=load(key).then(image=>{entry.image=image;entry.ready=true;return image;}).catch(error=>{if(entries.get(key)===entry)entries.delete(key);throw error;});
  entries.set(key,entry);
  if(entries.size>limit)entries.delete(entries.keys().next().value);
  return entry;
 }
 return {get,warm(key){get(key).promise.catch(()=>{});},get size(){return entries.size;}};
}
