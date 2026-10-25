"""Sample the unchanged desktop motion painter more densely; export only movies.

Usage: python scripts/export-panel-motion.py <desktop-source> <output-folder>
Optional --key limits a preflight to one panel. Desktop source stays read-only.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import time

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--key')
args = parser.parse_args()
site = Path(__file__).resolve().parents[1]
source = args.source.resolve()
output = args.output.resolve(); output.mkdir(parents=True, exist_ok=True)
os.environ['QT_QPA_PLATFORM'] = 'offscreen'
sys.dont_write_bytecode = True
sys.path.insert(0, str(source)); os.chdir(source)
from PySide6.QtCore import Qt, QPoint
from PySide6.QtGui import QFont, QFontDatabase, QImage, QRegion
from PySide6.QtWidgets import QApplication, QWidget
from PIL import Image
import numpy as np
from widgets.home_widget import ModuleMotionStrip
from widgets.edition_theme import application_stylesheet
exec((site/'scripts/desktop-export-style.py').read_text(), globals())

app = QApplication([])
for font in ('segoeui.ttf', 'seguisb.ttf', 'segoeuib.ttf', 'seguisym.ttf'):
    QFontDatabase.addApplicationFont('C:/Windows/Fonts/'+font)
app.setFont(QFont('Segoe UI', 9))
references = json.loads((site/'content/panel-reference.json').read_text())
manifest = {}; rendered = {}
def phase_frames(image):
    if image.n_frames == 1:
        return [np.asarray(image.convert('RGBA')).astype(float)]*4
    frames = []; elapsed = 0
    for index in range(image.n_frames):
        image.seek(index); image.load()
        elapsed += image.info.get('duration', 1792)
        while len(frames) < 4 and len(frames)*448 < elapsed:
            frames.append(np.asarray(image.convert('RGBA')).astype(float))
    return frames

for key, ref in references.items():
    if args.key and key != args.key:
        continue
    theme, mode, tab = key.split('-', 2)
    shape = ref['motion']
    identity = (theme, tab, shape['width'], shape['height'])
    path = output/(key+'-motion.webp')
    baseline = site/'assets/native/panels'/(key+'-motion.webp')
    old = Image.open(baseline)
    # Discrete status changes and static schematics are intentional. Preserve
    # their exact encoded bytes/timing instead of inventing in-between states.
    preserved = old.n_frames < 32
    if preserved:
        path.write_bytes(baseline.read_bytes())
    elif identity in rendered:
        original = rendered[identity]
        path.write_bytes(original.read_bytes())
    else:
        appearance = {'imprimatura':'original', 'tenebrismo':'void', 'pentimento':'pentimento'}[theme]
        app.setProperty('artifacts_appearance', appearance)
        app.setProperty('artifacts_pentimento', appearance == 'pentimento')
        app.setStyleSheet(application_stylesheet())
        motion = ModuleMotionStrip(); motion.setPaused(True); motion.set_module(tab)
        motion.resize(shape['width'], shape['height']); motion.ensurePolished()
        frames = []; started = time.perf_counter()
        for index in range(112):
            motion._phase = index/112
            image = QImage(motion.width()*2, motion.height()*2, QImage.Format_RGBA8888)
            image.setDevicePixelRatio(2); image.fill(Qt.transparent)
            motion.render(image, QPoint(), QRegion(), QWidget.DrawChildren)
            frames.append(Image.frombytes('RGBA', (image.width(), image.height()), bytes(image.bits())))
        # 112 x 16 ms preserves the existing 1792 ms loop exactly at 62.5 fps.
        frames[0].save(path, save_all=True, append_images=frames[1:], duration=16,
                       loop=0, quality=88, method=4)
        motion.close(); motion.deleteLater()
        rendered[identity] = path
        print(key, 'seconds', round(time.perf_counter()-started, 2), 'bytes', path.stat().st_size, flush=True)
    new = Image.open(path)
    differences = []
    for a, b in zip(phase_frames(old), phase_frames(new)):
        differences.append(float(np.sqrt(np.mean((a-b)**2))))
    manifest[key] = dict(frames=new.n_frames, duration_ms=1792, frame_ms=None if preserved else 16,
                         preserved_discrete_or_static=preserved,
                         width=new.width, height=new.height, bytes=path.stat().st_size,
                         sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                         baseline_phase_rmse=differences)
(output/'motion-manifest.json').write_text(json.dumps(manifest, indent=2)+'\n')
print('Exported', len(manifest), 'movies;', len(rendered), 'unique native painters.', flush=True)
