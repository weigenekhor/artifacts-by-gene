// Local, deterministic illustrations of desktop workflows. Never production
// calculations, live equipment telemetry or user-file processing.
const spec=(views,kind,action,filters=['Equipment','Parameter'])=>({views,kind,action,filters});
export const demoSpecs={
 'altus-lotviewer':spec(['Lot history','Reactor results'],'lots','Load demo lot',['Chamber','Status']),
 'altus-anko-viewer':spec(['Schedule','Due dates'],'schedule','Load demo schedule',['Equipment','Status']),
 'altus-wafercount':spec(['Reactor counts','Load history'],'counts','Count sample wafers',['Equipment','Period']),
 'topotracer':spec(['Surface','Contour','Measured points'],'topography','Generate surface',['Profile','Resolution']),
 'papyrus-reader':spec(['XML comparison','Recipe comparison'],'diff','Compare samples',['Reference','Target']),
 'spc-pathfinder':spec(['Chart index','Parameter trend'],'index','Find sample charts',['Equipment','Parameter']),
 'gan-met-compiler':spec(['Plessey','HV','AIX DEMO','RG ENG'],'compiler','Compile samples',['Source','Run']),
 'gan-temp-diagnoser':spec(['Temperature drift','Alternative case'],'diagnosis','Diagnose example',['Case','Reactor']),
 'aix-dt-assistant':spec(['Weight Mapping','Temperature Mapping'],'assignment','Compute assignment',['Mapping','Reactor']),
 'lt-zone-assistant':spec(['Zone adjustment','Temperature profile'],'zones','Calculate example',['Inner zone','Outer zone']),
 'gan-xml-assistant':spec(['Comparison','Report overview','Block details'],'diff','Compare devices',['Reference','Target']),
 'magus-spc-gan':spec(['Summary','Parameter charts','Report','Directory'],'spc','Retrieve sample data',['Equipment','Period']),
 'magus-spc-legacy':spec(['Summary','Parameter charts','Report','Directory'],'spc','Retrieve sample data',['Equipment','Period']),
 'anko-helper':spec(['Service status','Next service'],'schedule','Calculate next service',['Family','Equipment']),
 'lt-report-compiler':spec(['Compilation','Results'],'compiler','Compile sample report',['Analysis','Run']),
 'metria-spc':spec(['Trends','Equipment comparison','Run type comparison'],'metrology','Plot sample data',['Equipment','Parameter']),
 'aperture-spc':spec(['Trends','Scatter','Distributions','Lot distributions'],'metrology','Plot sample data',['Equipment','Parameter']),
 'data-lens':spec(['Parameter Relationship','Wafer Map','Run Comparison','Distribution','Wafer Profile'],'lens','Smart Plot',['X Parameter','Y Parameter']),
 'telemetry':spec(['Equipment overview','Bubbler history','12-hour overview','12-hour trends'],'telemetry','Refresh sample data',['Equipment','Period'])
};
export function initialDemo(id){if(!demoSpecs[id])throw new Error(`Unknown demo: ${id}`);return {id,view:0,filters:[0,0],revision:0,tab:'data',controls:true,loaded:true,notice:'Sample data loaded. Explore the controls and views.'};}
export function reduceDemo(state,action){
 const next={...state,filters:[...state.filters]},cfg=demoSpecs[state.id];
 if(action.type==='reset')return initialDemo(state.id);
 if(action.type==='view'&&Number.isInteger(action.value)&&action.value>=0&&action.value<cfg.views.length){next.view=action.value;next.notice=`${cfg.views[next.view]} · sample data`;}
 if(action.type==='filter'&&[0,1].includes(action.index)&&Number.isInteger(action.value)&&action.value>=0&&action.value<filterOptions(cfg.filters[action.index]).length){next.filters[action.index]=action.value;next.notice='Sample selection updated.';}
 if(action.type==='run'){next.loaded=true;next.revision++;next.notice=`${cfg.action} complete · sample set ${next.revision+1}.`;}
 if(action.type==='clear'){next.loaded=false;next.notice='Sample cleared. Load the example to continue.';}
 if(action.type==='controls')next.controls=!state.controls;
 if(action.type==='tab'&&['data','statistics'].includes(action.value))next.tab=action.value;
 return next;
}
export function filterOptions(label){
 const map={Equipment:['All equipment','Reactor C','Reactor D'],Reactor:['Reactor C','Reactor D','Reactor E'],Parameter:['Peak wavelength · nm','Thickness · µm','Intensity · a.u.'],Period:['12 hours','7 days','30 days'],Chamber:['All chambers','Reactor A','Reactor B','Reactor C'],Status:['All results','Within limits','Review required'],Profile:['Radial bowl','Saddle','Off-centre peak'],Resolution:['Coarse · 13 × 13','Medium · 21 × 21','Fine · 29 × 29'],Reference:['Reference.xml','Baseline.xml'],Target:['Reactor_C.xml','Reactor_D.xml'],Source:['All sources','PL + LayTec','XRR + XRD'],Run:['C02901','C02902','C02903'],Case:['Case 1','Case 2','Case 3'],Mapping:['Balanced','Ascending','Descending'],Family:['Family A','Family B','Family C'],Analysis:['Temperature','Reflectance','Growth rate'],'Inner zone':['+15 °C','+8 °C','−5 °C'],'Outer zone':['+8 °C','+15 °C','+28 °C'],'X Parameter':['Dominant wavelength','Peak intensity','Thickness'],'Y Parameter':['Peak intensity','Thickness','Dominant wavelength']};
 return map[label]||['All','Selection A','Selection B'];
}
const round=(n,d=2)=>Number(n.toFixed(d));
export function sampleRows(state){
 if(!state.loaded)return [];
 const seed=state.id.split('').reduce((n,c)=>n+c.charCodeAt(0),0)+state.revision*17;
 const shift=state.filters[0]*.35+state.filters[1]*.16;
 return Array.from({length:72},(_,i)=>{
  const group=i%3,noise=Math.sin(i*12.9898+seed)*.75+Math.cos(i*4.1414+seed)*.45;
  return {index:i+1,run:`C0290${group+1}`,equipment:`Reactor ${String.fromCharCode((state.id==='altus-lotviewer'?65:67)+group)}`,wafer:`W${String(i%24+1).padStart(2,'0')}`,x:round(450.5+group*.8+i*.012+noise*.24+shift,3),y:round(230-group*.9+noise*2.8+Math.sin(i*.3)+shift,3),thickness:round(4.8+noise*.1+group*.06+shift*.1,3),temperature:round(1040+noise*2.5+group+shift),pressure:round(220+noise*3+group*2+shift),count:5+(i%11===0?1:0),status:i%11===0?'Review required':'Within limits'};
 }).filter(row=>state.filters[0]&&['Equipment','Chamber'].includes(demoSpecs[state.id].filters[0])?(row.index-1)%3===(state.filters[0]-1)%3:true).filter(row=>demoSpecs[state.id].filters[1]==='Status'&&state.filters[1]?row.status===filterOptions('Status')[state.filters[1]]:true);
}
export function summarize(rows,key='y'){if(!rows.length)return {count:0,mean:0,min:0,max:0,sd:0};const vals=rows.map(r=>r[key]),mean=vals.reduce((a,b)=>a+b,0)/vals.length;return {count:rows.length,mean:round(mean,3),min:round(Math.min(...vals),3),max:round(Math.max(...vals),3),sd:round(Math.sqrt(vals.reduce((s,x)=>s+(x-mean)**2,0)/vals.length),3)};}
export function exportRows(state){
 const rows=sampleRows(state),kind=demoSpecs[state.id].kind;if(!rows.length)return [];
 if(kind==='diff')return [{property:'Setpoint',reference:1100,target:1102+state.revision,result:'Changed'},{property:'Offset',reference:.12,target:.14,result:'Changed'},{property:'Gain',reference:1,target:1.02,result:'Changed'},{property:'Enabled',reference:true,target:true,result:'Unchanged'}];
 if(kind==='schedule')return rows.slice(0,12).map((r,i)=>({equipment:r.equipment,service:`ANKO ${i+1}`,remainingRuns:24-i*2,status:i>9?'Due soon':'Scheduled'}));
 if(kind==='assignment')return rows.slice(0,12).map((r,i)=>({pocket:i+1,wafer:r.wafer,temperature:r.temperature,weight:round(152.3+i*.18),assignedPocket:((i*5+state.filters[0]+state.revision)%12)+1}));
 if(kind==='lots'||kind==='counts')return rows.map(r=>({equipment:r.equipment,wafer:r.wafer,run:r.run,depositions:r.count,result:r.status}));
 if(['telemetry','diagnosis','zones'].includes(kind))return rows.map(r=>({sample:r.index,equipment:r.equipment,temperature:r.temperature,pressure:r.pressure,result:r.status}));
 return rows;
}
export function demoCSV(rows){const columns=rows.length?Object.keys(rows[0]):[];return [columns.join(','),...rows.map(row=>columns.map(key=>`"${String(row[key]).replaceAll('"','""')}"`).join(','))].join('\r\n');}
