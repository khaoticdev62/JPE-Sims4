"""
Natural Language to JPE Code Conversion.

Converts natural language descriptions (via // prefix) into JPE XML code
using Gemini API with specialized prompts.

Features:
- Detect // prefix in code
- Extract natural language description
- Convert to JPE code suggestions
- Handle multiple code patterns
- Fallback for unsupported descriptions
"""

from __future__ import annotations

import logging
import json
from typing import Optional, List
from dataclasses import dataclass
from enum import Enum

from PySide6.QtCore import QObject, Signal

logger = logging.getLogger(__name__)


class ConversionType(Enum):
    """Type of JPE code to generate."""
    INTERACTION = "interaction"       # define interaction
    BUFF = "buff"                     # define buff
    STATISTIC = "statistic"           # define statistic
    TRAIT = "trait"                   # define trait
    RELATIONSHIP = "relationship"     # define relationship
    LOOT_ACTION = "loot_action"       # Loot actions within interaction
    TEST_SET = "test_set"             # define test
    STATE_MACHINE = "state_machine"   # define state machine
    CUSTOM = "custom"                 # Custom XML snippet


@dataclass
class ConversionRequest:
    """Request for NLP to JPE conversion."""
    natural_language: str              # User's natural language description
    current_context: str = ""          # Current code context for reference
    suggested_type: ConversionType = ConversionType.INTERACTION
    request_id: Optional[str] = None


@dataclass
class ConversionResult:
    """Result from NLP to JPE conversion."""
    status: str                        # "success", "partial", "failed"
    jpe_code: Optional[str] = None     # Generated JPE code snippet
    suggestions: List[str] = None      # Multiple code suggestions
    explanation: str = ""              # Why this code was generated
    confidence: float = 0.0            # 0-1.0 confidence in result
    error: Optional[str] = None        # Error message if failed
    request_id: Optional[str] = None


