"""
AI-Powered Error Detection and Resolution System for JPE Sims 4 Mod Translator.

This module provides intelligent error detection, analysis, and resolution suggestions
using advanced pattern matching and machine learning techniques.
"""

import re
from typing import List, Dict, Tuple, Optional, Callable
from pathlib import Path
import json
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import difflib

from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity
from ai.ai_assistant import JPEAIAssistant, ErrorResolution
from engine.ir import ProjectIR


class ErrorCodeAnalysis(Enum):
    """Categories of error code analysis."""
    SYNTAX_ERROR = "syntax_error"
    SEMANTIC_ERROR = "semantic_error"
    STRUCTURAL_ERROR = "structural_error"
    LOGICAL_ERROR = "logical_error"
    COMPLEXITY_ERROR = "complexity_error"


@dataclass
class ErrorPattern:
    """A pattern for detecting and resolving errors."""
    error_type: str  # The error code being matched
    pattern: str  # Regex pattern to match the error context
    resolution: str  # The resolution suggestion
    confidence: float  # Confidence in the resolution (0.0-1.0)
    example: Optional[str] = None  # Example of corrected code
    tags: List[str] = None  # Tags for categorizing the pattern


class ErrorDetectionOptimizer:
    """Optimizes error detection and provides intelligent resolutions."""
    
    def __init__(self, ai_assistant: JPEAIAssistant):
        self.ai_assistant = ai_assistant
        self.error_patterns: List[ErrorPattern] = self._load_error_patterns()
        self.resolution_history: Dict[str, List[Dict]] = {}  # Track resolution effectiveness
        self.confidence_threshold = 0.7  # Minimum confidence for auto-application
    
    def _load_error_patterns(self) -> List[ErrorPattern]:
        """Load common error patterns and their resolutions."""
        return [
            ErrorPattern(
                error_type="MISSING_END_STATEMENT",
                pattern=r"(?i)(define\s+\w+\s+\w+)([^end]*)$",
                resolution="Add missing 'end' statement to complete the definition block",
                confidence=0.95,
                example="define interaction MyInteraction\n    name: \"MyInteraction\"\n    display_name: \"My Interaction\"\nend"
            ),
            ErrorPattern(
                error_type="INVALID_PROPERTY_NAME",
                pattern=r"(?i)(\w+)\s*:\s*",
                resolution="Check spelling of property name against documentation",
                confidence=0.8,
                tags=["typo", "spelling"]
            ),
            ErrorPattern(
                error_type="MISSING_COLON",
                pattern=r"(?i)(^\s*\w+\s+\w+\s*$)",
                resolution="Add missing colon after property name",
                confidence=0.9,
                example="name: \"MyName\"",
                tags=["syntax"]
            ),
            ErrorPattern(
                error_type="INDENTATION_ERROR",
                pattern=r"(?i)^(\s*)(\w+:)",
                resolution="Ensure consistent 4-space indentation for nested properties",
                confidence=0.85,
                example="    name: \"MyName\"\n    description: \"My Description\"",
                tags=["indentation", "spacing"]
            ),
            ErrorPattern(
                error_type="DUPLICATE_RESOURCE_ID",
                pattern=r"(?i)define\s+\w+\s+(\w+)",
                resolution="Ensure resource ID is unique by appending a modifier or number",
                confidence=0.95,
                example="define interaction MyInteraction_V2",
                tags=["uniqueness", "naming"]
            ),
            ErrorPattern(
                error_type="UNDEFINED_REFERENCE",
                pattern=r"(?i)(?:test_set|loot_actions):\s*(\w+)",
                resolution="Define the referenced resource or check spelling",
                confidence=0.8,
                tags=["reference", "linking"]
            ),
            ErrorPattern(
                error_type="MISMATCHED_QUOTES",
                pattern=r"(?i)(?<!\")\"[^\"]*$",
                resolution="Add missing closing quote or remove unmatched opening quote",
                confidence=0.9,
                example="name: \"My Name\"",
                tags=["quoting", "syntax"]
            ),
            ErrorPattern(
                error_type="INVALID_ENUM_VALUE",
                pattern=r"(?i)(\w+):\s*(\w+),",
                resolution="Check that the value is valid for the specified enum type",
                confidence=0.75,
                tags=["validation", "type_checking"]
            )
        ]
    
    def detect_errors_in_text(self, text: str) -> List[EngineError]:
        """Detect potential errors in text using pattern matching."""
        detected_errors = []
        lines = text.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            # Check for missing colons
            if re.match(r'^\s*[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*$', line.strip()):
                if ':' not in line.strip():
                    detected_errors.append(EngineError(
                        code="MISSING_COLON",
                        category=ErrorCategory.PARSER_JPE,
                        severity=ErrorSeverity.ERROR,
                        message_short="Missing colon in property definition",
                        message_long=f"Line {line_num}: Missing colon in property definition: {line.strip()}",
                        file_path="current",
                        position=line_num
                    ))
            
            # Check for missing quotes
            quoted_props = ['name', 'display_name', 'description', 'class', 'icon', 'author']
            for prop in quoted_props:
                if f'{prop}:' in line and '"' not in line:
                    detected_errors.append(EngineError(
                        code="MISSING_QUOTES",
                        category=ErrorCategory.PARSER_JPE,
                        severity=ErrorSeverity.ERROR,
                        message_short=f"Missing quotes in {prop} value",
                        message_long=f"Line {line_num}: Missing quotes in {prop} property value",
                        file_path="current",
                        position=line_num
                    ))
            
            # Check for indentation issues
            if line.strip() and not line.startswith('    ') and not line.startswith('define ') and not line.startswith('end'):
                # Check if this is a property that should be indented
                if ':' in line and any(keyword in line for keyword in ['name:', 'display_name:', 'description:', 'class:', 'target:', 'icon:']):
                    detected_errors.append(EngineError(
                        code="INDENTATION_ERROR",
                        category=ErrorCategory.PARSER_JPE,
                        severity=ErrorSeverity.WARNING,
                        message_short="Possible indentation error",
                        message_long=f"Line {line_num}: Property may need proper indentation",
                        file_path="current",
                        position=line_num
                    ))
        
        # Check for missing 'end' statements
        definition_count = sum(1 for line in lines if line.strip().startswith('define '))
        end_count = sum(1 for line in lines if line.strip() == 'end')
        
        if definition_count > end_count:
            detected_errors.append(EngineError(
                code="MISSING_END_STATEMENT",
                category=ErrorCategory.PARSER_JPE,
                severity=ErrorSeverity.ERROR,
                message_short=f"Missing {definition_count - end_count} 'end' statements",
                message_long=f"The text contains {definition_count} definitions but only {end_count} 'end' statements",
                file_path="current"
            ))
        
        return detected_errors
    
    def analyze_error(self, error: EngineError, context: str = "") -> Optional[ErrorResolution]:
        """Analyze a specific error and provide resolution suggestions."""
        # Check against known patterns
        best_resolution = None
        best_confidence = 0.0
        
        for pattern in self.error_patterns:
            if error.code == pattern.error_type:
                # Calculate match confidence based on context
                context_confidence = self._calculate_context_match(pattern, error, context)
                combined_confidence = (pattern.confidence + context_confidence) / 2
                
                if combined_confidence > best_confidence:
                    best_resolution = ErrorResolution(
                        error=error,
                        resolution=pattern.resolution,
                        confidence=combined_confidence,
                        code_example=pattern.example
                    )
                    best_confidence = combined_confidence
        
        # If no pattern matched, use AI assistant for general resolution
        if not best_resolution:
            ai_resolution = self.ai_assistant.suggest_error_resolution(error)
            if ai_resolution and ai_resolution.confidence > best_confidence:
                best_resolution = ai_resolution
        
        return best_resolution
    
    def _calculate_context_match(self, pattern: ErrorPattern, error: EngineError, context: str) -> float:
        """Calculate how well a pattern matches the error context."""
        # Simple approach: match based on error message similarity
        if pattern.pattern:
            try:
                compiled_pattern = re.compile(pattern.pattern, re.IGNORECASE)
                matches = compiled_pattern.search(context + " " + error.message_short)
                return 0.8 if matches else 0.2
            except:
                # If regex compilation fails, return low confidence
                return 0.1
        return 0.5  # Default medium confidence
    
    def auto_resolve_error(self, error: EngineError, context: str) -> Optional[str]:
        """Attempt to automatically resolve the error if confidence is high enough."""
        resolution = self.analyze_error(error, context)
        if resolution and resolution.confidence >= self.confidence_threshold:
            # Apply resolution automatically
            return self._apply_resolution(resolution, context)
        return None
    
    def _apply_resolution(self, resolution: ErrorResolution, context: str) -> str:
        """Apply the suggested resolution to the context."""
        # This is a simplified example - in reality, this would require more context-aware logic
        if resolution.error.code == "MISSING_END_STATEMENT":
            # Add 'end' where appropriate
            lines = context.split('\n')
            
            # Find blocks that need closing
            open_blocks = []
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped.startswith('define '):
                    open_blocks.append(i)
                elif stripped == 'end' and open_blocks:
                    open_blocks.pop()
            
            # Add missing ends
            for block_idx in reversed(open_blocks):
                lines.insert(block_idx + 1, "end")
            
            return '\n'.join(lines)
        
        elif resolution.error.code == "MISSING_COLON":
            # Add missing colon to properties
            lines = context.split('\n')
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped and ':' not in stripped and any(keyword in stripped for keyword in ['name', 'display_name', 'description', 'class', 'target', 'icon']):
                    # Find the property name and add a colon
                    prop_match = re.match(r'^(\s*[a-zA-Z_][a-zA-Z0-9_]*)(\s+[a-zA-Z_][a-zA-Z0-9_]*)?(\s+.*)?$', line)
                    if prop_match:
                        space_idx = line.find(prop_match.group(2)[1:]) if prop_match.group(2) else -1
                        if space_idx > 0:
                            lines[i] = line[:space_idx] + ':' + line[space_idx:]
                        else:
                            lines[i] = prop_match.group(1) + ':' + (prop_match.group(3) if prop_match.group(3) else '')
            
            return '\n'.join(lines)
        
        # For other types, return the context unchanged
        # In a full implementation, more resolution strategies would be implemented
        return context
    
    def learn_from_resolution(self, error: EngineError, suggested_resolution: str, actual_resolution: str):
        """Learn from the effectiveness of error resolutions."""
        error_code = error.code
        if error_code not in self.resolution_history:
            self.resolution_history[error_code] = []
        
        self.resolution_history[error_code].append({
            "suggested_resolution": suggested_resolution,
            "actual_resolution": actual_resolution,
            "timestamp": datetime.now().isoformat(),
            "effective": suggested_resolution.strip() == actual_resolution.strip()
        })
        
        # Keep only most recent 50 resolutions per error type
        if len(self.resolution_history[error_code]) > 50:
            self.resolution_history[error_code] = self.resolution_history[error_code][-50:]


