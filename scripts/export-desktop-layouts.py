"""Export real empty-state QWidget trees as HTML layout data, never screenshots.

Uses the existing offline harness: no samples, equipment, preferences or desktop
source files are changed. Custom painted diagrams remain inline vector geometry.
"""
import os, sys, json, re, types, hashlib
from functools import lru_cache
from pathlib import Path
os.environ['PYTHONDONTWRITEBYTECODE']='1'
sys.dont_write_bytecode=True
SITE=Path(__file__).resolve().parents[1]
ROOT=Path(sys.argv[1]).resolve()
HARNESS=Path('C:/Users/Gene/Desktop/ARTIFACTS Preview Refresh/capture-tools')
OUT=Path(os.environ.get('ARTIFACTS_LAYOUT_OUTPUT',SITE/'content/desktop-layouts'))
OUT.mkdir(parents=True,exist_ok=True)
from PySide6.QtWidgets import (QWidget,QLabel,QAbstractButton,QCheckBox,QRadioButton,QComboBox,QLineEdit,QTextEdit,QPlainTextEdit,QAbstractSpinBox,QSlider,QScrollBar,QSplitterHandle,QProgressBar,QTabBar,QTableView,QListWidget,QScrollArea,QAbstractScrollArea,QFrame,QGroupBox,QApplication,QStyle,QStyleOptionButton,QStyleOptionComboBox,QStyleOptionFrame)
from PySide6.QtCore import Qt,QPoint,QRect,QSize,QBuffer,QByteArray,QIODevice,QTimer
from PySide6.QtGui import QPalette,QPainter,QFontMetricsF,QRegion
from PySide6.QtSvg import QSvgGenerator
from PySide6.QtWidgets import QToolButton,QStyleOption

def color(c):
    return c.name() if c.alpha()==255 else f'rgba({c.red()},{c.green()},{c.blue()},{round(c.alphaF(),3)})'

def caption(text):
    # Qt's && displays a literal ampersand; only a single & is a mnemonic.
    return text.replace('&&','\0').replace('&','').replace('\0','&')

def continuous_plot_frame(w):
    # Qt exports this uniform rounded border as four strips and eight arcs.
    # Their independently antialiased joins show seams when the hero is scaled.
    # Keep the native QSS dimensions/palette but paint one continuous outline.
    if w.objectName() != 'plesseySpcPrimary' or not w.isEnabled():
        return None
    base = re.search(r'QPushButton\s*\{([^}]+)\}', w.styleSheet())
    if not base:
        return None
    rules = dict(re.findall(r'([\w-]+)\s*:\s*([^;]+)', base.group(1)))
    edge = re.fullmatch(r'([\d.]+)px solid (#[\da-fA-F]{6})', rules.get('border', ''))
    radius = re.fullmatch(r'([\d.]+)px', rules.get('border-radius', ''))
    fill = rules.get('background', '')
    if not edge or not radius or not re.fullmatch(r'#[\da-fA-F]{6}', fill):
        return None
    stroke = float(edge.group(1)); inset = stroke / 2
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w.width()} {w.height()}">'
            f'<rect x="{inset:g}" y="{inset:g}" width="{w.width()-stroke:g}" '
            f'height="{w.height()-stroke:g}" rx="{max(0,float(radius.group(1))-inset):g}" '
            f'fill="{fill.lower()}" stroke="{edge.group(2).lower()}" stroke-width="{stroke:g}"/></svg>')

