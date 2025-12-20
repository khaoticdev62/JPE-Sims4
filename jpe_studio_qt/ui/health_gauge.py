"""
Health Gauge Widget.

Displays code/project health metrics with visual indicators:
- Overall health percentage (0-100%)
- Error count (red)
- Warning count (yellow)
- Suggestion count (blue)
- Issues per category with gauge visualization

Features:
- Circular gauge with color coding
- Animated value transitions
- Hover tooltips
- Click to show details
- Configurable thresholds
"""

from __future__ import annotations

from typing import Optional
from dataclasses import dataclass
from enum import Enum

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame,
    QProgressBar
)
from PySide6.QtCore import Qt, Signal, QSize, QTimer, QPropertyAnimation, QEasingCurve
from PySide6.QtGui import QFont, QColor, QPainter, QPen, QBrush, QConicalGradient
from PySide6.QtCore import Property

from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS


class HealthLevel(Enum):
    """Health level categories."""
    EXCELLENT = 90  # Green (90-100%)
    GOOD = 70       # Light green (70-89%)
    FAIR = 50       # Yellow (50-69%)
    POOR = 30       # Orange (30-49%)
    CRITICAL = 0    # Red (0-29%)


@dataclass
class HealthMetrics:
    """Health metrics for a project."""
    error_count: int = 0
    warning_count: int = 0
    suggestion_count: int = 0
    total_issues: int = 0
    health_percentage: float = 100.0  # 0-100
    timestamp: Optional[str] = None


