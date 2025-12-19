from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
import os
from pathlib import Path

from jpe_sims4.project import Project
from jpe_sims4.glossary import glossary_hits
from jpe_sims4.storage import load_project, save_project
from jpe_sims4.tm import build_tm_from_segments, suggest
from jpe_sims4.validate import extract_placeholders, validate_project_segments, validate_segment
from jpe_sims4.workflow import scan_project
from jpe_sims4.workspace import compute_progress

from jpe_studio_qt.recents import load_recents, push_recent, save_recents

from PySide6.QtCore import QObject, QRunnable, Qt, QThreadPool, Signal, Slot, QSize
from PySide6.QtGui import QKeySequence, QShortcut
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QDialog,
    QFileDialog,
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QSizePolicy,
    QTreeWidget,
    QTreeWidgetItem,
    QScrollArea,
    QSplitter,
    QStackedLayout,
    QStackedWidget,
    QStyle,
    QTabWidget,
    QTableWidget,
    QTableWidgetItem,
    QTextEdit,
    QToolButton,
    QTreeWidgetItemIterator,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import (
    CardFrame, H1, H2, MaterialIcon, Muted, BadgeLabel, FAB, SearchBar,
    EmptyStateWidget, ProgressCard, ChipButton, set_toolbutton_icon
)
from jpe_studio_qt.ui.glass_widgets import GlassFrame
from jpe_studio_qt.ui.code_editor import CodeEditor
from jpe_studio_qt.ui.pages.docs_hub import DocsHubPage
from jpe_studio_qt.ui.pages.about import AboutSystemInfoPage
from jpe_studio_qt.ui.pages.dashboard2 import Dashboard2Page
from jpe_studio_qt.ui.pages.project_detail import ProjectDetailPage
from jpe_studio_qt.ui.pages.explorer2 import Explorer2Page
from jpe_studio_qt.ui.pages.plugins_marketplace2_page import PluginsMarketplace2Page
from jpe_studio_qt.ui.pages.settings2 import Settings2Page
from jpe_studio_qt.ui.pages.build_history2 import BuildHistory2Page
from jpe_studio_qt.ui.pages.diagnostics_tab2 import DiagnosticsTab2Page
from jpe_studio_qt.ui.diagnostics_pane import GlobalDiagnosticsPane
from jpe_studio_qt.ui.entity_detail_dialog import EntityDetailDialog, EntityRef
from jpe_studio_qt.ui.pages.entity_jpe_view import EntityJpeViewPage


class _WorkerSignals(QObject):
    done = Signal(object, object)


class _Worker(QRunnable):
    def __init__(self, fn):
        super().__init__()
        self.fn = fn
        self.signals = _WorkerSignals()

    @Slot()
    def run(self) -> None:  # pragma: no cover
        err = None
        out = None
        try:
            out = self.fn()
        except Exception as e:
            err = e
        self.signals.done.emit(out, err)


