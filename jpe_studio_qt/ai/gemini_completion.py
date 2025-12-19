"""
Asynchronous Gemini AI completion fetching.

This module provides non-blocking completion requests to the Gemini API,
allowing the UI to remain responsive while fetching AI-powered suggestions.

Features:
- Worker thread for async operations
- Cancellation support
- Timeout protection
- Error handling
- Result caching
- Progress signals
"""

from __future__ import annotations

import logging
from typing import Optional, List
from dataclasses import dataclass
from enum import Enum

from PySide6.QtCore import QObject, QThread, Signal, QTimer

logger = logging.getLogger(__name__)


class CompletionStatus(Enum):
    """Status of an async completion request."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"
    TIMEOUT = "timeout"


@dataclass
class AsyncCompletionResult:
    """Result from async Gemini completion fetch."""
    status: CompletionStatus
    completions: List[object] = None  # List of CompletionCandidate
    error: Optional[str] = None
    request_id: Optional[str] = None
    elapsed_ms: float = 0.0


class GeminiCompletionWorker(QObject):
    """
    Worker for async Gemini completion requests.

    Runs in a separate thread to avoid blocking the UI.
    Emits signals when results are ready or errors occur.
    """

    # Signals
    completion_ready = Signal(AsyncCompletionResult)  # Result ready
    progress = Signal(str)  # Progress update
    error_occurred = Signal(str)  # Error message

    def __init__(self, gemini_client: object,
                 timeout_ms: int = 5000) -> None:
        """
        Initialize worker.

        Args:
            gemini_client: GeminiClient instance
            timeout_ms: Request timeout in milliseconds
        """
        super().__init__()
        self._client = gemini_client
        self._timeout_ms = timeout_ms
        self._current_request_id: Optional[str] = None
        self._is_cancelled = False

    def fetch_completions(self, code_context: str, cursor_line: str,
                         request_id: Optional[str] = None) -> None:
        """
        Fetch completions from Gemini asynchronously.

        Args:
            code_context: Full code context
            cursor_line: Current line being edited
            request_id: Optional identifier for tracking request
        """
        if not self._client:
            self.error_occurred.emit("Gemini client not available")
            return

        try:
            self._current_request_id = request_id or id(self)
            self._is_cancelled = False

            self.progress.emit("Requesting completions from Gemini...")

            # Create prompt for Gemini
            prompt = self._create_completion_prompt(code_context, cursor_line)

            # Start timeout timer
            timeout_timer = QTimer()
            timeout_timer.setSingleShot(True)
            timeout_timer.setInterval(self._timeout_ms)

            def on_timeout():
                """Handle timeout."""
                self._is_cancelled = True
                self.progress.emit("Completion request timed out")
                result = AsyncCompletionResult(
                    status=CompletionStatus.TIMEOUT,
                    error=f"Request timed out after {self._timeout_ms}ms",
                    request_id=self._current_request_id
                )
                self.completion_ready.emit(result)

            timeout_timer.timeout.connect(on_timeout)
            timeout_timer.start()

            try:
                # Request completions from Gemini
                self.progress.emit("Waiting for Gemini response...")
                response = self._client.generate_content(
                    prompt,
                    timeout=self._timeout_ms / 1000
                )

                timeout_timer.stop()

                if self._is_cancelled:
                    result = AsyncCompletionResult(
                        status=CompletionStatus.CANCELLED,
                        request_id=self._current_request_id
                    )
                    self.completion_ready.emit(result)
                    return

                # Parse Gemini response into completions
                completions = self._parse_gemini_response(response)

                self.progress.emit(
                    f"Got {len(completions) if completions else 0} completions from Gemini"
                )

                result = AsyncCompletionResult(
                    status=CompletionStatus.COMPLETED,
                    completions=completions,
                    request_id=self._current_request_id,
                    elapsed_ms=self._timeout_ms
                )
                self.completion_ready.emit(result)

            except TimeoutError:
                timeout_timer.stop()
                error_msg = f"Gemini request timed out after {self._timeout_ms}ms"
                logger.error(error_msg)
                self.error_occurred.emit(error_msg)

                result = AsyncCompletionResult(
                    status=CompletionStatus.TIMEOUT,
                    error=error_msg,
                    request_id=self._current_request_id
                )
                self.completion_ready.emit(result)

        except Exception as e:
            error_msg = f"Error fetching completions: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self.error_occurred.emit(error_msg)

            result = AsyncCompletionResult(
                status=CompletionStatus.FAILED,
                error=error_msg,
                request_id=self._current_request_id
            )
            self.completion_ready.emit(result)

    def cancel_request(self) -> None:
        """Cancel the current request."""
        self._is_cancelled = True
        self.progress.emit("Cancelling request...")

    def _create_completion_prompt(self, code_context: str,
                                 cursor_line: str) -> str:
        """Create a prompt for Gemini completion."""
        return f"""Given this JPE code context, suggest the next logical code completion.

