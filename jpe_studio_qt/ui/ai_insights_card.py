"""
AI Insights Card for Dashboard.

Displays AI-powered insights and recommendations:
- Recent AI suggestions
- Auto-fix improvements
- Code health trends
- AI features usage
- Recommended improvements

Features:
- Real-time metrics
- Trend visualization
- Actionable insights
- Quick action buttons
"""

from __future__ import annotations

from typing import Optional, List
from dataclasses import dataclass
from datetime import datetime

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QFrame,
    QPushButton, QScrollArea
)
from PySide6.QtCore import Qt, Signal, QSize
from PySide6.QtGui import QFont, QColor

from jpe_studio_qt.design_tokens import COLORS, SPACING, RADIUS


@dataclass
class AIInsight:
    """Single AI insight."""
    title: str
    description: str
    type: str  # "suggestion", "improvement", "fix", "warning"
    timestamp: str
    actionable: bool = False
    action_label: str = "Learn More"


@dataclass
class AIMetrics:
    """AI metrics summary."""
    total_suggestions: int = 0
    fixes_applied: int = 0
    code_quality_improvement: float = 0.0  # percentage
    ai_features_used: int = 0
    last_analysis_time: Optional[str] = None


class InsightItem(QFrame):
    """Individual insight item."""

    action_clicked = Signal(str)

    def __init__(
        self, insight: AIInsight, parent: Optional[object] = None
    ) -> None:
        """
        Initialize insight item.

        Args:
            insight: Insight data
            parent: Parent widget
        """
        super().__init__(parent)
        self._insight = insight
        self._init_ui()

    def _init_ui(self) -> None:
        """Initialize UI."""
        type_colors = {
            "suggestion": COLORS.info,
            "improvement": COLORS.success,
            "fix": COLORS.accent_primary,
            "warning": COLORS.warning,
        }
        color = type_colors.get(self._insight.type, COLORS.text_secondary)

        self.setStyleSheet(f"""
            QFrame {{
                background: {COLORS.surface_0};
                border-left: 3px solid {color};
                border-radius: {RADIUS.md}px;
                padding: {SPACING.md}px;
                margin-bottom: {SPACING.sm}px;
            }}
            QFrame:hover {{
                background: {COLORS.surface_1};
            }}
        """)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(SPACING.md, SPACING.sm, SPACING.md, SPACING.sm)
        layout.setSpacing(SPACING.xs)

        # Title row
        title_row = QHBoxLayout()
        title_row.setSpacing(SPACING.sm)

        title = QLabel(self._insight.title)
        title_font = QFont()
        title_font.setBold(True)
        title_font.setPointSize(11)
        title.setFont(title_font)
        title.setStyleSheet(f"color: {COLORS.text_primary};")
        title_row.addWidget(title)

        # Type badge
        type_badge = QLabel(self._insight.type.upper())
        type_badge.setStyleSheet(f"""
            font-size: 9px;
            font-weight: bold;
            color: {color};
            letter-spacing: 0.5px;
        """)
        title_row.addWidget(type_badge)

        title_row.addStretch(1)

        # Time
        time_label = QLabel(self._insight.timestamp)
        time_label.setStyleSheet(f"""
            font-size: 10px;
            color: {COLORS.text_tertiary};
        """)
        title_row.addWidget(time_label)

        layout.addLayout(title_row)

        # Description
        desc = QLabel(self._insight.description)
        desc.setWordWrap(True)
        desc.setStyleSheet(f"""
            font-size: 11px;
            color: {COLORS.text_secondary};
            line-height: 1.4;
        """)
        layout.addWidget(desc)

        # Action button
        if self._insight.actionable:
            action_btn = QPushButton(self._insight.action_label)
            action_btn.setMaximumWidth(120)
            action_btn.setStyleSheet(f"""
                QPushButton {{
                    background: {COLORS.accent_bg};
                    color: {COLORS.accent_primary};
                    border: 1px solid {COLORS.accent_primary};
                    border-radius: {RADIUS.sm}px;
                    padding: 4px 12px;
                    font-size: 10px;
                    font-weight: bold;
                }}
                QPushButton:hover {{
                    background: {COLORS.accent_primary};
                    color: white;
                }}
            """)
            action_btn.clicked.connect(
                lambda: self.action_clicked.emit(self._insight.title)
            )
            layout.addWidget(action_btn, alignment=Qt.AlignLeft)


