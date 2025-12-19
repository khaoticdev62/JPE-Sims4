from __future__ import annotations

from pathlib import Path

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QScrollArea,
    QSizePolicy,
    QToolButton,
    QVBoxLayout,
    QWidget,
)

from jpe_sims4.project import Project

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H2, MaterialIcon, Muted, ToggleSwitch, set_toolbutton_icon


class Settings2Page(QWidget):
    """
    Desktop settings aligned to `JPE assets folder/global_settings_2`.

    This is a "full shell" page with a sticky header and card sections.
    """

    apply_settings = Signal(dict)
    request_back = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setProperty("full_shell", True)
        self._project: Project | None = None

        c = DESIGN.colors

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        self.setStyleSheet(f"background: {c.background};")

        header = QFrame()
        header.setFixedHeight(64)  # Stitch spec: Header 64px fixed (was setMinimumHeight)
        header.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
        header.setStyleSheet(
            "background: rgba(23,15,35,0.90);"
            "border-bottom: 1px solid rgba(255,255,255,0.06);"
        )
        hl = QHBoxLayout(header)
        hl.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.sm, DESIGN.spacing.lg, DESIGN.spacing.sm)  # 18,10,18,10px margins
        hl.setSpacing(DESIGN.spacing.md)  # 12px spacing

        self.btn_back = QToolButton()
        self.btn_back.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_back, "arrow_back", size_px=18)
        self.btn_back.clicked.connect(self.request_back.emit)
        hl.addWidget(self.btn_back)

        title = QLabel("Global Settings")
        title.setStyleSheet("font-size: 14pt; font-weight: 900;")
        hl.addWidget(title)
        hl.addStretch(1)

        self.save_hint = QLabel("Changes autosaved")
        self.save_hint.setStyleSheet("font-size: 9pt; color: rgba(255,255,255,0.50);")
        hl.addWidget(self.save_hint)

        self.btn_save = QPushButton("Save Changes")
        self.btn_save.setObjectName("Primary")
        self.btn_save.setFixedHeight(40)  # Stitch spec: Save button 40px height
        self.btn_save.clicked.connect(self._emit_apply)
        hl.addWidget(self.btn_save)
        root.addWidget(header)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        root.addWidget(scroll, 1)

        host = QWidget()
        scroll.setWidget(host)
        l = QVBoxLayout(host)
        l.setContentsMargins(DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl)  # 24px margins
        l.setSpacing(DESIGN.spacing.md)  # 14px spacing

        # General & Appearance
        general = CardFrame(shadow=False)
        general.setStyleSheet("border-radius: 16px;")
        gl = QVBoxLayout(general)
        gl.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 16px margins
        gl.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        hdr = QHBoxLayout()
        hdr.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        hdr.addWidget(MaterialIcon("tune", size_px=20))
        hdr.addWidget(H2("General & Appearance"))
        hdr.addStretch(1)
        gl.addLayout(hdr)

        gl.addWidget(self._nav_row("App Theme", "dark_mode", value="Dark Mode (Default)"))
        gl.addWidget(self._nav_row("App Language", "translate", value="English (US)"))

        gl.addWidget(self._toggle_row("Autosave on Edit", "Save changes immediately without confirmation", checked=True))
        gl.addWidget(self._toggle_row("Telemetry", "Send anonymous usage data to help improve JPE", checked=False, key="telemetry"))
        l.addWidget(general)

        # Paths & Tooling
        paths = CardFrame(shadow=False)
        pl = QVBoxLayout(paths)
        pl.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 16px margins
        pl.setSpacing(DESIGN.spacing.md)  # 12px spacing
        ph = QHBoxLayout()
        ph.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        ph.addWidget(MaterialIcon("folder_managed", size_px=20))
        ph.addWidget(H2("Paths & Tooling"))
        ph.addStretch(1)
        auto_scan = QPushButton("Auto-Scan")
        auto_scan.setObjectName("Chip")
        ph.addWidget(auto_scan)
        pl.addLayout(ph)

        self.sims_path = self._path_field("Sims 4 Installation", placeholder="C:\\Program Files\\EA Games\\The Sims 4")
        self.cache_path = self._path_field("Data Cache Path", placeholder=str(Path.home() / "AppData" / "Roaming" / "JPE" / "Cache"))
        self.build_out = self._path_field("Build Output Folder", placeholder=str(Path.cwd() / "build" / "dist"))
        pl.addWidget(self.sims_path)
        pl.addWidget(self.cache_path)
        pl.addWidget(self.build_out)
        l.addWidget(paths)

        # Cloud / Sync (stub for now)
        sync = CardFrame(shadow=False)
        sl = QVBoxLayout(sync)
        sl.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 16px margins
        sl.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        sh = QHBoxLayout()
        sh.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        sh.addWidget(MaterialIcon("cloud", size_px=20))
        sh.addWidget(H2("Cloud / Sync"))
        sh.addStretch(1)
        sl.addLayout(sh)
        row = QHBoxLayout()
        row.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        status = QLabel("Sync Active")
        status.setStyleSheet("font-weight: 700; color: #22c55e;")
        row.addWidget(status)
        row.addStretch(1)
        force = QPushButton("Force Sync Now")
        force.setObjectName("Primary")
        row.addWidget(force)
        sl.addLayout(row)
        sl.addWidget(Muted("Sync settings will be wired once remote sources are enabled."))
        l.addWidget(sync)

        # Plugin settings (stub)
        plugins = CardFrame(shadow=False)
        ppl = QVBoxLayout(plugins)
        ppl.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 16px margins
        ppl.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        ppl.addWidget(H2("Plugin Settings"))
        btn_defaults = QPushButton("Global Plugin Defaults")
        btn_defaults.setObjectName("Chip")
        ppl.addWidget(btn_defaults, 0, Qt.AlignLeft)
        reset = QPushButton("Reset All To Defaults")
        reset.setObjectName("Chip")
        ppl.addWidget(reset, 0, Qt.AlignLeft)
        l.addWidget(plugins)

        l.addStretch(1)

    def set_project(self, project: Project) -> None:
        self._project = project
        try:
            # Project-specific values will override placeholders when present.
            src = str(project.source_path or "")
            if src:
                self.save_hint.setText("Project settings loaded")
        except Exception:
            return

    def _nav_row(self, title: str, icon_name: str, *, value: str) -> QWidget:
        row = QPushButton()
        row.setCursor(Qt.PointingHandCursor)
        row.setObjectName("CardButton")
        row.setStyleSheet(
            "QPushButton{padding: 12px; border-radius: 14px; text-align:left;"
            "background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);}"
            "QPushButton:hover{background: rgba(255,255,255,0.04); border-color: rgba(134,56,250,0.18);}"  # Stitch spec: #8638fa color (was #9d5cff)
        )
        l = QHBoxLayout(row)
        l.setContentsMargins(0, 0, 0, 0)
        l.setSpacing(DESIGN.spacing.md)  # 12px spacing
        bubble = QFrame()
        bubble.setFixedSize(38, 38)
        bubble.setStyleSheet("border-radius: 19px; background: rgba(0,0,0,0.22); border: 1px solid rgba(255,255,255,0.06);")
        bl = QHBoxLayout(bubble)
        bl.setContentsMargins(0, 0, 0, 0)
        bl.addWidget(MaterialIcon(icon_name, size_px=18), 0, Qt.AlignCenter)
        l.addWidget(bubble)
        col = QVBoxLayout()
        col.setContentsMargins(0, 0, 0, 0)
        col.setSpacing(2)
        h = QLabel(title)
        h.setStyleSheet("font-weight: 800;")
        col.addWidget(h)
        col.addWidget(Muted(value))
        l.addLayout(col, 1)
        l.addWidget(MaterialIcon("chevron_right", size_px=18))
        return row

    def _toggle_row(self, title: str, desc: str, *, checked: bool, key: str | None = None) -> QWidget:
        row = QFrame()
        row.setFixedHeight(56)  # Stitch spec: Setting rows 56px height
        rl = QHBoxLayout(row)
        rl.setContentsMargins(DESIGN.spacing.xs, DESIGN.spacing.sm, DESIGN.spacing.xs, DESIGN.spacing.sm)  # 8,10,8,10px margins
        rl.setSpacing(DESIGN.spacing.md)  # 12px spacing
        col = QVBoxLayout()
        col.setContentsMargins(0, 0, 0, 0)
        col.setSpacing(DESIGN.spacing.xxs)  # 2px spacing
        h = QLabel(title)
        h.setStyleSheet("font-weight: 800;")
        col.addWidget(h)
        col.addWidget(Muted(desc))
        rl.addLayout(col, 1)
        sw = ToggleSwitch(checked=checked)
        if key:
            sw.setProperty("setting_key", key)
        rl.addWidget(sw)
        return row

    def _path_field(self, label: str, *, placeholder: str) -> QWidget:
        outer = QWidget()
        l = QVBoxLayout(outer)
        l.setContentsMargins(0, 0, 0, 0)
        l.setSpacing(DESIGN.spacing.xs)  # 6px spacing
        lbl = QLabel(label)
        lbl.setStyleSheet("font-weight: 700; color: rgba(255,255,255,0.70);")
        l.addWidget(lbl)

        wrap = QFrame()
        wrap.setStyleSheet(
            "background: rgba(0,0,0,0.18);"
            "border: 1px solid rgba(255,255,255,0.07);"
            "border-radius: 12px;"
        )
        wl = QHBoxLayout(wrap)
        wl.setContentsMargins(DESIGN.spacing.md, DESIGN.spacing.xs, DESIGN.spacing.sm, DESIGN.spacing.xs)  # 12,8,10,8px margins
        wl.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        ok = MaterialIcon("check_circle", size_px=18)
        ok.setStyleSheet("color: #22c55e;")
        wl.addWidget(ok)
        inp = QLineEdit()
        inp.setReadOnly(True)
        inp.setText(placeholder)
        inp.setStyleSheet("border: none; background: transparent; font-family: Consolas;")
        wl.addWidget(inp, 1)
        btn = QToolButton()
        btn.setObjectName("IconButton")
        set_toolbutton_icon(btn, "folder_open", size_px=18)
        wl.addWidget(btn)
        l.addWidget(wrap)
        return outer

    def _emit_apply(self) -> None:
        # Keep payload minimal and forward-compatible.
        self.apply_settings.emit({})

