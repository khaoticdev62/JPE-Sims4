#!/usr/bin/env python3
"""
JPE to XML Transformation Script

This script provides a command-line interface for transforming JPE source files
into Sims 4 compatible XML format.

Usage:
    python transform_jpe.py input.jpe -o output.xml
    python transform_jpe.py input.jpe  # outputs to stdout

This is used by the Next.js API endpoint /api/transform
"""

import argparse
import sys
import shutil
from pathlib import Path
from tempfile import mkdtemp

# Add project root to path for imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from engine.engine import TranslationEngine, EngineConfig
from engine.ir import ProjectIR
from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity


def transform_jpe_to_xml(
    input_file: Path,
    output_file: Path | None = None,
) -> tuple[str, list[dict]]:
    """
    Transform a JPE file to XML.

    Args:
        input_file: Path to input JPE file
        output_file: Optional path to output XML file (if None, returns string)

    Returns:
        Tuple of (xml_string, errors_list)
    """
    errors: list[dict] = []

    try:
        # Read input file
        if not input_file.exists():
            raise FileNotFoundError(f"Input file not found: {input_file}")

        # Create temporary project structure
        temp_dir = input_file.parent
        temp_config = EngineConfig(
            project_root=temp_dir, reports_directory=temp_dir / "reports"
        )

        # Initialize engine
        engine = TranslationEngine(temp_config)

        # Parse JPE file using parse_project
        project_ir, parse_errors = engine._jpe_parser.parse_project(temp_dir)

        # Convert parse errors to dict format
        for err in parse_errors:
            errors.append(
                {
                    "message": f"{err.severity.value}: {err.message_long}",
                    "line": err.line_number,
                    "column": err.column,
                    "code": err.code,
                }
            )

        # Check for fatal errors
        fatal_errors = [e for e in parse_errors if e.severity == ErrorSeverity.FATAL]
        if fatal_errors:
            return "<!-- Transformation failed: fatal errors -->", errors

        # Validate
        validation_errors = engine._validator.validate(project_ir)
        for err in validation_errors:
            errors.append(
                {
                    "message": f"{err.severity.value}: {err.message_long}",
                    "line": err.line_number,
                    "column": err.column,
                    "code": err.code,
                }
            )

        # Generate XML to temp directory
        gen_temp_dir = Path(mkdtemp())
        gen_errors = engine._xml_generator.generate_to_directory(
            project_ir, gen_temp_dir
        )

        for err in gen_errors:
            errors.append(
                {
                    "message": f"{err.severity.value}: {err.message_long}",
                    "line": err.line_number,
                    "column": err.column,
                    "code": err.code,
                }
            )

        # Read generated XML files
        xml_files = list(gen_temp_dir.glob("*.xml"))
        xml_output = ""
        for xml_file in xml_files:
            xml_output += xml_file.read_text(encoding="utf-8") + "\n"

        # If no files generated, create minimal output
        if not xml_output.strip():
            xml_output = "<!-- No XML generated - check JPE source -->\n<Tunings />"

        # Write output if specified
        if output_file:
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(xml_output, encoding="utf-8")

        # Cleanup temp dir
        shutil.rmtree(gen_temp_dir, ignore_errors=True)

        return xml_output, errors

    except Exception as e:
        errors.append(
            {
                "message": f"Internal error: {str(e)}",
                "line": None,
                "column": None,
                "code": "INTERNAL_ERROR",
            }
        )
        return f"<!-- Transformation failed: {str(e)} -->", errors


def main():
    """Main entry point for CLI."""
    parser = argparse.ArgumentParser(
        description="Transform JPE source files to Sims 4 XML format"
    )
    parser.add_argument("input", type=Path, help="Input JPE file path")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=None,
        help="Output XML file path (default: stdout)",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Enable verbose output"
    )

    args = parser.parse_args()

    # Transform
    xml_output, errors = transform_jpe_to_xml(args.input, args.output)

    # Output results
    if args.output:
        if args.verbose:
            print(f"Transformed {args.input} -> {args.output}", file=sys.stderr)
            if errors:
                print(f"Warnings/Errors: {len(errors)}", file=sys.stderr)
    else:
        # Output to stdout
        print(xml_output)

    # Report errors to stderr
    for err in errors:
        if err.get("line"):
            print(f"Line {err['line']}: {err['message']}", file=sys.stderr)
        else:
            print(err["message"], file=sys.stderr)

    # Exit with error code if there were errors
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
