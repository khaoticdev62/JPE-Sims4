"""Project save/load functionality with automatic persistence.

Handles serializing/deserializing project data to/from disk.
Supports auto-save, backup creation, and recovery.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)


class ProjectPersistence:
    """Handles project serialization and persistence.

    Features:
    - Save projects to JSON with full data preservation
    - Load projects from disk
    - Auto-save at regular intervals
    - Backup creation before save
    - Recovery from backups
    - Last modified tracking

    Usage:
        persistence = ProjectPersistence(projects_dir="/path/to/projects")

        # Save a project
        persistence.save_project(project, "my_project")

        # Load a project
        project = persistence.load_project("my_project")

        # Auto-save setup
        persistence.enable_autosave(project, interval_seconds=30)
    """

    def __init__(self, projects_dir: str | Path = None) -> None:
        """Initialize project persistence.

        Args:
            projects_dir: Directory to store projects (default: ~/JPEProjects)
        """
        if projects_dir is None:
            projects_dir = Path.home() / "JPEProjects"
        else:
            projects_dir = Path(projects_dir)

        self.projects_dir = Path(projects_dir)
        self.projects_dir.mkdir(parents=True, exist_ok=True)
        self.backups_dir = self.projects_dir / ".backups"
        self.backups_dir.mkdir(parents=True, exist_ok=True)

        self.autosave_timers: dict[str, Any] = {}
        logger.info(f"Project persistence initialized at {self.projects_dir}")

    def save_project(self, project: Any, project_name: str) -> Path:
        """Save a project to disk.

        Args:
            project: Project object to save
            project_name: Name/identifier for the project

        Returns:
            Path to saved project file

        Raises:
            IOError: If save fails
        """
        try:
            # Create backup if file exists
            project_path = self.projects_dir / f"{project_name}.jpe"
            if project_path.exists():
                self._create_backup(project_path)

            # Serialize project to dict
            project_data = self._serialize_project(project)

            # Add metadata
            project_data["_metadata"] = {
                "name": project_name,
                "saved_at": datetime.now().isoformat(),
                "version": "1.0",
            }

            # Write to file
            with open(project_path, "w") as f:
                json.dump(project_data, f, indent=2, default=str)

            logger.info(f"Project saved: {project_path}")
            return project_path

        except Exception as e:
            logger.error(f"Failed to save project {project_name}: {e}")
            raise IOError(f"Failed to save project: {e}")

    def load_project(self, project_name: str) -> Optional[dict[str, Any]]:
        """Load a project from disk.

        Args:
            project_name: Name/identifier of project to load

        Returns:
            Project data dict or None if not found

        Raises:
            IOError: If load fails
        """
        try:
            project_path = self.projects_dir / f"{project_name}.jpe"

            if not project_path.exists():
                logger.warning(f"Project not found: {project_path}")
                return None

            with open(project_path, "r") as f:
                project_data = json.load(f)

            logger.info(f"Project loaded: {project_path}")
            return project_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse project JSON {project_name}: {e}")
            raise IOError(f"Invalid project file format: {e}")
        except Exception as e:
            logger.error(f"Failed to load project {project_name}: {e}")
            raise IOError(f"Failed to load project: {e}")

    def list_projects(self) -> list[tuple[str, datetime]]:
        """List all saved projects with their modification times.

        Returns:
            List of (project_name, modified_datetime) tuples
        """
        projects = []
        for project_file in self.projects_dir.glob("*.jpe"):
            name = project_file.stem
            mod_time = datetime.fromtimestamp(project_file.stat().st_mtime)
            projects.append((name, mod_time))

        return sorted(projects, key=lambda x: x[1], reverse=True)

    def delete_project(self, project_name: str) -> bool:
        """Delete a project file.

        Args:
            project_name: Name of project to delete

        Returns:
            True if deleted, False if not found
        """
        try:
            project_path = self.projects_dir / f"{project_name}.jpe"
            if project_path.exists():
                project_path.unlink()
                logger.info(f"Project deleted: {project_name}")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete project {project_name}: {e}")
            return False

    def _create_backup(self, project_path: Path) -> Path:
        """Create a backup of a project file.

        Args:
            project_path: Path to project file

        Returns:
            Path to backup file
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{project_path.stem}_backup_{timestamp}.jpe"
        backup_path = self.backups_dir / backup_name

        try:
            # Copy current file to backup
            backup_path.write_bytes(project_path.read_bytes())
            logger.info(f"Backup created: {backup_path}")

            # Keep only last 5 backups per project
            self._cleanup_old_backups(project_path.stem)

            return backup_path
        except Exception as e:
            logger.warning(f"Failed to create backup: {e}")
            return backup_path

    def _cleanup_old_backups(self, project_name: str, keep: int = 5) -> None:
        """Delete old backups, keeping only the most recent.

        Args:
            project_name: Project name
            keep: Number of recent backups to keep
        """
        backups = sorted(
            self.backups_dir.glob(f"{project_name}_backup_*.jpe"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )

        for backup in backups[keep:]:
            try:
                backup.unlink()
                logger.debug(f"Old backup deleted: {backup}")
            except Exception as e:
                logger.warning(f"Failed to delete old backup: {e}")

    def restore_from_backup(self, project_name: str, backup_index: int = 0) -> Optional[Path]:
        """Restore a project from a backup.

        Args:
            project_name: Name of project
            backup_index: Index of backup to restore (0=most recent)

        Returns:
            Path to restored project or None if failed
        """
        try:
            backups = sorted(
                self.backups_dir.glob(f"{project_name}_backup_*.jpe"),
                key=lambda p: p.stat().st_mtime,
                reverse=True,
            )

            if backup_index >= len(backups):
                logger.warning(f"Backup index {backup_index} not found for {project_name}")
                return None

            backup_path = backups[backup_index]
            project_path = self.projects_dir / f"{project_name}.jpe"

            # Create backup of current (if exists)
            if project_path.exists():
                self._create_backup(project_path)

            # Restore from backup
            project_path.write_bytes(backup_path.read_bytes())
            logger.info(f"Project restored from backup: {backup_path}")

            return project_path

        except Exception as e:
            logger.error(f"Failed to restore backup: {e}")
            return None

    def enable_autosave(
        self, project: Any, project_name: str, interval_seconds: int = 60
    ) -> None:
        """Enable auto-save for a project.

        Args:
            project: Project object to auto-save
            project_name: Project name for saving
            interval_seconds: Save interval in seconds
        """
        from PySide6.QtCore import QTimer

        # Cancel existing timer if any
        if project_name in self.autosave_timers:
            self.autosave_timers[project_name].stop()

        # Create new timer
        timer = QTimer()

        def do_autosave():
            try:
                self.save_project(project, project_name)
            except Exception as e:
                logger.warning(f"Auto-save failed for {project_name}: {e}")

        timer.timeout.connect(do_autosave)
        timer.start(interval_seconds * 1000)

        self.autosave_timers[project_name] = timer
        logger.info(f"Auto-save enabled for {project_name} (interval: {interval_seconds}s)")

    def disable_autosave(self, project_name: str) -> None:
        """Disable auto-save for a project.

        Args:
            project_name: Project name
        """
        if project_name in self.autosave_timers:
            self.autosave_timers[project_name].stop()
            del self.autosave_timers[project_name]
            logger.info(f"Auto-save disabled for {project_name}")

    def _serialize_project(self, project: Any) -> dict[str, Any]:
        """Serialize project object to dictionary.

        Args:
            project: Project object (assumed to have attributes)

        Returns:
            Dictionary representation of project
        """
        # Convert project attributes to dict
        if hasattr(project, "__dict__"):
            data = {}
            for key, value in project.__dict__.items():
                # Skip private attributes and callables
                if not key.startswith("_") and not callable(value):
                    # Handle common types
                    if isinstance(value, (str, int, float, bool, type(None))):
                        data[key] = value
                    elif isinstance(value, (list, dict)):
                        data[key] = value
                    else:
                        # Convert other types to string representation
                        data[key] = str(value)
            return data
        return {}

    def export_project(self, project_name: str, export_path: Path | str) -> bool:
        """Export a project to an external location.

        Args:
            project_name: Project to export
            export_path: Path to export file

        Returns:
            True if successful, False otherwise
        """
        try:
            source = self.projects_dir / f"{project_name}.jpe"
            dest = Path(export_path)

            if not source.exists():
                logger.warning(f"Project not found: {source}")
                return False

            dest.write_bytes(source.read_bytes())
            logger.info(f"Project exported: {dest}")
            return True

        except Exception as e:
            logger.error(f"Failed to export project: {e}")
            return False

    def import_project(self, import_path: Path | str, project_name: str = None) -> bool:
        """Import a project from external file.

        Args:
            import_path: Path to project file to import
            project_name: Name for imported project (default: filename)

        Returns:
            True if successful, False otherwise
        """
        try:
            source = Path(import_path)

            if not source.exists():
                logger.warning(f"Import file not found: {source}")
                return False

            if project_name is None:
                project_name = source.stem

            dest = self.projects_dir / f"{project_name}.jpe"
            dest.write_bytes(source.read_bytes())

            logger.info(f"Project imported: {project_name}")
            return True

        except Exception as e:
            logger.error(f"Failed to import project: {e}")
            return False
