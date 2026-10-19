import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source=await fs.readFile('site-motion.js','utf8');
const reveal=source.slice(source.indexOf('function revealCredits()'),source.indexOf('let ghostFrame='));
function setup(reduce=false){
 let callback,observed,disconnected=false;const calls=[];
 const credit={dataset:{},querySelector:selector=>selector};
 const context={credit,reduced:{matches:reduce},animate:(...args)=>{assert.equal(credit.dataset.revealed,undefined,'prepare animation before exposing text');calls.push(args);},IntersectionObserver:class{constructor(fn,options){callback=fn;assert.equal(options.threshold,0);}observe(target){observed=target;}disconnect(){disconnected=true;}}};
 vm.runInNewContext(reveal,context);
 return {credit,calls,enter:()=>callback([{isIntersecting:true}]),leave:()=>callback([{isIntersecting:false}]),observed:()=>observed,disconnected:()=>disconnected};
}
test('Gene credits reveal once on entry without a visible-then-hidden restart',()=>{
 const s=setup();assert.equal(s.observed(),s.credit);assert.equal(s.credit.dataset.revealed,undefined);assert.equal(s.calls.length,0);
 s.leave();assert.equal(s.calls.length,0);s.enter();assert.equal(s.credit.dataset.revealed,'true');assert.equal(s.calls.length,6);assert.ok(s.disconnected());
 s.leave();s.enter();assert.equal(s.calls.length,6);assert.equal(s.credit.dataset.revealed,'true');
});
test('Reduced-motion credits are available immediately, with a CSS fallback',async()=>{
 const s=setup(true);assert.equal(s.credit.dataset.revealed,'true');s.enter();assert.equal(s.calls.length,6);
 const css=await fs.readFile('site.css','utf8');assert.match(css,/\.js \.author-credit:not\(\[data-revealed="true"\]\)\{visibility:hidden\}/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.js \.author-credit:not\(\[data-revealed="true"\]\)\{visibility:visible\}\}/);
});
