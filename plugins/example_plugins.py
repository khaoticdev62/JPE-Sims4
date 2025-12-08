"""Example plugins for JPE Sims 4 Mod Translator."""

from pathlib import Path
from typing import List
import json

from ..engine.ir import ProjectIR, Interaction, Buff, Trait, EnumDefinition, LocalizedString, ProjectMetadata
from ..diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity
from ..plugins import TransformPlugin, GeneratorPlugin


class ExampleTransformPlugin(TransformPlugin):
    """Example transform plugin that adds metadata to the project."""
    
    def name(self) -> str:
        return "Metadata Enhancer Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "Automatically adds build metadata to projects"
    
    def transform(self, ir: ProjectIR) -> tuple[ProjectIR, List[EngineError]]:
        """Add build timestamp to the project metadata."""
        errors: List[EngineError] = []
        
        # Add a timestamp to the project metadata
        from datetime import datetime
        timestamp = datetime.now().isoformat()
        
        # Add to extra metadata if it exists, or create it
        if not ir.metadata.author:
            ir.metadata.author = "Enhanced by Metadata Plugin"
        
        # Return the modified IR and any errors
        return ir, errors


class ExampleValidationPlugin(TransformPlugin):
    """Example transform plugin that validates the project structure."""
    
    def name(self) -> str:
        return "Structure Validator Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "Validates project structure and adds warnings for potential issues"
    
    def transform(self, ir: ProjectIR) -> tuple[ProjectIR, List[EngineError]]:
        """Validate project structure and add warnings."""
        errors: List[EngineError] = []
        
        # Check for interactions without display names
        for interaction in ir.interactions:
            if not interaction.display_name_key:
                errors.append(EngineError(
                    code="MISSING_DISPLAY_NAME",
                    category=ErrorCategory.VALIDATION_SEMANTIC,
                    severity=ErrorSeverity.WARNING,
                    message_short="Interaction missing display name",
                    message_long=f"Interaction {interaction.id.name} does not have a display name",
                    suggested_fix="Add a display_name field to your interaction definition.",
                    resource_id=interaction.id.name
                ))
        
        # Check for buffs without descriptions
        for buff in ir.buffs:
            if not buff.description_key:
                errors.append(EngineError(
                    code="MISSING_DESCRIPTION",
                    category=ErrorCategory.VALIDATION_SEMANTIC,
                    severity=ErrorSeverity.WARNING,
                    message_short="Buff missing description",
                    message_long=f"Buff {buff.id.name} does not have a description",
                    suggested_fix="Add a description field to your buff definition.",
                    resource_id=buff.id.name
                ))
        
        return ir, errors


class MarkdownExportPlugin(GeneratorPlugin):
    """Example generator plugin that exports project documentation as markdown."""
    
    def name(self) -> str:
        return "Markdown Export Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "Exports project documentation as markdown files"
    
    def supported_formats(self) -> List[str]:
        return ["markdown", "md"]
    
    def generate(self, ir: ProjectIR, target_directory: Path) -> List[EngineError]:
        """Generate markdown documentation for the project."""
        errors: List[EngineError] = []
        
        try:
            # Create target directory if it doesn't exist
            (target_directory / "docs").mkdir(parents=True, exist_ok=True)
            
            # Generate main project documentation
            md_content = f"# {ir.metadata.name}\n\n"
            md_content += f"**Project ID:** {ir.metadata.project_id}\n"
            md_content += f"**Version:** {ir.metadata.version}\n\n"
            
            if ir.metadata.author:
                md_content += f"**Author:** {ir.metadata.author}\n\n"
            
            # Document interactions
            if ir.interactions:
                md_content += "## Interactions\n\n"
                for interaction in ir.interactions:
                    md_content += f"### {interaction.id.name}\n"
                    if interaction.display_name_key:
                        md_content += f"- **Display Name:** {interaction.display_name_key}\n"
                    if interaction.description_key:
                        md_content += f"- **Description:** {interaction.description_key}\n"
                    md_content += f"- **Participants:** {len(interaction.participants)}\n\n"
            
            # Document buffs
            if ir.buffs:
                md_content += "## Buffs\n\n"
                for buff in ir.buffs:
                    md_content += f"### {buff.id.name}\n"
                    if buff.display_name_key:
                        md_content += f"- **Display Name:** {buff.display_name_key}\n"
                    if buff.description_key:
                        md_content += f"- **Description:** {buff.description_key}\n"
                    if buff.duration_sim_minutes is not None:
                        md_content += f"- **Duration:** {buff.duration_sim_minutes} min\n"
                    md_content += "\n"
            
            # Document traits
            if ir.traits:
                md_content += "## Traits\n\n"
                for trait in ir.traits:
                    md_content += f"### {trait.id.name}\n"
                    if trait.display_name_key:
                        md_content += f"- **Display Name:** {trait.display_name_key}\n"
                    if trait.description_key:
                        md_content += f"- **Description:** {trait.description_key}\n"
                    md_content += f"- **Buffs:** {len(trait.buffs)}\n\n"
            
            # Document enums
            if ir.enums:
                md_content += "## Enums\n\n"
                for enum_def in ir.enums:
                    md_content += f"### {enum_def.id.name}\n"
                    for option in enum_def.options:
                        md_content += f"- {option.name}: {option.value}\n"
                    md_content += "\n"
            
            # Document strings
            if ir.localized_strings:
                md_content += "## Localized Strings\n\n"
                for string in ir.localized_strings[:10]:  # Limit to first 10 for brevity
                    md_content += f"- **{string.key}:** {string.text}\n"
                if len(ir.localized_strings) > 10:
                    md_content += f"\n... and {len(ir.localized_strings) - 10} more strings\n\n"
            
            # Write the markdown file
            md_file = target_directory / "docs" / f"{ir.metadata.project_id}_documentation.md"
            md_file.write_text(md_content)
            
        except Exception as e:
            errors.append(EngineError(
                code="MARKDOWN_GENERATION_ERROR",
                category=ErrorCategory.PLUGIN,
                severity=ErrorSeverity.ERROR,
                message_short="Error generating markdown documentation",
                message_long=str(e)
            ))
        
        return errors