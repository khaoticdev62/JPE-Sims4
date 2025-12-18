from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QButtonGroup,
    QFrame,
    QHBoxLayout,
    QLabel,
    QListWidget,
    QListWidgetItem,
    QProgressBar,
    QScrollArea,
    QToolButton,
    QVBoxLayout,
    QWidget,
)

from jpe_sims4.project import Project
from jpe_sims4.workspace import compute_progress

from jpe_studio_qt.ui.components import CardFrame, H2, MaterialIcon, Muted, BadgeLabel, set_toolbutton_icon


@dataclass(frozen=True)
class ProjectSummary:
    name: str
    version: str
    progress: str
    translated_pct: int
    errors: int
    warnings: int


class ProjectDetailPage(QWidget):
    go_translate = Signal()
    go_files = Signal()
    go_build = Signal()
    open_entity = Signal(object)  # segment dict

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        root.addWidget(scroll, 1)

        host = QWidget()
        scroll.setWidget(host)
        l = QVBoxLayout(host)
        l.setContentsMargins(24, 24, 24, 24)
        l.setSpacing(14)

        # Header with title + actions.
        self.header = CardFrame(shadow=False)
        hl = QHBoxLayout(self.header)
        hl.setContentsMargins(12, 12, 12, 12)
        hl.setSpacing(12)
        self.title = QLabel("No project loaded")
        self.title.setProperty("role", "h2")
        self.title.setStyleSheet("font-weight: 800;")
        self.subtitle = Muted("")
        self.subtitle.setProperty("role", "caption")
        tcol = QVBoxLayout()
        tcol.setContentsMargins(0, 0, 0, 0)
        tcol.setSpacing(2)
        tcol.addWidget(self.title)
        tcol.addWidget(self.subtitle)
        hl.addLayout(tcol, 1)

        self.btn_sync = QToolButton()
        self.btn_sync.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_sync, "sync", size_px=18)
        hl.addWidget(self.btn_sync)

        self.btn_more = QToolButton()
        self.btn_more.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_more, "more_vert", size_px=18)
        hl.addWidget(self.btn_more)
        l.addWidget(self.header)

        # Segmented control (Summary / Diagnostics / Entities).
        seg_card = CardFrame(shadow=False)
        seg_card.setStyleSheet("background: rgba(255,255,255,0.04);")
        seg_l = QHBoxLayout(seg_card)
        seg_l.setContentsMargins(6, 6, 6, 6)
        seg_l.setSpacing(6)
        self._seg_group = QButtonGroup(self)
        self._seg_group.setExclusive(True)
        self.btn_summary = self._seg_btn("Summary", active=True)
        self.btn_diag = self._seg_btn("Diagnostics", active=False)
        self.btn_entities = self._seg_btn("Entities", active=False)
        for b in (self.btn_summary, self.btn_diag, self.btn_entities):
            seg_l.addWidget(b, 1)
        l.addWidget(seg_card)

        self._stack = QWidget()
        self._stack_l = QVBoxLayout(self._stack)
        self._stack_l.setContentsMargins(0, 0, 0, 0)
        self._stack_l.setSpacing(12)
        l.addWidget(self._stack)

        # Summary section.
        self.summary_card = self._build_summary_card()
        self._stack_l.addWidget(self.summary_card)

        # Diagnostics section.
        self.diag_card = self._build_diagnostics_card()
        self.diag_card.setVisible(False)
        self._stack_l.addWidget(self.diag_card)

        # Entities section.
        self.entities_card = self._build_entities_card()
        self.entities_card.setVisible(False)
        self._stack_l.addWidget(self.entities_card)

        l.addStretch(1)

        self._seg_group.buttonClicked.connect(self._on_segment_changed)

    def set_project(self, project: Project) -> None:
        self._project = project
        s = self._compute_summary(project)
        self.title.setText(s.name)
        self.subtitle.setText(f"{s.version} · {s.progress}")
        self.prog_bar.setValue(s.translated_pct)
        self.prog_label.setText(f"{s.progress} ({s.translated_pct}%)")
        self.err_badge.setText(f"Errors {s.errors}")
        self.warn_badge.setText(f"Warnings {s.warnings}")
        self._render_diagnostics()
        self._render_entities()

    def _seg_btn(self, text: str, *, active: bool) -> QToolButton:
        b = QToolButton()
        b.setText(text)
        b.setCheckable(True)
        b.setChecked(active)
        b.setStyleSheet(
            "border-radius: 10px; padding: 10px 12px;"
            + ("background: rgba(157,92,255,0.85); font-weight: 800;" if active else "background: transparent; color: rgba(255,255,255,0.70);")
        )
        self._seg_group.addButton(b)
        return b

    def _on_segment_changed(self) -> None:
        # Update button styles.
        for b in (self.btn_summary, self.btn_diag, self.btn_entities):
            is_on = b.isChecked()
            b.setStyleSheet(
                "border-radius: 10px; padding: 10px 12px;"
                + ("background: rgba(157,92,255,0.85); font-weight: 800;" if is_on else "background: transparent; color: rgba(255,255,255,0.70);")
            )

        self.summary_card.setVisible(self.btn_summary.isChecked())
        self.diag_card.setVisible(self.btn_diag.isChecked())
        self.entities_card.setVisible(self.btn_entities.isChecked())

    def _compute_summary(self, project: Project) -> ProjectSummary:
        name = str(getattr(project, "name", "") or "") or "Project"
        version = str(getattr(project, "version", "") or "") or "v1"
        prog = compute_progress(project.segments or [])
        pct = int(round((prog.translated / max(1, prog.total)) * 100))
        errors = sum(1 for d in (project.diagnostics or []) if str(d.get("severity") or "").upper() in {"FATAL", "ERROR"})
        warnings = sum(1 for d in (project.diagnostics or []) if str(d.get("severity") or "").upper() == "WARNING")
        return ProjectSummary(
            name=name,
            version=version,
            progress=f"{prog.translated}/{prog.total} translated",
            translated_pct=pct,
            errors=errors,
            warnings=warnings,
        )

    def _build_summary_card(self) -> QWidget:
        card = CardFrame(shadow=False)
        l = QVBoxLayout(card)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        l.addWidget(H2("Summary"))
        self.prog_label = Muted("0/0 translated (0%)")
        l.addWidget(self.prog_label)
        self.prog_bar = QProgressBar()
        self.prog_bar.setTextVisible(False)
        self.prog_bar.setFixedHeight(10)
        self.prog_bar.setRange(0, 100)
        self.prog_bar.setStyleSheet(
            "QProgressBar{border:1px solid rgba(255,255,255,0.10); border-radius: 6px; background: rgba(255,255,255,0.05);} "
            "QProgressBar::chunk{border-radius: 6px; background: #9d5cff;}"
        )
        l.addWidget(self.prog_bar)

        badges = QHBoxLayout()
        badges.setSpacing(10)
        # Use new BadgeLabel component
        self.err_badge = BadgeLabel("Errors 0", variant="error")
        self.warn_badge = BadgeLabel("Warnings 0", variant="warning")
        badges.addWidget(self.err_badge)
        badges.addWidget(self.warn_badge)
        badges.addStretch(1)
        l.addLayout(badges)

        actions = QHBoxLayout()
        actions.setSpacing(10)
        btn_files = QToolButton()
        btn_files.setObjectName("Primary")
        btn_files.setText("Files")
        btn_files.clicked.connect(self.go_files.emit)
        btn_translate = QToolButton()
        btn_translate.setObjectName("Primary")
        btn_translate.setText("Translate")
        btn_translate.clicked.connect(self.go_translate.emit)
        btn_build = QToolButton()
        btn_build.setObjectName("Primary")
        btn_build.setText("Build")
        btn_build.clicked.connect(self.go_build.emit)
        actions.addWidget(btn_files)
        actions.addWidget(btn_translate)
        actions.addWidget(btn_build)
        actions.addStretch(1)
        l.addLayout(actions)
        return card

    def _build_diagnostics_card(self) -> QWidget:
        card = CardFrame(shadow=False)
        l = QVBoxLayout(card)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        l.addWidget(H2("Diagnostics"))
        self.diag_list = QListWidget()
        l.addWidget(self.diag_list, 1)
        return card

    def _render_diagnostics(self) -> None:
        self.diag_list.clear()
        if not self._project:
            return
        rows = list(self._project.diagnostics or [])[:200]
        for d in rows:
            sev = str(d.get("severity") or "").upper()
            code = str(d.get("code") or "ISSUE")
            msg = str(d.get("message") or "")
            fp = str(d.get("file_path") or "")
            loc = str(d.get("location") or "")
            it = QListWidgetItem(f"{sev} {code}: {msg}  ·  {Path(fp).name}{(' · ' + loc) if loc else ''}".strip())
            self.diag_list.addItem(it)

    def _build_entities_card(self) -> QWidget:
        card = CardFrame(shadow=False)
        l = QVBoxLayout(card)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        l.addWidget(H2("Entities"))
        l.addWidget(Muted("Entity views will be wired once entity indexing is implemented; showing a segment-derived preview for now."))
        self.entities_list = QListWidget()
        self.entities_list.itemDoubleClicked.connect(self._open_selected_entity)
        l.addWidget(self.entities_list, 1)
        return card

    def _render_entities(self) -> None:
        self.entities_list.clear()
        if not self._project:
            return
        # Heuristic: show representative segments as “entities”.
        segs = list(self._project.segments or [])[:200]
        for s in segs:
            sid = str(s.get("id") or "")[:10]
            fp = Path(str(s.get("file_path") or "")).name
            src = str(s.get("source") or "").strip().replace("\n", " ")
            src = (src[:70] + "…") if len(src) > 70 else src
            it = QListWidgetItem(f"{sid} · {fp} · {src}")
            it.setData(Qt.UserRole, s)
            self.entities_list.addItem(it)

    def _open_selected_entity(self, it: QListWidgetItem) -> None:
        seg = it.data(Qt.UserRole)
        if isinstance(seg, dict):
            self.open_entity.emit(seg)
