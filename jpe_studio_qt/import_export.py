"""Import/Export utilities for projects, builds, and configurations.

Handles exporting data to various formats and importing from external sources.
Supports JSON, CSV, and ZIP archives.
"""

from __future__ import annotations

import csv
import json
import logging
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)


class ImportExportManager:
    """Manages data import/export operations.

    Features:
    - Export projects to JSON, CSV, or ZIP
    - Import projects from various formats
    - Build history export (CSV for analysis)
    - Diagnostic reports export
    - Configuration backup/restore

    Usage:
        ie = ImportExportManager()

        # Export project
        ie.export_project_json(project, "/path/to/export.json")

        # Export build history
        ie.export_build_history_csv(builds, "/path/to/builds.csv")

        # Export as ZIP archive
        ie.export_project_archive(project, "/path/to/project.zip")
    """

    def __init__(self) -> None:
        """Initialize import/export manager."""
        logger.info("Import/Export manager initialized")

    def export_project_json(self, project: Any, export_path: Path | str) -> bool:
        """Export project to JSON format.

        Args:
            project: Project object to export
            export_path: Path to export file

        Returns:
            True if successful
        """
        try:
            export_path = Path(export_path)

            # Serialize project
            project_data = self._serialize_project(project)

            # Add export metadata
            project_data["_export"] = {
                "exported_at": datetime.now().isoformat(),
                "format": "json",
                "version": "1.0",
            }

            # Write to file
            with open(export_path, "w") as f:
                json.dump(project_data, f, indent=2, default=str)

            logger.info(f"Project exported to JSON: {export_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to export project as JSON: {e}")
            return False

    def export_build_history_csv(
        self, builds: list[dict], export_path: Path | str
    ) -> bool:
        """Export build history to CSV format.

        Args:
            builds: List of build records
            export_path: Path to export file

        Returns:
            True if successful
        """
        try:
            export_path = Path(export_path)

            if not builds:
                logger.warning("No builds to export")
                return False

            # Determine CSV headers from first build
            fieldnames = list(builds[0].keys()) if builds else []

            with open(export_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(builds)

            logger.info(f"Build history exported to CSV: {export_path} ({len(builds)} records)")
            return True

        except Exception as e:
            logger.error(f"Failed to export builds as CSV: {e}")
            return False

    def export_diagnostics_csv(
        self, diagnostics: list[dict], export_path: Path | str
    ) -> bool:
        """Export diagnostics to CSV format.

        Args:
            diagnostics: List of diagnostic records
            export_path: Path to export file

        Returns:
            True if successful
        """
        try:
            export_path = Path(export_path)

            if not diagnostics:
                logger.warning("No diagnostics to export")
                return False

            fieldnames = ["timestamp", "severity", "code", "message", "file", "line"]

            with open(export_path, "w", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()

                for diag in diagnostics:
                    row = {
                        "timestamp": diag.get("timestamp", ""),
                        "severity": diag.get("severity", ""),
                        "code": diag.get("code", ""),
                        "message": diag.get("message", ""),
                        "file": diag.get("file", ""),
                        "line": diag.get("location", ""),
                    }
                    writer.writerow(row)

            logger.info(
                f"Diagnostics exported to CSV: {export_path} ({len(diagnostics)} records)"
            )
            return True

        except Exception as e:
            logger.error(f"Failed to export diagnostics as CSV: {e}")
            return False

    def export_project_archive(
        self, project: Any, export_path: Path | str, include_builds: bool = True
    ) -> bool:
        """Export project and related data as ZIP archive.

        Args:
            project: Project object to export
            export_path: Path to export ZIP file
            include_builds: Include build history

        Returns:
            True if successful
        """
        try:
            export_path = Path(export_path)

            with zipfile.ZipFile(export_path, "w", zipfile.ZIP_DEFLATED) as zf:
                # Add project data
                project_data = self._serialize_project(project)
                project_json = json.dumps(project_data, indent=2, default=str)
                zf.writestr("project.json", project_json)

                # Add build history if requested
                if include_builds and hasattr(project, "build_history"):
                    builds_json = json.dumps(
                        project.build_history, indent=2, default=str
                    )
                    zf.writestr("build_history.json", builds_json)

                # Add manifest
                manifest = {
                    "created_at": datetime.now().isoformat(),
                    "project_name": getattr(project, "name", "Unknown"),
                    "format": "zip",
                    "version": "1.0",
                }
                manifest_json = json.dumps(manifest, indent=2)
                zf.writestr("manifest.json", manifest_json)

            logger.info(f"Project archive created: {export_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to create project archive: {e}")
            return False

    def import_project_json(self, import_path: Path | str) -> Optional[dict[str, Any]]:
        """Import project from JSON file.

        Args:
            import_path: Path to JSON file

        Returns:
            Project data dict or None if failed
        """
        try:
            import_path = Path(import_path)

            if not import_path.exists():
                logger.warning(f"Import file not found: {import_path}")
                return None

            with open(import_path, "r") as f:
                project_data = json.load(f)

            logger.info(f"Project imported from JSON: {import_path}")
            return project_data

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to import project: {e}")
            return None

    def import_project_archive(self, archive_path: Path | str) -> Optional[dict[str, Any]]:
        """Import project from ZIP archive.

        Args:
            archive_path: Path to ZIP file

        Returns:
            Project data dict or None if failed
        """
        try:
            archive_path = Path(archive_path)

            if not archive_path.exists():
                logger.warning(f"Archive not found: {archive_path}")
                return None

            with zipfile.ZipFile(archive_path, "r") as zf:
                # Read project.json
                if "project.json" not in zf.namelist():
                    logger.warning("No project.json found in archive")
                    return None

                with zf.open("project.json") as f:
                    project_data = json.load(f)

                # Try to read build history
                if "build_history.json" in zf.namelist():
                    with zf.open("build_history.json") as f:
                        project_data["build_history"] = json.load(f)

            logger.info(f"Project imported from archive: {archive_path}")
            return project_data

        except zipfile.BadZipFile as e:
            logger.error(f"Invalid ZIP file: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to import project archive: {e}")
            return None

    def export_build_report(
        self, builds: list[dict], export_path: Path | str, format: str = "html"
    ) -> bool:
        """Export build report in HTML format with statistics.

        Args:
            builds: List of build records
            export_path: Path to export file
            format: Export format ("html" or "txt")

        Returns:
            True if successful
        """
        try:
            export_path = Path(export_path)

            if format == "html":
                return self._export_build_report_html(builds, export_path)
            elif format == "txt":
                return self._export_build_report_txt(builds, export_path)
            else:
                logger.warning(f"Unknown report format: {format}")
                return False

        except Exception as e:
            logger.error(f"Failed to export build report: {e}")
            return False

    def _export_build_report_html(self, builds: list[dict], export_path: Path) -> bool:
        """Export build report as HTML."""
        # Calculate statistics
        total = len(builds)
        successful = sum(1 for b in builds if b.get("status") == "success")
        failed = total - successful
        success_rate = (successful / total * 100) if total > 0 else 0

        # Generate HTML
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Build Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1 {{ color: #333; }}
                table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
                th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                th {{ background-color: #f2f2f2; }}
                .success {{ color: green; }}
                .failed {{ color: red; }}
                .stats {{ background-color: #f9f9f9; padding: 10px; border-radius: 5px; }}
            </style>
        </head>
        <body>
            <h1>Build Report</h1>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>

            <div class="stats">
                <p><strong>Total Builds:</strong> {total}</p>
                <p><strong>Successful:</strong> {successful}</p>
                <p><strong>Failed:</strong> {failed}</p>
                <p><strong>Success Rate:</strong> {success_rate:.1f}%</p>
            </div>

            <table>
                <tr>
                    <th>Build ID</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Timestamp</th>
                </tr>
        """

        for build in builds:
            status = build.get("status", "unknown")
            status_class = "success" if status == "success" else "failed"
            html += f"""
                <tr>
                    <td>{build.get('id', '-')}</td>
                    <td class="{status_class}">{status}</td>
                    <td>{build.get('duration', '-')}</td>
                    <td>{build.get('timestamp', '-')}</td>
                </tr>
            """

        html += """
            </table>
        </body>
        </html>
        """

        with open(export_path, "w") as f:
            f.write(html)

        logger.info(f"Build report exported as HTML: {export_path}")
        return True

    def _export_build_report_txt(self, builds: list[dict], export_path: Path) -> bool:
        """Export build report as plain text."""
        lines = [
            "BUILD REPORT",
            "=" * 50,
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            f"Total Builds: {len(builds)}",
            f"Successful: {sum(1 for b in builds if b.get('status') == 'success')}",
            f"Failed: {sum(1 for b in builds if b.get('status') != 'success')}",
            "",
            "Build Details:",
            "-" * 50,
        ]

        for build in builds:
            lines.append(
                f"ID: {build.get('id', 'N/A')} | Status: {build.get('status', 'N/A')} | "
                f"Duration: {build.get('duration', 'N/A')} | Time: {build.get('timestamp', 'N/A')}"
            )

        with open(export_path, "w") as f:
            f.write("\n".join(lines))

        logger.info(f"Build report exported as text: {export_path}")
        return True

    def _serialize_project(self, project: Any) -> dict[str, Any]:
        """Serialize project to dictionary."""
        data = {}
        if hasattr(project, "__dict__"):
            for key, value in project.__dict__.items():
                if not key.startswith("_") and not callable(value):
                    if isinstance(value, (str, int, float, bool, type(None))):
                        data[key] = value
                    elif isinstance(value, (list, dict)):
                        data[key] = value
                    else:
                        data[key] = str(value)
        return data
