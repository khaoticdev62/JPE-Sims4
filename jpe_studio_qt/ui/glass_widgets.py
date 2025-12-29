"""
Glass-morphism and neon shadow effect widgets.

Provides custom implementations of glass-morphism (semi-transparent backgrounds)
and neon glow shadows, since Qt QSS doesn't support backdrop-filter or box-shadow blur.
"""
from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtGui import QColor, QPainter, QBrush, QPen, QFont
from PySide6.QtWidgets import QFrame, QPushButton, QGraphicsDropShadowEffect


class GlassFrame(QFrame):
    """
    Glass-morphism frame with semi-transparent background and border glow.

    Creates the appearance of a frosted glass panel using a semi-transparent
    overlay color and a glowing border. This simulates the glass-morphism effect
    from Stitch designs since Qt QSS doesn't support backdrop-filter.
    """

    def __init__(self, parent=None, blur_intensity: int = 10):
        """
        Initialize a glass-morphism frame.

        Args:
            parent: Parent widget
            blur_intensity: Visual intensity (not actual blur, for future enhancement)
        """
        super().__init__(parent)
        self.blur_intensity = blur_intensity
        self.setStyleSheet("")

    def paintEvent(self, event):
        """Paint the glass-morphism background and border."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        # Semi-transparent background (glass overlay)
        brush = QBrush(QColor(23, 15, 35, 178))  # rgba(23, 15, 35, 0.7)
        painter.setBrush(brush)

        # Glass border with neon tint
        pen = QPen(QColor(134, 56, 250, 51))  # rgba(134, 56, 250, 0.2)
        pen.setWidth(1)
        painter.setPen(pen)

        # Draw rounded rect (8px radius)
        painter.drawRoundedRect(self.rect(), 8, 8)


class NeonButton(QPushButton):
    """
    Push button with neon glow shadow effect.

    Applies a glowing shadow around the button to create the neon effect
    visible in Stitch designs.
    """

    def __init__(self, text: str = "", parent=None, blur_radius: int = 20):
        """
        Initialize a neon button.

        Args:
            text: Button text
            parent: Parent widget
            blur_radius: Shadow blur radius in pixels (default: 20)
        """
        super().__init__(text, parent)
        self._apply_neon_shadow(blur_radius)

    def _apply_neon_shadow(self, blur_radius: int):
        """Apply neon glow shadow effect."""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(blur_radius)
        shadow.setColor(QColor(134, 56, 250, 128))  # rgba(134, 56, 250, 0.5)
        shadow.setOffset(0, 0)  # Centered glow (not offset)
        self.setGraphicsEffect(shadow)

    def set_blur_radius(self, radius: int):
        """Update shadow blur radius dynamically."""
        shadow = self.graphicsEffect()
        if isinstance(shadow, QGraphicsDropShadowEffect):
            shadow.setBlurRadius(radius)


class NeonFrame(QFrame):
    """
    Frame with neon glow shadow on hover.

    Useful for cards and containers that should highlight with a neon
    glow when the user hovers over them.
    """

    def __init__(self, parent=None):
        """Initialize a neon-enabled frame."""
        super().__init__(parent)
        self._neon_shadow: QGraphicsDropShadowEffect | None = None

    def enterEvent(self, event):
        """Apply neon glow on hover."""
        self._apply_neon_shadow()
        super().enterEvent(event)

    def leaveEvent(self, event):
        """Remove neon glow when mouse leaves."""
        self._remove_neon_shadow()
        super().leaveEvent(event)

    def _apply_neon_shadow(self):
        """Apply neon glow shadow."""
        if not self._neon_shadow:
            self._neon_shadow = QGraphicsDropShadowEffect()
            self._neon_shadow.setBlurRadius(16)
            self._neon_shadow.setColor(QColor(134, 56, 250, 76))  # 0.3 opacity
            self._neon_shadow.setOffset(0, 0)
            self.setGraphicsEffect(self._neon_shadow)

    def _remove_neon_shadow(self):
        """Remove neon glow shadow."""
        self.setGraphicsEffect(None)
        self._neon_shadow = None
