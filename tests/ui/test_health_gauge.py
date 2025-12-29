"""Unit tests for health gauge widget."""

import pytest
from unittest.mock import Mock, patch
from PySide6.QtWidgets import QApplication

from jpe_studio_qt.ui.health_gauge import (
    HealthGauge, HealthPanel, HealthStatus, HealthMetrics, HealthLevel
)


@pytest.fixture(scope="session")
def qapp():
    """Create QApplication for tests."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    return app


class TestHealthMetrics:
    """Test HealthMetrics dataclass."""

    def test_metrics_creation(self):
        """Test creating health metrics."""
        metrics = HealthMetrics(
            error_count=5,
            warning_count=10,
            suggestion_count=3,
            total_issues=18,
            health_percentage=85.0
        )

        assert metrics.error_count == 5
        assert metrics.warning_count == 10
        assert metrics.suggestion_count == 3
        assert metrics.total_issues == 18
        assert metrics.health_percentage == 85.0

    def test_metrics_defaults(self):
        """Test metrics with defaults."""
        metrics = HealthMetrics()

        assert metrics.error_count == 0
        assert metrics.warning_count == 0
        assert metrics.suggestion_count == 0
        assert metrics.total_issues == 0
        assert metrics.health_percentage == 100.0
        assert metrics.timestamp is None


class TestHealthLevel:
    """Test HealthLevel enum."""

    def test_health_levels(self):
        """Test all health levels."""
        assert HealthLevel.EXCELLENT.value == 90
        assert HealthLevel.GOOD.value == 70
        assert HealthLevel.FAIR.value == 50
        assert HealthLevel.POOR.value == 30
        assert HealthLevel.CRITICAL.value == 0


class TestHealthGauge:
    """Test HealthGauge widget."""

    @pytest.fixture
    def gauge(self, qapp):
        """Create health gauge for testing."""
        return HealthGauge(size=120)

    def test_gauge_creation(self, gauge):
        """Test gauge can be created."""
        assert gauge is not None
        assert gauge.width() == 120
        assert gauge.height() == 120

    def test_gauge_initial_health(self, gauge):
        """Test initial health is 100%."""
        assert gauge._metrics.health_percentage == 100.0
        assert gauge._animated_health == 100.0

    def test_set_metrics(self, gauge):
        """Test setting metrics."""
        metrics = HealthMetrics(
            error_count=2,
            warning_count=5,
            health_percentage=75.0
        )

        gauge.set_metrics(metrics)

        assert gauge._metrics.error_count == 2
        assert gauge._metrics.warning_count == 5
        assert gauge._target_health == 75.0

    def test_health_level_excellent(self, gauge):
        """Test health level detection - excellent."""
        level, color = gauge._get_health_level(95.0)
        assert level == HealthLevel.EXCELLENT
        assert color == "#22C55E"

    def test_health_level_good(self, gauge):
        """Test health level detection - good."""
        level, color = gauge._get_health_level(75.0)
        assert level == HealthLevel.GOOD
        assert color == "#84CC16"

    def test_health_level_fair(self, gauge):
        """Test health level detection - fair."""
        level, color = gauge._get_health_level(55.0)
        assert level == HealthLevel.FAIR
        assert color == "#E5940C"

    def test_health_level_poor(self, gauge):
        """Test health level detection - poor."""
        level, color = gauge._get_health_level(35.0)
        assert level == HealthLevel.POOR
        assert color == "#F97316"

    def test_health_level_critical(self, gauge):
        """Test health level detection - critical."""
        level, color = gauge._get_health_level(15.0)
        assert level == HealthLevel.CRITICAL
        assert color == "#EF4444"

    def test_gauge_signal_emission(self, gauge):
        """Test gauge emits signal on click."""
        metrics = HealthMetrics(health_percentage=80.0)
        gauge.set_metrics(metrics)

        # Mock the signal and verify it's called
        mock_signal = Mock()
        gauge.health_clicked = mock_signal

        gauge.mousePressEvent(None)

        assert mock_signal.emit.called

    def test_animated_property(self, gauge):
        """Test animated health property."""
        gauge.animatedHealth = 50.0
        assert gauge.animatedHealth == 50.0


class TestHealthPanel:
    """Test HealthPanel widget."""

    @pytest.fixture
    def panel(self, qapp):
        """Create health panel for testing."""
        return HealthPanel()

    def test_panel_creation(self, panel):
        """Test panel can be created."""
        assert panel is not None
        assert hasattr(panel, '_gauge')
        assert hasattr(panel, '_error_label')
        assert hasattr(panel, '_warning_label')
        assert hasattr(panel, '_suggestion_label')
        assert hasattr(panel, '_progress_bar')

    def test_panel_set_metrics_excellent(self, panel):
        """Test setting metrics - excellent health."""
        metrics = HealthMetrics(
            error_count=0,
            warning_count=0,
            suggestion_count=1,
            total_issues=1,
            health_percentage=99.0
        )

        panel.set_metrics(metrics)

        assert panel._error_label.text() == "0"
        assert panel._warning_label.text() == "0"
        assert panel._suggestion_label.text() == "1"
        assert panel._status_label.text() == "Excellent"

    def test_panel_set_metrics_poor(self, panel):
        """Test setting metrics - poor health."""
        metrics = HealthMetrics(
            error_count=5,
            warning_count=10,
            suggestion_count=2,
            total_issues=17,
            health_percentage=35.0
        )

        panel.set_metrics(metrics)

        assert panel._error_label.text() == "5"
        assert panel._warning_label.text() == "10"
        assert panel._suggestion_label.text() == "2"
        assert panel._status_label.text() == "Poor"

    def test_panel_progress_bar_update(self, panel):
        """Test progress bar updates with metrics."""
        metrics = HealthMetrics(
            total_issues=10,
            health_percentage=80.0
        )

        panel.set_metrics(metrics)

        # Progress bar shows unresolved issues
        expected_value = int(100 - 80.0)
        assert panel._progress_bar.value() == expected_value

    def test_panel_progress_bar_no_issues(self, panel):
        """Test progress bar when no issues."""
        metrics = HealthMetrics(
            total_issues=0,
            health_percentage=100.0
        )

        panel.set_metrics(metrics)

        assert panel._progress_bar.value() == 100

    def test_panel_signal_emission(self, panel):
        """Test panel emits signal on gauge click."""
        metrics = HealthMetrics(health_percentage=75.0)
        panel.set_metrics(metrics)

        # Mock the signal and verify it's called
        mock_signal = Mock()
        panel.health_clicked = mock_signal

        panel._on_gauge_clicked(metrics)

        assert mock_signal.emit.called


class TestHealthStatus:
    """Test HealthStatus indicator."""

    @pytest.fixture
    def status(self, qapp):
        """Create health status for testing."""
        return HealthStatus()

    def test_status_creation(self, status):
        """Test status can be created."""
        assert status is not None
        assert hasattr(status, '_gauge')
        assert hasattr(status, '_health_label')
        assert hasattr(status, '_status_label')

    def test_status_set_metrics_excellent(self, status):
        """Test status with excellent metrics."""
        metrics = HealthMetrics(health_percentage=95.0)

        status.set_metrics(metrics)

        assert status._health_label.text() == "95%"
        assert status._status_label.text() == "Excellent"

    def test_status_set_metrics_critical(self, status):
        """Test status with critical metrics."""
        metrics = HealthMetrics(health_percentage=15.0)

        status.set_metrics(metrics)

        assert status._health_label.text() == "15%"
        assert status._status_label.text() == "Critical"

    def test_status_metrics_update(self, status):
        """Test status updates correctly."""
        metrics1 = HealthMetrics(health_percentage=90.0)
        status.set_metrics(metrics1)
        assert status._health_label.text() == "90%"

        metrics2 = HealthMetrics(health_percentage=50.0)
        status.set_metrics(metrics2)
        assert status._health_label.text() == "50%"
