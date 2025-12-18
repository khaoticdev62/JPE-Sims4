"""
Visual demo of Phase 1-2 UI/UX components.
Run this to see all new components rendered in a window.
"""
import sys
from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QScrollArea, QLabel, QFrame
)
from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.theme import qss
from jpe_studio_qt.ui.components import (
    BadgeLabel, FAB, SearchBar, EmptyStateWidget,
    SegmentedControl, ProgressCard, CardFrame, ToggleSwitch,
    H1, H2, Muted, MaterialIcon, ChipButton
)


class ComponentDemo(QMainWindow):
    """Demo window showcasing all Phase 1-2 components."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("JPE Studio Qt - Phase 1-2 Component Demo")
        self.setMinimumSize(900, 800)

        # Main scroll area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.NoFrame)

        # Content widget
        content = QWidget()
        layout = QVBoxLayout(content)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setSpacing(32)

        # Title
        title = H1("Phase 1-2 Component Library")
        layout.addWidget(title)

        subtitle = Muted("New and updated components for the UI/UX overhaul")
        layout.addWidget(subtitle)

        # Section: Typography
        layout.addWidget(self._create_section("Typography", [
            H1("Heading 1 - 24pt Bold"),
            H2("Heading 2 - 16pt Bold"),
            QLabel("Heading 3 - 14pt Bold (via role)"),
            Muted("Muted text - Secondary color"),
            QLabel("Body text - 11pt Regular"),
        ]))

        # Section: Badges
        badge_row = QHBoxLayout()
        badge_row.setSpacing(10)
        for variant in ["primary", "success", "warning", "error", "info"]:
            badge = BadgeLabel(variant.upper(), variant=variant)
            badge_row.addWidget(badge)
        badge_row.addStretch()
        layout.addWidget(self._create_section("Badges", [badge_row]))

        # Section: Search Bar
        search = SearchBar(placeholder="Search for projects, files, or settings...")
        layout.addWidget(self._create_section("Search Bar", [search]))

        # Section: Segmented Control
        segmented = SegmentedControl(labels=["All Projects", "Recent", "Favorites", "Archived"])
        layout.addWidget(self._create_section("Segmented Control", [segmented]))

        # Section: Toggle Switch
        toggle_row = QHBoxLayout()
        toggle_row.setSpacing(20)
        for i in range(3):
            toggle = ToggleSwitch(checked=(i % 2 == 0))
            lbl = QLabel(f"Option {i+1}")
            toggle_container = QHBoxLayout()
            toggle_container.addWidget(lbl)
            toggle_container.addWidget(toggle)
            toggle_container.addStretch()
            toggle_row.addLayout(toggle_container)
        layout.addWidget(self._create_section("Toggle Switches", [toggle_row]))

        # Section: Progress Cards
        cards_row = QHBoxLayout()
        cards_row.setSpacing(16)

        card1 = ProgressCard(
            title="Sims 4 UI Mod",
            path="C:/Mods/UI_Enhancements",
            progress=85,
            status="Translating",
            status_variant="primary"
        )
        cards_row.addWidget(card1)

        card2 = ProgressCard(
            title="Furniture Pack",
            path="C:/Mods/FurniturePack_v2",
            progress=100,
            status="Ready",
            status_variant="success"
        )
        cards_row.addWidget(card2)

        card3 = ProgressCard(
            title="Gameplay Tweaks",
            path="C:/Mods/GameplayTweaks",
            progress=45,
            status="Warning",
            status_variant="warning"
        )
        cards_row.addWidget(card3)

        layout.addWidget(self._create_section("Progress Cards", [cards_row]))

        # Section: Empty State
        empty = EmptyStateWidget(
            icon_name="folder_open",
            title="No Projects Found",
            description="You haven't created any projects yet. Click the button below to create your first project.",
            action_text="Create New Project"
        )
        layout.addWidget(self._create_section("Empty State", [empty]))

        # Section: Chips
        chips_row = QHBoxLayout()
        chips_row.setSpacing(8)
        chip_labels = ["All", "Recent", "Favorites", "Shared", "Archived"]
        for i, label in enumerate(chip_labels):
            chip = ChipButton(label, active=(i == 0))
            chips_row.addWidget(chip)
        chips_row.addStretch()
        layout.addWidget(self._create_section("Chip Buttons", [chips_row]))

        # Section: FAB
        fab_container = QWidget()
        fab_container.setFixedHeight(80)
        fab_layout = QHBoxLayout(fab_container)
        fab_layout.setContentsMargins(0, 0, 0, 0)

        fab = FAB(icon_name="add")
        fab.setToolTip("Create New Project")

        fab_desc = QVBoxLayout()
        fab_title = QLabel("Floating Action Button (FAB)")
        fab_title.setProperty("role", "h3")
        fab_subtitle = Muted("56x56px primary button with shadow - typically positioned bottom-right")
        fab_desc.addWidget(fab_title)
        fab_desc.addWidget(fab_subtitle)

        fab_layout.addLayout(fab_desc, 1)
        fab_layout.addWidget(fab)

        layout.addWidget(fab_container)

        # Section: Design Tokens
        tokens_info = QVBoxLayout()
        tokens_info.setSpacing(8)

        token_data = [
            ("Primary Color", DESIGN.colors.primary),
            ("Primary Hover", DESIGN.colors.primary_hover),
            ("Success Color", DESIGN.colors.success),
            ("Warning Color", DESIGN.colors.warning),
            ("Error Color", DESIGN.colors.error),
            ("Info Color", DESIGN.colors.info),
            ("Spacing XXS", f"{DESIGN.spacing.xxs}px"),
            ("Spacing XS", f"{DESIGN.spacing.xs}px"),
            ("Shadow FAB", DESIGN.colors.shadow_fab),
            ("Animation Base", DESIGN.animation.transition_base),
        ]

        for name, value in token_data:
            token_row = QHBoxLayout()
            name_lbl = QLabel(f"{name}:")
            name_lbl.setProperty("role", "caption")
            name_lbl.setFixedWidth(150)
            value_lbl = Muted(str(value))
            token_row.addWidget(name_lbl)
            token_row.addWidget(value_lbl, 1)
            tokens_info.addLayout(token_row)

        layout.addWidget(self._create_section("Design System Tokens", [tokens_info]))

        layout.addStretch()

        scroll.setWidget(content)
        self.setCentralWidget(scroll)

    def _create_section(self, title: str, widgets) -> QFrame:
        """Create a section with title and widgets."""
        section = CardFrame(shadow=False)
        section_layout = QVBoxLayout(section)
        section_layout.setContentsMargins(20, 20, 20, 20)
        section_layout.setSpacing(16)

        # Section title
        title_label = QLabel(title)
        title_label.setProperty("role", "h2")
        section_layout.addWidget(title_label)

        # Add widgets
        for widget in widgets:
            if isinstance(widget, QHBoxLayout) or isinstance(widget, QVBoxLayout):
                section_layout.addLayout(widget)
            else:
                section_layout.addWidget(widget)

        return section


def main():
    """Run the component demo."""
    app = QApplication(sys.argv)

    # Apply stylesheet
    app.setStyleSheet(qss())

    # Show demo window
    demo = ComponentDemo()
    demo.show()

    print("=" * 60)
    print("Component Demo Window Opened")
    print("=" * 60)
    print("\nShowing all Phase 1-2 components:")
    print("  ✓ Typography (H1, H2, H3, Caption, Body)")
    print("  ✓ Badges (5 variants)")
    print("  ✓ Search Bar")
    print("  ✓ Segmented Control")
    print("  ✓ Toggle Switches")
    print("  ✓ Progress Cards")
    print("  ✓ Empty State Widget")
    print("  ✓ Chip Buttons")
    print("  ✓ Floating Action Button (FAB)")
    print("  ✓ Design System Tokens")
    print("\nClose the window to exit.")
    print("=" * 60)

    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
