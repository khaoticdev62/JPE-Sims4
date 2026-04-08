"""Collaborative editing system for JPE Studio.

Enables multiple users to edit the same mod file simultaneously with
conflict resolution, change tracking, and real-time synchronization.
"""

import tkinter as tk
from tkinter import ttk
import threading
import json
import hashlib
from typing import Callable, List, Dict, Optional, Any
from dataclasses import dataclass, asdict
from pathlib import Path
from datetime import datetime
from enum import Enum
import queue


class ChangeType(Enum):
    """Types of changes in collaborative editing."""

    INSERT = "insert"
    DELETE = "delete"
    REPLACE = "replace"
    MOVE = "move"
    MERGE = "merge"


@dataclass
class TextChange:
    """Single text change in collaborative editing."""

    change_type: ChangeType
    position: int
    length: int
    content: str
    user_id: str
    timestamp: datetime
    session_id: str

    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return {
            "change_type": self.change_type.value,
            "position": self.position,
            "length": self.length,
            "content": self.content,
            "user_id": self.user_id,
            "timestamp": self.timestamp.isoformat(),
            "session_id": self.session_id,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'TextChange':
        """Create from dictionary."""
        return cls(
            change_type=ChangeType(data["change_type"]),
            position=data["position"],
            length=data["length"],
            content=data["content"],
            user_id=data["user_id"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            session_id=data["session_id"],
        )


@dataclass
class UserSession:
    """User session in collaborative editing."""

    user_id: str
    username: str
    session_id: str
    cursor_position: int = 0
    selection_start: int = 0
    selection_end: int = 0
    is_active: bool = True
    last_activity: datetime = None

    def __post_init__(self):
        if self.last_activity is None:
            self.last_activity = datetime.now()


class ConflictResolver:
    """Resolves conflicts in collaborative editing using Operational Transformation."""

    @staticmethod
    def resolve_conflicts(changes: List[TextChange], base_text: str) -> str:
        """Resolve conflicts and apply changes to base text.

        Args:
            changes: List of changes to apply
            base_text: Base text state

        Returns:
            Resolved text after all changes
        """
        # Sort changes by timestamp (FIFO order)
        sorted_changes = sorted(changes, key=lambda c: c.timestamp)

        result = base_text

        for change in sorted_changes:
            if change.change_type == ChangeType.INSERT:
                result = (
                    result[:change.position] +
                    change.content +
                    result[change.position:]
                )
            elif change.change_type == ChangeType.DELETE:
                result = (
                    result[:change.position] +
                    result[change.position + change.length:]
                )
            elif change.change_type == ChangeType.REPLACE:
                result = (
                    result[:change.position] +
                    change.content +
                    result[change.position + change.length:]
                )

        return result

    @staticmethod
    def detect_conflicts(change1: TextChange, change2: TextChange) -> bool:
        """Detect if two changes conflict.

        Args:
            change1: First change
            change2: Second change

        Returns:
            True if changes conflict
        """
        # Changes conflict if they overlap
        range1_end = change1.position + change1.length
        range2_end = change2.position + change2.length

        return not (range1_end <= change2.position or range2_end <= change1.position)


class CollaborativeEditor:
    """Manages collaborative editing session."""

    def __init__(self, initial_content: str = ""):
        """Initialize collaborative editor.

        Args:
            initial_content: Initial text content
        """
        self.base_text = initial_content
        self.change_history: List[TextChange] = []
        self.user_sessions: Dict[str, UserSession] = {}

        # Callbacks
        self.on_change: Optional[Callable] = None
        self.on_user_joined: Optional[Callable] = None
        self.on_user_left: Optional[Callable] = None
        self.on_conflict_detected: Optional[Callable] = None

        # Conflict resolver
        self.resolver = ConflictResolver()

    def join_session(self, user_id: str, username: str) -> UserSession:
        """User joins collaborative session.

        Args:
            user_id: Unique user identifier
            username: User's display name

        Returns:
            UserSession object
        """
        session_id = hashlib.md5(
            f"{user_id}{datetime.now().isoformat()}".encode()
        ).hexdigest()

        session = UserSession(
            user_id=user_id,
            username=username,
            session_id=session_id
        )

        self.user_sessions[user_id] = session

        if self.on_user_joined:
            self.on_user_joined(session)

        return session

    def leave_session(self, user_id: str) -> None:
        """User leaves collaborative session.

        Args:
            user_id: User identifier
        """
        if user_id in self.user_sessions:
            session = self.user_sessions.pop(user_id)

            if self.on_user_left:
                self.on_user_left(session)

    def apply_change(self, change: TextChange) -> bool:
        """Apply a change from a user.

        Args:
            change: TextChange to apply

        Returns:
            True if successful
        """
        # Check for conflicts with recent changes
        recent_changes = [c for c in self.change_history[-10:]]  # Check last 10 changes
        conflicts = [c for c in recent_changes if self.resolver.detect_conflicts(change, c)]

        if conflicts:
            if self.on_conflict_detected:
                self.on_conflict_detected(change, conflicts)

        # Add to history
        self.change_history.append(change)

        # Resolve and update base text
        self.base_text = self.resolver.resolve_conflicts(
            self.change_history,
            self.base_text
        )

        # Emit change notification
        if self.on_change:
            self.on_change(change, self.base_text)

        return True

    def update_cursor(self, user_id: str, position: int, start: int = 0, end: int = 0) -> None:
        """Update user's cursor position.

        Args:
            user_id: User identifier
            position: Cursor position
            start: Selection start
            end: Selection end
        """
        if user_id in self.user_sessions:
            session = self.user_sessions[user_id]
            session.cursor_position = position
            session.selection_start = start
            session.selection_end = end
            session.last_activity = datetime.now()

    def get_active_users(self) -> List[UserSession]:
        """Get list of active user sessions.

        Returns:
            List of active UserSession objects
        """
        return [s for s in self.user_sessions.values() if s.is_active]

    def get_change_history(self, since: Optional[datetime] = None) -> List[TextChange]:
        """Get change history.

        Args:
            since: Optional timestamp to filter changes after

        Returns:
            List of changes
        """
        if since is None:
            return self.change_history.copy()

        return [c for c in self.change_history if c.timestamp >= since]

    def export_session(self) -> Dict[str, Any]:
        """Export session state.

        Returns:
            Dictionary with session data
        """
        return {
            "base_text": self.base_text,
            "changes": [c.to_dict() for c in self.change_history],
            "users": [
                {
                    "user_id": s.user_id,
                    "username": s.username,
                    "cursor_position": s.cursor_position,
                    "selection_start": s.selection_start,
                    "selection_end": s.selection_end,
                }
                for s in self.user_sessions.values()
            ],
            "timestamp": datetime.now().isoformat(),
        }

    def import_session(self, data: Dict[str, Any]) -> None:
        """Import session state.

        Args:
            data: Session data dictionary
        """
        self.base_text = data.get("base_text", "")
        self.change_history = [
            TextChange.from_dict(c) for c in data.get("changes", [])
        ]


class CollaborativeEditorUI(ttk.Frame):
    """UI for collaborative editing with user presence display."""

    def __init__(self, parent, editor: Optional[CollaborativeEditor] = None):
        """Initialize collaborative editor UI.

        Args:
            parent: Parent widget
            editor: Optional CollaborativeEditor instance
        """
        super().__init__(parent)

        self.editor = editor or CollaborativeEditor()
        self.current_user_id = "user_" + hashlib.md5(b"local").hexdigest()[:8]

        # Set up callbacks
        self.editor.on_user_joined = self._on_user_joined
        self.editor.on_user_left = self._on_user_left
        self.editor.on_change = self._on_change
        self.editor.on_conflict_detected = self._on_conflict_detected

        self._create_ui()

    def _create_ui(self):
        """Create the UI elements."""
        # Top bar with user info
        top_frame = ttk.Frame(self)
        top_frame.pack(fill=tk.X, padx=5, pady=5)

        ttk.Label(top_frame, text="Collaborative Editing", font=("Arial", 12, "bold")).pack(
            side=tk.LEFT
        )

        ttk.Label(top_frame, text="Users: ", font=("Arial", 10)).pack(side=tk.LEFT, padx=(20, 5))

        self.users_label = ttk.Label(
            top_frame,
            text="No active users",
            font=("Arial", 10),
            foreground="gray"
        )
        self.users_label.pack(side=tk.LEFT)

        # Main editor frame
        editor_frame = ttk.Frame(self)
        editor_frame.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

        # Text widget
        self.text_widget = tk.Text(editor_frame, wrap=tk.WORD, height=15)
        scrollbar = ttk.Scrollbar(editor_frame, orient=tk.VERTICAL, command=self.text_widget.yview)
        self.text_widget.configure(yscroll=scrollbar.set)

        self.text_widget.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # Bind text changes
        self.text_widget.bind("<Key>", self._on_text_change)
        self.text_widget.bind("<Button-1>", self._on_cursor_move)

        # User list
        user_frame = ttk.LabelFrame(self, text="Active Users", width=150)
        user_frame.pack(side=tk.RIGHT, fill=tk.BOTH, padx=5, pady=5)
        user_frame.pack_propagate(False)

        self.user_listbox = tk.Listbox(user_frame, height=20)
        self.user_listbox.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)

    def _on_text_change(self, event):
        """Handle text widget changes."""
        # Get current text and position
        content = self.text_widget.get("1.0", tk.END)
        position = len(self.text_widget.get("1.0", tk.INSERT))

        # Create change record
        change = TextChange(
            change_type=ChangeType.INSERT,
            position=position,
            length=1,
            content=event.char,
            user_id=self.current_user_id,
            timestamp=datetime.now(),
            session_id="local"
        )

        # Apply change
        self.editor.apply_change(change)

    def _on_cursor_move(self, event):
        """Handle cursor movement."""
        position = len(self.text_widget.get("1.0", tk.INSERT))
        self.editor.update_cursor(self.current_user_id, position)

    def _on_user_joined(self, session: UserSession):
        """Handle user joining."""
        self.user_listbox.insert(tk.END, f"● {session.username}")
        self._update_users_label()

    def _on_user_left(self, session: UserSession):
        """Handle user leaving."""
        items = self.user_listbox.get(0, tk.END)
        for i, item in enumerate(items):
            if session.username in item:
                self.user_listbox.delete(i)
                break
        self._update_users_label()

    def _on_change(self, change: TextChange, updated_text: str):
        """Handle text changes from other users."""
        pass  # Update would be handled by sync mechanism

    def _on_conflict_detected(self, change: TextChange, conflicts: List[TextChange]):
        """Handle conflict detection."""
        messagebox = tk.messagebox
        messagebox.showwarning(
            "Conflict Detected",
            f"Conflict detected in collaborative editing.\n"
            f"User: {change.user_id}\n"
            f"Position: {change.position}"
        )

    def _update_users_label(self):
        """Update users label."""
        count = self.user_listbox.size()
        self.users_label.config(
            text=f"{count} active" if count > 0 else "No active users"
        )

    def join_session(self, user_id: str, username: str):
        """Join collaborative session."""
        self.current_user_id = user_id
        self.editor.join_session(user_id, username)

    def leave_session(self):
        """Leave collaborative session."""
        self.editor.leave_session(self.current_user_id)
