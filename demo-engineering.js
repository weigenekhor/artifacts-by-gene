import {assignment,records,stats,rbfSurface,groupRows,unique,diagnosticPairs,caseObservations,diagnose,DIAGNOSTIC_FIELDS} from './demo-model.js';
import {esc,fmt,button,tabs,select,input,toolbar,panel,empty,summary,plot,distribution,waferMap,heat} from './demo-view.js';
function pocketSvg(result,count){
 const n=Number(count),base=result.base,st=stats(base),radius=n>6?50:n>5?57:70;
 return `<svg viewBox="0 0 540 540" class="demo-susceptor" role="img" aria-label="Baseplate assignment by susceptor pocket"><circle cx="270" cy="270" r="250" fill="var(--panel)" stroke="var(--border)" stroke-width="2"/>${base.map((v,i)=>{
 const a=(162+i*360/n)*Math.PI/180,x=270+170*Math.cos(a),y=270+170*Math.sin(a),rank=result.order.indexOf(i),label=rank===0?'Coldest':rank===n-1?'Hottest':rank===Math.floor(n/2)?'Middle':rank<n/2?`Cold #${rank+1}`:`Hot #${n-rank}`;
 const mix=(v-st.min)/(st.max-st.min||1),c=`rgb(${Math.round(209*mix)} ${Math.round(123*(1-mix))} ${Math.round(255*(1-mix)+31*mix)})`;return `<defs><radialGradient id="pocket-${i}"><stop stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity=".55"/></radialGradient></defs><circle cx="${x}" cy="${y}" r="${radius}" fill="url(#pocket-${i})" stroke="${result.map[i]!==i?'#7ba5b5':'var(--border)'}" stroke-width="${result.map[i]!==i?3:1}"/><text x="${x}" y="${y-26}" text-anchor="middle" class="demo-pocket-title">S${i+1}</text><text x="${x}" y="${y}" text-anchor="middle">${label}</text><text x="${x}" y="${y+26}" text-anchor="middle" class="demo-pocket-action">Load BP${result.map[i]+1}</text>`;
 }).join('')}<circle cx="180" cy="487" r="4" fill="currentColor"/></svg>`;
}
export function assignmentView(s){
 const result=assignment(s),weight=s.mode==='Weight Mapping',second=weight?'weights':'withbp',n=Number(s.count);
 const rows=result?result.base.map((v,i)=>({Slot:`S${i+1}`,Baseline:v,Baseplate:`BP${result.map[i]+1}`,...(!weight?{Predicted:result.temperatures[i]}:{Weight:result.measured[result.map[i]]})})):[];
 const values=key=>s[key].slice(0,n).map((v,i)=>input((key==='baseline'?'S':'BP')+(i+1),`${key}.${i}`,v,'number','step="0.1"')).join('');
 return {rows,html:`<div class="demo-assignment"><div>${tabs(['Weight Mapping','Temperature Mapping'],s.mode)}${toolbar(button('Load Example','sample'),button('Clear','clear'))}${panel('',input('Number of Slots','count',n,'range','min="3" max="8" step="1"')+`<output>${n}</output>`)}<div class="demo-two-columns">${panel('Without Baseplates (°C)',values('baseline'))}${panel(weight?'Baseplate Weights (g)':'With Baseplates (°C)',values(second))}</div>${result?panel('ACTION SUMMARY',`<h4>${esc(result.title)}</h4><p>${weight?'Assign heavier baseplates to colder bare pockets. Weight is a proxy for initial placement; this mode does not predict a temperature.':`Measured ΔT ${fmt(result.original,1)}°C → calculated ΔT ${fmt(result.expected,1)}°C.`}</p><h4>Baseline ΔT Check</h4><p>Without-baseplates ΔT = ${fmt(result.bareDelta,1)}°C. ${result.bareDelta>6?'Above the 6.0°C baseline check: check baseplate and susceptor wobble/eccentricity before relying on assignment.':'Within the 6.0°C baseline check.'}</p><h4>Recommended ${weight?'Initial Placement':'Reassignment'}</h4>${rows.map(r=>`<p>Load ${r.Baseplate} into ${r.Slot}.</p>`).join('')}`,'demo-action-summary'):empty('Enter a measurement for every pocket and baseplate.')}</div>${panel(weight?'Weight-Based Initial Assignment':'Temperature-Based Reassignment',result?pocketSvg(result,n):empty('Assignment updates as measurements are entered.'))}</div>`};
}
const point=(angle,r=188)=>[300+r*Math.cos((angle-90)*Math.PI/180),300+r*Math.sin((angle-90)*Math.PI/180)];
const wedge=(from,to,c)=>{const a=point(from),b=point(to);return `<path d="M300,300L${a}A188,188 0 0,1 ${b}Z" fill="${c}" fill-opacity="0" stroke="${c}" stroke-width="1.3"/>`;};
export function zonesView(s){
 const ia=Number(s.innerAnchor)*72,oa=Number(s.outerAnchor)*72,inner=Number(s.inner),min=Number(s.outerMin),max=Number(s.outerMax);
 const diagram=`<svg viewBox="0 0 600 600" role="img" aria-label="Inner and outer angular measurement zones"><circle cx="300" cy="300" r="265" fill="var(--panel)" stroke="var(--border-hover)"/>${Array.from({length:5},(_,i)=>{const [x,y]=point(i*72,188);return `<circle cx="${x}" cy="${y}" r="83" fill="var(--surface)" stroke="var(--border-hover)"/><text x="${x}" y="${y+4}" text-anchor="middle">S${i+1}</text>`;}).join('')}${wedge(ia-inner,ia+inner,'var(--accent)')}${wedge(oa-max,oa-min,'var(--accent)')}${wedge(oa+min,oa+max,'var(--accent)')}<circle cx="300" cy="300" r="188" fill="none" stroke="var(--border)"/><circle cx="300" cy="300" r="5" fill="currentColor"/>${[[ia-inner,-inner],[ia+inner,inner],[oa-max,-max],[oa-min,-min],[oa+min,min],[oa+max,max]].map(([a,label])=>{const [x,y]=point(a,205);return `<text x="${x}" y="${y}" text-anchor="middle">${label}°</text>`;}).join('')}</svg>`;
 return {rows:[{InnerHalfAngle:inner,OuterMin:min,OuterMax:max,InnerAnchor:Number(s.innerAnchor)+1,OuterAnchor:Number(s.outerAnchor)+1}],html:`<div class="demo-zones"><aside>${panel('Inner Area',input('Half-angle (°)','inner',inner,'range','min="1" max="36" step="0.1"')+`<output>±${inner}°</output>`+select('Inner Anchor','innerAnchor',Array.from({length:5},(_,i)=>({value:i,label:`S${i+1}`})),s.innerAnchor))}${panel('Outer Area',input('Minimum (°)','outerMin',min,'range','min="0" max="36" step="0.1"')+input('Maximum (°)','outerMax',max,'range','min="0" max="36" step="0.1"')+`<output>±${min}° to ±${max}°</output>`+select('Outer Anchor','outerAnchor',Array.from({length:5},(_,i)=>({value:i,label:`S${i+1}`})),s.outerAnchor))}${button('Reset','reset')}</aside>${panel('',diagram)}</div>`};
}
export function diagnosisView(data,s){
 const pairs=diagnosticPairs(data),observations=s.observations||caseObservations(data,Number(s.diagnosis)),result=diagnose(data,observations);
 const group=(recipe,field)=>{
  const key=recipe+'/'+field,values=unique(pairs.map(p=>p[recipe][field]));
  return `<section class="demo-observation-group"><h4>${esc(field)}</h4>${values.map(v=>{
   const tone=/Increased|Hotter/.test(v)?'hot':/Decreased|Colder/.test(v)?'cold':/Comparable/.test(v)?'same':'unknown';
   return `<button type="button" data-action="observe" data-key="${esc(key)}" data-value="${esc(v)}" class="demo-observe-${tone}" aria-pressed="${observations[key]===v}">${esc(v)}</button>`;
  }).join('')}</section>`;
 };
 const findings=result.missing.length?empty('Select one observation in each required group.'):
  !result.matches.length?panel('No exact diagnostic match', '<p>The selected observations do not match a paired case in the diagnostic master. Review the measurements; no cause has been inferred.</p>'):
  panel('DIAGNOSTIC SUMMARY',`<h4>${result.matches.length===1?'Exact diagnostic match found':result.matches.length+' matching diagnostic cases found'}</h4><p>Use the recommended checks below to confirm the suspected mechanism.</p>`,'demo-diagnostic-summary')+
  result.matches.map(p=>panel('',`<h4>Likely Root Cause</h4><p>${unique([p.Clean['Hypothesized Root Causes'],p.Process['Hypothesized Root Causes']]).map(esc).join('<br>')}</p><h4>Recommended Checks</h4><p>${unique([p.Clean.Suggestions,p.Process.Suggestions]).map(v=>esc(v).replaceAll('\n','<br>')).join('<br>')}</p><h4>Why This Matches</h4><p>${esc(p.Clean.Descriptions)}</p><p>${esc(p.Process.Descriptions)}</p>`)).join('');
 return {rows:result.matches.flatMap(p=>[p.Clean,p.Process]),html:
  panel('Temperature Control Logic','<details><summary>Process and clean recipe feedback</summary><p>Process: LayTec temperature feedback adjusts TFB correction. Clean: reactor-temperature control. Compare both observations before interpreting the root-cause suggestions.</p></details>')+
  toolbar(select('Archived case','diagnosis',pairs.map((p,i)=>({value:i,label:`Case ${i+1} · ${p.Clean['Hypothesized Root Causes']||'Review observations'}`})),s.diagnosis),button('Clear selections','clear-observations'),button('Reset','reset'))+
  `<div class="demo-two-columns"><div>${['Process','Clean'].map(r=>panel(r+' Recipe Observations',`<div class="demo-observation-columns">${DIAGNOSTIC_FIELDS[r].map(f=>group(r,f)).join('')}</div>`)).join('')}</div><div>${findings}</div></div>`};
}
function surface(coords,values,evaluate,rotation){
 const st=stats(values),a=Number(rotation)*Math.PI/180,project=(x,y,z)=>{const rx=x*Math.cos(a)-y*Math.sin(a),ry=x*Math.sin(a)+y*Math.cos(a);return [255+rx*1.55,195+ry*.65-(z-st.min)/(st.max-st.min||1)*95];};
 const cells=[];for(let y=-95;y<95;y+=8)for(let x=-95;x<95;x+=8){if(Math.hypot(x+4,y+4)>92)continue;const corners=[[x,y],[x+8,y],[x+8,y+8],[x,y+8]],z=evaluate(x+4,y+4);cells.push({depth:(x+4)*Math.sin(a)+(y+4)*Math.cos(a),html:`<polygon points="${corners.map(([x,y])=>project(x,y,evaluate(x,y)).join(',')).join(' ')}" fill="${topoColor(z,st.min,st.max)}" stroke="${topoColor(z,st.min,st.max)}" stroke-width=".4"><title>${fmt(z,5)} Ω cm</title></polygon>`});}
 cells.sort((a,b)=>a.depth-b.depth);
 return `<svg viewBox="0 0 510 350" role="img" aria-label="Rotatable RBF resistivity surface"><path d="M55 265H450M255 325V35" class="demo-grid"/>${cells.map(c=>c.html).join('')}<text x="255" y="340" text-anchor="middle">Resistivity (Ω cm) · ${fmt(st.min,4)} — ${fmt(st.max,4)}</text></svg>`;
}
const topoColor=(v,min,max)=>{const t=Math.max(0,Math.min(1,(v-min)/(max-min||1)));return `rgb(${[3,2,1].map(k=>Math.round(255*Math.max(0,Math.min(1,1.5-Math.abs(4*t-k))))).join(' ')})`;};
function contour(evaluate,values,coordinates,interpolated){
 const st=stats(values),X=x=>215+x*1.8,Y=y=>215-y*1.8,cells=[],lines=[];
 if(interpolated){
  const grid=new Map(),value=(x,y)=>{const key=x+','+y;if(!grid.has(key))grid.set(key,evaluate(x,y));return grid.get(key);};
  for(let y=-96;y<96;y+=4)for(let x=-96;x<96;x+=4){
   if(Math.hypot(x+2,y+2)>95)continue;
   const corners=[[x,y],[x+4,y],[x+4,y+4],[x,y+4]],zs=corners.map(([x,y])=>value(x,y)),avg=zs.reduce((a,b)=>a+b,0)/4;
   cells.push(`<rect x="${X(x)}" y="${Y(y+4)}" width="7.3" height="7.3" fill="${topoColor(avg,st.min,st.max)}"/>`);
   for(let level=1;level<13;level++){
    const z=st.min+(st.max-st.min)*level/13,cross=[];
    for(let i=0;i<4;i++){const j=(i+1)%4;if((zs[i]<z)===(zs[j]<z))continue;const t=(z-zs[i])/(zs[j]-zs[i]);cross.push([corners[i][0]+t*(corners[j][0]-corners[i][0]),corners[i][1]+t*(corners[j][1]-corners[i][1])]);}
    for(let i=0;i+1<cross.length;i+=2)lines.push(`M${X(cross[i][0])},${Y(cross[i][1])}L${X(cross[i+1][0])},${Y(cross[i+1][1])}`);
   }
  }
 }else coordinates.forEach(([x,y],i)=>cells.push(`<circle cx="${X(x)}" cy="${Y(y)}" r="9" fill="${topoColor(values[i],st.min,st.max)}" data-tooltip="Site ${i+1} · X ${x} · Y ${y} · ${fmt(values[i],5)} Ω cm"/>`));
 return `<svg viewBox="0 0 500 450" role="img" aria-label="Resistivity contour"><defs><clipPath id="topo-contour-clip"><circle cx="215" cy="215" r="171"/></clipPath></defs><g clip-path="url(#topo-contour-clip)">${cells.join('')}<path d="${lines.join(' ')}" stroke="#192e36" stroke-width=".6" fill="none" opacity=".7"/></g><path d="M35 35V395H395V35Z" stroke="#333" fill="none"/>${[-100,-50,0,50,100].map(v=>`<text x="${X(v)}" y="415" text-anchor="middle">${v}</text><text x="26" y="${Y(v)+4}" text-anchor="end">${v}</text>`).join('')}${Array.from({length:80},(_,i)=>`<rect x="427" y="${35+i*4.5}" width="17" height="4.6" fill="${topoColor(st.max-(st.max-st.min)*i/79,st.min,st.max)}"/>`).join('')}<text x="449" y="42">${fmt(st.max,4)}</text><text x="449" y="395">${fmt(st.min,4)}</text><text x="215" y="442" text-anchor="middle">X (mm) · Resistivity (Ω cm)</text></svg>`;
}
let cachedTopo=null;
export function topoView(data,s){
 const values=s.plotted,coords=data.coordinates;if(!values.length)return {rows:[],html:toolbar(button('Load Example','sample'))+empty('Load the 49-point resistivity sample.')};
 const cacheKey=values.join(',');if(cachedTopo?.key!==cacheKey)cachedTopo={key:cacheKey,evaluate:rbfSurface(coords,values)};
 const evaluate=cachedTopo.evaluate,points=coords.map(([x,y],i)=>({x,y,value:values[i]})),interpolated=s.mode!=='Non-interpolated Plots';
 const charts=`<div class="demo-topo-canvases"><div class="demo-two-columns">${panel(interpolated?'Interpolated Contour':'Measurement Sites',contour(evaluate,values,coords,interpolated))}${panel('Surface',surface(coords,values,evaluate,s.rotation)+input('Rotate surface','rotation',s.rotation,'range','min="0" max="360"'))}</div>${s.mode==='TopoPro Mode'?`<div class="demo-chart-grid">${plot(points.map(p=>({x:Math.hypot(p.x,p.y),y:p.value})),{title:'Radial profile',xLabel:'Radius (mm)',yLabel:'Ω cm',height:240})}${distribution(new Map([['49 sites',values]]),'Resistivity (Ω cm)')}${plot(Array.from({length:39},(_,i)=>({x:-95+i*5,y:evaluate(-95+i*5,0)})),{kind:'line',title:'Horizontal cross-section',xLabel:'X (mm)',yLabel:'Ω cm',height:240})}${plot(Array.from({length:39},(_,i)=>({x:-95+i*5,y:evaluate(0,-95+i*5)})),{kind:'line',title:'Vertical cross-section',xLabel:'Y (mm)',yLabel:'Ω cm',height:240})}</div>`:''}</div>`;
 return {rows:points.map((p,i)=>({Site:i+1,X:p.x,Y:p.y,Resistivity:p.value})),html:tabs(['TopoPro Mode','Interpolated Plots (RBF)','Non-interpolated Plots'],s.mode)+panel('Demo Workcenter A Resistivity 49 points',`<label class="demo-field demo-measurements"><span>Measurement Values (Ω cm)</span><textarea data-field="valuesText" aria-label="Resistivity measurements" rows="3">${esc(s.values.join(' '))}</textarea></label>`+toolbar(button('Plot','plot'),button('Reset','reset'),`<span>${s.values.length} / 49 values</span>`))+charts};
}
