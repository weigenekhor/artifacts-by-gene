"""Read approved sample files and execute only isolated desktop demo generators.

No Qt windows, equipment clients, database calls or desktop preferences are used.
The committed JSON is sufficient for normal website builds.
"""
import ast, hashlib, json, random, re, sys, zipfile, types
from html.parser import HTMLParser
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
import numpy as np
import pandas as pd
from matplotlib.figure import Figure

SITE = Path(__file__).resolve().parents[1]
DESKTOP = Path('C:/Users/Gene/Desktop/Artifacts/Artifacts/Genepy')
TEST = Path('C:/Users/Gene/Desktop/ARTIFACTS Test Files')
OUT = SITE / 'content/demo-data'
OUT.mkdir(exist_ok=True)
SYN = SITE / '.qa/native-demo-export/synthetic-inputs'
random.seed(20261017)
np.random.seed(20261017)

def write(name, data, sources):
    data['provenance'] = [{'file': p.name, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in sources]
    text = json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False, default=str)
    (OUT / (name + '.json')).write_text(text, encoding='utf-8')
    print(name, len(text), flush=True)

def table(df):
    return json.loads(df.to_json(orient='split', index=False, date_format='iso'))

def isolated(file, function, namespace=None):
    """Extract a known pure/demo function without importing its desktop module."""
    tree = ast.parse((DESKTOP / 'widgets' / file).read_text(encoding='utf-8'))
    node = next(n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and n.name == function)
    node.decorator_list = []
    scope = dict(np=np, pd=pd, random=random, datetime=datetime, timedelta=timedelta, Figure=Figure)
    scope.update(namespace or {})
    exec(compile(ast.Module(body=[node], type_ignores=[]), file, 'exec'), scope)
    return scope[function]

def literal(file, name):
    tree = ast.parse((DESKTOP / 'widgets' / file).read_text(encoding='utf-8'))
    node = next(n for n in ast.walk(tree) if isinstance(n, ast.Assign) and any(isinstance(t, ast.Name) and t.id == name for t in n.targets))
    return ast.literal_eval(node.value)

for name, path in [('lens', TEST/'04 Data Lens/Wafer measurements.csv'), ('aperture', TEST/'03 Aperture SPC/Metrology.csv'), ('metria', TEST/'02 Metria SPC/Metrology.xlsx')]:
    df = pd.read_csv(path) if path.suffix == '.csv' else pd.read_excel(path)
    payload=table(df)
    sources=[path]
    if name=='metria':
        limits=TEST/'01 Met Compiler/Plessey/Limits.xlsx'
        payload['limits']={sh:json.loads(pd.read_excel(limits,sheet_name=sh).to_json(orient='records')) for sh in pd.ExcelFile(limits).sheet_names}
        sources.append(limits)
    write(name, payload, sources)

for name, filename in [('diagnosis', 'Pyra Master.xlsx'), ('pathfinder', 'Path Master.xlsx')]:
    p = DESKTOP/'widgets/Resources'/filename
    df = pd.read_excel(p, header=1).dropna(how='all').dropna(axis=1, how='all')
    if name == 'pathfinder':
        # Chart index supplies names only. Browser demos never open equipment links.
        df = df.drop(columns=['Link'], errors='ignore')
    write(name, table(df), [p])

documents = {p.name: p.read_text(encoding='utf-8') for p in sorted(SYN.glob('Devices*.xml'))}
write('documents', {'documents': documents}, sorted(SYN.glob('Devices*.xml')))

p = SYN/'C02901_LayTec_Analysis.htm'
class TableParser(HTMLParser):
    def __init__(self):
        super().__init__();self.rows=[];self.row=[];self.cell=None
    def handle_starttag(self,tag,attrs):
        if tag=='tr':self.row=[]
        if tag in ('td','th'):self.cell=''
    def handle_data(self,data):
        if self.cell is not None:self.cell+=data
    def handle_endtag(self,tag):
        if tag in ('td','th'):self.row.append(self.cell.strip());self.cell=None
        if tag=='tr':self.rows.append(self.row)
parser=TableParser();parser.feed(p.read_text())
df=pd.DataFrame(parser.rows[1:],columns=parser.rows[0])
write('laytec-report', table(df), [p])

# Preserve numeric output cells from the real compiler rather than inventing results.
p = SYN/'Met_Compilation.xlsx'
sheets = {}
for name in pd.ExcelFile(p).sheet_names:
    df = pd.read_excel(p, sheet_name=name, header=None).dropna(how='all').dropna(axis=1, how='all')
    if not df.empty:
        sheets[name] = table(df)
sys.dont_write_bytecode=True
package=types.ModuleType('widgets');package.__path__=[str(DESKTOP/'widgets')];sys.modules['widgets']=package
from widgets.plessey.parsers import parse_plato,parse_bow,parse_growth
plessey=TEST/'01 Met Compiler/Plessey'
parsed=[]
for role,files,parser in [('Plato',sorted(plessey.glob('*_PL.xlsx')),parse_plato),('Bow',sorted(plessey.glob('*.pdf')),parse_bow)]:
    for file in files:
        for record in parser(file):
            parsed.append({'Run':record.run,'Satellite':record.satellite,'values':record.values,'source':file.name,'role':role})
