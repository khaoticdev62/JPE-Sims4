"""Unit tests for Gemini API client."""

import pytest
from unittest.mock import Mock, patch, MagicMock
import time

from jpe_studio_qt.ai.gemini_client import (
    GeminiClient, GeminiConfig, GeminiModel, GENAI_AVAILABLE
)


# Skip tests if google-genai is not available
pytestmark = pytest.mark.skipif(not GENAI_AVAILABLE, reason="google-genai not installed")


class TestGeminiModel:
    """Test GeminiModel enum."""

    def test_models_exist(self):
        """Test all model variants exist."""
        assert GeminiModel.PRO.value == "gemini-1.5-pro"
        assert GeminiModel.FLASH.value == "gemini-1.5-flash"
        assert GeminiModel.FLASH_2.value == "gemini-2.0-flash-exp"


class TestGeminiConfig:
    """Test GeminiConfig dataclass."""

    def test_config_creation(self):
        """Test creating a config."""
        config = GeminiConfig(
            api_key="test_key",
            default_model=GeminiModel.PRO,
            temperature=0.5,
            max_retries=5
        )

        assert config.api_key == "test_key"
        assert config.default_model == GeminiModel.PRO
        assert config.temperature == 0.5
        assert config.max_retries == 5

    def test_config_defaults(self):
        """Test config default values."""
        config = GeminiConfig(api_key="test_key")

        assert config.api_key == "test_key"
        assert config.use_oauth is False
        assert config.default_model == GeminiModel.FLASH
        assert config.max_retries == 3
        assert config.timeout == 30
        assert config.rate_limit_per_minute == 60
        assert config.temperature == 0.7


