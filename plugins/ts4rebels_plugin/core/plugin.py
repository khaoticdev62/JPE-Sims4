from ..services.scanner import VaultScanner
from ..services.translator import TranslatorService
from ..services.conflicts import ConflictDetector
from ..services.exporter import ExportService
from ..storage.index_store import IndexStore
from ..storage.issue_store import IssueStore
from ..storage.run_store import RunStore

from ... import Plugin


class TS4RebelsPlugin(Plugin):
    def name(self) -> str:
        return "TS4Rebels Integration"

    def version(self) -> str:
        return "1.0.0"

    def description(self) -> str:
        return "Integrates with local TS4Rebels mod vaults."

    def __init__(self):
        self.index = IndexStore()
        self.issues = IssueStore()
        self.runs = RunStore()
        self.scanner = VaultScanner(self.index, self.runs)
        self.translator = TranslatorService(self.index, self.runs, self.issues)
        self.conflicts = ConflictDetector(self.index, self.issues)
        self.exporter = ExportService(self.issues, self.runs)

    def on_startup(self, context):
        self.index.initialize()

    def on_shutdown(self, context):
        pass

    def on_scan_requested(self, mode="full"):
        return self.scanner.scan(mode)

    def on_translation_requested(self, mod_ids, mode="normal"):
        return self.translator.translate(mod_ids, mode)

    def on_export_requested(self, issue_ids, fmt, destination):
        return self.exporter.export(issue_ids, fmt, destination)
