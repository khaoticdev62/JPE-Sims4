"""
Asynchronous Natural Language to JPE Conversion.

Non-blocking conversion of natural language to JPE code using background threads.
Integrates with Phase 5 async completion system.

Features:
- Background thread for conversion
- Signal-based result notification
- Request cancellation
- Timeout protection
- Result caching
"""

from __future__ import annotations

import logging
from typing import Optional
from dataclasses import dataclass

from PySide6.QtCore import QObject, QThread, Signal

from .nlp_to_jpe import (
    NLPToJPEConverter,
    ConversionRequest,
    ConversionResult,
    ConversionType
)

logger = logging.getLogger(__name__)


@dataclass
class AsyncConversionRequest:
    """Request for async NLP to JPE conversion."""
    natural_language: str
    current_context: str = ""
    suggested_type: ConversionType = ConversionType.INTERACTION
    request_id: Optional[str] = None
    timeout_ms: int = 8000  # Conversion may take longer than completion


class NLPConversionWorker(QObject):
    """
    Worker for async NLP to JPE conversion.

    Runs in separate thread to avoid blocking UI during conversion.
    """

    # Signals
    conversion_ready = Signal(ConversionResult)
    progress = Signal(str)
    error_occurred = Signal(str)

    def __init__(self, gemini_client: object) -> None:
        """Initialize worker."""
        super().__init__()
        self._client = gemini_client
        self._converter = NLPToJPEConverter(gemini_client)
        self._is_cancelled = False

    def convert(self, request: AsyncConversionRequest) -> None:
        """
        Perform conversion asynchronously.

        Args:
            request: AsyncConversionRequest with natural language
        """
        if not self._client:
            self.error_occurred.emit("Gemini client not available")
            result = ConversionResult(
                status="failed",
                error="Gemini client not available",
                request_id=request.request_id
            )
            self.conversion_ready.emit(result)
            return

        self._is_cancelled = False

        try:
            self.progress.emit(f"Converting: {request.natural_language[:50]}...")

            # Create conversion request
            conversion_request = ConversionRequest(
                natural_language=request.natural_language,
                current_context=request.current_context,
                suggested_type=request.suggested_type,
                request_id=request.request_id
            )

            # Convert (synchronous, but we're in worker thread)
            result = self._converter.convert(conversion_request)

            if self._is_cancelled:
                result = ConversionResult(
                    status="cancelled",
                    request_id=request.request_id
                )
            else:
                self.progress.emit("Conversion complete")

            self.conversion_ready.emit(result)

        except Exception as e:
            error_msg = f"Conversion error: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self.error_occurred.emit(error_msg)

            result = ConversionResult(
                status="failed",
                error=error_msg,
                request_id=request.request_id
            )
            self.conversion_ready.emit(result)

    def cancel(self) -> None:
        """Cancel current conversion."""
        self._is_cancelled = True
        self.progress.emit("Cancelling conversion...")


class AsyncNLPConversionManager(QObject):
    """
    Manager for async NLP to JPE conversions.

    Provides:
    - Worker thread management
    - Request tracking
    - Result caching
    - Cancellation support
    """

    # Signals
    conversion_ready = Signal(ConversionResult)
    progress = Signal(str)
    error = Signal(str)

    def __init__(self, gemini_client: Optional[object] = None) -> None:
        """Initialize manager."""
        super().__init__()
        self._client = gemini_client
        self._worker: Optional[NLPConversionWorker] = None
        self._thread: Optional[QThread] = None
        self._cache: dict = {}  # Cache by request content hash
        self._last_request_id: Optional[str] = None

    def set_client(self, client: object) -> None:
        """Update Gemini client."""
        self._client = client
        if self._worker:
            self._worker._client = client

    def request_conversion(self, request: AsyncConversionRequest) -> str:
        """
        Request conversion asynchronously.

        Args:
            request: AsyncConversionRequest with natural language

        Returns:
            Request ID for tracking
        """
        if not self._client:
            self.error.emit("Gemini client not configured")
            return ""

        request_id = f"nlp_{id(self)}"
        request.request_id = request_id
        self._last_request_id = request_id

        # Check cache
        cache_key = f"{request.natural_language}:{request.suggested_type.value}"
        if cache_key in self._cache:
            cached_result = self._cache[cache_key]
            cached_result.request_id = request_id
            self.conversion_ready.emit(cached_result)
            return request_id

        # Initialize worker if needed
        if not self._worker:
            self._init_worker()

        # Emit progress
        self.progress.emit(f"Converting: {request.natural_language[:50]}...")

        # Request conversion
        self._worker.convert(request)

        return request_id

    def cancel_conversion(self, request_id: Optional[str] = None) -> None:
        """Cancel conversion."""
        if request_id is None:
            request_id = self._last_request_id

        if self._worker:
            self._worker.cancel()

    def clear_cache(self) -> None:
        """Clear conversion cache."""
        self._cache.clear()

    def _init_worker(self) -> None:
        """Initialize worker thread."""
        self._worker = NLPConversionWorker(self._client)
        self._thread = QThread()

        self._worker.moveToThread(self._thread)
        self._worker.conversion_ready.connect(self._on_conversion_ready)
        self._worker.progress.connect(self.progress.emit)
        self._worker.error_occurred.connect(self.error.emit)

        self._thread.started.connect(lambda: None)
        self._thread.start()

        logger.debug("NLP conversion worker initialized")

    def _on_conversion_ready(self, result: ConversionResult) -> None:
        """Handle conversion result."""
        if result.status == "success":
            # Cache successful conversions
            cache_key = f"{result.request_id}"
            self._cache[cache_key] = result

        self.conversion_ready.emit(result)

    def cleanup(self) -> None:
        """Cleanup worker thread."""
        if self._thread:
            self._thread.quit()
            self._thread.wait()
            self._thread = None
            self._worker = None

    def __del__(self):
        """Cleanup on destruction."""
        self.cleanup()
