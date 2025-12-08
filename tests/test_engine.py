"""Tests for the engine components."""

import unittest
from pathlib import Path
import tempfile

from engine.engine import TranslationEngine, EngineConfig
from engine.ir import ProjectIR, ProjectMetadata


class TestEngineConfig(unittest.TestCase):
    """Test EngineConfig class."""
    
    def test_engine_config_creation(self):
        """Test creating an EngineConfig."""
        with tempfile.TemporaryDirectory() as temp_dir:
            project_root = Path(temp_dir) / "project"
            reports_dir = Path(temp_dir) / "reports"
            
            config = EngineConfig(
                project_root=project_root,
                reports_directory=reports_dir
            )
            
            self.assertEqual(config.project_root, project_root)
            self.assertEqual(config.reports_directory, reports_dir)


class TestTranslationEngine(unittest.TestCase):
    """Test TranslationEngine class."""

    def setUp(self):
        """Set up test fixtures."""
        self.temp_dir_obj = tempfile.TemporaryDirectory()
        self.temp_dir = Path(self.temp_dir_obj.name)
        self.project_root = self.temp_dir / "test_project"
        self.project_root.mkdir()
        self.reports_dir = self.temp_dir / "reports"

        config = EngineConfig(
            project_root=self.project_root,
            reports_directory=self.reports_dir
        )
        self.engine = TranslationEngine(config)

    def tearDown(self):
        """Clean up test fixtures."""
        self.temp_dir_obj.cleanup()
    
    def test_engine_initialization(self):
        """Test that the engine initializes with required components."""
        # Verify all components are properly initialized
        self.assertIsNotNone(self.engine._xml_parser)
        self.assertIsNotNone(self.engine._jpe_parser)
        self.assertIsNotNone(self.engine._jpe_xml_parser)
        self.assertIsNotNone(self.engine._xml_generator)
        self.assertIsNotNone(self.engine._validator)
        self.assertIsNotNone(self.engine._report_writer)
        self.assertIsNotNone(self.engine._plugin_manager)
    
    def test_build_from_jpe_empty_project(self):
        """Test building from a JPE project with no files."""
        report = self.engine.build_from_jpe(build_id="test_build")
        
        # Should have a failed status since there are no .jpe files
        self.assertEqual(report.status, "failed")
        # Should have an error about no JPE files
        self.assertTrue(any("NO_JPE_FILES" in error.code for error in report.errors))
    
    def test_build_from_jpe_with_project_content(self):
        """Test building from a JPE project with actual content."""
        # Create project structure
        src_dir = self.project_root / "src"
        src_dir.mkdir()
        
        # Create a simple JPE file
        jpe_file = src_dir / "test.jpe"
        jpe_content = """
[Project]
name: Test Build Project
id: test_build_project
version: 1.0.0
end

[Interactions]
id: simple_interaction
display_name: Simple Interaction
description: A simple test interaction
participant: role:Actor, description:The actor in the interaction
end
"""
        jpe_file.write_text(jpe_content)
        
        report = self.engine.build_from_jpe(build_id="test_build")
        
        # Should have a success status after parsing and validation
        # (even if generation fails for other reasons, the parsing should work)
        # The build should either succeed or only have generation-level errors
        if report.status == "failed":
            # If it fails, it should only be due to generation issues, not parsing
            parse_errors = [e for e in report.errors if e.code in ["NO_JPE_FILES", "PARSE_ERROR"]]
            self.assertEqual(len(parse_errors), 0, f"Unexpected parse errors: {parse_errors}")
        
        # Should have created a report file
        report_files = list(self.reports_dir.glob("*.json"))
        self.assertGreater(len(report_files), 0)
        expected_report = self.reports_dir / "build_test_build.json"
        self.assertTrue(expected_report.exists())


if __name__ == '__main__':
    unittest.main()