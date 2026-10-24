"""Native home layers for closed, expanded navigation and information states."""
import os,sys,json
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen';sys.dont_write_bytecode=True
site=Path.cwd();source=Path(sys.argv[1]).resolve();sys.path.insert(0,str(source));os.chdir(source)
# Use the lightweight package initializer so grouped source paths are registered.
import widgets
from PySide6.QtCore import Qt,QPoint
from PySide6.QtGui import QFont,QFontDatabase,QImage,QPalette
from PySide6.QtWidgets import QApplication,QWidget
from PIL import Image
from widgets.home_widget import HomeWidget,make_suite_icon,ModuleCategoryTitle
from widgets.edition_theme import application_stylesheet,edition_name
exec((site/'scripts/desktop-export-style.py').read_text(),globals())
app=QApplication([])
for font in ('segoeui.ttf','seguisb.ttf','segoeuib.ttf','seguisym.ttf'):QFontDatabase.addApplicationFont('C:/Windows/Fonts/'+font)
app.setFont(QFont('Segoe UI',9))
out=site/'assets/native/layouts';out.mkdir(parents=True,exist_ok=True)
refs={}
RENDER_DENSITY=4
def save(widget,path):
 image=QImage(widget.width()*RENDER_DENSITY,widget.height()*RENDER_DENSITY,QImage.Format_RGBA8888);image.setDevicePixelRatio(RENDER_DENSITY);image.fill(Qt.transparent);widget.render(image)
 Image.frombytes('RGBA',(image.width(),image.height()),bytes(image.bits())).save(path,lossless=True,method=4)
def save_pixmap(pixmap,path):
 image=pixmap.toImage().convertToFormat(QImage.Format_RGBA8888)
 Image.frombytes('RGBA',(image.width(),image.height()),bytes(image.bits())).save(path,quality=96)
for theme,appearance in (('imprimatura','original'),('tenebrismo','void'),('pentimento','pentimento')):
 app.setProperty('artifacts_appearance',appearance)
 app.setProperty('artifacts_pentimento',theme=='pentimento')
 app.setStyleSheet(application_stylesheet())
 for mode in ('legacy','pentimento'):
  for state,offset in [('closed',0),('navigation',180),('information',218),('both',398)]:
   parent=QWidget();parent._load_legacy_mode_preference=lambda:mode=='legacy'
   parent.setObjectName('pagesContainer');parent.setProperty('artifactsEdition',edition_name())
   parent.resize(1161-offset,750);home=HomeWidget(parent);home.setParent(parent);home.resize(1161-offset,750);parent.show();home.show();app.processEvents();home._layout_module_cards(force=True);app.processEvents();home.setPanelAnimationPaused(True)
   key=f'{theme}-{mode}-{state}';area=home.module_area;scroll=home.module_scroll
   # Current AnimatedIconLabel paints native paths at the target device scale.
   # Preserve its logical optical-reference pixmap; replacing it with a 4x
   # bitmap changes the reference used for glyph bounds and hover alignment.
   refs[key]={'width':home.width(),'height':750,'contentWidth':area.width(),'contentHeight':area.height(),'renderDensity':RENDER_DENSITY,'cards':[],'headings':[]}
   # Text is drawn by the browser at the actual display density. Preserve all
   # measured Qt geometry and rasterize only the native card surfaces/glyphs.
   labels=[]
   for label in area.findChildren(ModuleCategoryTitle):
    pos=label.mapTo(area,QPoint(0,0))
    refs[key]['headings'].append({'text':label.text(),'x':pos.x()+14,'y':pos.y(),'width':label.width()-28,'height':label.height()})
    labels.append((label,label.text()));label.setText('')
   for card in home._cards:
    pos=card.mapTo(area,QPoint(0,0))
    label=card.title_label;lp=label.mapTo(card,QPoint(0,0))
    refs[key]['cards'].append({'key':card.tab_key,'x':pos.x(),'y':pos.y(),'width':card.width(),'height':card.height(),'label':{'text':label.text(),'x':lp.x(),'y':lp.y(),'width':label.width(),'height':label.height(),'color':label.palette().color(QPalette.WindowText).name()}})
    labels.append((label,label.text()));label.setText('')
    card.setHoverAmount(1);save(card,out/f'{key}-{card.tab_key}.webp');card.setHoverAmount(0)
   save(area,out/f'{key}-content.webp')
   for label,text in labels:label.setText(text)
   scroll.hide();app.processEvents()
   layer=home._wafer_layer
   if not layer._compatible:raise RuntimeError('Native rotating wafer source is unavailable')
   # Use the native material and rim. Only the wafer rotates; illumination stays fixed.
   home._panel_animation_paused=False;layer._timer.stop();layer._angle=0
   home.grab()  # Populate the renderer's material/lighting caches without baking a second wafer.
   center,scale=layer._wafer_geometry()
   refs[key]['wafer']={'x':center.x()-626*scale,'y':center.y()-617*scale,'size':1254*scale,'originX':626/1254*100,'originY':617/1254*100}
   if state=='closed' and mode=='legacy':
    save_pixmap(layer._rotation_texture,out/f'{theme}-wafer.webp')
   # Native tonal field and fixed lighting are separate compositing layers.
   save_pixmap(layer._field,out/f'{key}-field.webp')
   save_pixmap(layer._overlay,out/f'{key}-light.webp')
   home.hide();home.deleteLater();parent.deleteLater();app.processEvents()
(site/'content/home-layouts.json').write_text(json.dumps(refs,indent=2)+'\n',encoding='utf-8')
print('Exported 24 native home layouts and complete scrollable contents.')
