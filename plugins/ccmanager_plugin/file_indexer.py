"""File Indexing system for CC Manager."""

import os
import hashlib
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime


class CCFileIndexer:
    """Indexes Sims 4 files and calculates unique signatures."""
    
    def __init__(self, base_paths: List[Path]):
        self.base_paths = base_paths
        self.index: Dict[str, Dict] = {}
        
    def scan(self) -> Dict[str, Dict]:
        """Scan all base paths and build index."""
        for path in self.base_paths:
            if not path.exists():
                continue
                
            for root, _, files in os.walk(path):
                for file in files:
                    if file.endswith(('.package', '.ts4script')):
                        full_path = Path(root) / file
                        self._index_file(full_path)
        return self.index
        
    def _index_file(self, file_path: Path):
        """Add a single file to the index with metadata."""
        stats = file_path.stat()
        rel_path = str(file_path) # Use absolute or relative?
        
        self.index[rel_path] = {
            "name": file_path.name,
            "extension": file_path.suffix,
            "size": stats.st_size,
            "modified_at": datetime.fromtimestamp(stats.st_mtime).isoformat(),
            "hash": self._calculate_hash(file_path)
        }
        
    def _calculate_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of a file."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            # Read in chunks to handle large mod files
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
