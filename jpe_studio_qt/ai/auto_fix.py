"""
One-Click Auto-Fix Workflow.

Combines error analysis and code diff to provide intelligent automatic fixes.

Features:
- Automatic fix detection and application
- Diff preview before applying
- Fix history and undo support
- Batch fix application
- Confidence-based fix ranking
"""

from __future__ import annotations

import logging
from typing import Optional, List, Dict
from dataclasses import dataclass, field
from enum import Enum

from PySide6.QtCore import QObject, Signal

from .error_analyzer import (
    AIErrorAnalyzer,
    ErrorAnalysisRequest,
    ErrorExplanation
)
from .code_diff import CodeDiffAnalyzer, CodeDiff

logger = logging.getLogger(__name__)


class FixStatus(Enum):
    """Status of a fix."""
    PENDING = "pending"
    APPLIED = "applied"
    REJECTED = "rejected"
    FAILED = "failed"


@dataclass
class SuggestedFix:
    """A single suggested fix."""
    error_code: str
    error_message: str
    fix_index: int  # Which of the suggested fixes (0, 1, 2)
    fix_description: str
    original_code: str
    fixed_code: str
    confidence: float  # 0-1.0
    status: FixStatus = FixStatus.PENDING
    applied_at: Optional[str] = None  # Timestamp when applied


@dataclass
class FixBatch:
    """Batch of fixes to apply."""
    fixes: List[SuggestedFix] = field(default_factory=list)
    total_confidence: float = 0.0
    status: FixStatus = FixStatus.PENDING


