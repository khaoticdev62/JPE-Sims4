from __future__ import annotations

from datetime import datetime, timezone
import os
from pathlib import Path

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
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

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H2, MaterialIcon, Muted, set_toolbutton_icon

try:  # Optional; dashboard should not hard-fail if core isn't importable.
    from jpe_sims4.storage import load_project
except Exception:  # pragma: no cover
    load_project = None  # type: ignore[assignment]


class Dashboard2Page(QWidget):
    """
    Desktop dashboard aligned to `JPE assets folder/project_dashboard_2`.

    This page is "full shell": it provides its own sidebar + header and requests
    navigation through signals.
    """

    request_nav_index = Signal(int)
    request_import = Signal()
    request_open_project_json = Signal(str)
    request_open_project_detail_json = Signal(str)

    def __init__(self) -> None:
        super().__init__()
        self.setProperty("full_shell", True)

        c = DESIGN.colors

        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        self.setStyleSheet(
            "background: qradialgradient(cx: 1, cy: 0, radius: 1.2, fx: 1, fy: 0,"
            " stop: 0 rgba(134,56,250,0.14), stop: 0.35 rgba(59,130,246,0.05), stop: 1 #170f23);"
        )

        # --- Sidebar (matches asset left nav) ---
        aside = QFrame()
        aside.setFixedWidth(320)
        aside.setStyleSheet(f"background: {c.surface}; border-right: 1px solid rgba(255,255,255,0.05);")
        root.addWidget(aside)
        al = QVBoxLayout(aside)
        al.setContentsMargins(18, 18, 18, 18)
        al.setSpacing(14)

        brand = QFrame()
        brand.setFixedHeight(84)
        brand.setStyleSheet("border-bottom: 1px solid rgba(255,255,255,0.05);")
        bl = QHBoxLayout(brand)
        bl.setContentsMargins(8, 10, 8, 10)
        bl.setSpacing(14)
        logo = QFrame()
        logo.setFixedSize(48, 48)
        logo.setStyleSheet(
            "border-radius: 16px;"
            "background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #8638fa, stop:1 #6d28d9);"
            "border: 1px solid rgba(255,255,255,0.10);"
        )
        ll = QHBoxLayout(logo)
        ll.setContentsMargins(0, 0, 0, 0)
        ic = MaterialIcon("translate", size_px=28)
        ic.setStyleSheet("color: white;")
        ll.addWidget(ic, 0, Qt.AlignCenter)
        bl.addWidget(logo)
        title_col = QVBoxLayout()
        title_col.setContentsMargins(0, 0, 0, 0)
        title_col.setSpacing(4)
        t = QLabel("JPE Suite")
        t.setStyleSheet("font-size: 14pt; font-weight: 900; letter-spacing: 0.2px;")
        title_col.addWidget(t)
        badge_row = QHBoxLayout()
        badge_row.setContentsMargins(0, 0, 0, 0)
        badge_row.setSpacing(8)
        ver = QLabel("v2.4.0")
        ver.setStyleSheet("font-family: Consolas; font-size: 9pt; color: rgba(255,255,255,0.45);")
        pro = QLabel("PRO")
        pro.setStyleSheet(
            "font-size: 8pt; font-weight: 800; letter-spacing: 1px;"
            "padding: 2px 6px; border-radius: 6px;"
            "background: rgba(134,56,250,0.18); color: #8638fa; border: 1px solid rgba(134,56,250,0.15);"
        )
        badge_row.addWidget(ver)
        badge_row.addWidget(pro)
        badge_row.addStretch(1)
        title_col.addLayout(badge_row)
        bl.addLayout(title_col, 1)
        al.addWidget(brand)

        self.nav_dashboard = self._nav_item("Dashboard", "dashboard", active=True, idx=0)
        self.nav_projects = self._nav_item("Projects", "folder", active=False, idx=1)
        self.nav_stats = self._nav_item("Statistics", "analytics", active=False, idx=0)

        al.addWidget(self.nav_dashboard)
        al.addWidget(self.nav_projects)
        al.addWidget(self.nav_stats)

        res = QLabel("RESOURCES")
        res.setStyleSheet("font-size: 9pt; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.28);")
        res.setAlignment(Qt.AlignCenter)
        al.addSpacing(10)
        al.addWidget(res)
        al.addWidget(self._nav_item("Documentation", "menu_book", active=False, idx=6))
        al.addWidget(self._nav_item("Community", "forum", active=False, idx=7))
        al.addStretch(1)

        self.btn_settings = QPushButton("Settings")
        self.btn_settings.setObjectName("Chip")
        self.btn_settings.clicked.connect(lambda: self.request_nav_index.emit(11))
        al.addWidget(self.btn_settings)

        profile = CardFrame(shadow=False)
        profile.setStyleSheet("background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);")
        pl = QHBoxLayout(profile)
        pl.setContentsMargins(12, 12, 12, 12)
        pl.setSpacing(12)
        avatar = QFrame()
        avatar.setFixedSize(44, 44)
        avatar.setStyleSheet(
            "border-radius: 22px;"
            "background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #8638fa, stop:1 #4f46e5);"
            "border: 2px solid rgba(134,56,250,0.25);"
        )
        avl = QHBoxLayout(avatar)
        avl.setContentsMargins(0, 0, 0, 0)
        avtxt = QLabel("D")
        avtxt.setStyleSheet("font-weight: 900;")
        avtxt.setAlignment(Qt.AlignCenter)
        avl.addWidget(avtxt, 0, Qt.AlignCenter)
        pl.addWidget(avatar)
        pt = QVBoxLayout()
        pt.setContentsMargins(0, 0, 0, 0)
        pt.setSpacing(2)
        u = QLabel("DevUser_01")
        u.setStyleSheet("font-weight: 800;")
        pt.addWidget(u)
        pt.addWidget(Muted("Pro License"))
        pl.addLayout(pt, 1)
        al.addWidget(profile)

        # --- Main content ---
        main = QFrame()
        main.setStyleSheet(f"background: {c.background};")
        root.addWidget(main, 1)
        ml = QVBoxLayout(main)
        ml.setContentsMargins(0, 0, 0, 0)
        ml.setSpacing(0)  # Use 0 spacing between major components, control spacing in inner layouts

        header = QFrame()
        header.setMinimumHeight(70)  # Allow header to have minimum height but expand if needed
        header.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
        header.setStyleSheet(
            "background: rgba(23,15,35,0.90);"
            "border-bottom: 1px solid rgba(255,255,255,0.05);"
        )
        hl = QHBoxLayout(header)
        hl.setContentsMargins(DESIGN.spacing.xl, DESIGN.spacing.lg, DESIGN.spacing.xl, DESIGN.spacing.lg)  # 28,16,28,16px margins
        hl.setSpacing(DESIGN.spacing.lg)  # 18px spacing

        left_col = QVBoxLayout()
        left_col.setContentsMargins(0, 0, 0, 0)
        left_col.setSpacing(DESIGN.spacing.xs)  # 6px spacing
        crumbs = QLabel("Home  >  Dashboard")
        crumbs.setStyleSheet("font-size: 9pt; color: rgba(255,255,255,0.45);")
        left_col.addWidget(crumbs)
        title = QLabel("Project Dashboard")
        title.setStyleSheet("font-size: 20pt; font-weight: 900;")
        left_col.addWidget(title)
        hl.addLayout(left_col)

        hl.addStretch(1)

        self.search = QLineEdit()
        self.search.setPlaceholderText("Search projects, strings, or tags...")
        self.search.setStyleSheet(
            "border-radius: 16px;"
            "padding: 12px 44px 12px 44px;"
            "background: rgba(24,16,35,1.0);"
            "border: 1px solid rgba(255,255,255,0.10);"
        )
        search_wrap = QFrame()
        swl = QHBoxLayout(search_wrap)
        swl.setContentsMargins(0, 0, 0, 0)
        swl.setSpacing(0)
        swl.addWidget(self.search, 1)
        icon = MaterialIcon("search", size_px=20)
        icon.setParent(search_wrap)
        icon.move(12, 12)
        icon.setStyleSheet("color: rgba(255,255,255,0.35);")
        hl.addWidget(search_wrap, 1)

        sep = QFrame()
        sep.setFixedWidth(1)
        sep.setStyleSheet("background: rgba(255,255,255,0.10);")
        hl.addWidget(sep)

        self.btn_notif = QToolButton()
        self.btn_notif.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_notif, "notifications", size_px=18)
        hl.addWidget(self.btn_notif)
        self.btn_help = QToolButton()
        self.btn_help.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_help, "help", size_px=18)
        hl.addWidget(self.btn_help)

        ml.addWidget(header)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)
        ml.addWidget(scroll, 1)

        host = QWidget()
        scroll.setWidget(host)
        l = QVBoxLayout(host)
        l.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 28px margins
        l.setSpacing(DESIGN.spacing.lg)  # 18px spacing

        welcome = QLabel("Welcome back, Dev!")
        welcome.setStyleSheet("font-size: 28pt; font-weight: 900;")
        l.addWidget(welcome)
        l.addWidget(Muted("Here's what's happening with your translation projects today."))

        actions = QGridLayout()
        actions.setHorizontalSpacing(DESIGN.spacing.md)  # 14px
        actions.setVerticalSpacing(DESIGN.spacing.md)  # 14px
        actions.addWidget(self._action_card("New Project", "add", "Create a new translation workspace.", self.request_import.emit), 0, 0)
        actions.addWidget(self._action_card("Import Mod", "folder_open", "Scan a folder/zip and extract segments.", self.request_import.emit), 0, 1)
        actions.addWidget(self._action_card("View Diagnostics", "warning", "Review global issues across projects.", lambda: self.request_nav_index.emit(3)), 0, 2)
        l.addLayout(actions)

        l.addWidget(H2("Recent Projects"))
        self._recents_host = QWidget()
        self._recents_layout = QGridLayout(self._recents_host)
        self._recents_layout.setContentsMargins(0, 0, 0, 0)
        self._recents_layout.setHorizontalSpacing(DESIGN.spacing.md)  # 14px
        self._recents_layout.setVerticalSpacing(DESIGN.spacing.md)  # 14px
        l.addWidget(self._recents_host)

        empty = CardFrame(shadow=False)
        empty.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)
        empty.setStyleSheet("background: rgba(255,255,255,0.02); border-style: dashed;")
        el = QVBoxLayout(empty)
        el.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 18px margins
        el.setSpacing(DESIGN.spacing.sm)  # 10px spacing
        el.addWidget(Muted("Import from Folder"))
        el.addWidget(Muted("Don't see your project? Import an existing Sims 4 mod folder to start."))
        btn = QPushButton("Browse Files")
        btn.setObjectName("Primary")
        btn.setSizePolicy(QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Preferred)  # Changed from Fixed to Preferred for better responsiveness
        btn.clicked.connect(self.request_import.emit)
        el.addWidget(btn, 0, Qt.AlignLeft)
        l.addWidget(empty)

        # Floating action button
        fab_row = QHBoxLayout()
        fab_row.addStretch(1)
        self.fab = QToolButton()
        self.fab.setObjectName("Fab")
        self.fab.setText("+")
        self.fab.setFixedSize(56, 56)
        self.fab.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)  # Keep fixed size for FAB
        self.fab.clicked.connect(self.request_import.emit)
        fab_row.addWidget(self.fab)
        l.addLayout(fab_row)

    def set_recents(self, recents: list[str]) -> None:
        while self._recents_layout.count():
            it = self._recents_layout.takeAt(0)
            w = it.widget()
            if w is not None:
                w.setParent(None)

        if not recents:
            self._recents_layout.addWidget(Muted("No recent projects yet."), 0, 0)
            return

        col_n = 2
        r = 0
        col = 0
        for raw in recents[:12]:
            p = Path(raw)
            meta = self._project_meta(p)
            card = self._project_card(p, meta=meta)
            self._recents_layout.addWidget(card, r, col)
            col += 1
            if col >= col_n:
                col = 0
                r += 1

    def _nav_item(self, label: str, icon_name: str, *, active: bool, idx: int) -> QPushButton:
        btn = QPushButton(label)
        btn.setCursor(Qt.PointingHandCursor)
        btn.setCheckable(True)
        btn.setChecked(active)
        btn.clicked.connect(lambda _c=False, i=idx: self.request_nav_index.emit(i))
        btn.setStyleSheet(
            "QPushButton{"
            "text-align:left; padding: 14px 14px; border-radius: 14px;"
            "background: transparent; border: 1px solid transparent;"
            "color: rgba(255,255,255,0.60); font-weight: 600;}"
            "QPushButton:hover{background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.05); color: white;}"
            "QPushButton:checked{background: rgba(157,92,255,0.12); border-color: rgba(157,92,255,0.22); color: #9d5cff;}"
        )
        icon = MaterialIcon(icon_name, size_px=22)
        icon.setParent(btn)
        icon.move(12, 12)
        icon.setStyleSheet("color: inherit;")
        btn.setContentsMargins(44, 0, 0, 0)
        return btn

    def _action_card(self, title: str, icon_name: str, desc: str, on_click) -> QWidget:
        card = QPushButton()
        card.setCursor(Qt.PointingHandCursor)
        card.clicked.connect(on_click)
        card.setObjectName("CardButton")
        card.setStyleSheet(
            "QPushButton{background: rgba(24,16,35,0.9); border: 1px solid rgba(255,255,255,0.08);"
            "border-radius: 22px; padding: 18px; text-align: left;}"
            "QPushButton:hover{border-color: rgba(157,92,255,0.30); background: rgba(49,33,74,0.55);}"
        )
        outer = QVBoxLayout(card)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(10)
        bubble = QFrame()
        bubble.setFixedSize(52, 52)
        bubble.setStyleSheet("border-radius: 16px; background: rgba(49,33,74,0.8); border: 1px solid rgba(255,255,255,0.07);")
        bl = QHBoxLayout(bubble)
        bl.setContentsMargins(0, 0, 0, 0)
        bl.addWidget(MaterialIcon(icon_name, size_px=26), 0, Qt.AlignCenter)
        outer.addWidget(bubble, 0, Qt.AlignLeft)
        outer.addWidget(QLabel(title))
        outer.itemAt(1).widget().setStyleSheet("font-size: 13pt; font-weight: 900;")  # type: ignore[union-attr]
        outer.addWidget(Muted(desc))
        return card

    def _project_meta(self, p: Path) -> dict[str, str]:
        """
        Best-effort metadata for dashboard cards.

        Uses local file timestamps and, when available, loads the project JSON to
        infer a simple status badge.
        """
        out: dict[str, str] = {"status": "UNKNOWN", "variant": "muted", "edited": ""}

        try:
            ts = os.path.getmtime(p)
            dt = datetime.fromtimestamp(ts, tz=timezone.utc)
            age = datetime.now(timezone.utc) - dt
            sec = int(age.total_seconds())
            if sec < 60:
                out["edited"] = "Edited just now"
            elif sec < 3600:
                out["edited"] = f"Edited {sec // 60}m ago"
            elif sec < 86400:
                out["edited"] = f"Edited {sec // 3600}h ago"
            else:
                out["edited"] = f"Edited {sec // 86400}d ago"
        except Exception:
            out["edited"] = ""

        if load_project is None:
            return out
        if not p.exists() or p.suffix.lower() != ".json":
            return out

        try:
            proj = load_project(p)
        except Exception:
            return out

        try:
            diags = list(getattr(proj, "diagnostics", None) or [])
            has_err = any(str(d.get("severity") or "").upper() in {"FATAL", "ERROR"} for d in diags)
        except Exception:
            has_err = False

        try:
            segs = list(getattr(proj, "segments", None) or [])
            if segs:
                missing = any(not str(s.get("target") or "").strip() for s in segs)
            else:
                missing = False
        except Exception:
            missing = False

        if has_err:
            out["status"] = "ISSUES"
            out["variant"] = "warning"
        elif missing:
            out["status"] = "TRANSLATING"
            out["variant"] = "primary"
        else:
            out["status"] = "READY"
            out["variant"] = "success"

        return out

    def _project_card(self, p: Path, *, meta: dict[str, str]) -> QWidget:
        card = QPushButton()
        card.setCursor(Qt.PointingHandCursor)
        card.setObjectName("CardButton")
        card.clicked.connect(lambda _c=False, path=p: self.request_open_project_json.emit(str(path)))
        card.setStyleSheet(
            "QPushButton{background: rgba(24,16,35,0.92); border: 1px solid rgba(255,255,255,0.08);"
            "border-radius: 22px; padding: 18px; text-align: left;}"
            "QPushButton:hover{border-color: rgba(157,92,255,0.30); background: rgba(49,33,74,0.55);}"
        )
        l = QVBoxLayout(card)
        l.setContentsMargins(0, 0, 0, 0)
        l.setSpacing(10)
        top = QHBoxLayout()
        top.setSpacing(10)
        icon = QFrame()
        icon.setFixedSize(44, 44)
        icon.setStyleSheet(
            "border-radius: 14px;"
            "background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #8638fa, stop:1 #4f46e5);"
            "border: 1px solid rgba(255,255,255,0.10);"
        )
        il = QHBoxLayout(icon)
        il.setContentsMargins(0, 0, 0, 0)
        il.addWidget(MaterialIcon("translate", size_px=22), 0, Qt.AlignCenter)
        top.addWidget(icon)
        name = QLabel(p.stem or "Project")
        name.setStyleSheet("font-size: 12pt; font-weight: 900;")
        top.addWidget(name, 1)
        kebab = QToolButton()
        kebab.setObjectName("IconButton")
        set_toolbutton_icon(kebab, "more_vert", size_px=18)
        kebab.clicked.connect(lambda _c=False, path=p: self.request_open_project_detail_json.emit(str(path)))
        top.addWidget(kebab)
        l.addLayout(top)
        path = Muted(str(p))
        path.setProperty("role", "mono")
        path.setStyleSheet("font-size: 9pt;")
        l.addWidget(path)

        bottom = QHBoxLayout()
        bottom.setSpacing(10)
        badge = QLabel(meta.get("status") or "UNKNOWN")
        badge.setStyleSheet(self._badge_style(meta.get("variant") or "muted"))
        bottom.addWidget(badge)
        bottom.addStretch(1)
        edited = QLabel(meta.get("edited") or "")
        edited.setStyleSheet("font-size: 9pt; color: rgba(255,255,255,0.35);")
        bottom.addWidget(edited)
        l.addLayout(bottom)
        return card

    def _badge_style(self, variant: str) -> str:
        v = (variant or "").lower()
        if v == "success":
            return (
                "padding: 4px 10px; border-radius: 10px; font-size: 8pt; font-weight: 900; letter-spacing: 1px;"
                "background: rgba(34,197,94,0.14); color: #22c55e; border: 1px solid rgba(34,197,94,0.20);"
            )
        if v == "warning":
            return (
                "padding: 4px 10px; border-radius: 10px; font-size: 8pt; font-weight: 900; letter-spacing: 1px;"
                "background: rgba(234,179,8,0.14); color: #eab308; border: 1px solid rgba(234,179,8,0.20);"
            )
        if v == "primary":
            return (
                "padding: 4px 10px; border-radius: 10px; font-size: 8pt; font-weight: 900; letter-spacing: 1px;"
                "background: rgba(157,92,255,0.14); color: #9d5cff; border: 1px solid rgba(157,92,255,0.20);"
            )
        return (
            "padding: 4px 10px; border-radius: 10px; font-size: 8pt; font-weight: 900; letter-spacing: 1px;"
            "background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.10);"
        )
