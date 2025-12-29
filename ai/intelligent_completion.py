"""
Intelligent Code Completion System for JPE Sims 4 Mod Translator.

This module provides AI-powered code completion, syntax suggestions, and 
auto-correction features based on contextual analysis and common usage patterns.
"""

import re
from typing import List, Dict, Optional, Tuple, Callable
from pathlib import Path
import json
from datetime import datetime
from enum import Enum
import threading
from dataclasses import dataclass

from ai.ai_assistant import JPEAIAssistant, ContextType, Suggestion


class CompletionType(Enum):
    """Types of code completion."""
    PROPERTY = "property"
    VALUE = "value"
    STRUCTURE = "structure"
    TEMPLATE = "template"
    SYNTAX = "syntax"
    REFERENCE = "reference"


@dataclass
class CompletionCandidate:
    """A candidate for code completion with confidence scoring."""
    text: str
    type: CompletionType
    confidence: float  # 0.0 to 1.0
    context_match: float  # 0.0 to 1.0 - how well it matches the context
    description: Optional[str] = None
    insertion_point: Optional[int] = None  # Where to insert the text (relative to cursor)


class IntelligentCodeCompletion:
    """Intelligent code completion system that learns from context and usage patterns."""
    
    def __init__(self, ai_assistant: JPEAIAssistant):
        self.ai_assistant = ai_assistant
        self.learning_buffer: Dict[str, List[Dict[str, any]]] = {
            "properties": [],
            "values": [],
            "patterns": [],
            "structures": []
        }
        self.completion_history: List[CompletionCandidate] = []
        self.max_history_length = 100
    
    def suggest_completions(self, context: str, line: str = "", position_in_line: int = 0) -> List[CompletionCandidate]:
        """Suggest completions based on the current context."""
        candidates = []
        
        # Analyze the line to determine what type of completion is needed
        line_type, expected_value_type = self._analyze_line_for_completion(line, position_in_line)
        
        if line_type == "property":
            candidates.extend(self._suggest_property_completions(context))
        elif line_type == "value":
            candidates.extend(self._suggest_value_completions(context))
        elif line_type == "structure":
            candidates.extend(self._suggest_structure_completions(context))
        elif line_type == "template":
            candidates.extend(self._suggest_template_completions(context))
        elif line_type == "reference":
            candidates.extend(self._suggest_reference_completions(context))
        else:
            # General analysis
            candidates.extend(self._analyze_general_context(context))
        
        # Add completions from the AI assistant
        ai_suggestions = self.ai_assistant.get_suggestions(context, ContextType.GENERAL_SYNTAX)
        for ai_suggestion in ai_suggestions:
            candidates.append(CompletionCandidate(
                text=ai_suggestion.text,
                type=self._convert_suggestion_to_completion_type(ai_suggestion),
                confidence=ai_suggestion.confidence,
                context_match=0.8,
                description=ai_suggestion.category
            ))
        
        # Sort by confidence and context match
        candidates.sort(key=lambda c: (c.confidence * c.context_match), reverse=True)
        
        # Limit to top 10 candidates
        return candidates[:10]
    
    def _analyze_line_for_completion(self, line: str, position: int) -> Tuple[str, str]:
        """Analyze the current line to determine what type of completion is expected."""
        line = line[:position]  # Only consider up to cursor position
        
        # Check for property assignment
        if re.match(r'^\s*[a-z_]+\s*:$', line) and ':' in line:
            return "value", "any"
        
        # Check for property start
        if re.match(r'^\s*[a-z_]*$', line):
            return "property", "any"
        
        # Check for define statements
        if line.strip().lower().startswith("define "):
            # Determine what type of definition is expected
            if "define interaction" in line.lower():
                return "structure", "interaction"
            elif "define buff" in line.lower():
                return "structure", "buff"
            elif "define trait" in line.lower():
                return "structure", "trait"
            elif "define test_set" in line.lower():
                return "structure", "test_set"
            elif "define enum" in line.lower():
                return "structure", "enum"
            else:
                return "structure", "general"
        
        # Check for list items (starting with "    - ")
        if line.startswith("    -") and line.strip() == "-":
            return "value", "list_item"
        
        # Check for common property patterns
        if re.search(r'name\s*:\s*"', line.lower()):
            return "value", "name"
        elif re.search(r'display_name\s*:\s*"', line.lower()):
            return "value", "display_name"
        elif re.search(r'description\s*:\s*"', line.lower()):
            return "value", "description"
        elif re.search(r'class\s*:\s*"', line.lower()):
            return "value", "class"
        elif re.search(r'target\s*:\s*', line.lower()):
            return "value", "target_type"
        elif re.search(r'icon\s*:\s*"', line.lower()):
            return "value", "icon_path"
        
        return "general", "any"
    
    def _suggest_property_completions(self, context: str) -> List[CompletionCandidate]:
        """Suggest property completions based on common JPE patterns."""
        common_properties = [
            ("name", "Name of the definition"),
            ("display_name", "Display name for UI"),
            ("description", "Detailed description"),
            ("class", "Python class name"),
            ("target", "Target object type"),
            ("icon", "Icon resource"),
            ("test_set", "Test set name"),
            ("loot_actions", "List of actions to execute"),
            ("actions", "Action list"),
            ("statistics", "Statistics affected"),
            ("modifiers", "Modifiers to apply"),
            ("duration", "Duration in seconds"),
            ("moodlet", "Whether to show moodlet"),
            ("enabled", "Whether enabled"),
            ("author", "Author name"),
            ("version", "Version string"),
            ("project_id", "Project identifier"),
            ("type", "Type specification"),
            ("options", "List of options"),
            ("value", "Value assignment"),
        ]
        
        candidates = []
        for prop_name, description in common_properties:
            # Calculate context match based on common usage patterns in the project
            context_match = self._calculate_context_relevance(prop_name, context)
            candidates.append(CompletionCandidate(
                text=f"{prop_name}: ",
                type=CompletionType.PROPERTY,
                confidence=0.8,
                context_match=context_match,
                description=description
            ))
        
        return candidates
    
    def _suggest_value_completions(self, context: str) -> List[CompletionCandidate]:
        """Suggest value completions based on common JPE patterns."""
        # Analyze what type of value is expected based on property
        last_property = self._extract_last_property(context)
        
        candidates = []
        
        if last_property in ["target", "actor"]:
            # Likely expecting target types
            target_types = ["Actor", "Object", "Sim", "Household"]
            for target_type in target_types:
                context_match = self._calculate_context_relevance(target_type, context)
                candidates.append(CompletionCandidate(
                    text=target_type,
                    type=CompletionType.VALUE,
                    confidence=0.9,
                    context_match=context_match
                ))
        
        elif last_property in ["enabled", "moodlet"]:
            # Boolean values
            for value in ["true", "false"]:
                context_match = self._calculate_context_relevance(value, context)
                candidates.append(CompletionCandidate(
                    text=value,
                    type=CompletionType.VALUE,
                    confidence=0.95,
                    context_match=context_match
                ))
        
        elif last_property == "class":
            # Likely expecting a class name
            class_names = self._extract_known_classes(context)
            for class_name in class_names:
                context_match = self._calculate_context_relevance(class_name, context)
                candidates.append(CompletionCandidate(
                    text=class_name,
                    type=CompletionType.VALUE,
                    confidence=0.85,
                    context_match=context_match
                ))
        
        elif last_property == "icon":
            # Likely expecting an icon path
            icon_paths = self._extract_known_icons(context)
            for icon_path in icon_paths:
                context_match = self._calculate_context_relevance(icon_path, context)
                candidates.append(CompletionCandidate(
                    text=icon_path,
                    type=CompletionType.VALUE,
                    confidence=0.8,
                    context_match=context_match
                ))
        
        else:
            # Generic value suggestions
            generic_values = [
                "1.0", "0", "5", "10", "true", "false", "none",
                "\"\"", "Actor", "Sim", "Object", "Household"
            ]
            for value in generic_values:
                context_match = self._calculate_context_relevance(value, context)
                candidates.append(CompletionCandidate(
                    text=value,
                    type=CompletionType.VALUE,
                    confidence=0.6,
                    context_match=context_match
                ))
        
        return candidates
    
    def _suggest_structure_completions(self, context: str) -> List[CompletionCandidate]:
        """Suggest structure completions like complete function or class definitions."""
        candidates = []
        
        # Check what type of structure is being defined
        structure_type = self._extract_structure_type(context)
        
        if structure_type == "interaction":
            interaction_template = '''name: "{name}"
display_name: "{displayName}"
description: "{description}"
class: "{className}"

target: Actor
icon: "ui/icon_{name}"

test_set: {name}TestSet

loot_actions:
    - show_message: "Interaction executed"
    - add_statistic_change: social, 5
end'''
            candidates.append(CompletionCandidate(
                text=interaction_template,
                type=CompletionType.TEMPLATE,
                confidence=0.9,
                context_match=1.0,
                description="Complete interaction definition template"
            ))
        
        elif structure_type == "buff":
            buff_template = '''name: "{name}"
display_name: "{displayName}"
description: "{description}"
class: "{className}"

icon: "ui/icon_{name}"
moodlet: true

duration: 60

statistics:
    - skill_gain_rate: +0.5
    - energy: +10
    - fun: +15
end'''
            candidates.append(CompletionCandidate(
                text=buff_template,
                type=CompletionType.TEMPLATE,
                confidence=0.9,
                context_match=1.0,
                description="Complete buff definition template"
            ))
        
        elif structure_type == "trait":
            trait_template = '''name: "{name}"
display_name: "{displayName}"
description: "{description}"
class: "{className}"

icon: "ui/icon_{name}"

modifiers:
    - buff: {name}Buff
    - interaction_multiplier: 1.2
end'''
            candidates.append(CompletionCandidate(
                text=trait_template,
                type=CompletionType.TEMPLATE,
                confidence=0.9,
                context_match=1.0,
                description="Complete trait definition template"
            ))
        
        return candidates
    
    def _suggest_template_completions(self, context: str) -> List[CompletionCandidate]:
        """Suggest common template completions."""
        # This would typically suggest more complex templates based on context
        # For now, we'll use the same structure as template completions
        return self._suggest_structure_completions(context)
    
    def _suggest_reference_completions(self, context: str) -> List[CompletionCandidate]:
        """Suggest reference completions for existing definitions."""
        # Extract known identifiers from context
        known_ids = self._extract_known_identifiers(context)
        
        candidates = []
        for ref_id in known_ids:
            context_match = self._calculate_context_relevance(ref_id, context)
            candidates.append(CompletionCandidate(
                text=ref_id,
                type=CompletionType.REFERENCE,
                confidence=0.8,
                context_match=context_match
            ))
        
        return candidates
    
    def _analyze_general_context(self, context: str) -> List[CompletionCandidate]:
        """General context analysis for suggestions."""
        candidates = []
        
        # Look for common patterns in the context
        if "define" in context and "end" not in context.split('\n')[-5:]:
            # Likely in middle of a definition block, suggest "end"
            candidates.append(CompletionCandidate(
                text="end",
                type=CompletionType.SYNTAX,
                confidence=0.9,
                context_match=0.9
            ))
        
        if "    - " in context and not context.strip().endswith(':'):
            # In list context, suggest common list items
            candidates.extend([
                CompletionCandidate(
                    text="show_message:",
                    type=CompletionType.VALUE,
                    confidence=0.8,
                    context_match=0.7
                ),
                CompletionCandidate(
                    text="add_statistic_change:",
                    type=CompletionType.VALUE,
                    confidence=0.8,
                    context_match=0.7
                ),
                CompletionCandidate(
                    text="trigger_animation:",
                    type=CompletionType.VALUE,
                    confidence=0.75,
                    context_match=0.7
                ),
                CompletionCandidate(
                    text="play_audio:",
                    type=CompletionType.VALUE,
                    confidence=0.7,
                    context_match=0.6
                )
            ])
        
        return candidates
    
    def _convert_suggestion_to_completion_type(self, suggestion: Suggestion) -> CompletionType:
        """Convert a regular Suggestion to a CompletionType."""
        if suggestion.category == "completion":
            return CompletionType.PROPERTY if ":" in suggestion.text else CompletionType.VALUE
        elif suggestion.category == "structure":
            return CompletionType.STRUCTURE
        elif suggestion.category == "template":
            return CompletionType.TEMPLATE
        elif suggestion.category == "correction":
            return CompletionType.SYNTAX
        else:
            return CompletionType.SYNTAX
    
    def _extract_last_property(self, context: str) -> Optional[str]:
        """Extract the last property name from the context."""
        lines = context.split('\n')
        for line in reversed(lines[-5:]):  # Check last 5 lines
            match = re.search(r'^\s*([a-z_]+)\s*:\s*', line)
            if match:
                return match.group(1)
        return None
    
    def _extract_structure_type(self, context: str) -> Optional[str]:
        """Extract the type of structure being defined."""
        lines = context.split('\n')
        for line in reversed(lines[-5:]):  # Check last 5 lines
            match = re.search(r'define\s+(\w+)', line.lower())
            if match:
                return match.group(1)
        return None
    
    def _extract_known_classes(self, context: str) -> List[str]:
        """Extract known class names from the context."""
        # This would analyze the code to find existing class definitions
        # For now, return common JPE class names
        return [
            "BaseInteraction", "SuperInteraction", "ContinuationInteraction",
            "BaseBuff", "MoodBuff", "TraitBuff",
            "BaseTrait", "PersonalityTrait", "SkillTrait"
        ]
    
    def _extract_known_icons(self, context: str) -> List[str]:
        """Extract known icon paths from the context."""
        # This would analyze the code to find existing icon paths
        # For now, return common icon patterns
        return [
            "ui/icon_generic",
            "ui/icon_interaction",
            "ui/icon_buff",
            "ui/icon_trait",
            "ui/icon_test"
        ]
    
    def _extract_known_identifiers(self, context: str) -> List[str]:
        """Extract known identifiers from the context."""
        # This would analyze the code to find existing identifiers
        # For now, use regex to find potential identifiers
        matches = re.findall(r'define\s+\w+\s+([A-Za-z_][A-Za-z0-9_]*)', context)
        return list(set(matches))  # Remove duplicates
    
    def _calculate_context_relevance(self, suggestion: str, context: str) -> float:
        """Calculate how relevant a suggestion is to the current context."""
        # Simple relevance calculation based on how often the word appears nearby
        context_lower = context.lower()
        suggestion_lower = suggestion.lower()
        
        # Calculate occurrences in context
        occurrences = context_lower.count(suggestion_lower)
        if occurrences > 0:
            return min(0.8 + (occurrences * 0.1), 1.0)
        
        # Use Levenshtein-like calculation for partial matches  
        words_in_context = context_lower.split()
        for word in words_in_context[-10:]:  # Check last 10 words
            if suggestion_lower in word or word in suggestion_lower:
                return 0.6
        
        # If no clear relevance, return moderate relevance
        return 0.4
    
    def learn_from_completion(self, original_text: str, completed_text: str, chosen_completion: str):
        """Learn from a completion to improve future suggestions."""
        # This would update internal models based on the user's choice
        # For now, just log the learning event
        completion_data = {
            "original_text": original_text,
            "completed_text": completed_text,
            "chosen_completion": chosen_completion,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add to completion history
        self.completion_history.append(CompletionCandidate(
            text=chosen_completion,
            type=CompletionType.PROPERTY,  # Will be refined based on context
            confidence=1.0,
            context_match=1.0
        ))
        
        # Keep only the most recent entries
        if len(self.completion_history) > self.max_history_length:
            self.completion_history = self.completion_history[-self.max_history_length:]
    
    def get_contextual_completions(self, text: str, cursor_pos: int) -> List[CompletionCandidate]:
        """Get completions based on the full text and exact cursor position."""
        # Extract the context around the cursor position
        lines = text.split('\n')
        
        # Find which line and position in the line the cursor is at
        current_line_idx = 0
        chars_counted = 0
        
        for i, line in enumerate(lines):
            if chars_counted + len(line) + 1 >= cursor_pos:  # +1 for newline
                current_line_idx = i
                break
            chars_counted += len(line) + 1
        
        # Get position within the line
        position_in_line = cursor_pos - chars_counted if current_line_idx < len(lines) else 0
        if position_in_line < 0:
            position_in_line = 0
            
        # Get the line content up to cursor position
        current_line = lines[current_line_idx][:position_in_line] if current_line_idx < len(lines) else ""
        
        # Get context (text before cursor)
        context_lines = lines[:current_line_idx + 1]
        context_lines[-1] = current_line  # Replace last line with text up to cursor
        context_text = '\n'.join(context_lines)
        
        # Get completions for this specific context
        completions = self.suggest_completions(context_text, current_line, position_in_line)
        
        return completions


class CompletionCache:
    """Cache for storing and retrieving completions to improve performance."""
    
    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self.cache: Dict[str, List[CompletionCandidate]] = {}
        self.access_order: List[str] = []  # To track LRU order
    
    def _make_key(self, context: str, line: str, position: int) -> str:
        """Create a cache key from context, line, and position."""
        # Use a hash of the context to limit key length
        import hashlib
        context_hash = hashlib.md5(context.encode()).hexdigest()
        line_hash = hashlib.md5(line.encode()).hexdigest()
        return f"{context_hash}:{line_hash}:{position}"
    
    def get(self, context: str, line: str, position: int) -> Optional[List[CompletionCandidate]]:
        """Get cached completions for the given context."""
        key = self._make_key(context, line, position)
        
        if key in self.cache:
            # Move to end of access order (most recently used)
            self.access_order.remove(key)
            self.access_order.append(key)
            return self.cache[key]
        
        return None
    
    def put(self, context: str, line: str, position: int, completions: List[CompletionCandidate]):
        """Put completions in the cache."""
        key = self._make_key(context, line, position)
        
        # If cache is full, remove the least recently used entry
        if len(self.cache) >= self.max_size:
            lru_key = self.access_order.pop(0)
            del self.cache[lru_key]
        
        self.cache[key] = completions
        self.access_order.append(key)
    
    def clear(self):
        """Clear the cache."""
        self.cache.clear()
        self.access_order.clear()


class AdvancedCodeCompletionSystem:
    """Main system for advanced code completion with AI assistance."""
    
    def __init__(self):
        self.ai_assistant = JPEAIAssistant()
        self.intelligent_completion = IntelligentCodeCompletion(self.ai_assistant)
        self.completion_cache = CompletionCache()
        self.active = True
    
    def get_completions(self, text: str, cursor_pos: int) -> List[CompletionCandidate]:
        """Get intelligent code completions for the given text at cursor position."""
        if not self.active:
            return []
        
        # First check the cache
        lines = text.split('\n')
        current_line_idx = 0
        chars_counted = 0
        
        for i, line in enumerate(lines):
            if chars_counted + len(line) + 1 >= cursor_pos:
                current_line_idx = i
                break
            chars_counted += len(line) + 1
        
        position_in_line = cursor_pos - chars_counted if current_line_idx < len(lines) else 0
        if position_in_line < 0:
            position_in_line = 0
            
        current_line = lines[current_line_idx][:position_in_line] if current_line_idx < len(lines) else ""
        
        context_lines = lines[:current_line_idx + 1]
        context_lines[-1] = current_line
        context_text = '\n'.join(context_lines)
        
        # Try to get from cache
        cached_completions = self.completion_cache.get(context_text, current_line, position_in_line)
        if cached_completions is not None:
            return cached_completions
        
        # Get completions from the intelligent system
        completions = self.intelligent_completion.get_contextual_completions(text, cursor_pos)
        
        # Cache the results
        self.completion_cache.put(context_text, current_line, position_in_line, completions)
        
        return completions
    
    def accept_completion(self, original_text: str, completed_text: str, chosen_completion: str) -> str:
        """Accept a completion and return the new text."""
        # This would insert the chosen completion at the appropriate place
        # For now, we'll just append it
        self.intelligent_completion.learn_from_completion(original_text, completed_text, chosen_completion)
        return completed_text
    
    def set_active(self, active: bool):
        """Enable or disable the completion system."""
        self.active = active
    
    def clear_cache(self):
        """Clear the completion cache."""
        self.completion_cache.clear()


# Global instance
advanced_completion_system = AdvancedCodeCompletionSystem()