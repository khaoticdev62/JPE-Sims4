"""Translation orchestration for TS4Rebels mods."""

from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Dict, Iterable, List

from .vault_indexer import ModRecord
from engine.engine import TranslationEngine, EngineConfig
from diagnostics.errors import EngineError


class TranslationMode(str, Enum):
    NORMAL = "normal"
    DRY_RUN = "dry_run"

@dataclass
class TranslationResult:
    mod_id: str
    status: str
    message: str
    errors: List[EngineError]

@dataclass
class TranslationRun:
    id: str
    mode: TranslationMode
    results: Dict[str, TranslationResult]

    def failed_mods(self) -> List[TranslationResult]:
        return [r for r in self.results.values() if r.status != "success"]

class TranslationOrchestrator:
    """Coordinates JPE core translation for TS4Rebels mods."""

    def __init__(self, vault_root: Path, output_root: Path) -> None:
        self.vault_root = vault_root
        self.output_root = output_root
        # Initialize the JPE TranslationEngine
        # For now, using a default EngineConfig. This might need to be configurable later.
        self.engine = TranslationEngine(config=EngineConfig())

    def run_translation(self, mods: Iterable[ModRecord], mode: TranslationMode) -> TranslationRun:
        # In a real implementation this would call into JPE core services.
        results: Dict[str, TranslationResult] = {}
        for mod in mods:
            input_files = [self.vault_root / Path(f.relative_path) for f in mod.files]
            
            mod_output_path = self.output_root / "ts4rebels" / mod.id.replace(":", "_")

            try:
                report = self.engine.build_from_jpe(
                    input_files=input_files,
                    output_path=mod_output_path,
                    dry_run=(mode == TranslationMode.DRY_RUN)
                )
                
                if report.success:
                    status = "success"
                    message = f"Translation completed successfully for {mod.name}."
                else:
                    status = "failed"
                    message = f"Translation failed for {mod.name}. See errors."

                results[mod.id] = TranslationResult(
                    mod_id=mod.id,
                    status=status,
                    message=message,
                    errors=report.errors
                )

            except Exception as e:
                results[mod.id] = TranslationResult(
                    mod_id=mod.id,
                    status="failed",
                    message=f"An unexpected error occurred during translation for {mod.name}: {e}",
                    errors=[EngineError(message=str(e), file_path=Path(""))] # Generic error
                )
        return TranslationRun(id="ts4rebels-run", mode=mode, results=results)
