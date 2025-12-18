"""
AI Assistant System for JPE Sims 4 Mod Translator.

This module provides an AI-powered assistant that offers intelligent suggestions,
automated error resolution, and smart code completion to enhance the mod development experience.
"""

import threading
import queue
import time
from typing import List, Dict, Optional, Any, Callable
from pathlib import Path
import re
import json
from datetime import datetime
from dataclasses import dataclass
import ast
import difflib
from enum import Enum

from engine.ir import ProjectIR
from engine.parsers.jpe_parser import JpeParser
from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity
from engine.enhanced_validation import RealTimeValidator
from engine.predictive_coding import PredictiveCodingSystem
from engine.automated_fixes import AutomatedFixSystem


class AIAssistantMode(Enum):
    """Different modes of operation for the AI assistant."""
    SUGGESTIONS_ONLY = "suggestions_only"
    AUTOCOMPLETE = "autocomplete"
    ERROR_RESOLUTION = "error_resolution"
    SMART_EDITING = "smart_editing"
    ALL = "all"


class ContextType(Enum):
    """Types of context that can be analyzed."""
    INTERACTION_DEFINITION = "interaction_definition"
    BUFF_DEFINITION = "buff_definition"
    TRAIT_DEFINITION = "trait_definition"
    ENUM_DEFINITION = "enum_definition"
    TEST_SET_DEFINITION = "test_set_definition"
    LOOT_ACTION_DEFINITION = "loot_action_definition"
    GENERAL_SYNTAX = "general_syntax"
    STRUCTURE_ISSUE = "structure_issue"


@dataclass
class Suggestion:
    """Represents a suggestion from the AI assistant."""
    text: str
    confidence: float  # 0.0 to 1.0
    category: str  # "completion", "correction", "optimization", "explanation"
    context: ContextType
    priority: int = 1  # Higher number = higher priority


@dataclass
class ErrorResolution:
    """Represents a proposed resolution for an error."""
    error: EngineError
    resolution: str
    confidence: float  # 0.0 to 1.0
    code_example: Optional[str] = None
    alternative_solutions: List[str] = None


