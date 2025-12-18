from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QDialog,
    QFrame,
    QHBoxLayout,
    QLabel,
    QListWidget,
    QListWidgetItem,
    QPushButton,
    QScrollArea,
    QTabWidget,
    QToolButton,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.ui.components import CardFrame, H2, Muted, set_toolbutton_icon


@dataclass(frozen=True)
class EntityRef:
    kind: str
    display_name: str
    file_path: str
    location: str
    source_preview: str


class EntityDetailDialog(QDialog):
    open_full_editor = Signal(object)  # EntityRef

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setModal(True)
        self.setWindowTitle("Entity Inspector")
        self.setMinimumWidth(840)
        self.setMinimumHeight(720)

        self._entity: EntityRef | None = None

        root = QVBoxLayout(self)
        root.setContentsMargins(16, 16, 16, 16)
        root.setSpacing(12)

        # Top bar (Inspector).
        top = QHBoxLayout()
        top.setSpacing(10)
        btn_back = QToolButton()
        btn_back.setObjectName("IconButton")
        set_toolbutton_icon(btn_back, "arrow_back", size_px=18)
        btn_back.clicked.connect(self.reject)
        top.addWidget(btn_back)
        lab = QLabel("Inspector")
        lab.setStyleSheet("font-size: 9pt; letter-spacing: 2px; color: rgba(255,255,255,0.55); font-weight: 800;")
        top.addWidget(lab)
        top.addStretch(1)
        self.btn_pin = QToolButton()
        self.btn_pin.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_pin, "push_pin", size_px=18)
        top.addWidget(self.btn_pin)
        root.addLayout(top)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        root.addWidget(scroll, 1)

        host = QWidget()
        scroll.setWidget(host)
        l = QVBoxLayout(host)
        l.setContentsMargins(0, 0, 0, 0)
        l.setSpacing(14)

        # Identity section.
        self.identity = CardFrame(shadow=False)
        il = QVBoxLayout(self.identity)
        il.setContentsMargins(12, 12, 12, 12)
        il.setSpacing(10)
        self.badges = QHBoxLayout()
        self.badges.setSpacing(8)
        self.badge_kind = QLabel("ENTITY")
        self.badge_kind.setStyleSheet(
            "padding: 3px 8px; border-radius: 8px; font-size: 9pt; font-weight: 900;"
            "background: rgba(149,81,251,0.18); color: #9551fb; border: 1px solid rgba(149,81,251,0.20);"
        )
        self.badge_source = QLabel("JPE Core")
        self.badge_source.setStyleSheet(
            "padding: 3px 8px; border-radius: 8px; font-size: 9pt; font-weight: 800;"
            "background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.75); border: 1px solid rgba(255,255,255,0.08);"
        )
        self.badges.addWidget(self.badge_kind)
        self.badges.addWidget(self.badge_source)
        self.badges.addStretch(1)
        il.addLayout(self.badges)
        self.entity_title = QLabel("No entity selected")
        self.entity_title.setStyleSheet("font-size: 18pt; font-weight: 900;")
        il.addWidget(self.entity_title)
        self.entity_ids = Muted("")
        self.entity_ids.setStyleSheet("font-family: Consolas; font-size: 9pt;")
        il.addWidget(self.entity_ids)
        l.addWidget(self.identity)

        # Tabs (Overview / Resources / Diagnostics).
        self.tabs = QTabWidget()
        self.tabs.addTab(self._tab_overview(), "Overview")
        self.tabs.addTab(self._tab_resources(), "Resources")
        self.tabs.addTab(self._tab_diagnostics(), "Diagnostics")
        l.addWidget(self.tabs)

        # Bottom action bar.
        actions = QHBoxLayout()
        self.btn_jump = QPushButton("Jump to Related")
        self.btn_jump.setObjectName("Chip")
        actions.addWidget(self.btn_jump)
        self.btn_open_editor = QPushButton("Open Full Editor")
        self.btn_open_editor.setObjectName("Primary")
        self.btn_open_editor.clicked.connect(self._emit_open_editor)
        actions.addWidget(self.btn_open_editor, 1)
        root.addLayout(actions)

    def set_entity(self, entity: EntityRef) -> None:
        self._entity = entity
        self.badge_kind.setText(entity.kind.upper())
        self.entity_title.setText(entity.display_name or "(unnamed)")
        fp = Path(entity.file_path).name if entity.file_path else ""
        self.entity_ids.setText(f"{fp} · {entity.location}".strip(" ·"))
        self._overview_text.setText(entity.source_preview)
        self._resources_list.clear()
        for name in ["icon.png", "clip_header", "stbl_key"]:
            self._resources_list.addItem(QListWidgetItem(name))
        self._diag_list.clear()
        self._diag_list.addItem(QListWidgetItem("WARNING: Missing string table key (preview)"))

    def _emit_open_editor(self) -> None:
        if self._entity is None:
            return
        self.open_full_editor.emit(self._entity)

    def _tab_overview(self) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        l.addWidget(H2("Properties"))
        self._overview_text = QLabel("")
        self._overview_text.setWordWrap(True)
        self._overview_text.setObjectName("Muted")
        l.addWidget(self._overview_text)
        l.addStretch(1)
        return w

    def _tab_resources(self) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        l.addWidget(H2("Linked Resources"))
        self._resources_list = QListWidget()
        l.addWidget(self._resources_list, 1)
        return w

    def _tab_diagnostics(self) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        l.addWidget(H2("Diagnostics"))
        self._diag_list = QListWidget()
        l.addWidget(self._diag_list, 1)
        return w
