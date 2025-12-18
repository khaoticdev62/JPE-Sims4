"""
Predictive Coding System for JPE Sims 4 Mod Translator.

This module provides AI-powered predictive coding capabilities that suggest
syntax completions and intelligent error recovery based on usage patterns.
"""

import re
from typing import List, Dict, Tuple, Optional, Any, Callable
from pathlib import Path
from dataclasses import dataclass
from enum import Enum
import json
import pickle
from datetime import datetime
from collections import defaultdict, Counter
import threading
import queue

from engine.ir import ProjectIR
from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity
from diagnostics.sentinel import SentinelExceptionLogger


class PredictionType(Enum):
    """Types of predictions that can be made."""
    SYNTAX_COMPLETION = "syntax_completion"
    PATTERN_RECOGNITION = "pattern_recognition"
    ERROR_RECOVERY = "error_recovery"
    REFERENCE_SUGGESTION = "reference_suggestion"


@dataclass
class Prediction:
    """A single prediction with confidence score."""
    suggestion: str
    confidence: float  # 0.0 to 1.0
    prediction_type: PredictionType
    context: str  # The context where the prediction applies
    fix_suggestion: Optional[str] = None  # Suggested fix for errors


class PredictionContext:
    """Context information for making predictions."""
    
    def __init__(self):
        self.tokens_before_cursor: List[str] = []
        self.tokens_after_cursor: List[str] = []
        self.current_line: str = ""
        self.line_number: int = 0
        self.file_path: Optional[Path] = None
        self.project_context: Optional[ProjectIR] = None
        self.user_preferences: Dict[str, Any] = {}