growth=parse_growth(plessey/'Growth Plan.xlsx')
write('compiler', {'sheets': sheets, 'files': [q.name for q in (TEST/'01 Met Compiler/Legacy').glob('*') if q.is_file()],
    'plessey':{'records':parsed,'growth':{f'{key[0]}{key[1]:05d}':v[0] for key,v in growth.items()}}}, [p,*sorted(plessey.glob('*'))])

info, result = isolated('altus_lot_viewer.py', 'build_demo_lotviewer_result')()
rows = []
for line in result.splitlines()[1:-1]:
    chamber, wafer, status, duration = re.match(r'(Reactor .): Wafer (\w+) (.*) \((\d+) minutes\)', line).groups()
    rows.append([chamber, wafer, status, int(duration)])
write('lots', {'info': info, 'columns': ['Chamber','Wafer','Deposition Status','Duration (min)'], 'data': rows}, [DESKTOP/'widgets/altus_lot_viewer.py'])

entries = literal('altus_anko.py', 'expected_entries')
scratch = literal('altus_anko.py', 'scratch_test_dates')
now = datetime(2026,10,17,12)
rows = [[module, kind, (now+timedelta(days=i%6+1)).strftime('%Y-%m-%d'), 'Demo schedule active'] for i,(module,kind) in enumerate(entries)]
rows += [[module,'DEMO CHECK',day,'Demo status only'] for module,day in scratch.items()]
write('anko-schedule', {'columns':['Module','Next ANKO','Next ANKO Date','Remarks'],'data':rows}, [DESKTOP/'widgets/altus_anko.py'])

tools = literal('altus_wafercount.py', 'TOOLS')
values = []
class Gauge:
    def setValue(self, v): values.append(v)
stub = SimpleNamespace(process_button=SimpleNamespace(setEnabled=lambda v:None), progress_bars=[Gauge() for _ in range(12)])
isolated('altus_wafercount.py', 'process_directories', {'TOOLS':tools})(stub)
write('wafercount', {'columns':['Reactor','Chamber','Count','Limit'],'data':[[tool,chamber,values[i*2+j],20000 if i<3 else 25000] for i,tool in enumerate(tools) for j,chamber in enumerate(['A','B'])]}, [DESKTOP/'widgets/altus_wafercount.py'])

payload = isolated('ankohelper_widget.py','_demo_summary_payload')(SimpleNamespace(selected_family='Family A'))
write('anko-helper', {'rows':payload['table_rows']}, [DESKTOP/'widgets/ankohelper_widget.py'])

for file,name in [('dnd_widget.py','magus-gan'),('dnd2_widget.py','magus-legacy')]:
    results = []
    signal = SimpleNamespace(emit=lambda *a:None)
    stub = SimpleNamespace(num_days=30,_stop=False,selected_equipment='Equipment A',mode='browser',progress=signal,finished=SimpleNamespace(emit=results.append))
    color_map = isolated(file,'stable_group_color_map')
    isolated(file,'_run_demo',{'stable_group_color_map':color_map})(stub)
    write(name, {'charts':results[0]['browser_bundles'],'rows':results[0]['table_rows']}, [DESKTOP/'widgets'/file])

coords = literal('topotracer_widget.py','_DEMO_COORDINATE_POINTS')
xs,ys = np.array(coords).T
stub = SimpleNamespace(x=xs,y=ys,wafer_radius=100)
values = isolated('topotracer_widget.py','_demo_resistivity_values')(stub,len(coords))
from scipy.interpolate import Rbf
values=[round(v,4) for v in values]
native_rbf=Rbf(xs,ys,values,function='multiquadric',smooth=0)
probes=[(0,0),(12,-24),(-53,37),(74,0),(0,-80)]
write('topo', {'coordinates':coords,'values':values,'rbfChecks':[[x,y,float(native_rbf(x,y))] for x,y in probes]}, [DESKTOP/'widgets/topotracer_widget.py'])

# All signal values are retained in the selected 48-hour session range. Reduce
# display samples evenly per signal (including endpoints); do not average extrema.
p = DESKTOP/'Telemetry_Full_Test.telemetry'
with zipfile.ZipFile(p) as z:
    session = json.loads(z.read('session.json'))
    df = pd.read_csv(z.open('readings.csv'),dtype=str,keep_default_na=False)
    df = df[(df.UTCOperationEndTime>=df.RangeStartUTC) & (df.UTCOperationEndTime<=df.RangeEndUTC)]
signals=[]
units={r['tag']:r.get('unit') for r in session['catalogue']}
for tag,group in df.groupby('Tag',sort=False):
    if len(group)>360:
        group=group.iloc[np.unique(np.linspace(0,len(group)-1,360).astype(int))]
    points=[]
    for row in group.itertuples():
        value=json.loads(row.RawValueJSON)
        if isinstance(value,(float,int)) and np.isfinite(value):points.append([row.UTCOperationEndTime,value])
    if points: signals.append({'tag':tag,'unit':units.get(tag) or '', 'points':points})
write('telemetry', {'signals':signals,'start':df.RangeStartUTC.iloc[0],'end':df.RangeEndUTC.iloc[0]}, [p])
