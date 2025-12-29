"""
State management widgets for loading, error, and empty states.

Provides consistent state indicators aligned with Phase 6 polish requirements.
"""
from __future__ import annotations

from PySide6.QtCore import Qt, QTimer
from PySide6.QtWidgets import (
    QFrame,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import H2, MaterialIcon, Muted


class LoadingSpinner(QFrame):
    """
    Loading spinner indicator with optional message.

    Shows animated loading state for async operations.
    """

    def __init__(self, message: str = "Loading...", *, size: int = 40) -> None:
        super().__init__()
        self.setObjectName("Card")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2)
        layout.setSpacing(DESIGN.spacing.lg)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Spinner icon (using rotate animation)
        self.spinner = MaterialIcon("progress_activity", size_px=size)
        self.spinner.setStyleSheet(f"color: {DESIGN.colors.primary};")
        layout.addWidget(self.spinner, 0, Qt.AlignmentFlag.AlignCenter)

        # Loading message
        self.message_label = Muted(message)
        self.message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.message_label)

        # Rotation animation timer
        self._rotation = 0
        self._timer = QTimer(self)
        self._timer.timeout.connect(self._rotate_spinner)
        self._timer.start(50)  # Update every 50ms for smooth rotation

    def _rotate_spinner(self) -> None:
        """Rotate spinner icon (simulated animation)."""
        self._rotation = (self._rotation + 10) % 360
        # Note: QSS doesn't support rotation, so this is a visual placeholder
        # In production, use QPropertyAnimation with QGraphicsRotation

    def set_message(self, message: str) -> None:
        """Update loading message."""
        self.message_label.setText(message)

    def stop(self) -> None:
        """Stop the spinner animation."""
        self._timer.stop()


