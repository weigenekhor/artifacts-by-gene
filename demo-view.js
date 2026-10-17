import {stats,histogram,groupRows} from './demo-model.js';
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmt=(v,d=3)=>typeof v==='number'&&Number.isFinite(v)?Number(v.toFixed(d)).toLocaleString('en-GB',{maximumFractionDigits:d}):'—';
export const button=(text,action,value='',selected=false,disabled=false)=>`<button type="button" data-action="${action}" data-value="${esc(value)}"${selected?' aria-pressed="true"':''}${disabled?' disabled':''}>${esc(text)}</button>`;
export const tabs=(values,selected,key='mode')=>`<div class="demo-tabs" role="group" aria-label="${key==='mode'?'Analysis mode':esc(key)}">${values.map(v=>button(v,'set',`${key}|${v}`,v===selected)).join('')}</div>`;
export const select=(label,key,values,value)=>`<label class="demo-field"><span>${esc(label)}</span><select data-field="${key}" aria-label="${esc(label)}">${values.map(o=>{const v=typeof o==='object'?o.value:o,text=typeof o==='object'?o.label:o;return `<option value="${esc(v)}"${String(v)===String(value)?' selected':''}>${esc(text)}</option>`;}).join('')}</select></label>`;
export const input=(label,key,value,type='text',extra='')=>`<label class="demo-field"><span>${esc(label)}</span><input type="${type}" data-field="${key}" value="${esc(value)}" aria-label="${esc(label)}" ${extra}></label>`;
export const check=(label,key,value)=>`<label class="demo-check"><input type="checkbox" data-field="${key}"${value?' checked':''}>${esc(label)}</label>`;
export const toolbar=(...parts)=>`<div class="demo-toolbar">${parts.join('')}</div>`;
export const panel=(title,body,cls='')=>`<section class="demo-panel ${cls}">${title?`<h3>${esc(title)}</h3>`:''}${body}</section>`;
export const empty=message=>`<div class="demo-empty">${esc(message)}</div>`;
export function table(rows,{columns=Object.keys(rows[0]||{}),page=0,limit=40,sortable=false}={}){
 if(!rows.length)return empty('No rows match the current selections.');
 const pages=Math.ceil(rows.length/limit),index=Math.min(Math.max(0,page),pages-1);
 return `<div class="demo-table-wrap"><table><thead><tr>${columns.map(k=>`<th scope="col">${sortable?button(k,'sort',k):esc(k)}</th>`).join('')}</tr></thead><tbody>${rows.slice(index*limit,(index+1)*limit).map(r=>`<tr>${columns.map(k=>`<td${k==='Status'||k==='status'?` class="demo-status-${/fail|overdue|Missing/i.test(r[k])?'bad':/pass|scheduled|Unchanged/i.test(r[k])?'good':'warn'}"`:''}>${esc(typeof r[k]==='number'?fmt(r[k],5):r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${pages>1?toolbar(`<span>${index*limit+1}–${Math.min((index+1)*limit,rows.length)} of ${rows.length.toLocaleString()} rows</span>`,button('Previous','page',index-1,false,index===0),button('Next','page',index+1,false,index===pages-1)):''}`;
}
export function summary(values){const s=stats(values);return `<dl class="demo-stats">${[['Readings',s.n],['Mean',s.mean],['Std deviation',s.sd],['Minimum',s.min],['Median',s.median],['Maximum',s.max]].map(([k,v])=>`<div><dt>${k}</dt><dd>${fmt(v)}</dd></div>`).join('')}</dl>`;}
export const COLORS=['#43a5ff','#ff7762','#39cf9e','#dca95b','#b49af1','#e689c2','#a1c953','#75c8d7'];
export const color=(i,palette='Nocturne')=>palette==='Monochrome'?['#dce5e9','#8fa4ae','#566f7a'][i%3]:COLORS[i%COLORS.length];
export const heat=(v,min,max)=>{const t=Math.max(0,Math.min(1,(v-min)/(max-min||1)));return `hsl(${240-t*240} 70% 52%)`;};
export function plot(points,{title='',xLabel='',yLabel='',kind='scatter',limits=[],mean=false,height=330,palette='Nocturne',xLabels=null}={}){
 const p=points.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));if(!p.length)return empty('No numeric readings in this selection.');
 const w=960,h=height,l=70,r=150,t=32,b=54,pw=w-l-r,ph=h-t-b;
 let xs=stats(p.map(p=>p.x)),ys=stats([...p.map(p=>p.y),...limits.map(l=>l.value).filter(Number.isFinite)]);
 const xpad=(xs.max-xs.min||1)*.025,ypad=(ys.max-ys.min||1)*.09;
 const xmin=xs.min-xpad,xmax=xs.max+xpad,ymin=kind==='bars'?0:ys.min-ypad,ymax=ys.max+ypad;
 const X=v=>l+(v-xmin)/(xmax-xmin)*pw,Y=v=>t+ph-(v-ymin)/(ymax-ymin||1)*ph;
 const groups=[...groupRows(p,p=>p.group||'Measurements')],clip=`plot-${Math.abs(hash(title+xLabel+yLabel+kind))}`;
 const axes=Array.from({length:6},(_,i)=>{const xv=xmin+(xmax-xmin)*i/5,yv=ymin+(ymax-ymin)*i/5;return `<path d="M${l},${Y(yv)}H${l+pw}" class="demo-grid"/><text x="${l-9}" y="${Y(yv)+4}" text-anchor="end">${fmt(yv)}</text><text x="${X(xv)}" y="${h-b+22}" text-anchor="middle">${esc(xLabels?xLabels[Math.max(0,Math.min(xLabels.length-1,Math.round(xv)))]||'':fmt(xv))}</text>`;}).join('');
 const shapes=groups.map(([name,ps],i)=>{
  const c=color(i,palette);return `${kind==='line'?`<polyline points="${ps.map(v=>`${X(v.x)},${Y(v.y)}`).join(' ')}" fill="none" stroke="${c}" stroke-width="1.3"/>`:''}${ps.map(v=>{const label=`${name} · ${v.label||''}\n${xLabel}: ${fmt(v.x,5)}\n${yLabel}: ${fmt(v.y,5)}`;
   return kind==='bars'?`<rect x="${X(v.x)-(v.width||1)/(xmax-xmin)*pw*.46}" y="${Y(v.y)}" width="${(v.width||1)/(xmax-xmin)*pw*.92}" height="${Y(0)-Y(v.y)}" fill="${c}" opacity=".7"><title>${esc(label)}</title></rect>`:
   `<circle cx="${X(v.x)}" cy="${Y(v.y)}" r="${p.length>1500?2.2:3}" fill="${v.color||c}" data-tooltip="${esc(label)}"><title>${esc(label)}</title></circle>`;}).join('')}`;
 }).join('');
 return `<figure class="demo-plot"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title||yLabel)}"><defs><clipPath id="${clip}"><rect x="${l}" y="${t}" width="${pw}" height="${ph}"/></clipPath></defs><text x="${l}" y="18" class="demo-plot-title">${esc(title)}</text>${axes}<path d="M${l},${t}V${h-b}H${l+pw}" class="demo-axis"/><g clip-path="url(#${clip})">${shapes}${[...limits,...(mean?[{label:'Mean',value:stats(p.map(p=>p.y)).mean,color:'#d9cfaa'}]:[])].filter(v=>Number.isFinite(v.value)).map(v=>`<path d="M${l},${Y(v.value)}H${l+pw}" stroke="${v.color||'#e89181'}" stroke-width="1" stroke-dasharray="6 4"/><text x="${l+4}" y="${Y(v.value)-4}">${esc(v.label)} ${fmt(v.value)}</text>`).join('')}</g><text x="${l+pw/2}" y="${h-6}" text-anchor="middle">${esc(xLabel)}</text><text transform="translate(18 ${t+ph/2}) rotate(-90)" text-anchor="middle">${esc(yLabel)}</text>${groups.slice(0,14).map(([name],i)=>`<circle cx="${w-r+17}" cy="${t+15+i*20}" r="3" fill="${color(i,palette)}"/><text x="${w-r+27}" y="${t+19+i*20}">${esc(String(name).slice(0,23))}</text>`).join('')}</svg></figure>`;
}
function hash(v){let h=0;for(const c of v)h=(h*31+c.charCodeAt(0))|0;return h;}
export function distribution(groups,label,palette){return plot([...groups].flatMap(([group,values])=>histogram(values).map(p=>({...p,group}))),{kind:'bars',xLabel:label,yLabel:'Count',palette,title:'Distribution'});}
export function boxes(groups,label){
 const entries=[...groups].map(([name,v])=>[name,stats(v)]).filter(([,s])=>s.n);if(!entries.length)return empty('No numeric readings.');
 const all=stats(entries.flatMap(([,s])=>[s.min,s.max])),pad=(all.max-all.min||1)*.1,min=all.min-pad,max=all.max+pad,Y=v=>300-(v-min)/(max-min)*260;
 return `<figure class="demo-plot"><svg viewBox="0 0 960 360" role="img" aria-label="${esc(label)} boxplot">${Array.from({length:6},(_,i)=>{const v=min+(max-min)*i/5;return `<path d="M70,${Y(v)}H920" class="demo-grid"/><text x="60" y="${Y(v)+4}" text-anchor="end">${fmt(v)}</text>`;}).join('')}${entries.map(([name,s],i)=>{const x=90+(i+.5)*800/entries.length,bw=Math.min(75,500/entries.length);return `<g data-tooltip="${esc(name)} · N ${s.n} · Median ${fmt(s.median)} · Q1 ${fmt(s.q1)} · Q3 ${fmt(s.q3)}"><path d="M${x},${Y(s.min)}V${Y(s.max)}" stroke="${color(i)}"/><rect x="${x-bw/2}" y="${Y(s.q3)}" width="${bw}" height="${Math.max(1,Y(s.q1)-Y(s.q3))}" stroke="${color(i)}" fill="${color(i)}" fill-opacity=".22"/><path d="M${x-bw/2},${Y(s.median)}h${bw}" stroke="${color(i)}" stroke-width="2"/><text x="${x}" y="325" text-anchor="middle">${esc(String(name).slice(0,17))}</text></g>`;}).join('')}<text x="480" y="350" text-anchor="middle">${esc(label)}</text></svg></figure>`;
}
export function waferMap(points,label){
 const s=stats(points.map(p=>p.value));if(!s.n)return empty('No wafer measurements.');
 return `<figure class="demo-wafer"><svg viewBox="0 0 480 450" role="img" aria-label="${esc(label)} wafer map"><circle cx="225" cy="215" r="190" fill="var(--surface)" stroke="var(--border-hover)"/>${points.map(p=>`<circle cx="${225+p.x*1.82}" cy="${215-p.y*1.82}" r="${points.length>100?7:12}" fill="${heat(p.value,s.min,s.max)}" data-tooltip="X ${p.x} · Y ${p.y} · ${esc(label)} ${fmt(p.value,5)}"><title>${fmt(p.value,5)}</title></circle>`).join('')}<path d="M217 404l8-8 8 8" fill="var(--surface)" stroke="var(--border-hover)"/><text x="225" y="438" text-anchor="middle">${esc(label)} · ${fmt(s.min,4)} — ${fmt(s.max,4)}</text></svg></figure>`;
}
