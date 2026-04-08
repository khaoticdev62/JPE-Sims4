"""Undo/Redo system for JPE Studio editor.

Provides comprehensive undo/redo functionality with action history,
keyboard shortcuts, and state management.
"""

import tkinter as tk
from tkinter import ttk
from typing import Callable, List, Optional, Any, Dict
from dataclasses import dataclass
from enum import Enum
from datetime import datetime


class ActionType(Enum):
    """Types of editor actions that can be undone."""

    INSERT_TEXT = "insert_text"
    DELETE_TEXT = "delete_text"
    REPLACE_TEXT = "replace_text"
    MODIFY_FILE = "modify_file"
    CREATE_FILE = "create_file"
    DELETE_FILE = "delete_file"


@dataclass
class EditorAction:
    """Single action that can be undone/redone."""

    action_type: ActionType
    description: str
    data: Dict[str, Any]
    timestamp: datetime
    execute: Callable
    undo: Callable
    redo: Optional[Callable] = None

    def __post_init__(self):
        """Set redo to execute if not specified."""
        if self.redo is None:
            self.redo = self.execute


class UndoRedoSystem:
    """Manages undo/redo for editor actions."""

    def __init__(self, max_history: int = 100):
        """Initialize undo/redo system.

        Args:
            max_history: Maximum number of actions to keep in history
        """
        self.max_history = max_history
        self.undo_stack: List[EditorAction] = []
        self.redo_stack: List[EditorAction] = []
        self.current_index = -1

        # Callbacks
        self.on_history_change: Optional[Callable] = None
        self.on_action_executed: Optional[Callable] = None

    def execute_action(self, action: EditorAction) -> None:
        """Execute an action and add to history.

        Args:
            action: Action to execute
        """
        # Execute the action
        action.execute()

        # Clear redo stack (new action invalidates redo history)
        self.redo_stack.clear()

        # Add to undo stack
        self.undo_stack.append(action)

        # Limit history size
        if len(self.undo_stack) > self.max_history:
            self.undo_stack.pop(0)

        self.current_index = len(self.undo_stack) - 1

        # Emit callbacks
        if self.on_action_executed:
            self.on_action_executed(action)
        if self.on_history_change:
            self.on_history_change()

    def undo(self) -> bool:
        """Undo the last action.

        Returns:
            True if undo was successful, False otherwise
        """
        if not self.can_undo():
            return False

        # Get the action to undo
        action = self.undo_stack[self.current_index]

        # Execute undo
        action.undo()

        # Move to redo stack
        self.redo_stack.append(action)
        self.current_index -= 1

        # Emit callback
        if self.on_history_change:
            self.on_history_change()

        return True

    def redo(self) -> bool:
        """Redo the last undone action.

        Returns:
            True if redo was successful, False otherwise
        """
        if not self.can_redo():
            return False

        # Get the action to redo
        action = self.redo_stack.pop()

        # Execute redo
        if action.redo:
            action.redo()
        else:
            action.execute()

        # Move back to undo stack
        self.undo_stack.append(action)
        self.current_index += 1

        # Emit callback
        if self.on_history_change:
            self.on_history_change()

        return True

    def can_undo(self) -> bool:
        """Check if undo is available.

        Returns:
            True if undo is available
        """
        return self.current_index >= 0

    def can_redo(self) -> bool:
        """Check if redo is available.

        Returns:
            True if redo is available
        """
        return len(self.redo_stack) > 0

    def get_undo_description(self) -> str:
        """Get description of last undoable action.

        Returns:
            Description string
        """
        if not self.can_undo():
            return "Nothing to undo"

        action = self.undo_stack[self.current_index]
        return f"Undo: {action.description}"

    def get_redo_description(self) -> str:
        """Get description of last redoable action.

        Returns:
            Description string
        """
        if not self.can_redo():
            return "Nothing to redo"

        action = self.redo_stack[-1]
        return f"Redo: {action.description}"

    def get_history(self) -> List[Dict[str, Any]]:
        """Get action history.

        Returns:
            List of action history items
        """
        return [
            {
                "type": action.action_type.value,
                "description": action.description,
                "timestamp": action.timestamp.isoformat(),
            }
            for action in self.undo_stack
        ]

    def clear(self) -> None:
        """Clear all history."""
        self.undo_stack.clear()
        self.redo_stack.clear()
        self.current_index = -1

        if self.on_history_change:
            self.on_history_change()


