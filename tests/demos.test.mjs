import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {DEMOS,initialDemo,records,selectRows,stats,correlation,histogram,assignment,compareXML,compileLaytec,rbfSurface,csv,caseObservations,diagnose,diagnosticPairs} from '../demo-model.js';
import {renderDemo,demoWorkspace} from '../demo-workspace.js';
import {compilePlessey} from '../demo-operations.js';
import {telemetrySignals} from '../demo-analysis.js';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const fixtures=Object.fromEntries(await Promise.all(Object.entries(DEMOS).map(async([id,def])=>[id,def.file?JSON.parse(await fs.readFile(`content/demo-data/${def.file}.json`,'utf8')):{}])));

test('All 19 applications and every advertised mode render live controls and results without screenshot layers',()=>{
 assert.deepEqual(Object.keys(DEMOS).sort(),model.apps.map(a=>a.id).sort());
 for(const [id,def] of Object.entries(DEMOS)){
  const data=fixtures[id];
  for(const mode of def.modes||['']){
   const s=initialDemo(id,data);s.mode=mode;
   if(id==='aperture-spc'&&mode==='Scatter')s.x='Thickness';
   if(id==='gan-met-compiler'){s.compiled=true;if(mode==='Plessey')s.roles=['Plato','Bow','Growth Plan'];}
   const result=renderDemo(id,data,s);
   assert.ok(result.html.includes('<button')||result.html.includes('<input'),id+' '+mode);
   assert.doesNotMatch(result.html,/<img|<iframe|native-demo-image|assets\/native\/workspaces|NaN|Infinity|\[object Object\]/,id+' '+mode);
   assert.ok(result.rows.length>0,id+' '+mode);
   const ids=[...result.html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,id+' duplicate SVG IDs');
  }
 }
});

test('Fixtures retain source provenance and the approved sample counts',()=>{
 for(const [id,def] of Object.entries(DEMOS))if(def.file){assert.ok(fixtures[id].provenance.length);for(const p of fixtures[id].provenance)assert.match(p.sha256,/^[a-f0-9]{64}$/);}
 assert.equal(fixtures['data-lens'].data.length,2637);
 assert.equal(fixtures['aperture-spc'].data.length,3120);
 assert.equal(fixtures['metria-spc'].data.length,900);
 assert.equal(fixtures['altus-lotviewer'].data.length,25);
 assert.equal(fixtures['altus-wafercount'].data.length,12);
 assert.equal(fixtures['topotracer'].values.length,49);
});

test('Data Lens filters actual measurements and all five modes produce distinct data views',()=>{
 const data=fixtures['data-lens'],s=initialDemo('data-lens',data),full=selectRows(data,s,'lens');
 s.filter='C02901.L1';s.filter2='1';const subset=selectRows(data,s,'lens');
 assert.equal(subset.length,293);assert.ok(subset.every(r=>r.Run==='C02901.L1'&&r.Wafer===1));
 assert.notEqual(stats(full.map(r=>r.PeakIntensity)).mean,stats(subset.map(r=>r.PeakIntensity)).mean);
 const outputs=DEMOS['data-lens'].modes.map(mode=>renderDemo('data-lens',data,{...s,mode}).html);
 assert.equal(new Set(outputs).size,5);assert.match(outputs[1],/wafer map/);assert.match(outputs[2],/boxplot/);assert.match(outputs[3],/Distribution/);assert.match(outputs[4],/Distance from wafer centre/);
 s.filter='missing';assert.equal(selectRows(data,s,'lens').length,0);assert.doesNotMatch(renderDemo('data-lens',data,s).html,/NaN|Infinity/);
});

