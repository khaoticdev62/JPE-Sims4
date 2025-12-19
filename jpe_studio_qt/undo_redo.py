"""Undo/Redo system for JPE Studio.

Implements a command-based undo/redo architecture with unlimited history.
Each action is wrapped in a Command object that knows how to undo itself.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional


class Command(ABC):
    """Abstract base class for undoable commands.

    All actions that should support undo/redo inherit from this class
    and implement execute(), undo(), and optionally redo().
    """

    @abstractmethod
    def execute(self) -> None:
        """Execute the command."""
        pass

    @abstractmethod
    def undo(self) -> None:
        """Undo the command (restore previous state)."""
        pass

    def redo(self) -> None:
        """Redo the command (re-apply).

        Default implementation just calls execute().
        Override for optimized redo paths if needed.
        """
        self.execute()

    @property
    def description(self) -> str:
        """Human-readable description of command for undo/redo menu.

        Override to provide custom descriptions.
        """
        return self.__class__.__name__


class UndoRedoStack:
    """Manages undo/redo command history.

    Features:
    - Unlimited undo/redo history
    - Command grouping for multi-step operations
    - History limit for memory management
    - Change notifications

    Usage:
        stack = UndoRedoStack()

        # Execute a command
        cmd = MyCommand()
        stack.execute(cmd)

        # Undo/Redo
        if stack.can_undo():
            stack.undo()

        if stack.can_redo():
            stack.redo()
    """

    def __init__(self, max_history: int = 100) -> None:
        """Initialize undo/redo stack.

        Args:
            max_history: Maximum number of commands to keep (default: 100)
        """
        self.max_history = max_history
        self.undo_stack: list[Command] = []
        self.redo_stack: list[Command] = []
        self.command_group: Optional[list[Command]] = None
        self.change_callbacks: list[callable] = []

    def execute(self, command: Command) -> None:
        """Execute a command and add to undo history.

        Args:
            command: Command instance to execute
        """
        command.execute()

        if self.command_group is not None:
            # If in group mode, accumulate commands
            self.command_group.append(command)
        else:
            # Otherwise, add directly to undo stack
            self.undo_stack.append(command)

            # Clear redo stack (redo history is lost on new command)
            self.redo_stack.clear()

            # Enforce max history limit
            if len(self.undo_stack) > self.max_history:
                self.undo_stack.pop(0)

        self._notify_changed()

    def undo(self) -> None:
        """Undo the last command."""
        if not self.can_undo():
            return

        command = self.undo_stack.pop()
        command.undo()
        self.redo_stack.append(command)
        self._notify_changed()

    def redo(self) -> None:
        """Redo the last undone command."""
        if not self.can_redo():
            return

        command = self.redo_stack.pop()
        command.redo()
        self.undo_stack.append(command)
        self._notify_changed()

    def begin_group(self) -> None:
        """Begin a command group (composite command).

        All commands executed between begin_group() and end_group()
        will be treated as a single undo/redo operation.

        Usage:
            stack.begin_group()
            stack.execute(cmd1)
            stack.execute(cmd2)
            stack.execute(cmd3)
            stack.end_group()  # All 3 are undone with single Undo
        """
        if self.command_group is not None:
            raise RuntimeError("Already in a command group")
        self.command_group = []

    def end_group(self, description: str = "") -> None:
        """End a command group.

        Args:
            description: Optional description for the group
        """
        if self.command_group is None:
            raise RuntimeError("Not in a command group")

        if self.command_group:  # Only add if group has commands
            group = self.command_group
            self.command_group = None

            # Create composite command
            group_cmd = CompositeCommand(group, description)
            self.undo_stack.append(group_cmd)
            self.redo_stack.clear()

            # Enforce max history limit
            if len(self.undo_stack) > self.max_history:
                self.undo_stack.pop(0)

            self._notify_changed()
        else:
            self.command_group = None

    def can_undo(self) -> bool:
        """Check if undo is available."""
        return len(self.undo_stack) > 0

    def can_redo(self) -> bool:
        """Check if redo is available."""
        return len(self.redo_stack) > 0

    def undo_description(self) -> str:
        """Get description of command that will be undone."""
        if self.can_undo():
            return f"Undo {self.undo_stack[-1].description}"
        return "Nothing to undo"

    def redo_description(self) -> str:
        """Get description of command that will be redone."""
        if self.can_redo():
            return f"Redo {self.redo_stack[-1].description}"
        return "Nothing to redo"

    def clear(self) -> None:
        """Clear all undo/redo history."""
        self.undo_stack.clear()
        self.redo_stack.clear()
        self._notify_changed()

    def on_change(self, callback: callable) -> None:
        """Register callback for undo/redo state changes.

        Called whenever undo/redo state changes (can undo/redo status, etc.)

        Args:
            callback: Function to call with no arguments
        """
        self.change_callbacks.append(callback)

    def _notify_changed(self) -> None:
        """Notify all registered callbacks of state change."""
        for callback in self.change_callbacks:
            try:
                callback()
            except Exception:
                pass  # Silently ignore callback errors


class CompositeCommand(Command):
    """Composite command grouping multiple commands.

    Executes multiple commands as a single undo/redo operation.
    """

    def __init__(self, commands: list[Command], description: str = "") -> None:
        """Initialize composite command.

        Args:
            commands: List of commands to execute in order
            description: Optional custom description
        """
        self.commands = commands
        self._description = description

    def execute(self) -> None:
        """Execute all commands in order."""
        for cmd in self.commands:
            cmd.execute()

    def undo(self) -> None:
        """Undo all commands in reverse order."""
        for cmd in reversed(self.commands):
            cmd.undo()

    def redo(self) -> None:
        """Redo all commands in order."""
        for cmd in self.commands:
            cmd.redo()

    @property
    def description(self) -> str:
        """Get composite command description."""
        if self._description:
            return self._description
        if self.commands:
            return f"{len(self.commands)} actions"
        return "Composite"


# Example command implementations
class SetValueCommand(Command):
    """Simple command to set a value on an object.

    Example:
        cmd = SetValueCommand(obj, 'property_name', old_value, new_value)
        stack.execute(cmd)
    """

    def __init__(self, obj: object, attr: str, old_value: object, new_value: object) -> None:
        self.obj = obj
        self.attr = attr
        self.old_value = old_value
        self.new_value = new_value

    def execute(self) -> None:
        setattr(self.obj, self.attr, self.new_value)

    def undo(self) -> None:
        setattr(self.obj, self.attr, self.old_value)

    @property
    def description(self) -> str:
        return f"Set {self.attr}"
