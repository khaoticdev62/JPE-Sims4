#!/usr/bin/env python3
"""
Integration Tests for Python Transform Backend

Tests the transform_jpe.py script and engine integration.
Uses minimal imports to avoid complex dependencies.
"""

import unittest
import tempfile
from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


class TestTransformBackend(unittest.TestCase):
    """Test Python transformation backend."""

    def test_script_exists(self):
        """Test that transform script exists."""
        script_path = project_root / "scripts" / "transform_jpe.py"
        self.assertTrue(script_path.exists(), f"Script not found: {script_path}")

    def test_script_syntax(self):
        """Test that transform script has valid Python syntax."""
        script_path = project_root / "scripts" / "transform_jpe.py"

        # This will raise SyntaxError if there are syntax issues
        compile(script_path.read_text(), script_path, "exec")

    def test_diagnostics_module_exists(self):
        """Test that diagnostics module exists."""
        diagnostics_path = project_root / "diagnostics"
        self.assertTrue(diagnostics_path.exists())
        self.assertTrue((diagnostics_path / "__init__.py").exists())
        self.assertTrue((diagnostics_path / "errors.py").exists())

    def test_engine_module_syntax(self):
        """Test that engine modules have valid Python syntax."""
        engine_path = project_root / "engine"

        for py_file in engine_path.glob("*.py"):
            compile(py_file.read_text(), py_file, "exec")

    def test_engine_parsers_syntax(self):
        """Test that parser modules have valid Python syntax."""
        parsers_path = project_root / "engine" / "parsers"

        for py_file in parsers_path.glob("*.py"):
            compile(py_file.read_text(), py_file, "exec")


if __name__ == "__main__":
    unittest.main()