@lru_cache(maxsize=100000)
def matches(w,selector):
    selector=selector.strip()
    if not selector or '::' in selector:return False
    tokens=selector.split()
    if len(tokens)>1:
        if not matches(w,tokens[-1]):return False
        parent=w.parentWidget()
        while parent:
            if matches(parent,' '.join(tokens[:-1])):return True
            parent=parent.parentWidget()
        return False
    # Only current-state rules: a hover/focus rule must not colour the idle view.
    states=re.findall(r':([\w-]+)',selector)
    for state in states:
        valid={'enabled':w.isEnabled(),'disabled':not w.isEnabled(),'checked':getattr(w,'isChecked',lambda:False)(),'unchecked':not getattr(w,'isChecked',lambda:False)(),'horizontal':getattr(w,'orientation',lambda:None)()==Qt.Horizontal,'vertical':getattr(w,'orientation',lambda:None)()==Qt.Vertical}
        if not valid.get(state,False):return False
    selector=re.sub(r':[\w-]+','',selector)
    attrs=re.findall(r'\[([^=\]]+)(?:\s*=\s*["\']?([^"\'\]]+)["\']?)?\]',selector)
    for key,value in attrs:
        p=w.property(key.strip())
        if value and str(p).lower()!=value.strip().lower():return False
        if not value and p is None:return False
    selector=re.sub(r'\[[^\]]*\]','',selector).strip()
    if '#' in selector:
        cls,name=selector.split('#',1)
        if w.objectName()!=name:return False
    else:cls=selector
    return not cls or cls=='*' or any(t.__name__==cls for t in type(w).__mro__) or w.inherits(cls)

@lru_cache(maxsize=512)
def parsed_rules(sheet):
    return [(selector,body) for selectors,body in re.findall(r'([^{}]+)\{([^{}]*)\}',sheet) for selector in selectors.split(',')]

def declarations(w):
    sheets=[QApplication.instance().styleSheet()]
    chain=[];p=w
    while p:chain.append(p);p=p.parentWidget()
    sheets += [p.styleSheet() for p in reversed(chain)]
    result={}
    for sheet in sheets:
        rules=[]
        for selector,body in parsed_rules(sheet):
            if matches(w,selector):
                specificity=100*selector.count('#')+10*(selector.count('[')+selector.count(':'))+len(re.findall(r'\bQ\w+',selector))
                rules.append((specificity,body))
        if sheet and '{' not in sheet:rules.append((0,sheet))
        for _,body in sorted(rules,key=lambda r:r[0]):
            for pair in body.split(';'):
                if ':' in pair:
                    k,v=pair.split(':',1);result[k.strip()]=v.strip()
    return result

def styling(w,kind):
    f=w.font();p=w.palette();q=declarations(w)
    result={'fontFamily':f.family(),'fontSize':f.pixelSize() if f.pixelSize()>0 else round(f.pointSizeF()*w.logicalDpiY()/72,3),'fontWeight':f.weight(),'color':color(p.color(QPalette.Active if w.isEnabled() else QPalette.Disabled,QPalette.ButtonText if isinstance(w,QAbstractButton) else QPalette.Text if kind in ('input','textarea','select','table') else QPalette.WindowText))}
    if w.autoFillBackground():result['background']=color(p.color(w.backgroundRole()))
    for key in ('color','background','background-color','border','border-top','border-bottom','border-left','border-right','border-color','border-width','border-style','border-radius','border-top-left-radius','border-top-right-radius','border-bottom-left-radius','border-bottom-right-radius','padding','padding-top','padding-left','padding-right','padding-bottom','text-align','letter-spacing'):
        if key in q and 'qlineargradient' not in q[key] and 'url(' not in q[key]:result[key]=q[key]
    if 'background' not in result and 'background-color' not in result:
        if kind in ('button','select'):result['background']=color(p.color(QPalette.Button))
        if kind in ('input','textarea','table','list'):result['background']=color(p.color(QPalette.Base))
    # QLabel's alignment and frame geometry are supplied by the real widget.
    if isinstance(w,QLabel):
        a=w.alignment();result['text-align']='right' if a&Qt.AlignRight else 'center' if a&Qt.AlignHCenter else 'left'
        result['alignItems']='flex-start' if a&Qt.AlignTop else 'flex-end' if a&Qt.AlignBottom else 'center'
        result['whiteSpace']='normal' if w.wordWrap() else 'pre'
        if w.margin():result['padding']=f'{w.margin()}px'
    return result

def vector(w):
    """Retain only native vector paint operations; embedded raster is forbidden."""
    data=QByteArray();buf=QBuffer(data);buf.open(QIODevice.WriteOnly)
    svg=QSvgGenerator();svg.setOutputDevice(buf);svg.setSize(w.size());svg.setViewBox(w.rect())
    painter=QPainter(svg)
    try:w.render(painter,QPoint(),QRegion(),QWidget.DrawWindowBackground)
    finally:painter.end();buf.close()
    text=bytes(data).decode('utf-8')
    if '<image' in text:return None
    return text[text.index('<svg'):]

