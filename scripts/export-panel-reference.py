"""Export the desktop's real details and Application Info panels, read-only.

Qt/Pillow are asset-build tools only. No application processing widgets run.
"""
import os, sys, json, types, textwrap
from pathlib import Path
os.environ['QT_QPA_PLATFORM'] = 'offscreen'
sys.dont_write_bytecode = True
source = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(source))
package = types.ModuleType('widgets'); package.__path__ = [str(source / 'widgets')]
sys.modules['widgets'] = package
from PySide6.QtCore import Qt, QPoint, QSize
from PySide6.QtGui import QFont, QFontDatabase, QImage, QPalette, QColor, QRegion
from PySide6.QtWidgets import QApplication, QWidget, QFrame, QVBoxLayout, QHBoxLayout, QScrollArea, QLabel
from PIL import Image
from widgets.home_page import HomeWidget
app = QApplication([])
for font in ('segoeui.ttf','seguisb.ttf','segoeuib.ttf','seguisym.ttf'):
    QFontDatabase.addApplicationFont('C:/Windows/Fonts/' + font)
app.setFont(QFont('Segoe UI', 9))
out = Path('assets/native/panels'); out.mkdir(parents=True, exist_ok=True)
refs = {}
def raster(widget):
    image = QImage(widget.width()*2, widget.height()*2, QImage.Format_RGBA8888)
    image.setDevicePixelRatio(2); image.fill(Qt.transparent)
    widget.render(image, QPoint(), QRegion(), QWidget.DrawChildren)
    return Image.frombytes('RGBA', (image.width(),image.height()), bytes(image.bits()))
# Use the exact widget-construction block from the desktop, not a website variant.
source_text = (source/'Artifacts.py').read_text(encoding='utf-8')
start = source_text.index('        self.extra_left_box = QFrame(self.leftMenuFrame)')
end = source_text.index('        self.frame_content = QFrame(self.main_frame)', start)
info_code = compile(textwrap.dedent(source_text[start:end]), str(source/'Artifacts.py'), 'exec')
for theme in ('origin','pentimento'):
    app.setProperty('artifacts_pentimento', theme == 'pentimento')
    qss = (source/'themes'/('pentimento.qss' if theme=='pentimento' else 'dark.qss')).read_text(encoding='utf-8')
    # Resource URLs are read from the desktop checkout, never copied or changed.
    qss=qss.replace('url(resources/', 'url('+source.as_posix()+'/resources/')
    app.setStyleSheet(qss)
    host=QWidget(); host.resize(240,820)
    owner=types.SimpleNamespace(leftMenuFrame=host,left_menu_frame=host,app_layout=QHBoxLayout(host))
    owner.app_layout.setContentsMargins(0,0,0,0)
    scope=dict(globals(),self=owner,window_policy=types.SimpleNamespace(TITLE_BAR_HEIGHT=44))
    exec(info_code,scope)
    owner.extra_left_box.setFixedWidth(240);host.show();app.processEvents()
    raster(host).save(out/f'{theme}-info.webp',quality=96)
    host.hide()
    for mode in ('legacy','pentimento'):
        parent=QWidget();parent.setObjectName('pagesContainer');parent.resize(1161,750)
        parent._load_legacy_mode_preference=lambda:mode=='legacy'
        home=HomeWidget(parent);home.setParent(parent);home.resize(1161,750)
        parent.show();home.show();app.processEvents()
        home.setPanelAnimationPaused(True)
        panel=home.details_panel;panel.setGraphicsEffect(None)
        for card in home._cards:
            key=f'{theme}-{mode}-{card.tab_key}'
            panel.set_module(card.tab_key,card.letters);panel.show();panel.ensurePolished()
            panel.motion.setPaused(True);panel.preview_frame._timer.stop()
            app.processEvents();panel.motion.setPaused(True);panel.preview_frame._timer.stop()
            panel.motion._phase=.45
            raster(panel).save(out/f'{key}.webp',quality=96)
            motion=panel.motion;pos=motion.mapTo(panel,QPoint(0,0))
            refs[key]={'width':panel.width(),'height':panel.height(),'motion':{'x':pos.x(),'y':pos.y(),'width':motion.width(),'height':motion.height()}}
            frames=[]
            for frame in range(32):
                motion._phase=frame/32
                frames.append(raster(motion))
            frames[0].save(out/f'{key}-motion.webp',save_all=True,append_images=frames[1:],duration=56,loop=0,quality=88)
            panel.hide()
        home.hide();home.deleteLater();parent.deleteLater();app.processEvents()
    host.deleteLater();app.processEvents()
Path('content/panel-reference.json').write_text(json.dumps(refs,indent=2)+'\n',encoding='utf-8')
print(f'Exported {len(refs)} native module panels, native motion strips and both information drawers.')
