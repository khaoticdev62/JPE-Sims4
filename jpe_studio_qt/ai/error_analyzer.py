"""
AI-Powered Error Analysis and Explanation.

Analyzes build errors and generates helpful explanations using Gemini API.

Features:
- Automatic error analysis
- Root cause explanation
- Fix suggestions
- Severity assessment
- Pattern recognition
- Confidence scoring
"""

from __future__ import annotations

import logging
import json
from typing import Optional, List
from dataclasses import dataclass
from enum import Enum

from PySide6.QtCore import QObject, Signal

logger = logging.getLogger(__name__)


class ErrorExplanationType(Enum):
    """Type of error explanation."""
    ROOT_CAUSE = "root_cause"        # What caused the error
    IMPACT = "impact"                # What this error affects
    FIX_APPROACH = "fix_approach"    # How to fix it
    PREVENTION = "prevention"        # How to avoid in future
    RELATED = "related"              # Related patterns/issues


@dataclass
class ErrorAnalysisRequest:
    """Request for AI error analysis."""
    error_code: str                  # e.g., "PARSER_JPE_001"
    error_message: str               # Short error message
    error_details: str               # Long message with context
    file_context: str = ""           # Code snippet around error
    request_id: Optional[str] = None


@dataclass
class ErrorExplanation:
    """AI-generated explanation for an error."""
    error_code: str
    root_cause: str                  # What caused the error
    explanation: str                 # Detailed explanation
    fix_suggestions: List[str]       # Suggested fixes (top 3)
    prevention_tips: List[str]       # How to avoid this error
    related_errors: List[str]        # Similar error patterns
    severity_assessment: str         # "Critical", "Important", "Minor"
    confidence: float                # 0-1.0 confidence in explanation
    request_id: Optional[str] = None