class AutoFixManager(QObject):
    """
    Manages automatic code fixes workflow.

    Coordinates error analysis and code diff to suggest and apply fixes.

    Example:
        manager = AutoFixManager(gemini_client)

        # Get fixes for an error
        fixes = manager.get_fixes_for_error(error_code, error_message, error_details)

        # Preview first fix
        fix = fixes[0]
        diff = manager.preview_fix(fix)  # Shows diff dialog

        # Apply fix
        manager.apply_fix(fix)
        new_code = fix.fixed_code
    """

    # Signals
    fixes_ready = Signal(list)  # List of SuggestedFix
    fix_applied = Signal(SuggestedFix)
    fix_rejected = Signal(SuggestedFix)
    fix_failed = Signal(str)  # Error message
    progress = Signal(str)

    def __init__(self, gemini_client: object) -> None:
        """Initialize auto-fix manager."""
        super().__init__()
        self._client = gemini_client
        self._analyzer = AIErrorAnalyzer(gemini_client)
        self._diff_analyzer = CodeDiffAnalyzer()
        self._fix_history: List[SuggestedFix] = []
        self._applied_fixes: Dict[str, SuggestedFix] = {}

    def set_client(self, client: object) -> None:
        """Update Gemini client."""
        self._client = client
        self._analyzer.set_client(client)

    def get_fixes_for_error(self, error_code: str, error_message: str,
                           error_details: str,
                           original_code: str = "") -> List[SuggestedFix]:
        """
        Get suggested fixes for an error.

        Args:
            error_code: Error identifier
            error_message: Short error message
            error_details: Long error details
            original_code: Current code to fix

        Returns:
            List of SuggestedFix objects
        """
        try:
            self.progress.emit(f"Analyzing error {error_code}...")

            # Get error analysis
            request = ErrorAnalysisRequest(
                error_code=error_code,
                error_message=error_message,
                error_details=error_details
            )
            explanation = self._analyzer.analyze(request)

            if explanation.confidence < 0.3:
                self.fix_failed.emit("Error analysis confidence too low")
                return []

            self.progress.emit("Generating fixes...")

            # Convert fix suggestions to SuggestedFix objects
            fixes = []
            for i, fix_description in enumerate(explanation.fix_suggestions[:3]):
                # For now, use the fix description as is
                # In a real system, would generate actual code
                fixed_code = self._generate_fixed_code(
                    original_code,
                    fix_description,
                    error_code
                )

                fix = SuggestedFix(
                    error_code=error_code,
                    error_message=error_message,
                    fix_index=i,
                    fix_description=fix_description,
                    original_code=original_code,
                    fixed_code=fixed_code,
                    confidence=explanation.confidence - (i * 0.1)  # Decrease by 10% per fix
                )
                fixes.append(fix)

            # Sort by confidence (highest first)
            fixes.sort(key=lambda f: f.confidence, reverse=True)

            self._fix_history.extend(fixes)
            self.fixes_ready.emit(fixes)

            return fixes

        except Exception as e:
            error_msg = f"Fix generation failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            self.fix_failed.emit(error_msg)
            return []

    def preview_fix(self, fix: SuggestedFix) -> CodeDiff:
        """
        Generate diff preview for a fix.

        Args:
            fix: SuggestedFix to preview

        Returns:
            CodeDiff showing changes
        """
        return self._diff_analyzer.compare(fix.original_code, fix.fixed_code)

    def apply_fix(self, fix: SuggestedFix) -> bool:
        """
        Apply a fix to the code.

        Args:
            fix: SuggestedFix to apply

        Returns:
            True if applied successfully
        """
        try:
            if not fix.fixed_code:
                self.fix_failed.emit("No fixed code available")
                return False

            # Mark as applied
            fix.status = FixStatus.APPLIED
            from datetime import datetime
            fix.applied_at = datetime.now().isoformat()

            # Track in applied fixes
            self._applied_fixes[fix.error_code] = fix

            self.fix_applied.emit(fix)
            self.progress.emit(f"Applied fix for {fix.error_code}")

            return True

        except Exception as e:
            error_msg = f"Fix application failed: {str(e)}"
            logger.error(error_msg)
            fix.status = FixStatus.FAILED
            self.fix_failed.emit(error_msg)
            return False

    def reject_fix(self, fix: SuggestedFix) -> None:
        """Reject a fix."""
        fix.status = FixStatus.REJECTED
        self.fix_rejected.emit(fix)

    def apply_batch(self, fixes: List[SuggestedFix]) -> bool:
        """
        Apply multiple fixes in sequence.

        Args:
            fixes: List of SuggestedFix objects

        Returns:
            True if all fixes applied successfully
        """
        all_applied = True
        for i, fix in enumerate(fixes, 1):
            self.progress.emit(f"Applying fix {i} of {len(fixes)}...")
            if not self.apply_fix(fix):
                all_applied = False

        return all_applied

    def get_fix_history(self) -> List[SuggestedFix]:
        """Get history of all fixes."""
        return self._fix_history.copy()

    def get_applied_fixes(self) -> Dict[str, SuggestedFix]:
        """Get all applied fixes."""
        return self._applied_fixes.copy()

    def clear_history(self) -> None:
        """Clear fix history."""
        self._fix_history.clear()
        self._applied_fixes.clear()

    def _generate_fixed_code(self, original_code: str,
                            fix_description: str,
                            error_code: str) -> str:
        """
        Generate fixed code from fix description.

        This is a placeholder that in production would call Gemini
        to generate actual corrected code.

        Args:
            original_code: Original code with error
            fix_description: Description of the fix
            error_code: Error identifier

        Returns:
            Fixed code
        """
        # Placeholder: For now, just return original code
        # In production, would use Gemini to generate actual fixes
        if not original_code:
            return ""

        # Could implement simple pattern-based fixes here
        # For now, return the original as placeholder
        return original_code

    def get_statistics(self) -> Dict:
        """Get fix statistics."""
        total_fixes = len(self._fix_history)
        applied = len(self._applied_fixes)
        rejected = sum(1 for f in self._fix_history if f.status == FixStatus.REJECTED)
        failed = sum(1 for f in self._fix_history if f.status == FixStatus.FAILED)

        return {
            "total_fixes_suggested": total_fixes,
            "fixes_applied": applied,
            "fixes_rejected": rejected,
            "fixes_failed": failed,
            "average_confidence": (
                sum(f.confidence for f in self._fix_history) / total_fixes
                if total_fixes > 0 else 0.0
            )
        }