@dataclass
class ProjectContext:
    project: Project | None = None
    project_json_path: Path | None = None


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("JPE Studio (Qt)")

        self._thread_pool = QThreadPool.globalInstance()
        self._ctx = ProjectContext()
        self._recents = load_recents()

        shell = QFrame()
        shell.setObjectName("AppShell")
        self.setCentralWidget(shell)

        outer = QVBoxLayout(shell)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        topbar = QFrame()
        topbar.setObjectName("Topbar")
        topbar_l = QHBoxLayout(topbar)
        topbar_l.setContentsMargins(DESIGN.spacing.md, DESIGN.spacing.sm, DESIGN.spacing.md, DESIGN.spacing.sm)  # 14,10,14,10px margins
        topbar_l.setSpacing(DESIGN.spacing.sm)  # 10px spacing

        self.breadcrumb = QLabel("Home")
        self.breadcrumb.setObjectName("Muted")
        self.breadcrumb.setStyleSheet("font-size: 9pt;")
        topbar_l.addWidget(self.breadcrumb)
        topbar_l.addStretch(1)

        self.status = QLabel("Ready.")
        self.status.setObjectName("Muted")
        self.status.setStyleSheet("font-size: 9pt;")
        topbar_l.addWidget(self.status)

        self.btn_open = QToolButton()
        self.btn_open.setObjectName("IconButton")
        self.btn_open.setText("Open")
        self.btn_open.clicked.connect(self._open_any)
        topbar_l.addWidget(self.btn_open)

        self.btn_save = QToolButton()
        self.btn_save.setObjectName("IconButton")
        self.btn_save.setText("Save")
        self.btn_save.clicked.connect(self._save_project)
        topbar_l.addWidget(self.btn_save)

        self.btn_save_as = QToolButton()
        self.btn_save_as.setObjectName("IconButton")
        self.btn_save_as.setText("Save As")
        self.btn_save_as.clicked.connect(self.save_project_as)
        topbar_l.addWidget(self.btn_save_as)

        self.btn_new = QPushButton("New / Import")
        self.btn_new.setObjectName("Primary")
        self.btn_new.clicked.connect(self._open_import)
        topbar_l.addWidget(self.btn_new)

        outer.addWidget(topbar)
        # Desktop assets emphasize the left nav + content (no global topbar).
        # Keep the topbar wired for future responsive layouts, but hidden by default.
        topbar.setVisible(False)

        body = QHBoxLayout()
        body.setContentsMargins(0, 0, 0, 0)
        body.setSpacing(0)
        outer.addLayout(body, 1)

        sidebar = QFrame()
        sidebar.setObjectName("Sidebar")
        sidebar.setMaximumWidth(320)
        sidebar.setMinimumWidth(200)  # Allow sidebar to shrink on smaller screens
        sidebar.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self.sidebar = sidebar
        s_l = QVBoxLayout(sidebar)
        s_l.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 18px margins
        s_l.setSpacing(DESIGN.spacing.md)  # 14px spacing

        brand = QFrame()
        brand_l = QHBoxLayout(brand)
        brand_l.setContentsMargins(0, 0, 0, 0)
        brand_l.setSpacing(14)
        logo = QLabel("⟟")
        logo.setAlignment(Qt.AlignCenter)
        logo.setFixedSize(48, 48)
        logo.setStyleSheet(
            "border-radius: 16px;"
            "background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #8638fa, stop:1 #6d28d9);"
            "color: white; font-weight: 800; font-size: 18pt;"
        )
        brand_l.addWidget(logo)
        brand_text = QVBoxLayout()
        brand_text.setContentsMargins(0, 0, 0, 0)
        brand_text.setSpacing(3)
        brand_text.addWidget(H2("JPE Suite"))
        badges = QHBoxLayout()
        badges.setContentsMargins(0, 0, 0, 0)
        badges.setSpacing(8)
        ver = QLabel("v2.4.0")
        ver.setObjectName("Muted")
        ver.setStyleSheet("font-family: Consolas, monospace; font-size: 9pt;")
        pro = QLabel("PRO")
        pro.setStyleSheet(
            "font-size: 8pt; font-weight: 800; letter-spacing: 1px;"
            "padding: 2px 6px; border-radius: 6px;"
            "background: rgba(134,56,250,0.18); color: #8638fa; border: 1px solid rgba(134,56,250,0.15);"
        )
        badges.addWidget(ver)
        badges.addWidget(pro)
        badges.addStretch(1)
        brand_text.addLayout(badges)
        brand_l.addLayout(brand_text, 1)
        s_l.addWidget(brand)

        self.nav_buttons: list[QToolButton] = []
        self.stack = QStackedWidget()
        self.stack.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)

        def nav(label: str, idx: int, icon: QStyle.StandardPixmap) -> QToolButton:
            b = QToolButton()
            b.setObjectName("NavButton")
            b.setText(label)
            b.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
            b.setIcon(self.style().standardIcon(icon))
            b.setCheckable(True)
            b.clicked.connect(lambda _c=False, i=idx: self._select_page(i))
            self.nav_buttons.append(b)
            s_l.addWidget(b)
            return b

        nav("Dashboard", 0, QStyle.SP_ComputerIcon)
        nav("Projects", 1, QStyle.SP_DirIcon)
        nav("Translate", 2, QStyle.SP_FileDialogDetailedView)
        nav("Issues", 3, QStyle.SP_MessageBoxWarning)
        nav("Build", 4, QStyle.SP_BrowserReload)
        nav("Plugins", 5, QStyle.SP_FileDialogInfoView)

        sep = QLabel("RESOURCES")
        sep.setObjectName("Muted")
        sep.setStyleSheet("font-size: 9pt; font-weight: 700; letter-spacing: 2px; margin-top: 10px;")
        s_l.addWidget(sep)
        nav("Documentation", 6, QStyle.SP_DialogHelpButton)
        nav("Community", 7, QStyle.SP_DriveNetIcon)
        nav("About", 8, QStyle.SP_MessageBoxInformation)

        s_l.addStretch(1)

        self.btn_settings = QToolButton()
        self.btn_settings.setObjectName("NavButton")
        self.btn_settings.setToolButtonStyle(Qt.ToolButtonTextBesideIcon)
        self.btn_settings.setIcon(self.style().standardIcon(QStyle.SP_FileDialogContentsView))
        self.btn_settings.setText("Settings")
        self.btn_settings.setCheckable(True)
        self.btn_settings.clicked.connect(lambda: self._select_page(11))
        s_l.addWidget(self.btn_settings)

        profile = CardFrame(shadow=False)
        p_l = QHBoxLayout(profile)
        p_l.setContentsMargins(12, 12, 12, 12)
        p_l.setSpacing(12)
        avatar = QLabel("D")
        avatar.setAlignment(Qt.AlignCenter)
        avatar.setFixedSize(40, 40)
        avatar.setStyleSheet(
            "border-radius: 20px; background: rgba(255,255,255,0.10);"
            "border: 2px solid rgba(134,56,250,0.25); font-weight: 800;"
        )
        p_l.addWidget(avatar)
        p_text = QVBoxLayout()
        p_text.setContentsMargins(0, 0, 0, 0)
        p_text.setSpacing(2)
        p_text.addWidget(QLabel("DevUser_01"))
        p_text.addWidget(Muted("Pro License"))
        p_l.addLayout(p_text, 1)
        s_l.addWidget(profile)

        body.addWidget(sidebar)
        body.addWidget(self.stack, 1)

        self._build_pages()
        self._select_page(0)
        self._render_recents()

        # Command palette (matches `keyboard_shortcuts_&_command_palette`).
        self._palette = CommandPaletteDialog(self)
        QShortcut(QKeySequence("Ctrl+K"), self, activated=self._open_command_palette)
        # Assets use Ctrl+P for file search in the editor sidebar.
        QShortcut(QKeySequence("Ctrl+P"), self, activated=self._focus_workspace_file_search)

    def _open_command_palette(self) -> None:
        try:
            self._palette.open_for_context(self._ctx.project is not None)
        except Exception:
            return

    def _focus_workspace_file_search(self) -> None:
        try:
            self._select_page(2)
        except Exception:
            return
        try:
            self.workspace_page.focus_file_search()
        except Exception:
            return

    def _build_pages(self) -> None:
        # 0 Dashboard
        self.dashboard_page = Dashboard2Page()
        self.dashboard_page.request_nav_index.connect(self._select_page)
        self.dashboard_page.request_import.connect(self._open_import)
        self.dashboard_page.request_open_project_json.connect(lambda p: self._open_project_json(Path(p)))
        self.dashboard_page.request_open_project_detail_json.connect(lambda p: self._open_project_detail_json(Path(p)))
        self.stack.addWidget(self.dashboard_page)
        # 1 Projects (Explorer)
        self.explorer_page = Explorer2Page()
        self.explorer_page.request_translate.connect(lambda: self._select_page(2))
        self.explorer_page.request_build.connect(lambda: self._select_page(4))
        self.explorer_page.request_settings.connect(lambda: self._select_page(11))
        self.explorer_page.request_build.connect(lambda: self._select_page(4))
        self.stack.addWidget(self.explorer_page)
        # 2 Translate (dual-pane / segments)
        self.workspace_page = WorkspacePage()
        self.workspace_page.save_requested.connect(self._save_project)
        self.stack.addWidget(self.workspace_page)
        # 3 Issues
        self.qa_page = DiagnosticsTab2Page()
        self.qa_page.goto_segment.connect(self._goto_segment)
        self.stack.addWidget(self.qa_page)
        # 4 Build
        self.build_page = BuildHistory2Page()
        self.build_page.request_build_folder.connect(self._build_folder)
        self.build_page.request_build_zip.connect(self._build_zip)
        self.build_page.request_open_settings.connect(lambda: self._select_page(11))
        self.stack.addWidget(self.build_page)
        # 5 Plugins
        self.plugins_page = PluginsMarketplace2Page()
        self.stack.addWidget(self.plugins_page)
        # 6 Docs
        self.docs_page = DocsHubPage()
        self.stack.addWidget(self.docs_page)
        # 7 Community
        self.stack.addWidget(self._page_stub("Community", "Coming next: links + status."))
        # 8 About
        self.about_page = AboutSystemInfoPage()
        self.stack.addWidget(self.about_page)
        # 9 Project detail
        self.project_detail_page = ProjectDetailPage()
        self.project_detail_page.go_files.connect(lambda: self._select_page(1))
        self.project_detail_page.go_translate.connect(lambda: self._select_page(2))
        self.project_detail_page.go_build.connect(lambda: self._select_page(4))
        self.project_detail_page.open_entity.connect(self._open_entity_from_segment)
        self.stack.addWidget(self.project_detail_page)
        # 10 Entity JPE view
        self.entity_jpe_page = EntityJpeViewPage()
        self.entity_jpe_page.back_requested.connect(lambda: self._select_page(9))
        self.stack.addWidget(self.entity_jpe_page)
        # 11 Settings
        self.settings_page = Settings2Page()
        self.settings_page.request_back.connect(lambda: self._select_page(0))
        self.settings_page.apply_settings.connect(self._apply_settings)
        self.stack.addWidget(self.settings_page)

    def _page_stub(self, title: str, msg: str) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setContentsMargins(18, 18, 18, 18)
        l.setSpacing(12)
        h = QLabel(title)
        h.setObjectName("H2")
        l.addWidget(h)
        m = QLabel(msg)
        m.setObjectName("Muted")
        m.setWordWrap(True)
        l.addWidget(m)
        l.addStretch(1)
        return w

    def _page_home(self) -> QWidget:
        # Dashboard (matches `project_dashboard_1` layout).
        outer = QWidget()
        outer_l = QVBoxLayout(outer)
        outer_l.setContentsMargins(0, 0, 0, 0)
        outer_l.setSpacing(0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        outer_l.addWidget(scroll, 1)

        w = QWidget()
        scroll.setWidget(w)
        l = QVBoxLayout(w)
        l.setContentsMargins(24, 24, 24, 24)
        l.setSpacing(16)

        l.addWidget(H2("JPE Suite"))
        subtitle = Muted("SIMS 4 TRANSLATION")
        subtitle.setProperty("role", "caption")
        l.addWidget(subtitle)
        l.addSpacing(6)
        l.addWidget(H1("Hello, Dev"))
        l.addWidget(Muted("Ready to localize some mods today?"))

        # Use new SearchBar component
        self.search = SearchBar(placeholder="Search projects, files...")
        l.addWidget(self.search)

        quick_actions_label = Muted("QUICK ACTIONS")
        quick_actions_label.setProperty("role", "caption")
        quick_actions_label.setStyleSheet("font-weight: 800; letter-spacing: 2px; text-transform: uppercase;")
        l.addWidget(quick_actions_label)

        grid_card = CardFrame(shadow=False)
        g_l = QGridLayout(grid_card)
        g_l.setContentsMargins(12, 12, 12, 12)
        g_l.setHorizontalSpacing(10)
        g_l.setVerticalSpacing(10)

        def quick_btn(text: str, icon: QStyle.StandardPixmap, fn) -> QToolButton:
            b = QToolButton()
            b.setObjectName("QuickTile")
            b.setText(text)
            b.setToolButtonStyle(Qt.ToolButtonTextUnderIcon)
            b.setIcon(self.style().standardIcon(icon))
            b.setIconSize(QSize(26, 26))
            b.clicked.connect(fn)
            return b

        g_l.addWidget(quick_btn("New", QStyle.SP_FileDialogNewFolder, self._open_import), 0, 0)
        g_l.addWidget(quick_btn("Open", QStyle.SP_DirOpenIcon, self._open_any), 0, 1)
        g_l.addWidget(quick_btn("Docs", QStyle.SP_DialogHelpButton, lambda: self._select_page(6)), 0, 2)
        g_l.addWidget(quick_btn("Settings", QStyle.SP_FileDialogContentsView, lambda: self._select_page(8)), 0, 3)
        l.addWidget(grid_card)

        # Filter chips with updated styling
        chips = QHBoxLayout()
        chips.setSpacing(10)
        self.dash_chip_all = ChipButton("All Projects", active=True)
        self.dash_chip_active = ChipButton("Active", active=False)
        self.dash_chip_done = ChipButton("Completed", active=False)
        self.dash_chip_stale = ChipButton("Stale", active=False)
        for b in (self.dash_chip_all, self.dash_chip_active, self.dash_chip_done, self.dash_chip_stale):
            chips.addWidget(b)
        chips.addStretch(1)
        l.addLayout(chips)

        l.addWidget(H2("Recent projects"))
        self.recents_cards = QVBoxLayout()
        self.recents_cards.setContentsMargins(0, 0, 0, 0)
        self.recents_cards.setSpacing(10)
        l.addLayout(self.recents_cards)

        l.addStretch(1)

        # Floating action button (bottom-right) using new FAB component
        fab_row = QHBoxLayout()
        fab_row.addStretch(1)
        self.fab = FAB(icon_name="add")
        self.fab.setToolTip("Create New Project")
        self.fab.clicked.connect(self._open_import)
        fab_row.addWidget(self.fab)
        outer_l.addLayout(fab_row)

        return outer

    def _ensure_project_loaded(self) -> bool:
        if self._ctx.project is None:
            QMessageBox.information(self, "JPE Studio", "Load or import a project first.")
            return False
        return True

    def _select_page(self, idx: int) -> None:
        self.stack.setCurrentIndex(idx)
        try:
            w = self.stack.currentWidget()
            full_shell = bool(w.property("full_shell")) if w is not None else False
            self.sidebar.setVisible(not full_shell)
        except Exception:
            pass
        for i, b in enumerate(self.nav_buttons):
            b.setChecked(i == idx)
        try:
            self.btn_settings.setChecked(idx == 11)
        except Exception:
            pass

        names = {
            0: "Dashboard",
            1: "Projects",
            2: "Translate",
            3: "Issues",
            4: "Build",
            5: "Plugins",
            6: "Documentation",
            7: "Community",
            8: "About",
            9: "Project",
            10: "Entity",
            11: "Settings",
        }
        try:
            self.breadcrumb.setText(names.get(idx, ""))
        except Exception:
            pass

    def _render_recents(self) -> None:
        try:
            if hasattr(self, "dashboard_page") and hasattr(self.dashboard_page, "set_recents"):
                self.dashboard_page.set_recents([str(p) for p in (self._recents or [])])
                return
        except Exception:
            pass
        if hasattr(self, "recents_cards"):
            layout = self.recents_cards
            while layout.count():
                item = layout.takeAt(0)
                w = item.widget()
                if w is not None:
                    w.setParent(None)

            # Show empty state if no recents
            if not self._recents:
                empty = EmptyStateWidget(
                    icon_name="folder_open",
                    title="No Recent Projects",
                    description="You haven't opened any projects yet. Click the + button to create your first project.",
                    action_text="Create New Project"
                )
                empty.actionClicked.connect(self._open_import)
                layout.addWidget(empty)
                return

            for raw in self._recents[:25]:
                p = Path(raw)
                card = CardFrame(shadow=False)
                row = QHBoxLayout(card)
                row.setContentsMargins(12, 12, 12, 12)
                row.setSpacing(12)

                icon = QLabel()
                icon.setAlignment(Qt.AlignCenter)
                icon.setFixedSize(34, 34)
                try:
                    icon.setPixmap(self.style().standardIcon(QStyle.SP_DirIcon).pixmap(18, 18))
                except Exception:
                    icon.setText("DIR")
                icon.setStyleSheet(
                    "border-radius: 10px; background: rgba(134,56,250,0.12); color: #8638fa;"
                )
                row.addWidget(icon)

                text_col = QVBoxLayout()
                text_col.setContentsMargins(0, 0, 0, 0)
                text_col.setSpacing(2)
                name = QLabel(p.stem)
                name.setStyleSheet("font-weight: 700;")
                hint = Muted(str(p))
                hint.setProperty("role", "caption")
                text_col.addWidget(name)
                text_col.addWidget(hint)
                row.addLayout(text_col, 1)

                # Use new BadgeLabel component
                badge_text, badge_variant = self._badge_for_project_path(p)
                badge = BadgeLabel(badge_text, variant=badge_variant)
                row.addWidget(badge)

                open_btn = QToolButton()
                open_btn.setObjectName("IconButton")
                open_btn.setText("Open")
                open_btn.clicked.connect(lambda _c=False, path=p: self._open_project_json(path))
                row.addWidget(open_btn)

                detail_btn = QToolButton()
                detail_btn.setObjectName("IconButton")
                detail_btn.setText("Details")
                detail_btn.clicked.connect(lambda _c=False, path=p: self._open_project_detail_json(path))
                row.addWidget(detail_btn)

                layout.addWidget(card)
            return

        if hasattr(self, "recents_list"):
            self.recents_list.clear()
            for p in self._recents[:50]:
                it = QListWidgetItem(p)
                self.recents_list.addItem(it)

    def _open_recent_item(self, item: QListWidgetItem) -> None:
        p = Path(item.text())
        if not p.exists():
            QMessageBox.warning(self, "JPE Studio", "Project file no longer exists.")
            return
        self._open_project_json(p)

    def _badge_for_project_path(self, path: Path) -> tuple[str, str]:
        """Returns (badge_text, badge_variant) for BadgeLabel component."""
        if not path.exists():
            return ("MISSING", "error")
        try:
            project = load_project(path)
            prog = compute_progress(project.segments)
            has_errors = any(str(d.get("severity") or "").upper() in {"FATAL", "ERROR"} for d in (project.diagnostics or []))
            if has_errors:
                return ("ISSUES", "warning")
            if prog.total > 0 and prog.translated >= prog.total:
                return ("READY", "success")
            if prog.total > 0 and prog.translated > 0:
                return ("TRANSLATING", "primary")
            return ("NEW", "info")
        except Exception:
            return ("UNKNOWN", "info")

    def _badge_style(self, kind: str) -> str:
        kind = (kind or "").lower()
        if kind == "success":
            return (
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                "background: rgba(34,197,94,0.18); color: #22c55e; border: 1px solid rgba(34,197,94,0.18);"
            )
        if kind == "warning":
            return (
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                "background: rgba(234,179,8,0.18); color: #eab308; border: 1px solid rgba(234,179,8,0.18);"
            )
        if kind == "error":
            return (
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                "background: rgba(239,68,68,0.18); color: #ef4444; border: 1px solid rgba(239,68,68,0.18);"
            )
        if kind == "primary":
            return (
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                "background: rgba(134,56,250,0.18); color: #8638fa; border: 1px solid rgba(134,56,250,0.18);"
            )
        return (
            "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
            "background: rgba(255,255,255,0.10); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.10);"
        )

    def _set_status(self, text: str) -> None:
        self.status.setText(text)

    def _save_project(self) -> None:
        if not self._ctx.project:
            QMessageBox.information(self, "JPE Studio", "No project loaded.")
            return
        if not self._ctx.project_json_path:
            self.save_project_as()
            return
        try:
            save_project(self._ctx.project, self._ctx.project_json_path)
        except Exception as e:
            QMessageBox.critical(self, "JPE Studio", f"Save failed.\n\n{e}")
            return
        self._set_status("Saved.")
        self._recents = push_recent(self._recents, self._ctx.project_json_path)
        save_recents(self._recents)
        self._render_recents()

    def _open_any(self) -> None:
        path, _ = QFileDialog.getOpenFileName(
            self,
            "Open",
            "",
            "JPE Project (*.json);;Zip (*.zip);;All files (*.*)",
        )
        if not path:
            return
        p = Path(path)
        if p.suffix.lower() == ".json":
            self._open_project_json(p)
        elif p.suffix.lower() == ".zip":
            self._scan_source(p)
        else:
            QMessageBox.information(self, "JPE Studio", "Choose a project JSON or a zip, or use Import for folders.")

    def _open_import(self) -> None:
        folder = QFileDialog.getExistingDirectory(self, "Choose Mod Folder")
        if folder:
            self._scan_source(Path(folder))

    def _open_project_json(self, p: Path) -> None:
        try:
            project = load_project(p)
        except Exception as e:
            QMessageBox.critical(self, "JPE Studio", f"Failed to open project.\n\n{e}")
            return
        self.set_project(project, project_json_path=p)
        self._recents = push_recent(self._recents, p)
        save_recents(self._recents)
        self._render_recents()

    def _open_project_detail_json(self, p: Path) -> None:
        self._open_project_json(p)
        if self._ctx.project is not None:
            self._select_page(9)

    def _scan_source(self, source_path: Path) -> None:
        self._set_status("Indexing/Scanning...")

        def work():
            return scan_project(source_path, merge_from_project_json=None)

        def done(out, err) -> None:
            if err is not None:
                self._set_status("Error.")
                QMessageBox.critical(self, "JPE Studio", f"Scan failed.\n\n{err}")
                return
            proj = getattr(out, "project", None)
            if not isinstance(proj, Project):
                self._set_status("Error.")
                QMessageBox.critical(self, "JPE Studio", "Scan did not produce a project.")
                return
            self._set_status("Ready.")
            self.set_project(proj, project_json_path=None)
            self._select_page(2)

        worker = _Worker(work)
        worker.signals.done.connect(done)
        self._thread_pool.start(worker)

    def set_project(self, project: Project, *, project_json_path: Path | None) -> None:
        self._ctx = ProjectContext(project=project, project_json_path=project_json_path)
        try:
            self.workspace_page.set_project(project)
        except Exception:
            pass
        try:
            self.explorer_page.set_project(project)
        except Exception:
            pass
        try:
            self.qa_page.set_project(project)
        except Exception:
            pass
        try:
            self.build_page.set_project(project)
        except Exception:
            pass
        try:
            self.plugins_page.set_project(project)
        except Exception:
            pass
        try:
            self.settings_page.set_project(project)
        except Exception:
            pass
        try:
            self.project_detail_page.set_project(project)
        except Exception:
            pass
        try:
            # Keep entity view reset to avoid stale code.
            self.entity_jpe_page.set_model(EntityEditorModel(title="Entity Editor", status="", code="", warning=None))
        except Exception:
            pass

    def _open_entity_from_segment(self, seg: object) -> None:
        if not isinstance(seg, dict):
            return
        file_path = str(seg.get("file_path") or "")
        location = str(seg.get("location") or "")
        src = str(seg.get("source") or "")
        preview = src.strip().replace("\n", " ")
        preview = (preview[:240] + "…") if len(preview) > 240 else preview
        entity = EntityRef(
            kind=Path(file_path).suffix.lstrip(".") or "entity",
            display_name=str(seg.get("id") or Path(file_path).name or "Entity"),
            file_path=file_path,
            location=location,
            source_preview=preview,
        )
        dlg = EntityDetailDialog(self)
        dlg.set_entity(entity)
        dlg.open_full_editor.connect(self._open_entity_editor)
        dlg.exec()

    def _open_entity_editor(self, ent: object) -> None:
        if not isinstance(ent, EntityRef):
            return
        title = f"{Path(ent.file_path).name or ent.display_name}"
        status = "Edited"
        code = ent.source_preview
        warning = "This entity has diagnostics warnings (preview)." if "missing" in (ent.source_preview or "").lower() else None
        try:
            self.entity_jpe_page.set_model(EntityEditorModel(title=title, status=status, code=code, warning=warning))
        except Exception:
            return
        self._select_page(10)

    def save_project_as(self) -> None:
        if not self._ctx.project:
            return
        path, _ = QFileDialog.getSaveFileName(self, "Save Project As", "", "JPE Project (*.json)")
        if not path:
            return
        p = Path(path)
        try:
            save_project(self._ctx.project, p)
        except Exception as e:
            QMessageBox.critical(self, "JPE Studio", f"Save failed.\n\n{e}")
            return
        self._ctx.project_json_path = p
        self._recents = push_recent(self._recents, p)
        save_recents(self._recents)
        self._render_recents()
        self._set_status("Saved.")

    def _goto_segment(self, segment_id: str) -> None:
        if not segment_id:
            return
        try:
            self.workspace_page.goto_segment(segment_id)
            self._select_page(2)
        except Exception:
            return

    def _build_folder(self, output_dir: Path) -> None:
        if not self._ctx.project:
            return
        self._set_status("Building...")

        def work():
            from jpe_sims4.build import build_to_folder

            return build_to_folder(self._ctx.project, output_dir)

        def done(out, err) -> None:
            if err is not None:
                self._set_status("Error.")
                QMessageBox.critical(self, "JPE Studio", f"Build failed.\n\n{err}")
                return
            self._set_status("Ready.")
            try:
                self.build_page.set_project(self._ctx.project)
                self.qa_page.set_project(self._ctx.project)
                self.explorer_page.set_project(self._ctx.project)
            except Exception:
                pass
            QMessageBox.information(self, "JPE Studio", "Build finished.")

        worker = _Worker(work)
        worker.signals.done.connect(done)
        self._thread_pool.start(worker)

    def _build_zip(self, output_zip: Path) -> None:
        if not self._ctx.project:
            return
        self._set_status("Building...")

        def work():
            from jpe_sims4.build import build_to_zip

            return build_to_zip(self._ctx.project, output_zip)

        def done(out, err) -> None:
            if err is not None:
                self._set_status("Error.")
                QMessageBox.critical(self, "JPE Studio", f"Build failed.\n\n{err}")
                return
            self._set_status("Ready.")
            try:
                self.build_page.set_project(self._ctx.project)
                self.qa_page.set_project(self._ctx.project)
                self.explorer_page.set_project(self._ctx.project)
            except Exception:
                pass
            QMessageBox.information(self, "JPE Studio", "Build finished.")

        worker = _Worker(work)
        worker.signals.done.connect(done)
        self._thread_pool.start(worker)

    def _apply_settings(self, settings: dict[str, object]) -> None:
        if not self._ctx.project:
            return
        p = self._ctx.project
        p.source_locale = str(settings.get("source_locale") or "").strip() or None
        p.target_locale = str(settings.get("target_locale") or "").strip() or None
        p.validation = dict(settings.get("validation") or {})

        # Revalidate project diagnostics (non-destructive: preserve non-validation categories).
        new_diags = validate_project_segments(p.segments, glossary_entries=p.glossary, rules=p.validation)
        preserved: list[dict[str, object]] = []
        for d in list(p.diagnostics or []):
            cat = str(d.get("category") or "").strip().upper()
            if cat in {"VALIDATION", "GLOSSARY", "PLUGIN"}:
                continue
            preserved.append(d)
        preserved.extend([d.to_dict() for d in new_diags])
        p.diagnostics = preserved

        try:
            self.qa_page.set_project(p)
            self.workspace_page.set_project(p)
        except Exception:
            pass
        QMessageBox.information(self, "JPE Studio", "Settings applied and project revalidated.")


class ExplorerPage(QWidget):
    request_build = Signal()

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None

        root = QVBoxLayout(self)
        root.setContentsMargins(24, 24, 24, 24)
        root.setSpacing(14)

        header = QHBoxLayout()
        header.addWidget(H2("Project Explorer"))
        header.addStretch(1)
        root.addLayout(header)

        self.search = QLineEdit()
        self.search.setPlaceholderText("Search files...")
        self.search.textChanged.connect(self._render_tree)
        root.addWidget(self.search)

        chips = QHBoxLayout()
        chips.setSpacing(10)
        self.btn_filter = QPushButton("Filter: All")
        self.btn_filter.setObjectName("ChipActive")
        self.btn_expand = QPushButton("Expand All")
        self.btn_expand.setObjectName("Chip")
        self.btn_expand.clicked.connect(self._expand_all)
        self.btn_sort = QPushButton("Name")
        self.btn_sort.setObjectName("Chip")
        self.btn_sort.clicked.connect(self._sort_by_name)
        chips.addWidget(self.btn_filter)
        chips.addWidget(self.btn_expand)
        chips.addWidget(self.btn_sort)
        chips.addStretch(1)
        root.addLayout(chips)

        card = CardFrame(shadow=False)
        c_l = QVBoxLayout(card)
        c_l.setContentsMargins(12, 12, 12, 12)
        c_l.setSpacing(10)

        self.tree = QTreeWidget()
        self.tree.setHeaderHidden(True)
        self.tree.setIndentation(14)
        self.tree.setAnimated(True)
        c_l.addWidget(self.tree, 1)
        root.addWidget(card, 1)

        bottom = QHBoxLayout()
        self.btn_build = QPushButton("Build Project")
        self.btn_build.setObjectName("Primary")
        self.btn_build.clicked.connect(lambda: self.request_build.emit())
        self.btn_refresh = QToolButton()
        self.btn_refresh.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_refresh, "refresh", size_px=18)
        self.btn_refresh.clicked.connect(self._render_tree)
        bottom.addWidget(self.btn_build, 1)
        bottom.addWidget(self.btn_refresh)
        root.addLayout(bottom)

        try:
            self.tree.header().setSectionResizeMode(QHeaderView.ResizeToContents)
        except Exception:
            pass

    def set_project(self, project: Project) -> None:
        self._project = project
        self._render_tree()

    def _sort_by_name(self) -> None:
        try:
            self.tree.sortItems(0, Qt.AscendingOrder)
        except Exception:
            return

    def _expand_all(self) -> None:
        try:
            self.tree.expandAll()
        except Exception:
            return

    def _render_tree(self) -> None:
        self.tree.clear()
        if not self._project:
            root = QTreeWidgetItem(["No project loaded."])
            self.tree.addTopLevelItem(root)
            return
        q = self.search.text().strip().lower()

        def add_group(title: str, items: list[str]) -> None:
            if q:
                items = [p for p in items if q in p.lower()]
            grp = QTreeWidgetItem([f"{title}"])
            grp.setExpanded(True)
            self.tree.addTopLevelItem(grp)
            for p in sorted(items):
                leaf = QTreeWidgetItem([p])
                grp.addChild(leaf)

        files = [str(f.get("path") or "") for f in (self._project.files or []) if str(f.get("path") or "").strip()]
        top = [p for p in files if "/" not in p]
        mods = [p for p in files if p.lower().startswith("mods/")]
        tuning = [p for p in files if str(p).lower().endswith(".xml")]
        generated = []
        if self._project.build_history:
            generated.append(str(self._project.build_history[-1].get("output") or ""))

        add_group("Project Root", top)
        add_group("Mods", mods)
        add_group("Tuning Files", tuning)
        add_group("Generated Outputs", generated)


