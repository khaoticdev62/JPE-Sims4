"""
Examples: Natural Language to JPE Code Conversion.

This example demonstrates:
1. Basic NLP to JPE conversion
2. Type inference
3. Trigger detection
4. Async conversion
5. Integration with editor
6. Error handling
"""

from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from jpe_studio_qt.ai.nlp_to_jpe import (
    NLPToJPEConverter,
    ConversionRequest,
    ConversionType
)
from jpe_studio_qt.ai.nlp_conversion_async import (
    AsyncNLPConversionManager,
    AsyncConversionRequest
)


def example_1_basic_conversion():
    """Example 1: Basic NLP to JPE conversion."""
    print("\n" + "=" * 60)
    print("Example 1: Basic NLP to JPE Conversion")
    print("=" * 60)

    from unittest.mock import Mock

    # Create mock client
    client = Mock()
    client.generate_content = Mock(
        return_value='{"code": "<?xml version=\\"1.0\\"?>\\n<define interaction greeting>\\n  name: \\"Say Hello\\"\\n</define>", "explanation": "Creates greeting interaction", "confidence": 0.92}'
    )

    # Create converter
    converter = NLPToJPEConverter(client)

    # Request conversion
    request = ConversionRequest(
        natural_language="add an interaction that displays a message",
        suggested_type=ConversionType.INTERACTION
    )

    result = converter.convert(request)

    print("✓ Conversion successful:")
    print(f"  Status: {result.status}")
    print(f"  Confidence: {int(result.confidence * 100)}%")
    print(f"  Explanation: {result.explanation}")
    print(f"  Code lines: {len(result.jpe_code.split(chr(10)))}")


def example_2_trigger_detection():
    """Example 2: Detect // natural language trigger."""
    print("\n" + "=" * 60)
    print("Example 2: Trigger Detection")
    print("=" * 60)

    code = """<?xml version="1.0"?>
<define interaction greet
  // add a message that says "Hello there"
  test_set: GreetingTests
</define>"""

    # Find trigger at different cursor positions
    cursor_pos = code.find("add a message")

    nlp_text = NLPToJPEConverter.detect_nlp_trigger(code, cursor_pos)

    print(f"✓ Detected trigger:")
    print(f"  NLP text: {nlp_text}")
    print(f"  Length: {len(nlp_text)} chars")


def example_3_type_inference():
    """Example 3: Infer code type from description."""
    print("\n" + "=" * 60)
    print("Example 3: Type Inference")
    print("=" * 60)

    descriptions = [
        ("add an interaction that displays a message", ConversionType.INTERACTION),
        ("create a buff that boosts happiness", ConversionType.BUFF),
        ("define a cooking skill", ConversionType.STATISTIC),
        ("add a friendly trait", ConversionType.TRAIT),
        ("create friendship relationship", ConversionType.RELATIONSHIP),
        ("add test cases for validation", ConversionType.TEST_SET),
    ]

    for desc, expected_type in descriptions:
        inferred = NLPToJPEConverter.infer_conversion_type(desc)
        match = "✓" if inferred == expected_type else "✗"
        print(f"{match} '{desc[:40]}...'")
        print(f"   → {inferred.value}")


def example_4_async_conversion():
    """Example 4: Async conversion with manager."""
    print("\n" + "=" * 60)
    print("Example 4: Async Conversion")
    print("=" * 60)

    from unittest.mock import Mock

    client = Mock()
    client.generate_content = Mock(
        return_value='{"code": "<?xml...>", "explanation": "Buff definition", "confidence": 0.88}'
    )

    # Create async manager
    manager = AsyncNLPConversionManager(client)

    # Request conversion
    request = AsyncConversionRequest(
        natural_language="create a buff that gives +5 happiness",
        suggested_type=ConversionType.BUFF
    )

    request_id = manager.request_conversion(request)

    print("✓ Async request initiated:")
    print(f"  Request ID: {request_id}")
    print(f"  NLP: {request.natural_language}")
    print(f"  Type: {request.suggested_type.value}")

    # Cleanup
    manager.cleanup()


