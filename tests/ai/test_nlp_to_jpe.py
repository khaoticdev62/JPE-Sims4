"""Unit tests for NLP to JPE conversion."""

import pytest
from unittest.mock import Mock, patch

from jpe_studio_qt.ai.nlp_to_jpe import (
    NLPToJPEConverter,
    ConversionRequest,
    ConversionResult,
    ConversionType
)


class TestConversionType:
    """Test ConversionType enum."""

    def test_conversion_types(self):
        """Test all conversion types exist."""
        assert ConversionType.INTERACTION.value == "interaction"
        assert ConversionType.BUFF.value == "buff"
        assert ConversionType.STATISTIC.value == "statistic"
        assert ConversionType.TRAIT.value == "trait"
        assert ConversionType.RELATIONSHIP.value == "relationship"
        assert ConversionType.LOOT_ACTION.value == "loot_action"
        assert ConversionType.TEST_SET.value == "test_set"
        assert ConversionType.STATE_MACHINE.value == "state_machine"
        assert ConversionType.CUSTOM.value == "custom"


class TestConversionRequest:
    """Test ConversionRequest dataclass."""

    def test_default_request(self):
        """Test creating request with defaults."""
        request = ConversionRequest(natural_language="add an interaction")

        assert request.natural_language == "add an interaction"
        assert request.current_context == ""
        assert request.suggested_type == ConversionType.INTERACTION
        assert request.request_id is None

    def test_full_request(self):
        """Test creating full request."""
        request = ConversionRequest(
            natural_language="create a buff",
            current_context="<define interaction>...</define>",
            suggested_type=ConversionType.BUFF,
            request_id="req_123"
        )

        assert request.natural_language == "create a buff"
        assert request.current_context == "<define interaction>...</define>"
        assert request.suggested_type == ConversionType.BUFF
        assert request.request_id == "req_123"


class TestConversionResult:
    """Test ConversionResult dataclass."""

    def test_success_result(self):
        """Test successful result."""
        result = ConversionResult(
            status="success",
            jpe_code="<?xml...>",
            explanation="This creates...",
            confidence=0.95,
            request_id="req_123"
        )

        assert result.status == "success"
        assert result.jpe_code == "<?xml...>"
        assert result.explanation == "This creates..."
        assert result.confidence == 0.95

    def test_failed_result(self):
        """Test failed result."""
        result = ConversionResult(
            status="failed",
            error="API error"
        )

        assert result.status == "failed"
        assert result.error == "API error"
        assert result.jpe_code is None


class TestNLPToJPEConverter:
    """Test NLPToJPEConverter."""

    @pytest.fixture
    def converter(self):
        """Create converter with mock client."""
        client = Mock()
        return NLPToJPEConverter(client)

    def test_converter_creation(self, converter):
        """Test converter can be created."""
        assert converter is not None

    def test_no_client_error(self):
        """Test error when no client."""
        converter = NLPToJPEConverter(None)

        request = ConversionRequest(natural_language="test")
        result = converter.convert(request)

        assert result.status == "failed"
        assert "client not available" in result.error.lower()

    def test_convert_with_client(self, converter):
        """Test conversion with mock client."""
        client = Mock()
        client.generate_content = Mock(
            return_value='{"code": "<?xml...>", "explanation": "test", "confidence": 0.95}'
        )
        converter._client = client

        request = ConversionRequest(natural_language="add interaction")
        result = converter.convert(request)

        assert result.status == "success"
        assert result.confidence == 0.95

    def test_detect_nlp_trigger_with_prefix(self):
        """Test detecting // prefix."""
        text = "<?xml>\n// add interaction\n<define>"
        cursor_pos = 15  # In the // line

        nlp_text = NLPToJPEConverter.detect_nlp_trigger(text, cursor_pos)

        assert nlp_text == "add interaction"

    def test_detect_nlp_trigger_no_prefix(self):
        """Test no trigger without //."""
        text = "<?xml>\nadd interaction\n<define>"
        cursor_pos = 15

        nlp_text = NLPToJPEConverter.detect_nlp_trigger(text, cursor_pos)

        assert nlp_text is None

    def test_detect_nlp_trigger_empty(self):
        """Test empty trigger line."""
        text = "<?xml>\n//\n<define>"
        cursor_pos = 12

        nlp_text = NLPToJPEConverter.detect_nlp_trigger(text, cursor_pos)

        assert nlp_text is None

    def test_infer_interaction_type(self):
        """Test inferring interaction type."""
        result = NLPToJPEConverter.infer_conversion_type("add an interaction")
        assert result == ConversionType.INTERACTION

    def test_infer_buff_type(self):
        """Test inferring buff type."""
        result = NLPToJPEConverter.infer_conversion_type("create a buff")
        assert result == ConversionType.BUFF

    def test_infer_statistic_type(self):
        """Test inferring statistic type."""
        result = NLPToJPEConverter.infer_conversion_type("add a skill statistic")
        assert result == ConversionType.STATISTIC

    def test_infer_trait_type(self):
        """Test inferring trait type."""
        result = NLPToJPEConverter.infer_conversion_type("define a personality trait")
        assert result == ConversionType.TRAIT

    def test_infer_test_type(self):
        """Test inferring test type."""
        result = NLPToJPEConverter.infer_conversion_type("create test set")
        assert result == ConversionType.TEST_SET

    def test_infer_default_type(self):
        """Test default inference."""
        result = NLPToJPEConverter.infer_conversion_type("unknown thing")
        assert result == ConversionType.INTERACTION

    def test_prompt_creation(self, converter):
        """Test prompt creation."""
        prompt = converter._create_conversion_prompt(
            "add interaction",
            ConversionType.INTERACTION,
            "<existing>code</existing>"
        )

        assert "add interaction" in prompt
        assert "interaction definition" in prompt
        assert "<existing>code</existing>" in prompt
        assert "JSON" in prompt or "json" in prompt.lower()

    def test_parse_valid_json_response(self, converter):
        """Test parsing valid JSON response."""
        response = '{"code": "<?xml...>", "explanation": "test", "confidence": 0.85}'

        result = converter._parse_conversion_response(response)

        assert result.status == "success"
        assert "<?xml" in result.jpe_code
        assert result.confidence == 0.85

    def test_parse_invalid_json_response(self, converter):
        """Test parsing invalid JSON."""
        response = "not json"

        result = converter._parse_conversion_response(response)

        assert result.status == "failed"
        assert "parse" in result.error.lower() or "json" in result.error.lower()

    def test_parse_empty_response(self, converter):
        """Test parsing empty response."""
        result = converter._parse_conversion_response("")

        assert result.status == "failed"

    def test_parse_missing_code(self, converter):
        """Test parsing response without code."""
        response = '{"explanation": "test", "confidence": 0.9}'

        result = converter._parse_conversion_response(response)

        assert result.status == "failed"
        assert "No code" in result.error

    def test_parse_invalid_xml(self, converter):
        """Test parsing response with invalid XML."""
        response = '{"code": "not xml", "explanation": "test", "confidence": 0.5}'

        result = converter._parse_conversion_response(response)

        assert result.status == "partial"
        assert result.confidence == 0.5
        assert "may not be valid" in result.error.lower()


class TestConverterSignals:
    """Test converter signals."""

    def test_signals_exist(self):
        """Test converter has required signals."""
        converter = NLPToJPEConverter(Mock())

        assert hasattr(converter, 'conversion_started')
        assert hasattr(converter, 'conversion_completed')
        assert hasattr(converter, 'conversion_failed')
        assert hasattr(converter, 'progress')
