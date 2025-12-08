from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List

# Add parent directory to path for absolute imports
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from engine.engine import EngineConfig, TranslationEngine
from diagnostics.errors import BuildReport, EngineError
from diagnostics.logging import log_info, log_error
from config.config_manager import config_manager


def print_build_report(report: BuildReport) -> None:
    """Print a formatted build report to the console."""
    print("=" * 60)
    print(f"BUILD REPORT")
    print("=" * 60)
    print(f"Build ID:     {report.build_id}")
    print(f"Project ID:   {report.project_id}")
    print(f"Status:       {report.status.upper()}")
    print(f"Errors:       {len(report.errors)}")
    print(f"Warnings:     {len(report.warnings)}")
    print("-" * 60)

    if report.errors:
        print("\nERRORS:")
        print("-" * 30)
        for i, error in enumerate(report.errors, 1):
            print_error_details(i, error, "ERROR")

    if report.warnings:
        print("\nWARNINGS:")
        print("-" * 30)
        for i, warning in enumerate(report.warnings, 1):
            print_error_details(i, warning, "WARNING")

    if not report.errors and not report.warnings:
        print("\nNo issues found! Build completed successfully.")

    print("=" * 60)


def print_error_details(index: int, error: EngineError, error_type: str) -> None:
    """Print detailed information about an error or warning."""
    print(f"{index:2d}. [{error_type}] {error.message_short}")
    if error.message_long:
        print(f"     Description: {error.message_long}")
    if error.suggested_fix:
        print(f"     Suggestion: {error.suggested_fix}")
    if error.file_path:
        print(f"     File: {error.file_path}")
    if error.position and error.position.line:
        print(f"     Line: {error.position.line}")
    print()


def print_project_summary(project_root: Path) -> None:
    """Print a summary of the project structure."""
    print(f"\nProject: {project_root.name}")
    print(f"Location: {project_root.absolute()}")

    # Count .jpe files
    jpe_files = list(project_root.rglob("*.jpe"))
    print(f"Source files: {len(jpe_files)}")

    # Show some file names
    if jpe_files:
        print("Source files found:")
        for jpe_file in jpe_files[:5]:  # Show first 5 files
            relative_path = jpe_file.relative_to(project_root)
            print(f"  - {relative_path}")
        if len(jpe_files) > 5:
            print(f"  ... and {len(jpe_files) - 5} more files")


def validate_project(args: argparse.Namespace) -> None:
    """Validate the project without building."""
    print(f"Validating project: {args.project_root}")

    config = EngineConfig(
        project_root=args.project_root,
        reports_directory=args.reports_dir,
    )
    engine = TranslationEngine(config)

    # Parse the project to get IR (this will trigger validation internally)
    project_ir, parse_errors = engine._jpe_parser.parse_project(args.project_root)
    validation_errors = engine._validator.validate(project_ir)

    # Combine all errors
    all_errors = parse_errors + validation_errors

    # Create a report-like structure for display
    errors = [e for e in all_errors if e.severity.value in ('error', 'fatal')]
    warnings = [e for e in all_errors if e.severity.value == 'warning']

    # Print report
    print("=" * 60)
    print(f"VALIDATION REPORT")
    print("=" * 60)
    print(f"Project: {args.project_root.name}")
    print(f"Errors: {len(errors)}")
    print(f"Warnings: {len(warnings)}")
    print("-" * 60)

    if errors:
        print("\nERRORS:")
        print("-" * 30)
        for i, error in enumerate(errors, 1):
            print_error_details(i, error, "ERROR")

    if warnings:
        print("\nWARNINGS:")
        print("-" * 30)
        for i, warning in enumerate(warnings, 1):
            print_error_details(i, warning, "WARNING")

    if not errors and not warnings:
        print("\nNo issues found! Project is valid.")

    print("=" * 60)

    if args.export_validation:
        export_validation_report(all_errors, args.export_validation)


