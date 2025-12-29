"""
Enhanced Validation System for JPE Sims 4 Mod Translator.

This module provides real-time validation with comprehensive diagnostics
and automated fix recommendations for common errors.
"""

import threading
import queue
from typing import List, Dict, Tuple, Optional, Callable, Any
from pathlib import Path
from dataclasses import dataclass, field
from datetime import datetime
import time
import asyncio
from concurrent.futures import ThreadPoolExecutor

from engine.ir import ProjectIR
from engine.parsers.jpe_parser import JpeParser
from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity, BuildReport
from diagnostics.reports import ReportWriter
from diagnostics.sentinel import SentinelExceptionLogger


@dataclass
class ValidationResult:
    """Result of a validation operation."""
    is_valid: bool
    errors: List[EngineError] = field(default_factory=list)
    warnings: List[EngineError] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)
    performance_metrics: Dict[str, float] = field(default_factory=dict)


@dataclass
class ValidationErrorRecommendation:
    """A recommendation for fixing an error."""
    error: EngineError
    recommended_fix: str
    confidence: float  # 0.0 to 1.0
    code_example: Optional[str] = None
    alternative_approaches: List[str] = field(default_factory=list)


class RealTimeValidator:
    """Provides real-time validation during editing with performance optimization."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.parser = JpeParser()
        self.sentinel_logger = SentinelExceptionLogger()
        self.cache: Dict[str, Tuple[datetime, ValidationResult]] = {}
        self.cache_ttl_seconds = 30  # Cache TTL in seconds
        self.executor = ThreadPoolExecutor(max_workers=2)  # For async validation
        self.active_tasks = {}
        
        # Performance metrics
        self.validation_times = []
        self.average_validation_time = 0.0
    
    def validate_file_async(self, file_path: Path, callback: Callable[[ValidationResult], None]):
        """Asynchronously validate a file and call the callback with results."""
        task_id = f"validate_{file_path}_{time.time()}"
        
        def run_validation():
            try:
                result = self.validate_file(file_path)
                callback(result)
                
                # Clean up completed task
                if task_id in self.active_tasks:
                    del self.active_tasks[task_id]
            except Exception as e:
                self.sentinel_logger.log_exception(
                    e,
                    context_info={"file_path": str(file_path)}
                )
        
        # Submit task to executor
        future = self.executor.submit(run_validation)
        self.active_tasks[task_id] = future
    
    def validate_file(self, file_path: Path) -> ValidationResult:
        """Validate a single file in real-time."""
        start_time = time.time()
        
        try:
            # Check if we have a cached result
            cache_key = str(file_path)
            if cache_key in self.cache:
                timestamp, cached_result = self.cache[cache_key]
                if (datetime.now() - timestamp).seconds < self.cache_ttl_seconds:
                    # Return cached result
                    return cached_result
            
            # Parse the file
            ir, parse_errors = self.parser.parse_single_file(file_path)
            
            # Validate the IR (assuming we have a validator)
            validation_errors = self._validate_project_ir(ir)
            
            # Separate errors from warnings
            errors = [e for e in validation_errors if e.severity in [ErrorSeverity.ERROR, ErrorSeverity.FATAL]]
            warnings = [e for e in validation_errors if e.severity == ErrorSeverity.WARNING]
            
            # Generate suggestions
            suggestions = self._generate_suggestions(errors + warnings)
            
            # Create result
            result = ValidationResult(
                is_valid=len(errors) == 0,
                errors=errors,
                warnings=warnings,
                suggestions=suggestions,
                performance_metrics={
                    "validation_duration_ms": (time.time() - start_time) * 1000,
                    "parse_errors_count": len(parse_errors),
                    "validation_errors_count": len(errors),
                    "warnings_count": len(warnings)
                }
            )
            
            # Cache the result
            self.cache[cache_key] = (datetime.now(), result)
            
            # Update performance metrics
            self.validation_times.append(result.performance_metrics["validation_duration_ms"])
            if len(self.validation_times) > 100:  # Keep only last 100 measurements
                self.validation_times = self.validation_times[-100:]
            
            self.average_validation_time = sum(self.validation_times) / len(self.validation_times)
            
            return result
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"file_path": str(file_path)}
            )
            # Return an error result
            error = EngineError(
                code="VALIDATION_FAILED",
                category=ErrorCategory.IO_FILE,
                severity=ErrorSeverity.ERROR,
                message_short="Validation failed",
                message_long=f"Validation failed for file {file_path}: {str(e)}",
                file_path=str(file_path)
            )
            return ValidationResult(
                is_valid=False,
                errors=[error],
                performance_metrics={
                    "validation_duration_ms": (time.time() - start_time) * 1000,
                    "validation_error": str(e)
                }
            )
    
    def _validate_project_ir(self, ir: ProjectIR) -> List[EngineError]:
        """Validate the ProjectIR - this would normally connect to a proper validation system"""
        # For now, return an empty list - in the real implementation this would connect 
        # to the actual validation system
        return []
    
    def _generate_suggestions(self, errors: List[EngineError]) -> List[str]:
        """Generate suggestions for fixing common errors."""
        suggestions = []
        
        for error in errors:
            if error.code == "MISSING_END_STATEMENT":
                suggestions.append("Add 'end' statement to complete the definition block")
            elif error.code == "INVALID_PROPERTY_NAME":
                suggestions.append("Check spelling of property name against documentation")
            elif error.code == "DUPLICATE_RESOURCE_ID":
                suggestions.append("Rename one of the duplicate resource IDs to be unique")
            elif error.code == "MISSING_REQUIRED_PROPERTY":
                suggestions.append(f"Add required property: {getattr(error, 'extra', {}).get('required_property', 'unknown')}")
            elif error.code == "TYPE_MISMATCH":
                suggestions.append(f"Ensure {getattr(error, 'extra', {}).get('property_name', 'property')} is of correct type")
            elif error.code == "UNDEFINED_REFERENCE":
                suggestions.append(f"Define or import the referenced resource: {getattr(error, 'extra', {}).get('resource_id', 'unknown')}")
            elif error.code == "INVALID_SYNTAX":
                # Common syntax error patterns
                if "missing colon" in getattr(error, 'message_long', '').lower():
                    suggestions.append("Add a colon at the end of the property line")
                elif "unexpected token" in getattr(error, 'message_long', '').lower():
                    suggestions.append("Check for correct property syntax and proper indentation")
        
        return list(set(suggestions))  # Remove duplicates
    
    def invalidate_cache_for_file(self, file_path: Path):
        """Invalidate the cache for a specific file."""
        cache_key = str(file_path)
        if cache_key in self.cache:
            del self.cache[cache_key]
    
    def clear_cache(self):
        """Clear all cached validation results."""
        self.cache.clear()
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get performance metrics for the validator."""
        return {
            "average_validation_time_ms": self.average_validation_time,
            "cached_results_count": len(self.cache),
            "recent_validations_count": len(self.validation_times),
            "active_tasks_count": len(self.active_tasks)
        }