test('Aperture uses per-parameter source limits and paired-site scatter values',()=>{
 const data=fixtures['aperture-spc'],s=initialDemo('aperture-spc',data);
 const wavelength=selectRows(data,s,'aperture');assert.equal(wavelength.length,780);
 assert.ok(wavelength.every(r=>r.LSL===450.05&&r.USL===453.95));
 const trend=renderDemo('aperture-spc',data,s).html;assert.match(trend,/LSL 450\.05/);
 const scatter=renderDemo('aperture-spc',data,{...s,mode:'Scatter',x:'Thickness'}).html;
 assert.match(scatter,/data-tooltip=/);assert.doesNotMatch(scatter,/No numeric readings/);
 s.y='Thickness';assert.equal(selectRows(data,s,'aperture').length,780);
});

test('Metria keeps separate family limits, reactor comparisons and run averages',()=>{
 const data=fixtures['metria-spc'],s=initialDemo('metria-spc',data);
 const html=renderDemo('metria-spc',data,s).html;assert.match(html,/PB_V3C/);assert.match(html,/PG_V3C/);assert.match(html,/LSL 450/);assert.match(html,/USL 530/);
 const avg=renderDemo('metria-spc',data,{...s,average:true}).html;
 assert.ok((avg.match(/data-tooltip=/g)||[]).length<(html.match(/data-tooltip=/g)||[]).length);
 s.filter='Reactor D';assert.ok(selectRows(data,s,'metria').every(r=>r.Equipment==='Reactor D'));
});

test('Assignment mirrors desktop cold/heavy pairing, temperature offsets and the 4°C threshold',()=>{
 const s=initialDemo('aix-dt-assistant');let result=assignment(s);assert.deepEqual(result.map,[0,1,3,2,4]);
 s.mode='Temperature Mapping';s.baseline=[10,14,18];s.withbp=[20,20,30];s.count=3;
 result=assignment(s);assert.equal(result.active,true);assert.deepEqual(result.map,[2,0,1]);assert.equal(result.original,10);assert.equal(result.expected,2);
 s.withbp=[20,21,23];result=assignment(s);assert.equal(result.active,false);assert.deepEqual(result.map,[0,1,2]);assert.equal(result.expected,3);
 s.baseline[0]='';assert.equal(assignment(s),null);
});

test('TopoTracer interpolation agrees with the native SciPy calculation and reacts to edited values',()=>{
 const data=fixtures.topotracer,f=rbfSurface(data.coordinates,data.values);
 for(const [x,y,expected] of data.rbfChecks)assert.ok(Math.abs(f(x,y)-expected)<1e-9,`${x},${y}`);
 data.coordinates.forEach(([x,y],i)=>assert.ok(Math.abs(f(x,y)-data.values[i])<1e-9));
 const shifted=rbfSurface(data.coordinates,data.values.map(v=>v+.1));assert.ok(Math.abs(shifted(0,0)-f(0,0)-.1)<1e-9);
 assert.throws(()=>rbfSurface(data.coordinates,[NaN]),/finite measurements/);
});

test('Temperature diagnosis matches paired master cases and never fabricates an unmatched cause',()=>{
 const data=fixtures['gan-temp-diagnoser'];
 for(let i=0;i<diagnosticPairs(data).length;i++){const result=diagnose(data,caseObservations(data,i));assert.equal(result.missing.length,0);assert.ok(result.matches.length);}
 assert.ok(diagnose(data,{}).missing.length);
 const changed={...caseObservations(data,0),'Process/TFB Correction':'impossible'};
 assert.equal(diagnose(data,changed).matches.length,0);
 assert.match(renderDemo('gan-temp-diagnoser',data,{...initialDemo('gan-temp-diagnoser',data),observations:changed}).html,/No exact diagnostic match/);
});

test('XML compare detects actual added, missing and changed properties; swap reverses values',()=>{
 const docs=fixtures['gan-xml-assistant'].documents,left=docs['Devices_ref.xml'],right=docs['Devices_Reactor_C.xml'];
 const diff=compareXML(left,right);assert.equal(diff.length,41);assert.equal(diff.filter(r=>r.Status==='Missing').length,5);assert.equal(diff.filter(r=>r.Status==='Added').length,1);
 const offset=diff.find(r=>r.Block==='Temperature Controller'&&r.Property==='Offset');assert.equal(offset.Reference,'0.12');assert.equal(offset.Target,'0.14');assert.equal(offset.Status,'Changed');
 const reverse=compareXML(right,left).find(r=>r.Block===offset.Block&&r.Property===offset.Property);assert.equal(reverse.Reference,offset.Target);
 assert.ok(compareXML(left,left).every(r=>r.Status==='Unchanged'));
});

