from __future__ import annotations

from dataclasses import dataclass

from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QColor, QPainter
from PySide6.QtWidgets import (
    QAbstractButton,
    QFrame,
    QGraphicsDropShadowEffect,
    QLabel,
    QPushButton,
    QSizePolicy,
    QToolButton,
)

from jpe_studio_qt.fonts import has_font_family
from jpe_studio_qt.design_tokens import DESIGN, SPACING, COLORS, RADIUS, SHADOWS, mono_font_stack
from jpe_studio_qt.icons import icon_font_family, icon_text


@dataclass(frozen=True)
class StatusBadge:
    text: str
    kind: str  # "primary" | "success" | "warning" | "error" | "muted"


class CardFrame(QFrame):
    def __init__(self, *, shadow: bool = True) -> None:
        super().__init__()
        self.setObjectName("Card")
        if shadow:
            eff = QGraphicsDropShadowEffect(self)
            eff.setBlurRadius(16)  # Stitch spec: Card hover shadow blur 16px
            eff.setOffset(0, 0)  # Centered glow (not offset)
            eff.setColor(QColor(134, 56, 250, 77))  # #8638fa @ 0.3 opacity (77 ≈ 255*0.3)
            self.setGraphicsEffect(eff)


class H1(QLabel):
    def __init__(self, text: str) -> None:
        super().__init__(text)
        self.setObjectName("H1")
        self.setProperty("role", "h1")


class H2(QLabel):
    def __init__(self, text: str) -> None:
        super().__init__(text)
        self.setObjectName("H2")
        self.setProperty("role", "h2")


class Muted(QLabel):
    def __init__(self, text: str) -> None:
        super().__init__(text)
        self.setObjectName("Muted")
        self.setProperty("role", "muted")
        self.setWordWrap(True)


class Mono(QLabel):
    def __init__(self, text: str) -> None:
        super().__init__(text)
        self.setProperty("role", "mono")
        self.setWordWrap(False)


class MaterialIcon(QLabel):
    """
    Icon label that renders Material Symbols ligatures when available; falls back to
    Unicode glyphs when not.
    """

    def __init__(self, name: str, *, size_px: int = 18) -> None:
        # For Material Symbols ligatures to work, we need to set the text to the icon name itself,
        # not the fallback character. The font will render the ligature automatically.
        super().__init__(name)
        self.setProperty("role", "icon")
        self._apply_font(name, size_px)

    def _apply_font(self, name: str, size_px: int) -> None:
        """Apply the correct font for Material Symbols icon."""
        try:
            from PySide6.QtGui import QFont, QFontDatabase
            import jpe_studio_qt.icons  # Ensure icons module is loaded first

            # Get the correct font family
            icon_font_name = icon_font_family()

            # Create font
            font = QFont(icon_font_name)
            font.setPixelSize(size_px)

            # Apply font to this label
            self.setFont(font)

            # Test if font is actually applied by checking the font family
            applied_family = self.font().family()
            if "Material Symbols" not in applied_family:
                print(f"Warning: Material Symbols font not properly applied. Got: {applied_family}")
        except Exception as e:
            # Fallback to standard approach if anything fails
            try:
                from PySide6.QtGui import QFont
                f = QFont(icon_font_family())
                f.setPixelSize(size_px)
                self.setFont(f)
            except Exception:
                pass


class ChipButton(QPushButton):
    def __init__(self, text: str, *, active: bool = False) -> None:
        super().__init__(text)
        self.setObjectName("ChipActive" if active else "Chip")
        self.setProperty("kind", "chipActive" if active else "chip")
        self.setCheckable(True)
        self.setChecked(active)


class IconCircleButton(QToolButton):
    def __init__(self, *, label: str, glyph: str) -> None:
        super().__init__()
        self.setObjectName("QuickTile")
        self.setToolButtonStyle(Qt.ToolButtonTextUnderIcon)
        # Using glyph text keeps us dependency-free vs icon packs; QSS styles it as a circle.
        self.setText(label)
        self.setIconText(glyph)


def apply_mono_font(widget) -> None:
    try:
        widget.setStyleSheet(f"font-family: {mono_font_stack()};")
    except Exception:
        return


def set_toolbutton_icon(button: QToolButton, name: str, *, size_px: int = 18) -> None:
    """
    Sets an icon on a `QToolButton` using Material Symbols ligatures when available,
    otherwise falling back to a Unicode approximation.
    """
    if has_font_family(icon_font_family()):
        try:
            from PySide6.QtGui import QFont

            f = QFont(icon_font_family())
            f.setPixelSize(size_px)
            button.setFont(f)
            button.setText(name)
            return
        except Exception:
            pass
    button.setText(icon_text(name))


class BadgeLabel(QLabel):
    """
    Status badge with color variants (primary, success, warning, error, info).
    """

    def __init__(self, text: str, *, variant: str = "primary") -> None:
        super().__init__(text)
        self.setProperty("role", "badge")
        self.setProperty("variant", variant)
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)


class FAB(QToolButton):
    """
    Floating Action Button (56x56px) with primary color and shadow.
    The FAB is intentionally fixed size to maintain its recognizable circular shape.
    """

    def __init__(self, *, icon_name: str = "add") -> None:
        super().__init__()
        self.setObjectName("Fab")
        self.setFixedSize(56, 56)  # FAB intentionally has fixed size
        set_toolbutton_icon(self, icon_name, size_px=28)


