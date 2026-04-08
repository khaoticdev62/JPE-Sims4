"""Unit tests for async NLP to JPE conversion."""

import pytest
from unittest.mock import Mock, patch
from PySide6.QtCore import QThread

from jpe_studio_qt.ai.nlp_conversion_async import (
    NLPConversionWorker,
    AsyncNLPConversionManager,
    AsyncConversionRequest
)
from jpe_studio_qt.ai.nlp_to_jpe import ConversionType, ConversionResult


class TestAsyncConversionRequest:
    """Test AsyncConversionRequest."""

    def test_default_request(self):
        """Test default request."""
        request = AsyncConversionRequest(natural_language="test")

        assert request.natural_language == "test"
        assert request.current_context == ""
        assert request.suggested_type == ConversionType.INTERACTION
        assert request.timeout_ms == 8000

    def test_full_request(self):
        """Test full request."""
        request = AsyncConversionRequest(
            natural_language="add buff",
            current_context="<code>",
            suggested_type=ConversionType.BUFF,
            request_id="req_123",
            timeout_ms=5000
        )

        assert request.natural_language == "add buff"
        assert request.current_context == "<code>"
        assert request.suggested_type == ConversionType.BUFF
        assert request.timeout_ms == 5000


class TestNLPConversionWorker:
    """Test NLPConversionWorker."""

    @pytest.fixture
    def worker(self):
        """Create worker with mock client."""
        client = Mock()
        return NLPConversionWorker(client)

    def test_worker_creation(self, worker):
        """Test worker can be created."""
        assert worker is not None
        assert worker._converter is not None

    def test_no_client_error(self, worker):
        """Test error when no client."""
        worker._client = None

        with patch.object(worker.error_occurred, 'emit') as mock_emit:
            request = AsyncConversionRequest(natural_language="test")
            worker.convert(request)
            mock_emit.assert_called_once()

    def test_cancel_request(self, worker):
        """Test cancelling request."""
        worker.cancel()
        assert worker._is_cancelled is True

    def test_worker_signals(self, worker):
        """Test worker has signals."""
        assert hasattr(worker, 'conversion_ready')
        assert hasattr(worker, 'progress')
        assert hasattr(worker, 'error_occurred')


class TestAsyncNLPConversionManager:
    """Test AsyncNLPConversionManager."""

    @pytest.fixture
    def manager(self):
        """Create manager."""
        client = Mock()
        return AsyncNLPConversionManager(client)

    def test_manager_creation(self, manager):
        """Test manager can be created."""
        assert manager is not None

    def test_manager_creation_no_client(self):
        """Test manager without client."""
        manager = AsyncNLPConversionManager(None)
        assert manager._client is None

    def test_set_client(self, manager):
        """Test setting client."""
        new_client = Mock()
        manager.set_client(new_client)
        assert manager._client == new_client

    def test_request_no_client(self):
        """Test request without client."""
        manager = AsyncNLPConversionManager(None)

        with patch.object(manager.error, 'emit') as mock_emit:
            request_id = manager.request_conversion(
                AsyncConversionRequest(natural_language="test")
            )

            assert request_id == ""
            mock_emit.assert_called_once()

    def test_request_returns_id(self, manager):
        """Test request returns unique ID."""
        request1 = AsyncConversionRequest(natural_language="test1")
        request2 = AsyncConversionRequest(natural_language="test2")

        id1 = manager.request_conversion(request1)
        id2 = manager.request_conversion(request2)

        assert id1 != ""
        assert id1 != id2

    def test_cancel_request(self, manager):
        """Test cancelling request."""
        request = AsyncConversionRequest(natural_language="test")
        request_id = manager.request_conversion(request)
        manager.cancel_conversion(request_id)
        # Should not crash

    def test_clear_cache(self, manager):
        """Test clearing cache."""
        manager._cache["key"] = "value"
        assert len(manager._cache) > 0

        manager.clear_cache()
        assert len(manager._cache) == 0

    def test_cache_hit(self, manager):
        """Test cache hit."""
        # Pre-cache a result
        result = ConversionResult(
            status="success",
            jpe_code="<?xml...>"
        )
        manager._cache["test:interaction"] = result

        with patch.object(manager.conversion_ready, 'emit') as mock_emit:
            request = AsyncConversionRequest(natural_language="test")
            manager.request_conversion(request)
            # Should emit cached result
            mock_emit.assert_called()

    def test_manager_signals(self, manager):
        """Test manager has signals."""
        assert hasattr(manager, 'conversion_ready')
        assert hasattr(manager, 'progress')
        assert hasattr(manager, 'error')

    def test_cleanup(self, manager):
        """Test cleanup."""
        # Initialize thread
        manager.request_conversion(
            AsyncConversionRequest(natural_language="test")
        )

        manager.cleanup()
        # Should not crash
        assert manager._thread is None
        assert manager._worker is None


class TestAsyncConversionFlow:
    """Test async conversion workflow."""

    @pytest.fixture
    def manager(self):
        """Create manager with mock client."""
        client = Mock()
        return AsyncNLPConversionManager(client)

    def test_full_conversion_flow(self, manager):
        """Test complete workflow."""
        request = AsyncConversionRequest(
            natural_language="add interaction"
        )

        request_id = manager.request_conversion(request)

        assert request_id != ""
        assert manager._last_request_id == request_id
        assert manager._worker is not None
        assert manager._thread is not None

    def test_multiple_requests(self, manager):
        """Test multiple concurrent requests."""
        req1 = AsyncConversionRequest(natural_language="test1")
        req2 = AsyncConversionRequest(natural_language="test2")

        id1 = manager.request_conversion(req1)
        id2 = manager.request_conversion(req2)

        assert id1 != id2
        assert id2 == manager._last_request_id

    def test_manager_creates_thread(self, manager):
        """Test manager creates worker thread."""
        assert manager._thread is None
        assert manager._worker is None

        manager.request_conversion(
            AsyncConversionRequest(natural_language="test")
        )

        assert manager._thread is not None
        assert isinstance(manager._thread, QThread)
        assert manager._worker is not None


class TestAsyncConversionIntegration:
    """Integration tests for async conversion."""

    @pytest.fixture
    def manager(self):
        """Create manager with mock client."""
        client = Mock()
        client.generate_content = Mock(
            return_value='{"code": "<?xml...>", "explanation": "test", "confidence": 0.9}'
        )
        return AsyncNLPConversionManager(client)

    def test_error_handling(self, manager):
        """Test error handling."""
        manager._client.generate_content = Mock(side_effect=Exception("API Error"))

        with patch.object(manager.error, 'emit') as mock_emit:
            manager.request_conversion(
                AsyncConversionRequest(natural_language="test")
            )
            # May emit error signal