class JPEAIBrain:
    """The core intelligence engine for the AI assistant."""
    
    def __init__(self):
        self.knowledge_base: Dict[str, Any] = self._load_knowledge_base()
        self.usage_patterns: Dict[str, List] = {}  # Track common usage patterns
        self.error_resolutions: Dict[str, List[ErrorResolution]] = {}
        self.completion_templates: Dict[str, str] = self._load_completion_templates()
        
        # Initialize with common JPE patterns from the knowledge base
        self.common_interactions = self.knowledge_base.get("common_interactions", [])
        self.common_buffs = self.knowledge_base.get("common_buffs", [])
        self.common_traits = self.knowledge_base.get("common_traits", [])
        self.error_patterns = self.knowledge_base.get("error_patterns", {})
    
    def _load_knowledge_base(self) -> Dict[str, Any]:
        """Load the knowledge base with common JPE patterns."""
        # This would typically load from a JSON file or database
        return {
            "common_interactions": [
                {
                    "name": "greet_neighbor",
                    "pattern": "define interaction {name}\n    name: \"{display_name}\"\n    display_name: \"{display_name}\"\n    description: \"{description}\"\n    class: \"{class_name}\"\n    \n    target: Actor\n    icon: \"ui/icon_{name}\"\n    \n    test_set: {name}TestSet\n    \n    loot_actions:\n        - show_message: \"{greeting}\"\n        - add_statistic_change: social, 5\nend"
                },
                {
                    "name": "basic_interaction",
                    "pattern": "define interaction {name}\n    name: \"{display_name}\"\n    display_name: \"{display_name}\"\n    description: \"{description}\"\n    class: \"{class_name}\"\n    \n    target: Actor\n    icon: \"ui/icon_{name}\"\n    \n    test_set: {name}TestSet\n    \n    loot_actions:\n        - add_statistic_change: fun, 10\nend"
                }
            ],
            "common_buffs": [
                {
                    "name": "temporary_buff",
                    "pattern": "define buff {name}\n    name: \"{display_name}\"\n    display_name: \"{display_name}\"\n    description: \"{description}\"\n    class: \"{class_name}\"\n    \n    icon: \"ui/icon_{name}\"\n    moodlet: true\n    \n    duration: 60\n    \n    statistics:\n        - energy: +10\n        - fun: +15\nend"
                }
            ],
            "common_traits": [
                {
                    "name": "behavior_trait", 
                    "pattern": "define trait {name}\n    name: \"{display_name}\"\n    display_name: \"{display_name}\"\n    description: \"{description}\"\n    class: \"{class_name}\"\n    \n    icon: \"ui/icon_{name}\"\n    \n    modifiers:\n        - buff: {trait_buff}\n        - interaction_multiplier: 1.2\nend"
                }
            ],
            "error_patterns": {
                "MISSING_END_STATEMENT": {
                    "description": "Common error when 'end' statement is missing",
                    "solution": "Add 'end' statement to complete the definition block",
                    "confidence": 0.95
                },
                "INVALID_PROPERTY_NAME": {
                    "description": "Common error when property name is misspelled",
                    "solution": "Check spelling of property name against documentation",
                    "confidence": 0.85
                },
                "DUPLICATE_RESOURCE_ID": {
                    "description": "Common error when resource IDs are duplicated",
                    "solution": "Rename one of the duplicate resource IDs to be unique",
                    "confidence": 0.98
                }
            }
        }
    
    def _load_completion_templates(self) -> Dict[str, str]:
        """Load common completion templates."""
        return {
            "interaction": """define interaction {interaction_name}
    name: "{name}"
    display_name: "{display_name}"
    description: "{description}"
    class: "{class_name}"
    
    target: Actor
    icon: "ui/icon_{interaction_name}"
    
    test_set: {interaction_name}TestSet
    
    loot_actions:
        - add_statistic_change: social, 5
        - trigger_animation: wave_hello
end""",
            
            "test_set": """define test_set {test_set_name}
    tests:
        - actor_is_human: true
        - actor_has_relationship: target, positive
        - distance_to_target: < 5.0
end""",
            
            "buff": """define buff {buff_name}
    name: "{name}"
    display_name: "{display_name}"
    description: "{description}"
    class: "{class_name}"
    
    icon: "ui/icon_{buff_name}"
    moodlet: true
    
    duration: 60
    
    statistics:
        - skill_gain_rate: +0.5
        - energy: +10
end""",
            
            "trait": """define trait {trait_name}
    name: "{name}"
    display_name: "{display_name}"
    description: "{description}"
    class: "{class_name}"
    
    icon: "ui/icon_{trait_name}"
    
    modifiers:
        - buff: {trait_name}Buff
        - interaction_multiplier: 1.2
end"""
        }
    
    def analyze_context(self, context: str, context_type: ContextType) -> List[Suggestion]:
        """Analyze context and provide relevant suggestions."""
        suggestions = []
        
        if context_type == ContextType.INTERACTION_DEFINITION:
            # Analyze for interaction-related suggestions
            if "define interaction" in context.lower():
                # Suggest common interaction patterns
                for interaction in self.common_interactions:
                    suggestions.append(Suggestion(
                        text=f"Use {interaction['name']} pattern",
                        confidence=0.8,
                        category="completion",
                        context=context_type,
                        priority=2
                    ))
            
            # Check for common missing elements in interaction definitions
            if "loot_actions:" not in context:
                suggestions.append(Suggestion(
                    text="Add loot_actions section",
                    confidence=0.7,
                    category="completion", 
                    context=context_type,
                    priority=3
                ))
            
            if "test_set:" not in context:
                suggestions.append(Suggestion(
                    text="Consider adding a test_set",
                    confidence=0.6,
                    category="suggestion",
                    context=context_type,
                    priority=1
                ))
        
        elif context_type == ContextType.BUFF_DEFINITION:
            # Analyze for buff-related suggestions
            if "define buff" in context.lower():
                # Suggest common buff patterns
                for buff in self.common_buffs:
                    suggestions.append(Suggestion(
                        text=f"Use {buff['name']} pattern",
                        confidence=0.8,
                        category="completion",
                        context=context_type,
                        priority=2
                    ))
            
            # Check for common missing elements in buff definitions
            if "moodlet:" not in context:
                suggestions.append(Suggestion(
                    text="Consider adding moodlet: true/false",
                    confidence=0.7,
                    category="suggestion",
                    context=context_type,
                    priority=1
                ))
        
        elif context_type == ContextType.GENERAL_SYNTAX:
            # General syntax suggestions
            if "    - " in context and ":" not in context.split("    - ")[-1]:
                suggestions.append(Suggestion(
                    text="Add property after '- ' (e.g., show_message: 'Hello')",
                    confidence=0.9,
                    category="completion",
                    context=context_type,
                    priority=3
                ))
            
            if context.strip().endswith(":"):
                suggestions.append(Suggestion(
                    text="Add value after colon (e.g., property: value)",
                    confidence=0.85,
                    category="completion",
                    context=context_type,
                    priority=2
                ))
        
        # Return suggestions sorted by priority and confidence
        suggestions.sort(key=lambda s: (s.priority, s.confidence), reverse=True)
        return suggestions
    
    def suggest_completion(self, prefix: str) -> List[Suggestion]:
        """Suggest completions based on the current prefix."""
        suggestions = []
        
        # Common property completions
        common_properties = [
            "name:", "display_name:", "description:", "class:", "target:", 
            "icon:", "test_set:", "loot_actions:", "actions:", "statistics:", 
            "modifiers:", "duration:", "moodlet:", "options:", "value:",
            "author:", "version:", "project_id:", "type:", "enabled:"
        ]
        
        for prop in common_properties:
            if prop.lower().startswith(prefix.lower()):
                suggestions.append(Suggestion(
                    text=prop,
                    confidence=0.75,
                    category="completion",
                    context=ContextType.GENERAL_SYNTAX,
                    priority=2
                ))
        
        # Common resource types
        resource_types = ["interaction", "buff", "trait", "enum", "test_set", "loot_action"]
        for rtype in resource_types:
            if f"define {rtype}".lower().startswith(prefix.lower()):
                suggestions.append(Suggestion(
                    text=f"define {rtype}",
                    confidence=0.8,
                    category="completion",
                    context=ContextType.GENERAL_SYNTAX,
                    priority=3
                ))
        
        return suggestions
    
    def suggest_error_resolution(self, error: EngineError) -> Optional[ErrorResolution]:
        """Suggest a resolution for a specific error."""
        error_code = error.code
        if error_code in self.error_patterns:
            pattern = self.error_patterns[error_code]
            return ErrorResolution(
                error=error,
                resolution=pattern["solution"],
                confidence=pattern["confidence"]
            )
        
        # Default error resolutions
        if "MISSING" in error_code:
            return ErrorResolution(
                error=error,
                resolution=f"Add the missing element: {error.extra.get('missing_element', 'required element')}",
                confidence=0.85
            )
        elif "INVALID" in error_code or "EXPECTED" in error_code:
            return ErrorResolution(
                error=error,
                resolution="Check the syntax against the JPE documentation",
                confidence=0.7
            )
        elif "DUPLICATE" in error_code:
            return ErrorResolution(
                error=error,
                resolution="Ensure the resource ID is unique",
                confidence=0.9
            )
        
        return None
    
    def learn_from_usage(self, user_input: str, accepted_suggestion: str):
        """Learn from user's acceptance of suggestions to improve future recommendations."""
        # For now, just log the pattern; in a full implementation, this would update
        # the AI's recommendation algorithm based on user preferences
        pass


