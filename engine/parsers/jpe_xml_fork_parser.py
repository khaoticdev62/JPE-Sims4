"""Enhanced JPE-XML Fork Parser for JPE Sims 4 Mod Translator.

This implements an extended version of the JPE-XML format with additional
features and capabilities beyond the standard format.
"""

import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Iterable, List, Optional, Dict, Any

from engine.ir import (
    ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant,
    Buff, Trait, EnumDefinition, EnumOption, TestSet, TestCondition, TestOperand,
    LootAction, StatisticModifier, LocalizedString
)
from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity


class JpeXmlForkParser:
    """Parse enhanced JPE-XML Fork sources into intermediate representation.

    The Fork version includes additional features like:
    - Advanced condition expressions
    - Complex data types
    - Inline documentation
    - Version compatibility markers
    """

    def parse_files(self, paths: Iterable[Path]) -> tuple[ProjectIR, List[EngineError]]:
        """Parse the given JPE-XML Fork files into a ProjectIR instance."""
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
                
                # Validate that this is a JPE-XML Fork document
                if root.tag != 'jpe-project' and not root.get('format') == 'jpe-xml-fork':
                    # Check if it has the fork namespace or attribute
                    if not self._has_fork_features(root):
                        errors.append(EngineError(
                            code="INVALID_FORK_FORMAT",
                            category=ErrorCategory.PARSER_JPE_XML,
                            severity=ErrorSeverity.ERROR,
                            message_short="Invalid JPE-XML Fork format",
                            message_long=f"Root element must be 'jpe-project' with format='jpe-xml-fork' or contain fork-specific features",
                            suggested_fix="Ensure the XML file is a valid JPE-XML Fork document.",
                            file_path=str(file_path)
                        ))
                        continue
                
                # Parse the content
                self._parse_project_element_fork(root, project_ir, file_path, errors)
                
            except ET.ParseError as e:
                errors.append(EngineError(
                    code="PARSE_ERROR",
                    category=ErrorCategory.PARSER_JPE_XML,
                    severity=ErrorSeverity.ERROR,
                    message_short="XML parsing error",
                    message_long=f"XML parsing failed at line {getattr(e, 'lineno', 'unknown')}, column {getattr(e, 'offset', 'unknown')}: {getattr(e, 'msg', str(e))}",
                    suggested_fix="Check the XML syntax for well-formedness issues like unclosed tags or invalid characters.",
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
    
    def _has_fork_features(self, root: ET.Element) -> bool:
        """Check if the document contains JPE-XML Fork specific features."""
        # Check for fork-specific attributes, elements, or namespaces
        if root.get('format') == 'jpe-xml-fork':
            return True
        
        # Check for fork-specific elements in the document
        fork_elements = [
            root.find('.//enhanced-condition'),
            root.find('.//complex-data-type'),
            root.find('.//inline-documentation'),
            root.find('.//compatibility-marker'),
        ]
        
        return any(elem is not None for elem in fork_elements)
    
    def _parse_project_element_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the root jpe-project element in Fork format."""
        # Parse project metadata with enhanced attributes
        project_elem = element.find('project')
        if project_elem is not None:
            self._parse_project_metadata_fork(project_elem, project_ir)
        
        # Parse different sections, including fork-specific ones
        self._parse_interactions_fork(element, project_ir, file_path, errors)
        self._parse_buffs_fork(element, project_ir, file_path, errors)
        self._parse_traits_fork(element, project_ir, file_path, errors)
        self._parse_enums_fork(element, project_ir, file_path, errors)
        self._parse_strings_fork(element, project_ir, file_path, errors)
        
        # Parse fork-specific sections
        self._parse_advanced_conditions_fork(element, project_ir, file_path, errors)
        self._parse_complex_types_fork(element, project_ir, file_path, errors)
        self._parse_documentation_fork(element, file_path, errors)
    
    def _parse_project_metadata_fork(self, element: ET.Element, project_ir: ProjectIR) -> None:
        """Parse the project metadata section with Fork extensions."""
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
        
        # Fork-specific metadata
        fork_version_elem = element.find('fork-version')
        if fork_version_elem is not None and fork_version_elem.text:
            # Store as extra metadata
            if not hasattr(project_ir.metadata, 'fork_version'):
                # In a real implementation, we'd extend the metadata class
                pass
    
    def _parse_interactions_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the interactions section with Fork extensions."""
        interactions_elem = element.find('interactions')
        if interactions_elem is not None:
            for interaction_elem in interactions_elem.findall('interaction'):
                try:
                    interaction = self._parse_interaction_fork(interaction_elem)
                    project_ir.interactions.append(interaction)
                except Exception as e:
                    errors.append(EngineError(
                        code="INTERACTION_PARSE_ERROR",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Error parsing interaction",
                        message_long=str(e),
                        suggested_fix="Check the interaction syntax and required fields.",
                        file_path=str(file_path)
                    ))
    
    def _parse_interaction_fork(self, element: ET.Element) -> Interaction:
        """Parse a single interaction element with Fork extensions."""
        # Get the ID
        id_elem = element.find('id')
        interaction_id = ResourceId(name=id_elem.text if id_elem is not None and id_elem.text else 'default_interaction')
        
        # Get other standard attributes
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
        
        # Fork-specific features
        # Parse enhanced conditions
        conditions = self._parse_enhanced_conditions(element)
        
        # Parse advanced constraints
        constraints = self._parse_advanced_constraints(element)
        
        return Interaction(
            id=interaction_id,
            display_name_key=display_name_elem.text if display_name_elem is not None and display_name_elem.text else None,
            description_key=description_elem.text if description_elem is not None and description_elem.text else None,
            participants=participants,
            autonomy_disabled=autonomy_disabled_elem.text.lower() == 'true' if autonomy_disabled_elem is not None and autonomy_disabled_elem.text else False,
            tests=conditions,
            loot_actions=[]  # Would require more complex parsing
        )
    
    def _parse_buffs_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the buffs section with Fork extensions."""
        buffs_elem = element.find('buffs')
        if buffs_elem is not None:
            for buff_elem in buffs_elem.findall('buff'):
                try:
                    buff = self._parse_buff_fork(buff_elem)
                    project_ir.buffs.append(buff)
                except Exception as e:
                    errors.append(EngineError(
                        code="BUFF_PARSE_ERROR",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Error parsing buff",
                        message_long=str(e),
                        suggested_fix="Check the buff syntax and required fields.",
                        file_path=str(file_path)
                    ))
    
    def _parse_buff_fork(self, element: ET.Element) -> Buff:
        """Parse a single buff element with Fork extensions."""
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
        
        # Fork-specific features
        # Parse enhanced effects
        effects = self._parse_enhanced_effects(element)
        
        return Buff(
            id=buff_id,
            display_name_key=display_name_elem.text if display_name_elem is not None and display_name_elem.text else None,
            description_key=description_elem.text if description_elem is not None and description_elem.text else None,
            traits=traits,
            duration_sim_minutes=duration_minutes
        )
    
    def _parse_traits_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the traits section with Fork extensions."""
        traits_elem = element.find('traits')
        if traits_elem is not None:
            for trait_elem in traits_elem.findall('trait'):
                try:
                    trait = self._parse_trait_fork(trait_elem)
                    project_ir.traits.append(trait)
                except Exception as e:
                    errors.append(EngineError(
                        code="TRAIT_PARSE_ERROR",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Error parsing trait",
                        message_long=str(e),
                        suggested_fix="Check the trait syntax and required fields.",
                        file_path=str(file_path)
                    ))
    
    def _parse_trait_fork(self, element: ET.Element) -> Trait:
        """Parse a single trait element with Fork extensions."""
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
        
        # Fork-specific features
        # Parse additional trait properties
        properties = self._parse_trait_properties(element)
        
        return Trait(
            id=trait_id,
            display_name_key=display_name_elem.text if display_name_elem is not None and display_name_elem.text else None,
            description_key=description_elem.text if description_elem is not None and description_elem.text else None,
            buffs=buffs
        )
    
    def _parse_enums_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the enums section with Fork extensions."""
        enums_elem = element.find('enums')
        if enums_elem is not None:
            for enum_elem in enums_elem.findall('enum'):
                try:
                    enum_def = self._parse_enum_fork(enum_elem)
                    project_ir.enums.append(enum_def)
                except Exception as e:
                    errors.append(EngineError(
                        code="ENUM_PARSE_ERROR",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Error parsing enum",
                        message_long=str(e),
                        suggested_fix="Check the enum syntax and required fields.",
                        file_path=str(file_path)
                    ))
    
    def _parse_enum_fork(self, element: ET.Element) -> EnumDefinition:
        """Parse a single enum element with Fork extensions."""
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
        
        # Fork-specific features
        # Parse enum constraints
        constraints = self._parse_enum_constraints(element)
        
        return EnumDefinition(
            id=enum_id,
            options=options
        )
    
    def _parse_strings_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse the strings section with Fork extensions."""
        strings_elem = element.find('strings')
        if strings_elem is not None:
            for string_elem in strings_elem.findall('string'):
                try:
                    string = self._parse_string_fork(string_elem)
                    project_ir.localized_strings.append(string)
                except Exception as e:
                    errors.append(EngineError(
                        code="STRING_PARSE_ERROR",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Error parsing string",
                        message_long=str(e),
                        suggested_fix="Check the string syntax and required fields.",
                        file_path=str(file_path)
                    ))
    
    def _parse_string_fork(self, element: ET.Element) -> LocalizedString:
        """Parse a single string element with Fork extensions."""
        key_elem = element.find('key')
        text_elem = element.find('text')
        locale_elem = element.find('locale')
        
        return LocalizedString(
            key=key_elem.text if key_elem is not None and key_elem.text else '',
            text=text_elem.text if text_elem is not None and text_elem.text else '',
            locale=locale_elem.text if locale_elem is not None and locale_elem.text else 'en_US'
        )
    
    # Fork-specific parsing methods
    def _parse_advanced_conditions_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse advanced condition expressions specific to the Fork."""
        conditions_elem = element.find('advanced-conditions')
        if conditions_elem is not None:
            # Process advanced condition elements
            for condition_elem in conditions_elem.findall('enhanced-condition'):
                try:
                    # In a real implementation, these would be processed
                    # and potentially added to the project IR
                    pass
                except Exception as e:
                    errors.append(EngineError(
                        code="ADVANCED_CONDITION_PARSE_ERROR",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Error parsing advanced condition",
                        message_long=str(e),
                        suggested_fix="Check the advanced condition syntax.",
                        file_path=str(file_path)
                    ))
    
    def _parse_complex_types_fork(self, element: ET.Element, project_ir: ProjectIR, file_path: Path, errors: List[EngineError]) -> None:
        """Parse complex data types specific to the Fork."""
        types_elem = element.find('complex-types')
        if types_elem is not None:
            # Process complex type elements
            for type_elem in types_elem.findall('complex-data-type'):
                try:
                    # In a real implementation, these would be processed
                    # and potentially added to the project IR
                    pass
                except Exception as e:
                    errors.append(EngineError(
                        code="COMPLEX_TYPE_PARSE_ERROR",
                        category=ErrorCategory.PARSER_JPE_XML,
                        severity=ErrorSeverity.ERROR,
                        message_short="Error parsing complex data type",
                        message_long=str(e),
                        suggested_fix="Check the complex type syntax.",
                        file_path=str(file_path)
                    ))
    
    def _parse_documentation_fork(self, element: ET.Element, file_path: Path, errors: List[EngineError]) -> None:
        """Parse inline documentation specific to the Fork."""
        # Parse documentation elements for additional context
        documentation_elem = element.find('documentation')
        if documentation_elem is not None:
            # Process documentation elements
            for doc_elem in documentation_elem.findall('inline-documentation'):
                # In a real implementation, this would be used for help, tips, etc.
                pass
    
    # Helper methods for Fork-specific features
    def _parse_enhanced_conditions(self, element: ET.Element) -> List[TestSet]:
        """Parse enhanced condition expressions."""
        conditions = []
        # In a real implementation, this would parse more complex condition expressions
        return conditions
    
    def _parse_advanced_constraints(self, element: ET.Element) -> Dict[str, Any]:
        """Parse advanced constraints."""
        constraints = {}
        # In a real implementation, this would parse constraints
        return constraints
    
    def _parse_enhanced_effects(self, element: ET.Element) -> List[Any]:
        """Parse enhanced effects for buffs."""
        effects = []
        # In a real implementation, this would parse complex effect definitions
        return effects
    
    def _parse_trait_properties(self, element: ET.Element) -> Dict[str, Any]:
        """Parse additional trait properties."""
        properties = {}
        # In a real implementation, this would parse trait-specific properties
        return properties
    
    def _parse_enum_constraints(self, element: ET.Element) -> Dict[str, Any]:
        """Parse enum constraints."""
        constraints = {}
        # In a real implementation, this would parse enum constraints
        return constraints