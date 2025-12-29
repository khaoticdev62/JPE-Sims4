"""Settings dialog with theme, preferences, and advanced options.

Provides a comprehensive settings UI integrated with SettingsManager and ThemeManager.
Handles user preferences for UI, editor, build, and project settings.

Phase 22: UI Dialogs for Settings and Theme Control
"""

from __future__ import annotations

import logging
from pathlib import Path

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QTabWidget, QWidget, QLabel,
    QComboBox, QCheckBox, QPushButton, QSpinBox, QLineEdit, QGroupBox,
    QFormLayout, QScrollArea, QMessageBox
)
from PySide6.QtCore import Qt, Signal, Slot

logger = logging.getLogger(__name__)


class SettingsDialog(QDialog):
    """Settings dialog with tabs for different preference categories.

    Integrates with SettingsManager and ThemeManager for persistent preferences.

    Features:
    - UI settings (theme, font size, animations)
    - Editor settings (auto-save, word wrap, font)
    - Build settings (auto-refresh, history size)
    - Project settings (default location, auto-load recent)
    """

    settings_changed = Signal(str, object)  # key, value

    def __init__(self, settings_manager=None, theme_manager=None, parent=None):
        """Initialize settings dialog.

        Args:
            settings_manager: SettingsManager instance for persistence
            theme_manager: ThemeManager instance for theme control
            parent: Parent widget
        """
        super().__init__(parent)
        self.setWindowTitle("Settings")
        self.setMinimumWidth(600)
        self.setMinimumHeight(500)
        self.setModal(True)

        self.settings_manager = settings_manager
        self.theme_manager = theme_manager

        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Tabs for different setting categories
        tabs = QTabWidget()
        layout.addWidget(tabs)

        # Tab 1: UI Settings
        ui_tab = self._create_ui_tab()
        tabs.addTab(ui_tab, "UI")

        # Tab 2: Editor Settings
        editor_tab = self._create_editor_tab()
        tabs.addTab(editor_tab, "Editor")

        # Tab 3: Build Settings
        build_tab = self._create_build_tab()
        tabs.addTab(build_tab, "Build")

        # Tab 4: Project Settings
        project_tab = self._create_project_tab()
        tabs.addTab(project_tab, "Project")

        # Bottom action buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch(1)

        reset_btn = QPushButton("Reset to Defaults")
        reset_btn.clicked.connect(self._reset_to_defaults)
        button_layout.addWidget(reset_btn)

        cancel_btn = QPushButton("Cancel")
        cancel_btn.clicked.connect(self.reject)
        button_layout.addWidget(cancel_btn)

        apply_btn = QPushButton("Apply")
        apply_btn.clicked.connect(self._apply_settings)
        button_layout.addWidget(apply_btn)

        ok_btn = QPushButton("OK")
        ok_btn.clicked.connect(self._ok_settings)
        button_layout.addWidget(ok_btn)

        layout.addLayout(button_layout)

    def _create_ui_tab(self) -> QWidget:
        """Create UI settings tab."""
        widget = QWidget()
        form = QFormLayout(widget)
        form.setSpacing(12)

        # Theme selector
        theme_label = QLabel("Theme:")
        theme_combo = QComboBox()
        theme_combo.addItems(["Dark", "Light"])
        if self.settings_manager:
            current_theme = self.settings_manager.get("ui.theme", "dark")
            theme_combo.setCurrentIndex(0 if current_theme == "dark" else 1)
        theme_combo.currentTextChanged.connect(
            lambda text: self._on_setting_changed("ui.theme", text.lower())
        )
        self.theme_combo = theme_combo
        form.addRow(theme_label, theme_combo)

        # Font size
        font_label = QLabel("Font Size (pt):")
        font_spin = QSpinBox()
        font_spin.setMinimum(8)
        font_spin.setMaximum(24)
        font_spin.setValue(self.settings_manager.get("ui.font_size", 12) if self.settings_manager else 12)
        font_spin.valueChanged.connect(
            lambda value: self._on_setting_changed("ui.font_size", value)
        )
        self.font_spin = font_spin
        form.addRow(font_label, font_spin)

        # Animation enabled
        anim_label = QLabel("Enable Animations:")
        anim_check = QCheckBox()
        anim_check.setChecked(self.settings_manager.get("ui.animation_enabled", True) if self.settings_manager else True)
        anim_check.stateChanged.connect(
            lambda: self._on_setting_changed("ui.animation_enabled", anim_check.isChecked())
        )
        self.anim_check = anim_check
        form.addRow(anim_label, anim_check)

        # Animation speed
        speed_label = QLabel("Animation Speed:")
        speed_combo = QComboBox()
        speed_combo.addItems(["Slow", "Normal", "Fast"])
        anim_speed = self.settings_manager.get("ui.animation_speed", 1.0) if self.settings_manager else 1.0
        if anim_speed < 1.0:
            speed_combo.setCurrentIndex(0)
        elif anim_speed > 1.0:
            speed_combo.setCurrentIndex(2)
        else:
            speed_combo.setCurrentIndex(1)
        speed_combo.currentIndexChanged.connect(
            lambda idx: self._on_setting_changed("ui.animation_speed", [0.7, 1.0, 1.3][idx])
        )
        self.speed_combo = speed_combo
        form.addRow(speed_label, speed_combo)

        # Show breadcrumbs
        breadcrumb_label = QLabel("Show Breadcrumbs:")
        breadcrumb_check = QCheckBox()
        breadcrumb_check.setChecked(self.settings_manager.get("ui.show_breadcrumbs", True) if self.settings_manager else True)
        breadcrumb_check.stateChanged.connect(
            lambda: self._on_setting_changed("ui.show_breadcrumbs", breadcrumb_check.isChecked())
        )
        self.breadcrumb_check = breadcrumb_check
        form.addRow(breadcrumb_label, breadcrumb_check)

        form.addStretch()
        return widget

    def _create_editor_tab(self) -> QWidget:
        """Create editor settings tab."""
        widget = QWidget()
        form = QFormLayout(widget)
        form.setSpacing(12)

        # Auto-save enabled
        autosave_label = QLabel("Auto-Save Enabled:")
        autosave_check = QCheckBox()
        autosave_check.setChecked(self.settings_manager.get("editor.auto_save_enabled", True) if self.settings_manager else True)
        autosave_check.stateChanged.connect(
            lambda: self._on_setting_changed("editor.auto_save_enabled", autosave_check.isChecked())
        )
        self.autosave_check = autosave_check
        form.addRow(autosave_label, autosave_check)

        # Auto-save interval
        interval_label = QLabel("Auto-Save Interval (seconds):")
        interval_spin = QSpinBox()
        interval_spin.setMinimum(10)
        interval_spin.setMaximum(300)
        interval_spin.setValue(self.settings_manager.get("editor.auto_save_interval", 60) if self.settings_manager else 60)
        interval_spin.valueChanged.connect(
            lambda value: self._on_setting_changed("editor.auto_save_interval", value)
        )
        self.interval_spin = interval_spin
        form.addRow(interval_label, interval_spin)

        # Word wrap
        wordwrap_label = QLabel("Word Wrap:")
        wordwrap_check = QCheckBox()
        wordwrap_check.setChecked(self.settings_manager.get("editor.word_wrap", True) if self.settings_manager else True)
        wordwrap_check.stateChanged.connect(
            lambda: self._on_setting_changed("editor.word_wrap", wordwrap_check.isChecked())
        )
        self.wordwrap_check = wordwrap_check
        form.addRow(wordwrap_label, wordwrap_check)

        # Font family
        font_label = QLabel("Font Family:")
        font_edit = QLineEdit()
        font_edit.setText(self.settings_manager.get("editor.font", "monospace") if self.settings_manager else "monospace")
        font_edit.textChanged.connect(
            lambda text: self._on_setting_changed("editor.font", text)
        )
        self.font_edit = font_edit
        form.addRow(font_label, font_edit)

        form.addStretch()
        return widget

    def _create_build_tab(self) -> QWidget:
        """Create build settings tab."""
        widget = QWidget()
        form = QFormLayout(widget)
        form.setSpacing(12)

        # Auto-refresh builds
        refresh_label = QLabel("Auto-Refresh Builds:")
        refresh_check = QCheckBox()
        refresh_check.setChecked(self.settings_manager.get("build.auto_refresh_builds", True) if self.settings_manager else True)
        refresh_check.stateChanged.connect(
            lambda: self._on_setting_changed("build.auto_refresh_builds", refresh_check.isChecked())
        )
        self.refresh_check = refresh_check
        form.addRow(refresh_label, refresh_check)

        # Refresh interval
        interval_label = QLabel("Refresh Interval (seconds):")
        interval_spin = QSpinBox()
        interval_spin.setMinimum(1)
        interval_spin.setMaximum(60)
        interval_spin.setValue(self.settings_manager.get("build.refresh_interval", 5) if self.settings_manager else 5)
        interval_spin.valueChanged.connect(
            lambda value: self._on_setting_changed("build.refresh_interval", value)
        )
        self.build_interval_spin = interval_spin
        form.addRow(interval_label, interval_spin)

        # Max build history
        max_label = QLabel("Max Build History:")
        max_spin = QSpinBox()
        max_spin.setMinimum(10)
        max_spin.setMaximum(500)
        max_spin.setValue(self.settings_manager.get("build.max_history", 50) if self.settings_manager else 50)
        max_spin.valueChanged.connect(
            lambda value: self._on_setting_changed("build.max_history", value)
        )
        self.max_history_spin = max_spin
        form.addRow(max_label, max_spin)

        form.addStretch()
        return widget

    def _create_project_tab(self) -> QWidget:
        """Create project settings tab."""
        widget = QWidget()
        form = QFormLayout(widget)
        form.setSpacing(12)

        # Default project location
        location_label = QLabel("Default Project Location:")
        location_edit = QLineEdit()
        default_loc = self.settings_manager.get("project.default_location", str(Path.home() / "JPEProjects")) if self.settings_manager else str(Path.home() / "JPEProjects")
        location_edit.setText(default_loc)
        location_edit.textChanged.connect(
            lambda text: self._on_setting_changed("project.default_location", text)
        )
        self.location_edit = location_edit
        form.addRow(location_label, location_edit)

        # Auto-load recent
        autoload_label = QLabel("Auto-Load Recent Projects:")
        autoload_check = QCheckBox()
        autoload_check.setChecked(self.settings_manager.get("project.auto_load_recent", True) if self.settings_manager else True)
        autoload_check.stateChanged.connect(
            lambda: self._on_setting_changed("project.auto_load_recent", autoload_check.isChecked())
        )
        self.autoload_check = autoload_check
        form.addRow(autoload_label, autoload_check)

        form.addStretch()
        return widget

    @Slot(str, object)
    def _on_setting_changed(self, key: str, value: object) -> None:
        """Handle setting change.

        Args:
            key: Setting key
            value: New value
        """
        if self.settings_manager:
            try:
                self.settings_manager.set(key, value)
                self.settings_changed.emit(key, value)
                logger.debug(f"Setting changed: {key} = {value}")
            except Exception as e:
                logger.warning(f"Failed to set {key}: {e}")

    @Slot()
    def _apply_settings(self) -> None:
        """Apply settings without closing dialog."""
        # Apply theme if changed
        if self.theme_manager and self.settings_manager:
            theme = self.settings_manager.get("ui.theme", "dark")
            self.theme_manager.set_theme(theme)
        logger.info("Settings applied")
        QMessageBox.information(self, "Settings", "Settings have been applied.")

    @Slot()
    def _ok_settings(self) -> None:
        """Apply settings and close dialog."""
        self._apply_settings()
        self.accept()

    @Slot()
    def _reset_to_defaults(self) -> None:
        """Reset all settings to default values."""
        if not self.settings_manager:
            return

        reply = QMessageBox.question(
            self,
            "Reset Settings",
            "Reset all settings to default values?",
            QMessageBox.Yes | QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            self.settings_manager.reset_to_defaults()
            logger.info("Settings reset to defaults")
            QMessageBox.information(self, "Settings", "Settings have been reset to defaults.\nPlease restart the application.")
            self.reject()