test('Compilers extract actual analysis values and combine the native parsed Plato/Bow records',()=>{
 const report=compileLaytec(fixtures['lt-report-compiler']);assert.equal(report.length,18);assert.equal(report[0].Average,1026.5);assert.equal(report[0]['Standard Deviation'],1.2);
 assert.equal(compileLaytec(fixtures['lt-report-compiler'],'40').length,6);
 const data=fixtures['gan-met-compiler'],rows=compilePlessey(data,['Plato','Bow','Growth Plan']);assert.equal(rows.length,30);
 assert.equal(rows[0]['Peak lambda median'],451.9543);assert.ok(rows[0]['Run Type']);assert.ok(Object.keys(rows[0]).some(k=>k.includes('Bow')));
 const plato=compilePlessey(data,['Plato']);assert.equal(plato.length,30);assert.ok(!Object.keys(plato[0]).some(k=>k.includes('Bow')));
 assert.equal(compilePlessey(data,[]).length,0);
});

test('Telemetry twelve-hour plots retain the last reading and each module selects its actual tags',()=>{
 const data=fixtures.telemetry,s=initialDemo('telemetry',data);
 for(const mode of DEMOS.telemetry.modes){const signals=telemetrySignals(data,{...s,mode});assert.ok(signals.length,mode);}
 const view=renderDemo('telemetry',data,{...s,mode:'12 Hour Analysis'}),source=telemetrySignals(data,s)[0];
 assert.equal(view.rows.at(-1).UTC,source.points.at(-1)[0]);assert.equal(view.rows.at(-1).Value,source.points.at(-1)[1]);
 assert.ok(view.rows.every(r=>Date.parse(r.UTC)>=Date.parse(data.end)-12*3600000));
 assert.ok(telemetrySignals(data,{...s,mode:'Bubbler Weights'}).every(v=>/weight/i.test(v.tag)));
 assert.match(view.html,/data-tooltip=/);
});

test('Statistics, correlation, histogram boundaries and CSV escaping handle edge cases',()=>{
 assert.equal(stats([]).n,0);assert.equal(stats([1,2,3]).mean,2);assert.equal(stats([1,2,3]).sd,1);assert.equal(stats([5]).sd,0);
 assert.equal(correlation([{x:1,y:2},{x:2,y:4},{x:3,y:6}]),1);
 assert.equal(correlation([{x:1,y:1},{x:1,y:2}]),null);
 assert.equal(histogram([1,2,3,4,5],4).reduce((n,b)=>n+b.y,0),5);
 assert.match(csv([{Name:'=1+1',Value:'a,"b"'}]),/"'=1\+1"/);assert.match(csv([{Name:'hello',Value:'a,"b"'}]),/a,""b""/);
});

