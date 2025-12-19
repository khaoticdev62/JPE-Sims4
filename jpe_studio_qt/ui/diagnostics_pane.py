from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QTreeWidget,
    QTreeWidgetItem,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H2, MaterialIcon, Muted


class GlobalDiagnosticsPane(QFrame):
    """
    Global diagnostics pane aligned to `JPE assets folder/global_diagnostics_pane_*`.
    
    This component shows application-wide diagnostics information with filtering options.
    """

    def __init__(self) -> None:
        super().__init__()
        self.setObjectName("Card")
        self.setFixedWidth(420)

        c = DESIGN.colors

        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(16)

        # Header
        header = QHBoxLayout()
        header.setContentsMargins(0, 0, 0, 0)
        header.setSpacing(10)

        title = H2("Global Diagnostics")
        title.setStyleSheet("font-weight: 600;")
        header.addWidget(title, 1)

        # Filter button
        filter_btn = QPushButton("Filter")
        filter_btn.setObjectName("Chip")
        filter_btn.setFixedHeight(32)
        header.addWidget(filter_btn)

        # Refresh button
        refresh_btn = QPushButton()
        refresh_btn.setObjectName("IconButton")
        refresh_btn.setFixedSize(32, 32)
        refresh_btn.setText("refresh")
        set_toolbutton_icon(refresh_btn, "refresh", size_px=16)
        header.addWidget(refresh_btn)

        layout.addLayout(header)

        # Summary cards
        summary_grid = QGridLayout()
        summary_grid.setSpacing(12)

        # Error card
        error_card = self._create_summary_card("error", "Errors", "8", c.error)
        summary_grid.addWidget(error_card, 0, 0)

        # Warning card
        warning_card = self._create_summary_card("warning", "Warnings", "12", c.warning)
        summary_grid.addWidget(warning_card, 0, 1)

        # Info card
        info_card = self._create_summary_card("info", "Info", "5", c.info)
        summary_grid.addWidget(info_card, 1, 0)

        # Success card
        success_card = self._create_summary_card("check_circle", "Success", "42", c.success)
        summary_grid.addWidget(success_card, 1, 1)

        layout.addLayout(summary_grid)

        # Diagnostics list
        diagnostics_header = QHBoxLayout()
        diagnostics_header.setSpacing(10)
        diag_title = QLabel("Recent Diagnostics")
        diag_title.setStyleSheet("font-size: 11pt; font-weight: 600;")
        diagnostics_header.addWidget(diag_title)
        diagnostics_header.addStretch(1)

        clear_btn = QPushButton("Clear All")
        clear_btn.setObjectName("Chip")
        clear_btn.setFixedHeight(28)
        diagnostics_header.addWidget(clear_btn)

        layout.addLayout(diagnostics_header)

        # Diagnostics tree
        self.tree = QTreeWidget()
        self.tree.setHeaderLabels(["Issue", "Project", "Time"])
        self.tree.setRootIsDecorated(False)
        self.tree.setAlternatingRowColors(True)
        self.tree.setStyleSheet(f"""
            QTreeWidget {{
                background: {c.surface_active};
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px;
                padding: 4px;
            }}
            QTreeWidget::item {{
                padding: 8px 10px;
                border-radius: 8px;
                margin: 2px 0px;
            }}
            QTreeWidget::item:selected {{
                background: rgba(134,56,250,0.15);
            }}
            QTreeWidget::header {{
                background: transparent;
                border: none;
                padding: 8px 0px;
            }}
        """)

        # Add sample diagnostics
        self._add_sample_diagnostics()

        layout.addWidget(self.tree, 1)

    def _create_summary_card(self, icon: str, title: str, count: str, color: str) -> QWidget:
        """Create a diagnostic summary card."""
        card = CardFrame(shadow=False)
        card.setStyleSheet(f"""
            background: {DESIGN.colors.surface_active};
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            padding: 16px;
        """)

        layout = QVBoxLayout(card)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)

        # Icon and title row
        top_row = QHBoxLayout()
        top_row.setContentsMargins(0, 0, 0, 0)
        top_row.setSpacing(8)

        icon_frame = QFrame()
        icon_frame.setFixedSize(32, 32)
        icon_frame.setStyleSheet(f"""
            border-radius: 8px;
            background: rgba({self._hex_to_rgb(color)}, 0.15);
            border: 1px solid rgba({self._hex_to_rgb(color)}, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon, size_px=16)
        icon_lbl.setStyleSheet(f"color: {color};")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        top_row.addWidget(icon_frame)

        title_lbl = QLabel(title)
        title_lbl.setStyleSheet("font-size: 10pt; font-weight: 600;")
        top_row.addWidget(title_lbl, 1)
        layout.addLayout(top_row)

        # Count
        count_lbl = QLabel(count)
        count_lbl.setStyleSheet(f"font-size: 20pt; font-weight: 700; color: {color};")
        layout.addWidget(count_lbl, 0, Qt.AlignCenter)

        return card

    def _add_sample_diagnostics(self) -> None:
        """Add sample diagnostics to the tree."""
        diagnostics = [
            ("Missing translation", "Project Alpha", "2 min ago", "warning"),
            ("Validation error", "Project Beta", "5 min ago", "error"),
            ("New string detected", "Project Gamma", "10 min ago", "info"),
            ("Translation completed", "Project Delta", "15 min ago", "success"),
            ("File not found", "Project Alpha", "20 min ago", "error"),
        ]

        for issue, project, time, severity in diagnostics:
            item = QTreeWidgetItem(self.tree, [issue, project, time])
            
            # Set color based on severity
            if severity == "error":
                color = DESIGN.colors.error
            elif severity == "warning":
                color = DESIGN.colors.warning
            elif severity == "info":
                color = DESIGN.colors.info
            else:
                color = DESIGN.colors.success
                
            item.setText(0, f"• {issue}")
            item.setToolTip(0, issue)
            item.setForeground(0, color)

    def _hex_to_rgb(self, hex_color: str) -> str:
        """Convert hex color to RGB string."""
        hex_color = hex_color.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        return f"{rgb[0]},{rgb[1]},{rgb[2]}"


# Helper function to set icon on button (since it's used in multiple places)
def set_toolbutton_icon(button, name: str, size_px: int = 18) -> None:
    """
    Sets an icon on a `QToolButton` using Material Symbols ligatures when available,
    otherwise falling back to a Unicode approximation.
    """
    try:
        from PySide6.QtGui import QFont
        from jpe_studio_qt.icons import icon_font_family
        from jpe_studio_qt.icons import icon_text

        f = QFont(icon_font_family())
        f.setPixelSize(size_px)
        button.setFont(f)
        button.setText(icon_text(name))
        return
    except Exception:
        button.setText(name)