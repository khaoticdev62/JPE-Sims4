from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QFrame,
    QGridLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QScrollArea,
    QTabWidget,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.ui.components import CardFrame, H1, H2, MaterialIcon, Muted, BadgeLabel, ChipButton, ToggleSwitch


class PluginDetailSettings2Page(QWidget):
    """
    Plugin detail and settings page aligned to `JPE assets folder/plugin_detail_&_settings_2`.
    
    This page displays detailed plugin information and configuration options.
    """

    def __init__(self) -> None:
        super().__init__()

        c = DESIGN.colors

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.setSpacing(0)

        # Header section
        header = QFrame()
        header.setObjectName("Card")
        header.setFixedHeight(120)
        hl = QHBoxLayout(header)
        hl.setContentsMargins(24, 16, 24, 16)
        hl.setSpacing(16)

        # Back button and plugin icon
        back_col = QVBoxLayout()
        back_col.setContentsMargins(0, 0, 0, 0)
        back_col.setSpacing(4)

        back_btn = QLabel("← Back to Marketplace")
        back_btn.setStyleSheet("font-size: 11pt; color: #9d5cff; cursor: pointer;")
        back_btn.setProperty("role", "clickable")
        back_col.addWidget(back_btn)

        plugin_row = QHBoxLayout()
        plugin_row.setContentsMargins(0, 0, 0, 0)
        plugin_row.setSpacing(12)

        icon_frame = QFrame()
        icon_frame.setFixedSize(48, 48)
        icon_frame.setStyleSheet(f"""
            border-radius: 14px;
            background: rgba(157, 92, 255, 0.15);
            border: 1px solid rgba(157, 92, 255, 0.25);
        """)
        icon_l = QHBoxLayout(icon_frame)
        icon_l.setContentsMargins(0, 0, 0, 0)
        icon_lbl = MaterialIcon("extension", size_px=24)
        icon_lbl.setStyleSheet("color: #9d5cff;")
        icon_l.addWidget(icon_lbl, 0, Qt.AlignCenter)
        plugin_row.addWidget(icon_frame)

        text_col = QVBoxLayout()
        text_col.setContentsMargins(0, 0, 0, 0)
        text_col.setSpacing(2)

        name_lbl = H1("Auto-Translator Pro")
        name_lbl.setStyleSheet("font-size: 16pt; font-weight: 700;")
        text_col.addWidget(name_lbl)

        author_lbl = Muted("by JPE Labs")
        text_col.addWidget(author_lbl)

        plugin_row.addLayout(text_col)
        back_col.addLayout(plugin_row)

        hl.addLayout(back_col)

        hl.addStretch(1)

        # Action buttons
        actions = QHBoxLayout()
        actions.setSpacing(10)

        # Status badge
        status_badge = BadgeLabel("INSTALLED", variant="success")
        actions.addWidget(status_badge)

        # Update button
        update_btn = ChipButton("Update")
        actions.addWidget(update_btn)

        # Uninstall button
        uninstall_btn = ChipButton("Uninstall")
        uninstall_btn.setStyleSheet("color: #ef4444; border-color: rgba(239,68,68,0.4);")
        actions.addWidget(uninstall_btn)

        hl.addLayout(actions)

        root.addWidget(header)

        # Content area with tabs
        content = QScrollArea()
        content.setWidgetResizable(True)
        content.setFrameShape(QFrame.NoFrame)
        content.setStyleSheet(f"background: {c.background};")

        content_widget = QWidget()
        content_l = QVBoxLayout(content_widget)
        content_l.setContentsMargins(24, 18, 24, 24)
        content_l.setSpacing(18)

        # Tabs
        tabs = QTabWidget()
        tabs.setStyleSheet("""
            QTabWidget::pane { border: none; }
            QTabBar::tab { 
                background: transparent; 
                padding: 10px 16px; 
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
            }
            QTabBar::tab:selected { 
                background: rgba(157, 92, 255, 0.15); 
                color: #9d5cff;
                border-bottom: 2px solid #9d5cff;
            }
            QTabBar::tab:!selected { 
                color: rgba(255,255,255,0.55); 
            }
        """)

        # Details tab
        details_widget = self._create_details_tab()
        tabs.addTab(details_widget, "Details")

        # Settings tab
        settings_widget = self._create_settings_tab()
        tabs.addTab(settings_widget, "Settings")

        # Permissions tab
        permissions_widget = self._create_permissions_tab()
        tabs.addTab(permissions_widget, "Permissions")

        # Changelog tab
        changelog_widget = self._create_changelog_tab()
        tabs.addTab(changelog_widget, "Changelog")

        content_l.addWidget(tabs)

        content.setWidget(content_widget)
        root.addWidget(content, 1)

    def _create_details_tab(self) -> QWidget:
        """Create the details tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(18)

        # Overview section
        overview_card = CardFrame(shadow=False)
        overview_l = QVBoxLayout(overview_card)
        overview_l.setContentsMargins(16, 16, 16, 16)
        overview_l.setSpacing(12)

        overview_title = H2("Overview")
        overview_title.setStyleSheet("font-weight: 600;")
        overview_l.addWidget(overview_title)

        description = Muted("Advanced AI-powered translation plugin that integrates with multiple translation APIs to provide high-quality automated translations for your projects. Features include context-aware translation, terminology consistency, and quality scoring.")
        description.setWordWrap(True)
        overview_l.addWidget(description)

        # Plugin info
        info_grid = QGridLayout()
        info_grid.setSpacing(10)

        plugin_info = [
            ("Version", "2.4.1"),
            ("Last Updated", "2023-12-10"),
            ("Downloads", "2.1M"),
            ("Compatibility", "JPE Studio 2.3+"),
            ("License", "Commercial"),
            ("Size", "45.2 MB")
        ]

        for i, (label, value) in enumerate(plugin_info):
            label_lbl = QLabel(label)
            label_lbl.setStyleSheet("font-weight: 600; color: rgba(255,255,255,0.7);")
            value_lbl = QLabel(value)
            value_lbl.setStyleSheet("font-family: 'JetBrains Mono';")

            info_grid.addWidget(label_lbl, i, 0)
            info_grid.addWidget(value_lbl, i, 1)

        overview_l.addLayout(info_grid)
        layout.addWidget(overview_card)

        # Features section
        features_card = CardFrame(shadow=False)
        features_l = QVBoxLayout(features_card)
        features_l.setContentsMargins(16, 16, 16, 16)
        features_l.setSpacing(12)

        features_title = H2("Features")
        features_title.setStyleSheet("font-weight: 600;")
        features_l.addWidget(features_title)

        features_list = [
            ("Context-aware translation", "Considers surrounding text for better accuracy"),
            ("Terminology consistency", "Maintains consistent terminology across projects"),
            ("Quality scoring", "Rates translation quality with confidence scores"),
            ("Multiple API support", "Works with OpenAI, Google, DeepL, and others"),
            ("Batch processing", "Translate multiple segments at once"),
            ("Learning capability", "Adapts to your translation preferences over time")
        ]

        for feature, desc in features_list:
            feature_row = self._create_feature_row(feature, desc)
            features_l.addWidget(feature_row)

        layout.addWidget(features_card)

        layout.addStretch(1)
        return widget

    def _create_settings_tab(self) -> QWidget:
        """Create the settings tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(18)

        # Configuration section
        config_card = CardFrame(shadow=False)
        config_l = QVBoxLayout(config_card)
        config_l.setContentsMargins(16, 16, 16, 16)
        config_l.setSpacing(12)

        config_title = H2("Configuration")
        config_title.setStyleSheet("font-weight: 600;")
        config_l.addWidget(config_title)

        # API key settings
        api_row = self._create_setting_row("API Key", "••••••••••••••••", "visibility_off")
        config_l.addWidget(api_row)

        # Default provider
        provider_row = self._create_setting_row("Translation Provider", "OpenAI GPT-4", "swap_horiz")
        config_l.addWidget(provider_row)

        # Quality threshold
        quality_row = self._create_setting_row("Quality Threshold", "85%", "tune")
        config_l.addWidget(quality_row)

        # Context sensitivity
        context_row = self._create_setting_row("Context Sensitivity", "Medium", "psychology")
        config_l.addWidget(context_row)

        config_l.addStretch(1)
        layout.addWidget(config_card)

        # Advanced settings
        advanced_card = CardFrame(shadow=False)
        advanced_l = QVBoxLayout(advanced_card)
        advanced_l.setContentsMargins(16, 16, 16, 16)
        advanced_l.setSpacing(12)

        advanced_title = H2("Advanced Settings")
        advanced_title.setStyleSheet("font-weight: 600;")
        advanced_l.addWidget(advanced_title)

        # Custom parameters
        params_label = QLabel("Custom API Parameters")
        params_label.setStyleSheet("font-weight: 500;")
        advanced_l.addWidget(params_label)

        params_text = QTextEdit()
        params_text.setPlainText('{\n  "temperature": 0.7,\n  "max_tokens": 1000,\n  "top_p": 1.0\n}')
        params_text.setMaximumHeight(100)
        params_text.setStyleSheet("""
            background: rgba(24,16,35,0.70);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 10px;
            padding: 10px;
            font-family: 'JetBrains Mono';
            font-size: 10pt;
        """)
        advanced_l.addWidget(params_text)

        layout.addWidget(advanced_card)

        return widget

    def _create_permissions_tab(self) -> QWidget:
        """Create the permissions tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(18)

        # Permissions section
        perms_card = CardFrame(shadow=False)
        perms_l = QVBoxLayout(perms_card)
        perms_l.setContentsMargins(16, 16, 16, 16)
        perms_l.setSpacing(12)

        perms_title = H2("Permissions")
        perms_title.setStyleSheet("font-weight: 600;")
        perms_l.addWidget(perms_title)

        permissions = [
            ("Network Access", "Access to translation APIs over the internet", True),
            ("File System Read", "Read project files to translate content", True),
            ("File System Write", "Write translated content back to files", True),
            ("Clipboard Access", "Copy/paste translated text", False),
            ("System Settings", "Access to application settings", False),
            ("External Storage", "Save translation memories", True)
        ]

        for perm, desc, granted in permissions:
            perm_row = self._create_permission_row(perm, desc, granted)
            perms_l.addWidget(perm_row)

        perms_l.addStretch(1)
        layout.addWidget(perms_card)

        return widget

    def _create_changelog_tab(self) -> QWidget:
        """Create the changelog tab."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(18)

        # Changelog section
        changelog_card = CardFrame(shadow=False)
        changelog_l = QVBoxLayout(changelog_card)
        changelog_l.setContentsMargins(16, 16, 16, 16)
        changelog_l.setSpacing(12)

        changelog_title = H2("Changelog")
        changelog_title.setStyleSheet("font-weight: 600;")
        changelog_l.addWidget(changelog_title)

        # Version 2.4.1
        v241_title = QLabel("Version 2.4.1 - 2023-12-10")
        v241_title.setStyleSheet("font-weight: 600; color: #9d5cff;")
        changelog_l.addWidget(v241_title)

        v241_changes = [
            "Fixed issue with API key validation",
            "Improved translation memory matching",
            "Added support for new language pairs",
            "Performance improvements for large files"
        ]

        for change in v241_changes:
            change_lbl = Muted(f"• {change}")
            changelog_l.addWidget(change_lbl)

        # Version 2.4.0
        changelog_l.addSpacing(10)
        v240_title = QLabel("Version 2.4.0 - 2023-11-20")
        v240_title.setStyleSheet("font-weight: 600; color: #9d5cff;")
        changelog_l.addWidget(v240_title)

        v240_changes = [
            "Added new AI translation models",
            "Improved context awareness algorithm",
            "Added batch translation feature",
            "Enhanced quality scoring system"
        ]

        for change in v240_changes:
            change_lbl = Muted(f"• {change}")
            changelog_l.addWidget(change_lbl)

        changelog_l.addStretch(1)
        layout.addWidget(changelog_card)

        return widget

    def _create_feature_row(self, feature: str, desc: str) -> QWidget:
        """Create a feature row."""
        row = QWidget()
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(0, 0, 0, 0)
        row_l.setSpacing(12)

        icon_lbl = MaterialIcon("check_circle", size_px=18)
        icon_lbl.setStyleSheet("color: #22c55e;")
        row_l.addWidget(icon_lbl)

        text_col = QVBoxLayout()
        text_col.setContentsMargins(0, 0, 0, 0)
        text_col.setSpacing(2)

        feature_lbl = QLabel(feature)
        feature_lbl.setStyleSheet("font-weight: 500;")
        text_col.addWidget(feature_lbl)

        desc_lbl = Muted(desc)
        desc_lbl.setStyleSheet("font-size: 10pt;")
        text_col.addWidget(desc_lbl)

        row_l.addLayout(text_col)

        return row

    def _create_setting_row(self, label: str, value: str, icon: str) -> QWidget:
        """Create a setting row."""
        row = QWidget()
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(0, 0, 0, 0)
        row_l.setSpacing(12)

        icon_lbl = MaterialIcon(icon, size_px=20)
        icon_lbl.setStyleSheet("color: #a78ecc;")
        row_l.addWidget(icon_lbl)

        label_lbl = QLabel(label)
        label_lbl.setStyleSheet("font-weight: 500; min-width: 150px;")
        row_l.addWidget(label_lbl, 1)

        value_lbl = QLabel(value)
        value_lbl.setStyleSheet("font-family: 'JetBrains Mono'; color: #a78ecc;")
        row_l.addWidget(value_lbl)

        edit_btn = QPushButton("Edit")
        edit_btn.setObjectName("Chip")
        edit_btn.setFixedHeight(28)
        row_l.addWidget(edit_btn)

        return row

    def _create_permission_row(self, perm: str, desc: str, granted: bool) -> QWidget:
        """Create a permission row."""
        row = QWidget()
        row_l = QHBoxLayout(row)
        row_l.setContentsMargins(0, 0, 0, 0)
        row_l.setSpacing(12)

        if granted:
            icon_lbl = MaterialIcon("check_circle", size_px=20)
            icon_lbl.setStyleSheet("color: #22c55e;")
        else:
            icon_lbl = MaterialIcon("cancel", size_px=20)
            icon_lbl.setStyleSheet("color: #ef4444;")
        row_l.addWidget(icon_lbl)

        text_col = QVBoxLayout()
        text_col.setContentsMargins(0, 0, 0, 0)
        text_col.setSpacing(2)

        perm_lbl = QLabel(perm)
        perm_lbl.setStyleSheet("font-weight: 500;")
        text_col.addWidget(perm_lbl)

        desc_lbl = Muted(desc)
        desc_lbl.setStyleSheet("font-size: 10pt;")
        text_col.addWidget(desc_lbl)

        row_l.addLayout(text_col)

        toggle = QPushButton("ON" if granted else "OFF")
        toggle.setObjectName("Chip")
        if granted:
            toggle.setStyleSheet("background: rgba(34, 197, 94, 0.2); border-color: rgba(34, 197, 94, 0.4); color: #22c55e;")
        else:
            toggle.setStyleSheet("background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #ef4444;")
        toggle.setFixedHeight(28)
        row_l.addWidget(toggle)

        return row