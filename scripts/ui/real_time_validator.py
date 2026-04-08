"""Real-time mod validation system for JPE Studio.

Provides continuous background validation of mod files during editing,
with visual feedback and error/warning indicators.
"""

import tkinter as tk
from tkinter import ttk
import threading
import time
from typing import Callable, List, Dict, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass
import queue

from engine.engine import TranslationEngine, EngineConfig
from diagnostics.errors import ValidationError, ParseError, GenerationError
from ui.jpe_branding import (
    DIAGNOSTIC_ERROR,
    DIAGNOSTIC_WARNING,
    DIAGNOSTIC_INFO,
    DIAGNOSTIC_SUCCESS,
    NEUTRAL_700,
    get_platform_font,
)


@dataclass
class ValidationResult:
    """Result of validation check."""

    file_path: Path
    is_valid: bool
    error_count: int
    warning_count: int
    info_count: int
    errors: List[Dict]
    timestamp: float
    duration: float


class RealTimeValidator:
    """Real-time validation system for mod files.

    Monitors changes to mod files and performs background validation
    with immediate visual feedback in the editor.
    """

    def __init__(self, on_result_callback: Optional[Callable] = None):
        """Initialize the real-time validator.

        Args:
            on_result_callback: Callback function when validation completes
        """
        self.on_result_callback = on_result_callback
        self.validation_queue = queue.Queue()
        self.is_running = False
        self.worker_thread: Optional[threading.Thread] = None

        # Engine configuration
        self.engine_config = EngineConfig(
            strict_mode=True,
            validate_on_parse=True
        )
        self.engine = TranslationEngine(self.engine_config)

        # Validation cache
        self.validation_cache: Dict[Path, ValidationResult] = {}
        self.cache_ttl = 5  # Cache validity in seconds

        # Statistics
        self.stats = {
            "total_validations": 0,
            "successful_validations": 0,
            "failed_validations": 0,
            "average_duration": 0.0,
        }

    def start(self):
        """Start the background validation worker."""
        if not self.is_running:
            self.is_running = True
            self.worker_thread = threading.Thread(
                target=self._validation_worker,
                daemon=True
            )
            self.worker_thread.start()

    def stop(self):
        """Stop the background validation worker."""
        self.is_running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=2)

    def validate_file(self, file_path: Path, priority: int = 0) -> Optional[ValidationResult]:
        """Queue a file for validation.

        Args:
            file_path: Path to file to validate
            priority: Priority level (0=normal, higher=more urgent)

        Returns:
            Validation result if cached, None if queued
        """
        # Check cache
        cached_result = self._get_cached_result(file_path)
        if cached_result:
            return cached_result

        # Queue for validation
        self.validation_queue.put((priority, file_path))
        return None

    def _validation_worker(self):
        """Background worker thread for validation."""
        while self.is_running:
            try:
                # Get next file to validate (with timeout)
                priority, file_path = self.validation_queue.get(timeout=1)

                # Perform validation
                result = self._perform_validation(file_path)

                # Cache result
                self.validation_cache[file_path] = result

                # Update statistics
                self._update_statistics(result)

                # Call callback
                if self.on_result_callback:
                    self.on_result_callback(result)

            except queue.Empty:
                continue
            except Exception as e:
                # Log but continue processing
                print(f"Validation error: {e}")

    def _perform_validation(self, file_path: Path) -> ValidationResult:
        """Perform actual validation of a file.

        Args:
            file_path: Path to file to validate

        Returns:
            ValidationResult with errors and warnings
        """
        start_time = time.time()
        errors = []
        error_count = 0
        warning_count = 0
        info_count = 0

        try:
            # Read file content
            if not file_path.exists():
                return ValidationResult(
                    file_path=file_path,
                    is_valid=False,
                    error_count=1,
                    warning_count=0,
                    info_count=0,
                    errors=[{"message": "File not found", "severity": "error"}],
                    timestamp=start_time,
                    duration=time.time() - start_time
                )

            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Validate JPE syntax
            if file_path.suffix.lower() == '.jpe':
                try:
                    # Parse and validate
                    ir = self.engine.parse_jpe(content, str(file_path))

                    # Validate IR
                    validation_errors = self.engine.validate(ir)

                    if validation_errors:
                        for error in validation_errors:
                            errors.append({
                                "message": str(error),
                                "severity": "warning",
                                "line": getattr(error, 'line', 0)
                            })
                            warning_count += 1
                    else:
                        info_count = 1  # Validation passed

                except ParseError as e:
                    errors.append({
                        "message": f"Parse error: {str(e)}",
                        "severity": "error",
                        "line": getattr(e, 'line', 0)
                    })
                    error_count += 1
                except ValidationError as e:
                    errors.append({
                        "message": f"Validation error: {str(e)}",
                        "severity": "error",
                        "line": getattr(e, 'line', 0)
                    })
                    error_count += 1
                except Exception as e:
                    errors.append({
                        "message": f"Unexpected error: {str(e)}",
                        "severity": "error"
                    })
                    error_count += 1

        except Exception as e:
            errors.append({
                "message": f"Validation failed: {str(e)}",
                "severity": "error"
            })
            error_count += 1

        duration = time.time() - start_time
        is_valid = error_count == 0

        return ValidationResult(
            file_path=file_path,
            is_valid=is_valid,
            error_count=error_count,
            warning_count=warning_count,
            info_count=info_count,
            errors=errors,
            timestamp=start_time,
            duration=duration
        )

    def _get_cached_result(self, file_path: Path) -> Optional[ValidationResult]:
        """Get cached validation result if still valid.

        Args:
            file_path: Path to file

        Returns:
            Cached result if valid, None otherwise
        """
        if file_path not in self.validation_cache:
            return None

        result = self.validation_cache[file_path]
        age = time.time() - result.timestamp

        if age > self.cache_ttl:
            del self.validation_cache[file_path]
            return None

        return result

    def _update_statistics(self, result: ValidationResult):
        """Update validation statistics.

        Args:
            result: Validation result
        """
        self.stats["total_validations"] += 1

        if result.is_valid:
            self.stats["successful_validations"] += 1
        else:
            self.stats["failed_validations"] += 1

        # Update average duration
        total = self.stats["total_validations"]
        old_avg = self.stats["average_duration"]
        new_avg = (old_avg * (total - 1) + result.duration) / total
        self.stats["average_duration"] = new_avg

    def get_statistics(self) -> Dict:
        """Get validation statistics.

        Returns:
            Dictionary with statistics
        """
        return self.stats.copy()