class PredictiveCodingModel:
    """Machine learning model for predictive coding based on usage patterns."""
    
    def __init__(self, model_path: Optional[Path] = None):
        self.model_path = model_path
        self.pattern_db: Dict[str, Counter] = defaultdict(Counter)  # Token -> Next token frequencies
        self.error_patterns: Dict[str, List[str]] = defaultdict(list)  # Common error patterns and fixes
        self.syntax_templates: Dict[str, str] = {}  # Common syntax templates
        self.user_behavior_db: Dict[str, Counter] = defaultdict(Counter)  # User preference tracking
        self.sentinel_logger = SentinelExceptionLogger()
        
        # Load existing model if available
        if model_path and model_path.exists():
            self.load_model(model_path)
        
        # Initialize common JPE syntax templates
        self._initialize_syntax_templates()
    
    def _initialize_syntax_templates(self):
        """Initialize common JPE syntax templates."""
        self.syntax_templates.update({
            "define_interaction": """define interaction {interaction_name}
    name: "{name}"
    display_name: "{display_name}"
    description: "{description}"
    class: "{class_name}"
    
    target: Actor
    icon: "ui/icon_{interaction_name}"
    
    test_set: {interaction_name}TestSet
    
    loot_actions:
        - show_message: "Interaction executed"
        - add_statistic_change: social, 5
end""",
            
            "define_buff": """define buff {buff_name}
    name: "{name}"
    display_name: "{display_name}"
    description: "{description}"
    class: "{class_name}"
    
    icon: "ui/icon_{buff_name}"
    moodlet: true
    
    statistics:
        - skill_gain_rate: +0.5
        - energy: +10
        - fun: +15
end""",
            
            "define_trait": """define trait {trait_name}
    name: "{name}"
    display_name: "{display_name}"
    description: "{description}"
    class: "{class_name}"
    
    icon: "ui/icon_{trait_name}"
    
    modifiers:
        - buff: {trait_name}Buff
        - interaction_multiplier: 1.2
end""",
            
            "define_test_set": """define test_set {test_set_name}
    tests:
        - actor_is_human: true
        - actor_has_relationship: target, positive
        - distance_to_target: < 5.0
end""",
            
            "define_loot_action": """define loot_action {loot_action_name}
    name: "{name}"
    description: "{description}"
    class: "{class_name}"
    
    actions:
        - add_statistic_change: social, 5
        - play_animation: wave_hello
end"""
        })
    
    def train_on_project(self, project_ir: ProjectIR, file_path: Path):
        """Train the model on a specific project's syntax patterns."""
        try:
            # Extract tokens and patterns from the project IR
            tokens = self._extract_tokens_from_project(project_ir)
            
            # Update pattern database with token sequences
            for i in range(len(tokens) - 1):
                current_token = tokens[i]
                next_token = tokens[i + 1]
                self.pattern_db[current_token][next_token] += 1
            
            # Extract common error patterns from previous builds if available
            # In a real implementation, this would analyze build reports for common errors
            pass
            
            # Track user behavior patterns
            self._track_user_behavior(file_path, tokens)
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={
                    "file_path": str(file_path),
                    "project_id": project_ir.metadata.project_id if project_ir.metadata else "unknown"
                }
            )
    
    def _extract_tokens_from_project(self, project_ir: ProjectIR) -> List[str]:
        """Extract tokens from a project IR for training."""
        tokens = []
        
        # Extract from metadata
        if project_ir.metadata:
            tokens.extend([
                "define", "project", project_ir.metadata.name or "",
                project_ir.metadata.author or "", project_ir.metadata.version or ""
            ])
        
        # Extract from interactions
        for interaction in project_ir.interactions:
            tokens.extend([
                "define", "interaction", interaction.resource_id.name if interaction.resource_id else "",
                "name:", "display_name:", "description:", "class:",
                "target:", "icon:", "test_set:", "loot_actions:"
            ])
        
        # Extract from buffs
        for buff in project_ir.buffs:
            tokens.extend([
                "define", "buff", buff.resource_id.name if buff.resource_id else "",
                "name:", "display_name:", "description:", "class:",
                "icon:", "moodlet:", "true", "statistics:"
            ])
        
        # Extract from traits
        for trait in project_ir.traits:
            tokens.extend([
                "define", "trait", trait.resource_id.name if trait.resource_id else "",
                "name:", "display_name:", "description:", "class:",
                "icon:", "modifiers:"
            ])
        
        # Extract from enums
        for enum in project_ir.enums:
            tokens.extend([
                "define", "enum", enum.resource_id.name if enum.resource_id else "",
                "name:", "description:", "options:"
            ])
        
        # Remove empty strings and normalize
        return [token.strip().lower() for token in tokens if token.strip()]
    
    def _track_user_behavior(self, file_path: Path, tokens: List[str]):
        """Track user behavior patterns for personalization."""
        for token in tokens:
            self.user_behavior_db[str(file_path)][token] += 1
    
    def predict_next_tokens(self, context: PredictionContext) -> List[Prediction]:
        """Predict the most likely next tokens based on context."""
        predictions = []
        
        # Get the last few tokens before cursor for context
        recent_tokens = context.tokens_before_cursor[-3:]  # Last 3 tokens
        
        for token in recent_tokens:
            if token in self.pattern_db:
                # Get most frequent next tokens for this token
                next_token_freqs = self.pattern_db[token]
                for next_token, frequency in next_token_freqs.most_common(5):
                    # Calculate confidence based on frequency
                    total_freq = sum(next_token_freqs.values())
                    confidence = frequency / total_freq if total_freq > 0 else 0.0
                    
                    if confidence > 0.1:  # Only suggest if confidence is meaningful
                        predictions.append(Prediction(
                            suggestion=next_token,
                            confidence=confidence,
                            prediction_type=PredictionType.SYNTAX_COMPLETION,
                            context=token
                        ))
        
        # Sort by confidence
        predictions.sort(key=lambda p: p.confidence, reverse=True)
        return predictions[:5]  # Return top 5 predictions
    
    def predict_syntax_completion(self, context: PredictionContext) -> List[Prediction]:
        """Predict complete syntax completions based on context."""
        predictions = []
        
        # Analyze the current line and context to suggest completions
        line = context.current_line.strip().lower()
        
        # Identify common patterns that might need completion
        if line.startswith("define"):
            # Suggest common definitions
            for template_name in ["interaction", "buff", "trait", "test_set", "loot_action", "enum"]:
                if template_name in line:
                    # Complete the template
                    predictions.append(Prediction(
                        suggestion=f"define {template_name}",
                        confidence=0.9,
                        prediction_type=PredictionType.SYNTAX_COMPLETION,
                        context="definition_context"
                    ))
        
        # Check for incomplete structures
        # Look for patterns like "    - " which usually proceeds list items
        if "    - " in line and ":" not in line:
            # Suggest common properties that follow "- "
            common_followers = [
                "show_message:",
                "add_statistic_change:",
                "play_animation:",
                "trigger_animation:", 
                "modify_statistic:",
                "change_relationship:",
                "add_buff:",
                "remove_buff:"
            ]
            
            for follower in common_followers:
                predictions.append(Prediction(
                    suggestion=follower,
                    confidence=0.7,
                    prediction_type=PredictionType.SYNTAX_COMPLETION,
                    context="property_definition"
                ))
        
        return predictions
    
    def predict_error_recovery(self, error: EngineError, context: PredictionContext) -> List[Prediction]:
        """Predict error recovery suggestions based on error patterns."""
        predictions = []
        
        # Analyze error code and suggest fixes
        error_code = error.code
        error_message = error.message_short.lower()
        
        # Common error patterns and fixes
        if "unexpected" in error_message or "expected" in error_message:
            # Often these are syntax errors - suggest common corrections
            suggestions = self._suggest_syntax_fixes(error, context)
            for suggestion in suggestions:
                predictions.append(suggestion)
        
        # Look up known error patterns
        if error_code in self.error_patterns:
            for fix_suggestion in self.error_patterns[error_code]:
                predictions.append(Prediction(
                    suggestion="Syntax error",
                    confidence=0.9,
                    prediction_type=PredictionType.ERROR_RECOVERY,
                    context=error_code,
                    fix_suggestion=fix_suggestion
                ))
        
        return predictions
    
    def _suggest_syntax_fixes(self, error: EngineError, context: PredictionContext) -> List[Prediction]:
        """Suggest syntax fixes based on error patterns."""
        suggestions = []
        
        # Analyze the context line for common syntax errors
        line = context.current_line
        error_msg = error.message_short
        
        # Check for common patterns
        if ":" not in line and any(keyword in line for keyword in ["name", "display_name", "description", "class", "target", "icon"]):
            # Missing colon - common error
            suggestions.append(Prediction(
                suggestion="Missing colon",
                confidence=0.95,
                prediction_type=PredictionType.ERROR_RECOVERY,
                context="property_definition",
                fix_suggestion="Add a colon after the property name"
            ))
        
        if "end" not in context.tokens_after_cursor and "define" in context.tokens_before_cursor:
            # Missing 'end' statement - common error
            suggestions.append(Prediction(
                suggestion="Missing 'end' statement",
                confidence=0.9,
                prediction_type=PredictionType.ERROR_RECOVERY,
                context="definition_block",
                fix_suggestion="Add 'end' at the end of the define block"
            ))
        
        # Check for improper indentation
        if any(keyword in line for keyword in ["loot_actions", "tests", "actions", "statistics", "modifiers"]):
            # These keywords typically start sections with indented items
            if line.strip() != line or not line.startswith("    "):
                suggestions.append(Prediction(
                    suggestion="Incorrect indentation",
                    confidence=0.85,
                    prediction_type=PredictionType.ERROR_RECOVERY,
                    context="indentation",
                    fix_suggestion="Ensure proper indentation (4 spaces per level)"
                ))
        
        return suggestions
    
    def suggest_template_completion(self, context: PredictionContext) -> List[Prediction]:
        """Suggest template-based completions."""
        predictions = []
        
        # Analyze context to determine appropriate template
        line = context.current_line.strip().lower()
        
        if line == "define interaction":
            predictions.append(Prediction(
                suggestion="interaction template",
                confidence=0.9,
                prediction_type=PredictionType.SYNTAX_COMPLETION,
                context="template_suggestion",
                fix_suggestion=self.syntax_templates.get("define_interaction", "")
            ))
        
        elif line == "define buff":
            predictions.append(Prediction(
                suggestion="buff template",
                confidence=0.9,
                prediction_type=PredictionType.SYNTAX_COMPLETION,
                context="template_suggestion",
                fix_suggestion=self.syntax_templates.get("define_buff", "")
            ))
        
        elif line == "define trait":
            predictions.append(Prediction(
                suggestion="trait template",
                confidence=0.9,
                prediction_type=PredictionType.SYNTAX_COMPLETION,
                context="template_suggestion",
                fix_suggestion=self.syntax_templates.get("define_trait", "")
            ))
        
        elif line == "define test_set":
            predictions.append(Prediction(
                suggestion="test_set template",
                confidence=0.9,
                prediction_type=PredictionType.SYNTAX_COMPLETION,
                context="template_suggestion",
                fix_suggestion=self.syntax_templates.get("define_test_set", "")
            ))
        
        return predictions
    
    def get_predictions(self, context: PredictionContext) -> List[Prediction]:
        """Get all types of predictions for the given context."""
        predictions = []
        
        # Get different types of predictions
        predictions.extend(self.predict_next_tokens(context))
        predictions.extend(self.predict_syntax_completion(context))
        predictions.extend(self.suggest_template_completion(context))
        
        # Sort by confidence and return
        predictions.sort(key=lambda p: p.confidence, reverse=True)
        return predictions
    
    def save_model(self, path: Path):
        """Save the trained model to disk."""
        data = {
            'pattern_db': dict(self.pattern_db),
            'error_patterns': dict(self.error_patterns),
            'syntax_templates': self.syntax_templates,
            'user_behavior_db': dict(self.user_behavior_db)
        }
        
        # Create directory if it doesn't exist
        path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(path, 'wb') as f:
            pickle.dump(data, f)
    
    def load_model(self, path: Path):
        """Load a trained model from disk."""
        try:
            with open(path, 'rb') as f:
                data = pickle.load(f)
                
                self.pattern_db = defaultdict(Counter, data.get('pattern_db', {}))
                self.error_patterns = defaultdict(list, data.get('error_patterns', {}))
                self.syntax_templates = data.get('syntax_templates', {})
                self.user_behavior_db = defaultdict(Counter, data.get('user_behavior_db', {}))
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"model_path": str(path)}
            )


