"""Refresh explicit website ownership from the current desktop registry, read-only."""
import ast,json,sys
from pathlib import Path

source=Path(sys.argv[1]); archive=Path(sys.argv[2]); path=Path('content/apps.json')
model=json.loads(path.read_text(encoding='utf-8'))
tree=ast.parse((source/'widgets/home_widget.py').read_text(encoding='utf-8'))
names=('TITLES','BASE_DESCRIPTIONS','APP_METADATA','PREVIEW_IMAGES','LEGACY_HOME_GROUPS','DEFAULT_HOME_GROUPS')
registry={}
for node in tree.body:
    if isinstance(node,ast.Assign):
        for target in node.targets:
            if isinstance(target,ast.Name) and target.id in names:registry[target.id]=ast.literal_eval(node.value)
assert len(registry['TITLES'])==19
existing={a['sourceKey']:a for a in model['apps']}
existing['aperture_spc_tab']={'id':'aperture-spc','sourceKey':'aperture_spc_tab','purpose':'Context-aware metrology SPC, analysis and distributions.','featured':False}
existing['sentry_tab']={'id':'telemetry','sourceKey':'sentry_tab','purpose':'Production-tool signals, equipment history and sensor analysis.','featured':False}
captions={
 'parser_tab':['Lot history and reactor results'],
 'altusanko_tab':['ANKO schedule and due dates'],
 'wafercount_tab':['Reactor loading and wafer counts'],
 'topotracer_tab':['Interpolated 3D surface','Interpolated contour and surface','Measured points and contours'],
 'xml_tab':['Exhaustive XML comparison','Recipe sequence comparison'],
 'path_tab':['Equipment and parameter chart index'],
 'metro_tab':['Compiled metrology inputs'],
 'pyra_tab':['Temperature drift diagnosis','Alternative temperature drift case'],
 'dt_tab':['Weight-based assignment','Temperature-based assignment'],
 'laytec_tab':['Inner and outer measurement zones'],
 'xmlll_tab':['Device comparison','Comparison report overview','Block comparison details'],
 'dnd_tab':['GaN release summary','Parameter control chart','Release report summary','Report chart directory','Report control charts'],
 'dnd2_tab':['Legacy release summary','Parameter control chart','Release report summary','Report chart directory','Report control charts'],
 'ankohelper_tab':['ANKO status and next service'],
 'sap_tab':['Compiled LayTec analysis reports'],
 'plessey_spc_tab':['Multi-parameter trends','Equipment comparison','Run-type comparison'],
 'aperture_spc_tab':['Metrology trends','Measurement scatter','Measurement distributions','Lot distributions'],
 'datalens_tab':['Parameter relationships','Wafer maps','Run comparison','Measurement distributions','Wafer profiles'],
 'sentry_tab':['Equipment overview','Bubbler weight history','Twelve-hour analysis overview','Twelve-hour sensor trends'],
}
themes=[('imprimatura','Imprimatura','original'),('tenebrismo','Tenebrismo','void'),('pentimento','Pentimento','pentimento')]
model.update(schemaVersion=6,source='Genepy/widgets/home_widget.py',defaultTheme='tenebrismo',themes=[dict(id=i,name=n) for i,n,_ in themes])
keys=[]
for mode,group_name in [('legacy','LEGACY_HOME_GROUPS'),('pentimento','DEFAULT_HOME_GROUPS')]:
    groups=registry[group_name]
    for expedition,(label,members) in zip([e for e in model['expeditions'] if e['mode']==mode],groups,strict=True):
        expedition['label']=label
        expedition['apps']=[existing[key]['id'] for key,_ in members]
        for key,_ in members:
            if key not in keys:keys.append(key)
for order,key in enumerate(keys,1):
    entry=existing[key];entry.update(name=registry['TITLES'][key],description=registry['BASE_DESCRIPTIONS'][key],metadata=registry['APP_METADATA'][key],order=order)
    entry['navigationIcon']=f'assets/native/navigation/{key}.svg'
    entry.setdefault('icon',entry['navigationIcon'])
    entry.pop('standalone',None)
    stem=Path(registry['PREVIEW_IMAGES'][key]).stem
    images=[]
    for theme,_,folder in themes:
        for index,caption in enumerate(captions[key],1):
            filename=f'{folder}/{stem}{index if index>1 else ""}.webp'
            assert (archive/filename).is_file(),filename
            images.append(dict(sourceFilename=filename,theme=theme,caption=caption,base=f'assets/screens/{entry["id"]}/{theme}-{index}'))
    entry['images']=images
model['apps']=[existing[key] for key in keys]
model['softwareInfo']={'description':'A collection of engineering applications purpose-built for real workflows, real data, and real decisions. Each application is designed to reduce repetition, surface what matters, and make complex engineering work clearer, faster, and more reliable.','details':{'Version':'Pentimento','Applications':'19','Started':'28 August 2022','Updated':'October 2026'},'started':'2022-08-28'}
path.write_text(json.dumps(model,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print('Synchronized',len(keys),'apps and',sum(len(a['images']) for a in model['apps']),'explicit captures.')