Context:
{code_context}

Current line:
{cursor_line}

Suggest 3-5 most likely code completions that would follow. Format as a JSON array with objects containing:
- text: the completion text
- type: completion type (property, value, template)
- description: brief description

Return ONLY the JSON array, no other text."""

    def _parse_gemini_response(self, response: str) -> Optional[List]:
        """
        Parse Gemini response into completions.

        Args:
            response: Raw Gemini response text

        Returns:
            List of completion candidates or None
        """
        if not response:
            return None

        try:
            import json
            # Try to extract JSON from response
            import re
            match = re.search(r'\[.*\]', response, re.DOTALL)
            if match:
                json_str = match.group(0)
                data = json.loads(json_str)
                # Convert to CompletionCandidate objects
                from ai.intelligent_completion import CompletionCandidate, CompletionType
                candidates = []
                for item in data:
                    try:
                        completion_type = CompletionType[item.get('type', 'VALUE').upper()]
                    except KeyError:
                        completion_type = CompletionType.VALUE

                    candidate = CompletionCandidate(
                        text=item.get('text', ''),
                        type=completion_type,
                        confidence=float(item.get('confidence', 0.8)),
                        context_match=float(item.get('context_match', 0.7)),
                        description=item.get('description', '')
                    )
                    candidates.append(candidate)
                return candidates
        except Exception as e:
            logger.error(f"Error parsing Gemini response: {e}")

        return None


class AsyncGeminiCompletionManager(QObject):
    """
    Manager for async Gemini completions.

    Provides:
    - Worker thread management
    - Request queuing
    - Result caching
    - Cancellation
    """

    # Signals
    completions_ready = Signal(AsyncCompletionResult)
    progress = Signal(str)
    error = Signal(str)

    def __init__(self, gemini_client: Optional[object] = None,
                 timeout_ms: int = 5000) -> None:
        """
        Initialize manager.

        Args:
            gemini_client: GeminiClient instance
            timeout_ms: Request timeout
        """
        super().__init__()
        self._client = gemini_client
        self._timeout_ms = timeout_ms
        self._worker: Optional[GeminiCompletionWorker] = None
        self._thread: Optional[QThread] = None
        self._cache: dict = {}
        self._last_request_id: Optional[str] = None

    def set_client(self, client: object) -> None:
        """Set or update the Gemini client."""
        self._client = client

    def request_completions(self, code_context: str, cursor_line: str) -> str:
        """
        Request completions asynchronously.

        Args:
            code_context: Code context
            cursor_line: Current line

        Returns:
            Request ID for tracking
        """
        if not self._client:
            self.error.emit("Gemini client not configured")
            return ""

        request_id = f"req_{id(self)}"
        self._last_request_id = request_id

        # Check cache
        cache_key = f"{code_context}:{cursor_line}"
        if cache_key in self._cache:
            cached_result = self._cache[cache_key]
            cached_result.request_id = request_id
            self.completions_ready.emit(cached_result)
            return request_id

        # Initialize worker if needed
        if not self._worker:
            self._init_worker()

        # Emit progress
        self.progress.emit("Requesting completions from Gemini...")

        # Request completions
        self._worker.fetch_completions(code_context, cursor_line, request_id)

        return request_id

    def cancel_request(self, request_id: Optional[str] = None) -> None:
        """
        Cancel a completion request.

        Args:
            request_id: Request ID to cancel (or last request if None)
        """
        if request_id is None:
            request_id = self._last_request_id

        if self._worker:
            self._worker.cancel_request()

    def clear_cache(self) -> None:
        """Clear result cache."""
        self._cache.clear()

    def _init_worker(self) -> None:
        """Initialize worker thread."""
        self._worker = GeminiCompletionWorker(self._client, self._timeout_ms)
        self._thread = QThread()

        self._worker.moveToThread(self._thread)
        self._worker.completion_ready.connect(self._on_completion_ready)
        self._worker.progress.connect(self.progress.emit)
        self._worker.error_occurred.connect(self.error.emit)

        self._thread.started.connect(lambda: None)  # Thread ready
        self._thread.start()

        logger.debug("Async completion worker initialized")

    def _on_completion_ready(self, result: AsyncCompletionResult) -> None:
        """Handle completion result."""
        if result.status == CompletionStatus.COMPLETED and result.completions:
            # Cache successful results
            cache_key = f"{result.request_id}"
            self._cache[cache_key] = result

        self.completions_ready.emit(result)

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
