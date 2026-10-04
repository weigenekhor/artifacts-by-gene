"""Build-time export of the desktop's own wafer material. No app runtime imported."""
import ast, os, sys
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen'
from PySide6.QtCore import Qt, QRectF, QPointF
from PySide6.QtGui import QGuiApplication, QPixmap, QImage, QPainter, QPainterPath, QColor, QPen
root=Path(sys.argv[1])
tree=ast.parse((root/'widgets/home_page.py').read_text(encoding='utf-8'))
source_class=next(n for n in tree.body if isinstance(n,ast.ClassDef) and n.name=='WaferRotationSurface')
methods=[n for n in source_class.body if isinstance(n,ast.FunctionDef) and n.name in ('_wafer_contour','_prepare_wafer')]
minimal=ast.ClassDef(name='WaferRotationSurface',bases=[],keywords=[],body=[ast.parse('_TEXTURE_CANVAS_SIZE=1254.0').body[0]]+methods,decorator_list=[])
exec(compile(ast.fix_missing_locations(ast.Module(body=[minimal],type_ignores=[])),'desktop-wafer','exec'))
app=QGuiApplication([])
wafer=WaferRotationSurface._prepare_wafer(QPixmap(str(root/'resources/images/artifacts_wafer_rotation.png')))
original=wafer.scaled(2048,2048,Qt.KeepAspectRatio,Qt.SmoothTransformation)
for theme in ['origin','pentimento']:
 if theme=='pentimento':
  image=original.toImage().convertToFormat(QImage.Format_Grayscale8).convertToFormat(QImage.Format_ARGB32_Premultiplied)
  p=QPainter(image);p.setCompositionMode(QPainter.CompositionMode_Multiply);p.fillRect(image.rect(),QColor('#ADA3BC'))
  p.setCompositionMode(QPainter.CompositionMode_SourceOver);p.fillRect(image.rect(),QColor(13,14,18,40))
  p.setCompositionMode(QPainter.CompositionMode_DestinationIn);p.drawPixmap(0,0,original);p.end()
 else:
  image=original.toImage().convertToFormat(QImage.Format_ARGB32_Premultiplied)
  p=QPainter(image);p.setCompositionMode(QPainter.CompositionMode_SourceAtop);p.fillRect(image.rect(),QColor(5,8,10,105));p.end()
 image.save(f'.qa/wafer-{theme}.png')
print('Exported the two exact desktop wafer materials.')