class HealthGauge(QWidget):
    """Circular health gauge widget."""

    # Signals
    health_clicked = Signal(HealthMetrics)
    details_requested = Signal()

    def __init__(self, size: int = 120, parent: Optional[object] = None) -> None:
        """
        Initialize health gauge.

        Args:
            size: Widget size in pixels
            parent: Parent widget
        """
        super().__init__(parent)
        self.setFixedSize(size, size)
        self._size = size
        self._metrics = HealthMetrics()
        self._animated_health = 100.0
        self._target_health = 100.0

        # Setup animation
        self._animation = QPropertyAnimation(self, b"animatedHealth")
        self._animation.setDuration(1000)
        self._animation.setEasingCurve(QEasingCurve.OutCubic)

        self.setCursor(Qt.PointingHandCursor)

    def set_metrics(self, metrics: HealthMetrics) -> None:
        """
        Update health metrics with animation.

        Args:
            metrics: Health metrics
        """
        self._metrics = metrics
        self._target_health = metrics.health_percentage

        # Animate to new value
        self._animation.stop()
        self._animation.setStartValue(self._animated_health)
        self._animation.setEndValue(self._target_health)
        self._animation.start()

    @Property(float)
    def animatedHealth(self) -> float:
        """Get animated health value."""
        return self._animated_health

    @animatedHealth.setter
    def animatedHealth(self, value: float) -> None:
        """Set animated health value."""
        self._animated_health = value
        self.update()

    def _get_health_level(self, percentage: float) -> tuple[HealthLevel, str]:
        """Get health level and color."""
        if percentage >= 90:
            return HealthLevel.EXCELLENT, "#22C55E"  # Green
        elif percentage >= 70:
            return HealthLevel.GOOD, "#84CC16"  # Lime
        elif percentage >= 50:
            return HealthLevel.FAIR, "#E5940C"  # Amber
        elif percentage >= 30:
            return HealthLevel.POOR, "#F97316"  # Orange
        else:
            return HealthLevel.CRITICAL, "#EF4444"  # Red

    def paintEvent(self, event) -> None:
        """Paint the health gauge."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        center_x = self._size / 2
        center_y = self._size / 2
        radius = self._size / 2 - 10

        # Get health level and color
        level, color = self._get_health_level(self._animated_health)

        # Draw background circle
        painter.setPen(QPen(QColor(COLORS.stroke_0), 2))
        painter.setBrush(QBrush(QColor(COLORS.surface_0)))
        painter.drawEllipse(
            int(center_x - radius),
            int(center_y - radius),
            int(radius * 2),
            int(radius * 2)
        )

        # Draw health arc
        painter.setPen(QPen(QColor(color), 4))
        painter.setBrush(Qt.NoBrush)

        # Calculate angle (0-360 degrees = 0-100%)
        angle = (self._animated_health / 100.0) * 360.0

        # Draw arc (start from top, go clockwise)
        painter.drawArc(
            int(center_x - radius),
            int(center_y - radius),
            int(radius * 2),
            int(radius * 2),
            90 * 16,  # Start angle (top)
            int(-angle * 16)  # Sweep angle (negative for clockwise)
        )

        # Draw percentage text
        font = QFont()
        font.setPointSize(14)
        font.setBold(True)
        painter.setFont(font)
        painter.setPen(QColor(COLORS.text_primary))

        percentage_str = f"{int(self._animated_health)}%"
        metrics = painter.fontMetrics()
        text_width = metrics.horizontalAdvance(percentage_str)
        text_height = metrics.height()

        painter.drawText(
            int(center_x - text_width / 2),
            int(center_y + text_height / 2),
            percentage_str
        )

        painter.end()

    def mousePressEvent(self, event) -> None:
        """Handle click."""
        self.health_clicked.emit(self._metrics)
        self.details_requested.emit()


class HealthPanel(QFrame):
    """Health panel showing gauge and metrics."""

    health_clicked = Signal(HealthMetrics)

    def __init__(self, parent: Optional[object] = None) -> None:
        """
        Initialize health panel.

        Args:
            parent: Parent widget
        """
        super().__init__(parent)
        self._metrics = HealthMetrics()
        self._init_ui()

    def _init_ui(self) -> None:
        """Initialize UI."""
        self.setStyleSheet(f"""
            QFrame {{
                background: {COLORS.surface_0};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.lg}px;
                padding: {SPACING.lg}px;
            }}
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.lg, SPACING.lg, SPACING.lg, SPACING.lg)
        layout.setSpacing(SPACING.lg)

        # Header
        header = QHBoxLayout()
        header.setSpacing(SPACING.md)

        title = QLabel("Code Health")
        title_font = QFont()
        title_font.setBold(True)
        title_font.setPointSize(13)
        title.setFont(title_font)
        title.setStyleSheet(f"color: {COLORS.text_primary};")
        header.addWidget(title)

        self._status_label = QLabel("Excellent")
        self._status_label.setStyleSheet(f"color: {COLORS.success}; font-weight: bold;")
        header.addWidget(self._status_label)

        header.addStretch(1)
        layout.addLayout(header)

        # Gauge and metrics row
        content = QHBoxLayout()
        content.setSpacing(SPACING.lg)

        # Gauge
        self._gauge = HealthGauge(size=120)
        self._gauge.health_clicked.connect(self._on_gauge_clicked)
        content.addWidget(self._gauge, alignment=Qt.AlignCenter)

        # Metrics
        metrics_layout = QVBoxLayout()
        metrics_layout.setSpacing(SPACING.sm)

        # Error metric
        error_row = self._create_metric_row("Errors", "0", COLORS.error)
        self._error_label = error_row[1]
        metrics_layout.addLayout(error_row[0])

        # Warning metric
        warning_row = self._create_metric_row("Warnings", "0", COLORS.warning)
        self._warning_label = warning_row[1]
        metrics_layout.addLayout(warning_row[0])

        # Suggestion metric
        suggestion_row = self._create_metric_row("Suggestions", "0", COLORS.info)
        self._suggestion_label = suggestion_row[1]
        metrics_layout.addLayout(suggestion_row[0])

        content.addLayout(metrics_layout, 1)
        layout.addLayout(content)

        # Progress bar
        progress_layout = QVBoxLayout()
        progress_label = QLabel("Issues Resolved")
        progress_label.setStyleSheet(f"""
            font-size: 11px;
            font-weight: 600;
            color: {COLORS.text_secondary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        """)
        progress_layout.addWidget(progress_label)

        self._progress_bar = QProgressBar()
        self._progress_bar.setMinimum(0)
        self._progress_bar.setMaximum(100)
        self._progress_bar.setValue(100)
        self._progress_bar.setMaximumHeight(8)
        self._progress_bar.setStyleSheet(f"""
            QProgressBar {{
                background: {COLORS.surface_1};
                border: none;
                border-radius: 4px;
            }}
            QProgressBar::chunk {{
                background: {COLORS.accent_primary};
                border-radius: 4px;
            }}
        """)
        progress_layout.addWidget(self._progress_bar)

        layout.addLayout(progress_layout)

    def _create_metric_row(
        self, label: str, value: str, color: str
    ) -> tuple[QHBoxLayout, QLabel]:
        """Create a metric row."""
        row = QHBoxLayout()
        row.setSpacing(SPACING.md)

        label_widget = QLabel(label)
        label_widget.setStyleSheet(f"""
            font-size: 12px;
            color: {COLORS.text_secondary};
        """)
        row.addWidget(label_widget)

        value_widget = QLabel(value)
        value_widget.setStyleSheet(f"""
            font-size: 14px;
            font-weight: bold;
            color: {color};
        """)
        row.addWidget(value_widget)

        row.addStretch(1)

        return row, value_widget

    def set_metrics(self, metrics: HealthMetrics) -> None:
        """
        Update health metrics.

        Args:
            metrics: Health metrics
        """
        self._metrics = metrics
        self._gauge.set_metrics(metrics)

        # Update status label
        level, _ = self._gauge._get_health_level(metrics.health_percentage)
        status_text = level.name.replace("_", " ").title()
        status_color = {
            HealthLevel.EXCELLENT: COLORS.success,
            HealthLevel.GOOD: COLORS.success,
            HealthLevel.FAIR: COLORS.warning,
            HealthLevel.POOR: COLORS.warning,
            HealthLevel.CRITICAL: COLORS.error,
        }[level]

        self._status_label.setText(status_text)
        self._status_label.setStyleSheet(f"color: {status_color}; font-weight: bold;")

        # Update metrics
        self._error_label.setText(str(metrics.error_count))
        self._warning_label.setText(str(metrics.warning_count))
        self._suggestion_label.setText(str(metrics.suggestion_count))

        # Update progress bar
        if metrics.total_issues > 0:
            resolved = max(0, 100 - metrics.health_percentage)
            self._progress_bar.setValue(int(resolved))
        else:
            self._progress_bar.setValue(100)

    def _on_gauge_clicked(self, metrics: HealthMetrics) -> None:
        """Handle gauge click."""
        self.health_clicked.emit(metrics)


