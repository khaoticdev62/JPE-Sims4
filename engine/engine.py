from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List
import sys

from .ir import ProjectIR, ProjectMetadata
from .parsers.xml_parser import XmlParser
from .parsers.jpe_parser import JpeParser
from .parsers.jpe_xml_parser import JpeXmlParser
from .generators.xml_generator import XmlGenerator
from .validation.validator import ProjectValidator
# Add the parent directory to the path to allow imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from diagnostics.errors import BuildReport, EngineError, ErrorCategory, ErrorSeverity
from diagnostics.reports import ReportWriter
from plugins.manager import PluginManager
from diagnostics.logging import log_info, log_error, log_warning, log_audit, performance_timer


@dataclass(slots=True)
class EngineConfig:
    """Configuration values for the translation engine."""

    project_root: Path
    reports_directory: Path


class TranslationEngine:
    """High-level orchestration API for translation and builds."""

    def __init__(self, config: EngineConfig) -> None:
        self._config = config
        self._xml_parser = XmlParser()
        self._jpe_parser = JpeParser()
        self._jpe_xml_parser = JpeXmlParser()
        self._xml_generator = XmlGenerator()
        self._validator = ProjectValidator()
        self._report_writer = ReportWriter(config.reports_directory)
        self._plugin_manager = PluginManager()

    def build_from_jpe(self, build_id: str) -> BuildReport:
        """Run a full build using JPE sources as the primary input."""
        log_info(f"Starting build process", project_root=str(self._config.project_root), build_id=build_id)

        with performance_timer("jpe_parsing") as timer:
            project_ir, parse_errors = self._jpe_parser.parse_project(self._config.project_root)
        log_info(f"JPE parsing completed", duration_ms=timer.end_time - timer.start_time if hasattr(timer, 'end_time') else 0)

        # Apply transform plugins if any are available
        transform_errors: List[EngineError] = []
        for transform_plugin in self._plugin_manager.get_transform_plugins():
            try:
                log_info(f"Applying transform plugin: {transform_plugin.name()}")
                project_ir, plugin_errors = transform_plugin.transform(project_ir)
                transform_errors.extend(plugin_errors)
            except Exception as e:
                log_error(f"Error in transform plugin {transform_plugin.name()}", exception=e)
                transform_errors.append(EngineError(
                    code="PLUGIN_ERROR",
                    category=ErrorCategory.PLUGIN,
                    severity=ErrorSeverity.ERROR,
                    message_short=f"Error in transform plugin {transform_plugin.name()}",
                    message_long=str(e)
                ))

        with performance_timer("validation") as timer:
            validation_errors = self._validator.validate(project_ir)
        log_info(f"Validation completed", duration_ms=timer.end_time - timer.start_time if hasattr(timer, 'end_time') else 0)

        generation_errors: List[EngineError] = []

        if not any(e.severity in (ErrorSeverity.ERROR, ErrorSeverity.FATAL) for e in parse_errors + validation_errors):
            with performance_timer("xml_generation") as timer:
                generation_errors = self._xml_generator.generate_to_directory(
                    ir=project_ir,
                    target_directory=self._config.project_root / "build" / build_id,
                )
            log_info(f"XML generation completed", duration_ms=timer.end_time - timer.start_time if hasattr(timer, 'end_time') else 0)

            # Apply generator plugins if any are available
            for generator_plugin in self._plugin_manager.get_generator_plugins():
                try:
                    log_info(f"Applying generator plugin: {generator_plugin.name()}")
                    plugin_errors = generator_plugin.generate(
                        ir=project_ir,
                        target_directory=self._config.project_root / "build" / build_id,
                    )
                    generation_errors.extend(plugin_errors)
                except Exception as e:
                    log_error(f"Error in generator plugin {generator_plugin.name()}", exception=e)
                    generation_errors.append(EngineError(
                        code="PLUGIN_ERROR",
                        category=ErrorCategory.PLUGIN,
                        severity=ErrorSeverity.ERROR,
                        message_short=f"Error in generator plugin {generator_plugin.name()}",
                        message_long=str(e)
                    ))
        else:
            log_warning("Build skipped due to errors in parsing or validation", error_count=len(parse_errors + validation_errors))

        errors = [e for e in parse_errors + validation_errors + generation_errors + transform_errors if e.severity in (ErrorSeverity.ERROR, ErrorSeverity.FATAL)]
        warnings = [e for e in parse_errors + validation_errors + generation_errors + transform_errors if e.severity == ErrorSeverity.WARNING]

        metadata = ProjectMetadata(
            name=self._config.project_root.name,
            project_id=self._config.project_root.name,
            version="0.0.0",
        )
        project_id = metadata.project_id

        status = "failed" if errors else "success"
        log_info(f"Build completed", status=status, error_count=len(errors), warning_count=len(warnings))

        report = BuildReport(
            build_id=build_id,
            project_id=project_id,
            status=status,
            errors=errors,
            warnings=warnings,
        )

        log_audit("build_completed", details={
            "build_id": build_id,
            "project_id": project_id,
            "status": status,
            "errors": len(errors),
            "warnings": len(warnings)
        })

        self._report_writer.write_build_report(report)
        return report