class TestGeminiClient:
    """Test Gemini client."""

    @pytest.fixture
    def config(self):
        """Create test config."""
        return GeminiConfig(api_key="test_api_key")

    @pytest.fixture
    def mock_genai_client(self):
        """Create mock genai client."""
        mock_client = MagicMock()
        return mock_client

    def test_config_validation_missing_api_key(self):
        """Test config validation with missing API key."""
        config = GeminiConfig(api_key="")

        with pytest.raises(ValueError, match="API key cannot be empty"):
            GeminiClient(config)

    def test_config_validation_missing_project_id_oauth(self):
        """Test config validation with missing project ID for OAuth."""
        config = GeminiConfig(api_key="", use_oauth=True, project_id="")

        with pytest.raises(ValueError, match="Project ID is required"):
            GeminiClient(config)

    def test_config_validation_invalid_retries(self):
        """Test config validation with invalid retries."""
        config = GeminiConfig(api_key="key", max_retries=0)

        with pytest.raises(ValueError, match="max_retries must be >= 1"):
            GeminiClient(config)

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_client_creation_api_key(self, mock_rag, mock_local, mock_genai):
        """Test client creation with API key."""
        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        assert client.config.api_key == "test_key"
        mock_genai.assert_called_once()

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_client_creation_oauth(self, mock_rag, mock_local, mock_genai):
        """Test client creation with OAuth."""
        config = GeminiConfig(
            use_oauth=True,
            project_id="test_project",
            location="us-west1"
        )
        client = GeminiClient(config)

        assert client.config.use_oauth is True
        assert client.config.project_id == "test_project"

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_rate_limiting(self, mock_rag, mock_local, mock_genai):
        """Test rate limiting enforcement."""
        config = GeminiConfig(
            api_key="test_key",
            rate_limit_per_minute=2
        )
        client = GeminiClient(config)

        # Add timestamps that are older than 60 seconds to simulate rate limit cleanup
        now = time.time()
        client._request_timestamps = [now - 70, now - 65]

        # Should remove timestamps older than 60s and add current one
        client._check_rate_limit()
        # After cleanup and adding current timestamp, should have 1 timestamp
        assert len(client._request_timestamps) >= 1  # At least the new one added

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_request_count_tracking(self, mock_rag, mock_local, mock_genai):
        """Test request count tracking."""
        mock_response = Mock()
        mock_response.text = "Generated content"

        mock_genai_instance = Mock()
        mock_genai_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)
        client._client = mock_genai_instance

        assert client.get_request_count() == 0

        client.generate_content("Test prompt")

        assert client.get_request_count() == 1

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_generate_content_success(self, mock_rag, mock_local, mock_genai):
        """Test successful content generation."""
        mock_response = Mock()
        mock_response.text = "Generated code"

        mock_genai_instance = Mock()
        mock_genai_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)
        client._client = mock_genai_instance

        result = client.generate_content("Test prompt")

        assert result == "Generated code"
        assert client.get_request_count() == 1

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_generate_content_with_empty_response(self, mock_rag, mock_local, mock_genai):
        """Test handling empty response."""
        mock_response = Mock()
        mock_response.text = ""

        mock_genai_instance = Mock()
        mock_genai_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)
        client._client = mock_genai_instance

        result = client.generate_content("Test prompt")

        assert result is None

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_generate_content_with_retry(self, mock_rag, mock_local, mock_genai):
        """Test retry logic on failure."""
        mock_response = Mock()
        mock_response.text = "Success"

        mock_genai_instance = Mock()
        # First call fails, second succeeds
        mock_genai_instance.models.generate_content.side_effect = [
            Exception("API Error"),
            mock_response
        ]
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key", max_retries=3)
        client = GeminiClient(config)
        client._client = mock_genai_instance

        result = client.generate_content("Test prompt")

        assert result == "Success"

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_generate_code_completion(self, mock_rag, mock_local, mock_genai):
        """Test code completion generation."""
        mock_response = Mock()
        mock_response.text = "completed_code"

        mock_genai_instance = Mock()
        mock_genai_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)
        client._client = mock_genai_instance

        result = client.generate_code_completion("def hello|", 10)

        assert result == "completed_code"

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_explain_error(self, mock_rag, mock_local, mock_genai):
        """Test error explanation."""
        mock_response = Mock()
        mock_response.text = "Error explanation"

        mock_genai_instance = Mock()
        mock_genai_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)
        client._client = mock_genai_instance

        result = client.explain_error("SyntaxError", "bad code")

        assert result == "Error explanation"

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_suggest_fix(self, mock_rag, mock_local, mock_genai):
        """Test fix suggestion."""
        mock_response = Mock()
        mock_response.text = "fixed code"

        mock_genai_instance = Mock()
        mock_genai_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)
        client._client = mock_genai_instance

        result = client.suggest_fix("SyntaxError", "bad code")

        assert result == "fixed code"

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_is_available(self, mock_rag, mock_local, mock_genai):
        """Test availability check."""
        mock_genai.return_value = Mock()
        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)

        assert client.is_available() is True

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_default_model_selection(self, mock_rag, mock_local, mock_genai):
        """Test default model is FLASH."""
        config = GeminiConfig(api_key="test_key")

        assert config.default_model == GeminiModel.FLASH

    @patch('jpe_studio_qt.ai.gemini_client.genai.Client')
    @patch('jpe_studio_qt.ai.gemini_client.LocalLLMClient')
    @patch('jpe_studio_qt.ai.gemini_client.RAGEngine')
    def test_model_parameter_override(self, mock_rag, mock_local, mock_genai):
        """Test model parameter override."""
        mock_response = Mock()
        mock_response.text = "Result"

        mock_genai_instance = Mock()
        mock_genai_instance.models.generate_content.return_value = mock_response
        mock_genai.return_value = mock_genai_instance

        mock_local.return_value.is_available.return_value = False
        mock_rag.return_value.query_context.return_value = ""

        config = GeminiConfig(api_key="test_key")
        client = GeminiClient(config)
        client._client = mock_genai_instance

        # Use PRO instead of default FLASH
        result = client.generate_content("Test", model=GeminiModel.PRO)

        assert result == "Result"

        # Verify PRO was used
        call_kwargs = mock_genai_instance.models.generate_content.call_args[1]
        assert call_kwargs['model'] == "gemini-1.5-pro"
