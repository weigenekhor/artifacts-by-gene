// Actual desktop QWidget geometry and styling, exported without sample data.
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kebab=key=>key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
function css(node){
 // Exported native paint already contains its surface and outline. Drawing
 // those declarations again produces a second frame around custom widgets.
 const style=node.chrome||node.vector?Object.fromEntries(Object.entries(node.style).filter(([k])=>!/^border|^background/.test(k))):node.style;
 const properties={left:node.x+'px',top:node.y+'px',width:node.width+'px',height:node.height+'px',...style};
 if(typeof properties.fontSize==='number')properties.fontSize+='px';
 return Object.entries(properties).map(([k,v])=>`${kebab(k)}:${v}`).join(';');
}
function containerStyle(node){
 // Qt child geometry starts at the parent's outer origin. A CSS border would
 // offset all descendants, so draw container surfaces on a separate layer.
 const inherited=Object.fromEntries(Object.entries(node.style).filter(([k])=>/^font|^color$|^letter|^whiteSpace$/.test(k)));
 return css({...node,style:inherited});
}
function vector(source,prefix){
 // Each native control owns its gradient/clip IDs, even across theme changes.
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 for(const id of ids){source=source.replaceAll(`id="${id}"`,`id="${prefix}-${id}"`).replaceAll(`url(#${id})`,`url(#${prefix}-${id})`).replaceAll(`href="#${id}"`,`href="#${prefix}-${id}"`);}
 return source.replace(/<\?xml[^>]*>/g,'').replace(/<!DOCTYPE[^>]*>/g,'');
}
function rich(text){
 // The source is trusted local Qt markup; never import native resource URLs or
 // an image of the application into this DOM representation.
 return text.replace(/<(script|iframe|object|style)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<img\b[^>]*>/gi,'').replace(/\son\w+\s*=\s*(["']).*?\1/gi,'').replace(/(?:href|src)\s*=\s*(["']).*?\1/gi,'');
}
export function nodeMarkup(node,prefix='desktop'){
 // Qt exports a viewport and separate scrollbar widgets. The containing
 // scroll area must own browser scrolling, or both native and browser rails
 // appear and the extra gutter forces horizontal overflow.
 const scrollArea=(node.children||[]).some(child=>child.scroll);
 const railContainers=scrollArea?(node.children||[]).filter(child=>(child.children||[]).some(n=>n.class==='QScrollBar')):[];
 const rails=railContainers.flatMap(child=>child.children.filter(n=>n.class==='QScrollBar'));
 const vertical=rails.find(n=>n.height>n.width),horizontal=rails.find(n=>n.width>n.height);
 const railStyle=scrollArea?`;--native-scroll-width:${vertical?.width||22}px;--native-scroll-height:${horizontal?.height||22}px`:'';
 const id=prefix+'-'+node.id,attrs=`class="desktop-node desktop-${node.kind}${scrollArea?' desktop-scroll':''}${node.scroll?' desktop-scroll-viewport':''}${node.scrollChrome?' desktop-scroll-chrome':''}" data-native-class="${escape(node.class)}" data-native-id="${escape(node.id)}" style="${escape((node.kind==='box'?containerStyle(node):css(node))+railStyle)}"${scrollArea?' tabindex="0" role="region" aria-label="Scrollable application content"':''}`;
 const label=escape(node.text),chrome=node.chrome?`<span class="desktop-chrome" aria-hidden="true">${vector(node.chrome,id+'-chrome')}</span>`:'';
 const icon=node.icon?`<span class="desktop-icon" style="width:${node.icon.width}px;height:${node.icon.height}px" aria-hidden="true">${vector(node.icon.svg,id+'-icon')}</span>`:'';
 const nativeText=node.textRect?` style="position:absolute;left:${node.textRect[0]}px;top:${node.textRect[1]}px;width:${node.textRect[2]}px;height:${node.textRect[3]}px;display:flex;align-items:center"`:'';
 const inactive=' aria-disabled="true" tabindex="-1"';
 switch(node.kind){
  case 'label':return `<div ${attrs}><span class="desktop-label-content">${node.rich?rich(node.text):label}</span></div>`;
  case 'button':return `<button type="button" ${attrs}${inactive} aria-label="${escape(node.text||node.accessible||node.tip)}">${chrome}${icon}<span class="desktop-button-label">${label}</span></button>`;
  case 'select':return `<div ${attrs} role="combobox" aria-expanded="false" aria-disabled="true" aria-label="${escape(node.text)}">${chrome}<span${nativeText}>${label}</span>${chrome?'':'<i class="desktop-chevron" aria-hidden="true"></i>'}</div>`;
  case 'check':return `<label ${attrs}>${chrome}${chrome?'':`<input type="${node.radio?'radio':'checkbox'}" ${node.checked?'checked':''} disabled>`}<span${nativeText}>${label}</span></label>`;
  case 'input':return `<input ${attrs} value="${label}" placeholder="${escape(node.placeholder)}" readonly tabindex="-1" aria-label="${escape(node.placeholder||node.name||'Desktop input')}">`;
  case 'textarea':return node.html&&node.text?`<div ${attrs}>${rich(node.html).replace(/^[\s\S]*?<body[^>]*>/i,'').replace(/<\/body>[\s\S]*$/i,'')}</div>`:`<textarea ${attrs} readonly tabindex="-1" placeholder="${escape(node.placeholder)}" aria-label="${escape(node.name||'Desktop text panel')}">${label}</textarea>`;
  case 'vector':return `<div ${attrs}>${vector(node.vector,id)}</div>`;
  case 'slider':return `<div ${attrs}>${chrome||`<input type="range" min="${node.min}" max="${node.max}" value="${node.value}" disabled aria-label="${escape(node.name||'Desktop slider')}"${node.vertical?' style="writing-mode:vertical-lr"':''}>`}</div>`;
  case 'progress':return `<div ${attrs}>${chrome||`<progress min="${node.min}" max="${node.max}" value="${Math.max(0,node.value)}"></progress>`}${node.textVisible?`<span>${label}</span>`:''}</div>`;
  case 'tabs':return `<div ${attrs} role="tablist">${node.tabs.map(t=>`<button type="button" role="tab" aria-selected="${t.selected}"${inactive} style="left:${t.x}px;top:${t.y}px;width:${t.width}px;height:${t.height}px">${escape(t.text)}</button>`).join('')}</div>`;
  case 'table':return `<div ${attrs}><table>${node.headerVisible?`<thead><tr style="height:${node.headerHeight}px">${node.headers.map((h,i)=>`<th style="width:${node.columnWidths[i]}px">${escape(h)}</th>`).join('')}</tr></thead>`:''}<tbody>${node.rows.map(row=>`<tr>${row.map(c=>`<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  case 'list':return `<div ${attrs}>${node.items.map(i=>`<div class="desktop-list-item"${i.selected?' aria-current="true"':''} style="min-height:${i.height}px">${escape(i.text)}</div>`).join('')}</div>`;
  default:return `<div ${attrs}>${node.chrome?'':`<span class="desktop-container-surface" aria-hidden="true" style="${escape(css({...node,x:0,y:0}))}"></span>`}${chrome}${node.title?`<span class="desktop-group-title">${escape(node.title)}</span>`:''}${(node.children||[]).map(child=>nodeMarkup(railContainers.includes(child)?{...child,scrollChrome:true}:child,prefix)).join('')}</div>`;
 }
}
export function layoutVariant(data,theme,width){
 const sizes=data.states.initial;
 const name=Object.keys(sizes).reduce((best,key)=>Math.abs(sizes[key][theme].availableWidth-width)<Math.abs(sizes[best][theme].availableWidth-width)?key:best,'closed');
 return sizes[name][theme];
}
export function desktopWorkspace(shell,model){
 const container=document.createElement('section');container.className='desktop-workspace';container.hidden=true;
 const parent=shell.querySelector('.app-content');parent.append(container);
 const cache=new Map();let active=null,request=0,lastVariant=null;
 function draw(){
  if(!active||!cache.has(active))return;
  const theme=shell.dataset.theme||'tenebrismo',variant=layoutVariant(cache.get(active),theme,parent.clientWidth);
  if(lastVariant===variant)return;
  lastVariant=variant;container.innerHTML=nodeMarkup(variant.tree,active+'-'+theme);
  container.setAttribute('aria-label',model.apps.find(a=>a.id===active).name+' — desktop layout');
 }
 function close(){request++;active=null;lastVariant=null;container.hidden=true;shell.querySelector('.app-home').classList.remove('workspace-open');shell.querySelectorAll('[data-locate-app]').forEach(b=>b.removeAttribute('aria-current'));shell.querySelector('[data-home]').setAttribute('aria-current','page');}
 async function open(id){
  if(!model.apps.some(a=>a.id===id))return;
  active=id;lastVariant=null;const token=++request;
  container.hidden=false;container.innerHTML='';shell.querySelector('.app-home').classList.add('workspace-open');shell.querySelector('[data-home]').removeAttribute('aria-current');
  shell.querySelectorAll('[data-locate-app]').forEach(b=>{if(b.dataset.locateApp===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(!cache.has(id)){
   try{const response=await fetch(`content/desktop-layouts/${id}.json?v=20261024-preview`);if(!response.ok)throw Error('Layout unavailable');cache.set(id,await response.json());}
   catch{if(active===id&&request===token){const status=document.createElement('p');status.className='desktop-load-error';status.textContent='The desktop layout could not load. Select the application again to retry.';container.append(status);}return;}
  }
  if(active===id&&request===token)draw();
 }
 // This is the desktop's unpopulated interface, not a browser processing demo.
 container.addEventListener('click',e=>{if(e.target.closest('button,input,label,select'))e.preventDefault();});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>draw()).observe(parent);
 return {open,close,refresh:draw,get active(){return active;}};
}
