"""Vault indexing for TS4Rebels mods."""

import os
import json
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable, List

@dataclass
class FileRef:
    id: str
    relative_path: str
    file_type: str
    size_bytes: int
    modified_at: float

@dataclass
class ModRecord:
    id: str
    name: str
    creator: str | None
    category: str | None
    files: List[FileRef]

class VaultIndexer:
    """Walks the configured vault and builds a list of mods and files."""

    def __init__(self, vault_root: Path, structure_preset: str = "mixed") -> None:
        self.vault_root = vault_root
        self.structure_preset = structure_preset
        self.index_path = self.vault_root / ".jpe_cache" / "ts4rebels_index.json"

    def load_index(self) -> List[ModRecord]:
        """Load the mod index from the cache."""
        if not self.index_path.exists():
            return []
        
        with open(self.index_path, "r") as f:
            data = json.load(f)
            return [ModRecord(**mod_data) for mod_data in data]

    def save_index(self, index: List[ModRecord]):
        """Save the mod index to the cache."""
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.index_path, "w") as f:
            json.dump([asdict(mod) for mod in index], f, indent=2)

    def full_scan(self) -> List[ModRecord]:
        """Perform a full recursive scan of the vault."""
        if not self.vault_root.is_dir():
            raise ValueError(f"Vault root is not a directory: {self.vault_root}")

        mods: dict[str, ModRecord] = {}
        for path in self._iter_supported_files():
            rel = path.relative_to(self.vault_root)
            
            mod_id, mod_name, creator, category = self._get_mod_identity(rel)

            if mod_id not in mods:
                mods[mod_id] = ModRecord(
                    id=mod_id,
                    name=mod_name,
                    creator=creator,
                    category=category,
                    files=[],
                )
            
            file_ref = FileRef(
                id=f"{mod_id}:{rel}",
                relative_path=str(rel),
                file_type=self._detect_type(path),
                size_bytes=path.stat().st_size,
                modified_at=path.stat().st_mtime,
            )
            mods[mod_id].files.append(file_ref)
        
        index = list(mods.values())
        self.save_index(index)
        return index

    def incremental_scan(self) -> dict:
        """
        Performs an incremental scan of the vault and returns a summary of changes.
        """
        old_index = self.load_index()
        new_index = self.full_scan()

        old_files = {file.relative_path: file for mod in old_index for file in mod.files}
        new_files = {file.relative_path: file for mod in new_index for file in mod.files}

        added_files = new_files.keys() - old_files.keys()
        deleted_files = old_files.keys() - new_files.keys()
        
        updated_files = set()
        for path in old_files.keys() & new_files.keys():
            if old_files[path].modified_at < new_files[path].modified_at:
                updated_files.add(path)

        return {
            "added": list(added_files),
            "deleted": list(deleted_files),
            "updated": list(updated_files),
        }

    def _get_mod_identity(self, rel_path: Path) -> (str, str, str | None, str | None):
        if self.structure_preset == "flat":
            mod_name = self.vault_root.name
            mod_id = f"ts4rebels:{mod_name}"
            return mod_id, mod_name, None, None
        
        if len(rel_path.parts) > 1:
            top_level_dir = rel_path.parts[0]
            mod_name = top_level_dir
            mod_id = f"ts4rebels:{mod_name}"

            if self.structure_preset == "by_creator":
                return mod_id, mod_name, mod_name, None
            elif self.structure_preset == "by_pack":
                return mod_id, mod_name, None, mod_name
            else: # mixed or default
                return mod_id, mod_name, None, None
        else:
            mod_name = "root"
            mod_id = f"ts4rebels:{mod_name}"
            return mod_id, mod_name, None, None

    def _iter_supported_files(self) -> Iterable[Path]:
        exts = {".package", ".ts4script", ".py", ".xml"}
        for root, _, files in os.walk(self.vault_root):
            root_path = Path(root)
            for name in files:
                path = root_path / name
                if path.suffix.lower() in exts:
                    yield path

    def _detect_type(self, path: Path) -> str:
        ext = path.suffix.lower()
        if ext == ".package":
            return "package"
        if ext == ".ts4script":
            return "ts4script"
        if ext == ".py":
            return "script"
        if ext == ".xml":
            return "xml"
        return "other"
