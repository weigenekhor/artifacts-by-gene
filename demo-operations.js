import {records,selectRows,unique,compareXML,compileLaytec,groupRows,stats} from './demo-model.js';
import {esc,fmt,button,tabs,select,input,check,toolbar,panel,empty,table,color} from './demo-view.js';
export function operationsView(kind,data,s){
 let rows=selectRows(data,s,kind),html='';
 if(kind==='lots')html=toolbar(button('Lot History: Select from Tool or Drag Here','sample'),select('Chamber','filter',['All',...unique(records(data).map(r=>r.Chamber))],s.filter),input('Custom filter','query',s.query),button('Export','export'))+panel('',`<pre class="demo-lot-info">${esc(data.info)}</pre>`)+table(rows,{page:s.page});
 if(kind==='schedule')html=toolbar(button('Check ANKO Schedule','sample'),input('Filter modules','query',s.query),button('Export','export'))+table(rows,{limit:25});
 if(kind==='counts'){
  rows.sort((a,b)=>a.Chamber.localeCompare(b.Chamber)||a.Reactor.localeCompare(b.Reactor));
  html=toolbar(button('Check Wafer Counts','sample'),button('Export','export'))+`<div class="demo-gauges">${rows.map(r=>{
   const value=r.Count/r.Limit,stroke=`rgb(${Math.floor(14+241*value)} ${Math.floor(194-194*value)} ${Math.floor(255-127*value)})`;
   return `<figure><svg viewBox="0 0 220 250" role="img" aria-label="${esc(r.Reactor)} chamber ${r.Chamber}: ${r.Count} of ${r.Limit}"><circle cx="110" cy="100" r="90" fill="none" stroke="var(--border-hover)" stroke-width="12"/><circle cx="110" cy="100" r="90" fill="none" stroke="${stroke}" stroke-width="10" stroke-dasharray="${value*565.49} 565.49" transform="rotate(-90 110 100)"/><text x="110" y="107" text-anchor="middle" class="demo-gauge-value">${r.Count}/${r.Limit}</text><text x="110" y="235" text-anchor="middle" class="demo-gauge-caption">${esc(r.Reactor)}-C${r.Chamber}</text></svg></figure>`;
  }).join('')}</div>`;
 }
 if(kind==='anko'){
  rows=data.rows.filter(r=>s.filter==='All'||r.tool===s.filter).map(r=>({Equipment:r.tool,Mode:r.mode,Parameter:r.parameter_name,Channel:r.spc_channel,Status:r.status,'Last Sample':r.last_sample_date,'Lot ID':r.lot_id,'Next ANKO':r.next_anko_date}));
  html=toolbar(select('Family','filter2',['Family A'],s.filter2==='All'?'Family A':s.filter2),button('Generate SPC Summary','set','mode|Summary'),button('Project ANKO Schedule','set','mode|Schedule'),button('Export','export'))+toolbar(select('Equipment','filter',['All',...unique(data.rows.map(r=>r.tool))],s.filter))+panel(s.mode==='Schedule'?'Projected ANKO Schedule':'SPC Summary',table(rows,{columns:s.mode==='Schedule'?['Equipment','Mode','Parameter','Next ANKO','Status']:undefined,limit:20}));
 }
 if(kind==='pathfinder'){
  const all=records(data);html=toolbar(select('Workcenter','filter',['All',...unique(all.map(r=>r.Mainframe))],s.filter),select('Chart Group','filter2',['All',...unique(all.map(r=>r.Type))],s.filter2),input('Parameter / Parameter Details','query',s.query),button('Open Selected','toggle','details','',!s.selection))+`<div class="demo-path-grid">${[...groupRows(rows,'Type')].map(([name,rs])=>panel(name,rs.map(r=>button(r['Parameter Name']||r.Parameter,'set','selection|'+r.Parameter,s.selection===r.Parameter)).join(''))).join('')}</div>`;
  if(s.details&&s.selection){const row=all.find(r=>r.Parameter===s.selection);html+=panel('Selected Chart',`<h4>${esc(row?.['Parameter Name'])}</h4><p>${esc(row?.Mainframe)} · ${esc(row?.Type)} · ${esc(s.selection)}</p><p>Chart selection resolved in the bundled index. The desktop opens the selected SPC chart; this website keeps the demo local.</p>`);}
 }
 return {rows,html};
}
// SequenceMatcher-style longest contiguous matching blocks (the desktop uses
// difflib with the same whitespace-normalized line comparison for XML samples).
export function sequenceRows(left,right){
 const a=left.split('\n'),b=right.split('\n'),normalize=line=>line.trim(),aa=a.map(normalize),bb=b.map(normalize);
 const blocks=[];
 function match(alo,ahi,blo,bhi){
  let bestI=alo,bestJ=blo,size=0,previous=new Map();
  for(let i=alo;i<ahi;i++){
   const next=new Map();for(let j=blo;j<bhi;j++)if(aa[i]===bb[j]){const n=(previous.get(j-1)||0)+1;next.set(j,n);if(n>size){size=n;bestI=i-n+1;bestJ=j-n+1;}}
   previous=next;
  }
  if(!size)return;
  if(alo<bestI&&blo<bestJ)match(alo,bestI,blo,bestJ);
  blocks.push([bestI,bestJ,size]);
  if(bestI+size<ahi&&bestJ+size<bhi)match(bestI+size,ahi,bestJ+size,bhi);
 }
 match(0,a.length,0,b.length);blocks.push([a.length,b.length,0]);
 const rows=[];let i=0,j=0;
 for(const [ai,bj,n] of blocks){
  const size=Math.max(ai-i,bj-j),status=ai>i&&bj>j?'Changed':ai>i?'Missing':'Added';
  for(let k=0;k<size;k++)rows.push({Reference:i+k<ai?a[i+k]:'',Target:j+k<bj?b[j+k]:'',Status:status});
  for(let k=0;k<n;k++)rows.push({Reference:a[ai+k],Target:b[bj+k],Status:'Unchanged'});
  i=ai+n;j=bj+n;
 }
 return rows;
}
export function documentView(kind,data,s){
 const names=Object.keys(data.documents),reference=data.documents[s.reference]||'',target=data.documents[s.target]||'';
 let rows=compareXML(reference,target),html='';
 const controls=toolbar(select('Reference','reference',names,s.reference),select('Target','target',names,s.target),button('Swap','swap'),button('Compare','compare'),button('Reset','reset'),button('Export Report','export'));
 if(kind==='reader'){
  html=tabs(['Raw Mode','Diffs Only Mode','SequenceMatcher Mode','Exhaustive Mode'],s.mode)+toolbar(button('Load Example Files','sample'),input('Search','query',s.query),button('−','font','-1'),button('+','font','1'),check('Sync Scroll','sync',s.sync!==false));
  if(s.mode==='Exhaustive Mode')html+=controls+table(rows.filter(r=>!s.query||Object.values(r).join(' ').toLowerCase().includes(s.query.toLowerCase())),{limit:60});
  else if(s.mode==='SequenceMatcher Mode'){rows=sequenceRows(reference,target);html+=controls+table(rows.filter(r=>!s.query||Object.values(r).join(' ').toLowerCase().includes(s.query.toLowerCase())),{limit:150,sortable:false});}
  else html+=`<div class="demo-documents">${names.map(name=>{
   const text=data.documents[name],base=new Set(reference.split('\n'));
   return panel(name,`<div class="demo-document" data-document-scroll style="font-size:${s.fontSize||11}px">${text.split('\n').map((line,i)=>({line,i,changed:name!==s.reference&&!base.has(line)})).filter(r=>(s.mode!=='Diffs Only Mode'||r.changed)&&(!s.query||r.line.toLowerCase().includes(s.query.toLowerCase()))).map(r=>`<div class="${r.changed?'demo-line-changed':''}"><span>${r.i+1}</span><code>${esc(r.line)}</code></div>`).join('')}</div>`);
  }).join('')}</div>`;
  html+=toolbar('<span class="demo-status-bad">Missing</span><span class="demo-status-warn">Changed</span><span class="demo-status-good">Added</span>');
 }else{
  if(!s.compare)rows=[];
  const changed=rows.filter(r=>r.Status!=='Unchanged');
  html=controls+toolbar(button('Blocks Index','toggle','details'),check('Differences only','diffOnly',s.diffOnly!==false))+`<div class="demo-two-columns">${panel('Reference',`<pre class="demo-xml-source">${esc(reference)}</pre>`)}${panel('Target',`<pre class="demo-xml-source">${esc(target)}</pre>`)}</div>`+(s.compare?panel('Comparison Results',`<p>${changed.length} differences across ${unique(rows.map(r=>r.Block)).length} blocks</p>`+(s.details?toolbar(...unique(rows.map(r=>r.Block)).map(name=>button(name,'set','query|'+name))):'')+table((s.diffOnly===false?rows:changed).filter(r=>!s.query||r.Block.includes(s.query)),{page:s.page})):empty('Click Compare to evaluate the two sample documents.'));
 }
 return {rows,html};
}
export function compilePlessey(data,roles){
 const map=new Map();
 for(const r of data.plessey.records){if(!roles.includes(r.role))continue;const key=`${r.Run}/${r.Satellite}`;
  if(!map.has(key))map.set(key,{'Run no.':r.Run,'Satellite no.':r.Satellite,...(roles.includes('Growth Plan')?data.plessey.growth[r.Run]:{})});
  // Native compiler preserves prior measurements and fills empty columns.
  const row=map.get(key);for(const [k,v] of Object.entries(r.values))if(row[k]===undefined||row[k]===null||row[k]==='')row[k]=v;
 }
 return [...map.values()];
}
export function compilerView(kind,data,s){
 if(kind==='report'){
  const rows=s.compiled?compileLaytec(data,s.filter):records(data);
  return {rows,html:toolbar(button('Select Analysis File','sample'),button('Select Base File','toggle','baseFile'),select('Step','filter',['All',...unique(records(data).map(r=>String(r.Step)))],s.filter),button('Save Processed File','compile'))+panel('Analysis File',`<p>C02901_LayTec_Analysis.htm</p><p>${s.baseFile?'Sample RiffTide schema selected.':'Sample analysis can be compiled without a base.'}</p>`)+panel(s.compiled?'Compiled LayTec Analysis':'Analysis Preview',table(rows,{limit:25}))+ (s.compiled?button('Download CSV','export'):'')};
 }
 const plessey=s.mode==='Plessey',roles=plessey?['Plato','Bow','Growth Plan','Limits']:['LayTec','Plato','XRR','XRD'];
 let sheets=Object.keys(data.sheets).filter(k=>s.roles.includes(k.startsWith('PL-')?'Plato':k.startsWith('Laytec')?'LayTec':k.split('-')[0]));
 const selected=sheets.includes(s.sheet)?s.sheet:sheets[0];
 const sheet=data.sheets[selected];
 const rows=plessey?compilePlessey(data,s.roles):sheet?records(sheet):[];
 let html=toolbar(tabs(['Plessey','HV','AIXDEMO','RG ENG'],s.mode),button('Reset','reset'));
 html+=panel(plessey?'Input Validation':'Log Entries',s.compiled?`<p class="demo-status-good">Sample compilation complete · ${rows.length} rows in ${plessey?'Metrology':esc(selected)}</p>`:`<p>Select sample inputs, then compile to inspect the resulting measurements.</p>${!plessey&&s.mode!=='HV'?'<p>The bundled legacy sample is the HV dataset. Other layouts remain selectable; these demo values are labelled HV.</p>':''}`,'demo-compile-log');
 html+=roles.map(role=>panel('',toolbar(button(s.roles.includes(role)?`Remove ${role} File`:`Select ${role} File`,'role',role),`<span>${s.roles.includes(role)?esc(plessey?role==='Plato'?'6 × PL.xlsx':role==='Bow'?'12 × AQUAMARINE / QUARTZ.pdf':role+'.xlsx':role==='LayTec'?data.files.find(f=>f.endsWith('.htm')):role==='Plato'?data.files.find(f=>f.endsWith('.xlsx')):role+' sample folder'):'No sample selected'}</span>`))).join('');
 html+=toolbar(button('Compile Sample','compile','',false,!s.roles.some(r=>plessey?['Plato','Bow'].includes(r):roles.includes(r))),s.compiled?button('Download current sheet (CSV)','export'):'');
 if(s.compiled)html+=panel('Compiled Measurements',(!plessey?select('Worksheet','sheet',sheets,selected):'')+table(rows,{page:s.page,limit:25,sortable:false}));
 return {rows,html};
}
