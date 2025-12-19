from __future__ import annotations

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QScrollArea,
    QSplitter,
    QTabWidget,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H2, MaterialIcon, Muted


class EntityJpeViewPage(QWidget):
    """
    Entity JPE view page aligned to `JPE assets folder/entity_jpe_view`.
    
    This page displays entity details in JPE format with syntax highlighting.
    """

    back_requested = Signal()

    def __init__(self) -> None:
        super().__init__()

        c = DESIGN.colors

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Header section
        header = QFrame()
        header.setObjectName("Card")
        header.setFixedHeight(80)
        hl = QHBoxLayout(header)
        hl.setContentsMargins(20, 16, 20, 16)
        hl.setSpacing(12)

        # Back button
        back_btn = QLabel("← Back")
        back_btn.setStyleSheet("font-size: 11pt; color: #8638fa; cursor: pointer; padding: 6px 12px;")
        back_btn.setProperty("role", "clickable")
        back_btn.mousePressEvent = lambda e: self.back_requested.emit()  # type: ignore[method-assign]
        hl.addWidget(back_btn)

        # Title
        title = H2("Entity JPE View")
        title.setStyleSheet("font-weight: 600;")
        hl.addWidget(title)
        hl.addStretch(1)

        # Entity ID/Status
        status_badge = QLabel("ENTITY_001")
        status_badge.setProperty("role", "badge")
        status_badge.setProperty("variant", "primary")
        status_badge.setStyleSheet(
            "padding: 4px 10px; border-radius: 10px; font-size: 9pt; font-weight: 700;"
            "background: rgba(157,92,255,0.14); color: #8638fa; border: 1px solid rgba(157,92,255,0.20);"
        )
        hl.addWidget(status_badge)

        root.addWidget(header)

        # Main content area
        content = QSplitter(Qt.Horizontal)
        content.setStyleSheet(f"background: {c.background};")

        # Left panel - Entity metadata
        left_panel = self._create_left_panel()
        content.addWidget(left_panel)

        # Right panel - JPE code view
        right_panel = self._create_right_panel()
        content.addWidget(right_panel)

        # Set initial sizes (60% left, 40% right)
        content.setSizes([int(self.width() * 0.6), int(self.width() * 0.4)])

        root.addWidget(content, 1)

    def _create_left_panel(self) -> QWidget:
        """Create the left panel with entity metadata."""
        panel = QWidget()
        panel_l = QVBoxLayout(panel)
        panel_l.setContentsMargins(0, 0, 0, 0)
        panel_l.setSpacing(16)

        # Entity metadata section
        meta_card = CardFrame(shadow=False)
        meta_l = QVBoxLayout(meta_card)
        meta_l.setContentsMargins(16, 16, 16, 16)
        meta_l.setSpacing(12)

        meta_title = H2("Entity Metadata")
        meta_title.setStyleSheet("font-weight: 600;")
        meta_l.addWidget(meta_title)

        # Metadata grid
        meta_grid = QVBoxLayout()
        meta_grid.setSpacing(8)

        meta_items = [
            ("Entity ID", "ENTITY_001"),
            ("Type", "String"),
            ("Status", "Translated"),
            ("Created", "2023-07-15 14:30:45"),
            ("Modified", "2023-12-10 09:15:22"),
            ("Source Language", "English"),
            ("Target Language", "Spanish"),
            ("Source Text", "Hello, world!"),
            ("Target Text", "¡Hola, mundo!")
        ]

        for label, value in meta_items:
            row = self._create_meta_row(label, value)
            meta_grid.addWidget(row)

        meta_l.addLayout(meta_grid)
        panel_l.addWidget(meta_card)

        # References section
        refs_card = CardFrame(shadow=False)
        refs_l = QVBoxLayout(refs_card)
        refs_l.setContentsMargins(16, 16, 16, 16)
        refs_l.setSpacing(12)

        refs_title = H2("References")
        refs_title.setStyleSheet("font-weight: 600;")
        refs_l.addWidget(refs_title)

        refs_list = [
            ("File", "main.xml", "location_on"),
            ("Line", "245", "tag"),
            ("Context", "Greeting message", "info")
        ]

        for label, value, icon in refs_list:
            row = self._create_ref_row(label, value, icon)
            refs_l.addWidget(row)

        panel_l.addWidget(refs_card)

        # Notes section
        notes_card = CardFrame(shadow=False)
        notes_l = QVBoxLayout(notes_card)
        notes_l.setContentsMargins(16, 16, 16, 16)
        notes_l.setSpacing(12)

        notes_title = H2("Notes")
        notes_title.setStyleSheet("font-weight: 600;")
        notes_l.addWidget(notes_title)

        notes_text = QTextEdit()
        notes_text.setPlainText("This is a greeting message that appears on the main screen.\nConsider cultural context when translating.")
        notes_text.setMaximumHeight(120)
        notes_text.setStyleSheet("""
            background: rgba(24,16,35,0.70);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            padding: 10px;
            font-size: 10pt;
        """)
        notes_l.addWidget(notes_text)

        panel_l.addWidget(notes_card)

        panel_l.addStretch(1)
        return panel

    def _create_right_panel(self) -> QWidget:
        """Create the right panel with JPE code view."""
        panel = QWidget()
        panel_l = QVBoxLayout(panel)
        panel_l.setContentsMargins(0, 0, 0, 0)
        panel_l.setSpacing(12)

        # Tabs for different views
        tabs = QTabWidget()
        tabs.setStyleSheet("""
            QTabWidget::pane { border: none; }
            QTabBar::tab { 
                background: transparent; 
                padding: 10px 16px; 
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            QTabBar::tab:selected { 
                background: rgba(134, 56, 250, 0.15); 
                color: #8638fa;
                border-bottom: 2px solid #8638fa;
            }
            QTabBar::tab:!selected { 
                color: rgba(255, 255, 255, 0.55); 
            }
        """)

        # JPE view tab
        jpe_widget = self._create_jpe_view()
        tabs.addTab(jpe_widget, "JPE Format")

        # XML view tab
        xml_widget = self._create_xml_view()
        tabs.addTab(xml_widget, "XML Source")

        # Raw view tab
        raw_widget = self._create_raw_view()
        tabs.addTab(raw_widget, "Raw Data")

        panel_l.addWidget(tabs)

        # Actions section
        actions_card = CardFrame(shadow=False)
        actions_l = QHBoxLayout(actions_card)
        actions_l.setContentsMargins(16, 12, 16, 12)
        actions_l.setSpacing(12)

        copy_btn = QLabel("Copy JPE")
        copy_btn.setStyleSheet("font-size: 10pt; color: #8638fa; cursor: pointer; padding: 6px 12px;")
        copy_btn.setProperty("role", "clickable")

        export_btn = QLabel("Export")
        export_btn.setStyleSheet("font-size: 10pt; color: #8638fa; cursor: pointer; padding: 6px 12px;")
        export_btn.setProperty("role", "clickable")

        validate_btn = QLabel("Validate")
        validate_btn.setStyleSheet("font-size: 10pt; color: #8638fa; cursor: pointer; padding: 6px 12px;")
        validate_btn.setProperty("role", "clickable")

        actions_l.addWidget(copy_btn)
        actions_l.addWidget(export_btn)
        actions_l.addWidget(validate_btn)
        actions_l.addStretch(1)

        panel_l.addWidget(actions_card)

        return panel

    def _create_jpe_view(self) -> QWidget:
        """Create the JPE format view."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)

        editor = QTextEdit()
        editor.setPlainText("""{
  "entityId": "ENTITY_001",
  "type": "string",
  "status": "translated",
  "source": {
    "language": "en-US",
    "text": "Hello, world!"
  },
  "target": {
    "language": "es-ES",
    "text": "¡Hola, mundo!"
  },
  "metadata": {
    "created": "2023-07-15T14:30:45Z",
    "modified": "2023-12-10T09:15:22Z",
    "context": "Greeting message"
  },
  "references": [
    {
      "file": "main.xml",
      "line": 245,
      "type": "string_table"
    }
  ]
}""")
        editor.setStyleSheet("""
            background: #0d0914;
            color: #e0e0e0;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            padding: 12px;
            font-family: 'JetBrains Mono';
            font-size: 10pt;
            line-height: 1.4;
        """)
        layout.addWidget(editor)

        return widget

    def _create_xml_view(self) -> QWidget:
        """Create the XML source view."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)

        editor = QTextEdit()
        editor.setPlainText("""<?xml version="1.0" encoding="utf-8"?>
<SimData version="0x00000101" u="0x00000000">
  <Instances>
    <I name="main_strings" type="Test">
      <T name="greeting" type="string">Hello, world!</T>
    </I>
  </Instances>
</SimData>""")
        editor.setStyleSheet("""
            background: #0d0914;
            color: #e0e0e0;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            padding: 12px;
            font-family: 'JetBrains Mono';
            font-size: 10pt;
            line-height: 1.4;
        """)
        layout.addWidget(editor)

        return widget

    def _create_raw_view(self) -> QWidget:
        """Create the raw data view."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)

        editor = QTextEdit()
        editor.setPlainText("""Entity ID: ENTITY_001
