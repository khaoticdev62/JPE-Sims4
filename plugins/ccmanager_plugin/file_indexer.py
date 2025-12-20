"""
File Indexer for CC Manager Plugin.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import List, Dict, Optional, Any, Set
from datetime import datetime

logger = logging.getLogger(__name__)


@dataclass
class CCFileRef:
    """Individual file reference."""
    id: str
    relative_path: str
    file_type: str  # "package", "ts4script", "image", "other"
    size_bytes: int
    modified_at: str
    creator: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = field(default_factory=list)
    thumbnail_path: Optional[str] = None


@dataclass
class CCRecord:
    """CC item/mod record."""
    id: str
    name: str
    creator: Optional[str] = None
    category: str = "Uncategorized"
    tags: List[str] = field(default_factory=list)
    files: List[CCFileRef] = field(default_factory=list)
    source_url: Optional[str] = None
    total_size: int = 0
    last_modified: str = ""


import hashlib
try:
    import jpe_engine_native as native
    NATIVE_AVAILABLE = True
except ImportError:
    NATIVE_AVAILABLE = False

from jpe_studio_qt.db.cc_vault import CCVault

class CCFileIndexer:
    """
    Scans directories and builds index of CC files using SQLite backend.
    """

    SUPPORTED_EXTENSIONS = {
        ".package": "package",
        ".ts4script": "ts4script",
        ".png": "image",
        ".jpg": "image",
        ".jpeg": "image",
        ".gif": "image",
        ".bmp": "image"
    }

    def __init__(self, cc_paths: List[str], db_path: Optional[Path] = None) -> None:
        self.cc_paths = [Path(p) for p in cc_paths if p]
        self.vault = CCVault(db_path)
        self.records: Dict[str, CCRecord] = {}

    def full_scan(self, incremental: bool = True) -> Dict[str, CCRecord]:
        """Scan all CC directories and sync with SQLite vault."""
        self.records.clear()
        
        batch_records = []
        batch_files = []
        
        for root_path in self.cc_paths:
            if not root_path.exists():
                continue
            
            # --- PERFORMANCE OVERHAUL: Native Acceleration ---
            if NATIVE_AVAILABLE:
                logger.info(f"Using native scanner for {root_path}")
                files_meta = native.fast_scan_directory(str(root_path))
                # files_meta is a list of NativeFileMetadata objects
            else:
                # Fallback to Python scanning
                files_meta = []
                for file_path in self._iter_cc_files(root_path):
                    stat = file_path.stat()
                    files_meta.append(type('obj', (object,), {
                        'path': str(file_path),
                        'size': stat.st_size,
                        'mtime': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        'file_type': self._detect_type(file_path)
                    }))

            for meta in files_meta:
                file_path = Path(meta.path)
                rel_path = str(file_path.relative_to(root_path))
                mtime = meta.mtime
                size = meta.size
                
                # INCREMENTAL SYNC: Skip if already indexed and unchanged
                if incremental:
                    existing = self.vault.get_file_metadata(rel_path)
                    if existing and existing['modified_at'] == mtime and existing['size_bytes'] == size:
                        continue

                file_type = meta.file_type
                record_name = file_path.stem
                record_id = hashlib.md5(rel_path.encode()).hexdigest()
                
                creator, category = self._infer_identity(file_path, root_path)
                
                batch_files.append({
                    "id": record_id + "_f",
                    "record_id": record_id,
                    "relative_path": rel_path,
                    "file_type": file_type,
                    "size_bytes": size,
                    "modified_at": mtime
                })
                
                batch_records.append({
                    "id": record_id,
                    "name": record_name,
                    "creator": creator,
                    "category": category or "Uncategorized",
                    "thumbnail_path": None,
                    "source_url": None,
                    "total_size": size,
                    "last_modified": mtime,
                    "tags": ""
                })

        # Commit batches to SQLite
        if batch_records:
            self.vault.update_record_batch(batch_records)
            self.vault.update_file_batch(batch_files)
            logger.info(f"Vault synced: {len(batch_records)} entries updated.")

        # Load results back for UI
        rows = self.vault.get_all_records()
        for row in rows:
            rec = CCRecord(
                id=row['id'],
                name=row['name'],
                creator=row['creator'],
                category=row['category'],
                total_size=row['total_size'],
                last_modified=row['last_modified'],
                tags=row['tags'].split(',') if row['tags'] else []
            )
            self.records[row['name']] = rec
            
        return self.records

    def load_index(self) -> bool:
        """Legacy support - now handled by SQLite on init."""
        return True

    def save_index(self) -> bool:
        """Legacy support - now handled by batch commits."""
        return True
