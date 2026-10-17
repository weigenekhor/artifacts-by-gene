"""Export real ARTIFACTS fixture states and control geometry, fully offline.

The existing capture harness loads only built-in examples / approved fixtures.
No desktop source, preferences or original captures are modified.
"""
import os,sys,json,importlib.util
from pathlib import Path
os.environ['PYTHONDONTWRITEBYTECODE']='1';sys.dont_write_bytecode=True
SITE=Path(__file__).resolve().parents[1]
ROOT=Path(sys.argv[1]).resolve()
HARNESS=Path('C:/Users/Gene/Desktop/ARTIFACTS Preview Refresh/capture-tools')
OUTPUT=SITE/'assets/native/workspaces'
OUTPUT.mkdir(parents=True,exist_ok=True)
RECORDS=SITE/'content/workspaces'
RECORDS.mkdir(parents=True,exist_ok=True)
sys.path.insert(0,str(HARNESS))
from PySide6.QtWidgets import QWidget,QAbstractButton,QComboBox,QTabBar,QListWidget,QLineEdit,QLabel
from PySide6.QtCore import QPoint,Qt
from PySide6.QtGui import QImage
from PIL import Image

def export_state(window,app,key,index,scene,surface=None,before=None,transition=None):
    from PySide6.QtTest import QTest
    target=surface or getattr(window,key.replace('_tab','_widget'))
    records=[]
    for appearance,theme in [('original','imprimatura'),('void','tenebrismo'),('pentimento','pentimento')]:
        window._set_global_appearance(appearance,persist=False);QTest.qWait(250);app.processEvents()
        if before:before(appearance);QTest.qWait(350);app.processEvents()
        controls=[]
        for child in target.findChildren(QWidget):
            if not child.isVisibleTo(target):continue
            p=child.mapTo(target,QPoint(0,0));x,y=p.x(),p.y();w,h=child.width(),child.height()
            if x<0 or y<0 or x+w>target.width()+2 or y+h>target.height()+2 or w<5 or h<5:continue
            item=dict(x=x,y=y,width=w,height=h,name=child.objectName(),className=type(child).__name__,enabled=child.isEnabled())
            if isinstance(child,QAbstractButton):
                item.update(kind='button',text=child.text().replace('&','') or child.toolTip() or child.accessibleName(),checked=child.isChecked())
            elif isinstance(child,QComboBox):
                item.update(kind='select',text=child.currentText(),options=[child.itemText(i) for i in range(child.count())],value=child.currentIndex())
            elif isinstance(child,QTabBar):
                for i in range(child.count()):
                    rect=child.tabRect(i)
                    controls.append(dict(item,kind='tab',text=child.tabText(i),index=i,x=x+rect.x(),y=y+rect.y(),width=rect.width(),height=rect.height(),checked=i==child.currentIndex()))
                continue
            elif isinstance(child,QListWidget):
                for i in range(child.count()):
                    r=child.visualItemRect(child.item(i));pos=child.viewport().mapTo(target,r.topLeft())
                    if r.isValid() and pos.y()>=y and pos.y()+r.height()<=y+h:
                        controls.append(dict(item,kind='list',text=child.item(i).text(),index=i,x=pos.x(),y=pos.y(),width=r.width(),height=r.height(),checked=i==child.currentRow()))
                continue
            elif key=='laytec_tab' and child in (target.controls.inner_slider,target.controls.outer_range,target.controls.inner_plate,target.controls.outer_plate):
                names=('inner_slider','outer_range','inner_plate','outer_plate')
                name=next(n for n in names if getattr(target.controls,n) is child)
                item.update(kind='sample-control',name=name,text={'inner_slider':'Inner Area','outer_range':'Outer Area','inner_plate':'Inner Anchor','outer_plate':'Outer Anchor'}[name])
            elif key=='dt_tab' and child is target.slot_count_slider:
                item.update(kind='sample-control',name='slot_count_slider',text='Number of Slots')
            else:continue
            if item.get('text') or item.get('options'):controls.append(item)
        pos=target.mapTo(window,QPoint(0,0)) if surface is None else QPoint(0,0)
        record=dict(key=key,scene=str(index),description=scene,theme=theme,width=target.width(),height=target.height(),controls=controls,report=surface is not None,windowBounds=dict(x=pos.x(),y=pos.y(),width=target.width(),height=target.height()),transition=transition)
        image=QImage(target.width()*2,target.height()*2,QImage.Format_RGBA8888)
        image.setDevicePixelRatio(2);image.fill(Qt.transparent);target.render(image)
        filename=f'{key}-{index}-{theme}.webp'
        Image.frombytes('RGBA',(image.width(),image.height()),bytes(image.bits())).save(OUTPUT/filename,lossless=True,method=3)
        record['image']='assets/native/workspaces/'+filename
        records.append(record)
    path=RECORDS/f'{key}.json'
    prior=json.loads(path.read_text(encoding='utf-8')) if path.exists() else []
    prior=[r for r in prior if r['scene']!=str(index)]+records
    path.write_text(json.dumps(prior,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print('EXPORTED',key,index,scene,flush=True)

def export_extras(window,app,key,index,scene):
    """Exercise native read-only controls; record their actual result states."""
    from PySide6.QtTest import QTest
    target=getattr(window,key.replace('_tab','_widget'))
    if key=='sentry_tab' and str(index)=='1':
        for row in range(2,8):
            target.workspace.nav.setCurrentRow(row);QTest.qWait(1500)
            import time
            start=time.monotonic()
            while target.workspace.is_rendering and time.monotonic()-start<90:QTest.qWait(100)
            label=target.workspace.nav.item(row).text()
            export_state(window,app,key,f'1-module-{row}',label,transition=dict(parent='1',kind='button',text=label))
        target.workspace.nav.setCurrentRow(0);QTest.qWait(1000)
        return
    if key=='metro_tab' and str(index)=='1':
        for button in target.mode_buttons[1:]:
            button.click();QTest.qWait(800)
            export_state(window,app,key,'mode-'+button.text().replace(' ','-'),button.text(),transition=dict(parent='1',kind='button',text=button.text()))
        target.plessey.checkbox.click();QTest.qWait(800)
        p=Path('C:/Users/Gene/Desktop/ARTIFACTS Test Files/01 Met Compiler/Plessey')
        for role,paths in [('Base File',[p/'Base.xlsx']),('Growth Plan',[p/'Growth Plan.xlsx']),('Limits',[p/'Limits.xlsx']),('Plato',list(p.glob('*_PL.xlsx'))),('Bow',list(p.glob('*_QUARTZ.pdf'))),('LayTec',list(p.glob('*_AQUAMARINE.pdf')))]:
            target.plessey.assign(role,[str(v) for v in paths])
        QTest.qWait(1000)
        export_state(window,app,key,'mode-Plessey','Plessey input validation',transition=dict(parent='1',kind='button',text='Plessey'))
        return
    if key=='xml_tab' and str(index)=='1':
        for text in ('Raw Mode','Diffs Only Mode'):
            button=next(b for b in target.findChildren(QAbstractButton) if b.text().strip()==text)
            button.click();QTest.qWait(800)
            export_state(window,app,key,text.split()[0].lower(),text,transition=dict(parent='1',kind='button',text=text))
        return
    if key=='laytec_tab':
        c=target.controls
        for name,values in [('inner_slider',(10,20,30)),('outer_range',((5,20),(15,35))),('inner_plate',(1,2,3,4)),('outer_plate',(0,1,2,4))]:
            control=getattr(c,name)
            original=(15 if name=='inner_slider' else (8,28) if name=='outer_range' else 0 if name=='inner_plate' else 3)
            for n,value in enumerate(values):
                if isinstance(value,tuple):control.setValues(*value)
                else:control.setValue(value)
                QTest.qWait(800)
                export_state(window,app,key,f'{index}-{name}-{n}',f'{name.replace("_"," ").title()}: {value}',transition=dict(parent=str(index),kind='native-control',name=name,label=str(value)))
            if isinstance(original,tuple):control.setValues(*original)
            else:control.setValue(original)
        return
    if key=='dt_tab':
        for count in (3,4,6,7,8):
            target.slot_count_slider.setValue(count);target.load_example();target.compute_assignment();QTest.qWait(700)
            export_state(window,app,key,f'{index}-slots-{count}',f'{count} slot assignment',transition=dict(parent=str(index),kind='native-control',name='slot_count_slider',label=f'{count} slots'))
        target.slot_count_slider.setValue(5);target.load_example();target.compute_assignment()
        return
    if key not in ('parser_tab','pyra_tab','datalens_tab','path_tab','plessey_spc_tab','aperture_spc_tab'):return
    if key=='datalens_tab' and str(index)!='1':return
    controls=list(target.findChildren(QComboBox))
    for number,control in enumerate(controls):
        if not control.isVisibleTo(target) or not control.isEnabled() or control.count()<2:continue
        # Chart palettes already follow the native themed captures. This pass
        # exercises data selections rather than producing cosmetic permutations.
        if control.findText('Nocturne')>=0:continue
        original=control.currentIndex()
        choices=[i for i in range(min(control.count(),3)) if i!=original]
        if key=='pyra_tab':choices=[i for i in (1,2) if i<control.count() and i!=original]
        for option in choices:
            label=control.itemText(option)
            control.setCurrentIndex(option);QTest.qWait(800);app.processEvents()
            export_state(window,app,key,f'{index}-select-{number}-{option}',label,transition=dict(parent=str(index),kind='select',name=control.objectName(),text=control.itemText(original),option=option,optionText=label,number=number))
        control.setCurrentIndex(original);QTest.qWait(600);app.processEvents()
    if key in ('datalens_tab','plessey_spc_tab','aperture_spc_tab'):
        texts=('Statistics','Wafer Average Correlations','Hide Controls') if key=='datalens_tab' else ('Show Controls',)
        for text in texts:
            button=next((b for b in target.findChildren(QAbstractButton) if b.text()==text and b.isVisibleTo(target)),None)
            if button is None:continue
            button.click();QTest.qWait(700);app.processEvents()
            export_state(window,app,key,f'{index}-'+text.lower().replace(' ','-'),text,transition=dict(parent=str(index),kind='button',text=text))
            restore='Hide Controls' if text=='Show Controls' else 'Show Controls' if text=='Hide Controls' else 'Data'
            other=next((b for b in target.findChildren(QAbstractButton) if b.text()==restore and b.isVisibleTo(target)),None)
            if other:other.click();QTest.qWait(400);app.processEvents()

# Adapt the proven source fixture loader in memory; it remains untouched on disk.
scenes_source=(HARNESS/'scenes.py').read_text(encoding='utf-8')
start=scenes_source.index(' def capture(');end=scenes_source.index(' keys=sys.argv[3:]',start)
scenes_source=scenes_source[:start]+''' def capture(key,index=1,scene='',surface=None,before=None):
  export_state(window,app,key,index,scene,surface,before)
  if os.environ.get('NATIVE_DEMO_EXTRAS')=='1' and surface is None:export_extras(window,app,key,index,scene)
'''+scenes_source[end:]
scenes_source=scenes_source.replace("  random.seed(20261017)","  random.seed(20261017)\n  export_state(window,app,key,'ready','Ready for sample input')")
scenes_source=scenes_source.replace(" window._shutdown_now();window.hide()", " print('EXPORT COMPLETE',flush=True);os._exit(0)")
module=type(sys)('scenes');module.__dict__.update(export_state=export_state,export_extras=export_extras)
exec(compile(scenes_source,str(HARNESS/'scenes.py'),'exec'),module.__dict__);sys.modules['scenes']=module
runtime=(HARNESS/'capture.py').read_text(encoding='utf-8')
runtime=runtime.replace("os.environ['QT_QPA_PLATFORM']='offscreen'","os.environ['QT_QPA_PLATFORM']='offscreen'")
exec(compile(runtime,str(HARNESS/'capture.py'),'exec'))
