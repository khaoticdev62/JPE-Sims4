"""CC Manager Plugin for JPE Sims 4 Mod Translator."""

from __future__ import annotations
from typing import List, Dict, Any
from pathlib import Path

from plugins.base import BasePlugin, PluginContext
from diagnostics.errors import EngineError
from .config import CCManagerConfig
from .file_indexer import CCFileIndexer
from .metadata_extractor import CCMetadataExtractor


class CCManagerPlugin(BasePlugin):
    """Plugin for organizing and managing Sims 4 CC and Mods."""
    
    plugin_id = "jpe.ccmanager"
    plugin_version = "0.1.0"
    
    def __init__(self, config: CCManagerConfig = None):
        self.config = config or CCManagerConfig()
        self.indexer = CCFileIndexer([Path(p) for p in self.config.scan_paths])
        self.extractor = CCMetadataExtractor()
        self.index: Dict[str, Any] = {}
        self.is_active = False
        
    def initialize(self):
        """Perform initial scan."""
        if self.config.auto_index:
            self.index = self.indexer.scan()
            
    def apply(self, context: PluginContext) -> List[EngineError]:
        """Apply CC management logic to the current project context."""
        return []
        
    def get_ui(self):
        """Return the browser UI widget."""
        from .cc_browser_ui import CCBrowserWidget
        from .viewfinder_widget import ViewfinderWidget
        
        browser = CCBrowserWidget(self.index)
        viewfinder = ViewfinderWidget()
        
        # Connect browser selection to viewfinder update
        def on_file_selected(path):
            metadata = self.extractor.extract(Path(path))
            viewfinder.update_info(path, metadata)
            
        browser.file_selected.connect(on_file_selected)
        
        # Integration into a splitter or layout would happen in the main app
        return browser, viewfinder
