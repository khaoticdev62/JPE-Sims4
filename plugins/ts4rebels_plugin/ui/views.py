"""UI view models for the TS4Rebels plugin.

These definitions can be bound into the main JPE desktop UI framework.
"""

from dataclasses import dataclass
from typing import List

@dataclass
class VaultSummaryViewModel:
    vault_path: str
    total_mods: int
    total_files: int
    last_scan: str

@dataclass
class ModRowViewModel:
    id: str
    name: str
    creator: str | None
    category: str | None
    file_count: int
    last_updated: str
    translation_status: str
    issue_count: int

@dataclass
class IssueRowViewModel:
    id: str
    severity: str
    status: str
    summary: str
    mod_name: str
    updated_at: str

# Binding to a concrete UI toolkit is handled elsewhere.