class HealthStatus(QWidget):
    """Mini health status indicator."""

    def __init__(self, parent: Optional[object] = None) -> None:
        """
        Initialize health status.

        Args:
            parent: Parent widget
        """
        super().__init__(parent)
        self._metrics = HealthMetrics()
        self._init_ui()

    def _init_ui(self) -> None:
        """Initialize UI."""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(SPACING.sm)

        # Mini gauge
        self._gauge = HealthGauge(size=60)
        layout.addWidget(self._gauge)

        # Text info
        text_layout = QVBoxLayout()
        text_layout.setSpacing(2)

        self._health_label = QLabel("100%")
        self._health_label.setStyleSheet(f"""
            font-size: 13px;
            font-weight: bold;
            color: {COLORS.text_primary};
        """)
        text_layout.addWidget(self._health_label)

        self._status_label = QLabel("Excellent")
        self._status_label.setStyleSheet(f"""
            font-size: 11px;
            color: {COLORS.text_secondary};
        """)
        text_layout.addWidget(self._status_label)

        layout.addLayout(text_layout)

    def set_metrics(self, metrics: HealthMetrics) -> None:
        """
        Update health metrics.

        Args:
            metrics: Health metrics
        """
        self._metrics = metrics
        self._gauge.set_metrics(metrics)

        self._health_label.setText(f"{int(metrics.health_percentage)}%")

        level, color = self._gauge._get_health_level(metrics.health_percentage)
        status_text = level.name.replace("_", " ").title()

        self._status_label.setText(status_text)
        self._status_label.setStyleSheet(f"color: {color}; font-weight: bold;")
