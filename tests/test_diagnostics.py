"""Tests for the diagnostics components."""

import unittest
from pathlib import Path

from diagnostics.errors import (
    EngineError,
    ErrorCategory,
    ErrorSeverity,
    ErrorPosition,
    BuildReport,
)


class TestErrorPosition(unittest.TestCase):
    """Test ErrorPosition class."""

    def test_error_position_creation(self):
        """Test creating an ErrorPosition."""
        pos = ErrorPosition(line=10, column=5)
        self.assertEqual(pos.line, 10)
        self.assertEqual(pos.column, 5)

    def test_error_position_defaults(self):
        """Test ErrorPosition with default values."""
        pos = ErrorPosition()
        self.assertIsNone(pos.line)
        self.assertIsNone(pos.column)


class TestEngineError(unittest.TestCase):
    """Test EngineError class."""

    def test_engine_error_creation(self):
        """Test creating an EngineError."""
        error = EngineError(
            code="TEST_ERROR",
            category=ErrorCategory.VALIDATOR_SEMANTIC,
            severity=ErrorSeverity.ERROR,
            message_short="Test error occurred",
            message_long="This is a test error for validation purposes",
            file_path="test.jpe",
            line_number=10,
            column=5,
        )
        self.assertEqual(error.code, "TEST_ERROR")
        self.assertEqual(error.category, ErrorCategory.VALIDATOR_SEMANTIC)
        self.assertEqual(error.severity, ErrorSeverity.ERROR)
        self.assertEqual(error.message_short, "Test error occurred")
        self.assertEqual(
            error.message_long, "This is a test error for validation purposes"
        )
        self.assertEqual(error.file_path, "test.jpe")
        self.assertEqual(error.line_number, 10)
        self.assertEqual(error.column, 5)

    def test_engine_error_defaults(self):
        """Test EngineError with default values."""
        error = EngineError(
            code="SIMPLE_ERROR",
            category=ErrorCategory.PARSER_JPE,
            severity=ErrorSeverity.WARNING,
            message_short="Simple error",
            message_long="Simple error description",
        )
        self.assertIsNone(error.file_path)
        self.assertIsNone(error.line_number)
        self.assertIsNone(error.column)


class TestBuildReport(unittest.TestCase):
    """Test BuildReport class."""

    def test_build_report_creation(self):
        """Test creating a BuildReport."""
        error = EngineError(
            code="TEST_ERROR",
            category=ErrorCategory.PARSER_JPE,
            severity=ErrorSeverity.ERROR,
            message_short="Test error",
            message_long="Test error description",
        )
        warning = EngineError(
            code="TEST_WARNING",
            category=ErrorCategory.PARSER_JPE,
            severity=ErrorSeverity.WARNING,
            message_short="Test warning",
            message_long="Test warning description",
        )

        report = BuildReport(
            build_id="test_build_001",
            status="success",
            errors=[error],
            warnings=[warning],
            info=[],
            timestamp="2026-04-01",
        )

        self.assertEqual(report.build_id, "test_build_001")
        self.assertEqual(report.status, "success")
        self.assertEqual(len(report.errors), 1)
        self.assertEqual(len(report.warnings), 1)
        self.assertEqual(report.errors[0].code, "TEST_ERROR")
        self.assertEqual(report.warnings[0].code, "TEST_WARNING")


class TestErrorCategories(unittest.TestCase):
    """Test error categories and severities."""

    def test_error_categories(self):
        """Test all error category values."""
        self.assertEqual(ErrorCategory.PARSER_JPE.value, "parser_jpe")
        self.assertEqual(ErrorCategory.PARSER_JPE_XML.value, "parser_jpe_xml")
        self.assertEqual(ErrorCategory.PARSER_XML.value, "parser_xml")
        self.assertEqual(ErrorCategory.VALIDATOR_SYNTAX.value, "validator_syntax")
        self.assertEqual(ErrorCategory.VALIDATOR_SEMANTIC.value, "validator_semantic")
        self.assertEqual(ErrorCategory.IO_FILE.value, "io_file")
        self.assertEqual(ErrorCategory.PLUGIN.value, "plugin")

    def test_error_severities(self):
        """Test all error severity values."""
        self.assertEqual(ErrorSeverity.INFO.value, "info")
        self.assertEqual(ErrorSeverity.WARNING.value, "warning")
        self.assertEqual(ErrorSeverity.ERROR.value, "error")
        self.assertEqual(ErrorSeverity.FATAL.value, "fatal")


if __name__ == "__main__":
    unittest.main()