class ComprehensiveDiagnosticsDashboard:
    """Provides a comprehensive dashboard for diagnostics and validation results."""
    
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.real_time_validator = RealTimeValidator(project_root)
        self.sentinel_logger = SentinelExceptionLogger()
        self.build_reports: List[BuildReport] = []
        self.error_severity_counts: Dict[ErrorSeverity, int] = {}
        self.error_category_counts: Dict[ErrorCategory, int] = {}
        
        # Initialize counts
        for severity in ErrorSeverity:
            self.error_severity_counts[severity] = 0
        
        for category in ErrorCategory:
            self.error_category_counts[category] = 0
    
    def analyze_build_report(self, report: BuildReport) -> Dict[str, Any]:
        """Analyze a build report and extract metrics."""
        analyzed_data = {
            "build_id": report.build_id,
            "project_id": report.project_id,
            "status": report.status,
            "timestamp": time.time(),
            "error_counts": {
                "errors": len(report.errors),
                "warnings": len(report.warnings)
            },
            "severity_breakdown": {},
            "category_breakdown": {},
            "top_errors": [],
            "recommendations": []
        }
        
        # Count errors by severity
        severity_counts = {}
        for error in report.errors:
            if error.severity not in severity_counts:
                severity_counts[error.severity] = 0
            severity_counts[error.severity] += 1
        
        analyzed_data["severity_breakdown"] = severity_counts
        
        # Count errors by category
        category_counts = {}
        for error in report.errors:
            if error.category not in category_counts:
                category_counts[error.category] = 0
            category_counts[error.category] += 1
        
        analyzed_data["category_breakdown"] = category_counts
        
        # Get top recurring errors
        error_codes = [e.code for e in report.errors]
        from collections import Counter
        error_frequency = Counter(error_codes)
        analyzed_data["top_errors"] = error_frequency.most_common(5)
        
        # Get recommendations
        for error in report.errors:
            recommendation = self._generate_detailed_recommendation(error)
            if recommendation:
                analyzed_data["recommendations"].append(recommendation)
        
        return analyzed_data
    
    def _generate_detailed_recommendation(self, error: EngineError) -> Optional[ValidationErrorRecommendation]:
        """Generate a detailed recommendation for fixing an error."""
        try:
            # Common error code mappings to recommendations
            recommendations_map = {
                "MISSING_END_STATEMENT": {
                    "recommended_fix": "Add 'end' statement to complete the definition block",
                    "confidence": 0.95,
                    "code_example": "define interaction MyInteraction\n    # ... \n    loot_actions:\n        - show_message: 'Hello'\nend # <-- Add this line",
                    "alternative_approaches": ["Check for proper indentation", "Verify all blocks are properly closed"]
                },
                "INVALID_PROPERTY_NAME": {
                    "recommended_fix": "Check spelling of property name against documentation",
                    "confidence": 0.90,
                    "code_example": "# Instead of: diplsy_name: 'Wrong'\n# Use: display_name: 'Correct'",
                    "alternative_approaches": ["Review property name spelling", "Refer to property reference guide"]
                },
                "DUPLICATE_RESOURCE_ID": {
                    "recommended_fix": "Rename one of the duplicate resource IDs to be unique",
                    "confidence": 0.98,
                    "code_example": "# Instead of: define interaction MyInteraction\n# Use: define interaction MyInteractionV2 or define interaction MyEnhancedInteraction",
                    "alternative_approaches": ["Use more specific naming", "Append version or modifier suffixes"]
                },
                "MISSING_REQUIRED_PROPERTY": {
                    "recommended_fix": f"Add required property: {getattr(error, 'extra', {}).get('required_property', 'unknown')}",
                    "confidence": 0.85,
                    "code_example": f"# Add missing property: {getattr(error, 'extra', {}).get('required_property', 'property_name')}: value",
                    "alternative_approaches": ["Check documentation for required properties", "Look at similar definitions"]
                }
            }
            
            if error.code in recommendations_map:
                rec_data = recommendations_map[error.code]
                return ValidationErrorRecommendation(
                    error=error,
                    recommended_fix=rec_data["recommended_fix"],
                    confidence=rec_data["confidence"],
                    code_example=rec_data["code_example"],
                    alternative_approaches=rec_data["alternative_approaches"]
                )
            
            # Generic recommendations based on category
            if error.category == ErrorCategory.PARSER_JPE:
                return ValidationErrorRecommendation(
                    error=error,
                    recommended_fix="Check JPE syntax against documentation",
                    confidence=0.75,
                    code_example="Refer to JPE syntax guide",
                    alternative_approaches=["Verify indentation", "Check for unmatched brackets or quotes"]
                )
            elif error.category == ErrorCategory.VALIDATION_SCHEMA:
                return ValidationErrorRecommendation(
                    error=error,
                    recommended_fix="Validate against schema requirements",
                    confidence=0.70,
                    code_example="Check property types and allowed values",
                    alternative_approaches=["Review schema documentation", "Compare with working examples"]
                )
            
        except Exception as e:
            self.sentinel_logger.log_exception(e, context_info={"error_code": error.code})
        
        return None
    
    def get_project_health_report(self) -> Dict[str, Any]:
        """Get an overall health report for the project."""
        return {
            "project_root": str(self.project_root),
            "validation_cache_size": len(self.real_time_validator.cache),
            "average_validation_time": self.real_time_validator.average_validation_time,
            "recent_builds_count": len(self.build_reports),
            "total_error_count": sum(
                len(getattr(report, 'errors', [])) + len(getattr(report, 'warnings', [])) 
                for report in self.build_reports
            ),
            "error_trend": self._analyze_error_trend(),
            "performance_metrics": self.real_time_validator.get_performance_metrics()
        }
    
    def _analyze_error_trend(self) -> str:
        """Analyze the trend of errors over recent builds."""
        if len(self.build_reports) < 2:
            return "insufficient_data"
        
        # Compare last two builds
        recent_errors = len(getattr(self.build_reports[-1], 'errors', []))
        previous_errors = len(getattr(self.build_reports[-2], 'errors', []))
        
        if recent_errors < previous_errors:
            return "improving"
        elif recent_errors > previous_errors:
            return "declining"
        else:
            return "stable"
    
    def add_build_report(self, report: BuildReport):
        """Add a build report for analysis."""
        self.build_reports.append(report)
        
        # Keep only recent reports (last 100)
        if len(self.build_reports) > 100:
            self.build_reports = self.build_reports[-100:]
    
    def get_error_statistics(self) -> Dict[str, Any]:
        """Get comprehensive error statistics."""
        all_errors = []
        for report in self.build_reports:
            all_errors.extend(getattr(report, 'errors', []))
        
        # Get error counts by category
        category_counts = {}
        for error in all_errors:
            cat = error.category
            if cat not in category_counts:
                category_counts[cat] = 0
            category_counts[cat] += 1
        
        # Get top recurring errors
        from collections import Counter
        error_codes = [e.code for e in all_errors]
        error_frequency = Counter(error_codes)
        
        return {
            "total_error_count": len(all_errors),
            "error_frequency": error_frequency.most_common(10),  # Top 10
            "error_category_breakdown": category_counts,
            "error_severity_breakdown": {
                "errors": len([e for e in all_errors if e.severity == ErrorSeverity.ERROR]),
                "warnings": len([e for e in all_errors if e.severity == ErrorSeverity.WARNING]),
                "infos": len([e for e in all_errors if e.severity == ErrorSeverity.INFO]),
                "fatals": len([e for e in all_errors if e.severity == ErrorSeverity.FATAL])
            }
        }


# Global instances
real_time_validator = RealTimeValidator(Path.cwd())
diagnostics_dashboard = ComprehensiveDiagnosticsDashboard(Path.cwd())