"""Unit tests for AI error analysis."""

import pytest
from unittest.mock import Mock, patch

from jpe_studio_qt.ai.error_analyzer import (
    AIErrorAnalyzer,
    ErrorAnalysisRequest,
    ErrorExplanation,
    ErrorExplanationType
)


class TestErrorAnalysisRequest:
    """Test ErrorAnalysisRequest."""

    def test_default_request(self):
        """Test default request."""
        request = ErrorAnalysisRequest(
            error_code="ERR_001",
            error_message="Unexpected token",
            error_details="Line 42: Unexpected token <"
        )

        assert request.error_code == "ERR_001"
        assert request.error_message == "Unexpected token"
        assert request.file_context == ""

    def test_full_request(self):
        """Test full request."""
        request = ErrorAnalysisRequest(
            error_code="ERR_001",
            error_message="Unexpected token",
            error_details="Line 42 details",
            file_context="<define>...",
            request_id="req_123"
        )

        assert request.request_id == "req_123"
        assert request.file_context == "<define>..."


class TestErrorExplanation:
    """Test ErrorExplanation."""

    def test_explanation_creation(self):
        """Test creating explanation."""
        explanation = ErrorExplanation(
            error_code="ERR_001",
            root_cause="Missing closing tag",
            explanation="The XML parser expected a closing tag",
            fix_suggestions=["Add closing tag", "Fix XML structure"],
            prevention_tips=["Always close tags", "Validate XML"],
            related_errors=["ERR_002", "ERR_003"],
            severity_assessment="Critical",
            confidence=0.95
        )

        assert explanation.error_code == "ERR_001"
        assert explanation.confidence == 0.95
        assert len(explanation.fix_suggestions) == 2


class TestAIErrorAnalyzer:
    """Test AIErrorAnalyzer."""

    @pytest.fixture
    def analyzer(self):
        """Create analyzer with mock client."""
        client = Mock()
        return AIErrorAnalyzer(client)

    def test_analyzer_creation(self, analyzer):
        """Test analyzer can be created."""
        assert analyzer is not None

    def test_no_client_error(self):
        """Test error when no client."""
        analyzer = AIErrorAnalyzer(None)

        request = ErrorAnalysisRequest(
            error_code="ERR_001",
            error_message="test",
            error_details="details"
        )
        result = analyzer.analyze(request)

        assert result.error_code == "ERR_001"
        assert result.confidence == 0.0

    def test_analyze_with_client(self, analyzer):
        """Test analysis with mock client."""
        analyzer._client.generate_content = Mock(
            return_value='{"root_cause": "Missing tag", "explanation": "test", "fix_suggestions": ["Fix it"], "prevention_tips": ["Tip"], "related_errors": "ERR_002", "severity": "Critical", "confidence": 0.9}'
        )

        request = ErrorAnalysisRequest(
            error_code="ERR_001",
            error_message="test",
            error_details="details"
        )
        result = analyzer.analyze(request)

        assert result.confidence == 0.9
        assert "Missing tag" in result.root_cause

    def test_cache_hit(self, analyzer):
        """Test caching."""
        analyzer._analysis_cache["ERR_001"] = ErrorExplanation(
            error_code="ERR_001",
            root_cause="Cached",
            explanation="Cached result",
            fix_suggestions=[],
            prevention_tips=[],
            related_errors=[],
            severity_assessment="Critical",
            confidence=0.8
        )

        request = ErrorAnalysisRequest(
            error_code="ERR_001",
            error_message="test",
            error_details="details"
        )
        result = analyzer.analyze(request)

        assert result.root_cause == "Cached"

    def test_clear_cache(self, analyzer):
        """Test cache clearing."""
        analyzer._analysis_cache["key"] = "value"
        assert len(analyzer._analysis_cache) > 0

        analyzer.clear_cache()

        assert len(analyzer._analysis_cache) == 0

    def test_set_client(self, analyzer):
        """Test setting client."""
        new_client = Mock()
        analyzer.set_client(new_client)
        assert analyzer._client == new_client

    def test_analyzer_signals(self, analyzer):
        """Test analyzer has signals."""
        assert hasattr(analyzer, 'analysis_started')
        assert hasattr(analyzer, 'analysis_completed')
        assert hasattr(analyzer, 'analysis_failed')
        assert hasattr(analyzer, 'progress')

    def test_prompt_creation(self, analyzer):
        """Test prompt creation."""
        request = ErrorAnalysisRequest(
            error_code="ERR_001",
            error_message="Unexpected token",
            error_details="Line 42 error",
            file_context="<code>"
        )

        prompt = analyzer._create_analysis_prompt(request)

        assert "ERR_001" in prompt
        assert "Unexpected token" in prompt
        assert "<code>" in prompt
        assert "JSON" in prompt or "json" in prompt.lower()

    def test_parse_valid_response(self, analyzer):
        """Test parsing valid response."""
        response = '{"root_cause": "Missing tag", "explanation": "The parser expected a closing tag", "fix_suggestions": ["Add tag"], "prevention_tips": ["Validate"], "related_errors": "ERR_002", "severity": "Critical", "confidence": 0.92}'

        result = analyzer._parse_analysis_response(response, "ERR_001")

        assert result.confidence == 0.92
        assert "Missing tag" in result.root_cause

    def test_parse_invalid_json(self, analyzer):
        """Test parsing invalid JSON."""
        response = "not json"

        result = analyzer._parse_analysis_response(response, "ERR_001")

        assert result.confidence == 0.0

    def test_parse_empty_response(self, analyzer):
        """Test parsing empty response."""
        result = analyzer._parse_analysis_response("", "ERR_001")

        assert result.confidence == 0.0


class TestErrorSeverityPrediction:
    """Test error severity prediction."""

    def test_fatal_error(self):
        """Test fatal error detection."""
        severity = AIErrorAnalyzer.categorize_error_severity("FATAL_ERROR")
        assert severity == "Critical"

    def test_error_detection(self):
        """Test error detection."""
        severity = AIErrorAnalyzer.categorize_error_severity("PARSER_ERROR")
        assert severity == "Important"

    def test_warning_detection(self):
        """Test warning detection."""
        severity = AIErrorAnalyzer.categorize_error_severity("PARSER_WARNING")
        assert severity == "Minor"

    def test_unknown_detection(self):
        """Test unknown type."""
        severity = AIErrorAnalyzer.categorize_error_severity("SOMETHING")
        assert severity == "Unknown"