class JPEAIAssistant:
    """Main AI assistant class that provides intelligent suggestions and completions."""
    
    def __init__(self, brain: Optional[JPEAIBrain] = None):
        self.brain = brain or JPEAIBrain()
        self.real_time_validator = RealTimeValidator(Path("."))
        self.predictive_coder = PredictiveCodingSystem()
        self.auto_fixer = AutomatedFixSystem()
        self.active_mode = AIAssistantMode.ALL
        self.learning_enabled = True
        
        # History of suggestions and user actions
        self.suggestion_history: List[Dict[str, Any]] = []
    
    def get_suggestions(self, context: str, context_type: ContextType) -> List[Suggestion]:
        """Get intelligent suggestions based on the provided context."""
        # Get suggestions from the AI brain
        brain_suggestions = self.brain.analyze_context(context, context_type)
        
        # If we're in autocomplete mode, also get predictive completions
        if self.active_mode in [AIAssistantMode.AUTOCOMPLETE, AIAssistantMode.ALL]:
            # Extract the last few words to predict continuation
            prefix = context.split()[-1] if context.split() else ""
            completion_suggestions = self.brain.suggest_completion(prefix)
            brain_suggestions.extend(completion_suggestions)
        
        # Sort by priority and confidence
        brain_suggestions.sort(key=lambda s: (s.priority, s.confidence), reverse=True)
        return brain_suggestions[:5]  # Limit to top 5 suggestions
    
    def get_error_resolutions(self, errors: List[EngineError]) -> List[ErrorResolution]:
        """Get intelligent resolutions for a list of errors."""
        resolutions = []
        
        for error in errors:
            resolution = self.brain.suggest_error_resolution(error)
            if resolution:
                resolutions.append(resolution)
        
        return resolutions
    
    def apply_suggestion(self, suggestion: Suggestion) -> str:
        """Apply a suggestion to the context."""
        # This function would be called when a user accepts a suggestion
        # For now, we'll just return the suggestion text
        return suggestion.text
    
    def set_active_mode(self, mode: AIAssistantMode):
        """Set the active mode of the AI assistant."""
        self.active_mode = mode
    
    def enable_learning(self, enabled: bool):
        """Enable or disable learning from user interactions."""
        self.learning_enabled = enabled
    
    def get_completion_suggestions(self, context: str) -> List[str]:
        """Get completion suggestions for the current context."""
        suggestions = self.get_suggestions(context, ContextType.GENERAL_SYNTAX)
        return [s.text for s in suggestions if s.category == "completion"]
    
    def get_smart_formatting(self, text: str) -> str:
        """Apply intelligent formatting to JPE text."""
        # Add indentation and structure based on JPE syntax
        lines = text.split('\n')
        formatted_lines = []
        indent_level = 0
        
        for line in lines:
            stripped = line.strip()
            
            if stripped.endswith(':'):
                # This is a property line that might lead to indented content
                formatted_lines.append('    ' * indent_level + stripped)
                # Check if next line should be more indented (lists, sections)
                if any(keyword in stripped for keyword in ['loot_actions:', 'tests:', 'actions:', 'statistics:', 'modifiers:', 'options:']):
                    indent_level += 1
            elif stripped.startswith('    - '):
                # This is a list item
                formatted_lines.append('    ' * indent_level + stripped)
            elif stripped == 'end':
                # Decrement indent level before adding 'end'
                if indent_level > 0:
                    indent_level -= 1
                formatted_lines.append('    ' * indent_level + stripped)
            elif stripped.startswith('define ') or stripped.startswith('define_'):
                # This is a definition start, reset indent and increment for content inside
                indent_level = 0
                formatted_lines.append('    ' * indent_level + stripped)
                indent_level += 1
            else:
                # Regular line
                formatted_lines.append('    ' * indent_level + stripped)
        
        return '\n'.join(formatted_lines)
    
    def learn_from_interaction(self, user_input: str, suggestion: Suggestion, accepted: bool):
        """Learn from whether the user accepted or rejected a suggestion."""
        if self.learning_enabled:
            self.brain.learn_from_usage(user_input, suggestion.text if accepted else "")


