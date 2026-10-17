import {DEMOS,records,unique,numericColumns,selectRows,stats,groupRows,correlation} from './demo-model.js';
import {esc,fmt,button,tabs,select,check,toolbar,panel,empty,table,summary,plot,distribution,boxes,waferMap} from './demo-view.js';
const all=values=>['All',...unique(values)];
const palette=s=>select('Chart Theme','palette',['Nocturne','Monochrome'],s.palette);
const tabsFooter=(s,body)=>panel('',toolbar(tabs(['Data','Statistics','Wafer Average Correlations'],s.tab,'tab'),button(s.expanded?'Collapse':'Expand','toggle','expanded'))+(s.expanded?body:''),'demo-data-drawer');
export function lensView(data,s){
 const rows=selectRows(data,s,'lens'),allRows=records(data),parameters=numericColumns(data).filter(k=>!['Wafer','X','Y'].includes(k));
 const points=rows.map(r=>({x:r[s.x],y:r[s.y],group:String(r[s.group]??'Measurements'),label:`${r.Run} · W${r.Wafer} · (${r.X}, ${r.Y})`}));
 let chart;
 if(s.mode==='Parameter Relationship')chart=plot(points,{xLabel:s.x,yLabel:s.y,palette:s.palette});
 else if(s.mode==='Wafer Map')chart=`<div class="demo-wafer-grid">${[...groupRows(rows,r=>`${r.Run} · W${r.Wafer}`)].slice(0,9).map(([name,rs])=>panel(name,waferMap(rs.map(r=>({x:r.X,y:r.Y,value:r[s.y]})),s.y))).join('')}</div>`;
 else if(s.mode==='Run Comparison')chart=boxes(new Map([...groupRows(rows,'Run')].map(([k,rs])=>[k,rs.map(r=>r[s.y])])),s.y);
 else if(s.mode==='Distribution')chart=distribution(new Map([...groupRows(rows,s.group)].map(([k,rs])=>[k,rs.map(r=>r[s.y])])),s.y,s.palette);
 else chart=plot(rows.map(r=>({x:Math.hypot(r.X,r.Y),y:r[s.y],group:r.Run,label:`W${r.Wafer} · (${r.X}, ${r.Y})`})),{xLabel:'Distance from wafer centre (mm)',yLabel:s.y,palette:s.palette,title:'Wafer Profile'});
 const waferMeans=[...groupRows(rows,r=>`${r.Run} · W${r.Wafer}`)].map(([name,rs])=>({Wafer:name,...Object.fromEntries(parameters.map(k=>[k,stats(rs.map(r=>r[k])).mean]))}));
 const correlations=parameters.map(k=>({Parameter:k,[`Correlation with ${s.x}`]:correlation(waferMeans.map(r=>({x:r[s.x],y:r[k]})))}));
 const bottom=s.tab==='Data'?table(rows,{page:s.page}):s.tab==='Statistics'?table(parameters.map(k=>({Parameter:k,...stats(rows.map(r=>r[k]))})),{sortable:false}):table(correlations,{sortable:false});
 return {rows,html:`${s.controls?panel('',toolbar(`<span class="demo-source">Wafer measurements.csv · ${allRows.length.toLocaleString()} sites</span>`,button('Browse…','sample'),palette(s))+tabs(DEMOS['data-lens'].modes,s.mode)+toolbar(select('Run','filter',all(allRows.map(r=>r.Run)),s.filter),select('Wafer','filter2',all(allRows.map(r=>String(r.Wafer))),s.filter2),button('Export','export'))):''}${toolbar(button(s.controls?'Hide Controls':'Show Controls','toggle','controls'),button('Variables','toggle','variables'),button('Reset','reset'),s.controls?'':select('Smart Plot','mode',DEMOS['data-lens'].modes,s.mode),select('X Parameter','x',parameters,s.x),select('Y Parameter','y',parameters,s.y),select('Group / Color','group',['Run','Wafer','Reactor','Structure'],s.group))}${s.variables?panel('Variables',table(parameters.map(k=>({Parameter:k,Unit:/Wavelength/.test(k)?'nm':k==='Thickness'?'µm':'',...stats(rows.map(r=>r[k]))})),{sortable:false}), 'demo-variables'):''}${chart}${tabsFooter(s,bottom)}`};
}
export function metrologyView(kind,data,s){
 const isA=kind==='aperture',allRows=records(data),rows=selectRows(data,s,kind),parameters=isA?unique(allRows.map(r=>r.ParameterName)):numericColumns(data).filter(k=>k!=='Satellite no.');
 const modes=DEMOS[isA?'aperture-spc':'metria-spc'].modes;
 const values=rows.map(r=>isA?r.NumericValue:r[s.y]),runs=unique(rows.map(r=>isA?r.MaterialName:r['Run no.']));
 const by=s.mode==='Compare Run Types'?'Run Type':isA?'ResourceName':'Equipment';
 const points=rows.map((r,i)=>({x:i,y:values[i],group:r[by],label:isA?`${r.MaterialName} · ${r.UTCDatetime} · Site ${r.SampleId}`:`${r['Run no.']} · S${r['Satellite no.']} · ${r['Run Type']}`}));
 const source=rows[0]||{},limits=s.limits&&isA?[{label:'LSL',value:source.LSL},{label:'Target',value:source.Target,color:'#d2ce9c'},{label:'USL',value:source.USL}]:[];
 let chart;
 if(s.mode==='Distribution')chart=distribution(new Map([...groupRows(rows,by)].map(([k,rs])=>[k,rs.map(r=>r.NumericValue)])),s.y,s.palette);
 else if(s.mode==='Boxplot'||s.mode==='Compare Run Types'||s.mode==='Compare Reactors')chart=boxes(new Map([...groupRows(rows,s.mode==='Boxplot'?'MaterialName':by)].map(([k,rs])=>[k,rs.map(r=>isA?r.NumericValue:r[s.y])])),s.y);
 else if(s.mode==='Scatter'&&isA){
  const xParameter=parameters.includes(s.x)?s.x:parameters.find(p=>p!==s.y)||parameters[0],xRows=allRows.filter(r=>r.ParameterName===xParameter),lookup=new Map(xRows.map(r=>[`${r.MaterialName}/${r.SampleId}`,r.NumericValue]));
  chart=plot(rows.map(r=>({x:lookup.get(`${r.MaterialName}/${r.SampleId}`),y:r.NumericValue,group:r.ResourceName,label:`${r.MaterialName} · ${r.SampleId}`})),{xLabel:xParameter,yLabel:s.y,palette:s.palette});
 }else chart=plot(points,{title:s.y,xLabel:'Measurement / wafer sequence',yLabel:s.y,limits,mean:s.means,palette:s.palette});
 const byRun=[...groupRows(rows,isA?'MaterialName':'Run no.')].map(([run,rs],i)=>({x:i,y:stats(rs.map(r=>isA?r.NumericValue:r[s.y])).mean,group:'Run mean',label:run}));
 const controls=panel('',toolbar(`<span class="demo-source">${isA?'Metrology.csv':'Metrology.xlsx'} · ${allRows.length.toLocaleString()} ${isA?'readings':'wafers'}</span>`,button('Load sample','sample'),palette(s))+tabs(modes,s.mode)+toolbar(select('Parameter','y',parameters,s.y),s.mode==='Scatter'?select('X Parameter','x',parameters,parameters.includes(s.x)?s.x:parameters[0]):'',select(isA?'Equipment':'Reactor','filter',all(allRows.map(r=>isA?r.ResourceName:r.Equipment)),s.filter),select(isA?'Lot':'Run Type','filter2',all(allRows.map(r=>isA?r.MaterialName:r['Run Type'])),s.filter2),check('Mean','means',s.means),isA?check('Limits','limits',s.limits):'',button('Export','export')));
 return {rows,html:`${s.controls?controls:''}${toolbar(button(s.controls?'Hide Controls':'Show Controls','toggle','controls'),s.controls?'':select('Analysis mode','mode',modes,s.mode),button('Reset','reset'))}${summary(values)}${chart}${!isA&&s.mode==='Single Reactor'?plot(byRun,{kind:'line',xLabel:'Run sequence',yLabel:s.y,title:'Run means',height:230,palette:s.palette}):''}${toolbar(button(s.expanded?'Hide Data':'Show Data','toggle','expanded'),`<span>${runs.length} runs / lots in selection</span>`)}${s.expanded?table(rows,{page:s.page}):''}`};
}
export function magusView(data,s){
 const index=Math.min(Number(s.chart),data.charts.length-1),c=data.charts[index],start=Math.max(0,c.mean.length-Math.ceil(Number(s.days||30)/30*c.mean.length)),series=c[s.metric]||c.mean;
 const metricLabel={mean:'Mean',sigma:'Sigma',range:'Range'}[s.metric],lcl=c[s.metric==='mean'?'ctrl_lcl':`${s.metric}_lcl`],ucl=c[s.metric==='mean'?'ctrl_ucl':`${s.metric}_ucl`];
 const points=series.map((v,i)=>({x:i,y:v,group:'Measured',label:c.x_labels[i],color:v<lcl||v>ucl?'#e66b68':undefined})).slice(start);
 const raw=c.raw_y.map((v,i)=>({x:c.raw_x[i],y:v,group:`Group ${c.group_id_per_point[c.raw_i_pt[i]]??1}`,label:c.x_labels[c.raw_i_pt[i]]})).filter(p=>p.x>=start);
 const rows=data.rows.filter(r=>s.filter==='All'||r.status.startsWith(s.filter));
 return {rows:points.map(p=>({Sample:p.label,[metricLabel]:p.y})),html:panel('',toolbar(select('Equipment','filter2',['Equipment A'],s.filter2==='All'?'Equipment A':s.filter2),select('Days','days',[1,7,14,30],s.days),button('Fetch SPC Data and Plot in Artifacts','sample'),button('Web Report','toggle','report'),palette(s))+toolbar(select('Jump to chart','chart',data.rows.map((r,i)=>({value:i,label:r.parameter_name+' · '+r.spc_channel})),index),select('Status','filter',['All','Passed','Failed'],s.filter),button('Export','export')))+table(rows,{limit:12,sortable:false})+tabs(['mean','sigma','range'],s.metric,'metric')+plot(points,{title:c.title,kind:'line',xLabel:'Sample sequence',yLabel:metricLabel,limits:s.limits?[{label:'LCL',value:lcl},{label:'UCL',value:ucl}]:[],height:290,palette:s.palette})+plot(raw,{title:'Raw observations',xLabel:'Sample sequence',yLabel:'Value',height:250,palette:s.palette})+(s.report?panel('SPC report',data.charts.map((c,i)=>`<p>${esc(data.rows[i].parameter_name)} · ${esc(c.status)} · ${c.mean.length} samples · Mean ${fmt(stats(c.mean).mean)}</p>`).join('')):'')};
}
export function telemetrySignals(data,s){
 const rules={'Bubbler Weights':/weight/i,'Temperature':/temp|pyro/i,'Flow':/flow/i,'Pressure':/press/i,'Hygrometry':/hygro|moist|dew/i,'Process Controls':/recipe|rotation|source|power|speed|state|mode|remaining/i};
 let signals=data.signals.filter(v=>!s.query||v.tag.toLowerCase().includes(s.query.toLowerCase()));
 if(rules[s.mode])signals=signals.filter(v=>rules[s.mode].test(v.tag));
 else if(s.mode==='Other Signals')signals=signals.filter(v=>!Object.values(rules).some(rule=>rule.test(v.tag)));
 return signals;
}
export function telemetryView(data,s){
 const signals=telemetrySignals(data,s),selected=signals.find(v=>v.tag===s.signal)||signals[0],end=Date.parse(data.end),hours=s.mode==='12 Hour Analysis'?12:Number(s.days||2)*24;
 const pointsFor=signal=>signal.points.filter(([date])=>Date.parse(date)>=end-hours*3600000).map(([date,y])=>({x:(Date.parse(date)-end)/3600000,y,group:signal.tag.split('/')[0],label:date}));
 const shown=s.mode==='Reactor Overview'?signals.filter(v=>/temp|weight|pressure|flow/i.test(v.tag)).slice(0,6):selected?[selected]:[];
 return {rows:selected?pointsFor(selected).map(p=>({UTC:p.label,Tag:selected.tag,Value:p.y,Unit:selected.unit})):[],html:`<div class="demo-telemetry"><nav class="demo-module-nav" aria-label="Telemetry modules">${DEMOS.telemetry.modes.map(mode=>button(mode,'set',`mode|${mode}`,mode===s.mode)).join('')}</nav><div>${panel('',toolbar(`<span class="demo-source">Telemetry_Full_Test.telemetry · synthetic session</span>`,button('Retrieve sample','sample'),button('Export','export'))+toolbar(select('Parameter','signal',signals.map(v=>({value:v.tag,label:v.tag.replace(/^.*?\//,'')})),selected?.tag||''),select('Period','days',[{value:1,label:'24 hours'},{value:2,label:'48 hours'}],s.days),palette(s)))}<p class="demo-caption">${esc(data.start)} — ${esc(data.end)}${s.mode==='12 Hour Analysis'?' · latest 12 hours':''}</p><div class="${s.mode==='Reactor Overview'?'demo-chart-grid':''}">${shown.map(v=>plot(pointsFor(v),{title:v.tag.replace(/^.*?\//,''),kind:'line',xLabel:'Hours relative to latest reading',yLabel:v.unit,height:s.mode==='Reactor Overview'?250:390,palette:s.palette})).join('')||empty('No signals match this selection.')}</div>${selected&&s.mode!=='Reactor Overview'?summary(pointsFor(selected).map(p=>p.y)):''}<p class="demo-caption">Local sample session. Display points are evenly sampled from the source, with first and last readings retained.</p></div></div>`};
}
export function metriaView(data,s){
 const allRows=records(data),rows=selectRows(data,s,'metria'),parameters=numericColumns(data).filter(k=>k!=='Satellite no.'),families=groupRows(rows,r=>String(r['Run Type']).replace(/\s*\(.*\)$/,''));
 const controls=panel('',toolbar(`<span class="demo-source">Metrology.xlsx · ${allRows.length} wafers</span>`,button('Load sample','sample'),palette(s))+tabs(DEMOS['metria-spc'].modes,s.mode)+toolbar(select('Parameter','y',parameters,s.y),select('Reactor','filter',all(allRows.map(r=>r.Equipment)),s.filter),select('Run Type','filter2',all(allRows.map(r=>r['Run Type'])),s.filter2),button('Export','export')));
 const chartMarkup=[...families].map(([family,rs])=>{
  const limit=data.limits?.[family]?.find(l=>l.Parameter===s.y),limits=s.limits&&limit?[{label:'LSL',value:limit.LL},{label:'USL',value:limit.UL}]:[];
  const groups=s.separate?[...groupRows(rs,'Equipment')]:[[family,rs]];
  const failures=limit?rs.filter(r=>r[s.y]<limit.LL||r[s.y]>limit.UL).length:null;
  return panel(`${s.y} · ${family}`,toolbar(`<strong class="demo-status-${failures===null?'warn':failures?'bad':'good'}">${failures===null?'NO LIMITS':failures?'FAIL':'PASS'}</strong>`,`<span>Reactors ${unique(rs.map(r=>r.Equipment)).length} · Samples ${rs.length}${failures!==null?' · Failures '+failures:''}</span>`,button('Rules & Limits','toggle','limits'),button('Details','toggle','expanded'),s.mode==='Compare Reactors'?button(s.separate?'Combine Reactors':'Separate by Reactor','toggle','separate'):'')+groups.map(([name,rs])=>{
   const runs=unique(rs.map(r=>r['Run no.'])),by=s.mode==='Compare Run Types'?'Run Type':'Equipment';
   let points=rs.map(r=>({x:runs.indexOf(r['Run no.'])+(Number(r['Satellite no.'])-3)*.09,y:r[s.y],group:r[by],label:`${r['Run no.']} · S${r['Satellite no.']} · ${r['Run Type']}`,color:limit&&(r[s.y]<limit.LL||r[s.y]>limit.UL)?'#ed9294':undefined}));
   if(s.average)points=[...groupRows(rs,r=>`${r['Run no.']}/${r[by]}`)].map(([,group])=>({x:runs.indexOf(group[0]['Run no.']),y:stats(group.map(r=>r[s.y])).mean,group:group[0][by],label:group[0]['Run no.']}));
   return plot(points,{title:name,xLabel:'Run',yLabel:s.y,limits,mean:s.means,height:330,palette:s.palette,xLabels:runs});
  }).join(''));
 }).join('');
 return {rows,html:(s.controls?controls:'')+toolbar(button(s.controls?'Hide Controls':'Show Controls','toggle','controls'),select('Current Chart','y',parameters,s.y),button('Summary','toggle','expanded'),button(s.average?'Expand to Wafers':'Collapse to Avg','toggle','average'),check('Mean','means',s.means),button('Reset View','reset'))+chartMarkup+(s.expanded?panel('Summary',table([...families].map(([family,rs])=>({Family:family,...stats(rs.map(r=>r[s.y]))})),{sortable:false})): '')};
}