class SearchBar(QFrame):
    """
    Enhanced search input with icon prefix and clear button suffix.
    """

    from PySide6.QtCore import Signal

    textChanged = Signal(str)
    returnPressed = Signal()

    def __init__(self, *, placeholder: str = "Search...") -> None:
        from PySide6.QtWidgets import QHBoxLayout, QLineEdit, QToolButton

        super().__init__()
        self.setObjectName("Card")
        self.setMinimumHeight(48)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Minimum)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.md, 0, DESIGN.spacing.md, 0)  # 12px side margins
        layout.setSpacing(DESIGN.spacing.xs)  # 8px spacing

        # Search icon
        icon = MaterialIcon("search", size_px=20)
        icon.setProperty("role", "muted")
        layout.addWidget(icon)

        # Input field
        self._input = QLineEdit()
        self._input.setPlaceholderText(placeholder)
        self._input.setFrame(False)
        self._input.setStyleSheet("QLineEdit { background: transparent; border: none; padding: 0px; }")
        self._input.textChanged.connect(self.textChanged.emit)
        self._input.returnPressed.connect(self.returnPressed.emit)
        layout.addWidget(self._input, 1)

        # Clear button (hidden when empty)
        self._clear_btn = QToolButton()
        self._clear_btn.setObjectName("IconButton")
        set_toolbutton_icon(self._clear_btn, "close", size_px=16)
        self._clear_btn.clicked.connect(self._input.clear)
        self._clear_btn.setVisible(False)
        self._input.textChanged.connect(lambda txt: self._clear_btn.setVisible(bool(txt)))
        layout.addWidget(self._clear_btn)

    def text(self) -> str:
        return self._input.text()

    def setText(self, text: str) -> None:
        self._input.setText(text)

    def clear(self) -> None:
        self._input.clear()


class EmptyStateWidget(QFrame):
    """
    Empty state display with icon, title, description, and optional action button.
    """

    from PySide6.QtCore import Signal

    actionClicked = Signal()

    def __init__(
        self,
        *,
        icon_name: str = "inbox",
        title: str = "No items",
        description: str = "There are no items to display.",
        action_text: str | None = None,
    ) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QPushButton

        super().__init__()
        self.setObjectName("Card")
        self.setStyleSheet("QFrame#Card { border-style: dashed; }")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.xl*2, DESIGN.spacing.xl*2, DESIGN.spacing.xl*2, DESIGN.spacing.xl*2)  # 40px margins
        layout.setSpacing(DESIGN.spacing.lg)  # 16px spacing
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Icon
        icon = MaterialIcon(icon_name, size_px=64)
        icon.setProperty("role", "muted")
        icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(icon)

        # Title
        title_label = H2(title)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title_label)

        # Description
        desc_label = Muted(description)
        desc_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        desc_label.setWordWrap(True)
        layout.addWidget(desc_label)

        # Optional action button
        if action_text:
            btn = QPushButton(action_text)
            btn.setObjectName("Primary")
            btn.clicked.connect(self.actionClicked.emit)
            layout.addWidget(btn, 0, Qt.AlignmentFlag.AlignCenter)


class ToggleSwitch(QAbstractButton):
    """
    Small pill switch aligned to the JPE desktop assets.

    This avoids platform-native checkbox rendering and gives consistent visuals in Qt.
    """

    def __init__(self, *, checked: bool = False, size: QSize | None = None) -> None:
        super().__init__()
        self.setCheckable(True)
        self.setChecked(bool(checked))
        self.setCursor(Qt.PointingHandCursor)
        self.setFocusPolicy(Qt.StrongFocus)
        self._size = size or QSize(36, 20)
        self.setFixedSize(self._size)

    def sizeHint(self) -> QSize:  # pragma: no cover
        return QSize(self._size)

    def paintEvent(self, _ev) -> None:  # pragma: no cover (visual)
        w = float(self.width())
        h = float(self.height())
        radius = h / 2.0
        pad = 2.0
        knob = h - (pad * 2.0)
        x = pad if not self.isChecked() else (w - knob - pad)

        track_off = QColor(28, 20, 43, 255)
        border_off = QColor(71, 47, 106, 255)
        knob_off = QColor(167, 142, 204, 255)

        # Updated to new primary color #8638fa (was #9d5cff)
        track_on = QColor(134, 56, 250, 50)
        border_on = QColor(134, 56, 250, 130)
        knob_on = QColor(134, 56, 250, 255)

        if not self.isEnabled():
            track_off.setAlpha(100)
            border_off.setAlpha(100)
            knob_off.setAlpha(120)
            track_on.setAlpha(80)
            border_on.setAlpha(90)
            knob_on.setAlpha(130)

        track = track_on if self.isChecked() else track_off
        border = border_on if self.isChecked() else border_off
        knob_c = knob_on if self.isChecked() else knob_off

        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing, True)
        p.setPen(border)
        p.setBrush(track)
        p.drawRoundedRect(pad / 2.0, pad / 2.0, w - pad, h - pad, radius, radius)

        p.setPen(Qt.NoPen)
        p.setBrush(knob_c)
        p.drawEllipse(x, pad, knob, knob)