Type: string
Status: translated
Source Language: en-US
Source Text: Hello, world!
Target Language: es-ES
Target Text: ¡Hola, mundo!
Created: 2023-07-15T14:30:45Z
Modified: 2023-12-10T09:15:22Z
Context: Greeting message
File: main.xml
Line: 245
""")
        editor.setStyleSheet("""
            background: #0d0914;
            color: #e0e0e0;
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            padding: 12px;
            font-family: 'JetBrains Mono';
            font-size: 10pt;
            line-height: 1.4;
        """)
        layout.addWidget(editor)

        return widget

    def _create_meta_row(self, label: str, value: str) -> QWidget:
        """Create a metadata row."""
        row = QWidget()
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(0, 0, 0, 0)
        row_l.setSpacing(12)

        label_lbl = QLabel(label)
        label_lbl.setStyleSheet("font-weight: 600; color: rgba(255,255,255,0.7); min-width: 120px;")
        value_lbl = QLabel(value)
        value_lbl.setStyleSheet("font-family: 'JetBrains Mono'; color: rgba(255,255,255,0.9);")

        row_l.addWidget(label_lbl)
        row_l.addWidget(value_lbl, 1)

        return row

    def _create_ref_row(self, label: str, value: str, icon: str) -> QWidget:
        """Create a reference row."""
        row = QWidget()
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(0, 0, 0, 0)
        row_l.setSpacing(10)

        icon_lbl = MaterialIcon(icon, size_px=16)
        icon_lbl.setStyleSheet("color: #4cc9f0;")
        row_l.addWidget(icon_lbl)

        label_lbl = QLabel(label)
        label_lbl.setStyleSheet("font-weight: 600; color: rgba(255,255,255,0.7);")
        value_lbl = QLabel(value)
        value_lbl.setStyleSheet("font-family: 'JetBrains Mono'; color: rgba(255,255,255,0.9);")

        row_l.addWidget(label_lbl)
        row_l.addStretch(1)
        row_l.addWidget(value_lbl)

        return row