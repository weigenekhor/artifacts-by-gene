"""Native home layers for closed, expanded navigation and information states."""
import os,sys,json,types
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen';sys.dont_write_bytecode=True
source=Path(sys.argv[1]).resolve();sys.path.insert(0,str(source))
package=types.ModuleType('widgets');package.__path__=[str(source/'widgets')];sys.modules['widgets']=package
from PySide6.QtCore import Qt,QPoint
from PySide6.QtGui import QFont,QFontDatabase,QImage
from PySide6.QtWidgets import QApplication,QWidget
from PIL import Image
from widgets.home_page import HomeWidget
app=QApplication([])
for font in ('segoeui.ttf','seguisb.ttf','segoeuib.ttf','seguisym.ttf'):QFontDatabase.addApplicationFont('C:/Windows/Fonts/'+font)
app.setFont(QFont('Segoe UI',9))
out=Path('assets/native/layouts');out.mkdir(parents=True,exist_ok=True)
refs={}
def save(widget,path):
 image=QImage(widget.width()*2,widget.height()*2,QImage.Format_RGBA8888);image.setDevicePixelRatio(2);image.fill(Qt.transparent);widget.render(image)
 Image.frombytes('RGBA',(image.width(),image.height()),bytes(image.bits())).save(path,quality=96)
def save_pixmap(pixmap,path):
 image=pixmap.toImage().convertToFormat(QImage.Format_RGBA8888)
 Image.frombytes('RGBA',(image.width(),image.height()),bytes(image.bits())).save(path,quality=96)
for theme in ('origin','pentimento'):
 app.setProperty('artifacts_pentimento',theme=='pentimento')
 for mode in ('legacy','pentimento'):
  for state,offset in [('closed',0),('navigation',180),('information',240),('both',420)]:
   parent=QWidget();parent._load_legacy_mode_preference=lambda:mode=='legacy'
   home=HomeWidget(parent);home.resize(1161-offset,750);home.show();app.processEvents();home._layout_module_cards(force=True);app.processEvents();home.setPanelAnimationPaused(True)
   key=f'{theme}-{mode}-{state}';area=home.module_area;scroll=home.module_scroll
   save(area,out/f'{key}-content.webp')
   refs[key]={'width':home.width(),'height':750,'contentWidth':area.width(),'contentHeight':area.height(),'cards':[]}
   for card in home._cards:
    pos=card.mapTo(area,QPoint(0,0))
    refs[key]['cards'].append({'key':card.tab_key,'x':pos.x(),'y':pos.y(),'width':card.width(),'height':card.height()})
    card.setHoverAmount(1);save(card,out/f'{key}-{card.tab_key}.webp');card.setHoverAmount(0)
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
Path('content/home-layouts.json').write_text(json.dumps(refs,indent=2)+'\n',encoding='utf-8')
print('Exported 16 native home layouts and complete scrollable contents.')
