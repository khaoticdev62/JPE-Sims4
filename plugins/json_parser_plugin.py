"""Example parser plugin for JPE Sims 4 Mod Translator."""

from pathlib import Path
from typing import List

from ..engine.ir import ProjectIR
from ..diagnostics.errors import EngineError
from . import ParserPlugin


class JsonParserPlugin(ParserPlugin):
    """Example parser plugin that can parse JSON format."""
    
    def name(self) -> str:
        return "JSON Parser Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "Parses JSON files containing mod definitions"
    
    def supported_extensions(self) -> List[str]:
        return [".json"]
    
    def parse(self, file_path: Path) -> tuple[ProjectIR, List[EngineError]]:
        from ..engine.ir import ProjectMetadata
        errors: List[EngineError] = []

        # Create a minimal ProjectIR
        project_ir = ProjectIR(
            metadata=ProjectMetadata(
                name=f"JSON Project from {file_path.name}",
                project_id=file_path.stem,
                version="1.0.0"
            )
        )

        # In a real implementation, we would parse the JSON file
        # and populate the ProjectIR with the parsed data
        # For now, return an empty project with a warning
        errors.append(EngineError(
            code="NOT_IMPLEMENTED",
            message_short="JSON parsing not implemented",
            message_long="JSON parsing functionality is not yet implemented in this plugin.",
            severity="warning",
            category="parser"
        ))

        return project_ir, errors