test('Hero text matches single-line native card labels; atmosphere and grand heading are retained',async()=>{
 const css=await fs.readFile('demo.css','utf8');assert.match(css,/\.app-tile \.home-label\{[^}]*font:400 12px\/1/);assert.match(css,/\.home-heading\{[^}]*white-space:nowrap/);
 const baseline=execFileSync('git',['show','0a692cc:shell.css'],{encoding:'utf8'}),current=await fs.readFile('shell.css','utf8');
 const block=s=>s.slice(s.indexOf('.product-environment{'),s.indexOf('.product-duet{')).replaceAll('\r\n','\n');assert.equal(block(current),block(baseline));
 assert.match(await fs.readFile('site.css','utf8'),/\.hero h1\{font-size:clamp\(72px,10\.6vw,152px\)/);
 assert.doesNotMatch(await fs.readFile('index.html','utf8'),/id="native-demo-data"/);
});

test('Workspace actions edit results, persist per-app state across themes, and prevent stale fetch replacement',async()=>{
 const previous={document:globalThis.document,fetch:globalThis.fetch};
 const node=()=>({hidden:false,innerHTML:'',scrollTop:0,clientWidth:1161,style:{},attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},addEventListener(k,v){this.handlers[k]=v;},contains(){return false;},append(){},querySelectorAll(){return [];}});
 const workspace=node(),tooltip=node(),home=node(),homeButton=node(),nav=model.apps.map(a=>({...node(),dataset:{locateApp:a.id}}));let created=0,returned=0;
 const shell={dataset:{theme:'tenebrismo'},querySelector:s=>s==='.app-content'?{append(){}}:s==='.app-home'?home:homeButton,querySelectorAll:()=>nav};
 const pending=[];let delay=false;
 globalThis.document={createElement:()=>created++===0?workspace:tooltip,activeElement:null};
 globalThis.fetch=async url=>{
  const filename=url.match(/demo-data\/(.*)\.json/)[1],id=Object.keys(DEMOS).find(id=>DEMOS[id].file===filename);
  if(delay)await new Promise(resolve=>pending.push({filename,resolve}));
  return {ok:true,json:async()=>fixtures[id]};
 };
 const click=(action,value='',extra={})=>workspace.handlers.click({target:{closest:()=>({dataset:{action,value,...extra}})}});
 const change=(field,value)=>workspace.handlers.change({target:{dataset:{field},value,type:'select-one'}});
 try{
  const controller=demoWorkspace(shell,model,()=>returned++);
  await controller.open('data-lens');assert.equal(home.hidden,true);assert.match(workspace.innerHTML,/DominantWavelength/);
  change('mode','Distribution');assert.match(workspace.innerHTML,/Count/);
  await controller.open('aix-dt-assistant');click('set','mode|Temperature Mapping');click('clear');assert.match(workspace.innerHTML,/Enter a measurement/);click('sample');assert.match(workspace.innerHTML,/Temperature-Based Reassignment/);
  await controller.open('data-lens');assert.match(workspace.innerHTML,/Count/);shell.dataset.theme='pentimento';controller.refresh();assert.match(workspace.innerHTML,/Count/);
  await controller.open('gan-xml-assistant');click('swap');assert.match(workspace.innerHTML,/Comparison Results/);
  await controller.open('gan-temp-diagnoser');click('clear-observations');assert.match(workspace.innerHTML,/Select one observation/);change('diagnosis','1');assert.match(workspace.innerHTML,/Exact diagnostic match/);
  await controller.open('topotracer');
  const editedValues=fixtures.topotracer.values.map(v=>v+.25);
  const field={dataset:{field:'valuesText'},tagName:'TEXTAREA',value:editedValues.join('\n')};
  globalThis.document.activeElement=field;workspace.contains=el=>el===field;
  let prevented=false;
  workspace.handlers.pointerdown({target:{closest:()=>({dataset:{action:'plot'}})},preventDefault(){prevented=true;}});
  assert.equal(prevented,true,'The button press must commit the focused editor without a destructive blur');
  globalThis.document.activeElement=null;click('plot');
  assert.match(workspace.innerHTML,/Surface and profiles recalculated/);
  assert.ok(workspace.innerHTML.includes(String(editedValues[0])),'The edited measurements must survive the Plot action');
  delay=true;const a=controller.open('telemetry'),b=controller.open('altus-lotviewer');pending.find(p=>p.filename==='lots').resolve();await b;assert.match(workspace.innerHTML,/Altus Lot Viewer/);pending.find(p=>p.filename==='telemetry').resolve();await a;assert.match(workspace.innerHTML,/Altus Lot Viewer/);
  click('home');assert.equal(controller.active,null);assert.equal(returned,1);assert.equal(workspace.hidden,true);assert.equal(home.hidden,false);
 }finally{Object.assign(globalThis,previous);}
});
