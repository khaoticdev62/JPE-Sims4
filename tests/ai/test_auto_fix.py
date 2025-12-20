"""Unit tests for auto-fix workflow."""

import pytest
from unittest.mock import Mock, patch
from datetime import datetime

from jpe_studio_qt.ai.auto_fix import (
    AutoFixManager,
    SuggestedFix,
    FixBatch,
    FixStatus
)


class TestFixStatus:
    """Test FixStatus enum."""

    def test_fix_statuses(self):
        """Test all fix statuses exist."""
        assert FixStatus.PENDING.value == "pending"
        assert FixStatus.APPLIED.value == "applied"
        assert FixStatus.REJECTED.value == "rejected"
        assert FixStatus.FAILED.value == "failed"


class TestSuggestedFix:
    """Test SuggestedFix dataclass."""

    def test_fix_creation(self):
        """Test creating a suggested fix."""
        fix = SuggestedFix(
            error_code="ERR_001",
            error_message="Parser error",
            fix_index=0,
            fix_description="Add missing closing tag",
            original_code="<define>",
            fixed_code="<define></define>",
            confidence=0.95
        )

        assert fix.error_code == "ERR_001"
        assert fix.confidence == 0.95
        assert fix.status == FixStatus.PENDING

    def test_fix_apply_tracking(self):
        """Test tracking when fix is applied."""
        fix = SuggestedFix(
            error_code="ERR_001",
            error_message="test",
            fix_index=0,
            fix_description="test",
            original_code="code",
            fixed_code="fixed",
            confidence=0.9
        )

        assert fix.status == FixStatus.PENDING
        fix.status = FixStatus.APPLIED
        assert fix.status == FixStatus.APPLIED


class TestFixBatch:
    """Test FixBatch dataclass."""

    def test_batch_creation(self):
        """Test creating a batch."""
        fixes = [
            SuggestedFix(
                error_code=f"ERR_{i:03d}",
                error_message="test",
                fix_index=0,
                fix_description="fix",
                original_code="code",
                fixed_code="fixed",
                confidence=0.9
            )
            for i in range(3)
        ]

        batch = FixBatch(fixes=fixes)
        assert len(batch.fixes) == 3


