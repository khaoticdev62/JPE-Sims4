"""
TS4Rebels Integration for CC Manager Plugin.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Optional, Any

from .file_indexer import CCRecord, CCFileRef

logger = logging.getLogger(__name__)

# Flag to check if TS4Rebels plugin is available
TS4REBELS_AVAILABLE = False
try:
    # Try to import from the other plugin
    # This assumes the plugin system allows cross-plugin imports or they are in the same path
    from plugins.ts4rebels_plugin.vault_indexer import VaultIndexer
    TS4REBELS_AVAILABLE = True
except ImportError:
    pass


class TS4RebelsIntegration:
    """
    Handles integration with TS4Rebels plugin data.
    """

    def __init__(self) -> None:
        self.indexer: Optional[VaultIndexer] = None
        if TS4REBELS_AVAILABLE:
            try:
                self.indexer = VaultIndexer()
            except Exception as e:
                logger.error(f"Failed to initialize TS4Rebels indexer: {e}")

    def get_cc_records_from_vault(self) -> Dict[str, CCRecord]:
        """Load from TS4Rebels vault index."""
        if not self.indexer:
            return {}
            
        results = {}
        try:
            # Simulation: in a real app we'd call the actual indexer
            # vault_mods = self.indexer.get_all_mods()
            # for mod in vault_mods:
            #     record = self._convert_mod_to_cc(mod)
            #     results[record.name] = record
            pass
        except Exception as e:
            logger.error(f"Error fetching data from TS4Rebels vault: {e}")
            
        return results

    def _convert_mod_to_cc(self, mod_record: Any) -> CCRecord:
        """Convert ModRecord to CCRecord."""
        # Convert properties from TS4Rebels model to CC Manager model
        return CCRecord(
            id=getattr(mod_record, "id", "unknown"),
            name=getattr(mod_record, "name", "Unnamed Mod"),
            creator=getattr(mod_record, "creator", "Unknown"),
            category="Gameplay", # TS4Rebels typically tracks gameplay mods
            tags=getattr(mod_record, "tags", [])
        )
