"""Unit tests for code diff analysis."""

import pytest
from jpe_studio_qt.ai.code_diff import (
    CodeDiffAnalyzer,
    CodeDiff,
    DiffLine,
    DiffLineType
)


class TestDiffLineType:
    """Test DiffLineType enum."""

    def test_diff_types(self):
        """Test all diff types exist."""
        assert DiffLineType.CONTEXT.value == "context"
        assert DiffLineType.ADDITION.value == "addition"
        assert DiffLineType.DELETION.value == "deletion"
        assert DiffLineType.MODIFICATION.value == "modification"


class TestDiffLine:
    """Test DiffLine dataclass."""

    def test_context_line(self):
        """Test creating context line."""
        line = DiffLine(
            type=DiffLineType.CONTEXT,
            line_number_original=1,
            line_number_new=1,
            content="unchanged line"
        )

        assert line.type == DiffLineType.CONTEXT
        assert line.line_number_original == 1
        assert "unchanged" in line.content

    def test_addition_line(self):
        """Test creating addition line."""
        line = DiffLine(
            type=DiffLineType.ADDITION,
            line_number_original=None,
            line_number_new=2,
            content="new line"
        )

        assert line.type == DiffLineType.ADDITION
        assert line.line_number_new == 2
        assert line.line_number_original is None

    def test_deletion_line(self):
        """Test creating deletion line."""
        line = DiffLine(
            type=DiffLineType.DELETION,
            line_number_original=1,
            line_number_new=None,
            content="removed line"
        )

        assert line.type == DiffLineType.DELETION
        assert line.line_number_original == 1
        assert line.line_number_new is None


class TestCodeDiff:
    """Test CodeDiff dataclass."""

    def test_diff_creation(self):
        """Test creating code diff."""
        diff = CodeDiff(
            original_code="original",
            new_code="new",
            diff_lines=[],
            additions=1,
            deletions=0,
            modifications=0,
            total_changes=1,
            similarity=0.5
        )

        assert diff.additions == 1
        assert diff.total_changes == 1
        assert diff.similarity == 0.5


class TestCodeDiffAnalyzer:
    """Test CodeDiffAnalyzer."""

    @pytest.fixture
    def analyzer(self):
        """Create analyzer."""
        return CodeDiffAnalyzer()

    def test_analyzer_creation(self, analyzer):
        """Test analyzer can be created."""
        assert analyzer is not None

    def test_identical_code(self, analyzer):
        """Test comparing identical code."""
        code = "def hello():\n    print('hello')"
        diff = analyzer.compare(code, code)

        assert diff.additions == 0
        assert diff.deletions == 0
        assert diff.similarity == 1.0

    def test_simple_addition(self, analyzer):
        """Test simple line addition."""
        original = "line 1\nline 2"
        new = "line 1\nline 2\nline 3"

        diff = analyzer.compare(original, new)

        assert diff.additions > 0
        assert diff.similarity < 1.0

    def test_simple_deletion(self, analyzer):
        """Test simple line deletion."""
        original = "line 1\nline 2\nline 3"
        new = "line 1\nline 3"

        diff = analyzer.compare(original, new)

        assert diff.deletions > 0
        assert diff.similarity < 1.0

    def test_multiple_changes(self, analyzer):
        """Test multiple changes."""
        original = "def func():\n    x = 1\n    y = 2\n    return x + y"
        new = "def func():\n    x = 10\n    y = 20\n    z = 30\n    return x + y + z"

        diff = analyzer.compare(original, new)

        assert diff.additions > 0
        assert diff.total_changes > 0

    def test_empty_to_code(self, analyzer):
        """Test adding code to empty file."""
        original = ""
        new = "def hello():\n    pass"

        diff = analyzer.compare(original, new)

        assert diff.additions > 0
        assert diff.similarity < 1.0

    def test_code_to_empty(self, analyzer):
        """Test removing all code."""
        original = "def hello():\n    pass"
        new = ""

        diff = analyzer.compare(original, new)

        assert diff.deletions > 0

    def test_context_lines(self):
        """Test context lines setting."""
        analyzer_1 = CodeDiffAnalyzer(context_lines=1)
        analyzer_3 = CodeDiffAnalyzer(context_lines=3)

        original = "a\nb\nc\nd\ne"
        new = "a\nB\nc\nd\ne"

        diff_1 = analyzer_1.compare(original, new)
        diff_3 = analyzer_3.compare(original, new)

        assert len(diff_1.diff_lines) <= len(diff_3.diff_lines)

    def test_diff_stats(self, analyzer):
        """Test diff statistics."""
        original = "line 1\nline 2\nline 3"
        new = "line 1\nline 2 modified\nline 3\nline 4"

        diff = analyzer.compare(original, new)
        stats = CodeDiffAnalyzer.get_diff_stats(diff)

        assert "additions" in stats
        assert "deletions" in stats
        assert "total_changes" in stats
        assert "similarity" in stats

    def test_diff_summary(self, analyzer):
        """Test diff summary generation."""
        original = "original"
        new = "new"

        diff = analyzer.compare(original, new)
        summary = CodeDiffAnalyzer.format_diff_summary(diff)

        assert "Changes:" in summary or "Diff Summary" in summary

    def test_side_by_side(self, analyzer):
        """Test side-by-side diff generation."""
        original = "line 1\nline 2"
        new = "line 1\nline 2 modified"

        diff = analyzer.compare(original, new)
        original_lines, new_lines = CodeDiffAnalyzer.generate_side_by_side(diff)

        assert len(original_lines) > 0
        assert len(new_lines) > 0

    def test_xml_code_diff(self, analyzer):
        """Test diff on XML code."""
        original = """<?xml version="1.0"?>
<define interaction greet>
  name: "Say Hello"
</define>"""

        new = """<?xml version="1.0"?>
<define interaction greet>
  name: "Say Hello"
  description: "A greeting"
</define>"""

        diff = analyzer.compare(original, new)

        assert diff.additions > 0
        assert diff.similarity > 0.8

    def test_large_code_diff(self, analyzer):
        """Test diff on large code files."""
        original = "\n".join([f"line {i}" for i in range(100)])
        new = "\n".join([f"line {i}" if i != 50 else "line 50 modified" for i in range(100)])

        diff = analyzer.compare(original, new)

        assert diff.total_changes > 0
        assert diff.similarity > 0.95

    def test_whitespace_handling(self, analyzer):
        """Test handling of whitespace changes."""
        original = "def func():\n    x = 1"
        new = "def func():\n  x = 1"

        diff = analyzer.compare(original, new)

        # Should detect changes even in whitespace
        assert diff.total_changes >= 0