class SegmentedControl(QFrame):
    """
    Multi-button pill container with active state indicator.
    """

    from PySide6.QtCore import Signal

    currentChanged = Signal(int)  # Emits index of selected button

    def __init__(self, *, labels: list[str]) -> None:
        from PySide6.QtWidgets import QButtonGroup, QHBoxLayout

        super().__init__()
        self.setObjectName("Card")
        self.setFixedHeight(40)
        self.setStyleSheet("QFrame#Card { padding: 4px; }")

        layout = QHBoxLayout(self)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.setSpacing(4)

        self._button_group = QButtonGroup(self)
        self._buttons: list[ChipButton] = []

        for i, label in enumerate(labels):
            btn = ChipButton(label, active=(i == 0))
            btn.clicked.connect(lambda checked, idx=i: self._on_button_clicked(idx))
            self._button_group.addButton(btn, i)
            self._buttons.append(btn)
            layout.addWidget(btn)

    def _on_button_clicked(self, index: int) -> None:
        # Update all buttons
        for i, btn in enumerate(self._buttons):
            active = i == index
            btn.setObjectName("ChipActive" if active else "Chip")
            btn.setProperty("kind", "chipActive" if active else "chip")
            btn.setChecked(active)
            btn.style().unpolish(btn)
            btn.style().polish(btn)
        self.currentChanged.emit(index)

    def currentIndex(self) -> int:
        return self._button_group.checkedId()

    def setCurrentIndex(self, index: int) -> None:
        if 0 <= index < len(self._buttons):
            self._on_button_clicked(index)