class JPEAssistantManager:
    """Manager class for coordinating the AI assistant with the UI."""
    
    def __init__(self):
        self.ai_assistant = JPEAIAssistant()
        self.active_project_path: Optional[Path] = None
        self.suggestion_queue = queue.Queue()
        self.processing_thread = None
        self.is_processing = False
        
        # Callbacks for UI updates
        self.suggestions_callback: Optional[Callable[[List[Suggestion]], None]] = None
        self.error_resolutions_callback: Optional[Callable[[List[ErrorResolution]], None]] = None
    
    def set_project_path(self, path: Path):
        """Set the active project path for context-aware suggestions."""
        self.active_project_path = path
    
    def set_suggestions_callback(self, callback: Callable[[List[Suggestion]], None]):
        """Set the callback for UI updates when suggestions are ready."""
        self.suggestions_callback = callback
    
    def set_error_resolutions_callback(self, callback: Callable[[List[ErrorResolution]], None]):
        """Set the callback for UI updates when error resolutions are ready."""
        self.error_resolutions_callback = callback
    
    def analyze_document_context(self, document_text: str, cursor_position: int) -> List[Suggestion]:
        """Analyze the document context and provide intelligent suggestions."""
        # Determine the context type based on what's around the cursor
        context = document_text[:cursor_position]
        context_type = self._determine_context_type(context)
        
        suggestions = self.ai_assistant.get_suggestions(context, context_type)
        
        # If callback is set, call it with the suggestions
        if self.suggestions_callback:
            self.suggestions_callback(suggestions)
        
        return suggestions
    
    def _determine_context_type(self, context: str) -> ContextType:
        """Determine what type of context we're dealing with."""
        lines = context.split('\n')
        current_line = lines[-1] if lines else ""
        
        # Check for definition types
        if current_line.startswith('define interaction'):
            return ContextType.INTERACTION_DEFINITION
        elif current_line.startswith('define buff'):
            return ContextType.BUFF_DEFINITION
        elif current_line.startswith('define trait'):
            return ContextType.TRAIT_DEFINITION
        elif current_line.startswith('define enum'):
            return ContextType.ENUM_DEFINITION
        elif current_line.startswith('define test_set'):
            return ContextType.TEST_SET_DEFINITION
        elif current_line.startswith('define loot_action'):
            return ContextType.LOOT_ACTION_DEFINITION
        else:
            # Check for structural issues in multiline context
            if any('loot_actions:' in line for line in lines[-5:]):
                return ContextType.GENERAL_SYNTAX  # Inside a loot_actions section
            elif any('tests:' in line for line in lines[-5:]):
                return ContextType.GENERAL_SYNTAX  # Inside a tests section
            elif any('statistics:' in line for line in lines[-5:]):
                return ContextType.GENERAL_SYNTAX  # Inside a statistics section
            else:
                return ContextType.GENERAL_SYNTAX
    
    def provide_intelligent_formatting(self, text: str) -> str:
        """Provide intelligent formatting for JPE text."""
        return self.ai_assistant.get_smart_formatting(text)
    
    def validate_with_ai_insights(self, project_ir: ProjectIR) -> List[EngineError]:
        """Validate project with additional AI-powered insights."""
        # Run standard validation
        standard_errors = self._run_standard_validation(project_ir)
        
        # Add AI-enhanced validation
        ai_insights = self._get_ai_validation_insights(project_ir)
        all_errors = standard_errors + ai_insights
        
        # Provide error resolutions if callback is set
        if self.error_resolutions_callback:
            resolutions = self.ai_assistant.get_error_resolutions(all_errors)
            self.error_resolutions_callback(resolutions)
        
        return all_errors
    
    def _run_standard_validation(self, project_ir: ProjectIR) -> List[EngineError]:
        """Run the standard validation process."""
        # This would use the real validation system
        # For now, just return empty list
        return []
    
    def _get_ai_validation_insights(self, project_ir: ProjectIR) -> List[EngineError]:
        """Get additional validation insights using AI analysis."""
        insights = []
        
        # Analyze patterns in the project
        if len(project_ir.interactions) > 5:
            # Check for common patterns and suggest improvements
            insights.append(EngineError(
                code="PATTERN_INSIGHT",
                category=ErrorCategory.VALIDATION_SEMANTIC,
                severity=ErrorSeverity.INFO,
                message_short="Multiple interactions detected",
                message_long=f"This project defines {len(project_ir.interactions)} interactions. Consider organizing with common prefixes or grouping in test sets.",
                suggested_fix="Group related interactions with common naming patterns"
            ))
        
        return insights
    
    def start_background_processing(self):
        """Start background processing for more intelligent suggestions."""
        if not self.is_processing:
            self.is_processing = True
            self.processing_thread = threading.Thread(
                target=self._background_processing_loop,
                daemon=True
            )
            self.processing_thread.start()
    
    def _background_processing_loop(self):
        """Background processing loop for continuous analysis."""
        while self.is_processing:
            try:
                # Process any queued tasks
                while not self.suggestion_queue.empty():
                    task = self.suggestion_queue.get_nowait()
                    self._process_task(task)
                    
                    # Throttle processing
                    time.sleep(0.1)
                
                # If queue is empty, sleep briefly before checking again
                time.sleep(0.5)
                
            except queue.Empty:
                # Queue was empty, sleep before checking again
                time.sleep(0.5)
            except Exception as e:
                print(f"Background processing error: {e}")
                time.sleep(1)  # Longer sleep on error
    
    def _process_task(self, task: Dict[str, Any]):
        """Process a single task from the queue."""
        # Process the task based on its type
        task_type = task.get("type")
        if task_type == "suggestion_request":
            context = task.get("context", "")
            context_type = task.get("context_type", ContextType.GENERAL_SYNTAX)
            suggestions = self.ai_assistant.get_suggestions(context, context_type)
            
            if self.suggestions_callback:
                self.suggestions_callback(suggestions)
    
    def stop_background_processing(self):
        """Stop the background processing."""
        self.is_processing = False
        if self.processing_thread:
            self.processing_thread.join(timeout=2)
    
    def format_code_smartly(self, code: str) -> str:
        """Format the given code using intelligent formatting."""
        return self.ai_assistant.get_smart_formatting(code)


# Global AI assistant instance
ai_assistant_manager = JPEAssistantManager()