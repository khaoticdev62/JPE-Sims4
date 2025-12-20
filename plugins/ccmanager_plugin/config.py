"""
Configuration for CC Manager Plugin.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class CCManagerConfig:
    """Configuration for the CC Manager plugin."""
    
    cc_paths: List[str] = field(default_factory=list)
    metadata_sources: List[str] = field(default_factory=list)
    use_ts4rebels_index: bool = True
    cache_enabled: bool = True
    cache_ttl_hours: int = 24
    default_view_mode: str = "tree"
    show_thumbnails: bool = True
    extract_package_metadata: bool = False
    fallback_to_filename_parsing: bool = True

    def validate(self) -> bool:
        """Validate the configuration."""
        if not isinstance(self.cc_paths, list):
            return False
        if not isinstance(self.metadata_sources, list):
            return False
        if self.cache_ttl_hours < 0:
            return False
        return True

    @classmethod
    def from_dict(cls, data: dict) -> CCManagerConfig:
        """Create config from dictionary."""
        return cls(
            cc_paths=data.get("cc_paths", []),
            metadata_sources=data.get("metadata_sources", []),
            use_ts4rebels_index=data.get("use_ts4rebels_index", True),
            cache_enabled=data.get("cache_enabled", True),
            cache_ttl_hours=data.get("cache_ttl_hours", 24),
            default_view_mode=data.get("default_view_mode", "tree"),
            show_thumbnails=data.get("show_thumbnails", True),
            extract_package_metadata=data.get("extract_package_metadata", False),
            fallback_to_filename_parsing=data.get("fallback_to_filename_parsing", True)
        )

    def to_dict(self) -> dict:
        """Convert config to dictionary."""
        return {
            "cc_paths": self.cc_paths,
            "metadata_sources": self.metadata_sources,
            "use_ts4rebels_index": self.use_ts4rebels_index,
            "cache_enabled": self.cache_enabled,
            "cache_ttl_hours": self.cache_ttl_hours,
            "default_view_mode": self.default_view_mode,
            "show_thumbnails": self.show_thumbnails,
            "extract_package_metadata": self.extract_package_metadata,
            "fallback_to_filename_parsing": self.fallback_to_filename_parsing
        }
