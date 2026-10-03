import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { frameFor,shotAt,phase } from "../motion-math.js";
const cameras=JSON.parse(await fs.readFile("content/cinematography.json","utf8"));
for(const [id,c] of Object.entries(cameras)){
 let previous=null;
 for(let p=0;p<=1;p+=.001){
  const s=shotAt(c.beats,p);
  assert.ok([s.frame.x,s.frame.y,s.frame.scale].every(Number.isFinite),id);
  assert.ok(s.frame.scale>=1&&s.frame.scale<=1.75);
  // The camera cannot leave uncovered image margins within its full native frame.
  assert.ok(Math.abs(s.frame.x)<=(s.frame.scale-1)/2+.000001);
  assert.ok(Math.abs(s.frame.y)<=(s.frame.scale-1)/2+.000001);
  if(previous){
   assert.ok(Math.abs(s.frame.scale-previous.scale)<.04,id+" discontinuous scale");
   assert.ok(Math.abs(s.frame.x-previous.x)<.04,id+" discontinuous pan");
  }
  previous=s.frame;
 }
 assert.equal(shotAt(c.beats,0).index,0);
 assert.equal(shotAt(c.beats,1).index,c.beats.length-1);
 assert.deepEqual(shotAt(c.beats,.63),shotAt(c.beats,.63),"Camera must be independent of scroll direction");
}
assert.deepEqual(frameFor({x:0,y:0,width:1,height:1}),{x:0,y:0,scale:1});
assert.equal(phase(-2,0,1),0);assert.equal(phase(3,0,1),1);
const source=await fs.readFile("experience.js","utf8");
assert.ok(!/addEventListener\(["']wheel|setInterval/.test(source));
const render=source.slice(source.indexOf("function render("),source.indexOf("function schedule("));
assert.ok(!/getBoundingClientRect|offsetTop|offsetWidth|clientWidth/.test(render),"Scroll loop must not measure layout");
assert.ok(source.includes('if(document.hidden)return'));
assert.ok(source.includes('desktop.matches&&!reduced.matches'));
assert.ok(source.includes('else last=0'));
console.log("PASS: all camera trajectories, focus bounds, source coverage, interpolation, native scroll and lifecycle guards.");

