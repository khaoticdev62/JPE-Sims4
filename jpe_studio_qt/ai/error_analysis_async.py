"""
Asynchronous Error Analysis.

Non-blocking error analysis using background threads.
Integrates with Phase 5 async completion system.

Features:
- Background thread for error analysis
- Signal-based result notification
- Request cancellation
- Batch analysis (multiple errors)
"""

from __future__ import annotations

import logging
from typing import Optional, List
from dataclasses import dataclass

from PySide6.QtCore import QObject, QThread, Signal

from .error_analyzer import (
    AIErrorAnalyzer,
    ErrorAnalysisRequest,
    ErrorExplanation
)

logger = logging.getLogger(__name__)


@dataclass
class AsyncErrorAnalysisRequest:
    """Async error analysis request."""
    error_code: str
    error_message: str
    error_details: str
    file_context: str = ""
    request_id: Optional[str] = None


class ErrorAnalysisWorker(QObject):
    """Worker for async error analysis."""

    # Signals
    analysis_ready = Signal(ErrorExplanation)
    progress = Signal(str)
    error_occurred = Signal(str)

    def __init__(self, gemini_client: object) -> None:
        """Initialize worker."""
        super().__init__()
        self._client = gemini_client
        self._analyzer = AIErrorAnalyzer(gemini_client)
        self._is_cancelled = False

    def analyze(self, request: AsyncErrorAnalysisRequest) -> None:
        """Perform analysis asynchronously."""
        if not self._client:
            self.error_occurred.emit("Gemini client not available")
            return

        self._is_cancelled = False

        try:
            self.progress.emit(f"Analyzing: {request.error_code}")

            # Create analysis request
            analysis_request = ErrorAnalysisRequest(
                error_code=request.error_code,
                error_message=request.error_message,
                error_details=request.error_details,
                file_context=request.file_context,
                request_id=request.request_id
            )

            # Analyze (synchronous, but we're in worker thread)
            explanation = self._analyzer.analyze(analysis_request)

            if self._is_cancelled:
                return

            self.analysis_ready.emit(explanation)

        except Exception as e:
            error_msg = f"Analysis error: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self.error_occurred.emit(error_msg)

    def cancel(self) -> None:
        """Cancel current analysis."""
        self._is_cancelled = True
        self.progress.emit("Cancelling analysis...")


class AsyncErrorAnalysisManager(QObject):
    """Manager for async error analysis."""

    # Signals
    analysis_ready = Signal(ErrorExplanation)
    progress = Signal(str)
    error = Signal(str)
    batch_analysis_complete = Signal(list)  # List of explanations

    def __init__(self, gemini_client: Optional[object] = None) -> None:
        """Initialize manager."""
        super().__init__()
        self._client = gemini_client
        self._worker: Optional[ErrorAnalysisWorker] = None
        self._thread: Optional[QThread] = None
        self._cache: dict = {}
        self._last_request_id: Optional[str] = None
        self._pending_analyses: List[ErrorExplanation] = []

    def set_client(self, client: object) -> None:
        """Update Gemini client."""
        self._client = client
        if self._worker:
            self._worker._client = client

    def analyze_error(self, request: AsyncErrorAnalysisRequest) -> str:
        """
        Request error analysis asynchronously.

        Args:
            request: AsyncErrorAnalysisRequest

        Returns:
            Request ID for tracking
        """
        if not self._client:
            self.error.emit("Gemini client not configured")
            return ""

        request_id = f"err_{id(self)}"
        request.request_id = request_id
        self._last_request_id = request_id

        # Check cache
        cache_key = request.error_code
        if cache_key in self._cache:
            cached = self._cache[cache_key]
            cached.request_id = request_id
            self.analysis_ready.emit(cached)
            return request_id

        # Initialize worker if needed
        if not self._worker:
            self._init_worker()

        # Request analysis
        self._worker.analyze(request)

        return request_id

    def analyze_batch(self, requests: List[AsyncErrorAnalysisRequest]) -> List[str]:
        """
        Analyze multiple errors.

        Args:
            requests: List of AsyncErrorAnalysisRequest

        Returns:
            List of request IDs
        """
        request_ids = []
        self._pending_analyses = []

        for request in requests:
            request_id = self.analyze_error(request)
            request_ids.append(request_id)

        return request_ids

    def cancel_analysis(self, request_id: Optional[str] = None) -> None:
        """Cancel analysis."""
        if request_id is None:
            request_id = self._last_request_id

        if self._worker:
            self._worker.cancel()

    def clear_cache(self) -> None:
        """Clear analysis cache."""
        self._cache.clear()

    def _init_worker(self) -> None:
        """Initialize worker thread."""
        self._worker = ErrorAnalysisWorker(self._client)
        self._thread = QThread()

        self._worker.moveToThread(self._thread)
        self._worker.analysis_ready.connect(self._on_analysis_ready)
        self._worker.progress.connect(self.progress.emit)
        self._worker.error_occurred.connect(self.error.emit)

        self._thread.started.connect(lambda: None)
        self._thread.start()

        logger.debug("Error analysis worker initialized")

    def _on_analysis_ready(self, explanation: ErrorExplanation) -> None:
        """Handle analysis result."""
        # Cache
        cache_key = explanation.error_code
        self._cache[cache_key] = explanation

        # Track for batch completion
        self._pending_analyses.append(explanation)

        # Emit result
        self.analysis_ready.emit(explanation)

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
