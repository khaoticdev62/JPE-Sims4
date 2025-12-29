"""
Automated Fix System for JPE Sims 4 Mod Translator.

This module provides intelligent error recovery and automated fixes
for common errors detected in JPE mod files.
"""

import re
from typing import List, Dict, Tuple, Optional, Callable, Any
from pathlib import Path
import difflib
from dataclasses import dataclass

from engine.ir import ProjectIR
from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity


@dataclass
class FixProposal:
    """A proposed fix for an error."""
    error: EngineError
    fixed_content: str
    confidence: float  # 0.0 to 1.0
    explanation: str
    affected_line_numbers: List[int]


class AutomatedFixSystem:
    """Automates fixes for common errors in JPE files."""
    
    def __init__(self):
        self.fix_rules = [
            self._fix_missing_end_statements,
            self._fix_property_names,
            self._fix_indentation_issues,
            self._fix_missing_colons,
            self._fix_duplicate_ids,
            self._fix_undefined_references,
        ]
    
    def apply_fixes(self, content: str, errors: List[EngineError]) -> Tuple[str, List[FixProposal]]:
        """
        Apply automated fixes to content based on the provided errors.
        
        Returns: (fixed_content, list_of_fix_proposals)
        """
        fixed_content = content
        fix_proposals = []
        
        for error in errors:
            for rule in self.fix_rules:
                try:
                    result = rule(fixed_content, error)
                    if result:
                        fixed_content, confidence, explanation, affected_lines = result
                        fix_proposals.append(FixProposal(
                            error=error,
                            fixed_content=fixed_content,
                            confidence=confidence,
                            explanation=explanation,
                            affected_line_numbers=affected_lines
                        ))
                except Exception:
                    # Skip this rule if it causes an error, try others
                    continue
        
        return fixed_content, fix_proposals
    
    def _fix_missing_end_statements(self, content: str, error: EngineError) -> Optional[Tuple[str, float, str, List[int]]]:
        """Fix missing 'end' statements."""
        if error.code != "MISSING_END_STATEMENT":
            return None
        
        lines = content.split('\n')
        fixed_lines = []
        changes_made = []
        
        # Track open blocks that need closing
        open_blocks = []
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            
            # Check if this line opens a new block
            if any(keyword in stripped for keyword in ["define interaction", "define buff", "define trait", "define enum", "define test_set"]):
                open_blocks.append(i)
                fixed_lines.append(line)
            elif stripped.lower() == "end":
                # This is a closing statement, remove from open blocks
                if open_blocks:
                    open_blocks.pop()
                fixed_lines.append(line)
            else:
                fixed_lines.append(line)
        
        # Add missing 'end' statements
        for block_start_idx in reversed(open_blocks):
            # Add 'end' after the block - find where the block ends
            block_end_idx = len(fixed_lines)
            for j in range(block_start_idx + 1, len(fixed_lines)):
                if self._is_new_top_level_block(fixed_lines[j]):
                    block_end_idx = j
                    break
            
            fixed_lines.insert(block_end_idx, "end")
            changes_made.append(block_end_idx)
        
        if changes_made:
            fixed_content = '\n'.join(fixed_lines)
            return fixed_content, 0.95, "Added missing 'end' statements", changes_made
        
        return None
    
    def _is_new_top_level_block(self, line: str) -> bool:
        """Check if a line starts a new top-level block."""
        stripped = line.strip()
        return any(keyword in stripped for keyword in ["define interaction", "define buff", "define trait", "define enum", "define test_set"])
    
    def _fix_property_names(self, content: str, error: EngineError) -> Optional[Tuple[str, float, str, List[int]]]:
        """Fix common property name misspellings."""
        if error.code != "INVALID_PROPERTY_NAME":
            return None
        
        # Common JPE property names and their common misspellings
        property_corrections = {
            "display_name": ["diplay_name", "dispaly_name", "dispay_name", "dsply_name", "displ_name", "diplsy_name", "name_display"],
            "description": ["discription", "descritpion", "descriptoin", "descrition"],
            "class": ["clss", "clas", "cl"],
            "target": ["targt", "tarhet", "traget"],
            "icon": ["icn", "ikon", "con"],
            "test_set": ["testset", "test_sett", "tset"],
            "loot_actions": ["lot_actions", "loot_action", "loot_act"],
            "name": ["nme", "nam"],
            "author": ["auther", "autor"],
            "version": ["versoin", "verion", "verson"]
        }
        
        # Find which property was misspelled
        misspelled_prop = None
        for correct_prop, misspellings in property_corrections.items():
            if any(misspelling in error.message_short.lower() for misspelling in misspellings):
                misspelled_prop = next((m for m in misspellings if m in content.lower()), None)
                break
        
        if not misspelled_prop:
            # Try to find the misspelled property by similarity
            for correct_prop, misspellings in property_corrections.items():
                if difflib.SequenceMatcher(None, error.message_short.lower(), correct_prop.lower()).ratio() > 0.7:
                    misspelled_prop = correct_prop
                    break
        
        if misspelled_prop:
            # Apply correction to the content
            corrected_content = re.sub(rf'\b{re.escape(misspelled_prop)}\b', correct_prop, content)
            if corrected_content != content:
                return corrected_content, 0.85, f"Corrected property name '{misspelled_prop}' to '{correct_prop}'", [i for i, line in enumerate(content.split('\n')) if misspelled_prop in line]
        
        return None
    
    def _fix_indentation_issues(self, content: str, error: EngineError) -> Optional[Tuple[str, float, str, List[int]]]:
        """Fix common indentation issues."""
        if "INDENT" in error.code or "indentation" in error.message_short.lower():
            lines = content.split('\n')
            fixed_lines = []
            changes_made = []
            
            for i, line in enumerate(lines):
                stripped = line.lstrip()
                if stripped:  # Non-empty line
                    leading_spaces = len(line) - len(stripped)
                    # Correct indentation based on context
                    proper_indent = self._get_proper_indentation(lines, i)
                    if leading_spaces != proper_indent:
                        fixed_line = " " * proper_indent + stripped
                        fixed_lines.append(fixed_line)
                        changes_made.append(i)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            
            if changes_made:
                fixed_content = '\n'.join(fixed_lines)
                return fixed_content, 0.80, "Fixed indentation issues", changes_made
        
        return None
    
    def _get_proper_indentation(self, lines: List[str], line_idx: int) -> int:
        """Determine proper indentation for a line based on context."""
        if line_idx == 0:
            return 0  # Top-level items have no indent
        
        # Look at previous lines to determine indentation level
        for i in range(line_idx - 1, -1, -1):
            prev_line = lines[i].strip()
            if not prev_line or prev_line.startswith('#'):  # Skip empty/comments
                continue
            
            prev_indent = len(lines[i]) - len(lines[i].lstrip())
            
            # If previous line is a block opener, increase indent
            if any(keyword in prev_line for keyword in ["loot_actions:", "tests:", "actions:", "statistics:", "modifiers:"]):
                return prev_indent + 4  # Increase indentation
            elif prev_line.endswith(':'):
                return prev_indent + 4  # Properties with values get indented
            else:
                return prev_indent  # Same indentation level
        
        return 0
    
    def _fix_missing_colons(self, content: str, error: EngineError) -> Optional[Tuple[str, float, str, List[int]]]:
        """Fix missing colons in property declarations."""
        if "COLON" in error.code or "colon" in error.message_short.lower():
            lines = content.split('\n')
            fixed_lines = []
            changes_made = []
            
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped and not stripped.startswith('#') and ':' not in stripped and not stripped.endswith('end'):
                    # Check if this looks like a property declaration
                    if self._looks_like_property_decl(stripped):
                        fixed_line = line + ':'
                        fixed_lines.append(fixed_line)
                        changes_made.append(i)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            
            if changes_made:
                fixed_content = '\n'.join(fixed_lines)
                return fixed_content, 0.75, "Added missing colons to property declarations", changes_made
        
        return None
    
    def _looks_like_property_decl(self, line: str) -> bool:
        """Check if a line looks like a property declaration that might be missing a colon."""
        # Common JPE property patterns that should have colons
        property_keywords = [
            "name", "display_name", "description", "class", "target", "icon", 
            "test_set", "loot_actions", "actions", "statistics", "modifiers",
            "author", "version", "project_id", "type", "value", "category"
        ]
        
        return any(keyword in line.lower() for keyword in property_keywords)
    
    def _fix_duplicate_ids(self, content: str, error: EngineError) -> Optional[Tuple[str, float, str, List[int]]]:
        """Fix duplicate resource IDs."""
        if error.code == "DUPLICATE_RESOURCE_ID" and hasattr(error, 'extra'):
            duplicate_id = error.extra.get('duplicate_id', '') if hasattr(error, 'extra') else ''
            
            if duplicate_id:
                # Find all occurrences and add suffixes to make them unique
                lines = content.split('\n')
                fixed_lines = []
                changes_made = []
                
                # Count occurrences to add suffixes
                counter = 0
                for i, line in enumerate(lines):
                    if duplicate_id in line:
                        # Check if it's actually a resource ID definition
                        if self._is_resource_id_definition(line, duplicate_id):
                            counter += 1
                            if counter > 1:  # First instance stays the same
                                new_id = f"{duplicate_id}{counter}"
                                fixed_line = line.replace(duplicate_id, new_id)
                                fixed_lines.append(fixed_line)
                                changes_made.append(i)
                            else:
                                fixed_lines.append(line)
                        else:
                            fixed_lines.append(line)
                    else:
                        fixed_lines.append(line)
                
                if changes_made:
                    fixed_content = '\n'.join(fixed_lines)
                    return fixed_content, 0.90, f"Made duplicate IDs unique by adding numeric suffixes", changes_made
        
        return None
    
    def _is_resource_id_definition(self, line: str, resource_id: str) -> bool:
        """Check if a line defines a resource ID."""
        # Check for common patterns where resource IDs are defined
        patterns = [
            r'define\s+\w+\s+' + re.escape(resource_id),  # define interaction MyInteraction
            r'resource_id:\s*' + re.escape(resource_id),   # resource_id: MyInteraction
            r'name:\s*' + re.escape(resource_id),          # name: MyInteraction
        ]
        
        return any(re.search(pattern, line.strip()) for pattern in patterns)
    
    def _fix_undefined_references(self, content: str, error: EngineError) -> Optional[Tuple[str, float, str, List[int]]]:
        """Fix undefined references by suggesting to define them."""
        if error.code == "UNDEFINED_REFERENCE" and hasattr(error, 'extra'):
            undefined_ref = error.extra.get('undefined_reference', '') if hasattr(error, 'extra') else ''
            
            if undefined_ref:
                # This fix would require a more complex approach - typically just suggesting to define
                # the reference is more appropriate than auto-fixing
                return None  # Handled as a suggestion rather than an auto-fix
        
        return None
    
    def get_fix_confidence(self, error: EngineError) -> float:
        """Get the confidence level for fixing this type of error."""
        # High confidence fixes
        if error.code in ["MISSING_END_STATEMENT", "MISSING_COLON", "DUPLICATE_RESOURCE_ID"]:
            return 0.9
            
        # Medium confidence fixes
        if error.code in ["INVALID_PROPERTY_NAME"]:
            return 0.75
            
        # Lower confidence fixes (like indentation, where semantics matter)
        if "INDENT" in error.code:
            return 0.65
            
        # Very low confidence for semantic errors
        if error.category in [ErrorCategory.VALIDATION_SEMANTIC, ErrorCategory.VALIDATION_SCHEMA]:
            return 0.4
            
        # Default to medium confidence
        return 0.6


# Global automated fix system instance
automated_fix_system = AutomatedFixSystem()