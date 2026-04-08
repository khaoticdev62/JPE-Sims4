"""
Sync Queue for JPE Sims 4 Mod Translator.

Handles persistence of pending sync operations for offline support.
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime


@dataclass
class QueuedOperation:
    """Represents a pending sync operation."""
    id: str
    operation_type: str  # "upload", "download", "delete"
    project_id: str
    file_path: str
    content: Optional[str] = None
    created_at: str = ""
    retry_count: int = 0

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()


class SyncQueue:
    """Manages a persistent queue of sync operations."""
    
    def __init__(self, queue_file: Path):
        self.queue_file = queue_file
        self.pending_ops: List[QueuedOperation] = []
        self._load_queue()
    
    def _load_queue(self):
        """Load pending operations from disk."""
        if self.queue_file.exists():
            try:
                data = json.loads(self.queue_file.read_text(encoding='utf-8'))
                self.pending_ops = [QueuedOperation(**op) for op in data]
            except Exception:
                self.pending_ops = []
    
    def _save_queue(self):
        """Save pending operations to disk."""
        self.queue_file.parent.mkdir(parents=True, exist_ok=True)
        data = [asdict(op) for op in self.pending_ops]
        self.queue_file.write_text(json.dumps(data, indent=2), encoding='utf-8')
    
    def add_operation(self, op: QueuedOperation):
        """Add an operation to the queue."""
        self.pending_ops.append(op)
        self._save_queue()
    
    def get_pending(self) -> List[QueuedOperation]:
        """Get all pending operations."""
        return self.pending_ops
    
    def remove_operation(self, op_id: str):
        """Remove an operation from the queue by ID."""
        self.pending_ops = [op for op in self.pending_ops if op.id != op_id]
        self._save_queue()
    
    def clear(self):
        """Clear the queue."""
        self.pending_ops = []
        self._save_queue()
