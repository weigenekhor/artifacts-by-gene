"""Render current desktop panels and glyphs without opening processing apps."""
import os,sys,json
from pathlib import Path
os.environ['QT_QPA_PLATFORM']='offscreen';sys.dont_write_bytecode=True
site=Path.cwd();source=Path(sys.argv[1]).resolve();sys.path.insert(0,str(source));os.chdir(source)
# Use the lightweight package initializer so grouped source paths are registered.
import widgets
from PySide6.QtCore import Qt,QPoint,QSize
from PySide6.QtGui import QFont,QFontDatabase,QImage,QRegion,QFontInfo,QPalette
from PySide6.QtWidgets import QApplication,QWidget,QVBoxLayout,QLabel
from PySide6.QtSvg import QSvgRenderer
from PIL import Image
from widgets.home_widget import HomeWidget,TITLES
from widgets.application_info_panel import ApplicationInfoPanel,info_panel_colors
from widgets.edition_theme import application_stylesheet,edition_name
from widgets.sidebar_icons import GLYPHS,GLYPH_EXTENT,STROKE_WIDTH
from widgets.titlebar_appearance import appearance_icon
exec((site/'scripts/desktop-export-style.py').read_text(),globals())

app=QApplication([])
for font in ('segoeui.ttf','seguisb.ttf','segoeuib.ttf','seguisym.ttf'):QFontDatabase.addApplicationFont('C:/Windows/Fonts/'+font)
app.setFont(QFont('Segoe UI',9))
out=site/'assets/native/panels';out.mkdir(parents=True,exist_ok=True)
refs={};info_refs={}
def raster(widget):
    for child in [widget,*widget.findChildren(QWidget)]:child.setAttribute(Qt.WA_UnderMouse,False)
    image=QImage(widget.width()*2,widget.height()*2,QImage.Format_RGBA8888)
    image.setDevicePixelRatio(2);image.fill(Qt.transparent)
    widget.render(image,QPoint(),QRegion(),QWidget.DrawChildren)
    return Image.frombytes('RGBA',(image.width(),image.height()),bytes(image.bits()))
def bounds(widget,host):
    point=widget.mapTo(host,QPoint(0,0))
    return dict(x=point.x(),y=point.y(),width=widget.width(),height=widget.height())

navigation=site/'assets/native/navigation';navigation.mkdir(exist_ok=True)
for key,title in {**TITLES,'application-info':'Application Info','home':'Home','menu':'Hide'}.items():
    body=GLYPHS[title]
    renderer=QSvgRenderer(('<svg xmlns="http://www.w3.org/2000/svg"><g id="glyph">'+body+'</g></svg>').encode())
    box=renderer.boundsOnElement('glyph');scale=GLYPH_EXTENT/max(box.width(),box.height());center=box.center()
    svg=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
         f'<g transform="translate(12 12) scale({scale}) translate({-center.x()} {-center.y()})" fill="none" stroke="currentColor" stroke-width="{STROKE_WIDTH/scale}" stroke-linecap="round" stroke-linejoin="round">'+body+'</g></svg>')
    (navigation/f'{key}.svg').write_text(svg,encoding='utf-8')

for theme,appearance in (('imprimatura','original'),('tenebrismo','void'),('pentimento','pentimento')):
    app.setProperty('artifacts_appearance',appearance);app.setProperty('artifacts_pentimento',appearance=='pentimento')
    app.setStyleSheet(application_stylesheet())
    appearance_icon(appearance).pixmap(QSize(128,128)).save(str(navigation/f'{theme}-suture.png'))
    host=QWidget();host.setProperty('artifactsEdition',edition_name());host.resize(240,820);layout=QVBoxLayout(host);layout.setContentsMargins(0,0,0,0);layout.setSpacing(0)
    colors=info_panel_colors(appearance=='pentimento')
    header=QLabel('Application Info',host);header.setFixedHeight(44)
    header.setStyleSheet(f'background:{colors["top"]};color:{colors["title"]};font:600 12px "Segoe UI";padding-left:24px;border:0')
    layout.addWidget(header)
    info=ApplicationInfoPanel(host,pentimento=appearance=='pentimento');layout.addWidget(info)
    host.show();app.processEvents();info.age_value.setText('');info._metadata_timer.stop()
    raster(host).save(out/f'{theme}-info.webp',quality=96)
    info_refs[theme]={'age':bounds(info.age_value,host),'ageColor':colors['link'],'website':bounds(info.website,host),'support':bounds(info.support,host)}
    host.hide()
    for mode in ('legacy','pentimento'):
        parent=QWidget();parent.setObjectName('pagesContainer');parent.setProperty('artifactsEdition',edition_name());parent.resize(1161,750)
        parent._load_legacy_mode_preference=lambda:mode=='legacy'
        home=HomeWidget(parent);home.setParent(parent);home.resize(1161,750);parent.show();home.show();app.processEvents();home.setPanelAnimationPaused(True)
        panel=home.details_panel;panel.setGraphicsEffect(None)
        for card in home._cards:
            key=f'{theme}-{mode}-{card.tab_key}'
            panel.set_module(card.tab_key,card.letters);panel.show();panel.ensurePolished();app.processEvents()
            panel.motion.setPaused(True);panel.preview_frame._timer.stop();panel.motion._phase=.45
            motion=panel.motion;refs[key]={'width':panel.width(),'height':panel.height(),'motion':bounds(motion,panel),'text':[]}
            styles=[]
            for label in panel.findChildren(QLabel):
                if not label.text() or not label.isVisible():continue
                box=bounds(label,panel);font=QFontInfo(label.font());alignment=label.alignment()
                refs[key]['text'].append({**box,'text':label.text(),'size':font.pixelSize(),'weight':int(label.font().weight()),'color':label.palette().color(QPalette.WindowText).name(),'align':'right' if alignment&Qt.AlignRight else 'center' if alignment&Qt.AlignHCenter else 'left','top':bool(alignment&Qt.AlignTop)})
                css=label.styleSheet();styles.append((label,css))
                original_style(label,css+(f'\nQLabel#{label.objectName()} {{color:transparent;}}' if '{' in css else ';color:transparent;'))
            # The category's stylesheet is reapplied by native polish. Blank
            # only its text while pinning the measured pill size for this render.
            category=panel.category_label;category_text=category.text()
            category_min,category_max=category.minimumSize(),category.maximumSize()
            category.setFixedSize(category.size());category.setText('')
            raster(panel).save(out/f'{key}.webp',quality=96)
            category.setText(category_text);category.setMinimumSize(category_min);category.setMaximumSize(category_max)
            for label,css in styles:original_style(label,css)
            frames=[]
            for frame in range(32):
                motion._phase=frame/32;frames.append(raster(motion))
            frames[0].save(out/f'{key}-motion.webp',save_all=True,append_images=frames[1:],duration=56,loop=0,quality=88)
            panel.hide()
        home.hide();home.deleteLater();parent.deleteLater();app.processEvents()
    host.deleteLater();app.processEvents()
(site/'content/panel-reference.json').write_text(json.dumps(refs,indent=2)+'\n',encoding='utf-8')
(site/'content/info-reference.json').write_text(json.dumps(info_refs,indent=2)+'\n',encoding='utf-8')
print(f'Exported {len(refs)} native panels and all three Application Info drawers.',flush=True)
