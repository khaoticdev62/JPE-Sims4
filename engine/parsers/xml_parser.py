from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable, List, Dict, Any, Optional

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


class XmlParser:
    """Parse Sims 4 XML tuning into intermediate representation.

    The implementation is responsible for understanding tuning tags and attributes.
    """

    def parse_files(self, paths: Iterable[Path]) -> tuple[ProjectIR, List[EngineError]]:
        """Parse the given XML files into a ProjectIR instance.

        Returns a tuple of (project_ir, errors). The ProjectIR may be partially
        populated even when errors are present.
        """
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

                # Check if it's a Sims 4 tuning XML file
                if root.tag != 'I c="Tuning"' and not any(elem.tag == 'Tunings' for elem in root):
                    # Check for Sims 4 XML structure - may be a tuning file
                    if not self._is_sims4_tuning_file(root):
                        errors.append(EngineError(
                            code="INVALID_FORMAT",
                            category=ErrorCategory.PARSER_XML,
                            severity=ErrorSeverity.WARNING,
                            message_short="Possible non-Sims4 XML file",
                            message_long=f"File '{file_path}' may not be a Sims 4 tuning XML file",
                            suggested_fix="Ensure you're providing a valid Sims 4 tuning XML file.",
                            file_path=str(file_path)
                        ))

                # Parse the XML content based on Sims 4 structure
                self._parse_xml_content(root, project_ir, file_path, errors)

            except ET.ParseError as e:
                errors.append(EngineError(
                    code="PARSE_ERROR",
                    category=ErrorCategory.PARSER_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="XML parsing error",
                    message_long=f"XML parsing failed at line {getattr(e, 'lineno', 'unknown')}, column {getattr(e, 'offset', 'unknown')}: {e.msg if hasattr(e, 'msg') else str(e)}",
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

    def _is_sims4_tuning_file(self, root: ET.Element) -> bool:
        """Check if the XML document appears to be a Sims 4 tuning file."""
        # Common indicators of Sims 4 tuning files:
        # - Root element with tuning-related attributes
        # - Contains elements like <Tunings>, <I c="..."> (instances)
        # - Specific tuning namespaces or schemas

        # Check for common Sims 4 tuning elements
        for elem in root.iter():
            if elem.tag in ['I', 'Tunings'] or 'Tuning' in elem.tag:
                return True
            if elem.get('c') and 'sims4' in elem.get('c', '').lower():
                return True

        return False

    def _parse_xml_content(self, root: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse XML content based on Sims 4 structure."""
        # Process the root and its children
        self._parse_element_recursive(root, project_ir, file_path, errors)

    def _parse_element_recursive(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError],
                                parent_id: Optional[str] = None, parent_type: Optional[str] = None) -> None:
        """Recursively parse XML elements and convert them to IR objects."""
        # Identify what type of Sims 4 object this element represents
        element_type = element.get('c')  # In Sims 4 XML, 'c' often indicates class
        element_id = element.get('id') or element.get('name') or parent_id or 'default'

        try:
            if element_type and 'Interaction' in element_type:
                # This is likely an interaction
                interaction = self._parse_interaction_element(element, element_id)
                if interaction:
                    project_ir.interactions.append(interaction)
            elif element_type and 'Buff' in element_type:
                # This is likely a buff
                buff = self._parse_buff_element(element, element_id)
                if buff:
                    project_ir.buffs.append(buff)
            elif element_type and 'Trait' in element_type:
                # This is likely a trait
                trait = self._parse_trait_element(element, element_id)
                if trait:
                    project_ir.traits.append(trait)
            elif element_type and 'Enum' in element_type:
                # This might be an enum
                enum_def = self._parse_enum_element(element, element_id)
                if enum_def:
                    project_ir.enums.append(enum_def)

            # Process child elements recursively
            for child in element:
                self._parse_element_recursive(child, project_ir, file_path, errors, element_id, element_type)

        except Exception as e:
            errors.append(EngineError(
                code="ELEMENT_PARSE_ERROR",
                category=ErrorCategory.PARSER_XML,
                severity=ErrorSeverity.WARNING,
                message_short=f"Error parsing {element_type or 'element'}",
                message_long=f"Error parsing XML element {element.tag}: {str(e)}",
                file_path=str(file_path),
                resource_id=element_id
            ))

    def _parse_interaction_element(self, element: ET.Element, element_id: str) -> Optional[Interaction]:
        """Parse a Sims 4 interaction XML element into an Interaction IR object."""
        try:
            # Extract interaction properties
            display_name_key = self._get_value_from_element(element, 'display_name')
            description_key = self._get_value_from_element(element, 'description')

            # Create participants from XML
            participants = self._parse_interaction_participants(element)

            # Check for autonomy disabled
            autonomy_disabled = self._get_bool_from_element(element, 'autonomy_disabled', False)

            # Create the interaction object
            interaction = Interaction(
                id=ResourceId(name=element_id),
                display_name_key=display_name_key,
                description_key=description_key,
                participants=participants,
                autonomy_disabled=autonomy_disabled,
                tests=[],  # Would require more complex parsing
                loot_actions=[]  # Would require more complex parsing
            )

            return interaction
        except Exception:
            # If parsing fails, return None or a minimal interaction
            return Interaction(
                id=ResourceId(name=element_id),
                display_name_key=None,
                description_key=None,
                participants=[],
                autonomy_disabled=False,
                tests=[],
                loot_actions=[]
            )

    def _parse_interaction_participants(self, element: ET.Element) -> List[InteractionParticipant]:
        """Parse interaction participants from XML element."""
        participants = []

        # Look for participants in various possible element structures
        possible_participant_paths = [
            './/participants',  # Direct sub-element
            './/participants_list',  # Alternative name
            './/participant',  # Individual participant elements
        ]

        for path in possible_participant_paths:
            for participant_elem in element.findall(path):
                # Extract participant details
                role = participant_elem.get('role') or self._get_value_from_element(participant_elem, 'role') or 'unknown'
                description = self._get_value_from_element(participant_elem, 'description')

                participants.append(InteractionParticipant(
                    role=role,
                    description=description
                ))

        return participants

    def _parse_buff_element(self, element: ET.Element, element_id: str) -> Optional[Buff]:
        """Parse a Sims 4 buff XML element into a Buff IR object."""
        try:
            display_name_key = self._get_value_from_element(element, 'display_name')
            description_key = self._get_value_from_element(element, 'description')

            duration_minutes = None
            duration_elem = element.find(".//duration")
            if duration_elem is not None and duration_elem.text:
                try:
                    duration_minutes = int(float(duration_elem.text))  # Duration might be float in XML
                except ValueError:
                    pass

            # Parse traits associated with the buff
            traits = self._parse_associated_traits(element)

            return Buff(
                id=ResourceId(name=element_id),
                display_name_key=display_name_key,
                description_key=description_key,
                traits=traits,
                duration_sim_minutes=duration_minutes
            )
        except Exception:
            # If parsing fails, return a minimal buff
            return Buff(
                id=ResourceId(name=element_id),
                display_name_key=None,
                description_key=None,
                traits=[],
                duration_sim_minutes=None
            )

    def _parse_associated_traits(self, element: ET.Element) -> List[str]:
        """Parse traits associated with an element (e.g., buff, interaction)."""
        traits = []

        # Look for trait references in various common XML structures
        trait_elements = element.findall(".//trait") + element.findall(".//traits/*")

        for trait_elem in trait_elements:
            if trait_elem.text:
                traits.append(trait_elem.text)
            elif trait_elem.get('value'):
                traits.append(trait_elem.get('value'))

        return list(set(traits))  # Remove duplicates

    def _parse_trait_element(self, element: ET.Element, element_id: str) -> Optional[Trait]:
        """Parse a Sims 4 trait XML element into a Trait IR object."""
        try:
            display_name_key = self._get_value_from_element(element, 'display_name')
            description_key = self._get_value_from_element(element, 'description')

            # Parse buffs associated with the trait
            buffs = self._parse_associated_buffs(element)

            return Trait(
                id=ResourceId(name=element_id),
                display_name_key=display_name_key,
                description_key=description_key,
                buffs=buffs
            )
        except Exception:
            # If parsing fails, return a minimal trait
            return Trait(
                id=ResourceId(name=element_id),
                display_name_key=None,
                description_key=None,
                buffs=[]
            )

    def _parse_associated_buffs(self, element: ET.Element) -> List[ResourceId]:
        """Parse buff references associated with an element (e.g., trait)."""
        buffs = []

        # Look for buff references in various common XML structures
        buff_elements = element.findall(".//buff") + element.findall(".//buffs/*")

        for buff_elem in buff_elements:
            buff_name = buff_elem.text or buff_elem.get('value') or buff_elem.get('name') or 'unknown'
            buffs.append(ResourceId(name=buff_name))

        return buffs

    def _parse_enum_element(self, element: ET.Element, element_id: str) -> Optional[EnumDefinition]:
        """Parse a potential enum XML element into an EnumDefinition IR object."""
        try:
            options = []

            # Look for enum options in various possible structures
            # This could be a list of values or named options
            option_elements = element.findall(".//option") + element.findall(".//options/*")

            for i, option_elem in enumerate(option_elements):
                option_name = option_elem.get('name') or option_elem.get('key') or f'option_{i}'
                option_value = option_elem.text or option_elem.get('value') or i

                # Try to convert to int if possible, otherwise keep as string
                try:
                    parsed_value = int(option_value)
                except (ValueError, TypeError):
                    parsed_value = option_value

                options.append(EnumOption(name=option_name, value=parsed_value))

            return EnumDefinition(
                id=ResourceId(name=element_id),
                options=options
            )
        except Exception:
            # If parsing fails, return a minimal enum with no options
            return EnumDefinition(
                id=ResourceId(name=element_id),
                options=[]
            )

    def _get_value_from_element(self, element: ET.Element, tag_name: str) -> Optional[str]:
        """Extract a value from a sub-element with the given tag name."""
        sub_element = element.find(f".//{tag_name}")
        if sub_element is not None and sub_element.text:
            return sub_element.text
        return None

    def _get_bool_from_element(self, element: ET.Element, tag_name: str, default: bool) -> bool:
        """Extract a boolean value from a sub-element."""
        sub_element = element.find(f".//{tag_name}")
        if sub_element is not None and sub_element.text:
            return sub_element.text.lower() in ('true', '1', 'yes', 'on')
        return default
