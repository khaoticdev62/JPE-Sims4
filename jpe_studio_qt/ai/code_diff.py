"""
Code Diff Analysis and Comparison.

Compares original and suggested code to show changes with visual highlighting.

Features:
- Unified diff format
- Line-by-line comparison
- Change categorization (add/remove/modify)
- Color coding for changes
- Context preservation
"""

from __future__ import annotations

import logging
from typing import Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum
import difflib

logger = logging.getLogger(__name__)


class DiffLineType(Enum):
    """Type of diff line."""
    CONTEXT = "context"    # Unchanged line
    ADDITION = "addition"  # New line (added)
    DELETION = "deletion"  # Removed line
    MODIFICATION = "modification"  # Changed line


@dataclass
class DiffLine:
    """Single line in a diff."""
    type: DiffLineType
    line_number_original: Optional[int]  # Line number in original
    line_number_new: Optional[int]       # Line number in new
    content: str                         # Line content (without \n)
    context_before: int = 0              # Lines before in context
    context_after: int = 0               # Lines after in context


@dataclass
class CodeDiff:
    """Complete code diff."""
    original_code: str
    new_code: str
    diff_lines: List[DiffLine]
    additions: int = 0      # Number of lines added
    deletions: int = 0      # Number of lines removed
    modifications: int = 0  # Number of lines changed
    total_changes: int = 0  # Total changed lines
    similarity: float = 0.0 # 0-1.0 similarity score


class CodeDiffAnalyzer:
    """Analyzes code differences."""

    def __init__(self, context_lines: int = 3):
        """
        Initialize analyzer.

        Args:
            context_lines: Number of context lines around changes
        """
        self._context_lines = context_lines

    def compare(self, original: str, new: str) -> CodeDiff:
        """
        Compare two code snippets.

        Args:
            original: Original code
            new: New/suggested code

        Returns:
            CodeDiff with analysis results
        """
        try:
            original_lines = original.splitlines(keepends=False)
            new_lines = new.splitlines(keepends=False)

            # Generate unified diff
            diff_generator = difflib.unified_diff(
                original_lines,
                new_lines,
                lineterm='',
                n=self._context_lines
            )

            diff_lines = self._parse_unified_diff(list(diff_generator), original_lines, new_lines)

            # Calculate stats
            additions = sum(1 for d in diff_lines if d.type == DiffLineType.ADDITION)
            deletions = sum(1 for d in diff_lines if d.type == DiffLineType.DELETION)
            modifications = sum(1 for d in diff_lines if d.type == DiffLineType.MODIFICATION)
            total_changes = additions + deletions + modifications

            # Calculate similarity
            matcher = difflib.SequenceMatcher(None, original, new)
            similarity = matcher.ratio()

            return CodeDiff(
                original_code=original,
                new_code=new,
                diff_lines=diff_lines,
                additions=additions,
                deletions=deletions,
                modifications=modifications,
                total_changes=total_changes,
                similarity=similarity
            )

        except Exception as e:
            logger.error(f"Diff comparison failed: {e}")
            return CodeDiff(
                original_code=original,
                new_code=new,
                diff_lines=[],
                similarity=0.0
            )

    def _parse_unified_diff(self, diff_output: List[str],
                           original_lines: List[str],
                           new_lines: List[str]) -> List[DiffLine]:
        """Parse unified diff output into structured format."""
        diff_lines: List[DiffLine] = []
        current_original_line = 1
        current_new_line = 1

        for line in diff_output:
            if line.startswith('---') or line.startswith('+++') or line.startswith('@@'):
                continue

            if line.startswith('-') and not line.startswith('---'):
                # Deletion
                diff_lines.append(DiffLine(
                    type=DiffLineType.DELETION,
                    line_number_original=current_original_line,
                    line_number_new=None,
                    content=line[1:]
                ))
                current_original_line += 1

            elif line.startswith('+') and not line.startswith('+++'):
                # Addition
                diff_lines.append(DiffLine(
                    type=DiffLineType.ADDITION,
                    line_number_original=None,
                    line_number_new=current_new_line,
                    content=line[1:]
                ))
                current_new_line += 1

            else:
                # Context
                diff_lines.append(DiffLine(
                    type=DiffLineType.CONTEXT,
                    line_number_original=current_original_line,
                    line_number_new=current_new_line,
                    content=line[1:] if line.startswith(' ') else line
                ))
                current_original_line += 1
                current_new_line += 1

        return diff_lines

    @staticmethod
    def get_diff_stats(diff: CodeDiff) -> dict:
        """Get human-readable diff statistics."""
        return {
            "additions": diff.additions,
            "deletions": diff.deletions,
            "modifications": diff.modifications,
            "total_changes": diff.total_changes,
            "similarity": f"{int(diff.similarity * 100)}%",
            "lines_original": len(diff.original_code.splitlines()),
            "lines_new": len(diff.new_code.splitlines()),
        }

    @staticmethod
    def format_diff_summary(diff: CodeDiff) -> str:
        """Format diff as human-readable summary."""
        summary = []
        summary.append(f"Diff Summary ({int(diff.similarity * 100)}% similar)")
        summary.append(f"  +{diff.additions} added lines")
        summary.append(f"  -{diff.deletions} removed lines")
        summary.append(f"  ~{diff.modifications} modified lines")
        summary.append(f"  Total: {diff.total_changes} changes")
        return "\n".join(summary)

    @staticmethod
    def generate_side_by_side(diff: CodeDiff) -> Tuple[List[str], List[str]]:
        """
        Generate side-by-side diff for display.

        Returns:
            Tuple of (original_lines, new_lines) with padding for alignment
        """
        original_lines = []
        new_lines = []

        original_idx = 0
        new_idx = 0

        for diff_line in diff.diff_lines:
            if diff_line.type == DiffLineType.CONTEXT:
                original_lines.append(f"{diff_line.line_number_original:4} | {diff_line.content}")
                new_lines.append(f"{diff_line.line_number_new:4} | {diff_line.content}")

            elif diff_line.type == DiffLineType.ADDITION:
                original_lines.append("     | ")
                new_lines.append(f"{diff_line.line_number_new:4} | {diff_line.content}")

            elif diff_line.type == DiffLineType.DELETION:
                original_lines.append(f"{diff_line.line_number_original:4} | {diff_line.content}")
                new_lines.append("     | ")

        return original_lines, new_lines
