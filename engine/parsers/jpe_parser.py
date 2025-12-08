from __future__ import annotations

import re
from pathlib import Path
from typing import List, Dict, Any, Optional

from engine.ir import (
    ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant,
    Buff, Trait, EnumDefinition, EnumOption, TestSet, TestCondition, TestOperand,
    LootAction, StatisticModifier, LocalizedString, ResourceCategory
)
import sys
from pathlib import Path
# Add the parent directory to the path to allow imports
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity, ErrorPosition


class JpeParser:
    """Parse JPE (plain-English) source files into intermediate representation."""

    def parse_project(self, root: Path) -> tuple[ProjectIR, List[EngineError]]:
        """Parse all JPE files in the given project directory.

        Returns a tuple of (project_ir, errors).
        """
        errors: List[EngineError] = []

        # Find all .jpe files in the project root
        jpe_files = list(root.rglob("*.jpe"))

        if not jpe_files:
            errors.append(EngineError(
                code="NO_JPE_FILES",
                category=ErrorCategory.PARSER_JPE,
                severity=ErrorSeverity.WARNING,
                message_short="No .jpe files found in project directory",
                message_long=f"No .jpe files were found in {root}. Make sure your project contains .jpe source files.",
                suggested_fix="Create .jpe files in your project directory with the required Sims 4 mod definitions.",
                file_path=str(root)
            ))

        # Initialize the project IR with default metadata
        project_metadata = ProjectMetadata(
            name=root.name,
            project_id=root.name,
            version="0.0.0"
        )
        project_ir = ProjectIR(metadata=project_metadata)

        # Parse each JPE file
        for file_path in jpe_files:
            try:
                file_content = file_path.read_text(encoding="utf-8")
                file_errors = self._parse_file(file_content, file_path, project_ir)
                errors.extend(file_errors)
            except UnicodeDecodeError as e:
                errors.append(EngineError(
                    code="ENCODING_ERROR",
                    category=ErrorCategory.IO_FILE,
                    severity=ErrorSeverity.ERROR,
                    message_short=f"File encoding error in: {file_path}",
                    message_long=f"Could not decode file with UTF-8 encoding: {str(e)}",
                    suggested_fix="Ensure the file is saved with UTF-8 encoding.",
                    file_path=str(file_path)
                ))
            except Exception as e:
                errors.append(EngineError(
                    code="IO_ERROR",
                    category=ErrorCategory.IO_FILE,
                    severity=ErrorSeverity.ERROR,
                    message_short=f"Failed to read file: {file_path}",
                    message_long=str(e),
                    suggested_fix="Check file permissions and that the file is not corrupted.",
                    file_path=str(file_path)
                ))

        return project_ir, errors

    def _parse_file(self, content: str, file_path: Path, project_ir: ProjectIR) -> List[EngineError]:
        """Parse a single JPE file and add its content to the project IR."""
        errors: List[EngineError] = []

        # Simple line-by-line parsing for initial implementation
        lines = content.splitlines()

        current_section: Optional[str] = None
        current_element: Optional[Dict[str, Any]] = None

        for line_num, line in enumerate(lines, 1):
            stripped = line.strip()

            # Skip empty lines and comments
            if not stripped or stripped.startswith("#"):
                continue

            # Check for section headers like [Interactions], [Buffs], [Traits], etc.
            section_match = re.match(r'^\[(\w+)\]$', stripped)
            if section_match:
                current_section = section_match.group(1).lower()
                current_element = None
                continue

            # Parse key-value pairs
            kv_match = re.match(r'^(\w+):\s*(.*)', stripped)
            if kv_match:
                key = kv_match.group(1).lower()
                value = kv_match.group(2).strip()

                if current_section == "project":
                    self._parse_project_metadata(key, value, project_ir)
                elif current_section == "interactions":
                    current_element = self._parse_interaction_line(key, value, current_element)
                    # If we have a complete interaction, add it to the project
                    if key == "end" and current_element is not None:
                        try:
                            interaction = self._create_interaction_from_dict(current_element)
                            project_ir.interactions.append(interaction)
                        except Exception as e:
                            errors.append(EngineError(
                                code="INTERACTION_CREATION_ERROR",
                                category=ErrorCategory.PARSER_JPE,
                                severity=ErrorSeverity.ERROR,
                                message_short="Error creating interaction",
                                message_long=str(e),
                                file_path=str(file_path),
                                position=ErrorPosition(line=line_num),
                                suggested_fix="Check the interaction definition syntax."
                            ))
                        current_element = None
                    elif key == "id" and current_element is not None and not value.strip():
                        errors.append(EngineError(
                            code="EMPTY_INTERACTION_ID",
                            category=ErrorCategory.PARSER_JPE,
                            severity=ErrorSeverity.ERROR,
                            message_short="Interaction ID is empty",
                            message_long="Interaction must have a non-empty ID",
                            file_path=str(file_path),
                            position=ErrorPosition(line=line_num),
                            suggested_fix="Provide a valid ID for the interaction."
                        ))
                elif current_section == "buffs":
                    current_element = self._parse_buff_line(key, value, current_element)
                    if key == "end" and current_element is not None:
                        try:
                            buff = self._create_buff_from_dict(current_element)
                            project_ir.buffs.append(buff)
                        except Exception as e:
                            errors.append(EngineError(
                                code="BUFF_CREATION_ERROR",
                                category=ErrorCategory.PARSER_JPE,
                                severity=ErrorSeverity.ERROR,
                                message_short="Error creating buff",
                                message_long=str(e),
                                file_path=str(file_path),
                                position=ErrorPosition(line=line_num),
                                suggested_fix="Check the buff definition syntax."
                            ))
                        current_element = None
                    elif key == "id" and current_element is not None and not value.strip():
                        errors.append(EngineError(
                            code="EMPTY_BUFF_ID",
                            category=ErrorCategory.PARSER_JPE,
                            severity=ErrorSeverity.ERROR,
                            message_short="Buff ID is empty",
                            message_long="Buff must have a non-empty ID",
                            file_path=str(file_path),
                            position=ErrorPosition(line=line_num),
                            suggested_fix="Provide a valid ID for the buff."
                        ))
                elif current_section == "traits":
                    current_element = self._parse_trait_line(key, value, current_element)
                    if key == "end" and current_element is not None:
                        try:
                            trait = self._create_trait_from_dict(current_element)
                            project_ir.traits.append(trait)
                        except Exception as e:
                            errors.append(EngineError(
                                code="TRAIT_CREATION_ERROR",
                                category=ErrorCategory.PARSER_JPE,
                                severity=ErrorSeverity.ERROR,
                                message_short="Error creating trait",
                                message_long=str(e),
                                file_path=str(file_path),
                                position=ErrorPosition(line=line_num),
                                suggested_fix="Check the trait definition syntax."
                            ))
                        current_element = None
                    elif key == "id" and current_element is not None and not value.strip():
                        errors.append(EngineError(
                            code="EMPTY_TRAIT_ID",
                            category=ErrorCategory.PARSER_JPE,
                            severity=ErrorSeverity.ERROR,
                            message_short="Trait ID is empty",
                            message_long="Trait must have a non-empty ID",
                            file_path=str(file_path),
                            position=ErrorPosition(line=line_num),
                            suggested_fix="Provide a valid ID for the trait."
                        ))
                elif current_section == "enums":
                    current_element = self._parse_enum_line(key, value, current_element)
                    if key == "end" and current_element is not None:
                        try:
                            enum_def = self._create_enum_from_dict(current_element)
                            project_ir.enums.append(enum_def)
                        except Exception as e:
                            errors.append(EngineError(
                                code="ENUM_CREATION_ERROR",
                                category=ErrorCategory.PARSER_JPE,
                                severity=ErrorSeverity.ERROR,
                                message_short="Error creating enum",
                                message_long=str(e),
                                file_path=str(file_path),
                                position=ErrorPosition(line=line_num),
                                suggested_fix="Check the enum definition syntax."
                            ))
                        current_element = None
                    elif key == "id" and current_element is not None and not value.strip():
                        errors.append(EngineError(
                            code="EMPTY_ENUM_ID",
                            category=ErrorCategory.PARSER_JPE,
                            severity=ErrorSeverity.ERROR,
                            message_short="Enum ID is empty",
                            message_long="Enum must have a non-empty ID",
                            file_path=str(file_path),
                            position=ErrorPosition(line=line_num),
                            suggested_fix="Provide a valid ID for the enum."
                        ))
                elif current_section == "strings":
                    current_element = self._parse_string_line(key, value, current_element)
                    if key == "end" and current_element is not None:
                        try:
                            string = self._create_string_from_dict(current_element)
                            project_ir.localized_strings.append(string)
                        except Exception as e:
                            errors.append(EngineError(
                                code="STRING_CREATION_ERROR",
                                category=ErrorCategory.PARSER_JPE,
                                severity=ErrorSeverity.ERROR,
                                message_short="Error creating string",
                                message_long=str(e),
                                file_path=str(file_path),
                                position=ErrorPosition(line=line_num),
                                suggested_fix="Check the string definition syntax."
                            ))
                        current_element = None
                    elif key == "key" and current_element is not None and not value.strip():
                        errors.append(EngineError(
                            code="EMPTY_STRING_KEY",
                            category=ErrorCategory.PARSER_JPE,
                            severity=ErrorSeverity.ERROR,
                            message_short="String key is empty",
                            message_long="String must have a non-empty key",
                            file_path=str(file_path),
                            position=ErrorPosition(line=line_num),
                            suggested_fix="Provide a valid key for the string."
                        ))
                # Add more sections as needed
            else:
                # If the line doesn't match expected patterns, report it as an error
                errors.append(EngineError(
                    code="INVALID_SYNTAX",
                    category=ErrorCategory.PARSER_JPE,
                    severity=ErrorSeverity.WARNING,
                    message_short="Invalid syntax in JPE file",
                    message_long=f"Line {line_num} does not match expected format: {stripped}",
                    file_path=str(file_path),
                    position=ErrorPosition(line=line_num),
                    suggested_fix="Check the syntax and make sure it follows the JPE format."
                ))

        return errors

    def _parse_project_metadata(self, key: str, value: str, project_ir: ProjectIR) -> None:
        """Parse project metadata fields."""
        if key == "name":
            project_ir.metadata.name = value
        elif key == "id":
            project_ir.metadata.project_id = value
        elif key == "version":
            project_ir.metadata.version = value
        elif key == "author":
            project_ir.metadata.author = value

    def _parse_interaction_line(self, key: str, value: str, current_element: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse a line in the interactions section."""
        if current_element is None:
            current_element = {}

        if key == "id":
            current_element['id'] = ResourceId(name=value)
        elif key == "display_name":
            current_element['display_name_key'] = value
        elif key == "description":
            current_element['description_key'] = value
        elif key == "participant":
            participants = current_element.get('participants', [])
            # Parse participant format: "role:Actor, description:Does the action"
            parts = [part.strip() for part in value.split(',')]
            participant_data = {}
            for part in parts:
                if ':' in part:
                    sub_key, sub_value = part.split(':', 1)
                    participant_data[sub_key.strip()] = sub_value.strip()
            participants.append(InteractionParticipant(
                role=participant_data.get('role', ''),
                description=participant_data.get('description')
            ))
            current_element['participants'] = participants
        elif key == "autonomy_disabled":
            current_element['autonomy_disabled'] = value.lower() == 'true'

        return current_element

    def _create_interaction_from_dict(self, data: Dict[str, Any]) -> Interaction:
        """Create an Interaction instance from parsed data."""
        return Interaction(
            id=data.get('id', ResourceId(name='default')),
            display_name_key=data.get('display_name_key'),
            description_key=data.get('description_key'),
            participants=data.get('participants', []),
            tests=data.get('tests', []),
            loot_actions=data.get('loot_actions', []),
            autonomy_disabled=data.get('autonomy_disabled', False)
        )

    def _parse_buff_line(self, key: str, value: str, current_element: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse a line in the buffs section."""
        if current_element is None:
            current_element = {}

        if key == "id":
            current_element['id'] = ResourceId(name=value)
        elif key == "display_name":
            current_element['display_name_key'] = value
        elif key == "description":
            current_element['description_key'] = value
        elif key == "duration":
            try:
                current_element['duration_sim_minutes'] = int(value)
            except ValueError:
                pass  # Could add error handling here
        elif key == "trait":
            traits = current_element.get('traits', [])
            traits.append(value)
            current_element['traits'] = traits

        return current_element

    def _create_buff_from_dict(self, data: Dict[str, Any]) -> Buff:
        """Create a Buff instance from parsed data."""
        return Buff(
            id=data.get('id', ResourceId(name='default')),
            display_name_key=data.get('display_name_key'),
            description_key=data.get('description_key'),
            traits=data.get('traits', []),
            duration_sim_minutes=data.get('duration_sim_minutes')
        )

    def _parse_trait_line(self, key: str, value: str, current_element: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse a line in the traits section."""
        if current_element is None:
            current_element = {}

        if key == "id":
            current_element['id'] = ResourceId(name=value)
        elif key == "display_name":
            current_element['display_name_key'] = value
        elif key == "description":
            current_element['description_key'] = value
        elif key == "buff":
            buffs = current_element.get('buffs', [])
            # For now, just add a basic ResourceId with the name
            buffs.append(ResourceId(name=value))
            current_element['buffs'] = buffs

        return current_element

    def _create_trait_from_dict(self, data: Dict[str, Any]) -> Trait:
        """Create a Trait instance from parsed data."""
        return Trait(
            id=data.get('id', ResourceId(name='default')),
            display_name_key=data.get('display_name_key'),
            description_key=data.get('description_key'),
            buffs=data.get('buffs', [])
        )

    def _parse_enum_line(self, key: str, value: str, current_element: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse a line in the enums section."""
        if current_element is None:
            current_element = {}

        if key == "id":
            current_element['id'] = ResourceId(name=value)
        elif key == "option":
            # Parse option in format "name:value" or "name=value"
            options = current_element.get('options', [])
            # Try to split by : or = to separate name and value
            if ':' in value:
                option_name, option_value = value.split(':', 1)
            elif '=' in value:
                option_name, option_value = value.split('=', 1)
            else:
                option_name = value
                option_value = len(options)  # Default to sequential value
            try:
                # Try to parse as integer first
                parsed_value = int(option_value)
            except ValueError:
                # If not an integer, keep as string
                parsed_value = option_value
            options.append(EnumOption(name=option_name.strip(), value=parsed_value))
            current_element['options'] = options

        return current_element

    def _create_enum_from_dict(self, data: Dict[str, Any]) -> EnumDefinition:
        """Create an EnumDefinition instance from parsed data."""
        return EnumDefinition(
            id=data.get('id', ResourceId(name='default')),
            options=data.get('options', [])
        )

    def _parse_string_line(self, key: str, value: str, current_element: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse a line in the strings section."""
        if current_element is None:
            current_element = {}

        if key == "key":
            current_element['key'] = value
        elif key == "text":
            current_element['text'] = value
        elif key == "locale":
            current_element['locale'] = value

        return current_element

    def _create_string_from_dict(self, data: Dict[str, Any]) -> LocalizedString:
        """Create a LocalizedString instance from parsed data."""
        return LocalizedString(
            key=data.get('key', ''),
            text=data.get('text', ''),
            locale=data.get('locale', 'en_US')
        )