def export_validation_report(errors: List[EngineError], output_file: str) -> None:
    """Export validation results to a file."""
    # Convert to serializable format
    errors_data = []
    for error in errors:
        error_dict = {
            'code': error.code,
            'category': error.category.value,
            'severity': error.severity.value,
            'message_short': error.message_short,
            'message_long': error.message_long,
            'file_path': error.file_path,
            'resource_id': error.resource_id,
            'suggested_fix': error.suggested_fix,
        }
        if error.position:
            error_dict['position'] = {
                'line': error.position.line,
                'column': error.position.column,
            }
        errors_data.append(error_dict)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'project': 'validation',
            'type': 'validation_report',
            'errors': errors_data,
        }, f, indent=2)

    print(f"Validation report exported to: {output_file}")


def main() -> None:
    # Initialize logging
    log_info("CLI application started")

    parser = argparse.ArgumentParser(
        description="JPE Sims 4 Mod Translator - Command Line Interface",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s build /path/to/project --build-id my-build-001
  %(prog)s build /path/to/project --build-id my-build-001 --reports-dir /custom/reports
  %(prog)s validate /path/to/project
  %(prog)s validate /path/to/project --export-validation validation_report.json
        """
    )

    # Create subparsers for different commands
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Build command
    build_parser = subparsers.add_parser('build', help='Build a JPE project')
    build_parser.add_argument("project_root", type=Path, help="Path to a JPE project root directory.")
    build_parser.add_argument("--build-id", required=True, help="Unique identifier for this build run.")
    build_parser.add_argument("--reports-dir", type=Path, default=Path("reports"), help="Directory for build reports.")
    build_parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output.")
    build_parser.add_argument("--dry-run", action="store_true", help="Validate without generating output files.")

    # Validate command
    validate_parser = subparsers.add_parser('validate', help='Validate a JPE project')
    validate_parser.add_argument("project_root", type=Path, help="Path to a JPE project root directory.")
    validate_parser.add_argument("--export-validation", type=str, help="Export validation results to a JSON file.")
    validate_parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed output.")

    # Info command
    info_parser = subparsers.add_parser('info', help='Show project information')
    info_parser.add_argument("project_root", type=Path, help="Path to a JPE project root directory.")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if args.command == 'build':
        log_info(f"Build command initiated", project_path=str(args.project_root), build_id=args.build_id)
        if args.verbose:
            print(f"Starting build for project: {args.project_root}")
            print_project_summary(args.project_root)

        config = EngineConfig(
            project_root=args.project_root,
            reports_directory=args.reports_dir,
        )
        engine = TranslationEngine(config)

        if args.dry_run:
            log_info("Running in dry-run mode", project_path=str(args.project_root))
            print("Running in dry-run mode - validating only, no output files will be generated")

            # Parse and validate without generating
            project_ir, parse_errors = engine._jpe_parser.parse_project(args.project_root)
            validation_errors = engine._validator.validate(project_ir)

            # Create a simple report for dry run
            from .diagnostics.errors import BuildReport, ErrorSeverity
            errors = [e for e in parse_errors + validation_errors if e.severity in (ErrorSeverity.ERROR, ErrorSeverity.FATAL)]
            warnings = [e for e in parse_errors + validation_errors if e.severity == ErrorSeverity.WARNING]

            report = BuildReport(
                build_id=args.build_id,
                project_id=args.project_root.name,
                status="failed" if errors else "success",
                errors=errors,
                warnings=warnings,
            )
        else:
            report = engine.build_from_jpe(build_id=args.build_id)

        print_build_report(report)

        # Exit with error code if build failed
        if report.status == "failed":
            log_error(f"Build failed", error_count=len(report.errors), warning_count=len(report.warnings))
            exit(1)
        else:
            log_info(f"Build succeeded", project_path=str(args.project_root), build_id=args.build_id)

    elif args.command == 'validate':
        log_info(f"Validation command initiated", project_path=str(args.project_root))
        validate_project(args)

    elif args.command == 'info':
        log_info(f"Info command initiated", project_path=str(args.project_root))
        print_project_summary(args.project_root)

    log_info("CLI application finished")


if __name__ == "__main__":
    main()
