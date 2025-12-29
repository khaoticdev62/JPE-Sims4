"""Tests for the diagnostics components."""

import unittest
from pathlib import Path

from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity, ErrorPosition, BuildReport


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
            category=ErrorCategory.VALIDATION_SCHEMA,
            severity=ErrorSeverity.ERROR,
            message_short="Test error occurred",
            message_long="This is a test error for validation purposes",
            file_path="test.jpe",
            resource_id="test_resource",
            position=ErrorPosition(line=10, column=5)
        )
        self.assertEqual(error.code, "TEST_ERROR")
        self.assertEqual(error.category, ErrorCategory.VALIDATION_SCHEMA)
        self.assertEqual(error.severity, ErrorSeverity.ERROR)
        self.assertEqual(error.message_short, "Test error occurred")
        self.assertEqual(error.message_long, "This is a test error for validation purposes")
        self.assertEqual(error.file_path, "test.jpe")
        self.assertEqual(error.resource_id, "test_resource")
        self.assertEqual(error.position.line, 10)
        self.assertEqual(error.position.column, 5)
    
    def test_engine_error_defaults(self):
        """Test EngineError with default values."""
        error = EngineError(
            code="SIMPLE_ERROR",
            category=ErrorCategory.PARSER_JPE,
            severity=ErrorSeverity.WARNING,
            message_short="Simple error",
            message_long="Simple error description"
        )
        self.assertIsNone(error.file_path)
        self.assertIsNone(error.resource_id)
        self.assertIsNone(error.position)


class TestBuildReport(unittest.TestCase):
    """Test BuildReport class."""
    
    def test_build_report_creation(self):
        """Test creating a BuildReport."""
        error = EngineError(
            code="TEST_ERROR",
            category=ErrorCategory.VALIDATION_SCHEMA,
            severity=ErrorSeverity.ERROR,
            message_short="Test error",
            message_long="Test error description"
        )
        warning = EngineError(
            code="TEST_WARNING",
            category=ErrorCategory.VALIDATION_SEMANTIC,
            severity=ErrorSeverity.WARNING,
            message_short="Test warning",
            message_long="Test warning description"
        )
        
        report = BuildReport(
            build_id="test_build_001",
            project_id="test_project",
            status="success",
            errors=[error],
            warnings=[warning]
        )
        
        self.assertEqual(report.build_id, "test_build_001")
        self.assertEqual(report.project_id, "test_project")
        self.assertEqual(report.status, "success")
        self.assertEqual(len(report.errors), 1)
        self.assertEqual(len(report.warnings), 1)
        self.assertEqual(report.errors[0].code, "TEST_ERROR")
        self.assertEqual(report.warnings[0].code, "TEST_WARNING")


class TestErrorCategories(unittest.TestCase):
    """Test error categories and severities."""
    
    def test_error_categories(self):
        """Test all error category values."""
        self.assertEqual(ErrorCategory.PARSER_JPE, "parser_jpe")
        self.assertEqual(ErrorCategory.PARSER_JPE_XML, "parser_jpe_xml")
        self.assertEqual(ErrorCategory.PARSER_XML, "parser_xml")
        self.assertEqual(ErrorCategory.VALIDATION_SCHEMA, "validation_schema")
        self.assertEqual(ErrorCategory.VALIDATION_SEMANTIC, "validation_semantic")
        self.assertEqual(ErrorCategory.IO_FILE, "io_file")
        self.assertEqual(ErrorCategory.PLUGIN, "plugin")
        self.assertEqual(ErrorCategory.SYNC_CLOUD, "sync_cloud")
    
    def test_error_severities(self):
        """Test all error severity values."""
        self.assertEqual(ErrorSeverity.INFO, "info")
        self.assertEqual(ErrorSeverity.WARNING, "warning")
        self.assertEqual(ErrorSeverity.ERROR, "error")
        self.assertEqual(ErrorSeverity.FATAL, "fatal")


if __name__ == '__main__':
    unittest.main()