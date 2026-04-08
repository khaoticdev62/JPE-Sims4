"""
File Monitor System using Watchdog for JPE Sims 4 Mod Translator.

This module provides file system monitoring capabilities to detect changes in 
mod source files and trigger automatic rebuilds or notifications.
"""

import os
import time
from pathlib import Path
from typing import Callable, Dict, List, Optional, Set
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from dataclasses import dataclass
from enum import Enum
import threading
import logging
from datetime import datetime


class FileEventType(Enum):
    """Types of file events that can be monitored."""
    CREATED = "created"
    DELETED = "deleted"
    MODIFIED = "modified"
    MOVED = "moved"


@dataclass
class FileEvent:
    """Represents a file system event."""
    event_type: FileEventType
    file_path: Path
    timestamp: datetime
    is_directory: bool = False
    src_path: Optional[Path] = None  # For moved events


class JPEFileHandler(FileSystemEventHandler):
    """Custom file system event handler for JPE mod files."""
    
    def __init__(self, 
                 callback: Optional[Callable[[FileEvent], None]] = None,
                 watched_extensions: Set[str] = None,
                 excluded_dirs: Set[str] = None):
        super().__init__()
        self.callback = callback
        self.watched_extensions = watched_extensions or {".jpe", ".xml", ".json", ".txt", ".py"}
        self.excluded_dirs = excluded_dirs or {".git", "__pycache__", ".vscode", "logs", "build"}
        
        # Track recent events to prevent duplicates
        self.recent_events: Dict[str, float] = {}
        self.event_cooldown = 0.5  # seconds
    
    def should_process_file(self, file_path: str) -> bool:
        """Check if a file should be processed based on extension and directory."""
        path = Path(file_path)
        
        # Check if in excluded directory
        for excluded_dir in self.excluded_dirs:
            if excluded_dir in path.parts:
                return False
        
        # Check file extension
        if path.suffix.lower() in self.watched_extensions:
            return True
        
        # Also monitor directory changes that might affect watched files
        if path.is_dir():
            return True
        
        return False
    
    def on_created(self, event):
        """Handle file creation events."""
        if not event.is_directory and self.should_process_file(event.src_path):
            if self._is_not_duplicate(event.src_path):
                file_event = FileEvent(
                    event_type=FileEventType.CREATED,
                    file_path=Path(event.src_path),
                    timestamp=datetime.now(),
                    is_directory=event.is_directory
                )
                self._process_event(file_event)
    
    def on_deleted(self, event):
        """Handle file deletion events."""
        if not event.is_directory and self.should_process_file(event.src_path):
            if self._is_not_duplicate(event.src_path):
                file_event = FileEvent(
                    event_type=FileEventType.DELETED,
                    file_path=Path(event.src_path),
                    timestamp=datetime.now(),
                    is_directory=event.is_directory
                )
                self._process_event(file_event)
    
    def on_modified(self, event):
        """Handle file modification events."""
        if not event.is_directory and self.should_process_file(event.src_path):
            if self._is_not_duplicate(event.src_path):
                file_event = FileEvent(
                    event_type=FileEventType.MODIFIED,
                    file_path=Path(event.src_path),
                    timestamp=datetime.now(),
                    is_directory=event.is_directory
                )
                self._process_event(file_event)
    
    def on_moved(self, event):
        """Handle file move events."""
        if not event.is_directory and self.should_process_file(event.dest_path):
            if self._is_not_duplicate(event.dest_path):
                file_event = FileEvent(
                    event_type=FileEventType.MOVED,
                    file_path=Path(event.dest_path),
                    timestamp=datetime.now(),
                    is_directory=event.is_directory,
                    src_path=Path(event.src_path)
                )
                self._process_event(file_event)
    
    def _is_not_duplicate(self, file_path: str) -> bool:
        """Check if this event is a duplicate within the cooldown period."""
        current_time = time.time()
        path_str = str(Path(file_path).resolve())
        
        # Clean up old events
        current_events = {}
        for event_path, event_time in self.recent_events.items():
            if current_time - event_time < self.event_cooldown:
                current_events[event_path] = event_time
        self.recent_events = current_events
        
        # Check if this path has been seen recently
        if path_str in self.recent_events:
            return False
        
        # Record this event
        self.recent_events[path_str] = current_time
        return True
    
    def _process_event(self, file_event: FileEvent):
        """Process a file event by calling the callback."""
        if self.callback:
            try:
                self.callback(file_event)
            except Exception as e:
                logging.error(f"Error processing file event {file_event}: {e}")