def example_5_error_handling():
    """Example 5: Error handling."""
    print("\n" + "=" * 60)
    print("Example 5: Error Handling")
    print("=" * 60)

    from unittest.mock import Mock

    # Test 1: No client
    converter = NLPToJPEConverter(None)
    request = ConversionRequest(natural_language="test")
    result = converter.convert(request)

    print("✓ Test 1: No client")
    print(f"  Status: {result.status}")
    print(f"  Error: {result.error}")

    # Test 2: API error
    client = Mock()
    client.generate_content = Mock(side_effect=Exception("API Error"))

    converter = NLPToJPEConverter(client)
    request = ConversionRequest(natural_language="test")
    result = converter.convert(request)

    print("\n✓ Test 2: API error")
    print(f"  Status: {result.status}")
    print(f"  Error type: {result.error.split(':')[0]}")

    # Test 3: Invalid JSON response
    client = Mock()
    client.generate_content = Mock(return_value="not json")

    converter = NLPToJPEConverter(client)
    request = ConversionRequest(natural_language="test")
    result = converter.convert(request)

    print("\n✓ Test 3: Invalid JSON")
    print(f"  Status: {result.status}")
    print(f"  Error: {result.error[:40]}...")


def example_6_type_specific_conversion():
    """Example 6: Type-specific conversions."""
    print("\n" + "=" * 60)
    print("Example 6: Type-Specific Conversions")
    print("=" * 60)

    from unittest.mock import Mock

    client = Mock()

    conversions = [
        ("add a skill statistic", ConversionType.STATISTIC),
        ("create a friendly trait", ConversionType.TRAIT),
        ("define a test set", ConversionType.TEST_SET),
        ("add a state machine", ConversionType.STATE_MACHINE),
    ]

    for desc, conv_type in conversions:
        client.generate_content = Mock(
            return_value=f'{{"code": "<?xml...>", "explanation": "{conv_type.value} definition", "confidence": 0.85}}'
        )

        converter = NLPToJPEConverter(client)
        request = ConversionRequest(
            natural_language=desc,
            suggested_type=conv_type
        )

        result = converter.convert(request)

        print(f"✓ {conv_type.value.replace('_', ' ').title()}")
        print(f"  Description: {desc}")
        print(f"  Confidence: {int(result.confidence * 100)}%")


def example_7_prompt_generation():
    """Example 7: Understanding prompt generation."""
    print("\n" + "=" * 60)
    print("Example 7: Prompt Generation")
    print("=" * 60)

    from unittest.mock import Mock

    converter = NLPToJPEConverter(Mock())

    # Generate prompt for interaction
    prompt = converter._create_conversion_prompt(
        "add an interaction that displays a message",
        ConversionType.INTERACTION,
        "<define interaction>...</define>"
    )

    print("✓ Generated Gemini Prompt:")
    print(f"  Length: {len(prompt)} chars")
    print(f"  Includes user request: {'add an interaction' in prompt}")
    print(f"  Includes code context: {'<define interaction>' in prompt}")
    print(f"  Requests JSON format: {'JSON' in prompt or 'json' in prompt.lower()}")
    print(f"  Includes confidence: {'confidence' in prompt.lower()}")

    # Show first 200 chars of prompt
    print(f"\n  Prompt preview:")
    for line in prompt[:200].split('\n'):
        print(f"    {line}")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("Natural Language to JPE Code Conversion Examples")
    print("=" * 60)

    try:
        example_1_basic_conversion()
        example_2_trigger_detection()
        example_3_type_inference()
        example_4_async_conversion()
        example_5_error_handling()
        example_6_type_specific_conversion()
        example_7_prompt_generation()

        print("\n" + "=" * 60)
        print("All examples completed!")
        print("=" * 60)
        print("""
Key Takeaways:

1. NLP to JPE conversion uses Gemini API to interpret natural language
   and generate JPE XML code.

2. Trigger detection looks for // prefix in code to identify NLP requests.

3. Type inference automatically guesses the JPE code type from description.

4. Async conversion prevents UI blocking during API calls.

5. Error handling gracefully falls back on API failures.

6. Confidence scores indicate how well the code matches the request.

To use in your editor:
    from jpe_studio_qt.ui.nlp_code_editor import NLPCodeEditor

    editor = NLPCodeEditor(language="xml")
    editor.set_nlp_converter(gemini_client)

    # User types: // add a buff
    # Editor automatically detects and converts!
""")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