class ProgressCard(CardFrame):
    """
    Project card with title, status badge, progress bar, and metadata.
    """

    from PySide6.QtCore import Signal

    clicked = Signal()

    def __init__(
        self,
        *,
        title: str = "Project",
        path: str = "",
        progress: int = 0,
        status: str = "Ready",
        status_variant: str = "success",
    ) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout, QProgressBar

        super().__init__(shadow=False)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg, DESIGN.spacing.lg)  # 16px margins
        layout.setSpacing(DESIGN.spacing.md)  # 12px spacing

        # Header row: Title + Badge
        header = QHBoxLayout()
        header.setSpacing(DESIGN.spacing.md)  # 10px spacing

        title_label = QLabel(title)
        title_label.setProperty("role", "h3")
        header.addWidget(title_label, 1)

        badge = BadgeLabel(status, variant=status_variant)
        header.addWidget(badge)

        layout.addLayout(header)

        # Path
        if path:
            path_label = Muted(path)
            path_label.setProperty("role", "caption")
            layout.addWidget(path_label)

        # Progress bar
        progress_bar = QProgressBar()
        progress_bar.setValue(progress)
        progress_bar.setFixedHeight(8)
        progress_bar.setTextVisible(False)
        progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background: rgba(255,255,255,0.05);
                border-radius: 4px;
                border: none;
            }}
            QProgressBar::chunk {{
                background: #8638fa;
                border-radius: 4px;
            }}
        """)
        layout.addWidget(progress_bar)

        # Metadata row
        meta = QHBoxLayout()
        meta.setSpacing(8)

        progress_label = QLabel(f"{progress}% Complete")
        progress_label.setProperty("role", "caption")
        meta.addWidget(progress_label, 1)

        # Timestamp placeholder
        time_label = QLabel("2h ago")
        time_label.setProperty("role", "caption")
        meta.addWidget(time_label)

        layout.addLayout(meta)

    def mousePressEvent(self, event) -> None:
        super().mousePressEvent(event)
        if event.button() == Qt.MouseButton.LeftButton:
            self.clicked.emit()


# ============================================================================
# ATOMIC COMPONENTS - Button, Input, Select, Checkbox, Radio, Toggle, etc.
# ============================================================================


class Button(QPushButton):
    """
    Primary button component with three variants: primary, secondary, ghost.

    Features:
    - Primary: neon purple (#8638fa) with glow effect
    - Secondary: outlined with border
    - Ghost: minimal, transparent
    """

    def __init__(self, text: str, *, variant: str = "primary") -> None:
        super().__init__(text)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setMinimumHeight(40)

        if variant == "primary":
            self._apply_primary_style()
        elif variant == "secondary":
            self._apply_secondary_style()
        else:  # ghost
            self._apply_ghost_style()

    def _apply_primary_style(self) -> None:
        """Primary button: neon purple with glow."""
        self.setStyleSheet(f"""
            QPushButton {{
                background: {COLORS.accent_primary};
                color: {COLORS.text_primary};
                border: none;
                border-radius: {RADIUS.md}px;
                padding: 0 {SPACING.lg}px;
                font-size: 14px;
                font-weight: 600;
            }}
            QPushButton:hover {{
                background: {COLORS.accent_hover};
            }}
            QPushButton:pressed {{
                background: {COLORS.accent_pressed};
            }}
            QPushButton:disabled {{
                background: {COLORS.surface_1};
                color: {COLORS.text_disabled};
            }}
        """)

        # Add glow effect
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(SHADOWS.glow_accent_blur)
        shadow.setColor(QColor(157, 92, 255, 46))  # accent_glow color with alpha
        shadow.setOffset(0, 0)
        self.setGraphicsEffect(shadow)

    def _apply_secondary_style(self) -> None:
        """Secondary button: outlined with border."""
        self.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                color: {COLORS.text_primary};
                border: 1px solid {COLORS.stroke_1};
                border-radius: {RADIUS.md}px;
                padding: 0 {SPACING.lg}px;
                font-size: 14px;
                font-weight: 600;
            }}
            QPushButton:hover {{
                background: {COLORS.surface_1};
                border-color: {COLORS.accent_primary};
            }}
            QPushButton:pressed {{
                background: {COLORS.accent_bg};
            }}
            QPushButton:disabled {{
                color: {COLORS.text_disabled};
                border-color: {COLORS.stroke_0};
            }}
        """)

    def _apply_ghost_style(self) -> None:
        """Ghost button: minimal, no border."""
        self.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                color: {COLORS.text_secondary};
                border: none;
                border-radius: {RADIUS.md}px;
                padding: 0 {SPACING.md}px;
                font-size: 14px;
                font-weight: 500;
            }}
            QPushButton:hover {{
                background: {COLORS.surface_0};
                color: {COLORS.text_primary};
            }}
            QPushButton:pressed {{
                background: {COLORS.surface_1};
            }}
            QPushButton:disabled {{
                color: {COLORS.text_disabled};
            }}
        """)


class Input(QFrame):
    """
    Input field component (QLineEdit wrapper) with consistent styling.
    """

    from PySide6.QtCore import Signal

    textChanged = Signal(str)
    returnPressed = Signal()

    def __init__(self, placeholder: str = "", *, has_clear_button: bool = True) -> None:
        from PySide6.QtWidgets import QHBoxLayout, QLineEdit, QToolButton

        super().__init__()
        self.setObjectName("Card")
        self.setMinimumHeight(44)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(SPACING.md, 0, SPACING.md, 0)
        layout.setSpacing(0)

        # Input field
        self._input = QLineEdit()
        self._input.setPlaceholderText(placeholder)
        self._input.setFrame(False)
        self._input.setStyleSheet("QLineEdit { background: transparent; border: none; padding: 0px; }")
        self._input.textChanged.connect(self.textChanged.emit)
        self._input.returnPressed.connect(self.returnPressed.emit)
        layout.addWidget(self._input, 1)

        # Clear button (optional)
        if has_clear_button:
            self._clear_btn = QToolButton()
            self._clear_btn.setObjectName("IconButton")
            set_toolbutton_icon(self._clear_btn, "close", size_px=16)
            self._clear_btn.clicked.connect(self._input.clear)
            self._clear_btn.setVisible(False)
            self._input.textChanged.connect(lambda txt: self._clear_btn.setVisible(bool(txt)))
            layout.addWidget(self._clear_btn)

    def text(self) -> str:
        return self._input.text()

    def setText(self, text: str) -> None:
        self._input.setText(text)

    def clear(self) -> None:
        self._input.clear()

    def setPlaceholderText(self, text: str) -> None:
        self._input.setPlaceholderText(text)


class Select(QPushButton):
    """
    Dropdown select component (simplified as button with menu).
    """

    from PySide6.QtCore import Signal

    currentIndexChanged = Signal(int)

    def __init__(self, options: list[str], *, placeholder: str = "Select...") -> None:
        from PySide6.QtWidgets import QMenu

        super().__init__(placeholder)
        self.setMinimumHeight(44)
        self.setMinimumWidth(200)
        self.setObjectName("Chip")

        self._options = options
        self._current_index = -1

        # Create menu
        self._menu = QMenu(self)
        for i, option in enumerate(options):
            self._menu.addAction(option, lambda checked=False, idx=i: self._on_option_selected(idx))

        self.setMenu(self._menu)

    def _on_option_selected(self, index: int) -> None:
        self._current_index = index
        self.setText(self._options[index])
        self.currentIndexChanged.emit(index)

    def currentIndex(self) -> int:
        return self._current_index

    def currentText(self) -> str:
        return self._options[self._current_index] if self._current_index >= 0 else ""


class Checkbox(QAbstractButton):
    """
    Custom checkbox component with design system styling.
    """

    from PySide6.QtCore import Signal

    toggled = Signal(bool)

    def __init__(self, label: str = "", *, checked: bool = False) -> None:
        super().__init__(label)
        self.setCheckable(True)
        self.setChecked(checked)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFocusPolicy(Qt.StrongFocus)
        self.toggled.connect(self.toggled.emit)

        self.setStyleSheet(f"""
            QAbstractButton {{
                color: {COLORS.text_primary};
                font-size: 14px;
                spacing: 8px;
            }}
        """)

    def sizeHint(self) -> QSize:
        return QSize(200, 24)

    def paintEvent(self, event) -> None:
        """Paint the checkbox with custom styling."""
        from PySide6.QtGui import QColor, QPainter, QRect

        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing, True)

        # Checkbox box
        box_rect = QRect(0, (self.height() - 20) // 2, 20, 20)

        # Draw background
        if self.isChecked():
            p.fillRect(box_rect, QColor(COLORS.accent_primary))
        else:
            p.fillRect(box_rect, QColor(COLORS.surface_0))

        # Draw border
        p.setPen(QColor(COLORS.accent_primary if self.isChecked() else COLORS.stroke_1))
        p.drawRect(box_rect)

        # Draw text
        text_rect = QRect(28, 0, self.width() - 28, self.height())
        p.setPen(QColor(COLORS.text_primary))
        p.drawText(text_rect, Qt.AlignVCenter, self.text())


class Radio(QAbstractButton):
    """
    Custom radio button component with design system styling.
    """

    from PySide6.QtCore import Signal

    toggled = Signal(bool)

    def __init__(self, label: str = "", *, checked: bool = False) -> None:
        super().__init__(label)
        self.setCheckable(True)
        self.setChecked(checked)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setFocusPolicy(Qt.StrongFocus)
        self.toggled.connect(self.toggled.emit)

        self.setStyleSheet(f"""
            QAbstractButton {{
                color: {COLORS.text_primary};
                font-size: 14px;
                spacing: 8px;
            }}
        """)

    def sizeHint(self) -> QSize:
        return QSize(200, 24)

    def paintEvent(self, event) -> None:
        """Paint the radio button with custom styling."""
        from PySide6.QtGui import QColor, QPainter

        p = QPainter(self)
        p.setRenderHint(QPainter.Antialiasing, True)

        # Radio circle
        circle_center_x = 10
        circle_center_y = self.height() // 2
        circle_radius = 8

        # Draw background
        if self.isChecked():
            p.fillEllipse(circle_center_x - circle_radius, circle_center_y - circle_radius,
                         circle_radius * 2, circle_radius * 2, QColor(COLORS.accent_primary))
        else:
            p.fillEllipse(circle_center_x - circle_radius, circle_center_y - circle_radius,
                         circle_radius * 2, circle_radius * 2, QColor(COLORS.surface_0))

        # Draw border
        p.setPen(QColor(COLORS.accent_primary if self.isChecked() else COLORS.stroke_1))
        p.drawEllipse(circle_center_x - circle_radius, circle_center_y - circle_radius,
                     circle_radius * 2, circle_radius * 2)

        # Draw text
        text_x = 28
        p.setPen(QColor(COLORS.text_primary))
        p.drawText(text_x, 0, self.width() - text_x, self.height(),
                  Qt.AlignLeft | Qt.AlignVCenter, self.text())


# ============================================================================
# MOLECULAR COMPONENTS - Atoms combined into repeating UI patterns
# ============================================================================


class TopBar(QFrame):
    """
    Top app bar with back button, title, and action icons.
    Fixed 64px height with glassmorphic styling.
    """

    from PySide6.QtCore import Signal

    back_clicked = Signal()

    def __init__(self, title: str, *, has_back: bool = False, actions: list[str] | None = None) -> None:
        from PySide6.QtWidgets import QHBoxLayout

        super().__init__()
        self.setObjectName("Card")
        self.setFixedHeight(64)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(SPACING.lg, 0, SPACING.lg, 0)
        layout.setSpacing(SPACING.md)

        # Back button
        if has_back:
            back_btn = IconCircleButton(label="", glyph="←")
            back_btn.clicked.connect(self.back_clicked.emit)
            layout.addWidget(back_btn)

        # Title
        title_label = H1(title)
        title_label.setStyleSheet("font-weight: 600;")
        layout.addWidget(title_label)

        layout.addStretch(1)

        # Action icons
        if actions:
            for icon_name in actions:
                icon_btn = IconCircleButton(label="", glyph=icon_name)
                layout.addWidget(icon_btn)


class FilterChipsRow(QFrame):
    """
    Horizontal row of filter chips with exclusive selection.
    Active chip shows accent background and border.
    """

    from PySide6.QtCore import Signal

    chip_clicked = Signal(str)  # Emits chip label

    def __init__(self, chips: list[str], *, active_chip: str | None = None) -> None:
        from PySide6.QtWidgets import QHBoxLayout

        super().__init__()

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(SPACING.xs)

        self.buttons: list[ChipButton] = []

        for chip_text in chips:
            btn = ChipButton(chip_text, active=(chip_text == active_chip))
            btn.clicked.connect(lambda checked, text=chip_text: self._on_chip_clicked(text))
            layout.addWidget(btn)
            self.buttons.append(btn)

        layout.addStretch(1)

    def _on_chip_clicked(self, text: str) -> None:
        # Uncheck other buttons (exclusive selection)
        for btn in self.buttons:
            if btn.text() != text:
                btn.setChecked(False)
            else:
                btn.setChecked(True)

        self.chip_clicked.emit(text)


class ListCard(QFrame):
    """
    Rounded card container with title, metadata, and status pill.
    Includes hover effects with background color change.
    """

    from PySide6.QtCore import Signal

    clicked = Signal()

    def __init__(self, title: str, *, metadata: str = "", status: str = "", status_variant: str = "neutral") -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout

        super().__init__()
        self.setObjectName("Card")
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)
        layout.setSpacing(SPACING.xs)

        # Top row: title + status
        top_row = QHBoxLayout()
        top_row.setSpacing(SPACING.sm)

        title_label = QLabel(title)
        title_label.setStyleSheet(f"font-size: 15px; font-weight: 600; color: {COLORS.text_primary};")
        top_row.addWidget(title_label, 1)

        if status:
            pill = Pill(status, variant=status_variant)
            top_row.addWidget(pill)

        layout.addLayout(top_row)

        # Metadata
        if metadata:
            meta_label = Muted(metadata)
            meta_label.setStyleSheet(f"font-size: 12px; color: {COLORS.text_secondary};")
            layout.addWidget(meta_label)

    def mousePressEvent(self, event) -> None:
        super().mousePressEvent(event)
        if event.button() == Qt.MouseButton.LeftButton:
            self.clicked.emit()


class DiagnosticsRow(QFrame):
    """
    Diagnostics list row with severity icon, title, subtitle, and timestamp.
    Color-coded by severity level (error, warning, info).
    """

    SEVERITY_ICONS = {
        "error": ("error_outline", COLORS.error),
        "warning": ("warning", COLORS.warning),
        "info": ("info", COLORS.info),
    }

    def __init__(self, severity: str, title: str, *, subtitle: str = "", timestamp: str = "") -> None:
        from PySide6.QtWidgets import QHBoxLayout, QVBoxLayout

        super().__init__()
        self.setStyleSheet(f"background: transparent; border-bottom: 1px solid {COLORS.stroke_0}; padding: {SPACING.md}px 0;")

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, SPACING.sm, 0, SPACING.sm)
        layout.setSpacing(SPACING.md)

        # Severity icon
        icon_name, icon_color = self.SEVERITY_ICONS.get(severity, self.SEVERITY_ICONS["info"])
        icon = MaterialIcon(icon_name, size_px=20)
        icon.setStyleSheet(f"color: {icon_color};")
        layout.addWidget(icon)

        # Text column
        text_col = QVBoxLayout()
        text_col.setSpacing(4)

        title_label = QLabel(title)
        title_label.setStyleSheet(f"font-size: 14px; font-weight: 600; color: {COLORS.text_primary};")
        text_col.addWidget(title_label)

        if subtitle:
            subtitle_label = Muted(subtitle)
            subtitle_label.setStyleSheet(f"font-size: 12px; color: {COLORS.text_secondary};")
            text_col.addWidget(subtitle_label)

        layout.addLayout(text_col, 1)

        # Timestamp
        if timestamp:
            time_label = QLabel(timestamp)
            time_label.setStyleSheet(f"font-size: 11px; color: {COLORS.text_tertiary};")
            layout.addWidget(time_label)


class CodeInlineWarning(QFrame):
    """
    Inline code warning with line number highlight, message, and severity pill.
    Used in code editor contexts to highlight problematic lines.
    """

    def __init__(self, line_num: int, message: str, *, severity: str = "warning") -> None:
        from PySide6.QtWidgets import QHBoxLayout

        super().__init__()

        variant_bg = COLORS.warning_bg if severity == "warning" else COLORS.error_bg
        variant_color = COLORS.warning if severity == "warning" else COLORS.error
        variant_pill = "warn" if severity == "warning" else "error"

        self.setStyleSheet(f"""
            background: {variant_bg};
            border-left: 3px solid {variant_color};
            border-radius: {RADIUS.sm}px;
            padding: {SPACING.xs}px {SPACING.sm}px;
        """)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(SPACING.sm, SPACING.xs, SPACING.sm, SPACING.xs)
        layout.setSpacing(SPACING.sm)

        # Line number
        line_label = QLabel(f"L{line_num}")
        line_label.setStyleSheet(f"font-family: {mono_font_stack()}; font-size: 11px; color: {COLORS.text_tertiary};")
        layout.addWidget(line_label)

        # Message
        msg_label = QLabel(message)
        msg_label.setStyleSheet(f"font-size: 12px; color: {COLORS.text_secondary};")
        layout.addWidget(msg_label, 1)

        # Pill
        pill = Pill(severity.upper(), variant=variant_pill)
        layout.addWidget(pill)


class ModalAlert(QFrame):
    """
    Modal dialog for warnings/errors with icon, title, code snippet, message, and actions.
    Features glassmorphism styling and glow effects.
    """

    from PySide6.QtCore import Signal

    ignored = Signal()
    quick_fixed = Signal()

    def __init__(
        self,
        title: str,
        *,
        code_snippet: str = "",
        message: str = "",
        icon: str = "warning",
    ) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout

        super().__init__()
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.Dialog)
        self.setModal(True)
        self.setFixedWidth(520)

        # Glassmorphism background
        self.setStyleSheet(f"""
            QFrame {{
                background: {COLORS.glass_overlay};
                border: 1px solid {COLORS.glass_border};
                border-radius: {RADIUS.xl}px;
            }}
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.xl, SPACING.xl, SPACING.xl, SPACING.xl)
        layout.setSpacing(SPACING.lg)

        # Header: icon + title
        header = QHBoxLayout()
        header.setSpacing(SPACING.md)

        icon_label = MaterialIcon(icon, size_px=32)
        icon_label.setStyleSheet(f"color: {COLORS.warning};")
        header.addWidget(icon_label)

        title_label = H2(title)
        title_label.setStyleSheet("font-weight: 600;")
        header.addWidget(title_label, 1)

        layout.addLayout(header)

        # Code pill
        if code_snippet:
            code_pill = Pill(code_snippet, variant="neutral")
            code_pill.setStyleSheet(f"""
                background: {COLORS.surface_0};
                color: {COLORS.accent_primary};
                font-family: {mono_font_stack()};
                font-size: 12px;
                padding: 6px 14px;
            """)
            layout.addWidget(code_pill)

        # Message
        if message:
            msg_label = QLabel(message)
            msg_label.setWordWrap(True)
            msg_label.setStyleSheet(f"font-size: 13px; color: {COLORS.text_secondary}; line-height: 1.5;")
            layout.addWidget(msg_label)

        # Actions
        actions_row = QHBoxLayout()
        actions_row.setSpacing(SPACING.sm)
        actions_row.addStretch(1)

        ignore_btn = Button("Ignore", variant="ghost")
        ignore_btn.clicked.connect(self.ignored.emit)
        ignore_btn.clicked.connect(self.close)
        actions_row.addWidget(ignore_btn)

        fix_btn = Button("Quick Fix", variant="primary")
        fix_btn.clicked.connect(self.quick_fixed.emit)
        fix_btn.clicked.connect(self.close)
        actions_row.addWidget(fix_btn)

        layout.addLayout(actions_row)