class PluginsPage(QWidget):
    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None
        self._mode = "ALL"
        self._market_chip = "ALL"

        root = QVBoxLayout(self)
        root.setContentsMargins(24, 24, 24, 24)
        root.setSpacing(14)

        header = QHBoxLayout()
        header.addWidget(H2("Plugins"))
        header.addStretch(1)
        root.addLayout(header)

        self.tabs = QTabWidget()
        root.addWidget(self.tabs, 1)

        # --- Installed (plugin_library_*) ---
        installed = QWidget()
        il = QVBoxLayout(installed)
        il.setContentsMargins(0, 0, 0, 0)
        il.setSpacing(14)

        self.search = QLineEdit()
        self.search.setPlaceholderText("Search installed plugins...")
        self.search.textChanged.connect(self._render_installed)
        il.addWidget(self.search)

        chips = QHBoxLayout()
        chips.setSpacing(10)
        self.chip_all = QPushButton("All")
        self.chip_all.setObjectName("ChipActive")
        self.chip_all.setCheckable(True)
        self.chip_all.setChecked(True)
        self.chip_all.clicked.connect(lambda: self._set_mode("ALL"))
        self.chip_loaded = QPushButton("Loaded")
        self.chip_loaded.setObjectName("Chip")
        self.chip_loaded.setCheckable(True)
        self.chip_loaded.clicked.connect(lambda: self._set_mode("LOADED"))
        self.chip_disabled = QPushButton("Disabled")
        self.chip_disabled.setObjectName("Chip")
        self.chip_disabled.setCheckable(True)
        self.chip_disabled.clicked.connect(lambda: self._set_mode("DISABLED"))
        for b in (self.chip_all, self.chip_loaded, self.chip_disabled):
            chips.addWidget(b)
        chips.addStretch(1)
        il.addLayout(chips)

        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.NoFrame)
        il.addWidget(self.scroll, 1)

        self.host = QWidget()
        self.scroll.setWidget(self.host)
        self.list_layout = QVBoxLayout(self.host)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(10)
        self.list_layout.addStretch(1)

        self.tabs.addTab(installed, "Installed")

        # --- Marketplace (plugin_marketplace_*) ---
        marketplace = QWidget()
        ml = QVBoxLayout(marketplace)
        ml.setContentsMargins(0, 0, 0, 0)
        ml.setSpacing(14)

        mp_search_row = QHBoxLayout()
        mp_search_row.setSpacing(10)
        self.market_search = QLineEdit()
        self.market_search.setPlaceholderText("Search marketplace plugins...")
        self.market_search.setStyleSheet("font-family: Consolas;")
        self.market_search.textChanged.connect(self._render_market)
        mp_search_row.addWidget(self.market_search, 1)
        self.market_filter = QToolButton()
        self.market_filter.setObjectName("IconButton")
        set_toolbutton_icon(self.market_filter, "tune", size_px=18)
        mp_search_row.addWidget(self.market_filter)
        ml.addLayout(mp_search_row)

        mchips = QHBoxLayout()
        mchips.setSpacing(10)
        self.market_all = QPushButton("All")
        self.market_all.setObjectName("ChipActive")
        self.market_all.setCheckable(True)
        self.market_all.setChecked(True)
        self.market_all.clicked.connect(lambda: self._set_market_chip("ALL"))
        self.market_updates = QPushButton("Updates")
        self.market_updates.setObjectName("Chip")
        self.market_updates.setCheckable(True)
        self.market_updates.clicked.connect(lambda: self._set_market_chip("UPDATES"))
        self.market_script = QPushButton("Script Mods")
        self.market_script.setObjectName("Chip")
        self.market_script.setCheckable(True)
        self.market_script.clicked.connect(lambda: self._set_market_chip("SCRIPT"))
        self.market_tuning = QPushButton("Tuning")
        self.market_tuning.setObjectName("Chip")
        self.market_tuning.setCheckable(True)
        self.market_tuning.clicked.connect(lambda: self._set_market_chip("TUNING"))
        for b in (self.market_all, self.market_updates, self.market_script, self.market_tuning):
            mchips.addWidget(b)
        mchips.addStretch(1)
        ml.addLayout(mchips)

        self.market_note = Muted("Marketplace sync is not wired yet; showing an offline preview.")
        ml.addWidget(self.market_note)

        self.market_scroll = QScrollArea()
        self.market_scroll.setWidgetResizable(True)
        self.market_scroll.setFrameShape(QFrame.NoFrame)
        ml.addWidget(self.market_scroll, 1)

        self.market_host = QWidget()
        self.market_scroll.setWidget(self.market_host)
        self.market_layout = QVBoxLayout(self.market_host)
        self.market_layout.setContentsMargins(0, 0, 0, 0)
        self.market_layout.setSpacing(10)
        self.market_layout.addStretch(1)

        self.tabs.addTab(marketplace, "Marketplace")

    def set_project(self, project: Project) -> None:
        self._project = project
        self._render_installed()
        self._render_market()

    def _set_mode(self, mode: str) -> None:
        self._mode = mode
        mapping = {"ALL": self.chip_all, "LOADED": self.chip_loaded, "DISABLED": self.chip_disabled}
        for k, b in mapping.items():
            b.setObjectName("ChipActive" if k == mode else "Chip")
            b.style().unpolish(b)
            b.style().polish(b)
            b.setChecked(k == mode)
        self._render_installed()

    def _render_installed(self) -> None:
        while self.list_layout.count() > 1:
            item = self.list_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.setParent(None)
        if not self._project:
            self.list_layout.insertWidget(0, Muted("No project loaded."))
            return

        try:
            from jpe_sims4.plugins import plugins as plugin_manager

            reg = plugin_manager().load()
            loaded = list(reg.loaded or [])
        except Exception:
            loaded = []

        disabled = set(str(x) for x in (self._project.disabled_plugins or []) if str(x).strip())
        q = self.search.text().strip().lower()

        for pl in loaded:
            path = str(pl.path)
            name = str(pl.name)
            is_disabled = path in disabled
            if self._mode == "LOADED" and is_disabled:
                continue
            if self._mode == "DISABLED" and not is_disabled:
                continue
            hay = f"{name} {path}".lower()
            if q and q not in hay:
                continue

            card = CardFrame(shadow=False)
            card.setCursor(Qt.PointingHandCursor)
            row = QHBoxLayout(card)
            row.setContentsMargins(12, 12, 12, 12)
            row.setSpacing(12)

            icon = QLabel()
            icon.setAlignment(Qt.AlignCenter)
            icon.setFixedSize(36, 36)
            try:
                icon.setPixmap(self.style().standardIcon(QStyle.SP_FileDialogInfoView).pixmap(18, 18))
            except Exception:
                icon.setText("P")
            icon.setStyleSheet("border-radius: 12px; background: rgba(134,56,250,0.12); color: #8638fa;")
            row.addWidget(icon)

            text = QVBoxLayout()
            text.setContentsMargins(0, 0, 0, 0)
            text.setSpacing(2)
            title = QLabel(name)
            title.setStyleSheet("font-weight: 800;")
            sub = Muted(path)
            sub.setStyleSheet("font-size: 9pt;")
            text.addWidget(title)
            text.addWidget(sub)
            row.addLayout(text, 1)

            state = QLabel("DISABLED" if is_disabled else "ENABLED")
            state.setStyleSheet(
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                + (
                    "background: rgba(239,68,68,0.18); color: #ef4444; border: 1px solid rgba(239,68,68,0.18);"
                    if is_disabled
                    else "background: rgba(34,197,94,0.18); color: #22c55e; border: 1px solid rgba(34,197,94,0.18);"
                )
            )
            row.addWidget(state)

            toggle = QToolButton()
            toggle.setObjectName("IconButton")
            toggle.setText("Toggle")
            toggle.clicked.connect(lambda _c=False, p=path: self._toggle_plugin(p))
            row.addWidget(toggle)

            details = QToolButton()
            details.setObjectName("IconButton")
            details.setText("Details")
            details.clicked.connect(lambda _c=False, n=name, p=path, dis=is_disabled: self._open_plugin_detail(n, p, not dis))
            row.addWidget(details)

            self.list_layout.insertWidget(self.list_layout.count() - 1, card)

    def _toggle_plugin(self, plugin_path: str) -> None:
        if not self._project:
            return
        raw = str(plugin_path or "").strip()
        if not raw:
            return
        disabled = set(str(x) for x in (self._project.disabled_plugins or []) if str(x).strip())
        if raw in disabled:
            disabled.remove(raw)
        else:
            disabled.add(raw)
        self._project.disabled_plugins = sorted(disabled)
        self._render_installed()

    def _set_market_chip(self, kind: str) -> None:
        self._market_chip = kind
        mapping = {
            "ALL": self.market_all,
            "UPDATES": self.market_updates,
            "SCRIPT": self.market_script,
            "TUNING": self.market_tuning,
        }
        for k, b in mapping.items():
            b.setObjectName("ChipActive" if k == kind else "Chip")
            b.style().unpolish(b)
            b.style().polish(b)
            b.setChecked(k == kind)
        self._render_market()

    def _render_market(self) -> None:
        while self.market_layout.count() > 1:
            item = self.market_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.setParent(None)

        q = self.market_search.text().strip().lower()
        items = [
            {"name": "Strings Utility Core", "version": "v2.1.0", "author": "Kuttoe", "tags": ["CORE", "SCRIPT"], "status": "UPDATE"},
            {"name": "XML Injector", "version": "v4.0.5", "author": "Scumbumbo", "tags": ["TUNING"], "status": "COMPATIBLE"},
            {"name": "UI Cheats Extension", "version": "v1.3.4", "author": "weerbesu", "tags": ["SCRIPT"], "status": "VERSION_MISMATCH"},
        ]

        def matches_kind(it: dict[str, object]) -> bool:
            if self._market_chip == "ALL":
                return True
            if self._market_chip == "UPDATES":
                return str(it.get("status")) == "UPDATE"
            if self._market_chip == "SCRIPT":
                return "SCRIPT" in set(it.get("tags") or [])
            if self._market_chip == "TUNING":
                return "TUNING" in set(it.get("tags") or [])
            return True

        shown = 0
        for it in items:
            if q and q not in (str(it.get("name") or "") + " " + str(it.get("author") or "")).lower():
                continue
            if not matches_kind(it):
                continue
            self.market_layout.insertWidget(self.market_layout.count() - 1, self._market_card(it))
            shown += 1

        if shown == 0:
            self.market_layout.insertWidget(self.market_layout.count() - 1, Muted("No plugins match your search/filter."))

    def _market_card(self, it: dict[str, object]) -> QWidget:
        card = CardFrame(shadow=False)
        col = QVBoxLayout(card)
        col.setContentsMargins(12, 12, 12, 12)
        col.setSpacing(10)

        top = QHBoxLayout()
        top.setSpacing(10)
        icon = QLabel("⧉")
        icon.setFixedSize(44, 44)
        icon.setAlignment(Qt.AlignCenter)
        icon.setStyleSheet("border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);")
        top.addWidget(icon)

        meta = QVBoxLayout()
        meta.setContentsMargins(0, 0, 0, 0)
        meta.setSpacing(2)
        name = QLabel(str(it.get("name") or "Plugin"))
        name.setStyleSheet("font-weight: 800;")
        meta.addWidget(name)
        meta.addWidget(Muted(f"By {it.get('author') or 'Unknown'} · {it.get('version') or ''}".strip()))
        top.addLayout(meta, 1)

        more = QToolButton()
        more.setObjectName("IconButton")
        set_toolbutton_icon(more, "more_vert", size_px=18)
        top.addWidget(more)
        col.addLayout(top)

        status = str(it.get("status") or "")
        if status:
            badge = QLabel(status.replace("_", " "))
            badge.setStyleSheet(
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                + (
                    "background: rgba(234,179,8,0.18); color: #eab308; border: 1px solid rgba(234,179,8,0.18);"
                    if status in {"UPDATE"}
                    else "background: rgba(34,197,94,0.18); color: #22c55e; border: 1px solid rgba(34,197,94,0.18);"
                    if status in {"COMPATIBLE"}
                    else "background: rgba(239,68,68,0.18); color: #ef4444; border: 1px solid rgba(239,68,68,0.18);"
                )
            )
            col.addWidget(badge, 0, Qt.AlignLeft)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(10)
        btn_install = QPushButton("Queue Install")
        btn_install.setObjectName("Primary")
        btn_install.clicked.connect(lambda: self._open_plugin_detail(str(it.get("name") or "Plugin"), "marketplace://", True))
        btn_row.addWidget(btn_install, 1)
        col.addLayout(btn_row)
        return card

    def _open_plugin_detail(self, name: str, path: str, enabled: bool) -> None:
        dlg = PluginDetailDialog(self, name=name, path=path, enabled=enabled)
        dlg.exec()