class EditorTextWidget(tk.Text):
    """Enhanced Text widget with undo/redo support."""

    def __init__(self, parent, undo_redo_system: UndoRedoSystem, **kwargs):
        """Initialize editor text widget.

        Args:
            parent: Parent widget
            undo_redo_system: UndoRedoSystem instance
            **kwargs: Additional Text widget arguments
        """
        super().__init__(parent, **kwargs)

        self.undo_redo_system = undo_redo_system
        self.is_processing_action = False

        # Bind events for tracking changes
        self.bind("<Key>", self._on_key_event)
        self.bind("<Control-z>", self._on_undo)
        self.bind("<Control-y>", self._on_redo)
        self.bind("<Control-Shift-z>", self._on_redo)  # Alternative redo binding

        # Track last text state for undo grouping
        self.last_text = ""
        self.last_action_type: Optional[ActionType] = None
        self.pending_action_data: Dict[str, Any] = {}

    def _on_key_event(self, event):
        """Handle key events for tracking changes.

        Args:
            event: Key event
        """
        # Ignore if processing an undo/redo
        if self.is_processing_action:
            return

        # Store current state before change
        current_text = self.get("1.0", tk.END)

        # Special handling for common keys
        if event.keysym in ("Control_L", "Control_R", "Shift_L", "Shift_R"):
            return

        # After the event is processed, check for changes
        self.after(10, self._check_for_changes, current_text)

    def _check_for_changes(self, previous_text: str) -> None:
        """Check for text changes and create undo action.

        Args:
            previous_text: Text before the key event
        """
        current_text = self.get("1.0", tk.END)

        if current_text != previous_text:
            # Determine action type
            if len(current_text) > len(previous_text):
                action_type = ActionType.INSERT_TEXT
            else:
                action_type = ActionType.DELETE_TEXT

            # Create undo action
            action = EditorAction(
                action_type=action_type,
                description=f"{action_type.value}",
                data={
                    "previous_text": previous_text,
                    "current_text": current_text,
                },
                timestamp=datetime.now(),
                execute=lambda: self._restore_text(current_text),
                undo=lambda: self._restore_text(previous_text),
                redo=lambda: self._restore_text(current_text),
            )

            # Execute action
            self.undo_redo_system.execute_action(action)

    def _restore_text(self, text: str) -> None:
        """Restore text to a specific state.

        Args:
            text: Text to restore
        """
        try:
            self.is_processing_action = True
            self.delete("1.0", tk.END)
            self.insert("1.0", text)
        finally:
            self.is_processing_action = False

    def _on_undo(self, event) -> str:
        """Handle undo request.

        Args:
            event: Event data

        Returns:
            "break" to prevent default behavior
        """
        self.undo_redo_system.undo()
        return "break"

    def _on_redo(self, event) -> str:
        """Handle redo request.

        Args:
            event: Event data

        Returns:
            "break" to prevent default behavior
        """
        self.undo_redo_system.redo()
        return "break"


class UndoRedoMenu(ttk.Frame):
    """Menu bar component for undo/redo controls."""

    def __init__(self, parent, undo_redo_system: UndoRedoSystem):
        """Initialize undo/redo menu.

        Args:
            parent: Parent widget
            undo_redo_system: UndoRedoSystem instance
        """
        super().__init__(parent)

        self.undo_redo_system = undo_redo_system
        self.undo_redo_system.on_history_change = self._on_history_change

        # Create buttons
        self.undo_button = ttk.Button(
            self,
            text="↶ Undo",
            command=self._on_undo_clicked,
            state=tk.DISABLED
        )
        self.undo_button.pack(side=tk.LEFT, padx=2)

        self.redo_button = ttk.Button(
            self,
            text="↷ Redo",
            command=self._on_redo_clicked,
            state=tk.DISABLED
        )
        self.redo_button.pack(side=tk.LEFT, padx=2)

        # Add separator
        separator = ttk.Separator(self, orient=tk.VERTICAL)
        separator.pack(side=tk.LEFT, padx=5, fill=tk.Y)

        # Status label
        self.status_label = ttk.Label(
            self,
            text="Ready",
            font=("Arial", 9)
        )
        self.status_label.pack(side=tk.LEFT, padx=5)

        # Initial state
        self._on_history_change()

    def _on_undo_clicked(self) -> None:
        """Handle undo button click."""
        self.undo_redo_system.undo()

    def _on_redo_clicked(self) -> None:
        """Handle redo button click."""
        self.undo_redo_system.redo()

    def _on_history_change(self) -> None:
        """Update button states and labels."""
        # Update undo button
        if self.undo_redo_system.can_undo():
            self.undo_button.config(state=tk.NORMAL)
            undo_text = self.undo_redo_system.get_undo_description()
        else:
            self.undo_button.config(state=tk.DISABLED)
            undo_text = "Nothing to undo"

        # Update redo button
        if self.undo_redo_system.can_redo():
            self.redo_button.config(state=tk.NORMAL)
            redo_text = self.undo_redo_system.get_redo_description()
        else:
            self.redo_button.config(state=tk.DISABLED)
            redo_text = "Nothing to redo"

        # Update status
        self.status_label.config(text=undo_text)