class Divider(QFrame):
    """
    Horizontal divider line with subtle border color.
    """

    def __init__(self) -> None:
        super().__init__()
        self.setFrameShape(QFrame.HLine)
        self.setFixedHeight(1)
        self.setStyleSheet(f"background: {COLORS.stroke_0}; border: none;")


class Badge(QLabel):
    """
    Status badge pill component with multiple variants.
    Replaces/complements BadgeLabel with more options.
    """

    def __init__(self, text: str, *, variant: str = "primary", size: str = "md") -> None:
        super().__init__(text)
        self.setAlignment(Qt.AlignCenter)

        variants = {
            "primary": (COLORS.accent_primary, COLORS.accent_bg),
            "success": (COLORS.success, COLORS.success_bg),
            "warning": (COLORS.warning, COLORS.warning_bg),
            "error": (COLORS.error, COLORS.error_bg),
            "info": (COLORS.info, COLORS.info_bg),
            "neutral": (COLORS.text_secondary, COLORS.surface_1),
        }

        fg, bg = variants.get(variant, variants["neutral"])

        size_map = {
            "sm": (f"padding: 2px 8px; font-size: 10px;", RADIUS.sm),
            "md": (f"padding: 4px 12px; font-size: 11px;", RADIUS.md),
            "lg": (f"padding: 6px 14px; font-size: 12px;", RADIUS.lg),
        }

        size_css, radius = size_map.get(size, size_map["md"])

        self.setStyleSheet(f"""
            QLabel {{
                background: {bg};
                color: {fg};
                border-radius: {radius}px;
                {size_css}
                font-weight: 600;
                letter-spacing: 0.5px;
            }}
        """)


