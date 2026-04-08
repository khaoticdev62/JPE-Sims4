import os
from ..models.mod import Mod
from ..utils.hashing import sha256_file
from ..resource_extractor import ResourceExtractor

SUPPORTED_EXT = {".package", ".ts4script", ".py", ".xml", ".stbl"}


class VaultScanner:
    def __init__(self, index_store, run_store):
        self.index = index_store
        self.runs = run_store

    def scan(self, mode="full"):
        vault = self.index.get_vault_path()
        mods = {}

        for root, _, files in os.walk(vault):
            for f in files:
                ext = os.path.splitext(f)[1].lower()
                if ext not in SUPPORTED_EXT:
                    continue
                path = os.path.join(root, f)
                size = os.path.getsize(path)
                mtime = os.path.getmtime(path)
                file_hash = sha256_file(path) if size < 256_000_000 else None

                mod_key = os.path.basename(root)
                if mod_key not in mods:
                    mods[mod_key] = Mod(mod_id=mod_key, name=mod_key)

                mods[mod_key].files.append(
                    {
                        "path": path,
                        "size": size,
                        "mtime": mtime,
                        "hash": file_hash,
                        "resources": [],  # Placeholder for deep scan
                    }
                )

        self.index.update_mods(list(mods.values()))
        return {"mods_indexed": len(mods)}

    def deep_scan(self):
        """Extract resource IDs and tuning signatures from all package files."""
        from jpe_sims4.mis.fingerprint import FingerprintEngine

        fingerprinter = FingerprintEngine()
        mods = self.index.list_mods()

        for mod in mods:
            # Handle both list of dicts and list of objects
            mod_files = getattr(mod, "files", []) or (
                mod.get("files", []) if isinstance(mod, dict) else []
            )

            for file_info in mod_files:
                path = file_info.get("path")
                if path and path.endswith(".package"):
                    resources = ResourceExtractor.extract_resource_keys(path)

                    # For each resource, try to extract a signature if it's a tuning type
                    for res in resources:
                        # Heuristic: Type 0x03B33DDF (Interaction), 0x6017E9F1 (Buff), etc.
                        # For simplicity, we'll try to extract signature for common tuning types
                        rtype = int(res["type"], 16)
                        if rtype in {
                            0x03B33DDF,  # Interaction
                            0x6017E9F1,  # Buff
                            0x70456D79,  # Snippet (alternative)
                            0x738E6C56,  # Snippet
                            0x545E67AD,  # Commodity
                            0x00000000,
                        }:
                            content = ResourceExtractor.get_resource_content(path, res)
                            if content:
                                try:
                                    xml_str = content.decode("utf-8", errors="ignore")
                                    sig = fingerprinter.extract_tuning_signatures(
                                        xml_str
                                    )
                                    if sig:
                                        res["signature"] = list(sig)[0]
                                except Exception:
                                    pass

                    file_info["resources"] = resources

        self.index.update_mods(mods)
        return {"mods_deep_scanned": len(mods)}
