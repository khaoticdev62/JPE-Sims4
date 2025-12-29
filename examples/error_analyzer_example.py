"""
Examples: AI Error Analysis and Explanation.

This example demonstrates:
1. Basic error analysis
2. Batch error analysis
3. Async error analysis
4. Error severity prediction
5. Integration with diagnostics
"""

from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from jpe_studio_qt.ai.error_analyzer import (
    AIErrorAnalyzer,
    ErrorAnalysisRequest,
    ErrorExplanationType
)
from jpe_studio_qt.ai.error_analysis_async import (
    AsyncErrorAnalysisManager,
    AsyncErrorAnalysisRequest
)


def example_1_basic_analysis():
    """Example 1: Basic error analysis."""
    print("\n" + "=" * 60)
    print("Example 1: Basic Error Analysis")
    print("=" * 60)

    from unittest.mock import Mock

    # Create mock client
    client = Mock()
    client.generate_content = Mock(
        return_value='{"root_cause": "Missing closing tag", "explanation": "JPE XML requires all tags to be properly closed", "fix_suggestions": ["Add </define> at the end"], "prevention_tips": ["Use XML validator", "Match opening/closing tags"], "related_errors": "PARSER_001, PARSER_002", "severity": "Critical", "confidence": 0.95}'
    )

    # Create analyzer
    analyzer = AIErrorAnalyzer(client)

    # Analyze error
    request = ErrorAnalysisRequest(
        error_code="PARSER_JPE_001",
        error_message="Unexpected end of file",
        error_details="Line 42: Expected closing tag but found EOF",
        file_context="<define interaction>\n  ...\n  (missing closing tag)"
    )

    explanation = analyzer.analyze(request)

    print("✓ Error Analysis:")
    print(f"  Error: {explanation.error_code}")
    print(f"  Root Cause: {explanation.root_cause}")
    print(f"  Severity: {explanation.severity_assessment}")
    print(f"  Confidence: {int(explanation.confidence * 100)}%")
    print(f"\n  Fixes:")
    for i, fix in enumerate(explanation.fix_suggestions, 1):
        print(f"    {i}. {fix}")
    print(f"\n  Prevention:")
    for tip in explanation.prevention_tips:
        print(f"    • {tip}")


def example_2_batch_analysis():
    """Example 2: Analyze multiple errors."""
    print("\n" + "=" * 60)
    print("Example 2: Batch Error Analysis")
    print("=" * 60)

    from unittest.mock import Mock

    client = Mock()
    analyzer = AIErrorAnalyzer(client)

    # Multiple errors
    errors = [
        ErrorAnalysisRequest(
            error_code="PARSER_001",
            error_message="Unexpected token",
            error_details="Line 10: Unexpected <"
        ),
        ErrorAnalysisRequest(
            error_code="VALIDATION_001",
            error_message="Missing required attribute",
            error_details="Attribute 'name' required but not found"
        ),
        ErrorAnalysisRequest(
            error_code="SEMANTIC_001",
            error_message="Invalid reference",
            error_details="Reference to undefined interaction"
        ),
    ]

    print("✓ Analyzing 3 errors:")
    for error in errors:
        # Mock response for each error
        client.generate_content = Mock(
            return_value=f'{{"root_cause": "Issue in {error.error_code}", "explanation": "Details", "fix_suggestions": ["Fix 1", "Fix 2"], "prevention_tips": ["Tip"], "related_errors": "", "severity": "Important", "confidence": 0.85}}'
        )

        explanation = analyzer.analyze(error)
        print(f"  ✓ {error.error_code}: {explanation.root_cause}")