class AIErrorAnalyzer(QObject):
    """
    Analyzes errors and generates AI explanations.

    Uses Gemini API to provide deep insights into build errors.

    Example:
        analyzer = AIErrorAnalyzer(gemini_client)

        request = ErrorAnalysisRequest(
            error_code="PARSER_JPE_001",
            error_message="Unexpected token: <",
            error_details="Line 42: Expected 'interaction' but found '<'"
        )

        explanation = analyzer.analyze(request)
        print(explanation.root_cause)    # Root cause
        print(explanation.fix_suggestions)  # Top fixes
    """

    # Signals
    analysis_started = Signal()
    analysis_completed = Signal(ErrorExplanation)
    analysis_failed = Signal(str)
    progress = Signal(str)

    def __init__(self, gemini_client: object) -> None:
        """Initialize analyzer."""
        super().__init__()
        self._client = gemini_client
        self._analysis_cache: dict = {}

    def set_client(self, client: object) -> None:
        """Update Gemini client."""
        self._client = client

    def analyze(self, request: ErrorAnalysisRequest) -> ErrorExplanation:
        """
        Analyze error and generate explanation.

        Args:
            request: ErrorAnalysisRequest with error details

        Returns:
            ErrorExplanation with analysis results
        """
        if not self._client:
            return ErrorExplanation(
                error_code=request.error_code,
                root_cause="Error analysis not available",
                explanation="Gemini client not configured",
                fix_suggestions=[],
                prevention_tips=[],
                related_errors=[],
                severity_assessment="Unknown",
                confidence=0.0,
                request_id=request.request_id
            )

        # Check cache
        cache_key = request.error_code
        if cache_key in self._analysis_cache:
            cached = self._analysis_cache[cache_key]
            cached.request_id = request.request_id
            return cached

        self.analysis_started.emit()

        try:
            self.progress.emit(f"Analyzing error: {request.error_code}")

            # Create analysis prompt
            prompt = self._create_analysis_prompt(request)

            # Call Gemini
            self.progress.emit("Requesting error analysis from Gemini...")
            response = self._client.generate_content(prompt)

            if not response:
                return ErrorExplanation(
                    error_code=request.error_code,
                    root_cause="No response from Gemini",
                    explanation="The error analysis request timed out",
                    fix_suggestions=[],
                    prevention_tips=[],
                    related_errors=[],
                    severity_assessment="Unknown",
                    confidence=0.0,
                    request_id=request.request_id
                )

            # Parse response
            explanation = self._parse_analysis_response(response, request.error_code, request.request_id)

            # Cache successful analyses
            if explanation.confidence > 0.5:
                self._analysis_cache[cache_key] = explanation

            self.analysis_completed.emit(explanation)
            return explanation

        except Exception as e:
            error_msg = f"Error analysis failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self.analysis_failed.emit(error_msg)

            return ErrorExplanation(
                error_code=request.error_code,
                root_cause="Analysis failed",
                explanation=str(e),
                fix_suggestions=[],
                prevention_tips=[],
                related_errors=[],
                severity_assessment="Unknown",
                confidence=0.0,
                request_id=request.request_id
            )

    def _create_analysis_prompt(self, request: ErrorAnalysisRequest) -> str:
        """Create Gemini prompt for error analysis."""
        prompt = f"""Analyze this JPE Studio build error and provide a detailed explanation.

Error Code: {request.error_code}
Error Message: {request.error_message}
Error Details: {request.error_details}

Code Context:
{request.file_context if request.file_context else "(no context available)"}

Please provide a comprehensive analysis including:

1. ROOT_CAUSE: What caused this error? Be specific about the problem.

2. EXPLANATION: Detailed explanation of why this error occurs and what it means.

3. FIX_SUGGESTIONS: Top 3 ways to fix this error. Be concrete and actionable.
   Format as a numbered list.

4. PREVENTION_TIPS: How to avoid this error in the future.
   Format as a bulleted list (2-3 tips).

5. RELATED_ERRORS: Similar error patterns developers might encounter.
   Format as a comma-separated list of error patterns.

6. SEVERITY: Is this error "Critical" (breaks build), "Important" (wrong behavior),
   or "Minor" (style/warning)?

7. CONFIDENCE: How confident are you in this analysis? (0-1.0)

Format your response as JSON with this exact structure:
{{
    "root_cause": "The main cause of this error is...",
    "explanation": "This error occurs because...",
    "fix_suggestions": [
        "Fix 1: Description",
        "Fix 2: Description",
        "Fix 3: Description"
    ],
    "prevention_tips": [
        "Tip 1",
        "Tip 2"
    ],
    "related_errors": "ERROR_001, ERROR_002, ERROR_003",
    "severity": "Critical",
    "confidence": 0.92
}}

Return ONLY valid JSON, no other text."""

        return prompt

    def _parse_analysis_response(self, response: str, error_code: str,
                                request_id: Optional[str] = None) -> ErrorExplanation:
        """Parse Gemini response into ErrorExplanation."""
        if not response:
            return ErrorExplanation(
                error_code=error_code,
                root_cause="Empty response",
                explanation="No analysis available",
                fix_suggestions=[],
                prevention_tips=[],
                related_errors=[],
                severity_assessment="Unknown",
                confidence=0.0,
                request_id=request_id
            )

        try:
            import re
            # Extract JSON from response
            match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response, re.DOTALL)
            if not match:
                return ErrorExplanation(
                    error_code=error_code,
                    root_cause="Parse error",
                    explanation="Could not parse Gemini response",
                    fix_suggestions=[],
                    prevention_tips=[],
                    related_errors=[],
                    severity_assessment="Unknown",
                    confidence=0.0,
                    request_id=request_id
                )

            json_str = match.group(0)
            data = json.loads(json_str)

            # Extract fields
            root_cause = data.get("root_cause", "Unknown")
            explanation = data.get("explanation", "No explanation available")
            fix_suggestions = data.get("fix_suggestions", [])
            prevention_tips = data.get("prevention_tips", [])
            related_errors_str = data.get("related_errors", "")
            severity = data.get("severity", "Unknown")
            confidence = float(data.get("confidence", 0.0))

            # Parse related errors
            related_errors = [e.strip() for e in related_errors_str.split(",") if e.strip()]

            return ErrorExplanation(
                error_code=error_code,
                root_cause=root_cause,
                explanation=explanation,
                fix_suggestions=fix_suggestions[:3],  # Top 3
                prevention_tips=prevention_tips,
                related_errors=related_errors,
                severity_assessment=severity,
                confidence=confidence,
                request_id=request_id
            )

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return ErrorExplanation(
                error_code=error_code,
                root_cause="Response parsing failed",
                explanation=f"Could not parse analysis: {str(e)}",
                fix_suggestions=[],
                prevention_tips=[],
                related_errors=[],
                severity_assessment="Unknown",
                confidence=0.0,
                request_id=request_id
            )
        except Exception as e:
            logger.error(f"Parsing error: {e}", exc_info=True)
            return ErrorExplanation(
                error_code=error_code,
                root_cause="Unexpected error",
                explanation=str(e),
                fix_suggestions=[],
                prevention_tips=[],
                related_errors=[],
                severity_assessment="Unknown",
                confidence=0.0,
                request_id=request_id
            )

    def clear_cache(self) -> None:
        """Clear analysis cache."""
        self._analysis_cache.clear()

    @staticmethod
    def categorize_error_severity(error_type: str) -> str:
        """Predict error severity from type."""
        if "fatal" in error_type.lower() or "critical" in error_type.lower():
            return "Critical"
        elif "error" in error_type.lower():
            return "Important"
        elif "warning" in error_type.lower():
            return "Minor"
        else:
            return "Unknown"