class AIErrorDetector:
    """Main AI-powered error detection and resolution system."""
    
    def __init__(self):
        self.ai_assistant = JPEAIAssistant()
        self.error_optimizer = ErrorDetectionOptimizer(self.ai_assistant)
        self.intelligent_validator = self.ai_assistant.real_time_validator
    
    def detect_and_resolve_errors(self, text: str) -> Tuple[List[EngineError], List[ErrorResolution]]:
        """Detect errors in text and provide resolutions."""
        # Detect errors using pattern matching
        detected_errors = self.error_optimizer.detect_errors_in_text(text)
        
        # Also run standard validation
        # In a real implementation, we'd validate the actual IR, but for now we'll just parse
        try:
            # This is a simplified validation - the real system would parse the text into IR
            # and run comprehensive validation
            pass
        except Exception as e:
            detected_errors.append(EngineError(
                code="PARSER_ERROR",
                category=ErrorCategory.PARSER_JPE,
                severity=ErrorSeverity.ERROR,
                message_short="Parser error",
                message_long=str(e),
                file_path="current"
            ))
        
        # Generate resolutions for errors
        resolutions = []
        for error in detected_errors:
            resolution = self.error_optimizer.analyze_error(error, text)
            if resolution:
                resolutions.append(resolution)
        
        # Sort resolutions by confidence
        resolutions.sort(key=lambda r: r.confidence, reverse=True)
        
        return detected_errors, resolutions
    
    def auto_correct_text(self, text: str) -> Tuple[str, List[EngineError]]:
        """Automatically correct errors in text where confidence is high."""
        lines = text.split('\n')
        corrected_lines = lines[:]
        corrected_errors = []
        remaining_errors = []
        
        # Detect errors first
        detected_errors, resolutions = self.detect_and_resolve_errors(text)
        
        # Apply high-confidence corrections
        for error, resolution in zip(detected_errors, resolutions):
            if resolution.confidence >= self.error_optimizer.confidence_threshold:
                corrected_text = self.error_optimizer.auto_resolve_error(error, '\n'.join(corrected_lines))
                if corrected_text:
                    corrected_lines = corrected_text.split('\n')
                    corrected_errors.append(error)
        
        # Re-validate the corrected text
        remaining_errors, _ = self.detect_and_resolve_errors('\n'.join(corrected_lines))
        
        # Filter to only include errors that weren't auto-corrected
        remaining_errors = [e for e in remaining_errors 
                           if e not in [e2 for e2 in corrected_errors
                                      if e2.code == e.code and e2.position == e.position]]
        
        return '\n'.join(corrected_lines), remaining_errors
    
    def analyze_project_errors(self, project_ir: ProjectIR) -> Dict[str, Any]:
        """Analyze errors in a complete project with AI insights."""
        analysis_results = {
            "total_errors": 0,
            "syntax_errors": [],
            "semantic_errors": [],
            "structural_issues": [],
            "optimization_suggestions": [],
            "resolution_suggestions": []
        }
        
        # Standard validation
        standard_errors = self.intelligent_validator.validate_project(project_ir)
        
        # AI-enhanced analysis
        ai_insights = self._get_ai_project_insights(project_ir)
        
        # Combine and categorize
        all_detected = standard_errors + ai_insights
        for error in all_detected:
            if error.category == ErrorCategory.PARSER_JPE:
                analysis_results["syntax_errors"].append(error)
            elif error.category == ErrorCategory.VALIDATION_SEMANTIC:
                analysis_results["semantic_errors"].append(error)
            elif error.category == ErrorCategory.VALIDATION_SCHEMA:
                analysis_results["structural_issues"].append(error)
            else:
                # Treat other errors as potential optimization suggestions
                analysis_results["optimization_suggestions"].append(error)
                
            analysis_results["total_errors"] += 1
        
        # Generate resolution suggestions
        for error in all_detected:
            resolution = self.error_optimizer.analyze_error(error, str(project_ir))
            if resolution:
                analysis_results["resolution_suggestions"].append(resolution)
        
        return analysis_results
    
    def _get_ai_project_insights(self, project_ir: ProjectIR) -> List[EngineError]:
        """Get AI-powered insights about the project structure."""
        insights = []
        
        # Check for common anti-patterns or suggest better practices
        if len(project_ir.interactions) > 10:
            # Check if interactions follow a consistent naming pattern
            naming_patterns = set()
            for interaction in project_ir.interactions:
                if interaction.resource_id and interaction.resource_id.name:
                    # Extract the prefix of the name to check for consistency
                    name_parts = interaction.resource_id.name.split('_')
                    if len(name_parts) > 1:
                        naming_patterns.add(name_parts[0])
            
            if len(naming_patterns) > 5:  # Too many different naming patterns
                insights.append(EngineError(
                    code="NAMING_INCONSISTENCY",
                    category=ErrorCategory.VALIDATION_SEMANTIC,
                    severity=ErrorSeverity.WARNING,
                    message_short="Potential naming inconsistency detected",
                    message_long=f"Found {len(naming_patterns)} different naming patterns in interactions. Consider standardizing.",
                    suggested_fix="Use consistent naming patterns across similar resources",
                    extra={"naming_patterns": list(naming_patterns)}
                ))
        
        # Check for missing documentation
        undocumented_elements = []
        for interaction in project_ir.interactions:
            if not interaction.description or len(interaction.description.strip()) < 5:
                undocumented_elements.append(f"Interaction: {interaction.resource_id.name if interaction.resource_id else 'unnamed'}")
        
        if undocumented_elements:
            insight = EngineError(
                code="MISSING_DOCUMENTATION",
                category=ErrorCategory.VALIDATION_SEMANTIC,
                severity=ErrorSeverity.INFO,
                message_short="Some elements lack sufficient documentation",
                message_long=f"Found {len(undocumented_elements)} elements with minimal descriptions",
                suggested_fix="Add detailed descriptions to improve maintainability",
                extra={"undocumented_elements": undocumented_elements}
            )
            insights.append(insight)
        
        # Check for overly complex buffs or traits
        for buff in project_ir.buffs:
            if buff.statistics and len(buff.statistics) > 10:  # Arbitrary threshold for complexity
                insights.append(EngineError(
                    code="COMPLEX_BUFF",
                    category=ErrorCategory.VALIDATION_SEMANTIC,
                    severity=ErrorSeverity.INFO,
                    message_short="Potentially complex buff detected",
                    message_long=f"Buff '{buff.resource_id.name if buff.resource_id else 'unnamed'}' has {len(buff.statistics)} statistics modifications",
                    suggested_fix="Consider breaking down complex buffs into smaller, focused ones",
                    extra={"statistic_count": len(buff.statistics)}
                ))
        
        return insights
    
    def get_smart_error_classification(self, error: EngineError, project_context: ProjectIR = None) -> str:
        """Classify errors using AI to provide more helpful categorization."""
        # In a real implementation, this would use ML to classify errors
        # For now, we'll provide enhanced classification based on patterns
        
        if "undefined" in error.message_short.lower() or "reference" in error.message_short.lower():
            return "reference_error"
        elif "missing" in error.message_short.lower() and "end" in error.message_short.lower():
            return "structure_error"
        elif "indent" in error.message_short.lower() or "space" in error.message_short.lower():
            return "formatting_error"
        elif "duplicate" in error.message_short.lower():
            return "uniqueness_error"
        elif error.code == "MISSING_PROPERTY":
            return "validation_error"
        elif error.code == "TYPE_MISMATCH":
            return "type_error"
        else:
            return "general_error"


# Global instance
ai_error_detector = AIErrorDetector()