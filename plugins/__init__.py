"""Plugin system for JPE Sims 4 Mod Translator."""

from typing import Protocol, List, Any
from pathlib import Path

import sys
from pathlib import Path
# Add the parent directory to the path to allow imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from engine.ir import ProjectIR
from diagnostics.errors import EngineError


class Plugin(Protocol):
    """Base protocol for all plugins."""
    
    def name(self) -> str:
        """Return the plugin's name."""
        ...
    
    def version(self) -> str:
        """Return the plugin's version."""
        ...
    
    def description(self) -> str:
        """Return a description of the plugin."""
        ...


class ParserPlugin(Plugin):
    """Plugin for parsing additional file formats."""
    
    def supported_extensions(self) -> List[str]:
        """Return a list of file extensions this parser supports."""
        ...
    
    def parse(self, file_path: Path) -> tuple[ProjectIR, List[EngineError]]:
        """Parse a file and return the ProjectIR and any errors."""
        ...


class GeneratorPlugin(Plugin):
    """Plugin for generating additional output formats."""
    
    def supported_formats(self) -> List[str]:
        """Return a list of output formats this generator supports."""
        ...
    
    def generate(self, ir: ProjectIR, target_directory: Path) -> List[EngineError]:
        """Generate output files based on the IR."""
        ...


class TransformPlugin(Plugin):
    """Plugin for transforming the IR in specific ways."""
    
    def transform(self, ir: ProjectIR) -> tuple[ProjectIR, List[EngineError]]:
        """Transform the IR and return the new IR and any errors."""
        ...