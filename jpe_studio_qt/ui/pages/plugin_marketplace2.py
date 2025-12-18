from __future__ import annotations

from dataclasses import dataclass

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
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
from jpe_studio_qt.ui.components import MaterialIcon, Muted, set_toolbutton_icon


@dataclass(frozen=True)
class MarketplacePlugin:
    ref: str
    name: str
    version: str
    author: str
    size_mb: str
    description: str
    tags: tuple[str, ...]
    status: str  # UPDATE | COMPATIBLE | INSTALLED | VERSION_MISMATCH | DISABLED
    updated_ago: str = ""
    rating: str = ""
    installs: str = ""
    icon_name: str = "extension"


class PluginMarketplace2Widget(QWidget):
    """
    Desktop plugin marketplace aligned to `JPE assets folder/plugin_marketplace_2`.

    Networking/sync is intentionally not implemented yet; this is a fidelity-first UI
    that can be wired to a future marketplace client.
    """

    open_details = Signal(str, str, bool)

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None
        self._tab: str = "MARKETPLACE"
        self._chip: str = "FEATURED"

        self._colors = {
            "primary": "#9551fb",
            "bg": "#170f23",
            "sidebar": "#1e142b",
            "card": "#231835",
            "accent_neon": "#00ff9d",
            "accent_cyan": "#00e5ff",
            "text_secondary": "#a78ecc",
            "border": "rgba(255,255,255,0.05)",
            "border_strong": "rgba(255,255,255,0.10)",
        }

        root = QHBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)
        # Subtle radial glow like the HTML template.
        self.setStyleSheet(
            "background: qradialgradient(cx: 1, cy: 0, radius: 1.2, fx: 1, fy: 0,"
            f" stop:0 rgba(149,81,251,0.18), stop:0.40 rgba(0,229,255,0.05), stop:1 {self._colors['bg']});"
        )

        # Left marketplace sidebar (Discover/Library).
        self.aside = QFrame()
        self.aside.setFixedWidth(256)
        self.aside.setStyleSheet(
            f"background: {self._colors['sidebar']}; border-right: 1px solid {self._colors['border']};"
        )
        al = QVBoxLayout(self.aside)
        al.setContentsMargins(0, 0, 0, 0)
        al.setSpacing(0)

        brand = QFrame()
        brand.setFixedHeight(64)
        brand.setStyleSheet(f"border-bottom: 1px solid {self._colors['border']};")
        bl = QHBoxLayout(brand)
        bl.setContentsMargins(18, 14, 18, 14)
        bl.setSpacing(10)
        token = QLabel()
        token.setStyleSheet(f"color: {self._colors['primary']};")
        token_icon = MaterialIcon("token", size_px=26)
        token_icon.setStyleSheet(f"color: {self._colors['primary']};")
        bl.addWidget(token_icon)
        title = QLabel("JPE Suite")
        title.setStyleSheet("font-size: 13pt; font-weight: 800;")
        bl.addWidget(title, 1)
        al.addWidget(brand)

        nav = QWidget()
        nl = QVBoxLayout(nav)
        nl.setContentsMargins(16, 16, 16, 16)
        nl.setSpacing(8)
        nl.addWidget(self._nav_label("Discover"))
        self.btn_marketplace = self._nav_item("Marketplace", "storefront", active=True)
        self.btn_featured = self._nav_item("Featured", "grade")
        self.btn_trending = self._nav_item("Trending", "trending_up")
        nl.addWidget(self.btn_marketplace)
        nl.addWidget(self.btn_featured)
        nl.addWidget(self.btn_trending)
        nl.addSpacing(14)
        nl.addWidget(self._nav_label("Library"))
        self.btn_installed = self._nav_item("Installed", "inventory_2")
        self.btn_updates = self._nav_item("Updates", "system_update", badge_text="1")
        nl.addWidget(self.btn_installed)
        nl.addWidget(self.btn_updates)
        nl.addStretch(1)
        al.addWidget(nav, 1)

        aside_bottom = QFrame()
        aside_bottom.setStyleSheet(f"border-top: 1px solid {self._colors['border']}; background: #1a1126;")
        abl = QVBoxLayout(aside_bottom)
        abl.setContentsMargins(16, 14, 16, 14)
        abl.setSpacing(10)
        settings = self._nav_item("Settings", "settings")
        abl.addWidget(settings)
        user = QFrame()
        user.setStyleSheet("background: rgba(0,0,0,0.15); border-radius: 12px;")
        ul = QHBoxLayout(user)
        ul.setContentsMargins(12, 10, 12, 10)
        ul.setSpacing(10)
        avatar = QLabel("JS")
        avatar.setFixedSize(32, 32)
        avatar.setAlignment(Qt.AlignCenter)
        avatar.setStyleSheet(
            f"border-radius: 16px; font-weight: 900; background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 {self._colors['primary']}, stop:1 {self._colors['accent_cyan']});"
        )
        ul.addWidget(avatar)
        utext = QVBoxLayout()
        utext.setContentsMargins(0, 0, 0, 0)
        utext.setSpacing(0)
        uname = QLabel("JPE Developer")
        uname.setStyleSheet("font-weight: 800; font-size: 9pt;")
        uplan = QLabel("Pro License")
        uplan.setStyleSheet(f"font-size: 9pt; color: {self._colors['text_secondary']};")
        utext.addWidget(uname)
        utext.addWidget(uplan)
        ul.addLayout(utext, 1)
        abl.addWidget(user)
        al.addWidget(aside_bottom)

        root.addWidget(self.aside)

        # Main content.
        main = QFrame()
        main.setStyleSheet(f"background: {self._colors['bg']};")
        ml = QVBoxLayout(main)
        ml.setContentsMargins(0, 0, 0, 0)
        ml.setSpacing(0)

        # Sticky header.
        header = QFrame()
        header.setFixedHeight(64)
        header.setStyleSheet(
            f"background: rgba(23,15,35,0.80); border-bottom: 1px solid {self._colors['border']};"
        )
        hl = QHBoxLayout(header)
        hl.setContentsMargins(24, 10, 24, 10)
        hl.setSpacing(14)

        h1 = QLabel("Plugin Marketplace")
        h1.setStyleSheet("font-size: 14pt; font-weight: 900;")
        hl.addWidget(h1)

        search_wrap = QFrame()
        search_wrap.setStyleSheet(
            f"background: {self._colors['card']}; border: 1px solid {self._colors['border_strong']}; border-radius: 12px;"
        )
        swl = QHBoxLayout(search_wrap)
        swl.setContentsMargins(12, 6, 10, 6)
        swl.setSpacing(10)
        sicon = MaterialIcon("search", size_px=18)
        sicon.setStyleSheet(f"color: {self._colors['text_secondary']};")
        swl.addWidget(sicon)
        self.search = QLineEdit()
        self.search.setPlaceholderText("Search plugins, tags, or authors...")
        self.search.setStyleSheet("border: none; background: transparent; color: white; padding: 6px 0px;")
        self.search.textChanged.connect(self._render)
        swl.addWidget(self.search, 1)
        hint = QLabel("Ctrl+K")
        hint.setStyleSheet(
            f"font-family: Consolas; font-size: 8pt; color: {self._colors['text_secondary']};"
            f"background: rgba(255,255,255,0.04); border: 1px solid {self._colors['border']}; border-radius: 6px; padding: 2px 6px;"
        )
        swl.addWidget(hint)
        hl.addWidget(search_wrap, 1)

        self.btn_notif = QToolButton()
        self.btn_notif.setCursor(Qt.PointingHandCursor)
        self.btn_notif.setObjectName("IconButton")
        self.btn_notif.setToolTip("Notifications")
        set_toolbutton_icon(self.btn_notif, "notifications", size_px=18)
        self.btn_notif.setStyleSheet("color: rgba(255,255,255,0.75);")
        notif_wrap = QFrame()
        notif_wrap.setFixedSize(36, 36)
        notif_wrap.setStyleSheet("background: transparent;")
        self.btn_notif.setParent(notif_wrap)
        self.btn_notif.setGeometry(0, 0, 36, 36)
        dot = QFrame(notif_wrap)
        dot.setFixedSize(8, 8)
        dot.move(22, 8)
        dot.setStyleSheet(
            f"background: {self._colors['primary']}; border-radius: 4px; border: 2px solid {self._colors['bg']};"
        )
        hl.addWidget(notif_wrap)
        self.btn_filters = QToolButton()
        self.btn_filters.setCursor(Qt.PointingHandCursor)
        self.btn_filters.setObjectName("IconButton")
        self.btn_filters.setToolTip("Filter")
        set_toolbutton_icon(self.btn_filters, "filter_list", size_px=18)
        self.btn_filters.setStyleSheet("color: rgba(255,255,255,0.75);")
        hl.addWidget(self.btn_filters)
        ml.addWidget(header)

        # Scrollable body content.
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.NoFrame)
        ml.addWidget(self.scroll, 1)

        host = QWidget()
        self.scroll.setWidget(host)
        self.host_l = QVBoxLayout(host)
        self.host_l.setContentsMargins(24, 20, 24, 20)
        self.host_l.setSpacing(14)

        chips = QHBoxLayout()
        chips.setSpacing(10)
        self.chip_featured = self._filter_chip("Featured", "FEATURED", icon="verified", active=True, icon_color=self._colors["primary"])
        self.chip_recent = self._filter_chip("Recently Updated", "RECENT", icon="update", icon_color=self._colors["accent_neon"])
        self.chip_translation = self._filter_chip("Translation Tools", "TRANSLATION", icon="translate", icon_color=self._colors["accent_cyan"])
        self.chip_debug = self._filter_chip("Debugging", "DEBUG", icon="bug_report", icon_color="white")
        self.chip_ui = self._filter_chip("UI Design", "UI", icon="palette", icon_color=self._colors["text_secondary"])
        for b in (self.chip_featured, self.chip_recent, self.chip_translation, self.chip_debug, self.chip_ui):
            chips.addWidget(b)
        chips.addStretch(1)
        self.host_l.addLayout(chips)

        self.note = Muted("Offline preview only. Marketplace networking/sync will be wired later.")
        self.note.setStyleSheet(f"color: {self._colors['text_secondary']};")
        self.host_l.addWidget(self.note)

        sec = QHBoxLayout()
        sec.setSpacing(10)
        bolt = MaterialIcon("bolt", size_px=18)
        bolt.setStyleSheet(f"color: {self._colors['accent_neon']};")
        sec.addWidget(bolt)
        sec_title = QLabel("New & Trending")
        sec_title.setStyleSheet("font-size: 13pt; font-weight: 900;")
        sec.addWidget(sec_title, 1)
        view_all = QPushButton("View all")
        view_all.setCursor(Qt.PointingHandCursor)
        view_all.setStyleSheet(
            f"background: transparent; border: 1px solid transparent; color: {self._colors['primary']}; font-weight: 800; padding: 6px 10px;"
        )
        sec.addWidget(view_all)
        self.host_l.addLayout(sec)

        self.grid_wrap = QWidget()
        self.grid = QGridLayout(self.grid_wrap)
        self.grid.setContentsMargins(0, 0, 0, 0)
        self.grid.setHorizontalSpacing(14)
        self.grid.setVerticalSpacing(14)
        self.host_l.addWidget(self.grid_wrap)
        self.host_l.addStretch(1)

        # Bottom action bar.
        bottom = QFrame()
        bottom.setStyleSheet(
            f"background: rgba(0,0,0,0.15); border: 1px solid {self._colors['border']}; border-radius: 14px;"
        )
        btl = QHBoxLayout(bottom)
        btl.setContentsMargins(14, 12, 14, 12)
        btl.setSpacing(10)
        self.btn_update_all = QPushButton("Update All (3)")
        self.btn_update_all.setStyleSheet(
            f"background: {self._colors['primary']}; border: 1px solid {self._colors['primary']}; border-radius: 12px; padding: 10px 14px; font-weight: 800;"
        )
        btl.addWidget(self.btn_update_all, 1)
        self.btn_manage = QToolButton()
        self.btn_manage.setObjectName("IconButton")
        set_toolbutton_icon(self.btn_manage, "settings", size_px=18)
        btl.addWidget(self.btn_manage)
        ml.addWidget(bottom)

        root.addWidget(main, 1)

        self._wire_nav()
        self._render()

    def set_project(self, project: Project | None) -> None:
        self._project = project
        self._render()

    def _wire_nav(self) -> None:
        self.btn_marketplace.clicked.connect(lambda: self._set_tab("MARKETPLACE"))
        self.btn_featured.clicked.connect(lambda: self._set_tab("FEATURED"))
        self.btn_trending.clicked.connect(lambda: self._set_tab("TRENDING"))
        self.btn_installed.clicked.connect(lambda: self._set_tab("INSTALLED"))
        self.btn_updates.clicked.connect(lambda: self._set_tab("UPDATES"))

    def _set_tab(self, tab: str) -> None:
        self._tab = tab
        if tab == "UPDATES":
            # Map sidebar "Updates" to the "Recently Updated" chip filter.
            self._chip = "RECENT"
            for b in (self.chip_featured, self.chip_recent, self.chip_translation, self.chip_debug, self.chip_ui):
                on = b.property("_chip") == "RECENT"
                b.setChecked(bool(on))
                b.setStyleSheet(self._chip_style(active=bool(on)))
        for b in (self.btn_marketplace, self.btn_featured, self.btn_trending, self.btn_installed, self.btn_updates):
            b.setStyleSheet(self._nav_item_style(active=b.property("_tab") == tab))
        self._render()

    def _filter_chip(self, text: str, chip: str, *, icon: str, active: bool = False, icon_color: str = "") -> QPushButton:
        b = QPushButton("")
        b.setCursor(Qt.PointingHandCursor)
        b.setCheckable(True)
        b.setChecked(active)
        b.setStyleSheet(self._chip_style(active=active))
        b.clicked.connect(lambda: self._set_chip(chip))
        b.setProperty("_chip", chip)
        row = QHBoxLayout(b)
        row.setContentsMargins(14, 6, 14, 6)
        row.setSpacing(8)
        ic = MaterialIcon(icon, size_px=16)
        ic.setStyleSheet(f"color: {icon_color};" if icon_color else f"color: {self._colors['text_secondary']};")
        row.addWidget(ic)
        lab = QLabel(text)
        lab.setStyleSheet("font-weight: 800; font-size: 9.5pt;")
        row.addWidget(lab)
        row.addStretch(1)
        return b

    def _set_chip(self, chip: str) -> None:
        self._chip = chip
        for b in (self.chip_featured, self.chip_recent, self.chip_translation, self.chip_debug, self.chip_ui):
            on = b.property("_chip") == chip
            b.setChecked(bool(on))
            b.setStyleSheet(self._chip_style(active=bool(on)))
        self._render()

    def _nav_label(self, text: str) -> QLabel:
        lab = QLabel(text)
        lab.setStyleSheet(
            f"padding: 8px 10px 6px 10px; font-size: 8.5pt; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: {self._colors['text_secondary']};"
        )
        return lab

    def _nav_item(self, text: str, icon_name: str, *, active: bool = False, badge_text: str = "") -> QPushButton:
        b = QPushButton("")
        b.setCursor(Qt.PointingHandCursor)
        b.setCheckable(False)
        b.setStyleSheet(self._nav_item_style(active=active))
        b.setProperty("_tab", text.upper())
        row = QHBoxLayout(b)
        row.setContentsMargins(12, 10, 12, 10)
        row.setSpacing(10)
        ic = MaterialIcon(icon_name, size_px=18)
        ic.setStyleSheet(f"color: {self._colors['text_secondary']};")
        if active:
            ic.setStyleSheet("color: white;")
        row.addWidget(ic)
        lab = QLabel(text)
        lab.setStyleSheet("font-size: 9.5pt; font-weight: 700;")
        row.addWidget(lab, 1)
        if badge_text:
            badge = QLabel(badge_text)
            badge.setAlignment(Qt.AlignCenter)
            badge.setFixedSize(20, 20)
            badge.setStyleSheet(
                f"background: {self._colors['accent_neon']}; color: {self._colors['bg']}; border-radius: 10px; font-size: 8pt; font-weight: 900;"
            )
            row.addWidget(badge)
        return b

    def _nav_item_style(self, *, active: bool) -> str:
        if active:
            return (
                "QPushButton {"
                f" background: rgba(149,81,251,0.20); border: 1px solid rgba(149,81,251,0.20);"
                " border-radius: 12px; text-align: left; }"
                "QPushButton:hover { background: rgba(149,81,251,0.26); border-color: rgba(149,81,251,0.30); }"
            )
        return (
            "QPushButton {"
            " background: transparent; border: 1px solid transparent; border-radius: 12px; text-align: left;"
            f" color: {self._colors['text_secondary']}; }}"
            "QPushButton:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.06); color: white; }"
        )

    def _chip_style(self, *, active: bool) -> str:
        if active:
            return (
                "QPushButton {"
                f" background: {self._colors['primary']}; border: 1px solid {self._colors['primary']};"
                " border-radius: 999px; padding: 6px 12px; font-size: 9pt; font-weight: 800; color: white; }"
                "QPushButton:hover { background: rgba(149,81,251,0.90); }"
            )
        return (
            "QPushButton {"
            f" background: {self._colors['card']}; border: 1px solid {self._colors['border']};"
            f" border-radius: 999px; padding: 6px 12px; font-size: 9pt; font-weight: 700; color: {self._colors['text_secondary']}; }}"
            "QPushButton:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.10); color: white; }"
        )

    def _items(self) -> list[MarketplacePlugin]:
        # UI-only preview. Real marketplace data will replace the "store" section,
        # but the Installed view uses the local plugin registry when available.
        out: list[MarketplacePlugin] = []

        if self._project is not None:
            try:
                from jpe_sims4.plugins import plugins as plugin_manager

                reg = plugin_manager().load()
                loaded = list(reg.loaded or [])
            except Exception:
                loaded = []

            disabled = set(str(x) for x in (self._project.disabled_plugins or []) if str(x).strip())
            for pl in loaded:
                path = str(getattr(pl, "path", ""))
                name = str(getattr(pl, "name", "")) or path
                out.append(
                    MarketplacePlugin(
                        ref=path,
                        name=name,
                        version=str(getattr(pl, "version", "")),
                        author=str(getattr(pl, "author", "")),
                        size_mb="",
                        description=path,
                        tags=tuple(str(x) for x in (getattr(pl, "tags", None) or ())),
                        status="DISABLED" if path in disabled else "INSTALLED",
                    )
                )

        # Marketplace catalog preview.
        out.extend(
            [
                MarketplacePlugin(
                    ref="marketplace://stbl_exporter_pro",
                    name="STBL Exporter Pro",
                    version="v2.4.0",
                    author="JPE Systems",
                    size_mb="2.4 MB",
                    description="Advanced string table management with CSV export and real-time validation.",
                    tags=("TRANSLATION",),
                    status="COMPATIBLE",
                    updated_ago="3d ago",
                    rating="4.9",
                    icon_name="table_view",
                ),
                MarketplacePlugin(
                    ref="marketplace://turbotranslation",
                    name="TurboTranslation",
                    version="v2.4.1",
                    author="SimsDevX",
                    size_mb="1.9 MB",
                    description="Fast in-editor translation helpers with placeholders and QA rules.",
                    tags=("TRANSLATION",),
                    status="UPDATE",
                    updated_ago="2d ago",
                    rating="5.0",
                    icon_name="translate",
                ),
                MarketplacePlugin(
                    ref="marketplace://strings_utility_core",
                    name="Strings Utility Core",
                    version="v2.1.0",
                    author="Kuttoe",
                    size_mb="0.8 MB",
                    description="Base library powering string-table & tuning utilities.",
                    tags=("TRANSLATION", "SCRIPT"),
                    status="UPDATE",
                    updated_ago="2d ago",
                    rating="5.0",
                    icon_name="token",
                ),
                MarketplacePlugin(
                    ref="marketplace://xml_injector",
                    name="XML Injector",
                    version="v4.0.5",
                    author="Scumbumbo",
                    size_mb="1.1 MB",
                    description="Inject new interactions into the game safely (tooling helper).",
                    tags=("DEBUG", "SCRIPT"),
                    status="COMPATIBLE",
                    updated_ago="1w ago",
                    rating="4.9",
                    icon_name="integration_instructions",
                ),
                MarketplacePlugin(
                    ref="marketplace://le_inspector",
                    name="L E Inspector",
                    version="v2.4.1",
                    author="TwistedMexi",
                    size_mb="1.4 MB",
                    description="Parses LastException files into human-readable format with actionable fixes.",
                    tags=("DEBUG",),
                    status="UPDATE",
                    updated_ago="2d ago",
                    rating="5.0",
                    icon_name="bug_report",
                ),
                MarketplacePlugin(
                    ref="marketplace://mccc_main",
                    name="MCCC - Main",
                    version="v2023.4.0",
                    author="Deaderpool",
                    size_mb="18.9 MB",
                    description="The Sims 4 command center mod suite (core module).",
                    tags=("DEBUG", "SCRIPT"),
                    status="INSTALLED",
                    updated_ago="2w ago",
                    rating="4.9",
                    installs="+5k installs",
                    icon_name="build_circle",
                ),
                MarketplacePlugin(
                    ref="marketplace://ui_cheats",
                    name="UI Cheats Extension",
                    version="v1.3.4",
                    author="weerbesu",
                    size_mb="6.2 MB",
                    description="In-game UI cheats and quick adjustments.",
                    tags=("UI",),
                    status="VERSION_MISMATCH",
                    updated_ago="1d ago",
                    rating="4.7",
                    icon_name="palette",
                ),
                MarketplacePlugin(
                    ref="marketplace://better_buildbuy",
                    name="Better BuildBuy",
                    version="v2.5.2",
                    author="TwistedMexi",
                    size_mb="12.4 MB",
                    description="Enhanced Build/Buy tools and catalog controls.",
                    tags=("UI",),
                    status="DISABLED",
                    updated_ago="3w ago",
                    rating="4.8",
                    icon_name="grid_view",
                ),
            ]
        )
        return out

    def _render(self) -> None:
        while self.grid.count():
            item = self.grid.takeAt(0)
            w = item.widget()
            if w is not None:
                w.setParent(None)

        q = self.search.text().strip().lower()
        items = self._items()

        def matches_tab(it: MarketplacePlugin) -> bool:
            if self._tab == "INSTALLED":
                return it.ref and (it.ref.startswith("marketplace://") is False)
            if self._tab == "UPDATES":
                return it.status == "UPDATE"
            if self._tab in {"MARKETPLACE", "FEATURED", "TRENDING"}:
                return it.ref.startswith("marketplace://")
            return True

        def matches_chip(it: MarketplacePlugin) -> bool:
            if self._chip == "FEATURED":
                return True
            if self._chip == "RECENT":
                return it.status == "UPDATE" or bool(it.updated_ago)
            if self._chip == "TRANSLATION":
                return "TRANSLATION" in set(it.tags)
            if self._chip == "DEBUG":
                return "DEBUG" in set(it.tags)
            if self._chip == "UI":
                return "UI" in set(it.tags)
            return True

        filtered = []
        for it in items:
            hay = f"{it.name} {it.author} {' '.join(it.tags)}".lower()
            if q and q not in hay:
                continue
            if not matches_tab(it):
                continue
            if not matches_chip(it):
                continue
            filtered.append(it)

        if not filtered:
            empty = QLabel("No plugins match your search/filter.")
            empty.setStyleSheet(f"color: {self._colors['text_secondary']}; padding: 18px;")
            self.grid.addWidget(empty, 0, 0)
            return

        cols = 3
        for idx, it in enumerate(filtered):
            r = idx // cols
            c = idx % cols
            self.grid.addWidget(self._card(it), r, c)

    def _card(self, it: MarketplacePlugin) -> QWidget:
        card = QFrame()
        card.setObjectName("MarketplaceCard")
        card.setAttribute(Qt.WA_Hover, True)
        card.setMouseTracking(True)
        card.setStyleSheet(
            "QFrame#MarketplaceCard {"
            f" background: {self._colors['card']}; border: 1px solid {self._colors['border']}; border-radius: 16px; }}"
            "QFrame#MarketplaceCard:hover { border-color: rgba(149,81,251,0.40); }"
        )

        outer = QVBoxLayout(card)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)

        hero = QFrame()
        hero.setFixedHeight(140)
        hero.setStyleSheet(
            "border-top-left-radius: 16px; border-top-right-radius: 16px;"
            "background: qlineargradient(x1:0,y1:0,x2:1,y2:1, stop:0 #2a1f3d, stop:1 rgba(149,81,251,0.18));"
        )
        hl = QVBoxLayout(hero)
        hl.setContentsMargins(12, 10, 12, 10)
        hl.setSpacing(8)
        top = QHBoxLayout()
        top.setContentsMargins(0, 0, 0, 0)
        top.setSpacing(8)
        top.addStretch(1)
        if it.version:
            ver = QLabel(it.version)
            ver.setStyleSheet(
                "background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.10);"
                "border-radius: 10px; padding: 3px 8px; font-size: 8pt; font-weight: 900;"
            )
            top.addWidget(ver)
        hl.addLayout(top)
        hl.addStretch(1)
        outer.addWidget(hero)

        body = QWidget()
        bl = QVBoxLayout(body)
        bl.setContentsMargins(16, 14, 16, 16)
        bl.setSpacing(10)

        row = QHBoxLayout()
        row.setContentsMargins(0, 0, 0, 0)
        row.setSpacing(10)
        icon = QFrame()
        icon.setFixedSize(56, 56)
        icon.setStyleSheet(
            "border-radius: 14px; background: #2a1f3d;"
            f"border: 2px solid {self._colors['card']};"
        )
        il = QVBoxLayout(icon)
        il.setContentsMargins(0, 0, 0, 0)
        glyph = MaterialIcon(it.icon_name or "extension", size_px=26)
        glyph.setAlignment(Qt.AlignCenter)
        glyph.setStyleSheet(f"color: {self._colors['primary']};")
        il.addWidget(glyph)
        row.addWidget(icon)
        row.addStretch(1)
        if it.rating:
            rating = QLabel(f"{it.rating}  ★")
            rating.setStyleSheet(
                "color: #fbbf24; font-weight: 900; font-size: 8.5pt;"
                "background: rgba(251,191,36,0.10); border: 1px solid rgba(251,191,36,0.20);"
                "border-radius: 10px; padding: 4px 8px;"
            )
            row.addWidget(rating)
        bl.addLayout(row)

        title = QLabel(it.name)
        title.setStyleSheet(f"font-size: 11.5pt; font-weight: 900; color: white;")
        bl.addWidget(title)
        desc = QLabel(it.description)
        desc.setWordWrap(True)
        desc.setStyleSheet(f"font-size: 9pt; color: {self._colors['text_secondary']};")
        bl.addWidget(desc, 1)

        meta = QHBoxLayout()
        meta.setContentsMargins(0, 0, 0, 0)
        meta.setSpacing(8)
        author = QLabel(it.author)
        author.setStyleSheet("font-size: 8.8pt; font-weight: 800; color: white;")
        meta.addWidget(author)
        meta.addStretch(1)
        cta = QPushButton("Install")
        cta.setCursor(Qt.PointingHandCursor)
        if it.status == "UPDATE":
            cta.setText("Update")
            cta.setStyleSheet(
                f"background: {self._colors['accent_neon']}; color: {self._colors['bg']};"
                f"border: 1px solid {self._colors['accent_neon']}; border-radius: 10px; padding: 7px 10px; font-weight: 900; font-size: 8.5pt;"
            )
        elif it.status in {"INSTALLED", "DISABLED"}:
            cta.setText("Manage")
            cta.setStyleSheet(
                f"background: rgba(255,255,255,0.05); border: 1px solid {self._colors['border']};"
                "border-radius: 10px; padding: 7px 10px; font-weight: 900; font-size: 8.5pt;"
            )
        else:
            cta.setStyleSheet(
                f"background: {self._colors['primary']}; border: 1px solid {self._colors['primary']};"
                "border-radius: 10px; padding: 7px 10px; font-weight: 900; font-size: 8.5pt;"
            )
        cta.clicked.connect(lambda: self.open_details.emit(it.name, it.ref, it.status != "DISABLED"))
        meta.addWidget(cta)
        bl.addLayout(meta)

        outer.addWidget(body)

        if it.status == "UPDATE":
            ribbon = QLabel("Update Available", card)
            ribbon.setStyleSheet(
                f"background: {self._colors['accent_neon']}; color: {self._colors['bg']};"
                "font-size: 8pt; font-weight: 900; padding: 4px 10px; border-bottom-left-radius: 12px;"
            )
            ribbon.move(0, 0)

        return card