def icon_vector(w):
    """Vectorize only the existing native icon alpha, never application imagery."""
    from PySide6.QtGui import QIcon
    size=w.iconSize();scale=4
    pix=w.icon().pixmap(size*scale,QIcon.Normal if w.isEnabled() else QIcon.Disabled)
    if pix.isNull():return None
    return pixmap_vector(pix,size)

def arrow_vector(w):
    from PySide6.QtGui import QPixmap
    size=w.iconSize();pix=QPixmap(size*4);pix.setDevicePixelRatio(4);pix.fill(Qt.transparent)
    option=QStyleOption();option.initFrom(w);option.rect=QRect(QPoint(),size)
    primitive={Qt.RightArrow:QStyle.PE_IndicatorArrowRight,Qt.LeftArrow:QStyle.PE_IndicatorArrowLeft,
               Qt.UpArrow:QStyle.PE_IndicatorArrowUp,Qt.DownArrow:QStyle.PE_IndicatorArrowDown}[w.arrowType()]
    painter=QPainter(pix)
    try:w.style().drawPrimitive(primitive,option,painter,w)
    finally:painter.end()
    return pixmap_vector(pix,size)

def pixmap_vector(pix,size):
    from PIL import Image
    from PySide6.QtGui import QImage
    im=pix.toImage().convertToFormat(QImage.Format_RGBA8888)
    image=Image.frombytes('RGBA',(im.width(),im.height()),bytes(im.bits()))
    # Subpixel spans retain the icon's actual colour/coverage in vector markup.
    paths={}
    for y in range(image.height):
        x=0
        while x<image.width:
            r,g,b,a=image.getpixel((x,y));end=x+1
            while end<image.width and image.getpixel((end,y))==(r,g,b,a):end+=1
            if a>12:paths.setdefault((r,g,b,round(a/255,2)),[]).append(f'M{x} {y}h{end-x}v1h{x-end}z')
            x=end
    return {'width':size.width(),'height':size.height(),'svg':f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {image.width} {image.height}">'+''.join(f'<path fill="rgb({r},{g},{b})" opacity="{a}" d="{"".join(paths[(r,g,b,a)])}"/>' for r,g,b,a in paths)+'</svg>'}

def export_tree(root):
    matches.cache_clear()
    count=[0];unsupported=[]
    def visit(w):
        if w is not root and (not w.isVisibleTo(root) or w.isWindow()):return None
        if w.width()<=0 or w.height()<=0:return None
        count[0]+=1
        node={'id':str(count[0]),'class':type(w).__name__,'name':w.objectName(),'x':w.x() if w is not root else 0,'y':w.y() if w is not root else 0,'width':w.width(),'height':w.height(),'enabled':w.isEnabled(),'kind':'box'}
        if isinstance(w,QLabel):
            node.update(kind='label',text=w.text(),rich=w.textFormat()==Qt.RichText or bool(re.search(r'<(?:p|b|span|br|html|div)\b',w.text())))
            if not w.text() and not w.pixmap().isNull():unsupported.append({'class':type(w).__name__,'name':w.objectName(),'reason':'raster label omitted'})
        elif isinstance(w,(QCheckBox,QRadioButton)):
            node.update(kind='check',radio=isinstance(w,QRadioButton),text=caption(w.text()),checked=w.isChecked())
        elif isinstance(w,QAbstractButton):
            node.update(kind='button',text=caption(w.text()),checked=w.isChecked(),checkable=w.isCheckable(),tip=w.toolTip(),accessible=w.accessibleName())
            if not w.icon().isNull():node['icon']=icon_vector(w)
            elif isinstance(w,QToolButton) and w.arrowType()!=Qt.NoArrow:node['icon']=arrow_vector(w)
        elif isinstance(w,QComboBox):node.update(kind='select',options=[w.itemText(i) for i in range(w.count())],value=w.currentIndex(),text=w.currentText())
        elif isinstance(w,QLineEdit):node.update(kind='input',text=w.text(),placeholder=w.placeholderText(),readonly=w.isReadOnly(),alignment=int(w.alignment()))
        elif isinstance(w,(QTextEdit,QPlainTextEdit)):node.update(kind='textarea',text=w.toPlainText(),placeholder=w.placeholderText(),readonly=w.isReadOnly(),html=w.toHtml() if isinstance(w,QTextEdit) else '')
        elif isinstance(w,QSlider):node.update(kind='slider',min=w.minimum(),max=w.maximum(),value=w.value(),vertical=w.orientation()==Qt.Vertical)
        elif isinstance(w,QProgressBar):node.update(kind='progress',min=w.minimum(),max=w.maximum(),value=w.value(),text=w.text(),textVisible=w.isTextVisible())
        elif isinstance(w,QTabBar):node.update(kind='tabs',tabs=[{'text':w.tabText(i),'x':w.tabRect(i).x(),'y':w.tabRect(i).y(),'width':w.tabRect(i).width(),'height':w.tabRect(i).height(),'selected':i==w.currentIndex()} for i in range(w.count())])
        elif isinstance(w,QTableView):
            m=w.model();node.update(kind='table',headers=[str(m.headerData(i,Qt.Horizontal) or '') for i in range(m.columnCount())] if m else [],columnWidths=[w.columnWidth(i) for i in range(m.columnCount())] if m else [],rows=[],headerHeight=w.horizontalHeader().height(),headerVisible=w.horizontalHeader().isVisible())
            if m:
                for r in range(min(m.rowCount(),100)):node['rows'].append([str(m.data(m.index(r,c)) or '') for c in range(m.columnCount())])
        elif isinstance(w,QListWidget):node.update(kind='list',items=[{'text':w.item(i).text(),'selected':i==w.currentRow(),'height':w.visualItemRect(w.item(i)).height()} for i in range(w.count())])
        elif isinstance(w,QGroupBox):node.update(title=w.title())
        node['style']=styling(w,node['kind'])
        if node['kind'] in ('button','select','check','slider','progress'):
            # Preserve a custom command/palette's native vector chrome. Its text
            # stays actual HTML, not outlined glyphs or an image of the control.
            # A raster-backed QIcon must not discard the native button frame.
            # Export it separately while keeping the real style, size and state.
            arrow=w.arrowType() if isinstance(w,QToolButton) else Qt.NoArrow
            if node['kind']=='button' and (not w.icon().isNull() or arrow!=Qt.NoArrow):
                from PySide6.QtGui import QIcon
                icon=w.icon()
                try:
                    w.setIcon(QIcon())
                    if arrow!=Qt.NoArrow:w.setArrowType(Qt.NoArrow)
                    paint=vector(w)
                finally:
                    w.setIcon(icon)
                    if arrow!=Qt.NoArrow:w.setArrowType(arrow)
            else:paint=vector(w)
            if node['kind']=='button':paint=continuous_plot_frame(w) or paint
            if paint:
                node['chrome']=re.sub(r'<text\b[^>]*>.*?</text>','',paint,flags=re.S)
                node['style'].update(background='transparent',border='none')
                node['style'].pop('background-color',None)
        if isinstance(w,(QCheckBox,QRadioButton)):
            option=QStyleOptionButton();w.initStyleOption(option)
            area=w.style().subElementRect(QStyle.SE_RadioButtonContents if isinstance(w,QRadioButton) else QStyle.SE_CheckBoxContents,option,w)
            node['textRect']=[area.x(),area.y(),area.width(),area.height()]
        if isinstance(w,QComboBox):
            option=QStyleOptionComboBox();w.initStyleOption(option)
            area=w.style().subControlRect(QStyle.CC_ComboBox,option,QStyle.SC_ComboBoxEditField,w)
            node['textRect']=[area.x(),area.y(),area.width(),area.height()]
            if w.property('chartThemeSelector'):node['textRect']=[32,0,w.width()-48,w.height()]
        if isinstance(w,(QScrollBar,QSplitterHandle)):
            paint=vector(w)
            if paint:node.update(kind='vector',vector=paint)
        if hasattr(w,'figure') and hasattr(w.figure,'savefig'):
            import io
            out=io.StringIO();w.figure.savefig(out,format='svg');paint=out.getvalue()
            if '<image' not in paint:node.update(kind='vector',vector=paint[paint.index('<svg'):])
        # Custom-painted native geometry is retained as SVG paths, not imagery.
        children=[c for c in w.children() if isinstance(c,QWidget) and not c.isWindow()]
        custom=type(w).__module__.startswith('widgets.') and 'paintEvent' in type(w).__dict__ and not isinstance(w,(QLabel,QAbstractButton,QComboBox,QAbstractScrollArea))
        if custom:
            shape=vector(w)
            if shape:
                if children:node['chrome']=shape
                else:node.update(kind='vector',vector=shape)
            else:unsupported.append({'class':type(w).__name__,'name':w.objectName(),'reason':'non-vector custom paint'})
        if node['kind']=='box':
            node['children']=[n for c in children if (n:=visit(c))]
            if isinstance(w.parentWidget(),QScrollArea) and w.parentWidget().viewport() is w:node['scroll']=True
        return node
    tree=visit(root)
    return tree,unsupported

def run(window,app,root,out):
    from PySide6.QtTest import QTest
    catalog=json.loads((SITE/'content/apps.json').read_text(encoding='utf-8'))
    keys=set(sys.argv[3:])
    for item in catalog['apps']:
        key=item['sourceKey']
        if keys and key not in keys:continue
        window._set_legacy_mode(key in ('parser_tab','altusanko_tab','wafercount_tab','path_tab','dnd_tab','dnd2_tab','ankohelper_tab'),persist=False)
        window.go_to_tab(key);QTest.qWait(150);app.processEvents()
        target=getattr(window,key.replace('_tab','_widget'))
        if key=='pyra_tab':
            # This bundled master defines the application's observation controls;
            # loading its vocabulary is normal startup, not loading an example.
            target.load_excel_from_path(str(ROOT/'widgets/Resources/Pyra Master.xlsx'))
            target.case_combo.setCurrentIndex(-1);app.processEvents()
        sizes={}
        for size,delta in [('closed',0),('navigation',180),('information',218),('both',398)]:
            window.setFixedSize(1229-delta,820);QTest.qWait(80);app.processEvents()
            variants={}
            for appearance,theme in [('original','imprimatura'),('void','tenebrismo'),('pentimento','pentimento')]:
                window._set_global_appearance(appearance,persist=False);QTest.qWait(80);app.processEvents()
                tree,unsupported=export_tree(target)
                if os.environ.get('ARTIFACTS_BUTTON_EVIDENCE') and size=='closed':
                    evidence=Path(os.environ['ARTIFACTS_BUTTON_EVIDENCE']);evidence.mkdir(parents=True,exist_ok=True)
                    for button in target.findChildren(QAbstractButton):
                        if button.objectName() in ('plesseySpcPrimary','compile') and button.isVisibleTo(target):
                            button.grab().save(str(evidence/f'{item["id"]}-{theme}-{button.objectName()}.png'))
                variants[theme]={'availableWidth':1159-delta,'width':target.width(),'height':target.height(),'tree':tree,'unsupported':unsupported}
            sizes[size]=variants
        import inspect
        source=Path(inspect.getfile(type(target)))
        payload={'id':item['id'],'sourceKey':key,'source':str(source.relative_to(ROOT)),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'states':{'initial':sizes}}
        (OUT/(item['id']+'.json')).write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        print('LAYOUT',item['id'],sum(len(v['unsupported']) for variants in sizes.values() for v in variants.values()),flush=True)
        window.setFixedSize(1229,820)
    print('LAYOUT EXPORT COMPLETE',flush=True)
    # Qt WebEngine teardown can crash after all files are safely written. End
    # only this isolated export process without invoking desktop cleanup hooks.
    import ctypes
    ctypes.windll.kernel32.TerminateProcess(ctypes.windll.kernel32.GetCurrentProcess(),0)

module=types.ModuleType('scenes');module.run=run;sys.modules['scenes']=module
sys.path.insert(0,str(HARNESS))
runtime=(HARNESS/'capture.py').read_text(encoding='utf-8').replace('window.setFixedSize(1536,1024)','window.setFixedSize(1229,820)')
exec(compile(runtime,str(HARNESS/'capture.py'),'exec'))