class Pill(Badge):
    """
    Alias for Badge - status pill with rounded corners.
    Kept for backward compatibility with existing code.
    """

    pass


class ProgressBar(QFrame):
    """
    Progress bar component with glowing fill and accent color.
    8px height with gradient effect.
    """

    def __init__(self, *, value: int = 0, max_value: int = 100) -> None:
        from PySide6.QtWidgets import QHBoxLayout, QProgressBar

        super().__init__()
        self.setFixedHeight(12)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        self.progress_bar = QProgressBar()
        self.progress_bar.setMinimum(0)
        self.progress_bar.setMaximum(max_value)
        self.progress_bar.setValue(value)
        self.progress_bar.setTextVisible(False)

        self.progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background: {COLORS.surface_0};
                border: none;
                border-radius: 6px;
            }}
            QProgressBar::chunk {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 {COLORS.accent_pressed},
                    stop:1 {COLORS.accent_primary});
                border-radius: 6px;
            }}
        """)

        # Add glow effect
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(12)
        shadow.setColor(QColor(157, 92, 255, 46))
        shadow.setOffset(0, 0)
        self.progress_bar.setGraphicsEffect(shadow)

        layout.addWidget(self.progress_bar)

    def setValue(self, value: int) -> None:
        self.progress_bar.setValue(value)

    def value(self) -> int:
        return self.progress_bar.value()


# ============================================================================
# ORGANISM COMPONENTS - Screen-level building blocks
# ============================================================================


class BuildHistoryItem(CardFrame):
    """
    Build history card with status pill, progress bar, and timestamp.
    Combines CardFrame, ProgressBar, and Badge components.
    """

    from PySide6.QtCore import Signal

    clicked = Signal()

    def __init__(
        self,
        *,
        title: str = "Build",
        status: str = "Success",
        status_variant: str = "success",
        progress: int = 100,
        timestamp: str = "2h ago",
    ) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout

        super().__init__(shadow=False)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.lg, SPACING.lg, SPACING.lg, SPACING.lg)
        layout.setSpacing(SPACING.md)

        # Header row: Title + Status
        header = QHBoxLayout()

        title_label = QLabel(title)
        title_label.setProperty("role", "h3")
        header.addWidget(title_label, 1)

        badge = BadgeLabel(status, variant=status_variant)
        header.addWidget(badge)

        layout.addLayout(header)

        # Progress bar (if running)
        if status == "running" or status.lower() == "in progress":
            progress_bar = ProgressBar(value=progress)
            layout.addWidget(progress_bar)

        # Bottom row: timestamp
        time_label = Muted(timestamp)
        time_label.setProperty("role", "caption")
        layout.addWidget(time_label)

    def mousePressEvent(self, event) -> None:
        super().mousePressEvent(event)
        if event.button() == Qt.MouseButton.LeftButton:
            self.clicked.emit()


class InspectorHeader(CardFrame):
    """
    Inspector header with entity name, badges, and action buttons.
    Used at the top of detail/inspector panels.
    """

    from PySide6.QtCore import Signal

    action_clicked = Signal(str)  # Emits action name

    def __init__(
        self,
        entity_name: str,
        *,
        badges: list[tuple[str, str]] | None = None,
        actions: list[str] | None = None,
    ) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout

        super().__init__(shadow=False)

        layout = QVBoxLayout(self)
        layout.setSpacing(SPACING.md)

        # Top row: name + actions
        top_row = QHBoxLayout()

        name_label = H2(entity_name)
        name_label.setStyleSheet("font-weight: 600;")
        top_row.addWidget(name_label, 1)

        # Action buttons
        if actions:
            for action_name in actions:
                btn = IconCircleButton(label="", glyph=action_name)
                btn.clicked.connect(lambda checked, name=action_name: self.action_clicked.emit(name))
                top_row.addWidget(btn)

        layout.addLayout(top_row)

        # Badges row
        if badges:
            badges_row = QHBoxLayout()
            badges_row.setSpacing(SPACING.xs)

            for badge_text, badge_variant in badges:
                pill = Pill(badge_text, variant=badge_variant)
                badges_row.addWidget(pill)

            badges_row.addStretch(1)
            layout.addLayout(badges_row)


class PropertiesTable(QFrame):
    """
    Key-value properties table for displaying entity/object metadata.
    Simple layout with labels and values in rows.
    """

    def __init__(self, properties: dict[str, str]) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout

        super().__init__()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(SPACING.sm)

        for key, value in properties.items():
            row = QHBoxLayout()
            row.setSpacing(SPACING.md)

            key_label = QLabel(key)
            key_label.setStyleSheet(
                f"font-size: 12px; font-weight: 600; color: {COLORS.text_secondary}; min-width: 120px;"
            )
            row.addWidget(key_label)

            value_label = Mono(str(value))
            value_label.setStyleSheet(f"font-size: 13px; color: {COLORS.text_primary};")
            row.addWidget(value_label, 1)

            layout.addLayout(row)


class TabPanel(QFrame):
    """
    Tabbed panel container for displaying multiple views (code, logs, etc).
    Used for detail/inspector views with multiple tab options.
    """

    from PySide6.QtCore import Signal

    tab_changed = Signal(int)  # Emits tab index

    def __init__(self, *, tabs: list[tuple[str, QWidget]] | None = None) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QTabWidget

        super().__init__()
        self.setObjectName("Card")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        self.tab_widget = QTabWidget()
        self.tab_widget.setStyleSheet(f"""
            QTabWidget::pane {{ border: none; }}
            QTabBar::tab {{
                background: transparent;
                padding: {SPACING.md}px {SPACING.lg}px;
                border-top-left-radius: {RADIUS.md}px;
                border-top-right-radius: {RADIUS.md}px;
            }}
            QTabBar::tab:selected {{
                background: {COLORS.accent_bg};
                color: {COLORS.accent_primary};
                border-bottom: 2px solid {COLORS.accent_primary};
            }}
            QTabBar::tab:!selected {{
                color: {COLORS.text_secondary};
            }}
        """)

        if tabs:
            for tab_name, tab_widget in tabs:
                self.tab_widget.addTab(tab_widget, tab_name)

        self.tab_widget.currentChanged.connect(self.tab_changed.emit)

        layout.addWidget(self.tab_widget)

    def addTab(self, widget: QWidget, title: str) -> int:
        return self.tab_widget.addTab(widget, title)

    def currentIndex(self) -> int:
        return self.tab_widget.currentIndex()

    def setCurrentIndex(self, index: int) -> None:
        self.tab_widget.setCurrentIndex(index)


class Callout(QFrame):
    """
    Alert callout box with severity icon and message.
    Used for warnings, errors, info messages.
    """

    def __init__(self, title: str, *, message: str = "", variant: str = "warning") -> None:
        from PySide6.QtWidgets import QHBoxLayout, QVBoxLayout

        super().__init__()

        variants = {
            "warning": (COLORS.warning, COLORS.warning_bg, "warning"),
            "error": (COLORS.error, COLORS.error_bg, "error"),
            "info": (COLORS.info, COLORS.info_bg, "info"),
            "success": (COLORS.success, COLORS.success_bg, "check_circle"),
        }

        fg, bg, icon_name = variants.get(variant, variants["warning"])

        self.setStyleSheet(f"""
            QFrame {{
                background: {bg};
                border: 1px solid {fg}40;
                border-left: 3px solid {fg};
                border-radius: {RADIUS.md}px;
                padding: {SPACING.md}px;
            }}
        """)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(SPACING.md, SPACING.md, SPACING.md, SPACING.md)
        layout.setSpacing(SPACING.sm)

        # Icon
        icon = MaterialIcon(icon_name, size_px=20)
        icon.setStyleSheet(f"color: {fg};")
        layout.addWidget(icon)

        # Text content
        text_col = QVBoxLayout()
        text_col.setSpacing(4)

        title_label = QLabel(title)
        title_label.setStyleSheet(f"font-weight: 600; color: {fg};")
        text_col.addWidget(title_label)

        if message:
            msg_label = Muted(message)
            msg_label.setStyleSheet(f"font-size: 12px;")
            msg_label.setWordWrap(True)
            text_col.addWidget(msg_label)

        layout.addLayout(text_col, 1)


class StatsCard(CardFrame):
    """
    Statistics card displaying a single metric with label.
    Used in dashboard summaries.
    """

    def __init__(self, value: str, *, label: str = "", icon: str = "") -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout

        super().__init__(shadow=False)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.lg, SPACING.lg, SPACING.lg, SPACING.lg)
        layout.setSpacing(SPACING.md)

        # Value row
        value_row = QHBoxLayout()

        if icon:
            icon_label = MaterialIcon(icon, size_px=28)
            icon_label.setStyleSheet(f"color: {COLORS.accent_primary};")
            value_row.addWidget(icon_label)

        value_label = QLabel(value)
        value_label.setStyleSheet("font-size: 24px; font-weight: 700;")
        value_row.addWidget(value_label, 1)

        layout.addLayout(value_row)

        # Label
        if label:
            label_lbl = Muted(label)
            label_lbl.setStyleSheet("font-size: 11px;")
            layout.addWidget(label_lbl)


class FormSection(QFrame):
    """
    Form section container with title and form fields.
    Used in settings/configuration screens.
    """

    def __init__(self, title: str, *, fields: list[tuple[str, QWidget]] | None = None) -> None:
        from PySide6.QtWidgets import QVBoxLayout, QHBoxLayout

        super().__init__()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(SPACING.md)

        # Section title
        title_label = QLabel(title)
        title_label.setStyleSheet(
            f"font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: {COLORS.text_secondary}; text-transform: uppercase;"
        )
        layout.addWidget(title_label)

        # Fields
        if fields:
            for label, widget in fields:
                field_row = QHBoxLayout()
                field_row.setSpacing(SPACING.lg)

                label_widget = QLabel(label)
                label_widget.setStyleSheet(
                    f"font-size: 14px; font-weight: 500; color: {COLORS.text_primary}; min-width: 150px;"
                )
                field_row.addWidget(label_widget)

                field_row.addWidget(widget, 1)

                layout.addLayout(field_row)

        # Divider
        divider = Divider()
        layout.addWidget(divider)