class NLPToJPEConverter(QObject):
    """
    Converts natural language descriptions to JPE code.

    Uses Gemini API to interpret user intent and generate appropriate
    JPE XML code structures.

    Example:
        converter = NLPToJPEConverter(gemini_client)

        # User typed: "// add an interaction that displays a message"
        request = ConversionRequest(
            natural_language="add an interaction that displays a message",
            suggested_type=ConversionType.INTERACTION
        )

        result = converter.convert(request)
        if result.status == "success":
            print(result.jpe_code)  # JPE XML code
    """

    # Signals
    conversion_started = Signal()                           # Request initiated
    conversion_completed = Signal(ConversionResult)         # Result ready
    conversion_failed = Signal(str)                         # Error message
    progress = Signal(str)                                  # Progress message

    def __init__(self, gemini_client: object) -> None:
        """
        Initialize converter.

        Args:
            gemini_client: GeminiClient instance for API calls
        """
        super().__init__()
        self._client = gemini_client
        self._last_request_id: Optional[str] = None

    def set_client(self, client: object) -> None:
        """Update Gemini client."""
        self._client = client

    def convert(self, request: ConversionRequest) -> ConversionResult:
        """
        Convert natural language to JPE code (synchronous).

        Args:
            request: ConversionRequest with natural language description

        Returns:
            ConversionResult with generated code or error
        """
        if not self._client:
            return ConversionResult(
                status="failed",
                error="Gemini client not available",
                request_id=request.request_id
            )

        self._last_request_id = request.request_id
        self.conversion_started.emit()

        try:
            self.progress.emit(f"Converting: {request.natural_language[:50]}...")

            # Create specialized prompt
            prompt = self._create_conversion_prompt(
                request.natural_language,
                request.suggested_type,
                request.current_context
            )

            # Call Gemini
            self.progress.emit("Requesting code generation from Gemini...")
            response = self._client.generate_content(prompt)

            if not response:
                return ConversionResult(
                    status="failed",
                    error="Empty response from Gemini",
                    request_id=request.request_id
                )

            # Parse response
            result = self._parse_conversion_response(response, request.request_id)
            self.conversion_completed.emit(result)
            return result

        except Exception as e:
            error_msg = f"Conversion failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self.conversion_failed.emit(error_msg)

            return ConversionResult(
                status="failed",
                error=error_msg,
                request_id=request.request_id
            )

    def _create_conversion_prompt(self, natural_language: str,
                                 code_type: ConversionType,
                                 context: str) -> str:
        """Create Gemini prompt for NLP to JPE conversion."""
        type_descriptions = {
            ConversionType.INTERACTION: "JPE interaction definition (define interaction tag)",
            ConversionType.BUFF: "JPE buff definition (define buff tag)",
            ConversionType.STATISTIC: "JPE statistic definition (define statistic tag)",
            ConversionType.TRAIT: "JPE trait definition (define trait tag)",
            ConversionType.LOOT_ACTION: "JPE loot action (part of interaction)",
            ConversionType.TEST_SET: "JPE test set definition (define test tag)",
            ConversionType.STATE_MACHINE: "JPE state machine (define state_machine tag)",
            ConversionType.CUSTOM: "JPE XML snippet (any valid JPE XML)",
        }

        type_desc = type_descriptions.get(code_type, "JPE XML code")

        prompt = f"""Convert the following natural language description to {type_desc}.

User Request:
{natural_language}

Current Code Context:
{context if context else "(no context)"}

Requirements:
1. Generate valid JPE XML code that matches the user's request
2. Use appropriate JPE XML tags and attributes
3. Include realistic values for properties (names, icons, descriptions)
4. Add inline comments explaining complex parts
5. Ensure the code is syntactically correct XML

Please provide:
1. The complete {type_desc} code
2. A brief explanation of what the code does
3. A confidence score (0-1) in how well it matches the user's request

Format your response as JSON with this structure:
{{
    "code": "<?xml version=\\"1.0\\"?>\\n<define ...>...</define>",
    "explanation": "This code creates...",
    "confidence": 0.95,
    "type": "{code_type.value}"
}}

Generate ONLY valid JSON, no other text."""

        return prompt

    def _parse_conversion_response(self, response: str,
                                  request_id: Optional[str] = None) -> ConversionResult:
        """Parse Gemini response into ConversionResult."""
        if not response:
            return ConversionResult(
                status="failed",
                error="Empty response",
                request_id=request_id
            )

        try:
            import re
            # Extract JSON from response
            match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response, re.DOTALL)
            if not match:
                return ConversionResult(
                    status="failed",
                    error="Could not parse JSON from response",
                    request_id=request_id
                )

            json_str = match.group(0)
            data = json.loads(json_str)

            jpe_code = data.get("code", "")
            explanation = data.get("explanation", "")
            confidence = float(data.get("confidence", 0.0))

            if not jpe_code:
                return ConversionResult(
                    status="failed",
                    error="No code generated",
                    request_id=request_id
                )

            # Validate basic JPE XML structure
            if not (jpe_code.startswith("<?xml") or jpe_code.startswith("<define")):
                return ConversionResult(
                    status="partial",
                    jpe_code=jpe_code,
                    explanation=explanation,
                    confidence=confidence,
                    error="Code may not be valid JPE XML",
                    request_id=request_id
                )

            return ConversionResult(
                status="success",
                jpe_code=jpe_code,
                explanation=explanation,
                confidence=confidence,
                request_id=request_id
            )

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return ConversionResult(
                status="failed",
                error=f"Failed to parse response: {str(e)}",
                request_id=request_id
            )
        except Exception as e:
            logger.error(f"Parsing error: {e}", exc_info=True)
            return ConversionResult(
                status="failed",
                error=f"Unexpected error: {str(e)}",
                request_id=request_id
            )

    @staticmethod
    def detect_nlp_trigger(text: str, cursor_pos: int) -> Optional[str]:
        """
        Detect // natural language trigger in text.

        Args:
            text: Full editor text
            cursor_pos: Current cursor position

        Returns:
            Natural language text after // on current line, or None
        """
        lines = text.split('\n')

        # Find which line the cursor is on
        chars_counted = 0
        current_line_idx = 0

        for i, line in enumerate(lines):
            if chars_counted + len(line) + 1 >= cursor_pos:
                current_line_idx = i
                break
            chars_counted += len(line) + 1

        current_line = lines[current_line_idx] if current_line_idx < len(lines) else ""

        # Check if line starts with //
        if not current_line.strip().startswith("//"):
            return None

        # Extract text after //
        nlp_text = current_line.strip()[2:].strip()

        if not nlp_text:
            return None

        return nlp_text

    @staticmethod
    def infer_conversion_type(natural_language: str) -> ConversionType:
        """
        Infer the JPE code type from natural language description.

        Args:
            natural_language: User's description

        Returns:
            Suggested ConversionType
        """
        text_lower = natural_language.lower()

        type_keywords = {
            ConversionType.INTERACTION: ["interaction", "action", "button", "event"],
            ConversionType.BUFF: ["buff", "benefit", "effect", "status"],
            ConversionType.STATISTIC: ["statistic", "skill", "motive", "attribute"],
            ConversionType.TRAIT: ["trait", "characteristic", "personality"],
            ConversionType.RELATIONSHIP: ["relationship", "relation", "sim", "friend"],
            ConversionType.TEST_SET: ["test", "testing", "validate"],
            ConversionType.STATE_MACHINE: ["state", "machine", "flow", "transition"],
            ConversionType.LOOT_ACTION: ["loot", "reward", "give", "add"],
        }

        for code_type, keywords in type_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return code_type

        # Default to interaction
        return ConversionType.INTERACTION
