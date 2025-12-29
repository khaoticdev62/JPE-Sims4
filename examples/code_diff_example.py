"""
Examples: Code Diff Analysis and Preview.

This example demonstrates:
1. Basic code diff analysis
2. Diff statistics and summary
3. Side-by-side comparison
4. XML code comparison
5. Large file diff
"""

from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from jpe_studio_qt.ai.code_diff import CodeDiffAnalyzer, DiffLineType


def example_1_basic_diff():
    """Example 1: Basic code comparison."""
    print("\n" + "=" * 60)
    print("Example 1: Basic Code Diff")
    print("=" * 60)

    analyzer = CodeDiffAnalyzer()

    original = """def greet(name):
    print(f"Hello {name}")
    return True"""

    new = """def greet(name):
    message = f"Hello {name}!"
    print(message)
    return True"""

    diff = analyzer.compare(original, new)

    print("✓ Diff Analysis:")
    print(f"  Additions: {diff.additions}")
    print(f"  Deletions: {diff.deletions}")
    print(f"  Total changes: {diff.total_changes}")
    print(f"  Similarity: {int(diff.similarity * 100)}%")


def example_2_diff_summary():
    """Example 2: Formatted diff summary."""
    print("\n" + "=" * 60)
    print("Example 2: Diff Summary")
    print("=" * 60)

    analyzer = CodeDiffAnalyzer()

    original = "x = 1\ny = 2\nz = x + y"
    new = "x = 10\ny = 20\nz = x + y\nresult = z * 2"

    diff = analyzer.compare(original, new)
    summary = CodeDiffAnalyzer.format_diff_summary(diff)

    print("✓ " + summary.replace("\n", "\n  "))


def example_3_xml_diff():
    """Example 3: XML code diff."""
    print("\n" + "=" * 60)
    print("Example 3: XML Code Diff")
    print("=" * 60)

    analyzer = CodeDiffAnalyzer()

    original = """<?xml version="1.0"?>
<define interaction greeting>
  name: "Say Hello"
  target: Actor
</define>"""

    new = """<?xml version="1.0"?>
<define interaction greeting>
  name: "Say Hello"
  description: "A warm greeting"
  display_name: "Greeting Interaction"
  target: Actor
</define>"""

    diff = analyzer.compare(original, new)
    stats = CodeDiffAnalyzer.get_diff_stats(diff)

    print("✓ XML Diff Stats:")
    for key, value in stats.items():
        print(f"  {key}: {value}")


def example_4_side_by_side():
    """Example 4: Side-by-side comparison."""
    print("\n" + "=" * 60)
    print("Example 4: Side-by-Side Comparison")
    print("=" * 60)

    analyzer = CodeDiffAnalyzer(context_lines=2)

    original = """line 1
line 2
line 3
line 4
line 5"""

    new = """line 1
line 2 modified
line 3
line 4 new
line 5"""

    diff = analyzer.compare(original, new)
    original_lines, new_lines = CodeDiffAnalyzer.generate_side_by_side(diff)

    print("✓ Side-by-side comparison:")
    print("\n  Original          |  New")
    print("  " + "-" * 50)
    for orig, new_line in zip(original_lines[:5], new_lines[:5]):
        print(f"  {orig:<25} | {new_line}")


def example_5_diff_lines():
    """Example 5: Detailed diff line analysis."""
    print("\n" + "=" * 60)
    print("Example 5: Detailed Diff Lines")
    print("=" * 60)

    analyzer = CodeDiffAnalyzer(context_lines=1)

    original = "a\nb\nc"
    new = "a\nB\nc\nd"

    diff = analyzer.compare(original, new)

    print("✓ Diff lines breakdown:")
    for i, line in enumerate(diff.diff_lines, 1):
        type_str = line.type.value
        content_preview = line.content[:30].replace("\n", "\\n")
        print(f"  {i}. [{type_str:10}] {content_preview}...")


def example_6_large_file():
    """Example 6: Large file comparison."""
    print("\n" + "=" * 60)
    print("Example 6: Large File Diff")
    print("=" * 60)

    analyzer = CodeDiffAnalyzer()

    # Generate large files
    original = "\n".join([f"def function_{i}():" for i in range(50)])
    new = "\n".join([f"def function_{i}():" if i < 45 else f"def function_{i}():\n    pass" for i in range(50)])

    diff = analyzer.compare(original, new)
    stats = CodeDiffAnalyzer.get_diff_stats(diff)

    print(f"✓ Large file diff (50 functions):")
    print(f"  Original lines: {stats['lines_original']}")
    print(f"  New lines: {stats['lines_new']}")
    print(f"  Changes: +{stats['additions']} -{stats['deletions']}")
    print(f"  Similarity: {stats['similarity']}")


def example_7_empty_file():
    """Example 7: Empty to full file."""
    print("\n" + "=" * 60)
    print("Example 7: Empty to Full File")
    print("=" * 60)

    analyzer = CodeDiffAnalyzer()

    original = ""
    new = """def hello():
    print('Hello, World!')
    return True

if __name__ == '__main__':
    hello()"""

    diff = analyzer.compare(original, new)
    summary = CodeDiffAnalyzer.format_diff_summary(diff)

    print("✓ Creating new file:")
    print(f"  {summary.replace(chr(10), chr(10) + '  ')}")


def main():
    """Run all examples."""
    print("\n" + "=" * 60)
    print("Code Diff Analysis Examples")
    print("=" * 60)

    try:
        example_1_basic_diff()
        example_2_diff_summary()
        example_3_xml_diff()
        example_4_side_by_side()
        example_5_diff_lines()
        example_6_large_file()
        example_7_empty_file()

        print("\n" + "=" * 60)
        print("All examples completed!")
        print("=" * 60)
        print("""
Key Takeaways:

1. CodeDiffAnalyzer compares code and generates structured diffs.

2. Diff includes:
   - Line-by-line changes (addition/deletion/context)
   - Change statistics (additions, deletions, modifications)
   - Similarity score (0-1.0)

3. Multiple output formats:
   - Structured diff_lines
   - Formatted summary
   - Side-by-side comparison

4. Can analyze any text-based code:
   - Python, XML, JSON, etc.
   - Large files (1000+ lines)
   - Full file creation/deletion

To use in dialog:

    from jpe_studio_qt.ai.code_diff import CodeDiffAnalyzer
    from jpe_studio_qt.ui.code_diff_dialog import CodeDiffDialog

    analyzer = CodeDiffAnalyzer()
    diff = analyzer.compare(original_code, new_code)

    dialog = CodeDiffDialog(diff)
    result = dialog.exec()

    if dialog.accepted:
        # Apply changes
        editor.setPlainText(diff.new_code)
""")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
