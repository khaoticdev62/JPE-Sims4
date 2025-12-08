"""Tests for the generator components."""

import unittest
from pathlib import Path
import tempfile
import xml.etree.ElementTree as ET

from engine.generators.xml_generator import XmlGenerator
from engine.ir import (
    ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant,
    Buff, Trait, EnumDefinition, EnumOption, LocalizedString
)


class TestXmlGenerator(unittest.TestCase):
    """Test XmlGenerator class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.generator = XmlGenerator()
        
        # Create a sample ProjectIR for testing
        self.sample_project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0",
                author="Test Author"
            ),
            interactions=[
                Interaction(
                    id=ResourceId(name="test_interaction"),
                    display_name_key="Test Interaction",
                    description_key="A test interaction",
                    participants=[InteractionParticipant(role="Actor", description="The actor")]
                )
            ],
            buffs=[
                Buff(
                    id=ResourceId(name="test_buff"),
                    display_name_key="Test Buff",
                    description_key="A test buff",
                    duration_sim_minutes=60
                )
            ],
            traits=[
                Trait(
                    id=ResourceId(name="test_trait"),
                    display_name_key="Test Trait",
                    description_key="A test trait"
                )
            ],
            enums=[
                EnumDefinition(
                    id=ResourceId(name="test_enum"),
                    options=[EnumOption(name="option1", value=0), EnumOption(name="option2", value=1)]
                )
            ],
            localized_strings=[
                LocalizedString(key="test_key", text="Test String", locale="en_US")
            ]
        )
    
    def test_generate_to_directory(self):
        """Test generating XML files to a directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            
            errors = self.generator.generate_to_directory(self.sample_project, target_path)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            
            # Check that the expected files were created
            files_created = list(target_path.glob("*.xml"))
            self.assertGreater(len(files_created), 0)
            
            # Should have a main project file
            project_file = target_path / f"project_{self.sample_project.metadata.project_id}.xml"
            self.assertTrue(project_file.exists())
            
            # Should have files for each type of component
            interaction_files = list(target_path.glob("*interactions_*.xml"))
            buff_files = list(target_path.glob("*buffs_*.xml"))
            trait_files = list(target_path.glob("*traits_*.xml"))
            enum_files = list(target_path.glob("*enums_*.xml"))
            string_files = list(target_path.glob("*strings_*.xml"))
            
            self.assertEqual(len(interaction_files), 1)
            self.assertEqual(len(buff_files), 1)
            self.assertEqual(len(trait_files), 1)
            self.assertEqual(len(enum_files), 1)
            self.assertEqual(len(string_files), 1)
    
    def test_generate_interactions_xml(self):
        """Test generating interactions XML."""
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            file_path = target_path / "test_interactions.xml"
            
            errors = []
            self.generator._generate_interactions_xml(self.sample_project.interactions, file_path, errors)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            
            # Check that the file was created and contains expected content
            self.assertTrue(file_path.exists())
            
            # Parse the XML to verify structure
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Should be a Tunings element
            self.assertEqual(root.tag, "Tunings")
            
            # Should contain interaction elements
            interaction_elements = root.findall(".//I")
            self.assertGreater(len(interaction_elements), 0)
    
    def test_generate_buffs_xml(self):
        """Test generating buffs XML."""
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            file_path = target_path / "test_buffs.xml"
            
            errors = []
            self.generator._generate_buffs_xml(self.sample_project.buffs, file_path, errors)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            
            # Check that the file was created
            self.assertTrue(file_path.exists())
            
            # Parse the XML to verify structure
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Should contain buff elements
            buff_elements = root.findall(".//I[@c='buffs.buff.Buff']")
            self.assertGreater(len(buff_elements), 0)
    
    def test_generate_traits_xml(self):
        """Test generating traits XML."""
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            file_path = target_path / "test_traits.xml"
            
            errors = []
            self.generator._generate_traits_xml(self.sample_project.traits, file_path, errors)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            
            # Check that the file was created
            self.assertTrue(file_path.exists())
            
            # Parse the XML to verify structure
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Should contain trait elements
            trait_elements = root.findall(".//I[@c='traits.trait.Trait']")
            self.assertGreater(len(trait_elements), 0)
    
    def test_generate_enums_xml(self):
        """Test generating enums XML."""
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            file_path = target_path / "test_enums.xml"
            
            errors = []
            self.generator._generate_enums_xml(self.sample_project.enums, file_path, errors)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            
            # Check that the file was created
            self.assertTrue(file_path.exists())
            
            # Parse the XML to verify structure
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Should contain enum elements
            enum_elements = root.findall(".//I[@c='sims4.tuning.serialization_enum.Enum']")
            self.assertEqual(len(enum_elements), 1)
    
    def test_generate_strings_xml(self):
        """Test generating strings XML."""
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            file_path = target_path / "test_strings.xml"
            
            errors = []
            self.generator._generate_strings_xml(self.sample_project.localized_strings, file_path, errors)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            
            # Check that the file was created
            self.assertTrue(file_path.exists())
            
            # Parse the XML to verify structure
            tree = ET.parse(file_path)
            root = tree.getroot()
            
            # Should contain string elements
            string_elements = root.findall(".//string")
            self.assertEqual(len(string_elements), 1)
            self.assertEqual(string_elements[0].get("id"), "test_key")
            self.assertEqual(string_elements[0].text, "Test String")
    
    def test_generate_empty_project(self):
        """Test generating XML for an empty project."""
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            
            empty_project = ProjectIR(
                metadata=ProjectMetadata(
                    name="Empty Project",
                    project_id="empty_project",
                    version="1.0.0"
                )
            )
            
            errors = self.generator.generate_to_directory(empty_project, target_path)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            
            # Should still generate the main project file
            project_file = target_path / f"project_{empty_project.metadata.project_id}.xml"
            self.assertTrue(project_file.exists())


if __name__ == '__main__':
    unittest.main()