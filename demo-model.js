// Local calculations over exported ARTIFACTS fixtures. No equipment I/O.
export const DEMOS={
 'altus-lotviewer':{file:'lots',kind:'lots'},
 'altus-anko-viewer':{file:'anko-schedule',kind:'schedule'},
 'altus-wafercount':{file:'wafercount',kind:'counts'},
 'spc-pathfinder':{file:'pathfinder',kind:'pathfinder'},
 'anko-helper':{file:'anko-helper',kind:'anko'},
 'magus-spc-gan':{file:'magus-gan',kind:'magus'},
 'magus-spc-legacy':{file:'magus-legacy',kind:'magus'},
 'topotracer':{file:'topo',kind:'topo',modes:['TopoPro Mode','Interpolated Plots (RBF)','Non-interpolated Plots']},
 'papyrus-reader':{file:'documents',kind:'reader',modes:['Raw Mode','Diffs Only Mode','SequenceMatcher Mode','Exhaustive Mode']},
 'gan-xml-assistant':{file:'documents',kind:'xml'},
 'gan-temp-diagnoser':{file:'diagnosis',kind:'diagnosis'},
 'aix-dt-assistant':{kind:'assignment',modes:['Weight Mapping','Temperature Mapping']},
 'lt-zone-assistant':{kind:'zones'},
 'lt-report-compiler':{file:'laytec-report',kind:'report'},
 'gan-met-compiler':{file:'compiler',kind:'compiler',modes:['Plessey','HV','AIXDEMO','RG ENG']},
 'metria-spc':{file:'metria',kind:'metria',modes:['Single Reactor','Compare Reactors','Compare Run Types']},
 'aperture-spc':{file:'aperture',kind:'aperture',modes:['SPC / Trend','Scatter','Distribution','Boxplot']},
 'data-lens':{file:'lens',kind:'lens',modes:['Parameter Relationship','Wafer Map','Run Comparison','Distribution','Wafer Profile']},
 'telemetry':{file:'telemetry',kind:'telemetry',modes:['Reactor Overview','Bubbler Weights','Temperature','Flow','Pressure','Hygrometry','Process Controls','Other Signals','12 Hour Analysis']}
};
export const records=d=>d.data?.map(row=>Object.fromEntries(d.columns.map((key,i)=>[key,row[i]])))||[];
export const unique=values=>[...new Set(values.filter(v=>v!==null&&v!==undefined&&v!==''))];
export const numericColumns=d=>d.columns?.filter((k,i)=>d.data.some(r=>typeof r[i]==='number'))||[];
export function initialDemo(id,data={}){
 const def=DEMOS[id],rows=records(data);
 return {mode:def.kind==='compiler'?'HV':def.modes?.[0]||'',loaded:true,controls:true,tab:'Data',expanded:false,
  query:'',filter:def.kind==='metria'?'Reactor C':'All',filter2:'All',page:0,limits:true,means:false,metric:'mean',chart:0,palette:'Nocturne',
  x:'DominantWavelength',y:def.kind==='metria'?'Peak lambda median':def.kind==='aperture'?'Peak wavelength':'PeakIntensity',
  group:'Run',wafer:'1',run:rows[0]?.Run||'',count:5,baseline:[1096.9,1100.7,1097.7,1102.9,1105.4,1101.3,1099.2,1103.5],
  weights:[542.3,520.1,510.1,529.8,500.2,515.4,532.1,508.3],withbp:[1000.2,1006.5,998.7,1002.8,1009.1,1005.1,1001.3,1007.4],
  inner:15,outerMin:8,outerMax:28,innerAnchor:0,outerAnchor:3,diagnosis:0,recipe:'Process',
  reference:'Devices_ref.xml',target:'Devices_Reactor_C.xml',compare:true,details:false,rotation:35,
  values:data.values?.slice()||[],plotted:data.values?.slice()||[],roles:['LayTec','Plato','XRR','XRD'],compiled:false,
  sheet:Object.keys(data.sheets||{})[0]||'',signal:'',days:def.kind==='magus'?30:2,sort:'',descending:false,notice:''};
}
export const DIAGNOSTIC_FIELDS={Process:['TFB Correction','Ceiling Temp','Ceiling Source'],Clean:['EpiTrueTemp','Ceiling Temp']};
export function diagnosticPairs(data){
 const rs=records(data),pairs=[];let i=0;
 while(i+1<rs.length){const a=rs[i],b=rs[i+1];if(a.Recipe!==b.Recipe&&['Clean','Process'].includes(a.Recipe)&&['Clean','Process'].includes(b.Recipe)){pairs.push({[a.Recipe]:a,[b.Recipe]:b});i+=2;}else i++;}
 return pairs;
}
export function caseObservations(data,index=0){const p=diagnosticPairs(data)[index]||diagnosticPairs(data)[0];return Object.fromEntries(Object.entries(DIAGNOSTIC_FIELDS).flatMap(([recipe,fields])=>fields.map(f=>[`${recipe}/${f}`,p?.[recipe]?.[f]||''])));}
export function diagnose(data,observations){
 const required=Object.entries(DIAGNOSTIC_FIELDS).flatMap(([r,fs])=>fs.map(f=>`${r}/${f}`));
 const rollerOnly=observations['Process/TFB Correction']==='Roller Coaster'&&required.filter(k=>k!=='Process/TFB Correction').every(k=>!observations[k]);
 const missing=rollerOnly?[]:required.filter(k=>!observations[k]);
 const matches=diagnosticPairs(data).filter(pair=>required.every(k=>{const [r,f]=k.split('/');return !observations[k]||String(pair[r][f]||'').trim().toLowerCase()===observations[k].trim().toLowerCase();}));
 return {missing,matches:missing.length?[]:matches};
}
export function stats(values){
 const v=values.filter(v=>typeof v==='number'&&Number.isFinite(v)).sort((a,b)=>a-b),n=v.length;
 if(!n)return {n:0,mean:null,sd:null,min:null,max:null,median:null,q1:null,q3:null};
 const mean=v.reduce((a,b)=>a+b,0)/n;
 const q=p=>{const i=(n-1)*p,j=Math.floor(i);return v[j]+(v[Math.min(j+1,n-1)]-v[j])*(i-j);};
 return {n,mean,sd:n>1?Math.sqrt(v.reduce((a,b)=>a+(b-mean)**2,0)/(n-1)):0,min:v[0],max:v[n-1],median:q(.5),q1:q(.25),q3:q(.75)};
}
export function correlation(points){
 const p=points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),sx=stats(p.map(p=>p.x)),sy=stats(p.map(p=>p.y));
 if(p.length<2||!sx.sd||!sy.sd)return null;
 return p.reduce((n,p)=>n+(p.x-sx.mean)*(p.y-sy.mean),0)/((p.length-1)*sx.sd*sy.sd);
}
export function histogram(values,count=24){
 const s=stats(values);if(!s.n)return [];
 const step=(s.max-s.min||1)/count,bins=Array.from({length:count},(_,i)=>({x:s.min+(i+.5)*step,y:0,width:step}));
 for(const v of values)if(Number.isFinite(v))bins[Math.min(count-1,Math.max(0,Math.floor((v-s.min)/step)))].y++;
 return bins;
}
export function groupRows(rows,key){const map=new Map();for(const r of rows){const k=typeof key==='function'?key(r):r[key];if(!map.has(k))map.set(k,[]);map.get(k).push(r);}return map;}
export function selectRows(data,state,kind){
 let rows=records(data);
 if(kind==='lens')rows=rows.filter(r=>(state.filter==='All'||r.Run===state.filter)&&(state.filter2==='All'||String(r.Wafer)===state.filter2));
 if(kind==='metria')rows=rows.filter(r=>(state.filter==='All'||r.Equipment===state.filter)&&(state.filter2==='All'||r['Run Type']===state.filter2));
 if(kind==='aperture')rows=rows.filter(r=>r.ParameterName===state.y&&(state.filter==='All'||r.ResourceName===state.filter)&&(state.filter2==='All'||r.MaterialName===state.filter2));
 if(kind==='lots')rows=rows.filter(r=>state.filter==='All'||r.Chamber===state.filter);
 if(kind==='pathfinder')rows=rows.filter(r=>(state.filter==='All'||r.Mainframe===state.filter)&&(state.filter2==='All'||r.Type===state.filter2));
 if(state.query)rows=rows.filter(r=>Object.values(r).join(' ').toLowerCase().includes(state.query.toLowerCase()));
 if(state.sort)rows.sort((a,b)=>String(a[state.sort]??'').localeCompare(String(b[state.sort]??''),undefined,{numeric:true})*(state.descending?-1:1));
 return rows;
}
// Mirrors widgets/dt.py: coldest pockets receive heaviest plates / largest offsets.
export function assignment(state){
 const n=Number(state.count),bare=state.baseline.slice(0,n),v=(state.mode==='Weight Mapping'?state.weights:state.withbp).slice(0,n);
 if([...bare,...v].some(x=>x===''||!Number.isFinite(Number(x))))return null;
 const base=bare.map(Number),measured=v.map(Number),order=base.map((t,i)=>i).sort((a,b)=>base[a]-base[b]);
 const offsets=measured.map((v,i)=>state.mode==='Weight Mapping'?v:v-base[i]);
 const plates=offsets.map((v,i)=>i).sort((a,b)=>offsets[b]-offsets[a]);
 let map=Array.from({length:n},(_,i)=>i);order.forEach((slot,i)=>map[slot]=plates[i]);
 const span=a=>Math.max(...a)-Math.min(...a),original=span(measured),candidate=base.map((v,i)=>v+offsets[map[i]]);
 const changed=map.some((v,i)=>v!==i),weight=state.mode==='Weight Mapping';
 const active=changed&&(weight||(original>4&&original-span(candidate)>0));
 if(!active)map=map.map((v,i)=>i);
 return {map,base,measured,order,active,bareDelta:span(base),original,expected:weight?null:active?span(candidate):original,
  temperatures:weight?base:active?candidate:measured,
  title:weight?(active?'Recommended weight-based initial assignment':'Use measured BP order for initial placement'):
   original<=4?'No reassignment needed':!active?'No useful temperature improvement available':original-span(candidate)>.5?'Recommended temperature-based reassignment':'Minor temperature improvement'};
}
export function xmlProperties(xml){
 const props=new Map();for(const block of xml.matchAll(/<NODE\b[^>]*NAME="([^"]+)"[^>]*>([\s\S]*?)<\/NODE>/g))
  for(const p of block[2].matchAll(/<PROPERTY\b[^>]*NAME="([^"]+)"[^>]*>([\s\S]*?)<\/PROPERTY>/g))props.set(`${block[1]} / ${p[1]}`,p[2].trim());
 return props;
}
export function compareXML(left,right){
 const a=xmlProperties(left),b=xmlProperties(right);
 return unique([...a.keys(),...b.keys()]).map(key=>({Block:key.split(' / ')[0],Property:key.split(' / ')[1],Reference:a.get(key)??'—',Target:b.get(key)??'—',Status:!a.has(key)?'Added':!b.has(key)?'Missing':a.get(key)===b.get(key)?'Unchanged':'Changed'}));
}
export function compileLaytec(data,step='All'){
 return records(data).filter(r=>step==='All'||String(r.Step)===String(step)).map(r=>{
  const values=Object.fromEntries([...r.Results.matchAll(/(Average|Standard Deviation|Min|Max)\s*=\s*([\d.-]+)/g)].map(m=>[m[1],Number(m[2])]));
  return {Step:Number(r.Step),Pocket:Number(r.Pocket),Analysis:r.Analysis,Zone:r.Zone,...values};
 });
}
// SciPy Rbf's multiquadric kernel, default epsilon and zero smoothing.
export function rbfSurface(coordinates,values){
 const n=coordinates.length;if(n!==values.length||values.some(v=>!Number.isFinite(v)))throw Error(`Enter ${n} finite measurements.`);
 const xs=coordinates.map(p=>p[0]),ys=coordinates.map(p=>p[1]);
 const epsilon=Math.sqrt((Math.max(...xs)-Math.min(...xs))*(Math.max(...ys)-Math.min(...ys))/n);
 const kernel=(a,b)=>Math.sqrt(1+((a[0]-b[0])**2+(a[1]-b[1])**2)/epsilon**2);
 const a=coordinates.map((p,i)=>[...coordinates.map(q=>kernel(p,q)),values[i]]);
 for(let i=0;i<n;i++){
  let pivot=i;for(let j=i+1;j<n;j++)if(Math.abs(a[j][i])>Math.abs(a[pivot][i]))pivot=j;
  [a[i],a[pivot]]=[a[pivot],a[i]];const d=a[i][i];if(Math.abs(d)<1e-14)throw Error('Coordinate system is singular.');
  for(let k=i;k<=n;k++)a[i][k]/=d;
  for(let j=0;j<n;j++)if(j!==i){const f=a[j][i];for(let k=i;k<=n;k++)a[j][k]-=f*a[i][k];}
 }
 const weights=a.map(r=>r[n]);return (x,y)=>coordinates.reduce((sum,p,i)=>sum+weights[i]*kernel(p,[x,y]),0);
}
export function csv(rows){
 if(!rows.length)return '';
 const columns=Object.keys(rows[0]),cell=v=>{const s=String(v??'');return '"'+(/^[=+@\t\r]/.test(s)?"'":'')+s.replaceAll('"','""')+'"';};
 return [columns,...rows.map(r=>columns.map(k=>r[k]))].map(row=>row.map(cell).join(',')).join('\r\n');
}
