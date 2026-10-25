// Reproducible serialization/reuse comparison; does not measure DOM, paint or FPS.
import fs from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {nodeMarkup} from '../desktop-workspace.js';
import {createWorkspaceViewCache} from '../workspace-view-cache.js';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const percentile=(values,f)=>[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*f)];
const results=[];
for(const app of model.apps){
 const data=JSON.parse(await fs.readFile(`content/desktop-layouts/${app.id}.json`,'utf8'));
 const variants=Object.values(data.states.initial).map(size=>size.tenebrismo);
 const scope=app.id+'-tenebrismo',before=[],after=[];
 // Warm the JS serializer before recording either path.
 for(const variant of variants)nodeMarkup(variant.tree,scope);
 let uncachedBuilds=0,cachedBuilds=0;
 const cache=createWorkspaceViewCache(variant=>{cachedBuilds++;return {html:nodeMarkup(variant.tree,scope)};});
 for(const variant of variants)cache.get(scope,variant);
 for(let cycle=0;cycle<20;cycle++)for(const variant of variants){
  let start=performance.now();nodeMarkup(variant.tree,scope);uncachedBuilds++;before.push(performance.now()-start);
  start=performance.now();cache.get(scope,variant);after.push(performance.now()-start);
 }
 results.push({app:app.name,transitions:before.length,uncachedBuilds,cachedInitialBuilds:cachedBuilds,cachedRepeatBuilds:cachedBuilds-variants.length,
  beforeMedianMs:percentile(before,.5),afterMedianMs:percentile(after,.5),beforeP95Ms:percentile(before,.95),afterP95Ms:percentile(after,.95)});
}
console.log(JSON.stringify({scope:'Node markup serialization versus warmed node-cache lookup; excludes browser DOM parsing, layout, painting, memory and frame rate.',node:process.version,cycles:20,theme:'tenebrismo',results},null,2));
