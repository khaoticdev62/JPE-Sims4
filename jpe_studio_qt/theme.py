from __future__ import annotations

from jpe_studio_qt.design_system import DESIGN, mono_font_stack, ui_font_stack


def qss() -> str:
    """
    App-wide QSS aligned to `JPE assets folder/*/code.html`.

    We use:
    - `objectName` for legacy widgets
    - dynamic properties (`role=…`, `kind=…`, `variant=…`) for scalable styling
    """
    c = DESIGN.colors
    r = DESIGN.radius  # radius tokens
    ui_fonts = ui_font_stack()
    mono_fonts = mono_font_stack()

    return f"""
    * {{
      font-family: {ui_fonts};
      font-size: 11pt;
      color: {c.text};
    }}

    QWidget {{
      background: {c.background};
    }}

    QFrame#AppShell {{
      background: qradialgradient(cx: 1, cy: 0, radius: 1.2, fx: 1, fy: 0,
                                  stop: 0 rgba(134,56,250,0.14),
                                  stop: 0.35 rgba(59,130,246,0.05),
                                  stop: 1 {c.background});
    }}

    QFrame#Topbar {{
      background: {c.background};
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }}

    QFrame#Sidebar {{
      background: {c.surface};
      border-right: 1px solid rgba(255,255,255,0.05);
    }}

    /* Typography roles (preferred going forward). */
    QLabel[role="h1"] {{
      font-size: 24pt;
      font-weight: 700;
    }}
    QLabel[role="h2"] {{
      font-size: 16pt;
      font-weight: 700;
    }}
    QLabel[role="h3"] {{
      font-size: 14pt;
      font-weight: 700;
    }}
    QLabel[role="caption"] {{
      font-size: 9pt;
      color: {c.text_muted};
    }}
    QLabel[role="muted"] {{
      color: {c.text_muted};
    }}
    QLabel[role="mono"] {{
      font-family: {mono_fonts};
      font-size: 9pt;
      color: {c.text_muted};
    }}

    /* Legacy typography (objectName). */
    QLabel#H1 {{
      font-size: 24pt;
      font-weight: 700;
    }}
    QLabel#H2 {{
      font-size: 16pt;
      font-weight: 700;
    }}
    QLabel#Muted {{
      color: {c.text_muted};
    }}

    QToolTip {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.10);
      padding: 8px 10px;
      border-radius: {r.sm}px;
    }}

    QLineEdit {{
      background: rgba(26, 18, 37, 0.70);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: {r.sm}px;
      padding: 11px 14px;
      selection-background-color: {c.primary};
    }}
    QLineEdit:focus {{
      border: 1px solid {c.primary};
      background: rgba(26, 18, 37, 0.85);
    }}

    QComboBox {{
      background: rgba(26, 18, 37, 0.70);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: {r.sm}px;
      padding: 8px 10px;
    }}
    QComboBox:focus {{
      border: 1px solid {c.primary};
    }}
    QComboBox::drop-down {{
      border: none;
      width: 24px;
    }}
    QComboBox QAbstractItemView {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.10);
      selection-background-color: {c.primary};
      selection-color: #ffffff;
    }}

    QTextEdit {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: {r.sm}px;
      padding: 10px;
      selection-background-color: {c.primary};
    }}
    QTextEdit:focus {{
      border: 1px solid {c.primary};
    }}

    QPlainTextEdit {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: {r.md}px;
      padding: 10px;
      selection-background-color: rgba(134,56,250,0.30);
      selection-color: #ffffff;
      font-family: {mono_fonts};
    }}
    QPlainTextEdit:focus {{
      border: 1px solid {c.primary};
    }}

    /* Code editor variants used by the dual-pane screen. */
    QPlainTextEdit[variant="codePrimary"] {{
      background: {c.code_primary_bg};
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: {r.md}px;
    }}
    QPlainTextEdit[variant="codeOutput"] {{
      background: {c.code_output_bg};
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: {r.md}px;
    }}

    QTabWidget::pane {{
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: {r.lg}px;
      top: -1px;
      background: {c.surface};
    }}
    QTabBar::tab {{
      background: {c.surface_active};
      border: 1px solid rgba(255,255,255,0.10);
      border-bottom: none;
      padding: 8px 12px;
      border-top-left-radius: {r.sm}px;
      border-top-right-radius: {r.sm}px;
      margin-right: 6px;
    }}
    QTabBar::tab:selected {{
      background: {c.surface};
    }}

    /* Output View tabs (dual-pane). */
    QTabWidget#OutputTabs::pane {{
      border: none;
      background: transparent;
    }}
    QTabWidget#OutputTabs QTabBar::tab {{
      background: transparent;
      border: none;
      padding: 10px 12px;
      margin-right: 6px;
      font-size: 9pt;
      color: {c.text_muted};
    }}
    QTabWidget#OutputTabs QTabBar::tab:selected {{
      color: {c.text};
      font-weight: 700;
      border-bottom: 2px solid {c.primary};
    }}
    QTabWidget#OutputTabs QTabBar::tab:hover {{
      color: {c.text};
    }}

    QSplitter::handle {{
      background: {c.background};
    }}
    QSplitter::handle:hover {{
      background: rgba(255,255,255,0.06);
    }}

    QListWidget {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: {r.md}px;
      padding: 6px;
    }}
    QListWidget:focus {{
      border: 1px solid {c.primary};
    }}
    QListWidget::item {{
      padding: 10px 10px;
      border-radius: {r.sm}px;
    }}
    QListWidget::item:selected {{
      background: {c.primary};
      color: #ffffff;
    }}
    QListWidget::item:hover {{
      background: {c.surface_hover};
    }}

    QToolButton#NavButton {{
      background: transparent;
      border: 1px solid transparent;
      border-radius: {r.md}px;
      padding: 10px 12px;
      text-align: left;
    }}
    QToolButton#NavButton:hover {{
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.05);
    }}
    QToolButton#NavButton:checked {{
      background: rgba(134,56,250,0.12);
      border-color: rgba(134,56,250,0.22);
      color: {c.primary};
    }}

    QToolButton#IconButton {{
      background: transparent;
      border: 1px solid transparent;
      border-radius: {r.sm}px;
      padding: 8px 10px;
    }}
    QToolButton#IconButton:hover {{
      background: rgba(255,255,255,0.05);
      border-color: rgba(255,255,255,0.05);
    }}

    QToolButton#FloatingTool {{
      background: {c.surface_active};
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 16px;
      padding: 0px;
      color: {c.text};
    }}
    QToolButton#FloatingTool:hover {{
      background: {c.surface_hover};
      border-color: rgba(255,255,255,0.14);
    }}

    QPushButton {{
      border-radius: {r.md}px;
      padding: 10px 12px;
      border: 1px solid rgba(255,255,255,0.10);
      background: {c.surface_active};
    }}
    QPushButton:hover {{
      background: {c.surface_hover};
    }}
    QPushButton:focus {{
      border: 1px solid {c.primary};
    }}
    QPushButton#Primary {{
      background: {c.primary};
      border: 1px solid {c.primary};
      color: #ffffff;
      font-weight: 600;
    }}
    QPushButton#Primary:hover {{
      background: {c.primary_hover};
      border-color: {c.primary_hover};
    }}

    /* Primary button variant with role */
    QPushButton[role="primary"] {{
      background: {c.primary};
      border: 1px solid {c.primary};
      color: #ffffff;
      font-weight: 600;
      border-radius: {r.md}px;
      padding: 10px 12px;
    }}
    QPushButton[role="primary"]:hover {{
      background: {c.primary_hover};
      border-color: {c.primary_hover};
    }}
    QPushButton#Chip {{
      border-radius: {r.pill}px;
      padding: 6px 12px;
      background: {c.surface_active};
      border: 1px solid rgba(255,255,255,0.10);
      font-size: 9pt;
    }}
    QPushButton#Chip:hover {{
      background: {c.surface_hover};
    }}
    QPushButton#ChipActive {{
      border-radius: {r.pill}px;
      padding: 6px 12px;
      background: {c.primary};
      border: 1px solid {c.primary};
      color: #ffffff;
      font-size: 9pt;
      font-weight: 600;
    }}

    /* Property-driven chips (preferred). */
    QPushButton[kind="chip"] {{
      border-radius: {r.pill}px;
      padding: 6px 12px;
      background: {c.surface_active};
      border: 1px solid rgba(255,255,255,0.10);
      font-size: 9pt;
    }}
    QPushButton[kind="chipActive"] {{
      border-radius: {r.pill}px;
      padding: 6px 12px;
      background: {c.primary};
      border: 1px solid {c.primary};
      color: #ffffff;
      font-size: 9pt;
      font-weight: 600;
    }}

    QToolButton#QuickTile {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: {r.md}px;
      padding: 10px 10px;
    }}
    QToolButton#QuickTile:hover {{
      border: 1px solid rgba(134,56,250,0.25);
      background: rgba(255,255,255,0.03);
    }}

    QToolButton#Fab {{
      background: {c.primary};
      border: 1px solid {c.primary};
      border-radius: 28px;
      color: #ffffff;
      font-size: 18pt;
      font-weight: 800;
      padding: 10px;
    }}
    QToolButton#Fab:hover {{
      background: {c.primary_hover};
      border-color: {c.primary_hover};
    }}

    QFrame#Card {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: {r.lg}px;
    }}
    QFrame#Card:hover {{
      border: 1px solid rgba(134,56,250,0.15);
    }}

    QFrame#Card[variant="EditorHeader"] {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: {r.lg}px;
    }}

    QFrame#Card[variant="CodeStatusBar"] {{
      background: {c.surface_active};
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: {r.md}px;
    }}

    QPushButton#CardButton {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: {r.lg}px;
      padding: 12px 12px;
      text-align: left;
    }}
    QPushButton#CardButton:hover {{
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(134,56,250,0.18);
    }}

    QHeaderView::section {{
      background: {c.surface_active};
      color: {c.text};
      padding: 8px 10px;
      border: 0px;
      border-bottom: 1px solid rgba(255,255,255,0.10);
    }}

    QTableWidget {{
      background: {c.surface};
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: {r.md}px;
      gridline-color: rgba(255,255,255,0.10);
      selection-background-color: {c.primary};
      selection-color: #ffffff;
    }}

    QCheckBox {{
      spacing: 10px;
    }}
    QCheckBox::indicator {{
      width: 42px;
      height: 22px;
      border-radius: 11px;
      background: {c.surface_active};
      border: 1px solid rgba(255,255,255,0.12);
    }}
    QCheckBox::indicator:checked {{
      background: {c.primary};
      border: 1px solid rgba(134,56,250,0.45);
    }}

    QScrollBar:vertical {{
      background: transparent;
      width: 8px;
      margin: 0px;
    }}
    QScrollBar::handle:vertical {{
      background: {c.surface_active};
      min-height: 24px;
      border-radius: 4px;
    }}
    QScrollBar::handle:vertical:hover {{
      background: {c.surface_hover};
    }}
    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
      height: 0px;
    }}
    QScrollBar:horizontal {{
      background: transparent;
      height: 8px;
      margin: 0px;
    }}
    QScrollBar::handle:horizontal {{
      background: {c.surface_active};
      min-width: 24px;
      border-radius: 4px;
    }}
    QScrollBar::handle:horizontal:hover {{
      background: {c.surface_hover};
    }}
    QScrollBar::add-line:horizontal, QScrollBar::sub-line:horizontal {{
      width: 0px;
    }}

    /* Badge labels */
    QLabel[role="badge"] {{
      padding: 4px 8px;
      border-radius: {r.sm}px;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
    }}
    QLabel[role="badge"][variant="primary"] {{
      background: {c.primary_bg};
      color: {c.primary};
      border: 1px solid rgba(134,56,250,0.25);
    }}
    QLabel[role="badge"][variant="success"] {{
      background: {c.success_bg};
      color: {c.success};
      border: 1px solid rgba(34,197,94,0.25);
    }}
    QLabel[role="badge"][variant="warning"] {{
      background: {c.warning_bg};
      color: {c.warning};
      border: 1px solid rgba(234,179,8,0.25);
    }}
    QLabel[role="badge"][variant="error"] {{
      background: {c.error_bg};
      color: {c.error};
      border: 1px solid rgba(239,68,68,0.25);
    }}
    QLabel[role="badge"][variant="info"] {{
      background: {c.info_bg};
      color: {c.info};
      border: 1px solid rgba(76,201,240,0.25);
    }}
    """

