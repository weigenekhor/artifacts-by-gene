import {demoSpecs,filterOptions,sampleRows,summarize} from './demo-model.js';
export const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const colors=['#48a5eb','#ec8b7b','#58c7a7'];
const button=(text,action,extra='')=>`<button type="button" data-demo-action="${action}" ${extra}>${text}</button>`;
function table(headers,rows){return `<div class="demo-table-wrap"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function metrics(items){return `<div class="demo-metrics">${items.map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div>`;}
function chart(state,rows,type='line',label='Process trend'){
 const metric=demoSpecs[state.id].filters[1]==='Parameter'?state.filters[1]:0;
 const kind=demoSpecs[state.id].kind;
 const isLens=state.id==='data-lens',xKey=isLens?['x','y','thickness'][state.filters[0]]:'x',yKey=isLens?['y','thickness','x'][state.filters[1]]:['diagnosis','zones'].includes(kind)?'temperature':kind==='telemetry'?(state.view===1?'pressure':'temperature'):metric===1?'thickness':metric===2?'y':'x';
 const values=rows.map(r=>r[yKey]),low=Math.min(...values),high=Math.max(...values),spread=Math.max(high-low,.1),min=low-spread*.15,max=high+spread*.15;
 const xs=rows.map(r=>r[xKey]),xmin=Math.min(...xs),xmax=Math.max(...xs),xspan=Math.max(xmax-xmin,.1);
 const X=n=>65+n*900,Y=v=>330-(v-min)/(max-min)*280;
 let marks='',xLabel=type==='scatter'?(isLens?filterOptions('X Parameter')[state.filters[0]]:'Peak wavelength · nm'):'Measurement sequence';
 let yLabel=isLens?filterOptions('Y Parameter')[state.filters[1]]:yKey==='temperature'?'Temperature · °C':yKey==='pressure'?'Pressure · mbar':metric===1?'Thickness · µm':metric===2?'Intensity · a.u.':'Peak wavelength · nm';
 const grids=Array.from({length:6},(_,i)=>{const y=50+i*56;return `<path class="demo-grid" d="M65 ${y}H965"/><text x="53" y="${y+5}" text-anchor="end">${(max-(max-min)*i/5).toFixed(2)}</text>`;}).join('');
 if(type==='histogram'){
  const bins=Array.from({length:16},(_,i)=>values.filter(v=>Math.min(15,Math.floor((v-low)/spread*16))===i).length),peak=Math.max(...bins,1);
  marks=bins.map((n,i)=>`<rect x="${70+i*55}" y="${330-n/peak*260}" width="49" height="${n/peak*260}" fill="${colors[0]}" opacity=".85"><title>${(low+i/16*spread).toFixed(2)}–${(low+(i+1)/16*spread).toFixed(2)}: ${n} measurements</title></rect>`).join('');xLabel=yLabel;yLabel='Frequency';
 }else if(type==='box'){
  marks=[0,1,2].map(g=>{const vals=rows.filter(r=>(r.index-1)%3===g).map(r=>r[yKey]).sort((a,b)=>a-b);if(!vals.length)return '';const q=p=>vals[Math.floor((vals.length-1)*p)],cx=X((g+1)/4);return `<g stroke="${colors[g]}" stroke-width="2"><path d="M${cx} ${Y(q(0))}V${Y(q(1))}M${cx-20} ${Y(q(0))}h40M${cx-20} ${Y(q(1))}h40"/><rect x="${cx-55}" y="${Y(q(.75))}" width="110" height="${Y(q(.25))-Y(q(.75))}" fill="${colors[g]}" fill-opacity=".18"/><path d="M${cx-55} ${Y(q(.5))}h110"/><text x="${cx}" y="355" text-anchor="middle" stroke="none">C0290${g+1}</text></g>`;}).join('');xLabel='Run';
 }else{
  marks=[0,1,2].map(g=>{const part=rows.filter(r=>(r.index-1)%3===g),coords=part.map(r=>[X(type==='scatter'?(r[xKey]-xmin)/xspan:(r.index-1)/71),Y(r[yKey])]);return `${type!=='scatter'?`<polyline fill="none" stroke="${colors[g]}" stroke-width="1.8" points="${coords.map(p=>p.join(',')).join(' ')}"/>`:''}${part.map((r,i)=>`<circle class="demo-point" cx="${coords[i][0]}" cy="${coords[i][1]}" r="${type==='scatter'?4:3}" fill="${colors[g]}" tabindex="0"><title>${r.run} · ${r.wafer}\n${yLabel}: ${r[yKey]}${type==='scatter'?`\n${xLabel}: ${r[xKey]}`:''}</title></circle>`).join('')}`;}).join('');
 }
 const bins=Array.from({length:16},(_,i)=>values.filter(v=>Math.min(15,Math.floor((v-low)/spread*16))===i).length),peak=Math.max(...bins,1);
 const histGrid=Array.from({length:6},(_,i)=>`<path class="demo-grid" d="M65 ${70+i*52}H965"/><text x="53" y="${75+i*52}" text-anchor="end">${(peak*(1-i/5)).toFixed(0)}</text>`).join('');
 return `<figure class="demo-chart"><figcaption>${esc(label)}<span>${type==='histogram'?'16 bins':colors.map((c,i)=>`<i style="background:${c}"></i>C0290${i+1}`).join(' ')}</span></figcaption><svg viewBox="0 0 1020 400" role="img" aria-label="${esc(label)}. Sample data; point values also available in the data table.">${type==='histogram'?histGrid:grids}<path class="demo-axis" d="M65 40V330H970"/>${marks}<text x="515" y="389" text-anchor="middle">${esc(xLabel)}</text><text transform="translate(16 190) rotate(-90)" text-anchor="middle">${esc(yLabel)}</text>${type==='box'?'':Array.from({length:6},(_,i)=>`<text x="${65+i*180}" y="353" text-anchor="middle">${type==='histogram'?(low+i/5*spread).toFixed(2):type==='scatter'?(xmin+i/5*xspan).toFixed(2):Math.round(1+i*71/5)}</text>`).join('')}</svg></figure>`;
}
function wafer(state,topography=false){
 const n=topography?[13,21,29][state.filters[1]]:23,cells=[];
 for(let i=0;i<n;i++)for(let j=0;j<n;j++){
  const x=(i-(n-1)/2)/(n/2),y=(j-(n-1)/2)/(n/2);if(x*x+y*y>.92)continue;
  const z=state.filters[0]===1?x*y:state.filters[0]===2?Math.exp(-((x-.3)**2+(y+.2)**2)*4):x*x+y*y;
  const value=Math.min(1,Math.max(0,.35+z*.5+Math.sin(i*.6+j*.5+state.revision)*.1));
  const surface=topography&&state.view===0,cx=surface?340+(x-y)*180:490+x*220,cy=surface?210+(x+y)*70-z*75:240+y*220;
  cells.push(`<rect x="${cx}" y="${cy}" width="${surface?400/n:430/n}" height="${surface?190/n:430/n}" rx="${state.view===2&&topography?5:1}" fill="hsl(${215-value*175} 55% ${39+value*25}%)"><title>X ${x.toFixed(2)} · Y ${y.toFixed(2)} · ${(4.8+value*.3).toFixed(3)} µm</title></rect>`);
 }
 return `<figure class="demo-chart"><figcaption>${topography?demoSpecs[state.id].views[state.view]:'Wafer Map'}<span>Sample thickness · µm</span></figcaption><svg viewBox="0 0 1020 490" role="img" aria-label="Sample wafer ${topography?'topography':'map'}"><circle cx="500" cy="240" r="225" fill="none" stroke="currentColor" opacity=".15"${topography&&state.view===0?' visibility="hidden"':''}/>${cells.join('')}<text x="790" y="170">Thickness · µm</text>${Array.from({length:30},(_,i)=>`<rect x="810" y="${190+i*5}" width="18" height="5.2" fill="hsl(${215-i/29*175} 55% ${39+i/29*25}%)"/>`).join('')}<text x="842" y="202">4.80</text><text x="842" y="338">5.10</text><text x="500" y="483" text-anchor="middle">${topography?'Synthetic surface · change profile or resolution to explore':'Measured sites · hover a cell for its value'}</text></svg></figure>`;
}
function result(state,rows){
 const cfg=demoSpecs[state.id],kind=cfg.kind,stats=summarize(rows);
 if(!rows.length)return `<div class="demo-empty"><strong>No sample loaded</strong><p>Load an example to explore this workspace.</p>${button('Load Example','run')}</div>`;
 if(kind==='topography'||kind==='lens'&&state.view===1)return wafer(state,kind==='topography');
 if(kind==='diff'){
  const target=filterOptions('Target')[state.filters[1]],offset=state.filters[1]*2+state.revision;
  return metrics([['Reference',filterOptions('Reference')[state.filters[0]]],['Target',target],['Changed properties',5+offset],['Unchanged',35-offset]])+(state.view===1?table(['Block','Changed','Added','Removed'],[['Temperature Controller',3+offset,0,0],['Carrier Gas',2,0,0],['Reflectometer',0,0,1],['Flow Verification',0,1,0]]):`<div class="demo-diff"><section><h3>${esc(filterOptions('Reference')[state.filters[0]])}</h3><pre>${esc('<Devices VERSION="3.2">\n  <TemperatureController>\n    Setpoint = 1100\n    Offset   = 0.12\n    Gain     = 1.00\n  </TemperatureController>\n  <CarrierGas>\n    Flow = 250\n  </CarrierGas>\n</Devices>')}</pre></section><section><h3>${esc(target)}</h3><pre>&lt;Devices VERSION="3.2"&gt;\n  &lt;TemperatureController&gt;\n<span>    Setpoint = ${1102+offset}</span>\n<span>    Offset   = ${(0.14+offset*.01).toFixed(2)}</span>\n<span>    Gain     = 1.02</span>\n  &lt;/TemperatureController&gt;\n  &lt;CarrierGas&gt;\n<span>    Flow = ${255+offset}</span>\n  &lt;/CarrierGas&gt;\n&lt;/Devices&gt;</pre></section></div>`);
 }
 if(kind==='compiler')return metrics([['Workflow',cfg.views[state.view]],['Source files',4],['Compiled rows',rows.length],['Validation','Sample complete']])+`<div class="demo-sources">${['PL measurements','LayTec analysis','XRR thickness','XRD measurements'].map((s,i)=>`<div><span class="demo-success">✓</span><strong>${s}</strong><span>${i+1} sample file · ready</span></div>`).join('')}</div>`+table(['Run','Wafer','Peak λ · nm','Thickness · µm','Temperature · °C'],rows.slice(0,12).map(r=>[r.run,r.wafer,r.x,r.thickness,r.temperature]));
 if(kind==='assignment')return metrics([['Mapping',cfg.views[state.view]],['Wafers',12],['Assignment','Illustrative'],['Reactor',filterOptions('Reactor')[state.filters[1]]]])+table(['Pocket','Wafer','Input '+(state.view?'°C':'g'),'Assigned pocket','Action'],rows.slice(0,12).map((r,i)=>[i+1,r.wafer,state.view?r.temperature:(152.3+i*.18).toFixed(2),((i*5+state.filters[0]+state.revision)%12)+1,i%3?'Keep orientation':'Rotate 180°']));
 if(kind==='schedule')return metrics([['Equipment',filterOptions(cfg.filters[0])[state.filters[0]]],['Scheduled',12],['Due soon',3],['Overdue',1]])+table(['Equipment','Service','Remaining runs','Status','Next action'],rows.slice(0,12).map((r,i)=>[r.equipment,`ANKO ${String(i+1).padStart(2,'0')}`,Math.max(0,24-i*2-state.revision),i>9?'Due soon':'Scheduled',state.view?'Plan service window':'Review schedule']));
 if(kind==='lots')return metrics([['Lot','DEMO125207'],['Recipe','Demo Process'],['Wafers',rows.length],['Chamber',filterOptions('Chamber')[state.filters[0]]]])+table(['Chamber','Wafer','Deposition status','Duration','Result'],rows.map((r,i)=>[r.equipment,r.wafer,`${r.count} depositions`,`${167+i%9} s`,r.status]));
 if(kind==='counts')return metrics([['Equipment',filterOptions('Equipment')[state.filters[0]]],['Total wafers',rows.length*24],['Period',filterOptions('Period')[state.filters[1]]],['Reactors',12]])+`<div class="demo-bars">${Array.from({length:12},(_,i)=>{const n=72+(i*37+state.revision*11+state.filters[1]*23)%240;return `<div><span>Reactor ${String.fromCharCode(65+i)}</span><i style="width:${n/3.5}%;background:${colors[i%3]}"></i><strong>${n}</strong></div>`;}).join('')}</div>`;
 if(kind==='telemetry'&&[0,2].includes(state.view))return metrics([['Equipment',state.filters[0]?filterOptions('Equipment')[state.filters[0]]:'All equipment'],['Window',state.view===2?'12 hours':filterOptions('Period')[state.filters[1]]],['Healthy channels',11],['Review required',1]])+`<div class="demo-sources">${['Temperature','Chamber pressure','Bubbler level','Carrier gas flow'].map((name,i)=>`<div><span class="demo-success">${i===2?'◦':'✓'}</span><strong>${name}</strong><span>${i===2?'Level low · sample alert':'Within sample limits'}</span></div>`).join('')}</div>`+chart(state,rows,'line','Equipment history · sample values');
 if(kind==='zones')return metrics([['Inner zone',filterOptions('Inner zone')[state.filters[0]]],['Outer zone',filterOptions('Outer zone')[state.filters[1]]],['Adjustment','Sample calculation'],['Profile','Radial']])+chart(state,rows,'line','Inner / outer zone response');
 if(kind==='index'&&state.view===0||kind==='spc'&&state.view===3)return table(['Equipment','Parameter','Last measurement','Chart'],rows.slice(0,12).map((r,i)=>[r.equipment,['Peak wavelength','Thickness','Temperature'][i%3],r.x,`Chart ${i+1} · available in Parameter ${kind==='index'?'trend':'charts'}`]));
 let type='line';
 if(kind==='lens')type=['scatter','wafer','box','histogram','line'][state.view];
 if(state.id==='aperture-spc')type=['line','scatter','histogram','box'][state.view];
 if(state.id==='metria-spc'&&state.view>0)type='box';
 const title=cfg.views[state.view];
 return metrics([['Measurements',stats.count],['Equipment',state.filters[0]?filterOptions(cfg.filters[0])[state.filters[0]]:'All'],['Selection',filterOptions(cfg.filters[1])[state.filters[1]]],['Data source','Sample data']])+chart(state,rows,type,title)+(kind==='diagnosis'?`<div class="demo-message">Example diagnosis: the sample contains a gradual offset between reference and measured temperature. Compare cases to inspect the response. No equipment changes are made.</div>`:'');
}
function detailContent(state,rows){
 const kind=demoSpecs[state.id].kind,stats=summarize(rows,['diagnosis','zones','telemetry'].includes(kind)?'temperature':kind==='lots'?'count':'x');
 if(state.tab==='statistics'){
  if(kind==='diff')return metrics([['Compared blocks',8],['Changed properties',5+state.filters[1]*2+state.revision],['Added blocks',1],['Removed blocks',1]]);
  if(kind==='schedule')return metrics([['Scheduled services',12],['Due soon',3],['Equipment groups',3],['Example status','Ready']]);
  if(kind==='assignment')return metrics([['Assigned pockets',12],['Mapping',state.view?'Temperature':'Weight'],['Example status','Complete'],['Actions to review',4]]);
  return metrics([['Sample records',stats.count],['Mean '+(['diagnosis','zones','telemetry'].includes(kind)?'temperature':kind==='lots'?'depositions':'wavelength'),stats.mean],['Standard deviation',stats.sd],['Range',`${stats.min}–${stats.max}`]]);
 }
 if(kind==='diff')return table(['Property','Reference','Target','Result'],[['Setpoint',1100,1102+state.revision,'Changed'],['Offset',.12,.14,'Changed'],['Gain',1,1.02,'Changed'],['Enabled','true','true','Unchanged']]);
 if(kind==='schedule')return table(['Equipment','Service','Remaining runs','Status'],rows.slice(0,12).map((r,i)=>[r.equipment,`ANKO ${i+1}`,24-i*2,i>9?'Due soon':'Scheduled']));
 if(kind==='assignment')return table(['Pocket','Wafer','Sample temperature · °C','Sample weight · g'],rows.slice(0,12).map((r,i)=>[i+1,r.wafer,r.temperature,(152.3+i*.18).toFixed(2)]));
 if(kind==='lots'||kind==='counts')return table(['Equipment','Wafer','Run','Depositions','Result'],rows.map(r=>[r.equipment,r.wafer,r.run,r.count,r.status]));
 if(['telemetry','diagnosis','zones'].includes(kind))return table(['Sample','Equipment','Temperature · °C','Pressure · mbar','Result'],rows.map(r=>[r.index,r.equipment,r.temperature,r.pressure,r.status]));
 return table(['Run','Equipment','Wafer','Wavelength · nm','Intensity · a.u.','Thickness · µm'],rows.map(r=>[r.run,r.equipment,r.wafer,r.x,r.y,r.thickness]));
}
export function demoMarkup(app,state){
 const cfg=demoSpecs[app.id],rows=sampleRows(state),stats=summarize(rows);
 return `<header class="demo-heading"><div><h2>${esc(app.name)}</h2><p>${esc(app.purpose)}</p></div><span class="demo-label">Interactive demo · Sample data</span>${button('← Home','home')}</header><nav class="demo-views" aria-label="${esc(app.name)} views">${cfg.views.map((v,i)=>button(esc(v),'view',`data-value="${i}" aria-pressed="${state.view===i}"`)).join('')}</nav><div class="demo-toolbar">${button(cfg.action,'run','class="demo-primary"')}${button(state.controls?'Hide Controls':'Show Controls','controls')}${button('Reset','reset')}${button('Export sample CSV','export',rows.length?'':'disabled')}${button('Clear','clear',rows.length?'':'disabled')}</div>${state.controls?`<div class="demo-filters">${cfg.filters.map((label,i)=>`<label>${esc(label)}<select data-demo-filter="${i}">${filterOptions(label).map((option,n)=>`<option value="${n}"${state.filters[i]===n?' selected':''}>${esc(option)}</option>`).join('')}</select></label>`).join('')}<p>Use the controls to explore a local sample. Real file processing and equipment connections are available in ARTIFACTS.</p></div>`:''}<div class="demo-result">${result(state,rows)}</div>${rows.length?`<section class="demo-data"><div class="demo-data-tabs">${button('Data','tab',`data-value="data" aria-pressed="${state.tab==='data'}"`)}${button('Statistics','tab',`data-value="statistics" aria-pressed="${state.tab==='statistics'}"`)}</div>${detailContent(state,rows)}</section>`:''}<p class="demo-status" role="status">${esc(state.notice)}</p>`;
}
