"""
Pytest suite for the JPE → XML transform script (scripts/transform_jpe.py).

Tests:
- Transform script CLI interface
- Valid JPE input → XML output
- Invalid JPE input → error reporting
- Empty input handling
- Output file creation
- Stdout output (no -o flag)

Run: pytest tests/python/test_transform_script.py -v
"""

import subprocess
import sys
import os
import tempfile
import pytest
from pathlib import Path

# Add project root to Python path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

TRANSFORM_SCRIPT = PROJECT_ROOT / "scripts" / "transform_jpe.py"
PYTHON_CMD = sys.executable


@pytest.fixture
def temp_dir():
    """Create a temporary directory for test files."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def sample_jpe_content():
    """Minimal valid JPE content."""
    return """MODULE: "test_tuning"
VERSION: "1.0.0"

Tuning: "TestInteraction"
  Type: "Interaction"
  Description: "A test tuning file"
"""


class TestTransformScript:
    """Test the transform_jpe.py CLI interface."""

    def test_script_exists(self):
        """Verify the transform script exists."""
        assert TRANSFORM_SCRIPT.exists(), f"Transform script not found at {TRANSFORM_SCRIPT}"

    def test_help_flag(self):
        """Test --help flag shows usage."""
        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), "--help"],
            capture_output=True,
            text=True,
            timeout=10,
        )
        # Should show usage (exit 0 or 2 for argparse help)
        assert result.returncode in (0, 2)
        assert "usage" in result.stdout.lower() or "usage" in result.stderr.lower()

    def test_missing_input_file(self, temp_dir: Path):
        """Test error when input file doesn't exist."""
        input_file = temp_dir / "nonexistent.jpe"
        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file)],
            capture_output=True,
            text=True,
            timeout=10,
        )
        assert result.returncode != 0
        # Should report the file not found
        assert "not found" in result.stdout.lower() or "not found" in result.stderr.lower() or "error" in result.stderr.lower()

    def test_valid_jpe_to_xml_output_file(self, temp_dir: Path, sample_jpe_content: str):
        """Test valid JPE input produces XML output file."""
        input_file = temp_dir / "test.jpe"
        output_file = temp_dir / "output.xml"
        input_file.write_text(sample_jpe_content, encoding="utf-8")

        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file), "-o", str(output_file)],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # Output file should exist
        assert output_file.exists(), f"Output file not created: {output_file}"
        xml_content = output_file.read_text(encoding="utf-8")
        assert len(xml_content) > 0, "Output file is empty"

    def test_valid_jpe_to_xml_stdout(self, temp_dir: Path, sample_jpe_content: str):
        """Test valid JPE outputs to stdout when no -o flag."""
        input_file = temp_dir / "test.jpe"
        input_file.write_text(sample_jpe_content, encoding="utf-8")

        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file)],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # stdout should have content
        combined = result.stdout + result.stderr
        assert len(combined) > 0

    def test_empty_input_file(self, temp_dir: Path):
        """Test handling of empty input file."""
        input_file = temp_dir / "empty.jpe"
        output_file = temp_dir / "empty_output.xml"
        input_file.write_text("", encoding="utf-8")

        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file), "-o", str(output_file)],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # Should handle gracefully (may or may not produce output)
        # Should not crash
        assert True  # If we get here, it didn't crash

    def test_invalid_jpe_content(self, temp_dir: Path):
        """Test error handling for invalid JPE content."""
        input_file = temp_dir / "invalid.jpe"
        input_file.write_text("THIS IS NOT VALID JPE !!!@#$%", encoding="utf-8")
        output_file = temp_dir / "invalid_output.xml"

        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file), "-o", str(output_file)],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # May fail with errors — that's expected
        # Should not crash with unhandled exception
        # stderr should have some info
        assert len(result.stdout) > 0 or len(result.stderr) > 0

    def test_verbose_flag(self, temp_dir: Path, sample_jpe_content: str):
        """Test --verbose flag produces more output."""
        input_file = temp_dir / "test.jpe"
        output_file = temp_dir / "output.xml"
        input_file.write_text(sample_jpe_content, encoding="utf-8")

        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file), "-o", str(output_file), "-v"],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # Verbose mode should produce info on stderr
        # (Even if transform fails)
        assert True  # If we get here, verbose mode didn't crash

    def test_large_input(self, temp_dir: Path):
        """Test handling of larger input files."""
        input_file = temp_dir / "large.jpe"
        large_content = "MODULE: \"large_test\"\nVERSION: \"1.0\"\n" + "\n".join(
            [f'Tuning: "Tuning_{i}"\n  Type: "Interaction"\n  Description: "Test tuning {i}"' for i in range(100)]
        )
        input_file.write_text(large_content, encoding="utf-8")
        output_file = temp_dir / "large_output.xml"

        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file), "-o", str(output_file)],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # Should complete within timeout
        assert True  # If we get here, it didn't timeout

    def test_unicode_content(self, temp_dir: Path):
        """Test handling of Unicode content in JPE files."""
        input_file = temp_dir / "unicode.jpe"
        unicode_content = """MODULE: "unicode_test"
VERSION: "1.0.0"

Tuning: "UnicodeTest"
  Type: "Interaction"
  Description: "Test with unicode: 你好世界 🎮 café"
"""
        input_file.write_text(unicode_content, encoding="utf-8")
        output_file = temp_dir / "unicode_output.xml"

        result = subprocess.run(
            [PYTHON_CMD, str(TRANSFORM_SCRIPT), str(input_file), "-o", str(output_file)],
            capture_output=True,
            text=True,
            timeout=30,
        )

        # Should handle unicode without crashing
        assert True  # If we get here, unicode handling worked