class ErrorState(QFrame):
    """
    Error state widget with icon, message, and retry button.

    Shows error information with optional retry action.
    """

    def __init__(
        self,
        title: str = "Something went wrong",
        message: str = "An error occurred. Please try again.",
        *,
        show_retry: bool = True,
        icon_name: str = "error"
    ) -> None:
        super().__init__()
        self.setObjectName("Card")
        self.setStyleSheet("border-style: dashed; border-color: rgba(239, 68, 68, 0.4);")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2)
        layout.setSpacing(DESIGN.spacing.lg)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Error icon
        icon_frame = QFrame()
        icon_frame.setFixedSize(64, 64)
        icon_frame.setStyleSheet(f"""
            border-radius: {DESIGN.radius.lg}px;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon_name, size_px=32)
        icon_lbl.setStyleSheet("color: #ef4444;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(icon_frame, 0, Qt.AlignmentFlag.AlignCenter)

        # Title
        title_label = H2(title)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title_label.setStyleSheet("color: #ef4444;")
        layout.addWidget(title_label)

        # Message
        message_label = Muted(message)
        message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        message_label.setWordWrap(True)
        message_label.setMaximumWidth(400)
        layout.addWidget(message_label)

        # Retry button
        if show_retry:
            self.retry_button = QPushButton("Try Again")
            self.retry_button.setObjectName("Primary")
            self.retry_button.setFixedHeight(40)
            layout.addWidget(self.retry_button, 0, Qt.AlignmentFlag.AlignCenter)
        else:
            self.retry_button = None


class SuccessState(QFrame):
    """
    Success state widget with icon and message.

    Shows success confirmation for completed operations.
    """

    def __init__(
        self,
        title: str = "Success!",
        message: str = "Operation completed successfully.",
        *,
        icon_name: str = "check_circle"
    ) -> None:
        super().__init__()
        self.setObjectName("Card")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2)
        layout.setSpacing(DESIGN.spacing.lg)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Success icon
        icon_frame = QFrame()
        icon_frame.setFixedSize(64, 64)
        icon_frame.setStyleSheet(f"""
            border-radius: {DESIGN.radius.lg}px;
            background: rgba(34, 197, 94, 0.15);
            border: 1px solid rgba(34, 197, 94, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon_name, size_px=32)
        icon_lbl.setStyleSheet("color: #22c55e;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(icon_frame, 0, Qt.AlignmentFlag.AlignCenter)

        # Title
        title_label = H2(title)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title_label.setStyleSheet("color: #22c55e;")
        layout.addWidget(title_label)

        # Message
        message_label = Muted(message)
        message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        message_label.setWordWrap(True)
        message_label.setMaximumWidth(400)
        layout.addWidget(message_label)


class WarningState(QFrame):
    """
    Warning state widget with icon and message.

    Shows warning information for potentially problematic situations.
    """

    def __init__(
        self,
        title: str = "Warning",
        message: str = "Please review the following before continuing.",
        *,
        icon_name: str = "warning"
    ) -> None:
        super().__init__()
        self.setObjectName("Card")
        self.setStyleSheet("border-style: dashed; border-color: rgba(234, 179, 8, 0.4);")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2, DESIGN.spacing.xl * 2)
        layout.setSpacing(DESIGN.spacing.lg)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Warning icon
        icon_frame = QFrame()
        icon_frame.setFixedSize(64, 64)
        icon_frame.setStyleSheet(f"""
            border-radius: {DESIGN.radius.lg}px;
            background: rgba(234, 179, 8, 0.15);
            border: 1px solid rgba(234, 179, 8, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon(icon_name, size_px=32)
        icon_lbl.setStyleSheet("color: #eab308;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(icon_frame, 0, Qt.AlignmentFlag.AlignCenter)

        # Title
        title_label = H2(title)
        title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title_label.setStyleSheet("color: #eab308;")
        layout.addWidget(title_label)

        # Message
        message_label = Muted(message)
        message_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        message_label.setWordWrap(True)
        message_label.setMaximumWidth(400)
        layout.addWidget(message_label)


class ProgressIndicator(QFrame):
    """
    Progress indicator with percentage and message.

    Shows progress for long-running operations with percentage complete.
    """

    def __init__(self, message: str = "Processing...", *, initial_progress: int = 0) -> None:
        super().__init__()
        self.setObjectName("Card")

        layout = QVBoxLayout(self)
        layout.setContentsMargins(DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl, DESIGN.spacing.xl)
        layout.setSpacing(DESIGN.spacing.md)

        # Message
        self.message_label = QLabel(message)
        self.message_label.setStyleSheet("font-weight: 600;")
        layout.addWidget(self.message_label)

        # Progress bar (styled frame)
        self.progress_container = QFrame()
        self.progress_container.setFixedHeight(8)
        self.progress_container.setStyleSheet(f"""
            border-radius: {DESIGN.radius.sm}px;
            background: rgba(255,255,255,0.05);
        """)

        self.progress_fill = QFrame(self.progress_container)
        self.progress_fill.setStyleSheet(f"""
            border-radius: {DESIGN.radius.sm}px;
            background: {DESIGN.colors.primary};
        """)
        self.progress_fill.setGeometry(0, 0, 0, 8)

        layout.addWidget(self.progress_container)

        # Percentage label
        self.percentage_label = Muted(f"{initial_progress}%")
        self.percentage_label.setStyleSheet("font-size: 9pt; font-family: 'JetBrains Mono';")
        layout.addWidget(self.percentage_label)

        self._progress = initial_progress
        self._update_progress_bar()

    def set_progress(self, progress: int, message: str | None = None) -> None:
        """
        Update progress indicator.

        Args:
            progress: Progress percentage (0-100)
            message: Optional new message
        """
        self._progress = max(0, min(100, progress))
        self.percentage_label.setText(f"{self._progress}%")

        if message:
            self.message_label.setText(message)

        self._update_progress_bar()

    def _update_progress_bar(self) -> None:
        """Update progress bar fill width."""
        container_width = self.progress_container.width()
        fill_width = int(container_width * (self._progress / 100.0))
        self.progress_fill.setGeometry(0, 0, fill_width, 8)
