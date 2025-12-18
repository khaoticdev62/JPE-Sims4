"""Metadata enrichment for TS4Rebels mods using manifest files."""

import json
import csv
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List

from .vault_indexer import ModRecord

@dataclass
class ManifestEntry:
    file_name: str
    creator: str
    category: str
    source_url: str | None = None
    tags: List[str] | None = None
    pack: str | None = None

class ManifestLoader:
    """Loads manifest entries from JSON and CSV files."""
    def __init__(self, manifest_paths: List[Path]):
        self.manifest_paths = manifest_paths

    def load_manifests(self) -> List[ManifestEntry]:
        entries = []
        for path in self.manifest_paths:
            if path.suffix.lower() == ".json":
                entries.extend(self._parse_json(path))
            elif path.suffix.lower() == ".csv":
                entries.extend(self._parse_csv(path))
        return entries

    def _parse_json(self, path: Path) -> List[ManifestEntry]:
        with open(path, "r") as f:
            data = json.load(f)
            if isinstance(data, list):
                return [ManifestEntry(**entry) for entry in data]
            elif isinstance(data, dict):
                return [ManifestEntry(**entry) for entry in data.values()]
        return []

    def _parse_csv(self, path: Path) -> List[ManifestEntry]:
        entries = []
        with open(path, "r", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Normalize tags from a comma-separated string to a list
                if 'tags' in row and isinstance(row['tags'], str):
                    row['tags'] = [tag.strip() for tag in row['tags'].split(',')]
                entries.append(ManifestEntry(**row))
        return entries

class MetadataMapper:
    """Merges manifest entries into ModRecord instances."""

    def __init__(self, manifest_paths: List[Path]) -> None:
        loader = ManifestLoader(manifest_paths)
        manifest_entries = loader.load_manifests()
        self._by_filename: Dict[str, ManifestEntry] = {
            entry.file_name.lower(): entry for entry in manifest_entries
        }

    def apply(self, mods: Iterable[ModRecord]) -> List[ModRecord]:
        enriched: List[ModRecord] = []
        for mod in mods:
            matched_entry = None
            for f in mod.files:
                key = Path(f.relative_path).name.lower()
                if key in self._by_filename:
                    matched_entry = self._by_filename[key]
                    break
            
            if matched_entry:
                self._normalize_and_apply(mod, matched_entry)

            enriched.append(mod)
        return enriched

    def _normalize_and_apply(self, mod: ModRecord, entry: ManifestEntry):
        # Normalize creator name (e.g., to title case)
        if entry.creator:
            mod.creator = entry.creator.strip().title()

        # Normalize category (map to a fixed set)
        if entry.category:
            category_map = {
                "cas": "CAS",
                "buildbuy": "BuildBuy",
                "gameplay": "Gameplay",
                "overhaul": "Overhaul",
                "utility": "Utility",
            }
            mod.category = category_map.get(entry.category.lower().strip(), "Other")

        # Normalize tags (tokenize, deduplicate, and sort)
        if entry.tags:
            mod.tags = sorted(list(set(tag.strip().lower() for tag in entry.tags)))
        
        # You can enrich other fields here as well
        if entry.source_url:
            mod.source_url = entry.source_url
        if entry.pack:
            mod.pack = entry.pack
