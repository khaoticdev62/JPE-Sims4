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
