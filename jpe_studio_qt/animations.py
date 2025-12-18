"""
Animation utilities for smooth transitions and effects.

Provides QPropertyAnimation helpers for common UI animations aligned with Phase 6 polish requirements.
"""
from __future__ import annotations

from PySide6.QtCore import QEasingCurve, QPropertyAnimation, QRect, QSize, Qt
from PySide6.QtWidgets import QGraphicsOpacityEffect, QWidget


def fade_in(widget: QWidget, duration: int = 200) -> QPropertyAnimation:
    """
    Fade in animation for a widget.

    Args:
        widget: Widget to fade in
        duration: Animation duration in milliseconds (default: 200ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    effect = QGraphicsOpacityEffect(widget)
    widget.setGraphicsEffect(effect)

    animation = QPropertyAnimation(effect, b"opacity")
    animation.setDuration(duration)
    animation.setStartValue(0.0)
    animation.setEndValue(1.0)
    animation.setEasingCurve(QEasingCurve.Type.OutCubic)
    animation.start()

    return animation


def fade_out(widget: QWidget, duration: int = 200) -> QPropertyAnimation:
    """
    Fade out animation for a widget.

    Args:
        widget: Widget to fade out
        duration: Animation duration in milliseconds (default: 200ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    effect = QGraphicsOpacityEffect(widget)
    widget.setGraphicsEffect(effect)

    animation = QPropertyAnimation(effect, b"opacity")
    animation.setDuration(duration)
    animation.setStartValue(1.0)
    animation.setEndValue(0.0)
    animation.setEasingCurve(QEasingCurve.Type.InCubic)
    animation.start()

    return animation


def slide_in(widget: QWidget, from_pos: tuple[int, int], duration: int = 250) -> QPropertyAnimation:
    """
    Slide in animation from a specific position.

    Args:
        widget: Widget to animate
        from_pos: Starting position (x, y)
        duration: Animation duration in milliseconds (default: 250ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    target_pos = widget.pos()

    animation = QPropertyAnimation(widget, b"pos")
    animation.setDuration(duration)
    animation.setStartValue(from_pos)
    animation.setEndValue(target_pos)
    animation.setEasingCurve(QEasingCurve.Type.OutCubic)
    animation.start()

    return animation


def scale_hover(widget: QWidget, scale_factor: float = 1.02, duration: int = 150) -> QPropertyAnimation:
    """
    Scale animation for hover effect (scale up slightly).

    Args:
        widget: Widget to scale
        scale_factor: Scale multiplier (default: 1.02 for 2% increase)
        duration: Animation duration in milliseconds (default: 150ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    current_size = widget.size()
    new_size = QSize(
        int(current_size.width() * scale_factor),
        int(current_size.height() * scale_factor)
    )

    animation = QPropertyAnimation(widget, b"size")
    animation.setDuration(duration)
    animation.setStartValue(current_size)
    animation.setEndValue(new_size)
    animation.setEasingCurve(QEasingCurve.Type.OutCubic)
    animation.start()

    return animation


def scale_reset(widget: QWidget, original_size: QSize, duration: int = 150) -> QPropertyAnimation:
    """
    Reset scale animation (return to original size).

    Args:
        widget: Widget to reset
        original_size: Original widget size
        duration: Animation duration in milliseconds (default: 150ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    animation = QPropertyAnimation(widget, b"size")
    animation.setDuration(duration)
    animation.setStartValue(widget.size())
    animation.setEndValue(original_size)
    animation.setEasingCurve(QEasingCurve.Type.InCubic)
    animation.start()

    return animation


def expand_height(widget: QWidget, target_height: int, duration: int = 300) -> QPropertyAnimation:
    """
    Expand widget height animation (for collapsible sections).

    Args:
        widget: Widget to expand
        target_height: Target height in pixels
        duration: Animation duration in milliseconds (default: 300ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    current_geometry = widget.geometry()
    target_geometry = QRect(
        current_geometry.x(),
        current_geometry.y(),
        current_geometry.width(),
        target_height
    )

    animation = QPropertyAnimation(widget, b"geometry")
    animation.setDuration(duration)
    animation.setStartValue(current_geometry)
    animation.setEndValue(target_geometry)
    animation.setEasingCurve(QEasingCurve.Type.OutCubic)
    animation.start()

    return animation


def collapse_height(widget: QWidget, collapsed_height: int = 0, duration: int = 300) -> QPropertyAnimation:
    """
    Collapse widget height animation (for collapsible sections).

    Args:
        widget: Widget to collapse
        collapsed_height: Collapsed height in pixels (default: 0)
        duration: Animation duration in milliseconds (default: 300ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    current_geometry = widget.geometry()
    target_geometry = QRect(
        current_geometry.x(),
        current_geometry.y(),
        current_geometry.width(),
        collapsed_height
    )

    animation = QPropertyAnimation(widget, b"geometry")
    animation.setDuration(duration)
    animation.setStartValue(current_geometry)
    animation.setEndValue(target_geometry)
    animation.setEasingCurve(QEasingCurve.Type.InCubic)
    animation.start()

    return animation


def smooth_scroll(scroll_widget, target_value: int, duration: int = 400) -> QPropertyAnimation:
    """
    Smooth scroll animation for scroll areas.

    Args:
        scroll_widget: QScrollBar or scroll area widget
        target_value: Target scroll position
        duration: Animation duration in milliseconds (default: 400ms)

    Returns:
        QPropertyAnimation instance (starts automatically)
    """
    animation = QPropertyAnimation(scroll_widget, b"value")
    animation.setDuration(duration)
    animation.setStartValue(scroll_widget.value())
    animation.setEndValue(target_value)
    animation.setEasingCurve(QEasingCurve.Type.InOutCubic)
    animation.start()

    return animation
