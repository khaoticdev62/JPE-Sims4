from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont
from PySide6.QtWidgets import (
    QButtonGroup,
    QFrame,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QProgressBar,
    QSplitter,
    QToolButton,
    QTreeWidget,
    QTreeWidgetItem,
    QVBoxLayout,
    QWidget,
)

from jpe_sims4.project import Project

from jpe_studio_qt.ui.code_editor import CodeEditor
from jpe_studio_qt.ui.components import H2, Muted, set_toolbutton_icon


@dataclass(frozen=True)
class _ExplorerColors:
    primary: str = "#9d5cff"  # Updated to match design system
    primary_hover: str = "#b584ff"  # Updated to match design system
    background: str = "#171022"
    surface: str = "#231b2e"
    surface_highlight: str = "#322249"
    sidebar_bg: str = "#1c1427"
    border_rgba: str = "rgba(255,255,255,0.08)"  # token: #ffffff15


COL = _ExplorerColors()


class Explorer2Page(QWidget):
    """
    Desktop Explorer screen aligned to `JPE assets folder/project_explorer_2`.

    This page is intentionally "full-bleed" and uses per-page styling tokens to match
    the asset even when embedded in the app shell.
    """

    request_build = Signal()
    request_translate = Signal()
    request_settings = Signal()

    def __init__(self) -> None:
        super().__init__()
        self.setProperty("full_shell", True)
        self._project: Project | None = None
        self._selected_rel_path: str | None = None

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        self.setStyleSheet(f"background: {COL.background};")

        # Header.
        header = QFrame()
        header.setFixedHeight(56)
        header.setStyleSheet(f"background: {COL.surface}; border-bottom: 1px solid {COL.border_rgba};")
        hl = QHBoxLayout(header)
        hl.setContentsMargins(18, 10, 18, 10)
        hl.setSpacing(14)

        brand = QHBoxLayout()
        brand.setSpacing(10)
        brand_icon = QFrame()
        brand_icon.setFixedSize(34, 34)
        brand_icon.setStyleSheet(f"border-radius: 10px; background: rgba(157,92,255,0.18); border: 1px solid rgba(157,92,255,0.20);")
        bi = QLabel()
        bi.setAlignment(Qt.AlignCenter)
        try:
            f = QFont("Material Symbols Outlined")
            f.setPixelSize(22)
            bi.setFont(f)
            bi.setText("folder_managed")
        except Exception:
            bi.setText("DIR")
        bi_l = QHBoxLayout(brand_icon)
        bi_l.setContentsMargins(0, 0, 0, 0)
        bi_l.addWidget(bi, 0, Qt.AlignCenter)
        brand.addWidget(brand_icon)

        brand_text = QVBoxLayout()
        brand_text.setContentsMargins(0, 0, 0, 0)
        brand_text.setSpacing(1)
        t1 = QLabel("JPE Translation Suite")
        t1.setStyleSheet("font-weight: 900; font-size: 10pt; letter-spacing: 1px; text-transform: uppercase;")
        t2 = QLabel("Development Build")
        t2.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.40);")
        brand_text.addWidget(t1)
        brand_text.addWidget(t2)
        brand.addLayout(brand_text)
        hl.addLayout(brand)

        sep = QFrame()
        sep.setFixedWidth(1)
        sep.setStyleSheet("background: rgba(255,255,255,0.10);")
        hl.addWidget(sep)

        self.active_proj_label = QLabel("MyMod_v1")
        self.active_proj_label.setStyleSheet("font-weight: 700;")
        proj_col = QVBoxLayout()
        proj_col.setContentsMargins(0, 0, 0, 0)
        proj_col.setSpacing(1)
        proj_col.addWidget(QLabel("Active Project"))
        proj_col.itemAt(0).widget().setStyleSheet("font-size: 9pt; color: rgba(255,255,255,0.55);")  # type: ignore[union-attr]
        proj_col.addWidget(self.active_proj_label)
        hl.addLayout(proj_col)

        hl.addStretch(1)

        # Segmented view (Code / Design / Translate).
        seg_wrap = QFrame()
        seg_wrap.setStyleSheet("background: rgba(0,0,0,0.20); border-radius: 10px; padding: 4px;")
        seg = QHBoxLayout(seg_wrap)
        seg.setContentsMargins(0, 0, 0, 0)
        seg.setSpacing(4)
        self._seg_group = QButtonGroup(self)
        self._seg_group.setExclusive(True)
        self.btn_code = self._seg_btn("Code", active=True)
        self.btn_design = self._seg_btn("Design", active=False)
        self.btn_translate = self._seg_btn("Translate", active=False)
        seg.addWidget(self.btn_code)
        seg.addWidget(self.btn_design)
        seg.addWidget(self.btn_translate)
        hl.addWidget(seg_wrap)

        self.btn_notif = QToolButton()
        self.btn_notif.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_notif, "notifications", size_px=18)
        hl.addWidget(self.btn_notif)

        self.btn_settings = QToolButton()
        self.btn_settings.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_settings, "settings", size_px=18)
        self.btn_settings.clicked.connect(self.request_settings.emit)
        hl.addWidget(self.btn_settings)

        avatar = QLabel("JS")
        avatar.setAlignment(Qt.AlignCenter)
        avatar.setFixedSize(32, 32)
        avatar.setStyleSheet(
            f"border-radius: 16px; font-weight: 900; background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 {COL.primary}, stop:1 #a78ecc);"
        )
        hl.addWidget(avatar)

        root.addWidget(header)

        # Body.
        split = QSplitter(Qt.Horizontal)
        split.setHandleWidth(2)
        root.addWidget(split, 1)

        # Left: Explorer sidebar.
        left = QFrame()
        left.setStyleSheet(f"background: {COL.sidebar_bg}; border-right: 1px solid {COL.border_rgba};")
        left.setMinimumWidth(360)
        left.setMaximumWidth(460)
        ll = QVBoxLayout(left)
        ll.setContentsMargins(16, 16, 16, 16)
        ll.setSpacing(12)

        top_row = QHBoxLayout()
        top_row.setSpacing(10)
        title = QLabel("Explorer")
        title.setStyleSheet("font-size: 9pt; font-weight: 900; letter-spacing: 2px; color: rgba(255,255,255,0.55);")
        top_row.addWidget(title)
        top_row.addStretch(1)
        for name in ("close", "refresh", "filter_list", "unfold_more", "sort_by_alpha", "more_vert"):
            b = QToolButton()
            b.setObjectName("IconButton")
            set_toolbutton_icon(b, name, size_px=18)
            if name == "refresh":
                b.clicked.connect(self._render_tree)
            if name == "unfold_more":
                b.setToolTip("Expand All")
                b.clicked.connect(lambda: self.tree.expandAll())
            if name == "filter_list":
                b.setToolTip("Filter")
            if name == "sort_by_alpha":
                b.setToolTip("Sort")
            top_row.addWidget(b)
        ll.addLayout(top_row)

        self.search = QLineEdit()
        self.search.setPlaceholderText("Search files...")
        self.search.textChanged.connect(self._render_tree)
        self.search.setStyleSheet(
            f"background: rgba(0,0,0,0.18); border: 1px solid {COL.border_rgba}; border-radius: 12px; padding: 10px 12px;"
        )
        ll.addWidget(self.search)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(10)
        self.btn_new_file = QToolButton()
        self.btn_new_file.setText("New File")
        self.btn_new_file.setCursor(Qt.PointingHandCursor)
        self.btn_new_file.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
        self.btn_new_file.setStyleSheet(
            f"background: rgba(0,0,0,0.20); border: 1px solid {COL.border_rgba}; border-radius: 10px; padding: 7px 10px;"
        )
        set_toolbutton_icon(self.btn_new_file, "note_add", size_px=18)
        btn_row.addWidget(self.btn_new_file)
        self.btn_new_folder = QToolButton()
        self.btn_new_folder.setText("Folder")
        self.btn_new_folder.setCursor(Qt.PointingHandCursor)
        self.btn_new_folder.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
        self.btn_new_folder.setStyleSheet(
            f"background: rgba(0,0,0,0.20); border: 1px solid {COL.border_rgba}; border-radius: 10px; padding: 7px 10px;"
        )
        set_toolbutton_icon(self.btn_new_folder, "create_new_folder", size_px=18)
        btn_row.addWidget(self.btn_new_folder)
        btn_row.addStretch(1)
        ll.addLayout(btn_row)

        self.tree = QTreeWidget()
        self.tree.setColumnCount(2)
        self.tree.setHeaderHidden(True)
        self.tree.setIndentation(14)
        self.tree.setAnimated(True)
        self.tree.itemSelectionChanged.connect(self._on_tree_selected)
        self.tree.setColumnWidth(1, 74)
        self.tree.setStyleSheet(
            f"background: transparent; border: 1px solid {COL.border_rgba}; border-radius: 12px; padding: 6px;"
            "QTreeWidget::item { padding: 8px 6px; border-radius: 8px; }"
            f"QTreeWidget::item:selected {{ background: rgba(255,255,255,0.06); border-left: 2px solid {COL.primary}; }}"
            "QTreeWidget::item:hover { background: rgba(255,255,255,0.04); }"
            "QTreeWidget::item:selected:active { outline: none; }"
        )
        ll.addWidget(self.tree, 1)

        storage = QFrame()
        storage.setStyleSheet(f"background: {COL.surface}; border: 1px solid {COL.border_rgba}; border-radius: 14px;")
        st = QVBoxLayout(storage)
        st.setContentsMargins(12, 10, 12, 10)
        st.setSpacing(8)
        st_head = QHBoxLayout()
        st_head.setContentsMargins(0, 0, 0, 0)
        st_head.setSpacing(8)
        st_label = QLabel("Local Storage")
        st_label.setStyleSheet("font-size: 9pt; font-weight: 800; color: rgba(255,255,255,0.55);")
        st_head.addWidget(st_label)
        st_head.addStretch(1)
        self.storage_pct = QLabel("45%")
        self.storage_pct.setStyleSheet("font-family: Consolas; font-size: 9pt; font-weight: 900;")
        st_head.addWidget(self.storage_pct)
        st.addLayout(st_head)

        self.storage_bar = QProgressBar()
        self.storage_bar.setRange(0, 100)
        self.storage_bar.setValue(45)
        self.storage_bar.setTextVisible(False)
        self.storage_bar.setFixedHeight(10)
        self.storage_bar.setStyleSheet(
            "QProgressBar { background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06); border-radius: 5px; }"
            f"QProgressBar::chunk {{ border-radius: 5px; background: qlineargradient(x1:0,y1:0,x2:1,y2:0, stop:0 {COL.primary}, stop:1 #a78ecc); }}"
        )
        st.addWidget(self.storage_bar)

        foot = QHBoxLayout()
        foot.setContentsMargins(0, 0, 0, 0)
        foot.setSpacing(8)
        self.storage_sync = QLabel("Last Sync: 2m ago")
        self.storage_sync.setStyleSheet("font-size: 8pt; color: rgba(255,255,255,0.40);")
        foot.addWidget(self.storage_sync)
        foot.addStretch(1)
        self.storage_quota = QLabel("Manage Quota")
        self.storage_quota.setStyleSheet("font-size: 8pt; color: rgba(255,255,255,0.40);")
        foot.addWidget(self.storage_quota)
        st.addLayout(foot)
        ll.addWidget(storage)

        action_row = QHBoxLayout()
        action_row.setSpacing(10)
        self.btn_build = QToolButton()
        self.btn_build.setText("Build Project")
        self.btn_build.setCursor(Qt.PointingHandCursor)
        self.btn_build.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
        self.btn_build.setStyleSheet(
            f"background: {COL.primary}; border: 1px solid {COL.primary}; border-radius: 12px; padding: 10px 12px; font-weight: 900; color: white;"
        )
        set_toolbutton_icon(self.btn_build, "build", size_px=18)
        self.btn_build.clicked.connect(self.request_build.emit)
        action_row.addWidget(self.btn_build, 1)
        ll.addLayout(action_row)

        split.addWidget(left)

        # Right: code preview.
        right = QFrame()
        right.setStyleSheet(f"background: {COL.background};")
        rl = QVBoxLayout(right)
        rl.setContentsMargins(16, 16, 16, 16)
        rl.setSpacing(12)

        self.preview_header = QFrame()
        self.preview_header.setStyleSheet(f"background: {COL.surface}; border: 1px solid {COL.border_rgba}; border-radius: 14px;")
        phl = QHBoxLayout(self.preview_header)
        phl.setContentsMargins(12, 10, 12, 10)
        phl.setSpacing(10)
        self.preview_title = QLabel("No file selected")
        self.preview_title.setStyleSheet("font-weight: 900;")
        self.preview_path = QLabel("")
        self.preview_path.setStyleSheet("font-size: 9pt; color: rgba(255,255,255,0.55);")
        pc = QVBoxLayout()
        pc.setContentsMargins(0, 0, 0, 0)
        pc.setSpacing(2)
        pc.addWidget(self.preview_title)
        pc.addWidget(self.preview_path)
        phl.addLayout(pc, 1)

        self.btn_save = QToolButton()
        self.btn_save.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_save, "save", size_px=18)
        phl.addWidget(self.btn_save)
        rl.addWidget(self.preview_header)

        self.editor = CodeEditor(language="xml")
        self.editor.set_variant("codePrimary")
        self.editor.setReadOnly(True)
        self.editor.cursorPositionChanged.connect(self._update_status)
        rl.addWidget(self.editor, 1)

        split.addWidget(right)
        split.setStretchFactor(0, 0)
        split.setStretchFactor(1, 1)
        split.setSizes([360, 900])

        # Bottom status bar.
        status = QFrame()
        status.setFixedHeight(30)
        status.setStyleSheet(f"background: {COL.primary}; border-top: 1px solid rgba(255,255,255,0.10);")
        sl = QHBoxLayout(status)
        sl.setContentsMargins(14, 0, 14, 0)
        sl.setSpacing(18)
        ready = QWidget()
        rl = QHBoxLayout(ready)
        rl.setContentsMargins(0, 0, 0, 0)
        rl.setSpacing(6)
        ico = QToolButton()
        ico.setObjectName("IconButton")
        ico.setEnabled(False)
        set_toolbutton_icon(ico, "check_circle", size_px=14)
        ico.setStyleSheet("color: rgba(255,255,255,0.95); padding: 0px; border: none; background: transparent;")
        rl.addWidget(ico)
        self.status_left = QLabel("Ready")
        self.status_left.setStyleSheet("font-family: Consolas; font-size: 9pt; font-weight: 800; color: white;")
        rl.addWidget(self.status_left)
        sl.addWidget(ready)
        self.status_pos = QLabel("Ln 1, Col 1")
        self.status_pos.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.85);")
        sl.addWidget(self.status_pos)
        self.status_meta = QLabel("UTF-8")
        self.status_meta.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.85);")
        sl.addWidget(self.status_meta)
        self.status_kind = QLabel("XML")
        self.status_kind.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.85);")
        sl.addWidget(self.status_kind)
        sl.addStretch(1)
        self.status_proj = QLabel("Project: MyMod_v1")
        self.status_proj.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.90);")
        sl.addWidget(self.status_proj)
        self.status_branch = QLabel("master*")
        self.status_branch.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.90);")
        sl.addWidget(self.status_branch)
        self.status_notif = QToolButton()
        self.status_notif.setObjectName("IconButton")
        self.status_notif.setCursor(Qt.PointingHandCursor)
        set_toolbutton_icon(self.status_notif, "notifications", size_px=16)
        self.status_notif.setStyleSheet("color: rgba(255,255,255,0.95);")
        sl.addWidget(self.status_notif)
        root.addWidget(status)

        self._seg_group.buttonClicked.connect(self._on_segment_nav)

        self._render_tree()
        self._update_status()

    def set_project(self, project: Project) -> None:
        self._project = project
        name = str(project.name or "") or Path(str(project.source_path)).name
        self.active_proj_label.setText(name)
        self.status_proj.setText(f"Project: {name}")
        self._render_tree()

    def _seg_btn(self, text: str, *, active: bool) -> QToolButton:
        b = QToolButton()
        b.setText(text)
        b.setCheckable(True)
        b.setChecked(active)
        b.setStyleSheet(
            "border-radius: 8px; padding: 6px 12px; font-size: 9pt;"
            + (
                f"background: {COL.surface_highlight}; color: white;"
                if active
                else "background: transparent; color: rgba(255,255,255,0.55);"
            )
        )
        self._seg_group.addButton(b)
        return b

    def _on_segment_nav(self) -> None:
        # Update styles.
        for b in (self.btn_code, self.btn_design, self.btn_translate):
            on = b.isChecked()
            b.setStyleSheet(
                "border-radius: 8px; padding: 6px 12px; font-size: 9pt;"
                + (f"background: {COL.surface_highlight}; color: white;" if on else "background: transparent; color: rgba(255,255,255,0.55);")
            )
        if self.btn_translate.isChecked():
            self.request_translate.emit()

    def _render_tree(self) -> None:
        self.tree.clear()
        if not self._project:
            self.tree.addTopLevelItem(QTreeWidgetItem(["No project loaded."]))
            return
        q = self.search.text().strip().lower()

        files = [str(f.get("path") or "") for f in (self._project.files or []) if str(f.get("path") or "").strip()]
        if q:
            files = [p for p in files if q in p.lower()]

        def group(title: str, icon_name: str, paths: list[str], *, badge: str = "ORIG") -> QTreeWidgetItem:
            it = QTreeWidgetItem([title, ""])
            it.setExpanded(True)
            it.setData(0, Qt.UserRole, {"kind": "group"})
            it.setForeground(0, Qt.white)
            it.setText(1, f"{len(paths)} items")
            it.setTextAlignment(1, Qt.AlignRight | Qt.AlignVCenter)
            it.setForeground(1, Qt.white)
            for p in sorted(paths)[:600]:
                leaf = QTreeWidgetItem([Path(p).name, badge])
                leaf.setData(0, Qt.UserRole, {"kind": "file", "path": p})
                leaf.setForeground(0, Qt.white)
                leaf.setTextAlignment(1, Qt.AlignRight | Qt.AlignVCenter)
                leaf.setForeground(1, Qt.white)
                it.addChild(leaf)
            self.tree.addTopLevelItem(it)
            return it

        top = [p for p in files if "/" not in p and p]
        mods = [p for p in files if p.lower().startswith("mods/")]
        tuning = [p for p in files if str(p).lower().endswith(".xml")]
        generated = []
        if self._project.build_history:
            generated.append(str(self._project.build_history[-1].get("output") or ""))

        group("Project Root", "folder", top, badge="ORIG")
        group("Mods", "folder_open", mods, badge="ORIG")
        group("Tuning Files", "settings", tuning, badge="ORIG")
        group("Generated Outputs", "inventory_2", [p for p in generated if p], badge="GEN")

    def _on_tree_selected(self) -> None:
        items = self.tree.selectedItems()
        if not items:
            return
        meta = items[0].data(0, Qt.UserRole) or {}
        if not isinstance(meta, dict):
            return
        if meta.get("kind") != "file":
            return
        rel_path = str(meta.get("path") or "")
        self._selected_rel_path = rel_path
        self._render_preview(rel_path)

    def _render_preview(self, rel_path: str) -> None:
        self.preview_title.setText(Path(rel_path).name or rel_path)
        self.preview_path.setText(rel_path)
        txt = self._read_file_or_segments(rel_path)
        self.editor.setPlainText(txt)
        suf = Path(rel_path).suffix.lower().lstrip(".")
        self.status_kind.setText(suf.upper() if suf else "TEXT")
        self._update_status()

    def _read_file_or_segments(self, rel_path: str) -> str:
        if self._project:
            try:
                base = Path(self._project.source_path)
                candidate = (base / rel_path).resolve()
                if base.exists() and base.is_dir() and candidate.exists() and candidate.is_file():
                    if candidate.stat().st_size <= 2_000_000:
                        return candidate.read_text(encoding="utf-8", errors="replace")
            except Exception:
                pass

            # Fallback: build a representative view from segments in this file.
            segs = [s for s in (self._project.segments or []) if str(s.get("file_path") or "") == rel_path][:120]
            if segs:
                lines = ["<?xml version=\"1.0\" encoding=\"utf-8\"?>", "<tuning_root>"]
                for s in segs:
                    loc = str(s.get("location") or "")
                    src = str(s.get("source") or "").replace("\n", " ").strip()
                    if not src:
                        continue
                    src = (src[:140] + "...") if len(src) > 140 else src
                    lines.append(f"  <!-- {loc} -->")
                    lines.append(f"  <T>{src}</T>")
                lines.append("</tuning_root>")
                return "\n".join(lines)

        return "// Preview unavailable for this file."

    def _update_status(self) -> None:
        try:
            cur = self.editor.textCursor()
            ln = cur.blockNumber() + 1
            col = cur.positionInBlock() + 1
            self.status_pos.setText(f"Ln {ln}, Col {col}")
        except Exception:
            self.status_pos.setText("Ln 1, Col 1")
