"""
Metadata Extractor for CC Manager Plugin.
"""

from __future__ import annotations

import csv
import json
import logging
from pathlib import Path
from typing import List, Dict, Optional, Any

from .file_indexer import CCRecord

logger = logging.getLogger(__name__)


class MetadataExtractor:
    """
    Enriches CC records with metadata from manifests.
    """

    def __init__(self, sources: List[str]) -> None:
        self.sources = [Path(s) for s in sources if s]
        self.manifest_data: List[Dict[str, Any]] = []
        self._load_manifests()

    def _load_manifests(self) -> None:
        """Load all manifest sources."""
        for source in self.sources:
            if not source.exists():
                continue
                
            if source.suffix.lower() == ".json":
                self._load_json_manifest(source)
            elif source.suffix.lower() == ".csv":
                self._load_csv_manifest(source)

    def _load_json_manifest(self, path: Path) -> None:
        """Parse JSON format manifest."""
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    self.manifest_data.extend(data)
                elif isinstance(data, dict):
                    self.manifest_data.append(data)
        except Exception as e:
            logger.error(f"Failed to load JSON manifest {path}: {e}")

    def _load_csv_manifest(self, path: Path) -> None:
        """Parse CSV format manifest."""
        try:
            with open(path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.manifest_data.append(row)
        except Exception as e:
            logger.error(f"Failed to load CSV manifest {path}: {e}")

    def enrich(self, records: Dict[str, CCRecord]) -> None:
        """Apply metadata to CCRecords."""
        if not self.manifest_data:
            return
            
        for record in records.values():
            # Match by name or ID
            match = self._find_match(record)
            if match:
                record.creator = match.get("creator") or record.creator
                record.category = self._normalize_category(match.get("category") or record.category)
                record.source_url = match.get("url") or match.get("source_url") or record.source_url
                
                tags = match.get("tags", [])
                if isinstance(tags, str):
                    tags = [t.strip() for e in tags.split(",") for t in e.split(" ") if t.strip()]
                
                if tags:
                    record.tags = sorted(list(set(record.tags + tags)))

    def _find_match(self, record: CCRecord) -> Optional[Dict[str, Any]]:
        """Find matching entry in manifest data."""
        for entry in self.manifest_data:
            # Check name match
            if entry.get("name") == record.name:
                return entry
            # Check filename match
            if entry.get("filename") == record.name:
                return entry
        return None

    def _normalize_category(self, category: Optional[str]) -> str:
        """Standardize category names."""
        if not category:
            return "Uncategorized"
            
        cat = category.lower().strip()
        if cat in ["hair", "clothes", "makeup", "skin", "accessory"]:
            return "CAS"
        if cat in ["furniture", "decor", "appliance", "lighting"]:
            return "BuildBuy"
        if cat in ["mod", "script", "tuning"]:
            return "Gameplay"
            
        return category