class PluginDetailDialog(QDialog):
    def __init__(self, parent: QWidget, *, name: str, path: str, enabled: bool) -> None:
        super().__init__(parent)
        self.setModal(True)
        self.setWindowTitle("Plugin Detail")
        self.setMinimumWidth(720)

        root = QVBoxLayout(self)
        root.setContentsMargins(16, 16, 16, 16)
        root.setSpacing(12)

        header = QHBoxLayout()
        back = QToolButton()
        back.setObjectName("IconButton")
        set_toolbutton_icon(back, "arrow_back", size_px=18)
        back.clicked.connect(self.reject)
        header.addWidget(back)
        header.addWidget(H2(name), 1)
        save = QToolButton()
        save.setObjectName("IconButton")
        save.setText("Save")
        save.clicked.connect(self.accept)
        header.addWidget(save)
        root.addLayout(header)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        root.addWidget(scroll, 1)

        host = QWidget()
        scroll.setWidget(host)
        l = QVBoxLayout(host)
        l.setContentsMargins(0, 0, 0, 0)
        l.setSpacing(14)

        profile = CardFrame(shadow=False)
        pl = QHBoxLayout(profile)
        pl.setContentsMargins(12, 12, 12, 12)
        pl.setSpacing(12)
        icon = QLabel("◎")
        icon.setFixedSize(72, 72)
        icon.setAlignment(Qt.AlignCenter)
        icon.setStyleSheet("border-radius: 14px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);")
        pl.addWidget(icon)
        meta = QVBoxLayout()
        meta.setContentsMargins(0, 0, 0, 0)
        meta.setSpacing(4)
        meta.addWidget(QLabel(name))
        meta.addWidget(Muted(path))
        state = QLabel("Status: Active" if enabled else "Status: Disabled")
        state.setStyleSheet("color: #22c55e;" if enabled else "color: #ef4444;")
        meta.addWidget(state)
        pl.addLayout(meta, 1)
        l.addWidget(profile)

        actions = CardFrame(shadow=False)
        al = QGridLayout(actions)
        al.setContentsMargins(12, 12, 12, 12)
        al.setHorizontalSpacing(10)
        al.setVerticalSpacing(10)
        for i, (lab, ico) in enumerate([("Docs", "description"), ("GitHub", "code"), ("Support", "forum"), ("Config", "tune")]):
            b = QToolButton()
            b.setObjectName("QuickTile")
            b.setToolButtonStyle(Qt.ToolButtonTextUnderIcon)
            b.setText(lab)
            set_toolbutton_icon(b, ico, size_px=18)
            al.addWidget(b, 0, i)
        l.addWidget(actions)

        settings = CardFrame(shadow=False)
        sl = QVBoxLayout(settings)
        sl.setContentsMargins(12, 12, 12, 12)
        sl.setSpacing(10)
        sl.addWidget(H2("Settings"))
        sl.addWidget(Muted("UI preview only. Persistence and marketplace networking will be wired in later."))
        l.addWidget(settings)


class CommandPaletteDialog(QDialog):
    def __init__(self, parent: MainWindow) -> None:
        super().__init__(parent)
        self.setWindowTitle("Command Palette")
        self.setModal(True)
        self.setMinimumWidth(720)

        root = QVBoxLayout(self)
        root.setContentsMargins(16, 16, 16, 16)
        root.setSpacing(12)

        title = H2("Command Palette")
        root.addWidget(title)

        self.query = SearchBar(placeholder="Type command or binding...")
        self.query.textChanged.connect(self._render)
        root.addWidget(self.query)

        chips = QHBoxLayout()
        chips.setSpacing(DESIGN.spacing.sm)
        self.chip_all = ChipButton("All", active=True)
        self.chip_all.clicked.connect(lambda: self._set_chip("ALL"))
        self.chip_core = ChipButton("Core")
        self.chip_core.clicked.connect(lambda: self._set_chip("CORE"))
        self.chip_translation = ChipButton("Translation")
        self.chip_translation.clicked.connect(lambda: self._set_chip("TRANSLATION"))
        self.chip_view = ChipButton("View")
        self.chip_view.clicked.connect(lambda: self._set_chip("VIEW"))
        for b in (self.chip_all, self.chip_core, self.chip_translation, self.chip_view):
            chips.addWidget(b)
        chips.addStretch(1)
        root.addLayout(chips)

        self.list = QListWidget()
        self.list.itemDoubleClicked.connect(lambda _it: self._activate_selected())
        root.addWidget(self.list, 1)

        foot = QHBoxLayout()
        foot.addStretch(1)
        self.btn_close = ChipButton("Close")
        self.btn_close.clicked.connect(self.reject)
        self.btn_run = QPushButton("Run")
        self.btn_run.setObjectName("Primary")
        self.btn_run.clicked.connect(self._activate_selected)
        foot.addWidget(self.btn_close)
        foot.addWidget(self.btn_run)
        root.addLayout(foot)

        self._chip = "ALL"
        self._has_project = False
        self._commands: list[dict[str, object]] = []

    def open_for_context(self, has_project: bool) -> None:
        self._has_project = bool(has_project)
        self.query.setText("")
        self._set_chip("ALL")
        self._render()
        self.show()
        self.raise_()
        self.activateWindow()
        self.query.setFocus()

    def _set_chip(self, chip: str) -> None:
        self._chip = chip
        mapping = {
            "ALL": self.chip_all,
            "CORE": self.chip_core,
            "TRANSLATION": self.chip_translation,
            "VIEW": self.chip_view,
        }
        for k, b in mapping.items():
            # ChipButton handles active state via property
            b.setProperty("active", k == chip)
            b.style().unpolish(b)
            b.style().polish(b)
        self._render()

    def _all_commands(self) -> list[dict[str, object]]:
        # This is a curated subset aligned with the template. We can expand over time.
        parent = self.parent()
        cmds: list[dict[str, object]] = [
            {"group": "FILE OPERATIONS", "name": "Save Project", "key": "Ctrl+S", "chip": "CORE", "fn": getattr(parent, "_save_project", None)},
            {"group": "FILE OPERATIONS", "name": "Save Project As", "key": "Ctrl+Shift+S", "chip": "CORE", "fn": getattr(parent, "save_project_as", None)},
            {"group": "FILE OPERATIONS", "name": "Open", "key": "Ctrl+O", "chip": "CORE", "fn": getattr(parent, "_open_any", None)},
            {"group": "NAVIGATION", "name": "Go to Dashboard", "key": "", "chip": "VIEW", "fn": lambda: getattr(parent, "_select_page")(0)},
            {"group": "NAVIGATION", "name": "Go to Projects", "key": "", "chip": "VIEW", "fn": lambda: getattr(parent, "_select_page")(1)},
            {"group": "NAVIGATION", "name": "Go to Translate", "key": "", "chip": "VIEW", "fn": lambda: getattr(parent, "_select_page")(2)},
            {"group": "NAVIGATION", "name": "Go to Issues", "key": "", "chip": "VIEW", "fn": lambda: getattr(parent, "_select_page")(3)},
            {"group": "NAVIGATION", "name": "Go to Build", "key": "", "chip": "VIEW", "fn": lambda: getattr(parent, "_select_page")(4)},
            {"group": "NAVIGATION", "name": "Go to Plugins", "key": "", "chip": "VIEW", "fn": lambda: getattr(parent, "_select_page")(5)},
            {"group": "NAVIGATION", "name": "Go to Settings", "key": "", "chip": "VIEW", "fn": lambda: getattr(parent, "_select_page")(11)},
        ]
        if self._has_project:
            cmds.append(
                {
                    "group": "TRANSLATION",
                    "name": "Next Untranslated",
                    "key": "Ctrl+J",
                    "chip": "TRANSLATION",
                    "fn": lambda: getattr(parent, "workspace_page")._next_untranslated(),  # type: ignore[attr-defined]
                }
            )
        return cmds

    def _render(self) -> None:
        self.list.clear()
        q = self.query.text().strip().lower()
        cmds = self._all_commands()
        if self._chip != "ALL":
            cmds = [c for c in cmds if str(c.get("chip") or "") == self._chip]
        if q:
            cmds = [c for c in cmds if q in str(c.get("name") or "").lower() or q in str(c.get("group") or "").lower()]

        self._commands = cmds
        last_group = None
        cmd_index = 0
        for c in cmds:
            group = str(c.get("group") or "")
            if group != last_group:
                it = QListWidgetItem(group)
                it.setFlags(Qt.ItemIsEnabled)
                it.setForeground(Qt.gray)
                it.setData(Qt.UserRole, -1)
                self.list.addItem(it)
                last_group = group
            name = str(c.get("name") or "")
            key = str(c.get("key") or "")
            it2 = QListWidgetItem(f"{name}    {key}".rstrip())
            it2.setData(Qt.UserRole, cmd_index)
            self.list.addItem(it2)
            cmd_index += 1
        if self.list.count() > 0:
            self.list.setCurrentRow(1 if self.list.count() > 1 else 0)

    def _activate_selected(self) -> None:
        it = self.list.currentItem()
        if it is None:
            return
        try:
            cmd_idx = int(it.data(Qt.UserRole))
        except Exception:
            return
        if cmd_idx < 0:
            return
        if cmd_idx < 0 or cmd_idx >= len(self._commands):
            return
        fn = self._commands[cmd_idx].get("fn")
        if callable(fn):
            try:
                fn()
            except Exception:
                pass
        self.accept()

