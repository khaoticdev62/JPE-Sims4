from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

from PySide6.QtCore import Qt, Signal
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QScrollArea,
    QStackedLayout,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H1, H2, MaterialIcon, Muted, ProgressCard, set_toolbutton_icon

if TYPE_CHECKING:
    from jpe_sims4.project import Project


class ProjectDetailPage(QWidget):
    """
    Project detail page aligned to `JPE assets folder/project_detail`.

    This page shows comprehensive project information including metadata, 
    translation progress, and project files.
    """

    go_files = Signal()
    go_translate = Signal()
    go_build = Signal()
    open_entity = Signal(str)  # entity_id

    def __init__(self) -> None:
        super().__init__()
        self._project: Project | None = None
        self._project_json_path: Path | None = None
        
        c = DESIGN.colors

        # Main layout
        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Header section
        header = QFrame()
        header.setObjectName("Card")
        header.setFixedHeight(120)
        hl = QHBoxLayout(header)
        hl.setContentsMargins(24, 16, 24, 16)
        hl.setSpacing(18)

        # Back and title
        back_col = QVBoxLayout()
        back_col.setContentsMargins(0, 0, 0, 0)
        back_col.setSpacing(4)
        back_btn = QLabel("← Back to Projects")
        back_btn.setStyleSheet("font-size: 11pt; color: #9d5cff; cursor: pointer;")
        back_btn.setProperty("role", "clickable")
        back_btn.mousePressEvent = lambda e: self.go_files.emit()  # type: ignore[method-assign]
        back_col.addWidget(back_btn)

        title = QLabel("Project Name")
        title.setObjectName("H1")
        title.setStyleSheet("font-size: 18pt; font-weight: 600;")
        back_col.addWidget(title)
        hl.addLayout(back_col)

        hl.addStretch(1)

        # Action buttons
        actions = QHBoxLayout()
        actions.setSpacing(10)
        btn_edit = QLabel("Edit")
        btn_edit.setStyleSheet("font-size: 11pt; color: #9d5cff; cursor: pointer; padding: 6px 12px;")
        btn_edit.setProperty("role", "clickable")
        btn_export = QLabel("Export")
        btn_export.setStyleSheet("font-size: 11pt; color: #9d5cff; cursor: pointer; padding: 6px 12px;")
        btn_export.setProperty("role", "clickable")
        actions.addWidget(btn_edit)
        actions.addWidget(btn_export)
        hl.addLayout(actions)

        root.addWidget(header)

        # Content area with tabs
        content = QFrame()
        content.setStyleSheet(f"background: {c.background};")
        content_l = QVBoxLayout(content)
        content_l.setContentsMargins(24, 18, 24, 24)
        content_l.setSpacing(18)

        # Tabs
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
                background: rgba(157, 92, 255, 0.15); 
                color: #9d5cff;
                border-bottom: 2px solid #9d5cff;
            }
            QTabBar::tab:!selected { 
                color: rgba(255, 255, 255, 0.55); 
            }
        """)

        # Summary tab
        summary_widget = self._create_summary_tab()
        tabs.addTab(summary_widget, "Summary")

        # Files tab
        files_widget = self._create_files_tab()
        tabs.addTab(files_widget, "Files")

        # Entities tab
        entities_widget = self._create_entities_tab()
        tabs.addTab(entities_widget, "Entities")

        # Diagnostics tab
        diagnostics_widget = self._create_diagnostics_tab()
        tabs.addTab(diagnostics_widget, "Diagnostics")

        content_l.addWidget(tabs)
        root.addWidget(content, 1)

    def _create_summary_tab(self) -> QWidget:
        """Create the project summary tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(18)

        # Progress overview
        progress_card = CardFrame(shadow=False)
        progress_l = QVBoxLayout(progress_card)
        progress_l.setContentsMargins(16, 16, 16, 16)
        progress_l.setSpacing(12)

        progress_header = QHBoxLayout()
        progress_title = H2("Translation Progress")
        progress_title.setStyleSheet("font-weight: 600;")
        progress_header.addWidget(progress_title)
        progress_header.addStretch(1)
        progress_status = QLabel("In Progress")
        progress_status.setProperty("role", "badge")
        progress_status.setProperty("variant", "primary")
        progress_status.setStyleSheet(
            "padding: 4px 8px; border-radius: 6px; font-size: 9pt; font-weight: 700;"
            "background: rgba(157, 92, 255, 0.15); color: #9d5cff; border: 1px solid rgba(157,92,255,0.25);"
        )
        progress_header.addWidget(progress_status)
        progress_l.addLayout(progress_header)

        # Progress bars
        total_progress = self._create_progress_bar("Total", 65, "primary")
        progress_l.addWidget(total_progress)
        
        source_progress = self._create_progress_bar("Source", 80, "info")
        progress_l.addWidget(source_progress)
        
        target_progress = self._create_progress_bar("Target", 50, "success")
        progress_l.addWidget(target_progress)

        layout.addWidget(progress_card)

        # Project metadata
        meta_card = CardFrame(shadow=False)
        meta_l = QVBoxLayout(meta_card)
        meta_l.setContentsMargins(16, 16, 16, 16)
        meta_l.setSpacing(16)

        meta_header = H2("Project Details")
        meta_header.setStyleSheet("font-weight: 600;")
        meta_l.addWidget(meta_header)

        # Metadata grid
        meta_grid = QHBoxLayout()
        meta_grid.setSpacing(16)

        left_col = QVBoxLayout()
        left_col.setSpacing(12)
        left_col.addWidget(self._create_meta_row("Project ID", "PROJ_001"))
        left_col.addWidget(self._create_meta_row("Created", "2023-07-15"))
        left_col.addWidget(self._create_meta_row("Last Modified", "Today, 14:30"))
        left_col.addStretch(1)
        meta_grid.addLayout(left_col, 1)

        right_col = QVBoxLayout()
        right_col.setSpacing(12)
        right_col.addWidget(self._create_meta_row("Source Language", "English"))
        right_col.addWidget(self._create_meta_row("Target Language", "Spanish"))
        right_col.addWidget(self._create_meta_row("File Count", "24"))
        right_col.addStretch(1)
        meta_grid.addLayout(right_col, 1)

        meta_l.addLayout(meta_grid)
        layout.addWidget(meta_card)

        # Quick action cards
        actions_grid = QHBoxLayout()
        actions_grid.setSpacing(14)

        translate_card = self._create_action_card(
            "translate", "Continue Translation", "Continue working on translations", 
            lambda: self.go_translate.emit()
        )
        actions_grid.addWidget(translate_card)

        build_card = self._create_action_card(
            "build", "Build Project", "Create a translated mod package", 
            lambda: self.go_build.emit()
        )
        actions_grid.addWidget(build_card)

        export_card = self._create_action_card(
            "export", "Export CSV", "Export segments for external translation", 
            lambda: None
        )
        actions_grid.addWidget(export_card)

        layout.addLayout(actions_grid)

        layout.addStretch(1)
        return widget

    def _create_files_tab(self) -> QWidget:
        """Create the project files tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)

        # Files list
        files_header = H2("Project Files")
        files_header.setStyleSheet("font-weight: 600;")
        layout.addWidget(files_header)

        # Sample files (would be populated from project data)
        files = [
            ("Main.xml", "XML", 45, "translated"),
            ("Strings.json", "JSON", 23, "in_progress"),
            ("Config.cfg", "CFG", 12, "new"),
            ("Extra.ini", "INI", 8, "reviewed")
        ]

        for filename, ext, count, status in files:
            file_row = self._create_file_row(filename, ext, count, status)
            layout.addWidget(file_row)

        layout.addStretch(1)
        return widget

    def _create_entities_tab(self) -> QWidget:
        """Create the entities tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)

        # Entities header
        entities_header = H2("Translation Entities")
        entities_header.setStyleSheet("font-weight: 600;")
        layout.addWidget(entities_header)

        # Sample entities (would be populated from project data)
        entities = [
            ("SIMDATA_001", "Sim Name", "Ready", "success"),
            ("STRING_045", "UI Button", "Translating", "primary"),
            ("DIALOG_102", "Conversation", "Needs Review", "warning"),
            ("TOOLTIP_007", "Help Text", "New", "info")
        ]

        for entity_id, entity_type, status, variant in entities:
            entity_row = self._create_entity_row(entity_id, entity_type, status, variant)
            layout.addWidget(entity_row)

        layout.addStretch(1)
        return widget

    def _create_diagnostics_tab(self) -> QWidget:
        """Create the diagnostics tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)

        # Diagnostics header
        diag_header = H2("Project Diagnostics")
        diag_header.setStyleSheet("font-weight: 600;")
        layout.addWidget(diag_header)

        # Sample diagnostics (would be populated from project data)
        diagnostics = [
            ("Missing translations", 12, "warning"),
            ("Inconsistent terminology", 5, "info"),
            ("Validation errors", 2, "error"),
            ("Placeholders mismatch", 3, "warning")
        ]

        for diag_type, count, variant in diagnostics:
            diag_row = self._create_diagnostic_row(diag_type, count, variant)
            layout.addWidget(diag_row)

        layout.addStretch(1)
        return widget

    def _create_progress_bar(self, label: str, value: int, color_variant: str) -> QWidget:
        """Create a labeled progress bar."""
        container = QWidget()
        layout = QVBoxLayout(container)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(6)

        # Label row
        label_row = QHBoxLayout()
        label_row.setSpacing(8)
        lbl = QLabel(label)
        value_lbl = QLabel(f"{value}%")
        value_lbl.setStyleSheet("color: rgba(255,255,255,0.7);")
        label_row.addWidget(lbl)
        label_row.addStretch(1)
        label_row.addWidget(value_lbl)
        layout.addLayout(label_row)

        # Progress bar
        bar_container = QFrame()
        bar_container.setFixedHeight(8)
        bar_container.setStyleSheet("border-radius: 4px; background: rgba(255,255,255,0.05);")
        bar_l = QHBoxLayout(bar_container)
        bar_l.setContentsMargins(0, 0, 0, 0)

        progress_fill = QFrame()
        progress_fill.setFixedHeight(8)
        
        if color_variant == "primary":
            progress_fill.setStyleSheet(f"border-radius: 4px; background: #9d5cff; max-width: {value}%")
        elif color_variant == "info":
            progress_fill.setStyleSheet(f"border-radius: 4px; background: #4cc9f0; max-width: {value}%")
        elif color_variant == "success":
            progress_fill.setStyleSheet(f"border-radius: 4px; background: #22c55e; max-width: {value}%")
        else:
            progress_fill.setStyleSheet(f"border-radius: 4px; background: #9d5cff; max-width: {value}%")
        
        bar_l.addWidget(progress_fill)
        layout.addWidget(bar_container)

        return container

    def _create_meta_row(self, label: str, value: str) -> QWidget:
        """Create a metadata row."""
        row = QHBoxLayout()
        row.setSpacing(12)
        
        lbl = QLabel(label)
        lbl.setStyleSheet("color: rgba(255,255,255,0.55); font-size: 10pt;")
        val = QLabel(value)
        val.setStyleSheet("font-weight: 500;")
        
        row.addWidget(lbl, 1)
        row.addWidget(val, 1)
        
        container = QWidget()
        container.setLayout(row)
        return container

    def _create_action_card(self, icon: str, title: str, desc: str, on_click) -> QWidget:
        """Create an action card."""
        card = CardFrame(shadow=False)
        card.setStyleSheet(
            "QPushButton{background: rgba(24,16,35,0.9); border: 1px solid rgba(255,255,255,0.08);"
            "border-radius: 16px; padding: 16px; text-align: left;}"
            "QPushButton:hover{border-color: rgba(157,92,255,0.30); background: rgba(49,33,74,0.55);}"
        )
        card.mousePressEvent = lambda e: on_click()  # type: ignore[method-assign]
        card.setCursor(Qt.CursorShape.PointingHandCursor)

        layout = QVBoxLayout(card)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(10)

        icon_frame = QFrame()
        icon_frame.setFixedSize(42, 42)
        icon_frame.setStyleSheet("border-radius: 12px; background: rgba(157,92,255,0.15);")
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon, size_px=20)
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        layout.addWidget(icon_frame, 0, Qt.AlignLeft)

        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 12pt; font-weight: 700;")
        layout.addWidget(title_lbl)

        desc_lbl = Muted(desc)
        desc_lbl.setStyleSheet("font-size: 9pt;")
        layout.addWidget(desc_lbl)

        return card

    def _create_file_row(self, name: str, ext: str, count: int, status: str) -> QWidget:
        """Create a file row."""
        row = CardFrame(shadow=False)
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(16, 12, 16, 12)
        row_l.setSpacing(12)

        # Icon
        icon = QFrame()
        icon.setFixedSize(36, 36)
        icon.setStyleSheet(
            "border-radius: 10px; background: rgba(157,92,255,0.15); border: 1px solid rgba(157,92,255,0.25);"
        )
        icon_l = QHBoxLayout(icon)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon("description", size_px=18)
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        row_l.addWidget(icon)

        # Name and type
        name_col = QVBoxLayout()
        name_col.setContentsMargins(0, 0, 0, 0)
        name_col.setSpacing(2)
        name_lbl = QLabel(name)
        name_lbl.setStyleSheet("font-weight: 600;")
        type_lbl = Muted(ext)
        type_lbl.setStyleSheet("font-size: 9pt;")
        name_col.addWidget(name_lbl)
        name_col.addWidget(type_lbl)
        row_l.addLayout(name_col, 1)

        # Count
        count_lbl = Muted(f"{count} segments")
        count_lbl.setStyleSheet("font-size: 10pt;")
        row_l.addWidget(count_lbl)

        # Status badge
        status_lbl = QLabel(status.upper())
        status_lbl.setProperty("role", "badge")
        status_lbl.setProperty("variant", self._status_to_variant(status))
        status_lbl.setStyleSheet(
            "padding: 4px 8px; border-radius: 6px; font-size: 9pt; font-weight: 700;"
            f"background: {self._status_bg_color(status)}; color: {self._status_color(status)}; "
            f"border: 1px solid {self._status_border_color(status)};"
        )
        row_l.addWidget(status_lbl)

        # Chevron
        chevron = MaterialIcon("chevron_right", size_px=20)
        chevron.setStyleSheet("color: rgba(255,255,255,0.4);")
        row_l.addWidget(chevron)

        return row

    def _create_entity_row(self, entity_id: str, entity_type: str, status: str, variant: str) -> QWidget:
        """Create an entity row."""
        row = CardFrame(shadow=False)
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(16, 12, 16, 12)
        row_l.setSpacing(12)

        # ID
        id_lbl = QLabel(entity_id)
        id_lbl.setStyleSheet("font-family: 'JetBrains Mono'; font-size: 10pt; font-weight: 600;")
        row_l.addWidget(id_lbl, 1)

        # Type
        type_lbl = Muted(entity_type)
        type_lbl.setStyleSheet("font-size: 10pt;")
        row_l.addWidget(type_lbl)

        # Status
        status_lbl = QLabel(status.upper())
        status_lbl.setProperty("role", "badge")
        status_lbl.setProperty("variant", variant)
        status_lbl.setStyleSheet(
            "padding: 4px 8px; border-radius: 6px; font-size: 9pt; font-weight: 700;"
            f"background: {self._status_bg_color(status)}; color: {self._status_color(status)}; "
            f"border: 1px solid {self._status_border_color(status)};"
        )
        row_l.addWidget(status_lbl)

        # Chevron
        chevron = MaterialIcon("chevron_right", size_px=20)
        chevron.setStyleSheet("color: rgba(255,255,255,0.4);")
        row_l.addWidget(chevron)

        return row

    def _create_diagnostic_row(self, diag_type: str, count: int, variant: str) -> QWidget:
        """Create a diagnostic row."""
        row = CardFrame(shadow=False)
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(16, 12, 16, 12)
        row_l.setSpacing(12)

        # Icon based on variant
        icon = QFrame()
        icon.setFixedSize(32, 32)
        icon.setStyleSheet(
            f"border-radius: 16px; background: {self._status_bg_color(diag_type)}; border: 1px solid {self._status_border_color(diag_type)};"
        )
        icon_l = QHBoxLayout(icon)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_name = "warning" if variant == "warning" else "error" if variant == "error" else "info"
        icon_lbl = MaterialIcon(icon_name, size_px=16)
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        row_l.addWidget(icon)

        # Type
        type_lbl = QLabel(diag_type)
        type_lbl.setStyleSheet("font-weight: 500;")
        row_l.addWidget(type_lbl, 1)

        # Count
        count_lbl = QLabel(str(count))
        count_lbl.setStyleSheet("font-weight: 600; font-size: 11pt;")
        row_l.addWidget(count_lbl)

        # Chevron
        chevron = MaterialIcon("chevron_right", size_px=20)
        chevron.setStyleSheet("color: rgba(255,255,255,0.4);")
        row_l.addWidget(chevron)

        return row

    def _status_to_variant(self, status: str) -> str:
        """Convert status string to variant."""
        status_lower = status.lower()
        if status_lower in ["translated", "ready", "success"]:
            return "success"
        elif status_lower in ["in_progress", "translating", "primary"]:
            return "primary"
        elif status_lower in ["needs_review", "review", "warning"]:
            return "warning"
        elif status_lower in ["new", "info"]:
            return "info"
        else:
            return "primary"

    def _status_bg_color(self, status: str) -> str:
        """Get background color for status."""
        variant = self._status_to_variant(status)
        c = DESIGN.colors
        if variant == "success":
            return c.success_bg
        elif variant == "warning":
            return c.warning_bg
        elif variant == "error":
            return c.error_bg
        elif variant == "info":
            return c.info_bg
        else:
            return c.primary_bg

    def _status_color(self, status: str) -> str:
        """Get text color for status."""
        variant = self._status_to_variant(status)
        c = DESIGN.colors
        if variant == "success":
            return c.success
        elif variant == "warning":
            return c.warning
        elif variant == "error":
            return c.error
        elif variant == "info":
            return c.info
        else:
            return c.primary

    def _status_border_color(self, status: str) -> str:
        """Get border color for status."""
        variant = self._status_to_variant(status)
        c = DESIGN.colors
        if variant == "success":
            return "rgba(34,197,94,0.25)"
        elif variant == "warning":
            return "rgba(234,179,8,0.25)"
        elif variant == "error":
            return "rgba(239,68,68,0.25)"
        elif variant == "info":
            return "rgba(76,201,240,0.25)"
        else:
            return "rgba(157,92,255,0.25)"

    def set_project(self, project: Project, project_json_path: Path | None) -> None:
        """Set the project to display."""
        self._project = project
        self._project_json_path = project_json_path
        
        # Update the title to show the project name
        if project_json_path:
            title = self.findChild(QLabel, "H1")
            if title:
                title.setText(project_json_path.stem)