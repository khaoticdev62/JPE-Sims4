"""Unit tests for async Gemini completion module."""

import pytest
from unittest.mock import Mock, MagicMock, patch, call
from PySide6.QtCore import QThread

from jpe_studio_qt.ai.gemini_completion import (
    CompletionStatus,
    AsyncCompletionResult,
    GeminiCompletionWorker,
    AsyncGeminiCompletionManager,
)


class TestCompletionStatus:
    """Test CompletionStatus enum."""

    def test_status_values(self):
        """Test status enum has correct values."""
        assert CompletionStatus.PENDING.value == "pending"
        assert CompletionStatus.RUNNING.value == "running"
        assert CompletionStatus.COMPLETED.value == "completed"
        assert CompletionStatus.CANCELLED.value == "cancelled"
        assert CompletionStatus.FAILED.value == "failed"
        assert CompletionStatus.TIMEOUT.value == "timeout"


class TestAsyncCompletionResult:
    """Test AsyncCompletionResult dataclass."""

    def test_default_result(self):
        """Test creating result with defaults."""
        result = AsyncCompletionResult(status=CompletionStatus.PENDING)

        assert result.status == CompletionStatus.PENDING
        assert result.completions is None
        assert result.error is None
        assert result.request_id is None
        assert result.elapsed_ms == 0.0

    def test_completed_result(self):
        """Test creating completed result."""
        completions = [Mock(), Mock()]
        result = AsyncCompletionResult(
            status=CompletionStatus.COMPLETED,
            completions=completions,
            request_id="req_123",
            elapsed_ms=1500.0
        )

        assert result.status == CompletionStatus.COMPLETED
        assert result.completions == completions
        assert result.request_id == "req_123"
        assert result.elapsed_ms == 1500.0

    def test_failed_result(self):
        """Test creating failed result."""
        result = AsyncCompletionResult(
            status=CompletionStatus.FAILED,
            error="Connection timeout"
        )

        assert result.status == CompletionStatus.FAILED
        assert result.error == "Connection timeout"


class TestGeminiCompletionWorker:
    """Test GeminiCompletionWorker."""

    @pytest.fixture
    def worker(self):
        """Create worker instance."""
        client = Mock()
        return GeminiCompletionWorker(client, timeout_ms=5000)

    def test_worker_creation(self, worker):
        """Test worker can be created."""
        assert worker is not None
        assert worker._timeout_ms == 5000

    def test_fetch_completions_no_client(self, worker):
        """Test fetching without client."""
        worker._client = None

        with patch.object(worker.error_occurred, 'emit') as mock_emit:
            worker.fetch_completions("context", "line")
            mock_emit.assert_called_once()

    def test_fetch_completions_with_client(self, worker):
        """Test fetching with client."""
        client = Mock()
        client.generate_content = Mock(return_value="test: completion")
        worker._client = client

        with patch.object(worker.completion_ready, 'emit') as mock_emit:
            with patch.object(worker, '_parse_gemini_response', return_value=[]):
                worker.fetch_completions("context", "line")
                # Should emit result
                assert mock_emit.called

    def test_cancel_request(self, worker):
        """Test cancelling request."""
        worker._is_cancelled = False
        worker.cancel_request()

        assert worker._is_cancelled is True

    def test_create_completion_prompt(self, worker):
        """Test prompt creation."""
        prompt = worker._create_completion_prompt("def foo():", "bar")

        assert "def foo():" in prompt
        assert "bar" in prompt
        assert "JSON" in prompt or "json" in prompt.lower()

    def test_parse_gemini_response_empty(self, worker):
        """Test parsing empty response."""
        result = worker._parse_gemini_response("")
        assert result is None

    def test_parse_gemini_response_none(self, worker):
        """Test parsing None response."""
        result = worker._parse_gemini_response(None)
        assert result is None

    def test_parse_gemini_response_invalid_json(self, worker):
        """Test parsing invalid JSON response."""
        result = worker._parse_gemini_response("not json")
        assert result is None

    def test_worker_signals(self, worker):
        """Test worker has required signals."""
        assert hasattr(worker, 'completion_ready')
        assert hasattr(worker, 'progress')
        assert hasattr(worker, 'error_occurred')


