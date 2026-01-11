"""Tests for CC Manager Plugin."""

import unittest
import tempfile
import sys
import os
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from plugins.ccmanager_plugin.file_indexer import CCFileIndexer
from plugins.ccmanager_plugin.metadata_extractor import CCMetadataExtractor


class TestCCManagerLogic(unittest.TestCase):
    """Test core indexing and extraction logic."""
    
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.base_path = Path(self.temp_dir.name)
        
        # Create dummy mod files
        (self.base_path / "mod1.package").write_text("DBPF content")
        (self.base_path / "script1.ts4script").write_text("ZIP content")
        
    def tearDown(self):
        self.temp_dir.cleanup()
        
    def test_indexing(self):
        """Test file indexing."""
        indexer = CCFileIndexer([self.base_path])
        index = indexer.scan()
        
        self.assertEqual(len(index), 2)
        # Check if keys exist
        names = [info["name"] for info in index.values()]
        self.assertIn("mod1.package", names)
        self.assertIn("script1.ts4script", names)
        
    def test_metadata_extraction(self):
        """Test basic metadata detection."""
        extractor = CCMetadataExtractor()
        
        package_meta = extractor.extract(self.base_path / "mod1.package")
        self.assertEqual(package_meta["type"], "DBPF")
        
        script_meta = extractor.extract(self.base_path / "script1.ts4script")
        self.assertEqual(script_meta["type"], "TS4Script")


if __name__ == '__main__':
    unittest.main()
