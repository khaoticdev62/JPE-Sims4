"""Plugin manager for JPE Sims 4 Mod Translator."""

import importlib
import pkgutil
from pathlib import Path
from typing import List, Dict, Type, Protocol, Optional

from . import Plugin, ParserPlugin, GeneratorPlugin, TransformPlugin


class PluginManager:
    """Manages loading and accessing plugins."""
    
    def __init__(self, plugins_path: Optional[Path] = None):
        self._plugins: List[Plugin] = []
        self._parser_plugins: List[ParserPlugin] = []
        self._generator_plugins: List[GeneratorPlugin] = []
        self._transform_plugins: List[TransformPlugin] = []
        
        # If no specific path provided, look in the plugins directory
        if plugins_path is None:
            plugins_path = Path(__file__).parent
        
        self._load_plugins_from_directory(plugins_path)
    
    def _load_plugins_from_directory(self, directory: Path) -> None:
        """Load plugins from a directory."""
        # Add the directory to sys.path temporarily to import plugins
        import sys
        original_path = sys.path[:]
        sys.path.insert(0, str(directory))
        
        try:
            # Find all modules in the directory
            for importer, modname, ispkg in pkgutil.iter_modules([str(directory)]):
                if modname.startswith('__'):
                    continue
                    
                try:
                    module = importlib.import_module(modname)
                    self._load_plugins_from_module(module)
                except ImportError:
                    # If we can't import a module, skip it
                    continue
        finally:
            # Restore original path
            sys.path[:] = original_path
    
    def _load_plugins_from_module(self, module) -> None:
        """Load plugins from a module."""
        # Look for plugin instances in the module
        for attr_name in dir(module):
            if attr_name.startswith('_'):
                continue
                
            attr = getattr(module, attr_name)
            
            # Check if it's a plugin instance
            if hasattr(attr, 'name') and callable(getattr(attr, 'name')):
                if isinstance(attr, Plugin):
                    self._register_plugin(attr)
            
            # Check if it's a plugin class that we can instantiate
            elif isinstance(attr, type) and attr != Plugin and attr != ParserPlugin and attr != GeneratorPlugin and attr != TransformPlugin:
                try:
                    # Check if it implements one of the plugin protocols
                    if issubclass(attr, ParserPlugin):
                        plugin_instance = attr()
                        self._register_plugin(plugin_instance)
                    elif issubclass(attr, GeneratorPlugin):
                        plugin_instance = attr()
                        self._register_plugin(plugin_instance)
                    elif issubclass(attr, TransformPlugin):
                        plugin_instance = attr()
                        self._register_plugin(plugin_instance)
                except TypeError:
                    # If we can't instantiate it, skip it
                    continue
                except Exception:
                    # If instantiation fails for any other reason, skip it
                    continue
    
    def _register_plugin(self, plugin: Plugin) -> None:
        """Register a plugin instance."""
        self._plugins.append(plugin)
        
        if isinstance(plugin, ParserPlugin):
            self._parser_plugins.append(plugin)
        elif isinstance(plugin, GeneratorPlugin):
            self._generator_plugins.append(plugin)
        elif isinstance(plugin, TransformPlugin):
            self._transform_plugins.append(plugin)
    
    def get_all_plugins(self) -> List[Plugin]:
        """Get all registered plugins."""
        return self._plugins[:]
    
    def get_parser_plugins(self) -> List[ParserPlugin]:
        """Get all parser plugins."""
        return self._parser_plugins[:]
    
    def get_generator_plugins(self) -> List[GeneratorPlugin]:
        """Get all generator plugins."""
        return self._generator_plugins[:]
    
    def get_transform_plugins(self) -> List[TransformPlugin]:
        """Get all transform plugins."""
        return self._transform_plugins[:]
    
    def get_plugin_by_name(self, name: str) -> Optional[Plugin]:
        """Get a plugin by its name."""
        for plugin in self._plugins:
            if plugin.name() == name:
                return plugin
        return None