import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {homeMarkup} from '../native-home.js';
import {WINDOW_WIDTH,WINDOW_HEIGHT,fitWindow,boundZoom,anchoredScroll} from '../viewer-geometry.js';

test('Full window fits phone, tablet and landscape viewer without changing its aspect ratio',()=>{
 for(const [w,h] of [[320,510],[390,650],[768,820],[1024,560],[844,220]]){
  const fit=fitWindow(w,h);
  assert.ok(WINDOW_WIDTH*fit+32<=w+.001);
  assert.ok(WINDOW_HEIGHT*fit+32<=h+.001);
  assert.equal(boundZoom(0,fit),fit);
  assert.equal(boundZoom(10,fit),2);
 }
});
test('Zoom holds a native point under its anchor and restores centered fit view',()=>{
 const w=390,h=650,fit=fitWindow(w,h);
 const next=anchoredScroll({left:0,top:0,oldWidth:1229*fit,oldHeight:820*fit,newWidth:1229,newHeight:820,viewWidth:w,viewHeight:h,x:w/2,y:h/2,ratio:1/fit});
 assert.ok(Math.abs(next.left-(16+1229/2-w/2))<.001);
 assert.ok(Math.abs(next.top-(16+820/2-h/2))<.001);
 const reset=anchoredScroll({left:next.left,top:next.top,oldWidth:1229,oldHeight:820,newWidth:1229*fit,newHeight:820*fit,viewWidth:w,viewHeight:h,x:w/2,y:h/2,ratio:fit});
 assert.ok(reset.left<.001&&reset.top<.001);
});
test('Home retains all native coordinates and the original composition without a mobile grid',async()=>{
 const model=JSON.parse(await fs.readFile('content/apps.json','utf8')),layouts=JSON.parse(await fs.readFile('content/home-layouts.json','utf8'));
 for(const [key,ref] of Object.entries(layouts)){
  const html=homeMarkup(model,layouts,key);
  assert.deepEqual([...html.matchAll(/data-inspect-app="([^"]+)"/g)].map(m=>m[1]),ref.cards.map(c=>model.apps.find(a=>a.sourceKey===c.key).id));
  for(const c of ref.cards)assert.ok(html.includes(`left:${c.x}px;top:${c.y}px;width:${c.width}px;height:${c.height}px;`));
  assert.doesNotMatch(html,/compact-card-art|home-card-grid/);
 }
});

async function fixture(){
 class Element{
  constructor(){this.events={};this.nodes=new Map();this.children=[];this.dataset={};this.attrs={};this.style={overflow:'',removeProperty(k){delete this[k];}};this.classList={add(){},remove(){}};this.clientWidth=390;this.clientHeight=650;this.scrollLeft=0;this.scrollTop=0;}
  setAttribute(k,v){this.attrs[k]=v;}
  querySelector(s){if(!this.nodes.has(s))this.nodes.set(s,new Element());return this.nodes.get(s);}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  emit(type,e={}){for(const fn of this.events[type]||[])fn(e);}
  append(child){child.parent=this;this.children.push(child);}
  prepend(child){child.parent=this;this.children.unshift(child);}
  after(child){this.sibling=child;child.parent=this.parent;}
  replaceWith(child){child.parent=this.parent;this.replacedBy=child;}
  showModal(){this.open=true;}
  close(){this.open=false;this.emit('close');}
  focus(){this.focused=true;}
  setPointerCapture(){}
  getBoundingClientRect(){return {left:0,top:0};}
 }
 const stage=new Element(),viewport=stage.querySelector('.product-viewport'),shell=viewport.querySelector('.app-shell');viewport.parent=new Element();
 const doc=new Element();doc.nodes.set('.product-stage',stage);doc.body=new Element();doc.documentElement=new Element();doc.activeElement=new Element();doc.createElement=()=>new Element();doc.dispatchEvent=()=>{};
 const media=new Element();media.matches=true;
 const context={document:doc,matchMedia:()=>media,ResizeObserver:class{observe(){}},WINDOW_WIDTH,WINDOW_HEIGHT,fitWindow,boundZoom,anchoredScroll,Event:class{}};
 vm.runInNewContext((await fs.readFile('product-viewer.js','utf8')).replace(/^import .*\n/,''),context);
 const dialog=stage.children[0],launch=viewport.sibling;
 return {doc,viewport,shell,dialog,launch,media};
}
test('Viewer moves the existing live window and restores page scrolling, focus and app state on close',async()=>{
 const {doc,viewport,shell,dialog,launch,media}=await fixture();
 shell.dataset.theme='pentimento';shell.dataset.activeApp='metria';
 assert.equal(shell.inert,true);launch.emit('click');
 assert.equal(dialog.open,true);assert.equal(viewport.parent,dialog.querySelector('.product-viewer-plane'));
 assert.equal(doc.body.style.overflow,'hidden');
 dialog.querySelector('[data-viewer-interact]').emit('click');assert.equal(shell.inert,false);
 dialog.querySelector('[data-viewer-actual]').emit('click');assert.equal(dialog.querySelector('output').value,'100%');
 dialog.close();assert.equal(doc.body.style.overflow,'');assert.equal(shell.inert,true);assert.equal(doc.activeElement.focused,true);
 assert.deepEqual(shell.dataset,{theme:'pentimento',activeApp:'metria'});
 assert.equal(viewport.style.width,undefined);
 media.matches=false;media.emit('change');assert.equal(shell.inert,false);
});
test('Viewer supports drag, pinch, fit reset and closing when returning to a desktop width',async()=>{
 const {dialog,launch,media}=await fixture();launch.emit('click');dialog.querySelector('[data-viewer-actual]').emit('click');
 const scroll=dialog.querySelector('.product-viewer-scroll'),pan=dialog.querySelector('.product-viewer-pan');
 const initial=scroll.scrollLeft;
 pan.emit('pointerdown',{pointerId:1,button:0,clientX:200,clientY:200,preventDefault(){}});
 pan.emit('pointermove',{pointerId:1,clientX:150,clientY:150});assert.equal(scroll.scrollLeft,initial+50);
 pan.emit('pointerdown',{pointerId:2,button:0,clientX:250,clientY:150,preventDefault(){}});
 pan.emit('pointermove',{pointerId:2,clientX:300,clientY:150});assert.equal(dialog.querySelector('output').value,'150%');
 pan.emit('pointercancel',{pointerId:1});pan.emit('pointerup',{pointerId:2});
 dialog.querySelector('[data-viewer-fit]').emit('click');assert.equal(dialog.querySelector('[data-viewer-out]').disabled,true);
 media.matches=false;media.emit('change');assert.equal(dialog.open,false);
});