class FileMonitor:
    """Main file monitor class that uses watchdog for file system monitoring."""
    
    def __init__(self):
        self.observer = Observer()
        self.watched_paths: Dict[Path, JPEFileHandler] = {}
        self.is_running = False
        self.monitor_thread: Optional[threading.Thread] = None
        
        # Default settings
        self.default_extensions = {".jpe", ".jpe-xml", ".xml", ".json", ".txt", ".py"}
        self.default_excluded_dirs = {".git", "__pycache__", ".vscode", "logs", "dist", "build", "__pycache__", ".pytest_cache"}
    
    def add_watch_path(self,
                       path: Path,
                       callback: Optional[Callable[[FileEvent], None]] = None,
                       extensions: Optional[Set[str]] = None,
                       excluded_dirs: Optional[Set[str]] = None) -> str:
        """
        Add a path to watch for file changes.
        
        Args:
            path: Path to watch
            callback: Function to call when a file event occurs
            extensions: File extensions to watch (defaults to common mod files)
            excluded_dirs: Directories to exclude from monitoring
        
        Returns:
            Watch ID for removing the watch later
        """
        path = Path(path).resolve()
        
        if not path.exists():
            raise FileNotFoundError(f"Path does not exist: {path}")
        
        # Create file handler
        handler = JPEFileHandler(
            callback=callback,
            watched_extensions=extensions or self.default_extensions,
            excluded_dirs=excluded_dirs or self.default_excluded_dirs
        )
        
        # Schedule the observer
        watch = self.observer.schedule(handler, str(path), recursive=True)
        self.watched_paths[path] = handler
        
        return str(watch)
    
    def remove_watch_path(self, path: Path):
        """Remove a path from monitoring."""
        path = Path(path).resolve()
        if path in self.watched_paths:
            # Note: watchdog doesn't have a direct way to remove individual watches
            # We'll need to stop and restart the observer for changes to take effect
            del self.watched_paths[path]
    
    def start_monitoring(self):
        """Start the file monitoring service."""
        if not self.is_running:
            self.observer.start()
            self.is_running = True
            
            # Create a daemon thread to keep the observer alive
            def observer_loop():
                try:
                    while self.is_running:
                        time.sleep(1)
                except KeyboardInterrupt:
                    self.stop_monitoring()
            
            self.monitor_thread = threading.Thread(target=observer_loop, daemon=True)
            self.monitor_thread.start()
    
    def stop_monitoring(self):
        """Stop the file monitoring service."""
        if self.is_running:
            self.is_running = False
            self.observer.stop()
            self.observer.join(timeout=2)  # Wait up to 2 seconds for cleanup
    
    def is_active(self) -> bool:
        """Check if the monitor is currently active."""
        return self.is_running


class ModProjectMonitor:
    """Specialized monitor for JPE mod projects."""
    
    def __init__(self, project_root: Path):
        self.project_root = Path(project_root)
        self.file_monitor = FileMonitor()
        self.modification_callbacks: List[Callable[[FileEvent], None]] = []
        self.auto_build_enabled = False
        self.build_function: Optional[Callable] = None
    
    def enable_auto_build(self, build_function: Callable):
        """Enable auto-building when source files change."""
        self.auto_build_enabled = True
        self.build_function = build_function
        self._setup_auto_build_callback()
    
    def disable_auto_build(self):
        """Disable auto-building."""
        self.auto_build_enabled = False
        self.build_function = None
    
    def _setup_auto_build_callback(self):
        """Setup the callback for auto-building."""
        def auto_build_callback(file_event: FileEvent):
            if self.auto_build_enabled and self.build_function:
                # Only trigger build for certain file changes
                if file_event.event_type in [FileEventType.CREATED, FileEventType.MODIFIED]:
                    if file_event.file_path.suffix.lower() in ['.jpe', '.xml', '.json']:
                        # Debounce: don't trigger build too frequently
                        if not hasattr(self, '_last_build_time'):
                            self._last_build_time = 0
                        
                        current_time = time.time()
                        if current_time - self._last_build_time > 2:  # 2 second debounce
                            self._last_build_time = current_time
                            
                            # Run build in a separate thread to avoid blocking file monitoring
                            build_thread = threading.Thread(
                                target=self._execute_build_thread,
                                args=(file_event,),
                                daemon=True
                            )
                            build_thread.start()
        
        self.file_monitor.add_watch_path(
            self.project_root / "src",
            callback=auto_build_callback
        )
    
    def _execute_build_thread(self, triggering_event: FileEvent):
        """Execute the build function in a separate thread."""
        try:
            print(f"Auto-building triggered by {triggering_event.file_path.name} change...")
            self.build_function()
            print("Auto-build completed successfully!")
        except Exception as e:
            print(f"Auto-build failed: {e}")
    
    def add_file_change_callback(self, callback: Callable[[FileEvent], None]):
        """Add a callback function to be called on file changes."""
        self.modification_callbacks.append(callback)
        
        # Setup a general callback that calls all registered callbacks
        def general_callback(file_event: FileEvent):
            for cb in self.modification_callbacks:
                try:
                    cb(file_event)
                except Exception as e:
                    # Log error but continue processing other callbacks
                    print(f"Error in file change callback: {e}")
        
        # Add the path watching (this will replace the previous handler)
        # We'll just add it again to ensure the new callback is registered
        self.file_monitor.add_watch_path(self.project_root, callback=general_callback)
    
    def start_monitoring(self):
        """Start monitoring the project for changes."""
        self.file_monitor.start_monitoring()
    
    def stop_monitoring(self):
        """Stop monitoring the project for changes."""
        self.file_monitor.stop_monitoring()


class FileChangeNotifier:
    """Simple notification system for file changes."""
    
    def __init__(self):
        self.notifications: List[FileEvent] = []
        self.max_notifications = 100
    
    def notify_file_change(self, file_event: FileEvent):
        """Record a file change notification."""
        self.notifications.append(file_event)
        
        # Limit the number of stored notifications
        if len(self.notifications) > self.max_notifications:
            self.notifications.pop(0)
    
    def get_recent_notifications(self, count: int = 10) -> List[FileEvent]:
        """Get recent file change notifications."""
        return self.notifications[-count:]
    
    def clear_notifications(self):
        """Clear all notifications."""
        self.notifications.clear()
    
    def has_unread_changes(self) -> bool:
        """Check if there are any unread file changes."""
        # In a real implementation, we'd track read status
        return len(self.notifications) > 0


# Global file monitor instance
file_monitor = FileMonitor()