class PredictiveCodingSystem:
    """Main system that manages predictive coding capabilities."""
    
    def __init__(self, model_path: Optional[Path] = None):
        self.model = PredictiveCodingModel(model_path)
        self.sentinel_logger = SentinelExceptionLogger()
        self.prediction_history: List[Tuple[PredictionContext, List[Prediction]]] = []
    
    def get_predictions_for_context(self, context: PredictionContext) -> List[Prediction]:
        """Get predictions for a specific context."""
        try:
            predictions = self.model.get_predictions(context)
            
            # Store in history
            self.prediction_history.append((context, predictions))
            
            # Keep only last 100 predictions in history
            if len(self.prediction_history) > 100:
                self.prediction_history = self.prediction_history[-100:]
                
            return predictions
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={
                    "file_path": str(context.file_path) if context.file_path else "unknown",
                    "line_number": context.line_number,
                    "current_line": context.current_line
                }
            )
            return []  # Return empty list if prediction fails
    
    def train_on_file_content(self, file_path: Path, content: str):
        """Train the model on content from a file."""
        # In a real implementation, we would parse the content and extract patterns
        # For now, we'll just record that we've seen this file
        pass
    
    def train_on_project(self, project_ir: ProjectIR, file_path: Path):
        """Train the model on a project."""
        self.model.train_on_project(project_ir, file_path)
    
    def get_completion_suggestions(self, context: PredictionContext) -> List[str]:
        """Get completion suggestions for the current context."""
        predictions = self.get_predictions_for_context(context)
        return [pred.suggestion for pred in predictions 
                if pred.prediction_type in [PredictionType.SYNTAX_COMPLETION, PredictionType.REFERENCE_SUGGESTION]]
    
    def get_error_suggestions(self, error: EngineError, context: PredictionContext) -> List[str]:
        """Get error recovery suggestions."""
        predictions = self.model.predict_error_recovery(error, context)
        return [pred.fix_suggestion for pred in predictions 
                if pred.fix_suggestion and pred.prediction_type == PredictionType.ERROR_RECOVERY]
    
    def save_model(self, path: Path):
        """Save the predictive coding model."""
        self.model.save_model(path)
    
    def load_model(self, path: Path):
        """Load a predictive coding model."""
        self.model.load_model(path)


# Global instance
predictive_coding_system = PredictiveCodingSystem(
    model_path=Path(__file__).parent / "models" / "predictive_coding_model.pkl"
)