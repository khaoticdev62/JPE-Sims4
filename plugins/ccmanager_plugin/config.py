"""Configuration for CC Manager Plugin."""

from dataclasses import dataclass, field
from typing import List, Set


@dataclass
class CCManagerConfig:
    """Settings for the CC Manager plugin."""
    scan_paths: List[str] = field(default_factory=list)
    ignored_patterns: Set[str] = field(default_factory=lambda: {".*", "desktop.ini", "thumbs.db"})
    extract_previews: bool = True
    preview_cache_dir: str = ".jpe_tmp/previews"
    auto_index: bool = True
