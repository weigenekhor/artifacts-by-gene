"""Render the actual desktop HomeWidget for the public product preview.

Offline asset generation only. No desktop data widgets, processing or settings
are loaded. The desktop source directory is never modified.
"""
import os
import sys
import json
import types
from pathlib import Path

os.environ['QT_QPA_PLATFORM'] = 'offscreen'
sys.dont_write_bytecode = True
source = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(source))
# Import only the home renderer, not widgets/__init__ and its processing widgets.
package = types.ModuleType('widgets')
package.__path__ = [str(source / 'widgets')]
sys.modules['widgets'] = package
from PySide6.QtCore import QPoint, Qt
from PySide6.QtGui import QImage, QFont, QFontDatabase
from PySide6.QtWidgets import QApplication, QWidget
from widgets.home_page import HomeWidget

app = QApplication([])
for font in ('segoeui.ttf', 'seguisb.ttf', 'segoeuib.ttf', 'seguisym.ttf'):
    QFontDatabase.addApplicationFont('C:/Windows/Fonts/' + font)
app.setFont(QFont('Segoe UI', 9))
out = Path('.qa/home-export')
out.mkdir(parents=True, exist_ok=True)
references = {}
for theme in ('origin', 'pentimento'):
    app.setProperty('artifacts_pentimento', theme == 'pentimento')
    for mode in ('legacy', 'pentimento'):
        parent = QWidget()
        parent._load_legacy_mode_preference = lambda: mode == 'legacy'
        home = HomeWidget(parent)
        home.resize(1161, 750)
        home.ensurePolished()
        home.show()
        app.processEvents()
        home._layout_module_cards(force=True)
        home.setPanelAnimationPaused(True)
        app.processEvents()
        image = QImage(2322, 1500, QImage.Format_ARGB32_Premultiplied)
        image.setDevicePixelRatio(2)
        image.fill(Qt.transparent)
        home.render(image)
        filename = f'{theme}-{mode}'
        image.save(str(out / (filename + '.png')))
        for card in home._cards:
            card.setHoverAmount(1)
            hover = QImage(card.width()*2, card.height()*2, QImage.Format_ARGB32_Premultiplied)
            hover.setDevicePixelRatio(2)
            hover.fill(Qt.transparent)
            card.render(hover)
            hover.save(str(out / (filename + '-' + card.tab_key + '.png')))
            card.setHoverAmount(0)
        references[filename] = {
            'width': home.width(), 'height': home.height(),
            'cards': [{
                'key': card.tab_key,
                'x': card.mapTo(home, QPoint(0, 0)).x(),
                'y': card.mapTo(home, QPoint(0, 0)).y(),
                'width': card.width(), 'height': card.height(),
            } for card in home._cards],
        }
        home.hide()
        home.deleteLater()
        parent.deleteLater()
        app.processEvents()
Path('content/home-reference.json').write_text(json.dumps(references, indent=2)+'\n', encoding='utf-8')
print('Rendered four home states directly from desktop source.')
