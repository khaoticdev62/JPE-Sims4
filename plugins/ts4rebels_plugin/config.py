"""Configuration model and validation for the TS4Rebels plugin."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import List

@dataclass
class Ts4RebelsConfig:
    vault_path: Path
    vault_structure_preset: str
    manifest_paths: List[Path] = field(default_factory=list)
    diagnostics_retention_days: int = 30
    redact_local_paths_in_exports: bool = True
    redact_username_in_exports: bool = True
    exclude_non_ts4rebels_mods_from_exports: bool = True
    conflict_ruleset: str = "balanced"

    def validate(self) -> None:
        if not self.vault_path.is_dir():
            raise ValueError(f"Vault path does not exist or is not a directory: {self.vault_path}")
        if self.vault_structure_preset not in {"flat", "by_creator", "by_pack", "mixed"}:
            raise ValueError(f"Invalid vault_structure_preset: {self.vault_structure_preset}")
        if self.conflict_ruleset not in {"conservative", "balanced", "aggressive"}:
            raise ValueError(f"Invalid conflict_ruleset: {self.conflict_ruleset}")
        for path in self.manifest_paths:
            if not path.is_file():
                raise ValueError(f"Manifest file does not exist: {path}")
        if self.diagnostics_retention_days < 1:
            raise ValueError("diagnostics_retention_days must be >= 1")
