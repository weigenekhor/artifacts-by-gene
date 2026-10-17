import fs from 'node:fs/promises';
const model=JSON.parse(await fs.readFile('content/apps.json','utf8'));
const sceneMaps={
 dt_tab:{'Weight Mapping':'1','Temperature Mapping':'2'},
 datalens_tab:{'Parameter Relationship':'1','Wafer Map':'2','Run Comparison':'3','Distribution':'4','Wafer Profile':'5'},
 plessey_spc_tab:{'Single Reactor':'1-show-controls','Compare Reactors':'2-show-controls','Compare Run Types':'3-show-controls'},
 aperture_spc_tab:{'SPC / trend':'1-show-controls','Scatter':'2-show-controls','Distribution':'3-show-controls','Box plot':'4-show-controls'},
 xml_tab:{'Exhaustive Mode':'1','Sequence Matcher Mode':'2','Raw Mode':'raw','Diffs Only Mode':'diffs'},
 topotracer_tab:{'TopoPro Mode':'1','Interpolated Plots (RBF)':'2','Non-interpolated Plots':'3'},
 sentry_tab:{'Reactor Overview':'1','Bubbler Weights':'2','Temperature':'1-module-2','Flow':'1-module-3','Pressure':'1-module-4','Hygrometry':'1-module-5','Process Controls':'1-module-6','Other Signals':'1-module-7','12-Hour Analysis':'3'},
 metro_tab:{'HV':'1','AIXDEMO':'mode-AIXDEMO','RG ENG':'mode-RG-ENG','Plessey':'mode-Plessey'},
 xmlll_tab:{'Compare':'1','Open Report':'2','Export Report':'2','Reset':'ready'},
 dnd_tab:{'Fetch SPC Data and Plot in Artifacts':'1','Fetch SPC Data and Plot in Artifacts Web Report':'3'},
 dnd2_tab:{'Fetch SPC Data and Plot in Artifacts':'1','Fetch SPC Data and Plot in Artifacts Web Report':'3'},
};
const fixture={
 parser_tab:'Built-in lot-history example',altusanko_tab:'Built-in ANKO schedule',wafercount_tab:'Built-in reactor counters',dt_tab:'Load Example: native baseplate assignment',pyra_tab:'Bundled Pyra Master diagnosis cases',laytec_tab:'Inner and outer measurement-zone controls',path_tab:'Bundled Path Master chart index',ankohelper_tab:'Built-in ANKO family example',datalens_tab:'Data Lens test sessions · 2,637 measured sites',metro_tab:'Met Compiler PL, LayTec, XRR and XRD test inputs',sap_tab:'Synthetic LayTec analysis processed by ARTIFACTS',plessey_spc_tab:'Metria test workbook · 900 wafers / 36,000 readings',aperture_spc_tab:'Aperture test snapshot · 3,120 measurements',sentry_tab:'Telemetry_Full_Test.telemetry',xml_tab:'Synthetic Devices XML files',xmlll_tab:'Synthetic Devices XML pair',dnd_tab:'Built-in GaN SPC fixture',dnd2_tab:'Built-in Legacy SPC fixture',topotracer_tab:'Native TopoTracer sample surface',
};
const titles={dt_tab:['Weight assignment','Temperature assignment'],datalens_tab:['Parameter Relationship','Wafer Map','Run Comparison','Distribution','Wafer Profile'],plessey_spc_tab:['Single Reactor','Compare Reactors','Compare Run Types'],aperture_spc_tab:['SPC / trend','Scatter','Distribution','Box plot'],sentry_tab:['Reactor Overview','Bubbler Weights','12-Hour Analysis','12-hour analysis charts'],topotracer_tab:['TopoPro Mode','Interpolated Plots (RBF)','Non-interpolated Plots']};
const downloads={metro_tab:'assets/samples/Met_Compilation.xlsx',sap_tab:'assets/samples/C02901_LayTec_Compilation.xlsx'};
const manifest={schema:1,source:'ARTIFACTS native widget exports',description:'Recorded native sample views. Highlighted controls replay actual desktop results; desktop processing and equipment connections do not run in the browser.',apps:{}};
for(const app of model.apps){
 const raw=JSON.parse(await fs.readFile(`content/workspaces/${app.sourceKey}.json`,'utf8'));
 const available=new Set(raw.map(s=>s.scene));
 const nativeMap=sceneMaps[app.sourceKey]||{};
 const primaryIds=[...available].filter(id=>/^\d+$/.test(id)).sort((a,b)=>Number(a)-Number(b));
 const initial=primaryIds[0]||'ready';
 for(const scene of raw){
  scene.primary=primaryIds.includes(scene.scene);
  const title=titles[app.sourceKey]?.[Number(scene.scene)-1];
  if(title)scene.description=title;
  const parent=scene.transition?.parent||scene.scene;
  const base=raw.find(s=>s.theme===scene.theme&&s.scene===(parent==='ready'?initial:parent));
  const extras=raw.filter(s=>s.theme===scene.theme&&s.transition?.parent===(parent==='ready'?initial:parent));
  for(const control of scene.controls){
   delete control.action;
   if(!control.enabled)continue;
   const text=control.text.trim();let action=null;
   const extra=extras.find(s=>s.transition.kind==='button'&&s.transition.text===text);
   if(extra)action={target:extra.scene};
   else if(nativeMap[text]&&available.has(nativeMap[text]))action={target:nativeMap[text]};
   else if(text==='Show Controls'&&scene.transition?.text==='Hide Controls'||text==='Hide Controls'&&scene.transition?.text==='Show Controls')action={target:parent};
   else if(text==='Data'&&scene.transition?.kind==='button')action={target:parent};
   else if(/Load Example|Check Wafer Counts|Check ANKO Schedule|Lot History:|Generate SPC Summary|^Plot$|^Retrieve$/.test(text))action={target:parent==='ready'?initial:parent};
   else if(/^Browse|^Load Reference|^Load Target|^Select Analysis File$/.test(text))action={target:initial};
   else if(/Save Image/.test(text))action={download:scene.image};
   else if(text==='Save Processed File'&&downloads[app.sourceKey]&&scene.scene==='1')action={download:downloads[app.sourceKey]};
   else if(app.sourceKey==='metro_tab'&&text==='Find Files'&&available.has('mode-Plessey'))action={target:'mode-Plessey'};
   else if(app.sourceKey==='topotracer_tab'&&text==='Plot or Reset Plot')action={target:parent==='ready'?initial:parent};
   else if(app.sourceKey==='sentry_tab'&&control.kind==='list'&&control.name==='twelveParameterCatalog'&&control.index===0)action={target:'4'};
   if(control.kind==='sample-control'){
    const options=extras.filter(s=>s.transition.kind==='native-control'&&s.transition.name===control.name).map(s=>({label:s.transition.label,target:s.scene}));
    if(options.length){options.unshift({label:control.name==='slot_count_slider'?'5 slots':'Original sample',target:base.scene});action={options};}
   }
   if(control.kind==='select'){
    const options=[];
    const original=base?.controls.find(c=>c.kind==='select'&&c.x===control.x&&c.y===control.y);
    for(let i=0;i<(control.options||[]).length;i++){
     const label=control.options[i];let target=nativeMap[label];
     const extra=extras.find(s=>s.transition.kind==='select'&&s.transition.option===i&&(s.transition.text===original?.text||s.transition.text===control.text));
     if(extra)target=extra.scene;
     if(original?.text===label)target=base.scene;
     if(app.sourceKey==='pyra_tab'){
      const match=raw.find(s=>s.theme===scene.theme&&s.scene!=='ready'&&s.controls.some(c=>c.kind==='select'&&c.text===label));
      if(match)target=match.scene;
     }
     if(['dnd_tab','dnd2_tab'].includes(app.sourceKey)){
      const match=raw.find(s=>s.theme===scene.theme&&s.scene!=='ready'&&s.controls.some(c=>c.kind==='select'&&c.text===label));
      if(match)target=match.scene;
     }
     if(target&&available.has(target))options.push({label,target});
    }
    // Do not turn an unrecorded selector into a pretend working control.
    if(options.length>1)action={options};
   }
   if(action)control.action=action;
  }
  // Only export usable, source-measured targets; paths and desktop internals stay local.
  scene.controls=scene.controls.map(c=>({...c}));
 }
 const scenes=raw.map(s=>({scene:s.scene,theme:s.theme,description:s.description,width:s.width,height:s.height,image:s.image,report:s.report,primary:s.primary,transition:s.transition?{parent:s.transition.parent}:null,controls:s.controls.filter(c=>c.action).map(({x,y,width,height,text,action})=>({x,y,width,height,text,action}))}));
 manifest.apps[app.id]={sourceKey:app.sourceKey,fixture:fixture[app.sourceKey],initial,scenes};
}
await fs.writeFile('content/native-demos.json',JSON.stringify(manifest)+'\n');
console.log(`Built ${Object.keys(manifest.apps).length} native walkthroughs with ${Object.values(manifest.apps).reduce((n,a)=>n+a.scenes.length,0)} themed states.`);
