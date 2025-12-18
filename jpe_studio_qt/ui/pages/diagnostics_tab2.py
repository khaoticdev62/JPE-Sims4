from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QToolButton,
    QVBoxLayout,
    QWidget,
)

from jpe_sims4.project import Project

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H2, MaterialIcon, Muted, set_toolbutton_icon
from jpe_studio_qt.ui.diagnostics_pane import GlobalDiagnosticsPane


@dataclass(frozen=True)
class _IssueRow:
    severity: str
    code: str
    message: str
    file_path: str
    location: str
    segment_id: str


class DiagnosticsTab2Page(QWidget):
    """
    Desktop diagnostics tab aligned to `JPE assets folder/diagnostics_tab_(global)`.

    The full-screen "global diagnostics pane" is available via the "Open Pane" action.
    """

    goto_segment = Signal(str)

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None
        self._rows: list[_IssueRow] = []
        self._chip = "ALL"  # ALL | ERROR | WARNING | INFO
        self._pane: GlobalDiagnosticsPane | None = None

        c = DESIGN.colors

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        header = QFrame()
        header.setStyleSheet("background: rgba(23,15,35,0.90); border-bottom: 1px solid rgba(255,255,255,0.06);")
        hl = QVBoxLayout(header)
        hl.setContentsMargins(18, 14, 18, 10)
        hl.setSpacing(10)

        top = QHBoxLayout()
        top.setSpacing(10)
        top.addWidget(H2("Global Diagnostics"))
        top.addStretch(1)

        self.btn_open_pane = QPushButton("Open Pane")
        self.btn_open_pane.setObjectName("Chip")
        self.btn_open_pane.clicked.connect(self._open_pane)
        top.addWidget(self.btn_open_pane)

        self.btn_share = QToolButton()
        self.btn_share.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_share, "ios_share", size_px=18)
        self.btn_share.setToolTip("Export diagnostics")
        top.addWidget(self.btn_share)

        self.btn_clear = QToolButton()
        self.btn_clear.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_clear, "delete", size_px=18)
        self.btn_clear.setToolTip("Clear diagnostics")
        self.btn_clear.clicked.connect(self._clear_diagnostics)
        top.addWidget(self.btn_clear)

        self.btn_fix_next = QPushButton("Fix Next")
        self.btn_fix_next.setObjectName("ChipActive")
        self.btn_fix_next.clicked.connect(self._fix_next)
        top.addWidget(self.btn_fix_next)

        hl.addLayout(top)

        chip_row = QHBoxLayout()
        chip_row.setSpacing(10)
        self.chip_all = self._chip_btn("All", kind="ALL", active=True, icon="tune", icon_color=c.primary)
        self.chip_err = self._chip_btn("Errors", kind="ERROR", active=False, icon="error", icon_color=c.error)
        self.chip_warn = self._chip_btn("Warnings", kind="WARNING", active=False, icon="warning", icon_color=c.warning)
        self.chip_info = self._chip_btn("Info", kind="INFO", active=False, icon="info", icon_color=c.primary)
        for b in (self.chip_all, self.chip_err, self.chip_warn, self.chip_info):
            chip_row.addWidget(b)
        chip_row.addStretch(1)
        hl.addLayout(chip_row)

        search_row = QHBoxLayout()
        search_row.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        self.search = QLineEdit()
        self.search.setPlaceholderText("Search issues, error codes, or files...")
        self.search.textChanged.connect(self._render)
        search_row.addWidget(self.search, 1)
        hl.addLayout(search_row)

        root.addWidget(header)

        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.NoFrame)
        root.addWidget(self.scroll, 1)

        self.host = QWidget()
        self.scroll.setWidget(self.host)
        self.list_layout = QVBoxLayout(self.host)
        self.list_layout.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 18px margins
        self.list_layout.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        self.list_layout.addStretch(1)

        self.summary = Muted("")
        self.summary.setStyleSheet(f"padding: 0px {DESIGN.spacing.lg}px;")  # 18px horizontal padding
        root.addWidget(self.summary)

    def set_project(self, project: Project) -> None:
        self._project = project
        self._rows = []
        for d in list(project.diagnostics or [])[:5000]:
            self._rows.append(
                _IssueRow(
                    severity=str(d.get("severity") or "").upper(),
                    code=str(d.get("code") or ""),
                    message=str(d.get("message") or ""),
                    file_path=str(d.get("file_path") or ""),
                    location=str(d.get("location") or ""),
                    segment_id=str(d.get("segment_id") or ""),
                )
            )
        self._render()

    def _chip_btn(self, text: str, *, kind: str, active: bool, icon: str, icon_color: str) -> QPushButton:
        b = QPushButton(text)
        b.setCursor(Qt.PointingHandCursor)
        b.setCheckable(True)
        b.setChecked(active)
        b.setObjectName("ChipActive" if active else "Chip")
        b.clicked.connect(lambda: self._set_chip(kind))
        # Leading icon
        ic = MaterialIcon(icon, size_px=18)
        ic.setParent(b)
        ic.move(10, 7)
        ic.setStyleSheet(f"color: {icon_color};")
        b.setContentsMargins(34, 0, 10, 0)
        return b

    def _set_chip(self, kind: str) -> None:
        self._chip = kind
        mapping = {"ALL": self.chip_all, "ERROR": self.chip_err, "WARNING": self.chip_warn, "INFO": self.chip_info}
        for k, btn in mapping.items():
            btn.setObjectName("ChipActive" if k == kind else "Chip")
            btn.style().unpolish(btn)
            btn.style().polish(btn)
            btn.setChecked(k == kind)
        self._render()

    def _filtered(self) -> list[_IssueRow]:
        q = self.search.text().strip().lower()
        out: list[_IssueRow] = []
        for r in self._rows:
            sev = r.severity
            if self._chip == "ERROR" and sev not in {"FATAL", "ERROR"}:
                continue
            if self._chip == "WARNING" and sev != "WARNING":
                continue
            if self._chip == "INFO" and sev != "INFO":
                continue
            if q:
                hay = f"{sev} {r.code} {r.message} {r.file_path} {r.location}".lower()
                if q not in hay:
                    continue
            out.append(r)
        return out

    def _render(self) -> None:
        # counts
        err_n = sum(1 for r in self._rows if r.severity in {"FATAL", "ERROR"})
        warn_n = sum(1 for r in self._rows if r.severity == "WARNING")
        info_n = sum(1 for r in self._rows if r.severity == "INFO")
        self.chip_all.setText(f"All {len(self._rows)}")
        self.chip_err.setText(f"Errors {err_n}")
        self.chip_warn.setText(f"Warnings {warn_n}")
        self.chip_info.setText(f"Info {info_n}")

        # clear list
        while self.list_layout.count() > 1:
            it = self.list_layout.takeAt(0)
            w = it.widget()
            if w is not None:
                w.setParent(None)

        if not self._project:
            self.summary.setText("No project loaded.")
            return

        rows = self._filtered()
        self.summary.setText(f"Visible: {len(rows)} of {len(self._rows)}")
        if not rows:
            self.list_layout.insertWidget(0, Muted("No issues match the current filter."))
            return

        # Simple grouping header like the asset; we treat all as "Today" for now.
        grp = QLabel("TODAY")
        grp.setStyleSheet("font-size: 9pt; font-weight: 900; letter-spacing: 2px; color: rgba(255,255,255,0.35); padding: 6px 2px;")
        self.list_layout.insertWidget(self.list_layout.count() - 1, grp)

        for r in rows[:250]:
            self.list_layout.insertWidget(self.list_layout.count() - 1, self._row_widget(r))

    def _row_widget(self, r: _IssueRow) -> QWidget:
        btn = QPushButton()
        btn.setCursor(Qt.PointingHandCursor)
        btn.setObjectName("CardButton")
        btn.clicked.connect(lambda _c=False, sid=r.segment_id: self.goto_segment.emit(str(sid or "")))
        btn.setStyleSheet(
            "QPushButton{padding: 14px; border-radius: 16px; text-align:left;"
            "background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);}"
            "QPushButton:hover{background: rgba(255,255,255,0.04); border-color: rgba(157,92,255,0.16);}"
        )
        l = QHBoxLayout(btn)
        l.setContentsMargins(0, 0, 0, 0)
        l.setSpacing(12)

        sev = r.severity
        icon_name = "info"
        icon_color = DESIGN.colors.primary
        if sev in {"FATAL", "ERROR"}:
            icon_name = "error"
            icon_color = DESIGN.colors.error
        elif sev == "WARNING":
            icon_name = "warning"
            icon_color = DESIGN.colors.warning
        bubble = QFrame()
        bubble.setFixedSize(44, 44)
        bubble.setStyleSheet("border-radius: 14px; background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.06);")
        bl = QHBoxLayout(bubble)
        bl.setContentsMargins(0, 0, 0, 0)
        ic = MaterialIcon(icon_name, size_px=22)
        ic.setStyleSheet(f"color: {icon_color};")
        bl.addWidget(ic, 0, Qt.AlignCenter)
        l.addWidget(bubble)

        col = QVBoxLayout()
        col.setContentsMargins(0, 0, 0, 0)
        col.setSpacing(3)
        title = QLabel(r.message or r.code or "Diagnostic")
        title.setStyleSheet("font-size: 11pt; font-weight: 900;")
        col.addWidget(title)
        fp = Path(r.file_path).name if r.file_path else ""
        meta = Muted(fp)
        meta.setProperty("role", "mono")
        meta.setStyleSheet("font-size: 9pt;")
        col.addWidget(meta)
        detail = Muted(r.code or "")
        detail.setStyleSheet("font-size: 9pt; color: rgba(255,255,255,0.55);")
        col.addWidget(detail)
        l.addLayout(col, 1)

        l.addWidget(MaterialIcon("chevron_right", size_px=22))
        return btn

    def _open_pane(self) -> None:
        if not self._project:
            return
        if self._pane is None:
            self._pane = GlobalDiagnosticsPane(self)
        try:
            self._pane.set_project(self._project)
        except Exception:
            return
        self._pane.exec()

    def _fix_next(self) -> None:
        rows = self._filtered()
        for r in rows:
            if str(r.segment_id or "").strip():
                self.goto_segment.emit(str(r.segment_id))
                return

    def _clear_diagnostics(self) -> None:
        if not self._project:
            return
        try:
            self._project.diagnostics = []  # type: ignore[assignment]
        except Exception:
            return
        self._rows = []
        self._render()

