"""Export dialog for exporting projects, builds, and diagnostics.

Provides a comprehensive export UI with format selection and progress tracking.
Integrates with ImportExportManager for data export operations.

Phase 23: UI Dialogs for Import/Export Operations
"""

from __future__ import annotations

import logging
from pathlib import Path

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QComboBox, QPushButton,
    QCheckBox, QLineEdit, QFileDialog, QGroupBox, QFormLayout,
    QMessageBox, QProgressBar
)
from PySide6.QtCore import Qt, Signal, Slot, QTimer

logger = logging.getLogger(__name__)


class ExportDialog(QDialog):
    """Dialog for exporting project data to various formats.

    Supports exporting:
    - Projects to JSON, ZIP archives
    - Build history to CSV
    - Diagnostics to CSV
    - Build reports in HTML or TXT format

    Phase 23: Import/Export UI operations
    """

    export_complete = Signal(str)  # export_path

    def __init__(self, import_export_manager=None, project=None, parent=None):
        """Initialize export dialog.

        Args:
            import_export_manager: ImportExportManager instance
            project: Current project object for export
            parent: Parent widget
        """
        super().__init__(parent)
        self.setWindowTitle("Export Project")
        self.setMinimumWidth(500)
        self.setModal(True)

        self.import_export_manager = import_export_manager
        self.project = project

        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Title
        title = QLabel("Export Project Data")
        title.setStyleSheet("font-size: 14pt; font-weight: bold;")
        layout.addWidget(title)

        # Export type group
        type_group = QGroupBox("Export Type")
        type_layout = QFormLayout(type_group)

        type_label = QLabel("What to export:")
        type_combo = QComboBox()
        type_combo.addItems([
            "Project (JSON)",
            "Project (ZIP Archive)",
            "Build History (CSV)",
            "Diagnostics (CSV)",
            "Build Report (HTML)",
            "Build Report (TXT)",
        ])
        type_combo.currentIndexChanged.connect(self._on_export_type_changed)
        self.type_combo = type_combo
        type_layout.addRow(type_label, type_combo)

        # Options
        self.include_builds_check = QCheckBox("Include build history")
        self.include_builds_check.setChecked(True)
        self.include_builds_check.setVisible(False)  # Only shown for ZIP export
        type_layout.addRow("", self.include_builds_check)

        layout.addWidget(type_group)

        # Export location group
        location_group = QGroupBox("Export Location")
        location_layout = QFormLayout(location_group)

        filename_label = QLabel("File name:")
        filename_edit = QLineEdit()
        filename_edit.setText("project_export.json")
        filename_edit.setPlaceholderText("Enter file name")
        self.filename_edit = filename_edit
        location_layout.addRow(filename_label, filename_edit)

        browse_btn = QPushButton("Browse...")
        browse_btn.clicked.connect(self._browse_export_location)
        location_layout.addRow("", browse_btn)

        layout.addWidget(location_group)

        # Progress bar (hidden initially)
        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        layout.addWidget(self.progress_bar)

        # Bottom action buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch(1)

        cancel_btn = QPushButton("Cancel")
        cancel_btn.clicked.connect(self.reject)
        button_layout.addWidget(cancel_btn)

        export_btn = QPushButton("Export")
        export_btn.setStyleSheet("background-color: #8638FA; color: white; font-weight: bold; padding: 8px 16px;")
        export_btn.clicked.connect(self._perform_export)
        self.export_btn = export_btn
        button_layout.addWidget(export_btn)

        layout.addStretch(1)
        layout.addLayout(button_layout)

    @Slot(int)
    def _on_export_type_changed(self, index: int) -> None:
        """Update UI based on export type selection.

        Args:
            index: Selected export type index
        """
        export_types = [
            ("project_export.json", "JSON files (*.json)"),
            ("project_export.zip", "ZIP archives (*.zip)"),
            ("build_history.csv", "CSV files (*.csv)"),
            ("diagnostics.csv", "CSV files (*.csv)"),
            ("build_report.html", "HTML files (*.html)"),
            ("build_report.txt", "Text files (*.txt)"),
        ]

        filename, _ = export_types[index]
        self.filename_edit.setText(filename)

        # Show include builds option only for ZIP export
        self.include_builds_check.setVisible(index == 1)

    @Slot()
    def _browse_export_location(self) -> None:
        """Open file browser for export location selection."""
        current_filename = self.filename_edit.text()
        export_type_index = self.type_combo.currentIndex()

        file_filters = [
            "JSON files (*.json)",
            "ZIP archives (*.zip)",
            "CSV files (*.csv)",
            "CSV files (*.csv)",
            "HTML files (*.html)",
            "Text files (*.txt)",
        ]

        file_filter = file_filters[export_type_index]

        path, _ = QFileDialog.getSaveFileName(
            self,
            "Export As",
            current_filename,
            file_filter
        )

        if path:
            self.filename_edit.setText(path)

    @Slot()
    def _perform_export(self) -> None:
        """Perform the export operation."""
        if not self.import_export_manager:
            QMessageBox.warning(self, "Error", "Import/Export manager not initialized.")
            return

        if not self.project:
            QMessageBox.warning(self, "Error", "No project loaded for export.")
            return

        export_type = self.type_combo.currentIndex()
        export_path = self.filename_edit.text()

        if not export_path:
            QMessageBox.warning(self, "Error", "Please enter an export file path.")
            return

        # Show progress bar
        self.progress_bar.setVisible(True)
        self.progress_bar.setValue(0)
        self.export_btn.setEnabled(False)

        try:
            success = False

            if export_type == 0:  # Project JSON
                self.progress_bar.setValue(50)
                success = self.import_export_manager.export_project_json(self.project, export_path)
                self.progress_bar.setValue(100)

            elif export_type == 1:  # Project ZIP
                self.progress_bar.setValue(50)
                include_builds = self.include_builds_check.isChecked()
                success = self.import_export_manager.export_project_archive(
                    self.project, export_path, include_builds=include_builds
                )
                self.progress_bar.setValue(100)

            elif export_type == 2:  # Build History CSV
                self.progress_bar.setValue(50)
                builds = getattr(self.project, "build_history", [])
                if builds:
                    success = self.import_export_manager.export_build_history_csv(builds, export_path)
                else:
                    QMessageBox.warning(self, "No Data", "No build history available to export.")
                self.progress_bar.setValue(100)

            elif export_type == 3:  # Diagnostics CSV
                self.progress_bar.setValue(50)
                diagnostics = getattr(self.project, "diagnostics", [])
                if diagnostics:
                    success = self.import_export_manager.export_diagnostics_csv(diagnostics, export_path)
                else:
                    QMessageBox.warning(self, "No Data", "No diagnostics available to export.")
                self.progress_bar.setValue(100)

            elif export_type == 4:  # Build Report HTML
                self.progress_bar.setValue(50)
                builds = getattr(self.project, "build_history", [])
                if builds:
                    success = self.import_export_manager.export_build_report(builds, export_path, format="html")
                else:
                    QMessageBox.warning(self, "No Data", "No build history available for report.")
                self.progress_bar.setValue(100)

            elif export_type == 5:  # Build Report TXT
                self.progress_bar.setValue(50)
                builds = getattr(self.project, "build_history", [])
                if builds:
                    success = self.import_export_manager.export_build_report(builds, export_path, format="txt")
                else:
                    QMessageBox.warning(self, "No Data", "No build history available for report.")
                self.progress_bar.setValue(100)

            if success:
                logger.info(f"Export successful: {export_path}")
                self.export_complete.emit(export_path)
                QMessageBox.information(
                    self,
                    "Export Successful",
                    f"Project data exported successfully to:\n\n{export_path}"
                )
                self.accept()
            else:
                QMessageBox.critical(
                    self,
                    "Export Failed",
                    "Failed to export project data. Please check the file path and try again."
                )

        except Exception as e:
            logger.error(f"Export operation failed: {e}", exc_info=True)
            QMessageBox.critical(
                self,
                "Export Error",
                f"An error occurred during export:\n\n{e}"
            )

        finally:
            self.progress_bar.setVisible(False)
            self.export_btn.setEnabled(True)
