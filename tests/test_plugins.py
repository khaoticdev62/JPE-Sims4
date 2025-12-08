"""Tests for the plugin system."""

import unittest
from pathlib import Path
import tempfile
from unittest.mock import Mock, patch
from typing import List

from plugins import Plugin, ParserPlugin, GeneratorPlugin, TransformPlugin
from plugins.manager import PluginManager
from engine.ir import ProjectIR, ProjectMetadata
from diagnostics.errors import EngineError


class MockPlugin(Plugin):
    """Mock plugin for testing."""
    
    def name(self) -> str:
        return "Mock Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "A mock plugin for testing"


class MockParserPlugin(ParserPlugin):
    """Mock parser plugin for testing."""
    
    def name(self) -> str:
        return "Mock Parser Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "A mock parser plugin for testing"
    
    def supported_extensions(self) -> List[str]:
        return [".test"]
    
    def parse(self, file_path: Path):
        # Return a minimal ProjectIR and no errors for testing
        return ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            )
        ), []


class MockGeneratorPlugin(GeneratorPlugin):
    """Mock generator plugin for testing."""
    
    def name(self) -> str:
        return "Mock Generator Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "A mock generator plugin for testing"
    
    def supported_formats(self) -> List[str]:
        return ["test"]
    
    def generate(self, ir: ProjectIR, target_directory: Path):
        # Return no errors for testing
        return []


class MockTransformPlugin(TransformPlugin):
    """Mock transform plugin for testing."""
    
    def name(self) -> str:
        return "Mock Transform Plugin"
    
    def version(self) -> str:
        return "1.0.0"
    
    def description(self) -> str:
        return "A mock transform plugin for testing"
    
    def transform(self, ir: ProjectIR):
        # Return the same IR and no errors for testing
        return ir, []


class TestPluginProtocols(unittest.TestCase):
    """Test plugin protocols."""
    
    def test_plugin_protocol(self):
        """Test that plugin implementations satisfy the protocol."""
        plugin = MockPlugin()
        
        self.assertEqual(plugin.name(), "Mock Plugin")
        self.assertEqual(plugin.version(), "1.0.0")
        self.assertEqual(plugin.description(), "A mock plugin for testing")
    
    def test_parser_plugin_protocol(self):
        """Test that parser plugin implementation satisfies the protocol."""
        plugin = MockParserPlugin()
        
        self.assertEqual(plugin.name(), "Mock Parser Plugin")
        self.assertEqual(plugin.version(), "1.0.0")
        self.assertEqual(plugin.description(), "A mock parser plugin for testing")
        self.assertEqual(plugin.supported_extensions(), [".test"])
        
        # Test parsing method
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = Path(temp_dir) / "test.test"
            file_path.write_text("test content")
            
            ir, errors = plugin.parse(file_path)
            
            self.assertIsInstance(ir, ProjectIR)
            self.assertEqual(len(errors), 0)
            self.assertEqual(ir.metadata.name, "Test Project")
    
    def test_generator_plugin_protocol(self):
        """Test that generator plugin implementation satisfies the protocol."""
        plugin = MockGeneratorPlugin()
        
        self.assertEqual(plugin.name(), "Mock Generator Plugin")
        self.assertEqual(plugin.version(), "1.0.0")
        self.assertEqual(plugin.description(), "A mock generator plugin for testing")
        self.assertEqual(plugin.supported_formats(), ["test"])
        
        # Test generation method
        ir = ProjectIR(metadata=ProjectMetadata(name="Test", project_id="test", version="1.0.0"))
        with tempfile.TemporaryDirectory() as temp_dir:
            target_path = Path(temp_dir)
            errors = plugin.generate(ir, target_path)
            
            self.assertEqual(len(errors), 0)
    
    def test_transform_plugin_protocol(self):
        """Test that transform plugin implementation satisfies the protocol."""
        plugin = MockTransformPlugin()
        
        self.assertEqual(plugin.name(), "Mock Transform Plugin")
        self.assertEqual(plugin.version(), "1.0.0")
        self.assertEqual(plugin.description(), "A mock transform plugin for testing")
        
        # Test transform method
        original_ir = ProjectIR(
            metadata=ProjectMetadata(
                name="Original Project",
                project_id="original_project",
                version="1.0.0"
            )
        )
        new_ir, errors = plugin.transform(original_ir)
        
        self.assertEqual(len(errors), 0)
        self.assertEqual(new_ir.metadata.name, "Original Project")


class TestPluginManager(unittest.TestCase):
    """Test PluginManager class."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Create a temp directory with test plugin files
        self.temp_dir = tempfile.mkdtemp()
        
    def test_plugin_manager_initialization(self):
        """Test initializing the plugin manager."""
        manager = PluginManager()
        
        # Should have empty lists initially
        self.assertEqual(len(manager.get_all_plugins()), 0)
        self.assertEqual(len(manager.get_parser_plugins()), 0)
        self.assertEqual(len(manager.get_generator_plugins()), 0)
        self.assertEqual(len(manager.get_transform_plugins()), 0)
    
    def test_register_plugin(self):
        """Test registering a plugin."""
        manager = PluginManager()
        plugin = MockPlugin()
        
        # Access the private method to register the plugin
        manager._register_plugin(plugin)
        
        all_plugins = manager.get_all_plugins()
        self.assertEqual(len(all_plugins), 1)
        self.assertEqual(all_plugins[0].name(), "Mock Plugin")
    
    def test_register_parser_plugin(self):
        """Test registering a parser plugin."""
        manager = PluginManager()
        plugin = MockParserPlugin()
        
        manager._register_plugin(plugin)
        
        parser_plugins = manager.get_parser_plugins()
        self.assertEqual(len(parser_plugins), 1)
        self.assertEqual(parser_plugins[0].name(), "Mock Parser Plugin")
        self.assertEqual(len(manager.get_all_plugins()), 1)
    
    def test_register_generator_plugin(self):
        """Test registering a generator plugin."""
        manager = PluginManager()
        plugin = MockGeneratorPlugin()
        
        manager._register_plugin(plugin)
        
        generator_plugins = manager.get_generator_plugins()
        self.assertEqual(len(generator_plugins), 1)
        self.assertEqual(generator_plugins[0].name(), "Mock Generator Plugin")
        self.assertEqual(len(manager.get_all_plugins()), 1)
    
    def test_register_transform_plugin(self):
        """Test registering a transform plugin."""
        manager = PluginManager()
        plugin = MockTransformPlugin()
        
        manager._register_plugin(plugin)
        
        transform_plugins = manager.get_transform_plugins()
        self.assertEqual(len(transform_plugins), 1)
        self.assertEqual(transform_plugins[0].name(), "Mock Transform Plugin")
        self.assertEqual(len(manager.get_all_plugins()), 1)
    
    def test_get_plugin_by_name(self):
        """Test getting a plugin by name."""
        manager = PluginManager()
        plugin = MockPlugin()
        
        manager._register_plugin(plugin)
        
        found_plugin = manager.get_plugin_by_name("Mock Plugin")
        self.assertIsNotNone(found_plugin)
        self.assertEqual(found_plugin.name(), "Mock Plugin")
        
        missing_plugin = manager.get_plugin_by_name("Nonexistent Plugin")
        self.assertIsNone(missing_plugin)


if __name__ == '__main__':
    unittest.main()