def example_3_async_analysis():
    """Example 3: Async error analysis."""
    print("\n" + "=" * 60)
    print("Example 3: Async Error Analysis")
    print("=" * 60)

    from unittest.mock import Mock

    client = Mock()
    client.generate_content = Mock(
        return_value='{"root_cause": "test", "explanation": "test", "fix_suggestions": [], "prevention_tips": [], "related_errors": "", "severity": "Critical", "confidence": 0.9}'
    )

    # Create async manager
    manager = AsyncErrorAnalysisManager(client)

    # Request analysis
    request = AsyncErrorAnalysisRequest(
        error_code="ERR_001",
        error_message="Parser error",
        error_details="Unexpected token at line 42"
    )

    request_id = manager.analyze_error(request)

    print("✓ Async request initiated:")
    print(f"  Request ID: {request_id}")
    print(f"  Error Code: {request.error_code}")
    print(f"  Status: Analyzing...")

    # Cleanup
    manager.cleanup()


def example_4_severity_prediction():
    """Example 4: Error severity prediction."""
    print("\n" + "=" * 60)
    print("Example 4: Error Severity Prediction")
    print("=" * 60)

    errors = [
        ("FATAL_ERROR", "Critical"),
        ("CRITICAL_PARSE_ERROR", "Critical"),
        ("PARSER_ERROR", "Important"),
        ("VALIDATION_ERROR", "Important"),
        ("PARSER_WARNING", "Minor"),
        ("STYLE_WARNING", "Minor"),
    ]

    print("✓ Error Severity Classification:")
    for error_type, expected in errors:
        from jpe_studio_qt.ai.error_analyzer import AIErrorAnalyzer

        severity = AIErrorAnalyzer.categorize_error_severity(error_type)
        match = "✓" if severity == expected else "✗"
        print(f"  {match} {error_type:30} → {severity}")


def example_5_caching():
    """Example 5: Result caching."""
    print("\n" + "=" * 60)
    print("Example 5: Result Caching")
    print("=" * 60)

    from unittest.mock import Mock

    client = Mock()
    client.generate_content = Mock(return_value='{"root_cause": "test", "explanation": "test", "fix_suggestions": [], "prevention_tips": [], "related_errors": "", "severity": "Critical", "confidence": 0.85}')

    analyzer = AIErrorAnalyzer(client)

    # First analysis (will call API)
    request1 = ErrorAnalysisRequest(
        error_code="ERR_001",
        error_message="test",
        error_details="details"
    )
    result1 = analyzer.analyze(request1)
    call_count_1 = client.generate_content.call_count

    # Second analysis (same error - should use cache)
    request2 = ErrorAnalysisRequest(
        error_code="ERR_001",
        error_message="test",
        error_details="details"
    )
    result2 = analyzer.analyze(request2)
    call_count_2 = client.generate_content.call_count

    print("✓ Caching behavior:")
    print(f"  First analysis: API called ({call_count_1} calls)")
    print(f"  Second analysis (same error): API not called ({call_count_2} calls)")
    print(f"  Cache hit: {call_count_1 == call_count_2}")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("AI Error Analysis Examples")
    print("=" * 60)

    try:
        example_1_basic_analysis()
        example_2_batch_analysis()
        example_3_async_analysis()
        example_4_severity_prediction()
        example_5_caching()

        print("\n" + "=" * 60)
        print("All examples completed!")
        print("=" * 60)
        print("""
Key Takeaways:

1. Error analysis uses Gemini to understand build errors deeply.

2. Root cause explanations help developers understand what went wrong.

3. Fix suggestions provide concrete steps to resolve the issue.

4. Prevention tips help avoid the same error in the future.

5. Caching prevents duplicate API calls for the same error type.

6. Severity assessment categorizes error impact.

To integrate in diagnostics panel:

    from jpe_studio_qt.ai.error_analyzer import AIErrorAnalyzer

    analyzer = AIErrorAnalyzer(gemini_client)

    for error in build_errors:
        request = ErrorAnalysisRequest(
            error_code=error.code,
            error_message=error.message_short,
            error_details=error.message_long,
            file_context=error.snippet
        )

        explanation = analyzer.analyze(request)

        # Display explanation in diagnostics panel
        show_error_explanation(explanation)
""")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
