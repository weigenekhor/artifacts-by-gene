"""The desktop's shared stylesheet/palette routing for isolated Qt exports."""
from PySide6.QtWidgets import QWidget,QScrollBar
from widgets.edition_theme import dual_qss,edition_palette,scrollbar_stylesheet

original_style=QWidget.setStyleSheet
original_palette=QWidget.setPalette
def style(widget,value):
    if isinstance(widget,QScrollBar):value=scrollbar_stylesheet(value)
    elif value and not widget.property('artifactsPreserveAppearance'):value=dual_qss(value)
    original_style(widget,value)
def palette(widget,value):
    original_palette(widget,value if widget.property('artifactsPreserveAppearance') else edition_palette(value))
QWidget.setStyleSheet=style
QWidget.setPalette=palette
