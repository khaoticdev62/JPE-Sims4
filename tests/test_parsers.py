"""Tests for the parser components."""

import unittest
from pathlib import Path
import tempfile

from engine.parsers.jpe_parser import JpeParser
from engine.parsers.jpe_xml_parser import JpeXmlParser
from engine.parsers.xml_parser import XmlParser
from engine.ir import ProjectIR, ProjectMetadata


class TestJpeParser(unittest.TestCase):
    """Test JpeParser class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.parser = JpeParser()
    
    def test_parse_project_empty_directory(self):
        """Test parsing a project with no JPE files."""
        with tempfile.TemporaryDirectory() as temp_dir:
            project_path = Path(temp_dir)
            ir, errors = self.parser.parse_project(project_path)
            
            # Should have a warning about no files found
            self.assertEqual(len(errors), 1)
            self.assertEqual(errors[0].code, "NO_JPE_FILES")
            # Should still have a default project IR
            self.assertIsInstance(ir, ProjectIR)
            self.assertEqual(ir.metadata.name, project_path.name)
    
    def test_parse_simple_project(self):
        """Test parsing a simple JPE project."""
        with tempfile.TemporaryDirectory() as temp_dir:
            project_path = Path(temp_dir)
            
            # Create a src directory
            src_dir = project_path / "src"
            src_dir.mkdir()
            
            # Create a simple JPE file
            jpe_file = src_dir / "test.jpe"
            jpe_content = """
[Project]
name: Test Project
id: test_project
version: 1.0.0
author: Test Author
end

[Interactions]
id: test_interaction
display_name: Test Interaction
description: A test interaction
participant: role:Actor, description:Test actor
end
"""
            jpe_file.write_text(jpe_content)
            
            ir, errors = self.parser.parse_project(project_path)
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            # Should have the project metadata
            self.assertEqual(ir.metadata.name, "Test Project")
            self.assertEqual(ir.metadata.project_id, "test_project")
            self.assertEqual(ir.metadata.version, "1.0.0")
            self.assertEqual(ir.metadata.author, "Test Author")
            # Should have one interaction
            self.assertEqual(len(ir.interactions), 1)
            interaction = ir.interactions[0]
            self.assertEqual(interaction.id.name, "test_interaction")
            self.assertEqual(interaction.display_name_key, "Test Interaction")
            self.assertEqual(interaction.description_key, "A test interaction")
            self.assertEqual(len(interaction.participants), 1)
            self.assertEqual(interaction.participants[0].role, "Actor")
    
    def test_parse_project_with_syntax_errors(self):
        """Test parsing a project with syntax errors."""
        with tempfile.TemporaryDirectory() as temp_dir:
            project_path = Path(temp_dir)
            
            # Create a src directory
            src_dir = project_path / "src"
            src_dir.mkdir()
            
            # Create a JPE file with syntax errors
            jpe_file = src_dir / "test.jpe"
            jpe_content = """
[Project]
name: Test Project
id: test_project
version: 1.0.0

# Missing 'end' statement and improper syntax
[InvalidSection]
invalid line format
"""
            jpe_file.write_text(jpe_content)
            
            ir, errors = self.parser.parse_project(project_path)
            
            # Should have warnings/errors for invalid syntax
            self.assertGreater(len(errors), 0)
            # Should still have a project IR with basic metadata
            self.assertIsInstance(ir, ProjectIR)


class TestJpeXmlParser(unittest.TestCase):
    """Test JpeXmlParser class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.parser = JpeXmlParser()
    
    def test_parse_simple_jpe_xml(self):
        """Test parsing a simple JPE-XML file."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = Path(temp_dir)
            
            # Create a simple JPE-XML file
            xml_file = temp_dir_path / "test.jpe-xml"
            xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<jpe-project>
    <project>
        <name>Test Project</name>
        <id>test_project</id>
        <version>1.0.0</version>
        <author>Test Author</author>
    </project>
    <interactions>
        <interaction>
            <id>test_interaction</id>
            <display-name>Test Interaction</display-name>
            <description>A test interaction</description>
            <autonomy-disabled>false</autonomy-disabled>
        </interaction>
    </interactions>
</jpe-project>
'''
            xml_file.write_text(xml_content)
            
            ir, errors = self.parser.parse_files([xml_file])
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            # Should have the project metadata
            self.assertEqual(ir.metadata.name, "Test Project")
            self.assertEqual(ir.metadata.project_id, "test_project")
            self.assertEqual(ir.metadata.version, "1.0.0")
            # Should have one interaction
            self.assertEqual(len(ir.interactions), 1)
            interaction = ir.interactions[0]
            self.assertEqual(interaction.id.name, "test_interaction")
            self.assertEqual(interaction.display_name_key, "Test Interaction")
            self.assertEqual(interaction.description_key, "A test interaction")
    
    def test_parse_invalid_jpe_xml(self):
        """Test parsing invalid JPE-XML."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = Path(temp_dir)
            
            # Create an invalid JPE-XML file
            xml_file = temp_dir_path / "invalid.jpe-xml"
            xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<invalid-root>
    <project>
        <name>Invalid Project</name>
    </project>
</invalid-root>
'''
            xml_file.write_text(xml_content)
            
            ir, errors = self.parser.parse_files([xml_file])
            
            # Should have an error for invalid root element
            self.assertGreater(len(errors), 0)
            error_found = any(e.code == "INVALID_FORMAT" for e in errors)
            self.assertTrue(error_found)


class TestXmlParser(unittest.TestCase):
    """Test XmlParser class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.parser = XmlParser()
    
    def test_parse_simple_xml(self):
        """Test parsing a simple XML file."""
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = Path(temp_dir)
            
            # Create a simple XML file that looks like Sims 4 XML
            xml_file = temp_dir_path / "test.xml"
            xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<I c="Tuning">
    <T n="name">Test Tuning</T>
    <U n="data">
        <T n="display_name">Test Display Name</T>
        <T n="description">Test Description</T>
    </U>
</I>
'''
            xml_file.write_text(xml_content)
            
            ir, errors = self.parser.parse_files([xml_file])
            
            # Should have no errors
            error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
            self.assertEqual(error_count, 0)
            # Basic IR should be created
            self.assertIsInstance(ir, ProjectIR)
    
    def test_parse_empty_file_list(self):
        """Test parsing an empty list of files."""
        ir, errors = self.parser.parse_files([])
        
        # Should have an empty IR and no errors
        self.assertIsInstance(ir, ProjectIR)
        self.assertEqual(len(errors), 0)


if __name__ == '__main__':
    unittest.main()