class ValidationIndicator(ttk.Frame):
    """Visual indicator for file validation status."""

    def __init__(self, parent, validator: RealTimeValidator, file_path: Path):
        """Initialize validation indicator.

        Args:
            parent: Parent widget
            validator: RealTimeValidator instance
            file_path: Path to file being validated
        """
        super().__init__(parent)

        self.validator = validator
        self.file_path = file_path
        self.current_result: Optional[ValidationResult] = None

        # Register callback
        self.validator.on_result_callback = self._on_validation_result

        # Create UI
        self._create_ui()

        # Start validation
        self.validator.validate_file(file_path)

    def _create_ui(self):
        """Create the indicator UI."""
        # Status icon
        self.status_label = tk.Label(
            self,
            text="○",
            font=(get_platform_font(), 14, "bold"),
            fg=NEUTRAL_700
        )
        self.status_label.pack(side=tk.LEFT, padx=(5, 10))

        # Status text
        self.text_label = ttk.Label(
            self,
            text="Validating...",
            font=(get_platform_font(), 10)
        )
        self.text_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        # Error/warning count
        self.count_label = ttk.Label(
            self,
            text="",
            font=(get_platform_font(), 9),
            foreground=NEUTRAL_700
        )
        self.count_label.pack(side=tk.RIGHT, padx=(10, 5))

    def _on_validation_result(self, result: ValidationResult):
        """Handle validation result.

        Args:
            result: Validation result
        """
        if result.file_path != self.file_path:
            return

        self.current_result = result
        self._update_display()

    def _update_display(self):
        """Update the indicator display based on current result."""
        if not self.current_result:
            return

        result = self.current_result

        # Determine status and color
        if result.error_count > 0:
            status = "✗"
            color = DIAGNOSTIC_ERROR
            text = f"Errors ({result.error_count})"
        elif result.warning_count > 0:
            status = "⚠"
            color = DIAGNOSTIC_WARNING
            text = f"Warnings ({result.warning_count})"
        else:
            status = "✓"
            color = DIAGNOSTIC_SUCCESS
            text = "Valid"

        # Update display
        self.status_label.config(text=status, fg=color)
        self.text_label.config(text=text)

        # Update count
        total_issues = result.error_count + result.warning_count
        if total_issues > 0:
            self.count_label.config(
                text=f"{result.duration:.2f}s"
            )

    def show_errors(self) -> List[Dict]:
        """Get list of validation errors.

        Returns:
            List of error dictionaries
        """
        if not self.current_result:
            return []

        return self.current_result.errors