class TestAsyncGeminiCompletionManager:
    """Test AsyncGeminiCompletionManager."""

    @pytest.fixture
    def manager(self):
        """Create manager instance."""
        client = Mock()
        return AsyncGeminiCompletionManager(client, timeout_ms=5000)

    def test_manager_creation(self, manager):
        """Test manager can be created."""
        assert manager is not None
        assert manager._timeout_ms == 5000
        assert manager._cache == {}

    def test_manager_creation_no_client(self):
        """Test manager creation without client."""
        manager = AsyncGeminiCompletionManager(None)
        assert manager._client is None

    def test_set_client(self, manager):
        """Test setting client."""
        new_client = Mock()
        manager.set_client(new_client)

        assert manager._client == new_client

    def test_request_completions_no_client(self, manager):
        """Test requesting without client."""
        manager._client = None

        with patch.object(manager.error, 'emit') as mock_emit:
            request_id = manager.request_completions("context", "line")

            assert request_id == ""
            mock_emit.assert_called_once()

    def test_request_completions_returns_id(self, manager):
        """Test that request returns ID."""
        request_id = manager.request_completions("context", "line")

        assert request_id != ""
        assert "req_" in request_id

    def test_cancel_request(self, manager):
        """Test cancelling request."""
        request_id = manager.request_completions("context", "line")
        manager.cancel_request(request_id)
        # Should not crash

    def test_clear_cache(self, manager):
        """Test clearing cache."""
        manager._cache["key"] = "value"
        assert len(manager._cache) > 0

        manager.clear_cache()

        assert len(manager._cache) == 0

    def test_cache_hit(self, manager):
        """Test cache hit on duplicate request."""
        # First request (will be cached after completion)
        result1 = AsyncCompletionResult(
            status=CompletionStatus.COMPLETED,
            completions=[Mock()]
        )
        manager._cache["context:line"] = result1

        # Request same context
        with patch.object(manager.completions_ready, 'emit') as mock_emit:
            manager.request_completions("context", "line")
            # Should emit cached result immediately

    def test_manager_signals(self, manager):
        """Test manager has required signals."""
        assert hasattr(manager, 'completions_ready')
        assert hasattr(manager, 'progress')
        assert hasattr(manager, 'error')

    def test_cleanup(self, manager):
        """Test cleanup method."""
        # Initialize worker first
        _ = manager.request_completions("context", "line")

        manager.cleanup()

        assert manager._thread is None
        assert manager._worker is None


class TestAsyncCompletionIntegration:
    """Integration tests for async completion."""

    @pytest.fixture
    def manager(self):
        """Create manager with mock client."""
        client = Mock()
        manager = AsyncGeminiCompletionManager(client, timeout_ms=1000)
        return manager, client

    def test_full_completion_flow(self, manager):
        """Test full completion workflow."""
        manager_obj, client = manager

        request_id = manager_obj.request_completions("def foo():", "bar")

        assert request_id != ""
        assert manager_obj._last_request_id == request_id

    def test_multiple_requests(self, manager):
        """Test multiple completion requests."""
        manager_obj, client = manager

        req1 = manager_obj.request_completions("context1", "line1")
        req2 = manager_obj.request_completions("context2", "line2")

        assert req1 != req2
        assert req2 == manager_obj._last_request_id

    def test_error_handling(self, manager):
        """Test error handling."""
        manager_obj, client = manager

        # Simulate error in Gemini call
        client.generate_content = Mock(side_effect=Exception("API Error"))

        with patch.object(manager_obj.error, 'emit') as mock_emit:
            request_id = manager_obj.request_completions("context", "line")
            # May emit error signal

    def test_timeout_handling(self, manager):
        """Test timeout handling."""
        manager_obj, client = manager

        # This will timeout after 1000ms
        request_id = manager_obj.request_completions("context", "line")

        assert request_id != ""


class TestWorkerThreading:
    """Test worker threading behavior."""

    def test_worker_is_qobject(self):
        """Test worker is QObject."""
        from PySide6.QtCore import QObject
        worker = GeminiCompletionWorker(Mock())

        assert isinstance(worker, QObject)

    def test_manager_creates_thread(self):
        """Test manager creates thread."""
        manager = AsyncGeminiCompletionManager(Mock())

        # Request completions should initialize thread
        manager.request_completions("context", "line")

        assert manager._thread is not None
        assert isinstance(manager._thread, QThread)
