from __future__ import annotations

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import List

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


class XmlGenerator:
    """Generate Sims 4 XML tuning from intermediate representation."""

    def generate_to_directory(self, ir: ProjectIR, target_directory: Path) -> List[EngineError]:
        """Write XML tuning files to the target directory based on the IR.

        Returns a list of non-fatal errors or warnings that occurred during generation.
        """
        errors: List[EngineError] = []

        # Create the target directory if it doesn't exist
        target_directory.mkdir(parents=True, exist_ok=True)

        try:
            # Generate different types of XML files based on the IR content

            # Generate interactions XML file if there are interactions
            if ir.interactions:
                interactions_file = target_directory / f"interactions_{ir.metadata.project_id}.xml"
                self._generate_interactions_xml(ir.interactions, interactions_file, errors)

            # Generate buffs XML file if there are buffs
            if ir.buffs:
                buffs_file = target_directory / f"buffs_{ir.metadata.project_id}.xml"
                self._generate_buffs_xml(ir.buffs, buffs_file, errors)

            # Generate traits XML file if there are traits
            if ir.traits:
                traits_file = target_directory / f"traits_{ir.metadata.project_id}.xml"
                self._generate_traits_xml(ir.traits, traits_file, errors)

            # Generate enums XML file if there are enums
            if ir.enums:
                enums_file = target_directory / f"enums_{ir.metadata.project_id}.xml"
                self._generate_enums_xml(ir.enums, enums_file, errors)

            # Generate strings XML file if there are localized strings
            if ir.localized_strings:
                strings_file = target_directory / f"strings_{ir.metadata.project_id}.xml"
                self._generate_strings_xml(ir.localized_strings, strings_file, errors)

            # Generate a main project XML file that ties everything together
            main_file = target_directory / f"project_{ir.metadata.project_id}.xml"
            self._generate_main_project_xml(ir, main_file, errors)

        except Exception as e:
            errors.append(EngineError(
                code="GENERATION_ERROR",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Error during XML generation",
                message_long=str(e),
                suggested_fix="Check that the target directory is writable and has sufficient space."
            ))

        return errors

    def _generate_interactions_xml(self, interactions: List[Interaction], file_path: Path, errors: List[EngineError]) -> None:
        """Generate XML for interactions."""
        try:
            root = ET.Element("Tunings")

            # Add project header
            header = ET.SubElement(root, "I", c="ProjectHeader")
            ET.SubElement(header, "T", n="name").text = "Generated Interactions File"

            # Add each interaction
            for interaction in interactions:
                interaction_elem = ET.SubElement(root, "I",
                    c="sims4.random_utils.DynamicAttributeMixin",
                    id=interaction.id.name)

                # Add display name
                if interaction.display_name_key:
                    ET.SubElement(interaction_elem, "T", n="display_name").text = interaction.display_name_key

                # Add description
                if interaction.description_key:
                    ET.SubElement(interaction_elem, "T", n="description").text = interaction.description_key

                # Add autonomy disabled flag
                ET.SubElement(interaction_elem, "V", n="autonomy_disabled", t=" TunableFactory")
                ET.SubElement(interaction_elem, "T", n="autonomy_disabled").text = str(interaction.autonomy_disabled).lower()

                # Add participants if any
                if interaction.participants:
                    participants_list = ET.SubElement(interaction_elem, "L", n="participants")
                    for i, participant in enumerate(interaction.participants):
                        participant_elem = ET.SubElement(participants_list, "U")
                        ET.SubElement(participant_elem, "T", n="role").text = participant.role
                        if participant.description:
                            ET.SubElement(participant_elem, "T", n="description").text = participant.description

            # Write the XML to file
            self._write_xml_file(root, file_path)

        except Exception as e:
            errors.append(EngineError(
                code="INTERACTION_GENERATION_ERROR",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Error generating interactions XML",
                message_long=str(e),
                suggested_fix="Check that the target file is writable and the directory exists.",
                file_path=str(file_path)
            ))

    def _generate_buffs_xml(self, buffs: List[Buff], file_path: Path, errors: List[EngineError]) -> None:
        """Generate XML for buffs."""
        try:
            root = ET.Element("Tunings")

            # Add each buff
            for buff in buffs:
                buff_elem = ET.SubElement(root, "I",
                    c="buffs.buff.Buff",
                    id=buff.id.name)

                # Add display name
                if buff.display_name_key:
                    ET.SubElement(buff_elem, "T", n="display_name").text = buff.display_name_key

                # Add description
                if buff.description_key:
                    ET.SubElement(buff_elem, "T", n="description").text = buff.description_key

                # Add duration if specified
                if buff.duration_sim_minutes is not None:
                    ET.SubElement(buff_elem, "T", n="duration").text = str(buff.duration_sim_minutes)

                # Add traits if any
                if buff.traits:
                    traits_list = ET.SubElement(buff_elem, "L", n="traits")
                    for trait in buff.traits:
                        ET.SubElement(traits_list, "T").text = trait

            # Write the XML to file
            self._write_xml_file(root, file_path)

        except Exception as e:
            errors.append(EngineError(
                code="BUFF_GENERATION_ERROR",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Error generating buffs XML",
                message_long=str(e),
                suggested_fix="Check that the target file is writable and the directory exists.",
                file_path=str(file_path)
            ))

    def _generate_traits_xml(self, traits: List[Trait], file_path: Path, errors: List[EngineError]) -> None:
        """Generate XML for traits."""
        try:
            root = ET.Element("Tunings")

            # Add each trait
            for trait in traits:
                trait_elem = ET.SubElement(root, "I",
                    c="traits.trait.Trait",
                    id=trait.id.name)

                # Add display name
                if trait.display_name_key:
                    ET.SubElement(trait_elem, "T", n="display_name").text = trait.display_name_key

                # Add description
                if trait.description_key:
                    ET.SubElement(trait_elem, "T", n="description").text = trait.description_key

                # Add buffs if any
                if trait.buffs:
                    buffs_list = ET.SubElement(trait_elem, "L", n="buffs")
                    for buff in trait.buffs:
                        ET.SubElement(buffs_list, "T").text = buff.name  # Using buff name as reference

            # Write the XML to file
            self._write_xml_file(root, file_path)

        except Exception as e:
            errors.append(EngineError(
                code="TRAIT_GENERATION_ERROR",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Error generating traits XML",
                message_long=str(e),
                suggested_fix="Check that the target file is writable and the directory exists.",
                file_path=str(file_path)
            ))

    def _generate_enums_xml(self, enums: List[EnumDefinition], file_path: Path, errors: List[EngineError]) -> None:
        """Generate XML for enums."""
        try:
            root = ET.Element("Tunings")

            # Add each enum
            for enum_def in enums:
                enum_elem = ET.SubElement(root, "I",
                    c="sims4.tuning.serialization_enum.Enum",
                    id=enum_def.id.name)

                # Add options as a list
                if enum_def.options:
                    options_list = ET.SubElement(enum_elem, "L", n="options")
                    for option in enum_def.options:
                        option_elem = ET.SubElement(options_list, "U")
                        ET.SubElement(option_elem, "T", n="name").text = option.name
                        # Convert value to string to store in XML
                        ET.SubElement(option_elem, "T", n="value").text = str(option.value)

            # Write the XML to file
            self._write_xml_file(root, file_path)

        except Exception as e:
            errors.append(EngineError(
                code="ENUM_GENERATION_ERROR",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Error generating enums XML",
                message_long=str(e),
                suggested_fix="Check that the target file is writable and the directory exists.",
                file_path=str(file_path)
            ))

    def _generate_strings_xml(self, strings: List[LocalizedString], file_path: Path, errors: List[EngineError]) -> None:
        """Generate XML for localized strings."""
        try:
            root = ET.Element("STBL")

            # Add each localized string
            for string in strings:
                string_elem = ET.SubElement(root, "string",
                    id=string.key,
                    language=string.locale)
                string_elem.text = string.text

            # Write the XML to file with proper XML declaration
            tree = ET.ElementTree(root)
            tree.write(file_path, encoding="utf-8", xml_declaration=True)

        except Exception as e:
            errors.append(EngineError(
                code="STRING_GENERATION_ERROR",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Error generating strings XML",
                message_long=str(e),
                suggested_fix="Check that the target file is writable and the directory exists.",
                file_path=str(file_path)
            ))

    def _generate_main_project_xml(self, ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Generate the main project XML file that references all other components."""
        try:
            root = ET.Element("I", c="Tuning")

            # Add project metadata
            project_info = ET.SubElement(root, "U", n="project_metadata")
            ET.SubElement(project_info, "T", n="name").text = ir.metadata.name
            ET.SubElement(project_info, "T", n="project_id").text = ir.metadata.project_id
            ET.SubElement(project_info, "T", n="version").text = ir.metadata.version
            if ir.metadata.author:
                ET.SubElement(project_info, "T", n="author").text = ir.metadata.author

            # Add references to generated files/components
            if ir.interactions:
                interactions_ref = ET.SubElement(root, "L", n="interactions")
                for interaction in ir.interactions:
                    ET.SubElement(interactions_ref, "T").text = interaction.id.name

            if ir.buffs:
                buffs_ref = ET.SubElement(root, "L", n="buffs")
                for buff in ir.buffs:
                    ET.SubElement(buffs_ref, "T").text = buff.id.name

            if ir.traits:
                traits_ref = ET.SubElement(root, "L", n="traits")
                for trait in ir.traits:
                    ET.SubElement(traits_ref, "T").text = trait.id.name

            if ir.enums:
                enums_ref = ET.SubElement(root, "L", n="enums")
                for enum_def in ir.enums:
                    ET.SubElement(enums_ref, "T").text = enum_def.id.name

            if ir.localized_strings:
                strings_ref = ET.SubElement(root, "L", n="strings")
                for string in ir.localized_strings:
                    ET.SubElement(strings_ref, "T").text = string.key

            # Write the XML to file
            self._write_xml_file(root, file_path)

        except Exception as e:
            errors.append(EngineError(
                code="PROJECT_GENERATION_ERROR",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Error generating project XML",
                message_long=str(e),
                suggested_fix="Check that the target file is writable and the directory exists.",
                file_path=str(file_path)
            ))

    def _write_xml_file(self, root: ET.Element, file_path: Path) -> None:
        """Write an XML element tree to a file with proper formatting."""
        # Create the element tree and write to file
        tree = ET.ElementTree(root)

        # Custom formatting to add indentation
        self._indent_xml(root)

        # Write with UTF-8 encoding and XML declaration
        tree.write(file_path, encoding="utf-8", xml_declaration=True)

    def _indent_xml(self, elem: ET.Element, level: int = 0) -> None:
        """Add indentation to XML elements for better readability."""
        i = "\n" + level * "  "
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = i + "  "
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
            for child in elem:
                self._indent_xml(child, level + 1)
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = i
