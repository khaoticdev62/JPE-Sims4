"""Batch processing system for JPE Studio.

Enables processing multiple mod files in sequence with progress tracking,
error recovery, and comprehensive reporting.
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
from typing import Callable, List, Dict, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
import queue

from engine.engine import TranslationEngine, EngineConfig
from diagnostics.errors import BuildReport
from ui.jpe_branding import (
    BRAND_ACCENT,
    DIAGNOSTIC_SUCCESS,
    DIAGNOSTIC_ERROR,
    DIAGNOSTIC_WARNING,
    NEUTRAL_700,
    NEUTRAL_500,
    get_platform_font,
)


class BatchOperation(Enum):
    """Types of batch operations."""

    VALIDATE = "validate"
    PARSE = "parse"
    BUILD = "build"
    CONVERT = "convert"


@dataclass
class BatchFile:
    """Single file in batch operation."""

    path: Path
    status: str = "pending"  # pending, processing, completed, failed
    error_message: str = ""
    warnings: List[str] = field(default_factory=list)
    output_path: Optional[Path] = None
    duration: float = 0.0
    result: Optional[Dict] = None


@dataclass
class BatchJob:
    """Configuration for batch operation."""

    operation: BatchOperation
    files: List[Path]
    output_directory: Optional[Path] = None
    options: Dict = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)

    def __post_init__(self):
        self.batch_files = [BatchFile(path=f) for f in self.files]


class BatchProcessor:
    """Batch processing engine for multiple mod files."""

    def __init__(self):
        """Initialize batch processor."""
        self.current_job: Optional[BatchJob] = None
        self.is_running = False
        self.worker_thread: Optional[threading.Thread] = None
        self.progress_queue = queue.Queue()

        # Engine
        self.engine_config = EngineConfig(strict_mode=True)
        self.engine = TranslationEngine(self.engine_config)

        # Callbacks
        self.on_progress: Optional[Callable] = None
        self.on_complete: Optional[Callable] = None
        self.on_file_complete: Optional[Callable] = None

        # Statistics
        self.stats = {
            "files_processed": 0,
            "files_successful": 0,
            "files_failed": 0,
            "total_duration": 0.0,
            "start_time": None,
        }

    def process_batch(self, job: BatchJob) -> None:
        """Start processing a batch job.

        Args:
            job: BatchJob configuration
        """
        if self.is_running:
            raise RuntimeError("Batch processor already running")

        self.current_job = job
        self.is_running = True
        self.stats["start_time"] = time.time()

        self.worker_thread = threading.Thread(
            target=self._process_worker,
            daemon=True
        )
        self.worker_thread.start()

    def cancel(self) -> None:
        """Cancel current batch operation."""
        self.is_running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=2)

    def _process_worker(self) -> None:
        """Background worker for batch processing."""
        if not self.current_job:
            return

        job = self.current_job
        batch_files = job.batch_files

        for index, batch_file in enumerate(batch_files):
            if not self.is_running:
                break

            try:
                # Update status
                batch_file.status = "processing"
                self._emit_progress(index, batch_files)

                # Process file based on operation
                start_time = time.time()

                if job.operation == BatchOperation.VALIDATE:
                    self._process_validate(batch_file, job)
                elif job.operation == BatchOperation.PARSE:
                    self._process_parse(batch_file, job)
                elif job.operation == BatchOperation.BUILD:
                    self._process_build(batch_file, job)
                elif job.operation == BatchOperation.CONVERT:
                    self._process_convert(batch_file, job)

                batch_file.duration = time.time() - start_time
                batch_file.status = "completed"
                self.stats["files_successful"] += 1

            except Exception as e:
                batch_file.status = "failed"
                batch_file.error_message = str(e)
                self.stats["files_failed"] += 1

            finally:
                self.stats["files_processed"] += 1
                if self.on_file_complete:
                    self.on_file_complete(batch_file)
                self._emit_progress(index + 1, batch_files)

        # Mark as complete
        self.is_running = False
        self.stats["total_duration"] = time.time() - self.stats["start_time"]

        if self.on_complete:
            self.on_complete(job)

    def _process_validate(self, batch_file: BatchFile, job: BatchJob) -> None:
        """Validate a single file.

        Args:
            batch_file: File to validate
            job: Batch job configuration
        """
        if not batch_file.path.exists():
            raise FileNotFoundError(f"File not found: {batch_file.path}")

        with open(batch_file.path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse and validate
        ir = self.engine.parse_jpe(content, str(batch_file.path))
        errors = self.engine.validate(ir)

        batch_file.warnings = [str(e) for e in errors]
        batch_file.result = {
            "valid": len(errors) == 0,
            "error_count": len(errors)
        }

    def _process_parse(self, batch_file: BatchFile, job: BatchJob) -> None:
        """Parse a single JPE file.

        Args:
            batch_file: File to parse
            job: Batch job configuration
        """
        if not batch_file.path.exists():
            raise FileNotFoundError(f"File not found: {batch_file.path}")

        with open(batch_file.path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse
        ir = self.engine.parse_jpe(content, str(batch_file.path))

        batch_file.result = {
            "parsed": True,
            "interactions": len(ir.interactions) if hasattr(ir, 'interactions') else 0
        }

    def _process_build(self, batch_file: BatchFile, job: BatchJob) -> None:
        """Build a single mod file.

        Args:
            batch_file: File to build
            job: Batch job configuration
        """
        if not batch_file.path.exists():
            raise FileNotFoundError(f"File not found: {batch_file.path}")

        with open(batch_file.path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse, validate, and generate
        ir = self.engine.parse_jpe(content, str(batch_file.path))
        errors = self.engine.validate(ir)

        if errors:
            batch_file.warnings = [str(e) for e in errors]

        # Generate output
        xml_output = self.engine.generate_xml(ir)

        # Save output
        if job.output_directory:
            output_dir = Path(job.output_directory)
            output_dir.mkdir(parents=True, exist_ok=True)

            output_path = output_dir / batch_file.path.with_suffix('.xml').name
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(xml_output)

            batch_file.output_path = output_path

        batch_file.result = {
            "built": True,
            "output_file": str(batch_file.output_path) if batch_file.output_path else None
        }

    def _process_convert(self, batch_file: BatchFile, job: BatchJob) -> None:
        """Convert a single file between formats.

        Args:
            batch_file: File to convert
            job: Batch job configuration
        """
        source_format = job.options.get("source_format", "jpe")
        target_format = job.options.get("target_format", "xml")

        if not batch_file.path.exists():
            raise FileNotFoundError(f"File not found: {batch_file.path}")

        with open(batch_file.path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Convert based on formats
        if source_format == "jpe" and target_format == "xml":
            ir = self.engine.parse_jpe(content, str(batch_file.path))
            output = self.engine.generate_xml(ir)
            output_suffix = ".xml"
        else:
            raise ValueError(f"Unsupported conversion: {source_format} -> {target_format}")

        # Save converted file
        if job.output_directory:
            output_dir = Path(job.output_directory)
            output_dir.mkdir(parents=True, exist_ok=True)

            output_path = output_dir / batch_file.path.with_suffix(output_suffix).name
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(output)

            batch_file.output_path = output_path

        batch_file.result = {
            "converted": True,
            "from_format": source_format,
            "to_format": target_format,
            "output_file": str(batch_file.output_path) if batch_file.output_path else None
        }

    def _emit_progress(self, current: int, total: int) -> None:
        """Emit progress update.

        Args:
            current: Current file index
            total: Total file count
        """
        if self.on_progress:
            progress = (current / total * 100) if total > 0 else 0
            self.on_progress(progress, current, total)

    def get_statistics(self) -> Dict:
        """Get processing statistics.

        Returns:
            Dictionary with statistics
        """
        return self.stats.copy()

    def get_report(self) -> Optional[Dict]:
        """Generate batch processing report.

        Returns:
            Report dictionary
        """
        if not self.current_job:
            return None

        return {
            "operation": self.current_job.operation.value,
            "total_files": len(self.current_job.batch_files),
            "successful": self.stats["files_successful"],
            "failed": self.stats["files_failed"],
            "duration": self.stats["total_duration"],
            "files": [
                {
                    "path": str(f.path),
                    "status": f.status,
                    "duration": f.duration,
                    "error": f.error_message,
                    "warnings": f.warnings,
                    "output": str(f.output_path) if f.output_path else None,
                }
                for f in self.current_job.batch_files
            ]
        }


class BatchProcessorUI(ttk.Frame):
    """UI for batch processor with progress and status display."""

    def __init__(self, parent, processor: Optional[BatchProcessor] = None):
        """Initialize batch processor UI.

        Args:
            parent: Parent widget
            processor: Optional BatchProcessor instance
        """
        super().__init__(parent)

        self.processor = processor or BatchProcessor()
        self.current_job: Optional[BatchJob] = None

        # Set up callbacks
        self.processor.on_progress = self._on_progress
        self.processor.on_file_complete = self._on_file_complete
        self.processor.on_complete = self._on_complete

        self._create_ui()

    def _create_ui(self):
        """Create the UI elements."""
        # Title
        title_label = ttk.Label(
            self,
            text="Batch Processing",
            font=(get_platform_font(), 14, "bold"),
            foreground=BRAND_ACCENT
        )
        title_label.pack(fill=tk.X, padx=10, pady=(10, 5))

        # Progress bar
        self.progress_var = tk.DoubleVar()
        progress_bar = ttk.Progressbar(
            self,
            variable=self.progress_var,
            maximum=100,
            mode='determinate'
        )
        progress_bar.pack(fill=tk.X, padx=10, pady=5)

        # Status label
        self.status_label = ttk.Label(
            self,
            text="Ready",
            font=(get_platform_font(), 10),
            foreground=NEUTRAL_700
        )
        self.status_label.pack(fill=tk.X, padx=10, pady=5)

        # Files list
        list_frame = ttk.Frame(self)
        list_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=5)

        # Tree view for file status
        self.tree = ttk.Treeview(
            list_frame,
            columns=("status", "duration"),
            height=10
        )
        self.tree.column("#0", width=300)
        self.tree.column("status", width=100)
        self.tree.column("duration", width=100)

        self.tree.heading("#0", text="File")
        self.tree.heading("status", text="Status")
        self.tree.heading("duration", text="Duration")

        scrollbar = ttk.Scrollbar(list_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=scrollbar.set)

        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

    def process_files(self, files: List[Path], operation: BatchOperation,
                     output_dir: Optional[Path] = None, options: Optional[Dict] = None) -> None:
        """Start processing a batch of files.

        Args:
            files: List of file paths
            operation: Type of operation
            output_dir: Optional output directory
            options: Optional operation-specific options
        """
        self.current_job = BatchJob(
            operation=operation,
            files=files,
            output_directory=output_dir,
            options=options or {}
        )

        # Clear tree
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Add files to tree
        for batch_file in self.current_job.batch_files:
            self.tree.insert("", tk.END, text=batch_file.path.name,
                           values=("pending", ""))

        # Start processing
        self.processor.process_batch(self.current_job)

    def _on_progress(self, progress: float, current: int, total: int) -> None:
        """Handle progress update."""
        self.progress_var.set(progress)
        self.status_label.config(
            text=f"Processing: {current}/{total} files"
        )

    def _on_file_complete(self, batch_file: BatchFile) -> None:
        """Handle file completion."""
        # Find tree item
        for item in self.tree.get_children():
            if self.tree.item(item)['text'] == batch_file.path.name:
                status_icon = "✓" if batch_file.status == "completed" else "✗"
                self.tree.item(item, values=(
                    f"{status_icon} {batch_file.status}",
                    f"{batch_file.duration:.2f}s"
                ))
                break

    def _on_complete(self, job: BatchJob) -> None:
        """Handle batch completion."""
        stats = self.processor.get_statistics()
        self.status_label.config(
            text=f"Complete: {stats['files_successful']} successful, {stats['files_failed']} failed"
        )