class WorkspacePage(QWidget):
    save_requested = Signal()

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None
        self._visible_segments: list[dict[str, object]] = []
        self._current_segment_id: str | None = None
        self._file_scope: str | None = None
        self._open_files_mru: list[str] = []
        self._output_collapsed = False
        self._left_sidebar_visible = True
        self._split_sizes: list[int] | None = None

        outer = QVBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        # Header aligned to `dual-pane_jpe/xml_editor_2` (desktop) with glass-morphism effect.
        header = GlassFrame()  # Glass-morphism header (Phase 3)
        header.setFixedHeight(56)  # Stitch spec: Editor header 56px (was 64px)
        header.setStyleSheet("background: rgba(24,16,35,1.0); border-bottom: 1px solid rgba(255,255,255,0.10);")
        hl = QHBoxLayout(header)
        hl.setContentsMargins(18, 10, 18, 10)
        hl.setSpacing(14)

        icon = QFrame()
        icon.setFixedSize(40, 40)
        icon.setStyleSheet(
            "border-radius: 12px;"
            "background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #8638fa, stop:1 #5b20b0);"
            "border: 1px solid rgba(255,255,255,0.10);"
        )
        il = QHBoxLayout(icon)
        il.setContentsMargins(0, 0, 0, 0)
        il.addWidget(MaterialIcon("terminal", size_px=22), 0, Qt.AlignCenter)
        hl.addWidget(icon)

        title_col = QVBoxLayout()
        title_col.setContentsMargins(0, 0, 0, 0)
        title_col.setSpacing(3)
        self.ws_breadcrumb = QLabel("Translate")
        self.ws_breadcrumb.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.50);")
        self.ws_file_title = QLabel("No file selected")
        self.ws_file_title.setStyleSheet("font-size: 12pt; font-weight: 900;")
        title_col.addWidget(self.ws_breadcrumb)
        title_col.addWidget(self.ws_file_title)
        hl.addLayout(title_col, 1)

        view_wrap = QFrame()
        view_wrap.setStyleSheet("background: rgba(0,0,0,0.20); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px;")
        vl = QHBoxLayout(view_wrap)
        vl.setContentsMargins(4, 4, 4, 4)
        vl.setSpacing(4)
        self.btn_view_editor = QPushButton("Editor")
        self.btn_view_editor.setCheckable(True)
        self.btn_view_editor.setChecked(True)
        self.btn_view_editor.setStyleSheet(
            "QPushButton{padding: 6px 10px; border-radius: 9px; background: rgba(255,255,255,0.06);"
            "border: 1px solid rgba(255,255,255,0.08); font-weight: 800;}"
        )
        self.btn_view_diff = QPushButton("Diff")
        self.btn_view_diff.setObjectName("Chip")
        self.btn_view_hist = QPushButton("History")
        self.btn_view_hist.setObjectName("Chip")
        vl.addWidget(self.btn_view_editor)
        vl.addWidget(self.btn_view_diff)
        vl.addWidget(self.btn_view_hist)
        hl.addWidget(view_wrap)

        tools = QFrame()
        tools.setStyleSheet("background: rgba(0,0,0,0.20); border: 1px solid rgba(255,255,255,0.10); border-radius: 12px;")
        tl = QHBoxLayout(tools)
        tl.setContentsMargins(4, 4, 4, 4)
        tl.setSpacing(4)
        self.btn_toggle_sidebar = QToolButton()
        self.btn_toggle_sidebar.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_toggle_sidebar, "view_sidebar", size_px=18)
        self.btn_toggle_sidebar.setToolTip("Toggle Sidebar")
        self.btn_toggle_sidebar.clicked.connect(self._toggle_left_sidebar)
        tl.addWidget(self.btn_toggle_sidebar)
        self.btn_split = QToolButton()
        self.btn_split.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_split, "splitscreen", size_px=18)
        self.btn_split.setToolTip("Toggle Output Split")
        self.btn_split.clicked.connect(self._toggle_output_view)
        tl.addWidget(self.btn_split)
        hl.addWidget(tools)

        self.btn_save_changes = QPushButton("Save Changes")
        self.btn_save_changes.setObjectName("Primary")
        self.btn_save_changes.clicked.connect(self.save_requested.emit)
        hl.addWidget(self.btn_save_changes)

        outer.addWidget(header)

        body = QWidget()
        outer.addWidget(body, 1)
        root = QVBoxLayout(body)
        root.setContentsMargins(18, 18, 18, 18)
        root.setSpacing(14)

        self.search = QLineEdit()
        self.search.setPlaceholderText("Search segments...")
        self.search.textChanged.connect(self._render_segments)
        self.status = QComboBox()
        self.status.addItems(["All", "new", "in_progress", "reviewed"])
        self.status.currentIndexChanged.connect(self._render_segments)
        self.btn_prev = QPushButton("Prev")
        self.btn_prev.setObjectName("Chip")
        self.btn_prev.clicked.connect(lambda: self._select_adjacent(-1))
        self.btn_next = QPushButton("Next")
        self.btn_next.setObjectName("Chip")
        self.btn_next.clicked.connect(lambda: self._select_adjacent(1))
        self.btn_next_untranslated = QPushButton("Next Untranslated")
        self.btn_next_untranslated.setObjectName("ChipActive")
        self.btn_next_untranslated.clicked.connect(self._next_untranslated)
        self.btn_reviewed = QPushButton("Mark Reviewed")
        self.btn_reviewed.setObjectName("Chip")
        self.btn_reviewed.clicked.connect(self._mark_reviewed)

        # File search + tree (editor sidebar intent from `dual-pane_jpe/xml_editor_2`).
        self.file_search = QLineEdit()
        self.file_search.setPlaceholderText("Search files (Ctrl+P)...")
        self.file_search.textChanged.connect(self._render_file_tree)
        self.file_tree = QTreeWidget()
        self.file_tree.setColumnCount(2)
        self.file_tree.setHeaderHidden(True)
        self.file_tree.setIndentation(14)
        try:
            self.file_tree.header().setStretchLastSection(False)
            self.file_tree.header().setSectionResizeMode(0, QHeaderView.Stretch)
            self.file_tree.header().setSectionResizeMode(1, QHeaderView.ResizeToContents)
        except Exception:
            pass
        self.file_tree.itemSelectionChanged.connect(self._on_file_tree_selection_changed)
        self.file_tree.setStyleSheet(
            "QTreeWidget{background: rgba(0,0,0,0.10); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 6px;}"
            "QTreeWidget::item{height: 32px; padding: 6px 8px; border-radius: 10px;}"
            "QTreeWidget::item:selected{background: rgba(134,56,250,0.18); border-left: 3px solid #8638fa;}"
        )
        split = QSplitter(Qt.Horizontal)
        split.setHandleWidth(4)  # Stitch spec: 4px splitter handle (was 2px default)
        root.addWidget(split, 1)
        self.main_split = split

        # Left: segment list.
        left = QFrame()
        left.setObjectName("Card")
        left_l = QVBoxLayout(left)
        left_l.setContentsMargins(10, 10, 10, 10)
        left_l.setSpacing(8)

        file_search_wrap = QFrame()
        file_search_wrap.setStyleSheet("background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;")
        fs_l = QHBoxLayout(file_search_wrap)
        fs_l.setContentsMargins(10, 6, 10, 6)
        fs_l.setSpacing(10)
        fs_icon = MaterialIcon("search", size_px=18)
        fs_icon.setStyleSheet("color: rgba(255,255,255,0.45);")
        fs_l.addWidget(fs_icon)
        self.file_search.setStyleSheet("border: none; background: transparent; padding: 8px 0px;")
        fs_l.addWidget(self.file_search, 1)
        left_l.addWidget(file_search_wrap)
        left_l.addWidget(self.file_tree, 1)

        # Sidebar controls (kept in the left pane for closer parity with the asset layout).
        left_l.addWidget(self.search)
        filter_row = QHBoxLayout()
        filter_row.setSpacing(10)
        filter_row.addWidget(self.status, 1)
        filter_row.addWidget(self.btn_prev)
        filter_row.addWidget(self.btn_next)
        left_l.addLayout(filter_row)
        nav_row = QHBoxLayout()
        nav_row.setSpacing(10)
        nav_row.addWidget(self.btn_next_untranslated, 1)
        nav_row.addWidget(self.btn_reviewed)
        left_l.addLayout(nav_row)

        self.progress = QLabel("No project loaded.")
        self.progress.setObjectName("Muted")
        left_l.addWidget(self.progress)
        self.segment_list = QListWidget()
        self.segment_list.currentItemChanged.connect(self._on_segment_selected)
        left_l.addWidget(self.segment_list, 2)
        split.addWidget(left)
        self.left_pane = left

        # Middle: true dual-pane editor (top editor + bottom output view).
        mid = QWidget()
        mid_l = QVBoxLayout(mid)
        mid_l.setContentsMargins(0, 0, 0, 0)
        mid_l.setSpacing(12)

        self.editor_header = CardFrame(shadow=False)
        self.editor_header.setProperty("variant", "EditorHeader")
        eh_l = QHBoxLayout(self.editor_header)
        eh_l.setContentsMargins(12, 12, 12, 12)
        eh_l.setSpacing(10)

        self.btn_editor_menu = QToolButton()
        self.btn_editor_menu.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_editor_menu, "menu", size_px=18)
        eh_l.addWidget(self.btn_editor_menu)

        self.file_title = QLabel("No file selected")
        self.file_title.setStyleSheet("font-weight: 800;")
        self.file_path = Muted("")
        self.file_path.setStyleSheet("font-size: 9pt;")
        title_col = QVBoxLayout()
        title_col.setContentsMargins(0, 0, 0, 0)
        title_col.setSpacing(2)
        title_col.addWidget(self.file_title)
        title_col.addWidget(self.file_path)
        eh_l.addLayout(title_col, 1)

        self.btn_sync_toggle = QToolButton()
        self.btn_sync_toggle.setObjectName("IconButton")
        self.btn_sync_toggle.setText("Sync")
        self.btn_sync_toggle.setStyleSheet("color: #8638fa; font-weight: 700;")
        eh_l.addWidget(self.btn_sync_toggle)

        self.btn_save_local = QPushButton("Save")
        self.btn_save_local.setObjectName("Primary")
        self.btn_save_local.clicked.connect(self.save_requested.emit)
        eh_l.addWidget(self.btn_save_local)
        mid_l.addWidget(self.editor_header)
        self.editor_header.setVisible(False)

        self.dual_split = QSplitter(Qt.Vertical)
        self.dual_split.setHandleWidth(4)  # Stitch spec: 4px splitter handle
        mid_l.addWidget(self.dual_split, 1)

        top_card = CardFrame(shadow=False)
        top_l = QVBoxLayout(top_card)
        top_l.setContentsMargins(12, 12, 12, 12)
        top_l.setSpacing(10)
        self.editor_source = CodeEditor(language="xml")
        self.editor_source.set_variant("codePrimary")
        self.editor_source.setReadOnly(True)
        self.editor_source.cursorPositionChanged.connect(self._update_cursor_status)

        # Floating tools inside editor (asset: handyman + search).
        editor_shell = QFrame()
        stack = QStackedLayout(editor_shell)
        stack.setContentsMargins(0, 0, 0, 0)
        try:
            stack.setStackingMode(QStackedLayout.StackingMode.StackAll)  # type: ignore[attr-defined]
        except Exception:
            try:
                stack.setStackingMode(QStackedLayout.StackAll)  # type: ignore[attr-defined]
            except Exception:
                pass
        stack.addWidget(self.editor_source)
        overlay = QWidget()
        ov_l = QVBoxLayout(overlay)
        ov_l.setContentsMargins(0, 0, 0, 0)
        ov_l.setSpacing(10)
        self.btn_quick_fix = QToolButton()
        self.btn_quick_fix.setObjectName("FloatingTool")
        set_toolbutton_icon(self.btn_quick_fix, "handyman", size_px=16)
        self.btn_quick_fix.setFixedSize(32, 32)
        self.btn_quick_fix.setToolTip("Quick Fix")
        self.btn_search_in_file = QToolButton()
        self.btn_search_in_file.setObjectName("FloatingTool")
        set_toolbutton_icon(self.btn_search_in_file, "search", size_px=16)
        self.btn_search_in_file.setFixedSize(32, 32)
        self.btn_search_in_file.setToolTip("Search")
        ov_l.addWidget(self.btn_quick_fix, 0, Qt.AlignRight)
        ov_l.addWidget(self.btn_search_in_file, 0, Qt.AlignRight)
        ov_l.addStretch(1)
        stack.addWidget(overlay)
        stack.setAlignment(overlay, Qt.AlignTop | Qt.AlignRight)
        stack.setContentsMargins(0, 0, 0, 0)
        top_l.addWidget(editor_shell, 1)
        self.dual_split.addWidget(top_card)

        bottom_card = CardFrame(shadow=False)
        bot_l = QVBoxLayout(bottom_card)
        bot_l.setContentsMargins(12, 12, 12, 12)
        bot_l.setSpacing(10)

        out_hdr = QHBoxLayout()
        out_hdr.setSpacing(10)
        out_hdr.addWidget(Muted("Output View"))
        out_hdr.addStretch(1)
        self.btn_toggle_output = QToolButton()
        self.btn_toggle_output.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_toggle_output, "expand_more", size_px=18)
        self.btn_toggle_output.setToolTip("Collapse Output View")
        self.btn_toggle_output.clicked.connect(self._toggle_output_view)
        out_hdr.addWidget(self.btn_toggle_output)
        bot_l.addLayout(out_hdr)

        self.output_tabs = QTabWidget()
        self.output_tabs.setObjectName("OutputTabs")
        self.output_tabs.setTabPosition(QTabWidget.North)
        bot_l.addWidget(self.output_tabs, 1)

        self.editor_target = CodeEditor(language="xml")
        self.editor_target.set_variant("codeOutput")
        self.editor_target.textChanged.connect(self._on_target_changed)
        self.editor_target.cursorPositionChanged.connect(self._update_cursor_status)
        self.output_tabs.addTab(self.editor_target, "JPE-XML")

        self.editor_raw = CodeEditor(language="xml")
        self.editor_raw.set_variant("codeOutput")
        self.editor_raw.setReadOnly(True)
        self.output_tabs.addTab(self.editor_raw, "Raw XML")

        self.editor_tuning = CodeEditor(language="xml")
        self.editor_tuning.set_variant("codeOutput")
        self.editor_tuning.setReadOnly(True)
        self.output_tabs.addTab(self.editor_tuning, "Tuning")

        status_card = CardFrame(shadow=False)
        status_card.setProperty("variant", "CodeStatusBar")
        status_l = QHBoxLayout(status_card)
        status_l.setContentsMargins(10, 8, 10, 8)
        status_l.setSpacing(12)
        self.pos_label = QLabel("Ln 1, Col 1")
        self.pos_label.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.85);")
        self.encoding_label = QLabel("UTF-8")
        self.encoding_label.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.55);")
        self.warn_icon = MaterialIcon("warning", size_px=16)
        self.warn_icon.setStyleSheet("color: rgba(255,255,255,0.55);")
        self.warn_label = QLabel("0 Issues")
        self.warn_label.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.55);")
        self.sync_icon = MaterialIcon("check_circle", size_px=16)
        self.sync_icon.setStyleSheet("color: #22c55e;")
        self.sync_label = QLabel("Sync OK")
        self.sync_label.setStyleSheet("font-family: Consolas; font-size: 9pt; color: #22c55e;")
        status_l.addWidget(self.pos_label)
        status_l.addWidget(self.encoding_label)
        status_l.addStretch(1)
        status_l.addWidget(self.warn_icon)
        status_l.addWidget(self.warn_label)
        status_l.addWidget(self.sync_icon)
        status_l.addWidget(self.sync_label)
        bot_l.addWidget(status_card)

        self.dual_split.addWidget(bottom_card)
        self.dual_split.setSizes([520, 280])

        split.addWidget(mid)

        # Right: helper tabs.
        right = QTabWidget()
        right.setObjectName("Card")
        self.ctx_label = QLabel("")
        self.ctx_label.setObjectName("Muted")
        ctx = QWidget()
        ctx_l = QVBoxLayout(ctx)
        ctx_l.setContentsMargins(12, 12, 12, 12)
        ctx_l.addWidget(self.ctx_label)
        ctx_l.addStretch(1)
        right.addTab(ctx, "Context")

        self.tm_list = QListWidget()
        self.tm_list.itemDoubleClicked.connect(self._apply_selected_tm)
        tm = QWidget()
        tm_l = QVBoxLayout(tm)
        tm_l.setContentsMargins(12, 12, 12, 12)
        tm_actions = QHBoxLayout()
        tm_actions.setSpacing(10)
        btn_apply_tm = QPushButton("Apply Selected")
        btn_apply_tm.setObjectName("Chip")
        btn_apply_tm.clicked.connect(self._apply_selected_tm)
        tm_actions.addWidget(btn_apply_tm)
        tm_actions.addStretch(1)
        tm_l.addLayout(tm_actions)
        tm_l.addWidget(self.tm_list, 1)
        right.addTab(tm, "TM")

        self.gloss_list = QListWidget()
        self.gloss_list.itemDoubleClicked.connect(self._apply_selected_glossary)
        gl = QWidget()
        gl_l = QVBoxLayout(gl)
        gl_l.setContentsMargins(12, 12, 12, 12)
        gl_actions = QHBoxLayout()
        gl_actions.setSpacing(10)
        btn_insert = QPushButton("Insert Preferred")
        btn_insert.setObjectName("Chip")
        btn_insert.clicked.connect(self._apply_selected_glossary)
        gl_actions.addWidget(btn_insert)
        gl_actions.addStretch(1)
        gl_l.addLayout(gl_actions)
        gl_l.addWidget(self.gloss_list, 1)
        right.addTab(gl, "Glossary")

        self.val_label = QLabel("")
        self.val_label.setObjectName("Muted")
        self.val_list = QListWidget()
        val = QWidget()
        val_l = QVBoxLayout(val)
        val_l.setContentsMargins(12, 12, 12, 12)
        val_l.addWidget(self.val_label)
        val_l.addWidget(self.val_list, 1)
        right.addTab(val, "Validate")

        split.addWidget(right)

        split.setStretchFactor(0, 2)
        split.setStretchFactor(1, 6)
        split.setStretchFactor(2, 3)
        split.setSizes([340, 780, 360])

    def _toggle_output_view(self) -> None:
        if self._output_collapsed:
            self.dual_split.setSizes([520, 280])
            set_toolbutton_icon(self.btn_toggle_output, "expand_more", size_px=18)
            self.btn_toggle_output.setToolTip("Collapse Output View")
        else:
            # Collapse bottom pane while leaving a minimal handle visible.
            self.dual_split.setSizes([800, 0])
            set_toolbutton_icon(self.btn_toggle_output, "expand_less", size_px=18)
            self.btn_toggle_output.setToolTip("Expand Output View")
        self._output_collapsed = not self._output_collapsed

    def _toggle_left_sidebar(self) -> None:
        try:
            left = getattr(self, "left_pane", None)
            split = getattr(self, "main_split", None)
            if left is None or split is None:
                return
            self._left_sidebar_visible = not self._left_sidebar_visible
            left.setVisible(self._left_sidebar_visible)
            if self._left_sidebar_visible:
                split.setSizes(self._split_sizes or [340, 780, 360])
            else:
                try:
                    self._split_sizes = list(split.sizes())
                except Exception:
                    self._split_sizes = None
                split.setSizes([0, 900, 360])
        except Exception:
            return

    def set_project(self, project: Project) -> None:
        self._project = project
        self._current_segment_id = None
        self._file_scope = None
        self._open_files_mru = []
        self.search.setText("")
        self.status.setCurrentIndex(0)
        try:
            self.file_search.setText("")
        except Exception:
            pass
        self._render_file_tree()
        self._render_segments()
        self._clear_editor()

    def _filtered(self) -> list[dict[str, object]]:
        if not self._project:
            return []
        q = self.search.text().strip().lower()
        st = self.status.currentText().strip()
        out: list[dict[str, object]] = []
        for s in list(self._project.segments or []):
            if st != "All" and str(s.get("status") or "new") != st:
                continue
            if self._file_scope and str(s.get("file_path") or "") != self._file_scope:
                continue
            if q:
                hay = " ".join(
                    [
                        str(s.get("id") or ""),
                        str(s.get("file_path") or ""),
                        str(s.get("location") or ""),
                        str(s.get("source") or ""),
                        str(s.get("target") or ""),
                        str(s.get("note") or ""),
                    ]
                ).lower()
                if q not in hay:
                    continue
            out.append(s)
        return out

    def focus_file_search(self) -> None:
        try:
            self.file_search.setFocus()
            self.file_search.selectAll()
        except Exception:
            return

    def _render_file_tree(self) -> None:
        self.file_tree.blockSignals(True)
        try:
            self.file_tree.clear()
            if not self._project:
                return
            q = self.file_search.text().strip().lower()

            def include(path: str) -> bool:
                if not q:
                    return True
                return q in path.lower() or q in Path(path).name.lower()

            files = sorted(
                {
                    str(s.get("file_path") or "")
                    for s in (self._project.segments or [])
                    if str(s.get("file_path") or "").strip()
                }
            )
            open_files = [p for p in self._open_files_mru if p in files]

            active_file = self._file_scope
            if not active_file and self._current_segment_id:
                seg = self._seg_by_id(self._current_segment_id)
                if seg:
                    active_file = str(seg.get("file_path") or "") or None

            def modified(path: str) -> bool:
                for s in (self._project.segments or []):
                    if str(s.get("file_path") or "") != path:
                        continue
                    if str(s.get("target") or "").strip():
                        return True
                return False

            def add_group(title: str) -> QTreeWidgetItem:
                it = QTreeWidgetItem([title, ""])
                it.setFlags(Qt.ItemIsEnabled)
                it.setForeground(0, Qt.gray)
                it.setFirstColumnSpanned(True)
                self.file_tree.addTopLevelItem(it)
                return it

            grp_open = add_group("OPEN EDITORS")
            all_item = QTreeWidgetItem(["All Files", ""])
            all_item.setData(0, Qt.UserRole, "__ALL__")
            try:
                all_item.setIcon(0, self.style().standardIcon(QStyle.SP_DirIcon))
            except Exception:
                pass
            grp_open.addChild(all_item)
            for p in open_files[:8]:
                if not include(p):
                    continue
                child = QTreeWidgetItem([Path(p).name, ("M" if modified(p) else "")])
                child.setData(0, Qt.UserRole, p)
                child.setTextAlignment(1, Qt.AlignCenter)
                child.setForeground(1, Qt.gray)
                if modified(p):
                    try:
                        from PySide6.QtGui import QColor, QBrush, QFont

                        child.setForeground(1, QColor("#ffffff"))
                        child.setBackground(1, QBrush(QColor(134, 56, 250, 130)))  # #8638fa
                        f = QFont()
                        f.setBold(True)
                        f.setPointSize(8)
                        child.setFont(1, f)
                    except Exception:
                        pass
                try:
                    child.setIcon(0, self.style().standardIcon(QStyle.SP_FileIcon))
                except Exception:
                    pass
                if active_file and p == active_file:
                    try:
                        from PySide6.QtGui import QColor, QBrush

                        child.setBackground(0, QBrush(QColor(134, 56, 250, 50)))  # #8638fa
                    except Exception:
                        pass
                grp_open.addChild(child)
            grp_open.setExpanded(True)

            grp_root = add_group("PROJECT ROOT")

            def section_for(path: str) -> str:
                p = path.replace("\\", "/").lower()
                if "/generated" in p or p.startswith("generated/") or p.startswith("build/"):
                    return "Generated Outputs"
                if "/tuning" in p or p.startswith("tuning/"):
                    return "Tuning Files"
                if p.startswith("mods/") or "/mods/" in p:
                    return "Mods"
                if "/logs" in p or p.startswith("logs/"):
                    return "Logs"
                return "Project Root"

            sections: dict[str, QTreeWidgetItem] = {}

            def section_item(name: str) -> QTreeWidgetItem:
                if name in sections:
                    return sections[name]
                it = QTreeWidgetItem([name, ""])
                it.setFlags(Qt.ItemIsEnabled)
                it.setForeground(0, Qt.gray)
                it.setFirstColumnSpanned(True)
                try:
                    it.setIcon(0, self.style().standardIcon(QStyle.SP_DirIcon))
                except Exception:
                    pass
                grp_root.addChild(it)
                sections[name] = it
                return it

            folder_nodes: dict[tuple[int, str], QTreeWidgetItem] = {}

            def ensure_folder(parent: QTreeWidgetItem, name: str) -> QTreeWidgetItem:
                key = (id(parent), name)
                ex = folder_nodes.get(key)
                if ex is not None:
                    return ex
                it = QTreeWidgetItem([name, ""])
                it.setData(0, Qt.UserRole, "")
                try:
                    it.setIcon(0, self.style().standardIcon(QStyle.SP_DirIcon))
                except Exception:
                    pass
                parent.addChild(it)
                folder_nodes[key] = it
                return it

            for p in files:
                if not include(p):
                    continue
                sec = section_item(section_for(p))
                parts = [x for x in p.replace("\\", "/").split("/") if x]
                parent = sec
                for d in parts[:-1]:
                    parent = ensure_folder(parent, d)
                ext = Path(p).suffix.lstrip(".").upper()[:4]
                leaf = QTreeWidgetItem([parts[-1] if parts else p, ext])
                leaf.setData(0, Qt.UserRole, p)
                leaf.setTextAlignment(1, Qt.AlignCenter)
                leaf.setForeground(1, Qt.gray)
                try:
                    leaf.setIcon(0, self.style().standardIcon(QStyle.SP_FileIcon))
                except Exception:
                    pass
                if active_file and p == active_file:
                    try:
                        from PySide6.QtGui import QColor, QBrush

                        leaf.setBackground(0, QBrush(QColor(134, 56, 250, 50)))  # #8638fa
                    except Exception:
                        pass
                parent.addChild(leaf)

            grp_root.setExpanded(True)
            for it in sections.values():
                it.setExpanded(True)

            # Reselect scope.
            if self._file_scope:
                self._select_file_in_tree(self._file_scope)
            else:
                self.file_tree.setCurrentItem(all_item)
        finally:
            self.file_tree.blockSignals(False)

    def _select_file_in_tree(self, file_path: str) -> None:
        if not file_path:
            return
        try:
            it = QTreeWidgetItemIterator(self.file_tree)
            while it.value():
                cur = it.value()
                if str(cur.data(0, Qt.UserRole) or "") == file_path:
                    self.file_tree.setCurrentItem(cur)
                    try:
                        self.file_tree.scrollToItem(cur)
                    except Exception:
                        pass
                    return
                it += 1
        except Exception:
            return

    def _on_file_tree_selection_changed(self) -> None:
        items = self.file_tree.selectedItems()
        if not items:
            return
        it = items[0]
        fp = str(it.data(0, Qt.UserRole) or "").strip()
        if fp == "__ALL__":
            self._file_scope = None
            self._render_segments()
            return
        if not fp:
            return
        self._file_scope = fp
        self._render_segments()
        if self._visible_segments:
            self.segment_list.setCurrentRow(0)

    def _render_segments(self) -> None:
        self.segment_list.blockSignals(True)
        try:
            self.segment_list.clear()
            self._visible_segments = self._filtered()
            total = len(self._project.segments) if self._project else 0
            vis = len(self._visible_segments)
            translated = sum(1 for s in self._visible_segments if str(s.get("target") or "").strip())
            self.progress.setText(f"Visible: {translated}/{vis} translated | Project segments: {total}")
            for s in self._visible_segments[:5000]:
                sid = str(s.get("id") or "")
                it = QListWidgetItem(self._format_segment_item(s))
                it.setData(Qt.UserRole, sid)
                st = str(s.get("status") or "new")
                it.setData(Qt.UserRole + 1, st)
                if st == "reviewed":
                    it.setForeground(Qt.gray)
                self.segment_list.addItem(it)
        finally:
            self.segment_list.blockSignals(False)

    def _format_segment_item(self, seg: dict[str, object]) -> str:
        fp = str(seg.get("file_path") or "")
        src = str(seg.get("source") or "").replace("\n", " ").strip()
        st = str(seg.get("status") or "new")
        badge = {"new": "[NEW]", "in_progress": "[IP]", "reviewed": "[REV]"}.get(st, "[?]")
        return f"{badge} {fp}: {src[:90]}"

    def _seg_by_id(self, sid: str | None) -> dict[str, object] | None:
        if not self._project or not sid:
            return None
        for s in self._project.segments:
            if str(s.get("id") or "") == sid:
                return s
        return None

    def _on_segment_selected(self, current: QListWidgetItem | None, _prev: QListWidgetItem | None) -> None:
        if current is None:
            return
        sid = str(current.data(Qt.UserRole) or "")
        self._current_segment_id = sid or None
        seg = self._seg_by_id(self._current_segment_id)
        if not seg:
            return
        self._load_segment(seg)

    def _load_segment(self, seg: dict[str, object]) -> None:
        file_path = str(seg.get("file_path") or "")
        location = str(seg.get("location") or "")
        self.file_title.setText(Path(file_path).name or "(untitled)")
        parts = [p.strip() for p in (file_path, location) if str(p or "").strip()]
        self.file_path.setText(" · ".join(parts))
        try:
            self.ws_file_title.setText(Path(file_path).name or "No file selected")
            crumb = Path(file_path).parent.as_posix().strip("/")
            crumb = "/".join([p for p in crumb.split("/") if p][-3:])
            self.ws_breadcrumb.setText(crumb or "Translate")
        except Exception:
            pass
        if file_path:
            try:
                if file_path in self._open_files_mru:
                    self._open_files_mru.remove(file_path)
                self._open_files_mru.insert(0, file_path)
                self._open_files_mru = self._open_files_mru[:12]
                self._render_file_tree()
                if self._file_scope:
                    self._select_file_in_tree(self._file_scope)
            except Exception:
                pass
        if file_path:
            try:
                if file_path in self._open_files_mru:
                    self._open_files_mru.remove(file_path)
                self._open_files_mru.insert(0, file_path)
                self._open_files_mru = self._open_files_mru[:12]
                self._render_file_tree()
                # If scoped to a file, keep the selection highlighted.
                if self._file_scope:
                    self._select_file_in_tree(self._file_scope)
            except Exception:
                pass

        src = str(seg.get("source") or "")
        tgt = str(seg.get("target") or "")
        self.editor_source.setPlainText(src)
        self.editor_raw.setPlainText(src)

        self.editor_target.blockSignals(True)
        try:
            self.editor_target.setPlainText(tgt)
        finally:
            self.editor_target.blockSignals(False)

        tuning = {
            "id": str(seg.get("id") or ""),
            "status": str(seg.get("status") or "new"),
            "file_path": file_path,
            "location": location,
            "updated_at": str(seg.get("updated_at") or ""),
            "note": str(seg.get("note") or ""),
        }
        try:
            self.editor_tuning.setPlainText(json.dumps(tuning, indent=2, ensure_ascii=False))
        except Exception:
            self.editor_tuning.setPlainText(str(tuning))
        self._render_context(seg)
        self._render_tm(seg)
        self._render_glossary(seg)
        self._render_validation(seg, target_override=tgt)
        self._update_cursor_status()

    def _clear_editor(self) -> None:
        self.file_title.setText("No file selected")
        self.file_path.setText("")
        try:
            self.ws_file_title.setText("No file selected")
            self.ws_breadcrumb.setText("Translate")
        except Exception:
            pass
        self.editor_source.setPlainText("")
        self.editor_target.setPlainText("")
        self.editor_raw.setPlainText("")
        self.editor_tuning.setPlainText("")
        self.ctx_label.setText("")
        self.tm_list.clear()
        self.gloss_list.clear()
        self.val_label.setText("")
        self.val_list.clear()
        self.warn_label.setText("0 issues")
        self.pos_label.setText("Ln 1, Col 1")

    def _render_context(self, seg: dict[str, object]) -> None:
        self.ctx_label.setText(
            "ID: {id}\nStatus: {status}\nFile: {file}\nLocation: {loc}".format(
                id=str(seg.get("id") or ""),
                status=str(seg.get("status") or "new"),
                file=str(seg.get("file_path") or ""),
                loc=str(seg.get("location") or ""),
            )
        )

    def _render_tm(self, seg: dict[str, object]) -> None:
        self.tm_list.clear()
        if not self._project:
            return
        src = str(seg.get("source") or "").strip()
        if not src:
            return
        entries = build_tm_from_segments(self._project.segments)
        for hit in suggest(entries, src, limit=8, min_score=70):
            it = QListWidgetItem(f"{hit.score:>3}  {hit.target.replace(chr(10), ' ')[:120]}")
            it.setData(Qt.UserRole, hit.target)
            self.tm_list.addItem(it)

    def _render_glossary(self, seg: dict[str, object]) -> None:
        self.gloss_list.clear()
        if not self._project:
            return
        src = str(seg.get("source") or "")
        for h in glossary_hits(self._project.glossary or [], src, limit=50):
            it = QListWidgetItem(f"{h.count}x  {h.source} -> {h.target}")
            it.setData(Qt.UserRole, h.target)
            self.gloss_list.addItem(it)

    def _render_validation(self, seg: dict[str, object], *, target_override: str | None) -> None:
        self.val_list.clear()
        if not self._project:
            return
        source = str(seg.get("source") or "")
        target = target_override if target_override is not None else str(seg.get("target") or "")
        src_ph = extract_placeholders(source)
        tgt_ph = extract_placeholders(target)
        missing = [p for p in src_ph if p not in tgt_ph]
        extra = [p for p in tgt_ph if p not in src_ph]
        self.val_label.setText(
            f"Placeholders: Source {len(src_ph)}  Target {len(tgt_ph)}\n"
            f"Missing: {', '.join(missing[:10]) or '(none)'}\n"
            f"Extra: {', '.join(extra[:10]) or '(none)'}"
        )

        shadow = dict(seg)
        shadow["target"] = target
        rules = dict(self._project.validation or {})
        for d in validate_segment(segment=shadow, glossary_entries=list(self._project.glossary or []), rules=rules)[:200]:
            self.val_list.addItem(f"{d.severity} {d.code}: {d.message}")

        # Keep the dual-pane status bar aligned with the asset ("Warning" / "Sync OK").
        diags = validate_segment(segment=shadow, glossary_entries=list(self._project.glossary or []), rules=rules)
        err_n = sum(1 for d in diags if str(d.severity).upper() in {"FATAL", "ERROR"})
        warn_n = sum(1 for d in diags if str(d.severity).upper() == "WARNING")
        if err_n:
            self.warn_icon.setText("error")
            self.warn_icon.setStyleSheet("color: #ef4444;")
            self.warn_label.setStyleSheet("font-family: Consolas; font-size: 9pt; color: #ef4444;")
            self.warn_label.setText(f"{err_n} Error" + ("" if err_n == 1 else "s"))
        elif warn_n:
            self.warn_icon.setText("warning")
            self.warn_icon.setStyleSheet("color: #eab308;")
            self.warn_label.setStyleSheet("font-family: Consolas; font-size: 9pt; color: #eab308;")
            self.warn_label.setText(f"{warn_n} Warning" + ("" if warn_n == 1 else "s"))
        else:
            self.warn_icon.setText("check_circle")
            self.warn_icon.setStyleSheet("color: rgba(255,255,255,0.55);")
            self.warn_label.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.55);")
            self.warn_label.setText("0 Issues")

    def _on_target_changed(self) -> None:
        seg = self._seg_by_id(self._current_segment_id)
        if not seg:
            return
        txt = self.editor_target.toPlainText()
        seg["target"] = txt
        if str(seg.get("status") or "new") == "new" and txt.strip():
            seg["status"] = "in_progress"
            self._render_context(seg)
        seg["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._render_validation(seg, target_override=txt)
        self._refresh_current_list_item(seg)
        self._render_segments_progress_only()
        self._update_cursor_status()

    def _on_note_changed(self) -> None:
        seg = self._seg_by_id(self._current_segment_id)
        if not seg:
            return
        # Note editing is not exposed in the dual-pane layout yet; keep hook for later.
        txt = str(seg.get("note") or "")
        seg["note"] = txt
        seg["updated_at"] = datetime.now(timezone.utc).isoformat()

    def _render_segments_progress_only(self) -> None:
        if not self._project:
            self.progress.setText("No project loaded.")
            return
        vis = len(self._visible_segments)
        translated = sum(1 for s in self._visible_segments if str(s.get("target") or "").strip())
        total = len(self._project.segments)
        self.progress.setText(f"Visible: {translated}/{vis} translated | Project segments: {total}")

    def _refresh_current_list_item(self, seg: dict[str, object]) -> None:
        it = self.segment_list.currentItem()
        if not it:
            return
        sid = str(it.data(Qt.UserRole) or "")
        if sid and sid == str(seg.get("id") or ""):
            it.setText(self._format_segment_item(seg))
            st = str(seg.get("status") or "new")
            it.setData(Qt.UserRole + 1, st)
            if st == "reviewed":
                it.setForeground(Qt.gray)
            else:
                it.setForeground(Qt.white)

    def _update_cursor_status(self) -> None:
        # Display Ln/Col in the style of the dual-pane template.
        editor = self.editor_target if self.output_tabs.currentWidget() == self.editor_target else self.editor_source
        try:
            cur = editor.textCursor()
            ln = cur.blockNumber() + 1
            col = cur.positionInBlock() + 1
            self.pos_label.setText(f"Ln {ln}, Col {col}")
        except Exception:
            self.pos_label.setText("Ln 1, Col 1")

    def _select_adjacent(self, delta: int) -> None:
        n = self.segment_list.count()
        if n <= 0:
            return
        cur = self.segment_list.currentRow()
        if cur < 0:
            cur = 0
        self.segment_list.setCurrentRow((cur + delta) % n)
        self.segment_list.scrollToItem(self.segment_list.currentItem())

    def _mark_reviewed(self) -> None:
        seg = self._seg_by_id(self._current_segment_id)
        if not seg:
            return
        seg["status"] = "reviewed"
        seg["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._render_context(seg)
        self._refresh_current_list_item(seg)

    def _apply_selected_tm(self, _item: QListWidgetItem | None = None) -> None:
        seg = self._seg_by_id(self._current_segment_id)
        if not seg:
            return
        it = self.tm_list.currentItem()
        if not it:
            return
        target = str(it.data(Qt.UserRole) or "")
        if not target.strip():
            return
        self.editor_target.blockSignals(True)
        try:
            self.editor_target.setPlainText(target)
        finally:
            self.editor_target.blockSignals(False)
        seg["target"] = target
        if str(seg.get("status") or "new") == "new":
            seg["status"] = "in_progress"
        seg["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._render_context(seg)
        self._render_validation(seg, target_override=target)
        self._refresh_current_list_item(seg)
        self._render_segments_progress_only()

    def _apply_selected_glossary(self, _item: QListWidgetItem | None = None) -> None:
        seg = self._seg_by_id(self._current_segment_id)
        if not seg:
            return
        it = self.gloss_list.currentItem()
        if not it:
            return
        pref = str(it.data(Qt.UserRole) or "")
        if not pref.strip():
            return
        existing = self.editor_target.toPlainText()
        next_target = pref if not existing.strip() else (existing + (" " if not existing.endswith(" ") else "") + pref)
        self.editor_target.blockSignals(True)
        try:
            self.editor_target.setPlainText(next_target)
        finally:
            self.editor_target.blockSignals(False)
        seg["target"] = next_target
        if str(seg.get("status") or "new") == "new" and next_target.strip():
            seg["status"] = "in_progress"
        seg["updated_at"] = datetime.now(timezone.utc).isoformat()
        self._render_context(seg)
        self._render_validation(seg, target_override=next_target)
        self._refresh_current_list_item(seg)
        self._render_segments_progress_only()

    def _next_untranslated(self) -> None:
        if not self._visible_segments:
            return
        start = 0
        if self._current_segment_id:
            ids = [str(s.get("id") or "") for s in self._visible_segments]
            if self._current_segment_id in ids:
                start = ids.index(self._current_segment_id) + 1
        for idx in list(range(start, len(self._visible_segments))) + list(range(0, start)):
            if not str(self._visible_segments[idx].get("target") or "").strip():
                self.segment_list.setCurrentRow(idx)
                self.segment_list.scrollToItem(self.segment_list.currentItem())
                return

    def goto_segment(self, segment_id: str) -> None:
        if not segment_id:
            return
        for i in range(self.segment_list.count()):
            it = self.segment_list.item(i)
            if not it:
                continue
            sid = str(it.data(Qt.UserRole) or "")
            if sid == segment_id:
                self.segment_list.setCurrentRow(i)
                self.segment_list.scrollToItem(it)
                return


class QAPage(QWidget):
    goto_segment = Signal(str)

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None
        self._rows: list[dict[str, object]] = []
        self._chip = "ALL"  # ALL | ERROR | WARNING | INFO

        root = QVBoxLayout(self)
        root.setContentsMargins(24, 24, 24, 24)
        root.setSpacing(14)

        header = QHBoxLayout()
        header.setSpacing(10)
        header.addWidget(H2("Global Diagnostics"))
        header.addStretch(1)
        self.btn_open_pane = QPushButton("Open Pane")
        self.btn_open_pane.setObjectName("Chip")
        self.btn_open_pane.clicked.connect(self._open_pane)
        header.addWidget(self.btn_open_pane)
        self.btn_share = QToolButton()
        self.btn_share.setObjectName("IconButton")
        self.btn_share.setText("⤴")
        self.btn_share.setToolTip("Export diagnostics")
        header.addWidget(self.btn_share)
        self.btn_clear = QToolButton()
        self.btn_clear.setObjectName("IconButton")
        self.btn_clear.setText("🗑")
        self.btn_clear.setToolTip("Clear diagnostics")
        self.btn_clear.clicked.connect(self._clear_diagnostics)
        header.addWidget(self.btn_clear)
        self.btn_fix_next = QPushButton("Fix Next")
        self.btn_fix_next.setObjectName("Chip")
        self.btn_fix_next.clicked.connect(self._fix_next)
        header.addWidget(self.btn_fix_next)
        root.addLayout(header)

        chips = QHBoxLayout()
        chips.setSpacing(10)
        # Use ChipButton components
        self.chip_all = ChipButton("All", active=True)
        self.chip_all.clicked.connect(lambda: self._set_chip("ALL"))

        self.chip_err = ChipButton("⛔ Errors", active=False)
        self.chip_err.clicked.connect(lambda: self._set_chip("ERROR"))

        self.chip_warn = ChipButton("⚠ Warnings", active=False)
        self.chip_warn.clicked.connect(lambda: self._set_chip("WARNING"))

        self.chip_info = ChipButton("ℹ Info", active=False)
        self.chip_info.clicked.connect(lambda: self._set_chip("INFO"))

        for b in (self.chip_all, self.chip_err, self.chip_warn, self.chip_info):
            chips.addWidget(b)
        chips.addStretch(1)
        root.addLayout(chips)

        # Use SearchBar component
        self.search = SearchBar(placeholder="Search diagnostics...")
        self.search.textChanged.connect(self._render)
        root.addWidget(self.search)

        self.summary = Muted("No project loaded.")
        root.addWidget(self.summary)

        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.NoFrame)
        root.addWidget(self.scroll, 1)

        self.list_host = QWidget()
        self.scroll.setWidget(self.list_host)
        self.list_layout = QVBoxLayout(self.list_host)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(10)
        self.list_layout.addStretch(1)
        self._pane: GlobalDiagnosticsPane | None = None

    def set_project(self, project: Project) -> None:
        self._project = project
        self._render()

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

    def _filtered(self) -> list[dict[str, object]]:
        if not self._project:
            return []
        diags = list(self._project.diagnostics or [])
        q = self.search.text().strip().lower()
        out: list[dict[str, object]] = []
        for d in diags:
            sev = str(d.get("severity") or "").strip().upper()
            if self._chip == "ERROR" and sev not in {"FATAL", "ERROR"}:
                continue
            if self._chip == "WARNING" and sev != "WARNING":
                continue
            if self._chip == "INFO" and sev != "INFO":
                continue
            if q:
                hay = " ".join(
                    [
                        str(d.get("category") or ""),
                        str(d.get("code") or ""),
                        str(d.get("message") or ""),
                        str(d.get("file_path") or ""),
                        str(d.get("location") or ""),
                    ]
                ).lower()
                if q not in hay:
                    continue
            out.append(d)
        return out

    def _render(self) -> None:
        # Update chip counts.
        all_rows = list(self._project.diagnostics or []) if self._project else []
        err_n = sum(1 for d in all_rows if str(d.get("severity") or "").upper() in {"FATAL", "ERROR"})
        warn_n = sum(1 for d in all_rows if str(d.get("severity") or "").upper() == "WARNING")
        info_n = sum(1 for d in all_rows if str(d.get("severity") or "").upper() == "INFO")
        self.chip_err.setText(f"⛔ Errors {err_n}")
        self.chip_warn.setText(f"⚠ Warnings {warn_n}")
        self.chip_info.setText(f"ℹ Info {info_n}")

        # Rebuild list.
        while self.list_layout.count() > 1:
            item = self.list_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.setParent(None)

        if not self._project:
            self.summary.setText("No project loaded.")
            self._rows = []
            return

        rows = self._filtered()
        self._rows = rows
        self.summary.setText(f"Visible: {len(rows)} issues")

        for d in rows[:400]:
            card = CardFrame(shadow=False)
            row = QHBoxLayout(card)
            row.setContentsMargins(12, 12, 12, 12)
            row.setSpacing(12)

            sev = str(d.get("severity") or "").upper()
            icon = QLabel("!")
            icon.setAlignment(Qt.AlignCenter)
            icon.setFixedSize(36, 36)
            if sev in {"FATAL", "ERROR"}:
                icon.setStyleSheet("border-radius: 12px; background: rgba(239,68,68,0.18); color: #ef4444; font-weight: 900;")
            elif sev == "WARNING":
                icon.setStyleSheet("border-radius: 12px; background: rgba(234,179,8,0.18); color: #eab308; font-weight: 900;")
            else:
                icon.setStyleSheet("border-radius: 12px; background: rgba(134,56,250,0.18); color: #8638fa; font-weight: 900;")
            row.addWidget(icon)

            text_col = QVBoxLayout()
            text_col.setContentsMargins(0, 0, 0, 0)
            text_col.setSpacing(2)
            title = QLabel(str(d.get("code") or d.get("message") or "Issue"))
            title.setStyleSheet("font-weight: 800;")
            subtitle = Muted(
                f"{str(d.get('file_path') or '')}  {str(d.get('message') or '')}".strip()
            )
            subtitle.setStyleSheet("font-size: 9pt;")
            text_col.addWidget(title)
            text_col.addWidget(subtitle)
            row.addLayout(text_col, 1)

            seg_id = str(d.get("segment_id") or "").strip()
            if seg_id:
                btn = QToolButton()
                btn.setObjectName("IconButton")
                btn.setText("›")
                btn.clicked.connect(lambda _c=False, sid=seg_id: self.goto_segment.emit(sid))
                row.addWidget(btn)
            else:
                chev = QLabel("›")
                chev.setObjectName("Muted")
                chev.setStyleSheet("font-size: 14pt;")
                row.addWidget(chev)

            self.list_layout.insertWidget(self.list_layout.count() - 1, card)

    def _set_chip(self, sev: str) -> None:
        self._chip = sev
        mapping = {
            "ALL": self.chip_all,
            "ERROR": self.chip_err,
            "WARNING": self.chip_warn,
            "INFO": self.chip_info,
        }
        for k, b in mapping.items():
            b.setObjectName("ChipActive" if k == sev else "Chip")
            b.style().unpolish(b)
            b.style().polish(b)
            b.setChecked(k == sev)
        self._render()

    def _fix_next(self) -> None:
        if not self._rows:
            return
        for d in self._rows:
            sid = str(d.get("segment_id") or "").strip()
            if not sid:
                continue
            sev = str(d.get("severity") or "").upper()
            if sev in {"FATAL", "ERROR", "WARNING", "INFO"}:
                self.goto_segment.emit(sid)
                return

    def _clear_diagnostics(self) -> None:
        if not self._project:
            return
        try:
            self._project.diagnostics = []  # type: ignore[assignment]
        except Exception:
            return
        self._render()


class BuildPage(QWidget):
    request_build_folder = Signal(Path)
    request_build_zip = Signal(Path)

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None
        self._activity_chip = "ALL"  # ALL | PASSING | FAILED | DRAFTS

        root = QVBoxLayout(self)
        root.setContentsMargins(24, 24, 24, 24)
        root.setSpacing(14)

        header = QHBoxLayout()
        header.addWidget(H2("Build History"))
        header.addStretch(1)
        root.addLayout(header)

        self.mode_tabs = QTabWidget()
        root.addWidget(self.mode_tabs, 1)

        # --- History tab (existing build history UI) ---
        history = QWidget()
        hroot = QVBoxLayout(history)
        hroot.setContentsMargins(0, 0, 0, 0)
        hroot.setSpacing(14)

        # Use SearchBar component
        self.search = SearchBar(placeholder="Search output path or timestamp...")
        self.search.textChanged.connect(self._render)
        hroot.addWidget(self.search)

        chips = QHBoxLayout()
        chips.setSpacing(10)
        # Use ChipButton components
        self.chip_all = ChipButton("All Builds", active=True)
        self.chip_all.clicked.connect(lambda: self._set_chip("ALL"))
        self.chip_failed = ChipButton("Failed", active=False)
        self.chip_failed.clicked.connect(lambda: self._set_chip("FAILED"))
        self.chip_success = ChipButton("Success", active=False)
        self.chip_success.clicked.connect(lambda: self._set_chip("SUCCESS"))
        for b in (self.chip_all, self.chip_failed, self.chip_success):
            chips.addWidget(b)
        chips.addStretch(1)
        hroot.addLayout(chips)

        self.summary = Muted("No project loaded.")
        hroot.addWidget(self.summary)

        split = QSplitter(Qt.Vertical)
        hroot.addWidget(split, 1)

        # Top: list of builds as cards.
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.NoFrame)
        split.addWidget(self.scroll)

        self.list_host = QWidget()
        self.scroll.setWidget(self.list_host)
        self.list_layout = QVBoxLayout(self.list_host)
        self.list_layout.setContentsMargins(0, 0, 0, 0)
        self.list_layout.setSpacing(10)
        self.list_layout.addStretch(1)

        # Bottom: details + build actions.
        bottom = QWidget()
        b_l = QVBoxLayout(bottom)
        b_l.setContentsMargins(0, 0, 0, 0)
        b_l.setSpacing(10)

        actions = CardFrame(shadow=False)
        a_l = QVBoxLayout(actions)
        a_l.setContentsMargins(12, 12, 12, 12)
        a_l.setSpacing(10)

        row1 = QHBoxLayout()
        self.out_folder = QLineEdit()
        self.out_folder.setPlaceholderText("Output folder...")
        btn_browse_folder = QPushButton("Browse...")
        btn_browse_folder.clicked.connect(self._browse_folder)
        btn_build_folder = QPushButton("Build Folder")
        btn_build_folder.setObjectName("Primary")
        btn_build_folder.clicked.connect(self._do_build_folder)
        row1.addWidget(self.out_folder, 1)
        row1.addWidget(btn_browse_folder)
        row1.addWidget(btn_build_folder)
        a_l.addLayout(row1)

        row2 = QHBoxLayout()
        self.out_zip = QLineEdit()
        self.out_zip.setPlaceholderText("Output zip...")
        btn_browse_zip = QPushButton("Browse...")
        btn_browse_zip.clicked.connect(self._browse_zip)
        btn_build_zip = QPushButton("Build Zip")
        btn_build_zip.setObjectName("Primary")
        btn_build_zip.clicked.connect(self._do_build_zip)
        row2.addWidget(self.out_zip, 1)
        row2.addWidget(btn_browse_zip)
        row2.addWidget(btn_build_zip)
        a_l.addLayout(row2)

        b_l.addWidget(actions)

        self.details_tabs = QTabWidget()
        self.details_tabs.addTab(self._details_diagnostics_tab(), "Diagnostics")
        self.details_tabs.addTab(self._details_stub("Artifacts"), "Artifacts")
        self.details_tabs.addTab(self._details_stub("Commits"), "Commits")
        b_l.addWidget(self.details_tabs, 1)
        split.addWidget(bottom)
        split.setSizes([520, 260])

        self.mode_tabs.addTab(history, "History")

        # --- Activity tab (asset: build_activity_tab) ---
        activity = QWidget()
        aroot = QVBoxLayout(activity)
        aroot.setContentsMargins(0, 0, 0, 0)
        aroot.setSpacing(12)

        self.activity_context = Muted("No project loaded.")
        self.activity_context.setProperty("role", "caption")
        aroot.addWidget(self.activity_context)

        achips = QHBoxLayout()
        achips.setSpacing(10)
        # Use ChipButton components
        self.activity_all = ChipButton("All Builds", active=True)
        self.activity_all.clicked.connect(lambda: self._set_activity_chip("ALL"))
        self.activity_passing = ChipButton("Passing", active=False)
        self.activity_passing.clicked.connect(lambda: self._set_activity_chip("PASSING"))
        self.activity_failed = ChipButton("Failed", active=False)
        self.activity_failed.clicked.connect(lambda: self._set_activity_chip("FAILED"))
        self.activity_drafts = ChipButton("Drafts", active=False)
        self.activity_drafts.clicked.connect(lambda: self._set_activity_chip("DRAFTS"))
        for b in (self.activity_all, self.activity_passing, self.activity_failed, self.activity_drafts):
            achips.addWidget(b)
        achips.addStretch(1)
        aroot.addLayout(achips)

        self.activity_scroll = QScrollArea()
        self.activity_scroll.setWidgetResizable(True)
        self.activity_scroll.setFrameShape(QFrame.NoFrame)
        aroot.addWidget(self.activity_scroll, 1)

        self.activity_host = QWidget()
        self.activity_scroll.setWidget(self.activity_host)
        self.activity_layout = QVBoxLayout(self.activity_host)
        self.activity_layout.setContentsMargins(0, 0, 0, 0)
        self.activity_layout.setSpacing(10)
        self.activity_layout.addStretch(1)

        self.mode_tabs.addTab(activity, "Activity")

        self._chip = "ALL"
        self._selected_build: dict[str, object] | None = None

    def set_project(self, project: Project) -> None:
        self._project = project
        self._render()

    def _render(self) -> None:
        while self.list_layout.count() > 1:
            item = self.list_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.setParent(None)

        if not self._project:
            self.summary.setText("No project loaded.")
            self._selected_build = None
            self._render_build_details(None)
            self.activity_context.setText("No project loaded.")
            self._render_activity([])
            return

        raw = list(self._project.build_history or [])[-200:][::-1]
        q = self.search.text().strip().lower()

        def build_status(b: dict[str, object]) -> str:
            diags = list(b.get("diagnostics") or [])
            has_err = any(str(d.get("severity") or "").upper() in {"FATAL", "ERROR"} for d in diags)
            return "FAILED" if has_err else "SUCCESS"

        rows = []
        for b in raw:
            st = build_status(b)
            if self._chip != "ALL" and st != self._chip:
                continue
            hay = " ".join([str(b.get("built_at") or ""), str(b.get("output") or ""), str(b.get("format") or "")]).lower()
            if q and q not in hay:
                continue
            rows.append(b)

        self.summary.setText(f"Visible: {len(rows)} builds")

        for b in rows:
            card = CardFrame(shadow=False)
            row = QHBoxLayout(card)
            row.setContentsMargins(12, 12, 12, 12)
            row.setSpacing(12)

            st = build_status(b)
            badge = QLabel(st)
            badge.setStyleSheet(self._badge_style("success" if st == "SUCCESS" else "error"))
            row.addWidget(badge)

            text_col = QVBoxLayout()
            text_col.setContentsMargins(0, 0, 0, 0)
            text_col.setSpacing(2)
            title = QLabel(str(b.get("built_at") or "Build"))
            title.setStyleSheet("font-weight: 800;")
            sub = Muted(f"{b.get('format') or ''} · {b.get('output') or ''}")
            sub.setStyleSheet("font-size: 9pt;")
            text_col.addWidget(title)
            text_col.addWidget(sub)
            row.addLayout(text_col, 1)

            btn = QToolButton()
            btn.setObjectName("IconButton")
            btn.setText("View")
            btn.clicked.connect(lambda _c=False, build=b: self._select_build(build))
            row.addWidget(btn)

            self.list_layout.insertWidget(self.list_layout.count() - 1, card)

        if self._selected_build is None and rows:
            self._select_build(rows[0])

        # Keep Activity view in sync.
        try:
            self.activity_context.setText(f"Project: {getattr(self._project, 'name', '') or 'Current'}")
        except Exception:
            self.activity_context.setText("Project: Current")
        self._render_activity(rows)

    def _set_activity_chip(self, kind: str) -> None:
        self._activity_chip = kind
        mapping = {
            "ALL": self.activity_all,
            "PASSING": self.activity_passing,
            "FAILED": self.activity_failed,
            "DRAFTS": self.activity_drafts,
        }
        for k, b in mapping.items():
            b.setObjectName("ChipActive" if k == kind else "Chip")
            b.style().unpolish(b)
            b.style().polish(b)
            b.setChecked(k == kind)
        self._render()

    def _render_activity(self, builds: list[dict[str, object]]) -> None:
        # Rebuild list.
        while self.activity_layout.count() > 1:
            item = self.activity_layout.takeAt(0)
            w = item.widget()
            if w is not None:
                w.setParent(None)

        def status_for(b: dict[str, object]) -> str:
            diags = list(b.get("diagnostics") or [])
            err = any(str(d.get("severity") or "").upper() in {"FATAL", "ERROR"} for d in diags)
            if err:
                return "FAILED"
            return "PASSING"

        shown = 0
        for b in builds[:120]:
            st = status_for(b)
            if self._activity_chip == "FAILED" and st != "FAILED":
                continue
            if self._activity_chip == "PASSING" and st != "PASSING":
                continue
            if self._activity_chip == "DRAFTS":
                continue
            self.activity_layout.insertWidget(self.activity_layout.count() - 1, self._activity_card(b, st))
            shown += 1

        if shown == 0:
            empty = Muted("No builds match the current filter.")
            self.activity_layout.insertWidget(self.activity_layout.count() - 1, empty)

    def _activity_card(self, b: dict[str, object], st: str) -> QWidget:
        card = CardFrame(shadow=False)
        card.setCursor(Qt.PointingHandCursor)
        border = "#22c55e" if st == "PASSING" else "#ef4444"
        bg = "rgba(34,197,94,0.06)" if st == "PASSING" else "rgba(239,68,68,0.06)"
        card.setStyleSheet(
            f"QFrame#Card{{border-left: 4px solid {border}; background: {bg};}}"
        )
        row = QHBoxLayout(card)
        row.setContentsMargins(12, 12, 12, 12)
        row.setSpacing(12)

        icon = QFrame()
        icon.setFixedSize(40, 40)
        icon.setStyleSheet(
            f"border-radius: 12px; background: {bg}; border: 1px solid rgba(255,255,255,0.06);"
        )
        il = QHBoxLayout(icon)
        il.setContentsMargins(0, 0, 0, 0)
        il.addWidget(QLabel("✓" if st == "PASSING" else "!"), 0, Qt.AlignCenter)
        row.addWidget(icon)

        col = QVBoxLayout()
        col.setContentsMargins(0, 0, 0, 0)
        col.setSpacing(4)
        built_at = str(b.get("built_at") or "")
        try:
            built_at_short = built_at.split("T")[0]
        except Exception:
            built_at_short = built_at
        title = QLabel(f"{st} · {built_at_short or 'Build'}")
        title.setStyleSheet("font-family: Consolas; font-weight: 800;")
        col.addWidget(title)
        fmt = str(b.get("format") or "")
        out = str(b.get("output") or "")
        col.addWidget(Muted(f"{fmt} · {out}".strip(" ·")))
        row.addLayout(col, 1)

        chev = QLabel("›")
        chev.setObjectName("Muted")
        chev.setStyleSheet("font-size: 18pt;")
        row.addWidget(chev)

        card.mousePressEvent = lambda _ev, build=b: self._select_build(build)  # type: ignore[assignment]
        return card

    def _badge_style(self, kind: str) -> str:
        kind = (kind or "").lower()
        if kind == "success":
            return (
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                "background: rgba(34,197,94,0.18); color: #22c55e; border: 1px solid rgba(34,197,94,0.18);"
            )
        if kind == "error":
            return (
                "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
                "background: rgba(239,68,68,0.18); color: #ef4444; border: 1px solid rgba(239,68,68,0.18);"
            )
        return (
            "padding: 3px 8px; border-radius: 999px; font-size: 9pt; font-weight: 800;"
            "background: rgba(255,255,255,0.10); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.10);"
        )

    def _browse_folder(self) -> None:
        p = QFileDialog.getExistingDirectory(self, "Choose Output Folder")
        if p:
            self.out_folder.setText(p)

    def _browse_zip(self) -> None:
        p, _ = QFileDialog.getSaveFileName(self, "Choose Output Zip", "", "Zip (*.zip)")
        if p:
            self.out_zip.setText(p)

    def _do_build_folder(self) -> None:
        if not self._project:
            return
        p = self.out_folder.text().strip()
        if not p:
            return
        self.request_build_folder.emit(Path(p))

    def _do_build_zip(self) -> None:
        if not self._project:
            return
        p = self.out_zip.text().strip()
        if not p:
            return
        self.request_build_zip.emit(Path(p))

    def _set_chip(self, kind: str) -> None:
        self._chip = kind
        mapping = {
            "ALL": self.chip_all,
            "FAILED": self.chip_failed,
            "SUCCESS": self.chip_success,
        }
        for k, b in mapping.items():
            b.setObjectName("ChipActive" if k == kind else "Chip")
            b.style().unpolish(b)
            b.style().polish(b)
            b.setChecked(k == kind)
        self._render()

    def _select_build(self, build: dict[str, object]) -> None:
        self._selected_build = build
        self._render_build_details(build)

    def _details_diagnostics_tab(self) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        self.diag_text = QTextEdit()
        self.diag_text.setReadOnly(True)
        self.diag_text.setPlaceholderText("Select a build to see diagnostics.")
        l.addWidget(self.diag_text, 1)

        btns = QHBoxLayout()
        btns.addStretch(1)
        self.btn_open_output = QPushButton("Open Output")
        self.btn_open_output.setObjectName("Chip")
        self.btn_open_output.clicked.connect(self._open_selected_output_path)
        btns.addWidget(self.btn_open_output)
        l.addLayout(btns)
        return w

    def _details_stub(self, title: str) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setContentsMargins(12, 12, 12, 12)
        l.setSpacing(10)
        l.addWidget(Muted(f"{title} view coming soon."))
        l.addStretch(1)
        return w

    def _render_build_details(self, build: dict[str, object] | None) -> None:
        if not hasattr(self, "diag_text"):
            return
        if not build:
            self.diag_text.setPlainText("")
            return
        diags = list(build.get("diagnostics") or [])
        lines: list[str] = []
        lines.append(f"Built at: {build.get('built_at')}")
        lines.append(f"Output: {build.get('output')}")
        lines.append(f"Files written: {build.get('files_written')}  Segments applied: {build.get('segments_applied')}")
        lines.append("")
        for d in diags[:300]:
            lines.append(f"[{d.get('severity')}] {d.get('category')}/{d.get('code')}: {d.get('message')}")
        self.diag_text.setPlainText("\n".join(lines))

    def _open_selected_output_path(self) -> None:
        if not self._selected_build:
            return
        out = str(self._selected_build.get("output") or "").strip()
        if not out:
            return
        try:
            os.startfile(out)  # type: ignore[attr-defined]
        except Exception:
            return


class SettingsPage(QWidget):
    apply_settings = Signal(dict)

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
        l.setSpacing(16)

        l.addWidget(H2("Global Settings"))
        l.addWidget(Muted("Theme, language, autosave, and validation defaults."))

        general = CardFrame(shadow=False)
        g_l = QVBoxLayout(general)
        g_l.setContentsMargins(12, 12, 12, 12)
        g_l.setSpacing(12)
        g_l.addWidget(H2("General"))

        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["Dark Mode (Default)"])
        self.lang_combo = QComboBox()
        self.lang_combo.addItems(["English (US)"])

        row = QHBoxLayout()
        row.addWidget(Muted("App Theme"))
        row.addWidget(self.theme_combo, 1)
        g_l.addLayout(row)
        row2 = QHBoxLayout()
        row2.addWidget(Muted("Interface Language"))
        row2.addWidget(self.lang_combo, 1)
        g_l.addLayout(row2)

        # Use ToggleSwitch components
        autosave_row = QHBoxLayout()
        autosave_row.addWidget(Muted("Autosave"))
        self.autosave_toggle = ToggleSwitch(checked=True)
        autosave_row.addWidget(self.autosave_toggle)
        autosave_row.addStretch(1)
        g_l.addLayout(autosave_row)

        telemetry_row = QHBoxLayout()
        telemetry_row.addWidget(Muted("Anonymous Telemetry"))
        self.telemetry_toggle = ToggleSwitch(checked=False)
        telemetry_row.addWidget(self.telemetry_toggle)
        telemetry_row.addStretch(1)
        g_l.addLayout(telemetry_row)
        l.addWidget(general)

        validation = CardFrame(shadow=False)
        v_l = QVBoxLayout(validation)
        v_l.setContentsMargins(12, 12, 12, 12)
        v_l.setSpacing(12)
        v_l.addWidget(H2("Validation"))
        desc = Muted("Leave Enabled Rules empty to use defaults. One rule id/regex per line.")
        desc.setProperty("role", "caption")
        v_l.addWidget(desc)

        self.src_locale = QLineEdit()
        self.src_locale.setPlaceholderText("en_US")
        self.tgt_locale = QLineEdit()
        self.tgt_locale.setPlaceholderText("fr_FR")
        lr = QHBoxLayout()
        lr.addWidget(Muted("Source"))
        lr.addWidget(self.src_locale)
        lr.addWidget(Muted("Target"))
        lr.addWidget(self.tgt_locale)
        v_l.addLayout(lr)

        enabled_label = Muted("Enabled Rules")
        enabled_label.setProperty("role", "caption")
        enabled_label.setStyleSheet("text-transform: uppercase; letter-spacing: 1px;")
        v_l.addWidget(enabled_label)
        self.enabled_rules = QTextEdit()
        self.enabled_rules.setPlaceholderText("placeholder_parity\npreserve_whitespace\n...")
        v_l.addWidget(self.enabled_rules)

        token_label = Muted("Token Regexes")
        token_label.setProperty("role", "caption")
        token_label.setStyleSheet("text-transform: uppercase; letter-spacing: 1px;")
        v_l.addWidget(token_label)
        self.token_regexes = QTextEdit()
        self.token_regexes.setPlaceholderText(r"%\d+s\n\{[^}]+\}\n...")
        v_l.addWidget(self.token_regexes)
        l.addWidget(validation)

        btn_row = QHBoxLayout()
        btn_row.addStretch(1)
        self.btn_apply = QPushButton("Save")
        self.btn_apply.setObjectName("Primary")
        self.btn_apply.clicked.connect(self._emit_apply)
        btn_row.addWidget(self.btn_apply)
        l.addLayout(btn_row)

        self.summary = Muted("")
        l.addWidget(self.summary)

    def set_project(self, project: Project) -> None:
        self._project = project
        self._load_from_project()

    def _load_from_project(self) -> None:
        if not self._project:
            self.summary.setText("No project loaded.")
            return
        self.src_locale.setText(str(self._project.source_locale or "en_US"))
        self.tgt_locale.setText(str(self._project.target_locale or "en_US"))
        rules = dict(self._project.validation or {})
        enabled = rules.get("enabled_rules") or []
        if not isinstance(enabled, list):
            enabled = [str(enabled)]
        self.enabled_rules.setPlainText("\n".join(str(x) for x in enabled if str(x).strip()))
        token_rx = rules.get("token_regexes") or []
        if not isinstance(token_rx, list):
            token_rx = [str(token_rx)]
        self.token_regexes.setPlainText("\n".join(str(x) for x in token_rx if str(x).strip()))
        self.summary.setText("Tip: leave Enabled Rules empty to use defaults.")

    def _emit_apply(self) -> None:
        enabled = [ln.strip() for ln in self.enabled_rules.toPlainText().splitlines() if ln.strip()]
        token_rx = [ln.strip() for ln in self.token_regexes.toPlainText().splitlines() if ln.strip()]
        validation: dict[str, object] = {}
        if enabled:
            validation["enabled_rules"] = enabled
        if token_rx:
            validation["token_regexes"] = token_rx
        self.apply_settings.emit(
            {
                "source_locale": self.src_locale.text().strip(),
                "target_locale": self.tgt_locale.text().strip(),
                "validation": validation,
            }
        )