class AIInsightsCard(QFrame):
    """AI Insights card for dashboard."""

    insight_action = Signal(str)  # Emits insight title when action clicked

    def __init__(self, parent: Optional[object] = None) -> None:
        """
        Initialize AI insights card.

        Args:
            parent: Parent widget
        """
        super().__init__(parent)
        self._metrics = AIMetrics()
        self._insights: List[AIInsight] = []
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
        header = self._create_header()
        layout.addLayout(header)

        # Metrics row
        metrics_layout = self._create_metrics()
        layout.addLayout(metrics_layout)

        # Insights list
        insights_label = QLabel("Latest Insights")
        insights_label.setStyleSheet(f"""
            font-size: 12px;
            font-weight: bold;
            color: {COLORS.text_primary};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        """)
        layout.addWidget(insights_label)

        # Scrollable insights
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet(f"""
            QScrollArea {{
                background: transparent;
                border: none;
            }}
            QScrollBar:vertical {{
                width: 6px;
            }}
            QScrollBar::handle:vertical {{
                background: {COLORS.stroke_1};
                border-radius: 3px;
            }}
            QScrollBar::handle:vertical:hover {{
                background: {COLORS.accent_primary};
            }}
        """)

        self._insights_container = QWidget()
        self._insights_layout = QVBoxLayout(self._insights_container)
        self._insights_layout.setContentsMargins(0, 0, 0, 0)
        self._insights_layout.setSpacing(0)
        self._insights_layout.addStretch(1)

        scroll.setWidget(self._insights_container)
        scroll.setMaximumHeight(200)
        layout.addWidget(scroll)

        # Footer action
        footer = QHBoxLayout()
        footer.setSpacing(SPACING.sm)
        footer.addStretch(1)

        view_all_btn = QPushButton("View All Insights")
        view_all_btn.setStyleSheet(f"""
            QPushButton {{
                background: transparent;
                color: {COLORS.accent_primary};
                border: none;
                padding: 0;
                font-size: 11px;
                font-weight: bold;
                text-decoration: underline;
            }}
            QPushButton:hover {{
                color: {COLORS.accent_hover};
            }}
        """)
        footer.addWidget(view_all_btn)

        layout.addLayout(footer)

    def _create_header(self) -> QHBoxLayout:
        """Create header with title."""
        layout = QHBoxLayout()
        layout.setSpacing(SPACING.md)

        title = QLabel("AI Insights")
        title_font = QFont()
        title_font.setBold(True)
        title_font.setPointSize(14)
        title.setFont(title_font)
        title.setStyleSheet(f"color: {COLORS.text_primary};")
        layout.addWidget(title)

        layout.addStretch(1)

        return layout

    def _create_metrics(self) -> QHBoxLayout:
        """Create metrics display."""
        layout = QHBoxLayout()
        layout.setSpacing(SPACING.lg)

        # Suggestions metric
        self._suggestions_label = self._create_metric_box(
            "Suggestions",
            "0",
            COLORS.info
        )
        layout.addWidget(self._suggestions_label)

        # Fixes metric
        self._fixes_label = self._create_metric_box(
            "Fixes Applied",
            "0",
            COLORS.success
        )
        layout.addWidget(self._fixes_label)

        # Improvement metric
        self._improvement_label = self._create_metric_box(
            "Quality Improvement",
            "0%",
            COLORS.accent_primary
        )
        layout.addWidget(self._improvement_label)

        layout.addStretch(1)

        return layout

    def _create_metric_box(
        self, label: str, value: str, color: str
    ) -> QFrame:
        """Create a metric box."""
        frame = QFrame()
        frame.setStyleSheet(f"""
            QFrame {{
                background: {COLORS.surface_1};
                border: 1px solid {COLORS.stroke_0};
                border-radius: {RADIUS.md}px;
                padding: {SPACING.md}px;
            }}
        """)

        layout = QVBoxLayout(frame)
        layout.setContentsMargins(SPACING.md, SPACING.sm, SPACING.md, SPACING.sm)
        layout.setSpacing(SPACING.xs)

        label_widget = QLabel(label)
        label_widget.setStyleSheet(f"""
            font-size: 10px;
            color: {COLORS.text_secondary};
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        """)
        layout.addWidget(label_widget)

        value_widget = QLabel(value)
        value_widget.setStyleSheet(f"""
            font-size: 16px;
            font-weight: bold;
            color: {color};
        """)
        layout.addWidget(value_widget)

        return frame, value_widget

    def set_metrics(self, metrics: AIMetrics) -> None:
        """
        Update metrics display.

        Args:
            metrics: AI metrics
        """
        self._metrics = metrics

        # Update metric boxes
        _, suggestions_widget = self._suggestions_label
        suggestions_widget.setText(str(metrics.total_suggestions))

        _, fixes_widget = self._fixes_label
        fixes_widget.setText(str(metrics.fixes_applied))

        _, improvement_widget = self._improvement_label
        improvement_widget.setText(f"{int(metrics.code_quality_improvement)}%")

    def add_insight(self, insight: AIInsight) -> None:
        """
        Add an insight to the card.

        Args:
            insight: Insight to add
        """
        self._insights.insert(0, insight)

        # Keep only last 5 insights
        if len(self._insights) > 5:
            self._insights = self._insights[:5]

        # Refresh display
        self._refresh_insights()

    def add_insights(self, insights: List[AIInsight]) -> None:
        """
        Add multiple insights.

        Args:
            insights: List of insights
        """
        for insight in insights:
            self.add_insight(insight)

    def clear_insights(self) -> None:
        """Clear all insights."""
        self._insights.clear()
        self._refresh_insights()

    def _refresh_insights(self) -> None:
        """Refresh insights display."""
        # Clear existing
        while self._insights_layout.count() > 1:
            self._insights_layout.takeAt(0).widget().deleteLater()

        # Add insights
        for insight in self._insights:
            item = InsightItem(insight)
            item.action_clicked.connect(self.insight_action.emit)
            self._insights_layout.insertWidget(0, item)

        # Ensure stretch is at the end
        if self._insights_layout.count() > 0:
            widget = self._insights_layout.takeAt(self._insights_layout.count() - 1)
            if widget and widget.widget():
                widget.widget().deleteLater()

        self._insights_layout.addStretch(1)

    def get_metrics(self) -> AIMetrics:
        """Get current metrics."""
        return self._metrics

    def get_insights(self) -> List[AIInsight]:
        """Get current insights."""
        return self._insights.copy()
