"""End-to-end integration tests for the JPE Sims 4 Mod Translator."""

import unittest
from pathlib import Path
import tempfile
import xml.etree.ElementTree as ET

from engine.engine import TranslationEngine, EngineConfig
from engine.ir import ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant, Buff, Trait, EnumDefinition, EnumOption, LocalizedString


class TestEndToEndIntegration(unittest.TestCase):
    """End-to-end integration tests for the full pipeline."""
    
    def test_full_translation_pipeline(self):
        """Test the full pipeline: JPE source -> IR -> XML generation."""
        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = Path(temp_dir) / "test_project"
            project_root.mkdir()
            
            # Create project structure
            (project_root / "src").mkdir()
            (project_root / "build").mkdir()
            (project_root / "config").mkdir()
            
            # Create a JPE source file
            jpe_content = """[Project]
name: Integration Test Project
id: integration_test
version: 1.0.0
author: Integration Test
end

[Interactions]
id: greet_neighbor
display_name: Greet Neighbor
description: Politely greet a nearby neighbor
participant: role:Actor, description:The person initiating the greeting
participant: role:Target, description:The neighbor being greeted
end

[Buffs]
id: happy_visitor
display_name: Happy Visitor
description: Feeling welcomed by a friendly neighbor
duration: 120
end

[Traits]
id: friendly_neighbor
display_name: Friendly Neighbor
description: Enjoys greeting other sims
end

[Enums]
id: greeting_types
option: casual_greeting:0
option: formal_greeting:1
option: silly_greeting:2
end

[Strings]
key: greet_neighbor_name
text: Greet Neighbor
locale: en_US
end

[Strings]
key: greet_neighbor_desc
text: Politely greet a nearby neighbor
locale: en_US
end
"""
            
            src_file = project_root / "src" / "integration_test.jpe"
            src_file.write_text(jpe_content)
            
            # Configure and run the engine
            config = EngineConfig(
                project_root=project_root,
                reports_directory=project_root / "reports"
            )
            engine = TranslationEngine(config)
            
            # Run the build
            report = engine.build_from_jpe(build_id="integration_test_build")
            
            # Check that the build succeeded
            self.assertEqual(report.status, "success", 
                            f"Build failed with errors: {[e.message_short for e in report.errors]}")
            
            # Check that XML files were generated in the build directory
            build_dir = project_root / "build" / "integration_test_build"
            self.assertTrue(build_dir.exists())
            
            # Check that expected XML files were created
            xml_files = list(build_dir.glob("*.xml"))
            self.assertGreater(len(xml_files), 0, "No XML files were generated")
            
            # Verify specific files exist
            interactions_file = build_dir / f"interactions_integration_test.xml"
            buffs_file = build_dir / f"buffs_integration_test.xml"
            traits_file = build_dir / f"traits_integration_test.xml"
            enums_file = build_dir / f"enums_integration_test.xml"
            strings_file = build_dir / f"strings_integration_test.xml"
            project_file = build_dir / f"project_integration_test.xml"
            
            self.assertTrue(interactions_file.exists(), "Interactions XML file not generated")
            self.assertTrue(buffs_file.exists(), "Buffs XML file not generated")
            self.assertTrue(traits_file.exists(), "Traits XML file not generated")
            self.assertTrue(enums_file.exists(), "Enums XML file not generated")
            self.assertTrue(strings_file.exists(), "Strings XML file not generated")
            self.assertTrue(project_file.exists(), "Project XML file not generated")
            
            # Parse and verify the generated interaction XML
            interaction_tree = ET.parse(interactions_file)
            interaction_root = interaction_tree.getroot()
            
            # Find the greeting interaction
            interaction_elements = interaction_root.findall(f".//I[@id='greet_neighbor']")
            self.assertEqual(len(interaction_elements), 1, "Greeting interaction not found in generated XML")
            
            interaction_elem = interaction_elements[0]
            
            # Verify interaction has expected fields
            display_name_elem = interaction_root.find(".//T[@n='display_name']")
            if display_name_elem is not None:
                self.assertIn("Greet Neighbor", display_name_elem.text)
            
            # Parse and verify the generated buff XML
            buff_tree = ET.parse(buffs_file)
            buff_root = buff_tree.getroot()
            
            buff_elements = buff_root.findall(f".//I[@id='happy_visitor']")
            self.assertEqual(len(buff_elements), 1, "Happy Visitor buff not found in generated XML")
            
            # Parse and verify the generated string XML
            string_tree = ET.parse(strings_file)
            string_root = string_tree.getroot()
            
            string_elements = string_root.findall(f".//string[@id='greet_neighbor_name']")
            self.assertEqual(len(string_elements), 1, "Greet Neighbor string not found in generated XML")
            
            string_elem = string_elements[0]
            self.assertEqual(string_elem.text, "Greet Neighbor")
    
    def test_error_handling_in_pipeline(self):
        """Test that errors are properly handled and reported in the pipeline."""
        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = Path(temp_dir) / "error_test_project"
            project_root.mkdir()
            
            # Create project structure
            (project_root / "src").mkdir()
            (project_root / "build").mkdir()
            (project_root / "config").mkdir()
            
            # Create a JPE file with intentional errors
            jpe_content = """[Project]
name: Error Test Project
id: error_test
version: 1.0.0
end

[Interactions]
id: 
display_name: Interaction with Empty ID
end

[Buffs]
id: test_buff
display_name: Test Buff
# Missing 'end' on purpose
"""
            
            src_file = project_root / "src" / "error_test.jpe"
            src_file.write_text(jpe_content)
            
            # Configure and run the engine
            config = EngineConfig(
                project_root=project_root,
                reports_directory=project_root / "reports"
            )
            engine = TranslationEngine(config)
            
            # Run the build
            report = engine.build_from_jpe(build_id="error_test_build")
            
            # Should have errors due to invalid syntax in JPE file
            self.assertEqual(report.status, "failed")
            self.assertGreater(len(report.errors), 0)
            
            # Should contain specific errors about the problems in the JPE file
            error_messages = [error.message_short for error in report.errors]
            # At least one error should be about empty ID or missing end
            has_relevant_error = any(
                "ID" in msg or "end" in msg.lower() or "Empty" in msg or "Invalid" in msg 
                for msg in error_messages
            )
            self.assertTrue(has_relevant_error, f"No relevant errors found. Errors: {error_messages}")
    
    def test_validation_in_pipeline(self):
        """Test that validation errors are caught in the pipeline."""
        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = Path(temp_dir) / "validation_test_project"
            project_root.mkdir()
            
            # Create project structure
            (project_root / "src").mkdir()
            (project_root / "build").mkdir()
            (project_root / "config").mkdir()
            
            # Create a JPE file that will pass parsing but fail validation
            jpe_content = """[Project]
name: Validation Test Project
id: validation_test
version: 1.0.0
end

[Interactions]
id: duplicate_interaction
display_name: First Interaction
end

[Interactions]  # Duplicate ID
id: duplicate_interaction
display_name: Second Interaction
end

[Buffs]
id: duplicate_buff
display_name: First Buff
end

[Buffs]  # Duplicate ID
id: duplicate_buff
display_name: Second Buff
end
"""
            
            src_file = project_root / "src" / "validation_test.jpe"
            src_file.write_text(jpe_content)
            
            # Configure and run the engine
            config = EngineConfig(
                project_root=project_root,
                reports_directory=project_root / "reports"
            )
            engine = TranslationEngine(config)
            
            # Run the build
            report = engine.build_from_jpe(build_id="validation_test_build")
            
            # Should have validation errors due to duplicate IDs
            # The build should fail
            self.assertEqual(report.status, "failed")
            self.assertGreater(len(report.errors), 0)
            
            # Check that the errors include duplicate ID errors
            duplicate_errors = [error for error in report.errors if "DUPLICATE" in error.code]
            self.assertGreater(len(duplicate_errors), 0, "No duplicate ID errors found in validation")


if __name__ == '__main__':
    unittest.main()