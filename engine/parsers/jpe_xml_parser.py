from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable, List, Optional

from engine.ir import (
    ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant,
    Buff, Trait, EnumDefinition, EnumOption, TestSet, TestCondition, TestOperand,
    LootAction, StatisticModifier, LocalizedString
)
import sys
from pathlib import Path
# Add the parent directory to the path to allow imports
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity


class JpeXmlParser:
    """Parse JPE-XML sources into intermediate representation."""

    def parse_files(self, paths: Iterable[Path]) -> tuple[ProjectIR, List[EngineError]]:
        """Parse the given JPE-XML files into a ProjectIR instance."""
        errors: List[EngineError] = []

        # Initialize the project IR
        project_metadata = ProjectMetadata(
            name="default_project",
            project_id="default_project",
            version="0.0.0"
        )
        project_ir = ProjectIR(metadata=project_metadata)

        # Parse each XML file
        for file_path in paths:
            try:
                tree = ET.parse(file_path)
                root = tree.getroot()

                # Validate that this is a JPE-XML document
                if root.tag != 'jpe-project':
                    errors.append(EngineError(
                        code="INVALID_FORMAT",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Invalid JPE-XML format",
                        message_long=f"Root element must be 'jpe-project', got '{root.tag}'",
                        suggested_fix="Ensure the XML file starts with <jpe-project> as the root element.",
                        file_path=str(file_path)
                    ))
                    continue

                # Parse the content
                self._parse_project_element(root, project_ir, file_path, errors)

            except ET.ParseError as e:
                errors.append(EngineError(
                    code="PARSE_ERROR",
                    category=ErrorCategory.PARSER_JPE_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="XML parsing error",
                    message_long=f"XML parsing failed at line {e.lineno}, column {e.offset}: {e.msg}",
                    suggested_fix="Check the XML syntax for well-formedness issues like unclosed tags or invalid characters.",
                    file_path=str(file_path)
                ))
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

    def _parse_project_element(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the root jpe-project element."""
        # Parse project metadata
        project_elem = element.find('project')
        if project_elem is not None:
            self._parse_project_metadata(project_elem, project_ir)

        # Parse different sections
        interactions_elem = element.find('interactions')
        if interactions_elem is not None:
            self._parse_interactions(interactions_elem, project_ir, file_path, errors)

        buffs_elem = element.find('buffs')
        if buffs_elem is not None:
            self._parse_buffs(buffs_elem, project_ir, file_path, errors)

        traits_elem = element.find('traits')
        if traits_elem is not None:
            self._parse_traits(traits_elem, project_ir, file_path, errors)

        enums_elem = element.find('enums')
        if enums_elem is not None:
            self._parse_enums(enums_elem, project_ir, file_path, errors)

        strings_elem = element.find('strings')
        if strings_elem is not None:
            self._parse_strings(strings_elem, project_ir, file_path, errors)

    def _parse_project_metadata(self, element: ET.Element, project_ir: ProjectIR) -> None:
        """Parse the project metadata section."""
        name_elem = element.find('name')
        if name_elem is not None and name_elem.text:
            project_ir.metadata.name = name_elem.text

        id_elem = element.find('id')
        if id_elem is not None and id_elem.text:
            project_ir.metadata.project_id = id_elem.text

        version_elem = element.find('version')
        if version_elem is not None and version_elem.text:
            project_ir.metadata.version = version_elem.text

        author_elem = element.find('author')
        if author_elem is not None and author_elem.text:
            project_ir.metadata.author = author_elem.text

    def _parse_interactions(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the interactions section."""
        for interaction_elem in element.findall('interaction'):
            try:
                interaction = self._parse_interaction(interaction_elem)
                project_ir.interactions.append(interaction)
            except Exception as e:
                errors.append(EngineError(
                    code="INTERACTION_PARSE_ERROR",
                    category=ErrorCategory.PARSER_JPE_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="Error parsing interaction",
                    message_long=str(e),
                    file_path=str(file_path)
                ))

    def _parse_interaction(self, element: ET.Element) -> Interaction:
        """Parse a single interaction element."""
        # Get the ID
        id_elem = element.find('id')
        interaction_id = ResourceId(name=id_elem.text if id_elem is not None and id_elem.text else 'default_interaction')

        # Get other attributes
        display_name_elem = element.find('display-name')
        description_elem = element.find('description')
        autonomy_disabled_elem = element.find('autonomy-disabled')

        # Parse participants
        participants = []
        participants_elem = element.find('participants')
        if participants_elem is not None:
            for participant_elem in participants_elem.findall('participant'):
                role_elem = participant_elem.find('role')
                desc_elem = participant_elem.find('description')
                participants.append(InteractionParticipant(
                    role=role_elem.text if role_elem is not None and role_elem.text else '',
                    description=desc_elem.text if desc_elem is not None and desc_elem.text else None
                ))

        return Interaction(
            id=interaction_id,
            display_name_key=display_name_elem.text if display_name_elem is not None and display_name_elem.text else None,
            description_key=description_elem.text if description_elem is not None and description_elem.text else None,
            participants=participants,
            autonomy_disabled=autonomy_disabled_elem.text.lower() == 'true' if autonomy_disabled_elem is not None and autonomy_disabled_elem.text else False,
            tests=[],  # Parsing tests would require more complex logic
            loot_actions=[]  # Parsing loot actions would require more complex logic
        )

    def _parse_buffs(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the buffs section."""
        for buff_elem in element.findall('buff'):
            try:
                buff = self._parse_buff(buff_elem)
                project_ir.buffs.append(buff)
            except Exception as e:
                errors.append(EngineError(
                    code="BUFF_PARSE_ERROR",
                    category=ErrorCategory.PARSER_JPE_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="Error parsing buff",
                    message_long=str(e),
                    file_path=str(file_path)
                ))

    def _parse_buff(self, element: ET.Element) -> Buff:
        """Parse a single buff element."""
        # Get the ID
        id_elem = element.find('id')
        buff_id = ResourceId(name=id_elem.text if id_elem is not None and id_elem.text else 'default_buff')

        # Get other attributes
        display_name_elem = element.find('display-name')
        description_elem = element.find('description')
        duration_elem = element.find('duration')

        duration_minutes: Optional[int] = None
        if duration_elem is not None and duration_elem.text:
            try:
                duration_minutes = int(duration_elem.text)
            except ValueError:
                pass  # Invalid duration value

        # Parse traits
        traits = []
        traits_elem = element.find('traits')
        if traits_elem is not None:
            for trait_elem in traits_elem.findall('trait'):
                if trait_elem.text:
                    traits.append(trait_elem.text)

        return Buff(
            id=buff_id,
            display_name_key=display_name_elem.text if display_name_elem is not None and display_name_elem.text else None,
            description_key=description_elem.text if description_elem is not None and description_elem.text else None,
            traits=traits,
            duration_sim_minutes=duration_minutes
        )

    def _parse_traits(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the traits section."""
        for trait_elem in element.findall('trait'):
            try:
                trait = self._parse_trait(trait_elem)
                project_ir.traits.append(trait)
            except Exception as e:
                errors.append(EngineError(
                    code="TRAIT_PARSE_ERROR",
                    category=ErrorCategory.PARSER_JPE_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="Error parsing trait",
                    message_long=str(e),
                    file_path=str(file_path)
                ))

    def _parse_trait(self, element: ET.Element) -> Trait:
        """Parse a single trait element."""
        # Get the ID
        id_elem = element.find('id')
        trait_id = ResourceId(name=id_elem.text if id_elem is not None and id_elem.text else 'default_trait')

        # Get other attributes
        display_name_elem = element.find('display-name')
        description_elem = element.find('description')

        # Parse buffs
        buffs = []
        buffs_elem = element.find('buffs')
        if buffs_elem is not None:
            for buff_elem in buffs_elem.findall('buff'):
                if buff_elem.text:
                    buffs.append(ResourceId(name=buff_elem.text))

        return Trait(
            id=trait_id,
            display_name_key=display_name_elem.text if display_name_elem is not None and display_name_elem.text else None,
            description_key=description_elem.text if description_elem is not None and description_elem.text else None,
            buffs=buffs
        )

    def _parse_enums(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the enums section."""
        for enum_elem in element.findall('enum'):
            try:
                enum_def = self._parse_enum(enum_elem)
                project_ir.enums.append(enum_def)
            except Exception as e:
                errors.append(EngineError(
                    code="ENUM_PARSE_ERROR",
                    category=ErrorCategory.PARSER_JPE_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="Error parsing enum",
                    message_long=str(e),
                    file_path=str(file_path)
                ))

    def _parse_enum(self, element: ET.Element) -> EnumDefinition:
        """Parse a single enum element."""
        # Get the ID
        id_elem = element.find('id')
        enum_id = ResourceId(name=id_elem.text if id_elem is not None and id_elem.text else 'default_enum')

        # Parse options
        options = []
        options_elem = element.find('options')
        if options_elem is not None:
            for option_elem in options_elem.findall('option'):
                name_attr = option_elem.get('name')
                value_elem = option_elem.find('value')

                value = 0  # Default value
                if value_elem is not None and value_elem.text:
                    try:
                        value = int(value_elem.text)
                    except ValueError:
                        value = value_elem.text  # Keep as string if not an integer

                options.append(EnumOption(
                    name=name_attr if name_attr else 'unnamed',
                    value=value
                ))

        return EnumDefinition(
            id=enum_id,
            options=options
        )

    def _parse_strings(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the strings section."""
        for string_elem in element.findall('string'):
            try:
                string = self._parse_string(string_elem)
                project_ir.localized_strings.append(string)
            except Exception as e:
                errors.append(EngineError(
                    code="STRING_PARSE_ERROR",
                    category=ErrorCategory.PARSER_JPE_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="Error parsing string",
                    message_long=str(e),
                    file_path=str(file_path)
                ))

    def _parse_string(self, element: ET.Element) -> LocalizedString:
        """Parse a single string element."""
        key_elem = element.find('key')
        text_elem = element.find('text')
        locale_elem = element.find('locale')

        return LocalizedString(
            key=key_elem.text if key_elem is not None and key_elem.text else '',
            text=text_elem.text if text_elem is not None and text_elem.text else '',
            locale=locale_elem.text if locale_elem is not None and locale_elem.text else 'en_US'
        )