class TestAutoFixManager:
    """Test AutoFixManager."""

    @pytest.fixture
    def manager(self):
        """Create manager with mock client."""
        client = Mock()
        return AutoFixManager(client)

    def test_manager_creation(self, manager):
        """Test manager can be created."""
        assert manager is not None

    def test_set_client(self, manager):
        """Test setting client."""
        new_client = Mock()
        manager.set_client(new_client)
        assert manager._client == new_client

    def test_preview_fix(self, manager):
        """Test previewing a fix."""
        fix = SuggestedFix(
            error_code="ERR_001",
            error_message="test",
            fix_index=0,
            fix_description="test fix",
            original_code="def hello():\n    pass",
            fixed_code="def hello():\n    print('hello')\n    pass",
            confidence=0.9
        )

        diff = manager.preview_fix(fix)

        assert diff is not None
        assert diff.additions > 0

    def test_apply_fix(self, manager):
        """Test applying a fix."""
        fix = SuggestedFix(
            error_code="ERR_001",
            error_message="test",
            fix_index=0,
            fix_description="test",
            original_code="code",
            fixed_code="fixed",
            confidence=0.9
        )

        # Mock the signal by replacing it with a Mock object
        mock_signal = Mock()
        manager.fix_applied = mock_signal

        result = manager.apply_fix(fix)

        assert result is True
        assert fix.status == FixStatus.APPLIED
        mock_signal.emit.assert_called_once()

    def test_apply_empty_fix(self, manager):
        """Test applying fix with no code."""
        fix = SuggestedFix(
            error_code="ERR_001",
            error_message="test",
            fix_index=0,
            fix_description="test",
            original_code="code",
            fixed_code="",
            confidence=0.9
        )

        # Mock the signal by replacing it with a Mock object
        mock_signal = Mock()
        manager.fix_failed = mock_signal

        result = manager.apply_fix(fix)

        assert result is False
        mock_signal.emit.assert_called_once()

    def test_reject_fix(self, manager):
        """Test rejecting a fix."""
        fix = SuggestedFix(
            error_code="ERR_001",
            error_message="test",
            fix_index=0,
            fix_description="test",
            original_code="code",
            fixed_code="fixed",
            confidence=0.9
        )

        # Mock the signal by replacing it with a Mock object
        mock_signal = Mock()
        manager.fix_rejected = mock_signal

        manager.reject_fix(fix)

        assert fix.status == FixStatus.REJECTED
        mock_signal.emit.assert_called_once()

    def test_apply_batch(self, manager):
        """Test applying multiple fixes."""
        fixes = [
            SuggestedFix(
                error_code=f"ERR_{i}",
                error_message="test",
                fix_index=0,
                fix_description="test",
                original_code="code",
                fixed_code="fixed",
                confidence=0.9
            )
            for i in range(3)
        ]

        # Mock the signals by replacing them with Mock objects
        mock_signal = Mock()
        manager.fix_applied = mock_signal
        manager.progress = Mock()

        result = manager.apply_batch(fixes)

        assert result is True
        assert len(manager.get_applied_fixes()) == 3
        assert mock_signal.emit.call_count == 3

    def test_fix_history(self, manager):
        """Test fix history tracking."""
        # Create multiple fixes to test history
        fixes = [
            SuggestedFix(
                error_code=f"ERR_{i}",
                error_message="test",
                fix_index=0,
                fix_description="test",
                original_code="code",
                fixed_code="fixed",
                confidence=0.9
            )
            for i in range(3)
        ]

        # Mock the signals and analyzer
        manager.fix_applied = Mock()
        manager.progress = Mock()
        manager._fix_history.extend(fixes)

        # Apply one fix
        manager.apply_fix(fixes[0])

        # Check history
        history = manager.get_fix_history()
        assert len(history) == 3
        assert history[0].error_code == "ERR_0"

        # Check applied fixes tracking
        applied = manager.get_applied_fixes()
        assert "ERR_0" in applied

    def test_applied_fixes_tracking(self, manager):
        """Test tracking applied fixes."""
        fix = SuggestedFix(
            error_code="ERR_001",
            error_message="test",
            fix_index=0,
            fix_description="test",
            original_code="code",
            fixed_code="fixed",
            confidence=0.9
        )

        # Mock the signals by replacing them with Mock objects
        manager.fix_applied = Mock()
        manager.progress = Mock()

        manager.apply_fix(fix)

        applied = manager.get_applied_fixes()
        assert "ERR_001" in applied
        assert applied["ERR_001"].status == FixStatus.APPLIED

    def test_clear_history(self, manager):
        """Test clearing history."""
        # Create fixes to populate history
        fixes = [
            SuggestedFix(
                error_code=f"ERR_{i}",
                error_message="test",
                fix_index=0,
                fix_description="test",
                original_code="code",
                fixed_code="fixed",
                confidence=0.9
            )
            for i in range(3)
        ]

        # Mock the signals and populate history
        manager.fix_applied = Mock()
        manager.progress = Mock()
        manager._fix_history.extend(fixes)

        # Apply some fixes
        manager.apply_fix(fixes[0])
        manager.apply_fix(fixes[1])

        assert len(manager.get_fix_history()) > 0
        assert len(manager.get_applied_fixes()) > 0

        # Clear history
        manager.clear_history()

        assert len(manager.get_fix_history()) == 0
        assert len(manager.get_applied_fixes()) == 0

    def test_statistics(self, manager):
        """Test fix statistics."""
        fixes = [
            SuggestedFix(
                error_code=f"ERR_{i}",
                error_message="test",
                fix_index=0,
                fix_description="test",
                original_code="code",
                fixed_code="fixed",
                confidence=0.9
            )
            for i in range(3)
        ]

        # Mock the signals and populate history
        mock_signal = Mock()
        manager.fix_applied = mock_signal
        manager.progress = Mock()
        manager._fix_history.extend(fixes)

        # Apply all fixes
        manager.apply_batch(fixes)

        stats = manager.get_statistics()

        assert stats["total_fixes_suggested"] == 3
        assert stats["fixes_applied"] == 3
        assert stats["average_confidence"] > 0

    def test_manager_signals(self, manager):
        """Test manager has signals."""
        assert hasattr(manager, 'fixes_ready')
        assert hasattr(manager, 'fix_applied')
        assert hasattr(manager, 'fix_rejected')
        assert hasattr(manager, 'fix_failed')
        assert hasattr(manager, 'progress')
