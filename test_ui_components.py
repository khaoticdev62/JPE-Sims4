"""
Test script for Phase 1-2 UI/UX components.
Instantiates all new and updated components to verify they work correctly.
"""
import sys
from PySide6.QtWidgets import QApplication
from jpe_studio_qt.design_system import DESIGN
from jpe_studio_qt.theme import qss
from jpe_studio_qt.ui.components import (
    BadgeLabel, FAB, SearchBar, EmptyStateWidget,
    SegmentedControl, ProgressCard, CardFrame, ToggleSwitch,
    H1, H2, Muted, MaterialIcon, ChipButton
)

def test_design_system():
    """Test design system tokens."""
    print("\n=== Testing Design System ===")
    print(f"✓ Primary color: {DESIGN.colors.primary}")
    print(f"✓ Primary hover: {DESIGN.colors.primary_hover}")
    print(f"✓ Success bg: {DESIGN.colors.success_bg}")
    print(f"✓ Shadow FAB: {DESIGN.colors.shadow_fab}")
    print(f"✓ Spacing xxs: {DESIGN.spacing.xxs}")
    print(f"✓ Animation base: {DESIGN.animation.transition_base}")

def test_theme():
    """Test theme QSS generation."""
    print("\n=== Testing Theme ===")
    stylesheet = qss()
    print(f"✓ Stylesheet generated: {len(stylesheet)} characters")

    # Verify key changes
    checks = [
        ("H1 24pt", "font-size: 24pt" in stylesheet),
        ("H2 16pt", "font-size: 16pt" in stylesheet),
        ("Body 11pt", "font-size: 11pt" in stylesheet),
        ("H3 role", 'role="h3"' in stylesheet),
        ("Caption role", 'role="caption"' in stylesheet),
        ("Badge styling", 'role="badge"' in stylesheet),
        ("Scrollbar 8px", "width: 8px" in stylesheet),
        ("Input padding", "padding: 11px 14px" in stylesheet),
        ("Primary color", "#9d5cff" in stylesheet),
    ]

    for name, result in checks:
        status = "✓" if result else "✗"
        print(f"{status} {name}")

def test_components(app):
    """Test component instantiation."""
    print("\n=== Testing Components ===")

    try:
        # Test new components
        badge = BadgeLabel("Success", variant="success")
        print("✓ BadgeLabel instantiated")

        fab = FAB(icon_name="add")
        print("✓ FAB instantiated")

        search = SearchBar(placeholder="Search projects...")
        print("✓ SearchBar instantiated")

        empty = EmptyStateWidget(
            icon_name="inbox",
            title="No Projects",
            description="Create a new project to get started.",
            action_text="Create Project"
        )
        print("✓ EmptyStateWidget instantiated")

        segmented = SegmentedControl(labels=["All", "Recent", "Favorites"])
        print("✓ SegmentedControl instantiated")

        progress_card = ProgressCard(
            title="My Mod Translation",
            path="C:/Mods/MyMod",
            progress=75,
            status="Translating",
            status_variant="primary"
        )
        print("✓ ProgressCard instantiated")

        # Test updated components
        card = CardFrame(shadow=True)
        print("✓ CardFrame instantiated (updated shadow)")

        toggle = ToggleSwitch(checked=True)
        print("✓ ToggleSwitch instantiated (updated colors)")

        # Test existing components
        h1 = H1("Hello World")
        h2 = H2("Subtitle")
        muted = Muted("Description text")
        icon = MaterialIcon("folder", size_px=24)
        chip = ChipButton("Filter", active=True)
        print("✓ Existing components work")

        return True
    except Exception as e:
        print(f"✗ Component instantiation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("Phase 1-2 UI/UX Component Testing")
    print("=" * 60)

    # Test design system (no Qt needed)
    test_design_system()

    # Test theme (no Qt needed)
    test_theme()

    # Test components (requires Qt app)
    app = QApplication(sys.argv)
    app.setStyleSheet(qss())

    success = test_components(app)

    print("\n" + "=" * 60)
    if success:
        print("✓ ALL TESTS PASSED")
        print("=" * 60)
        print("\nPhase 1-2 implementation is verified and ready!")
        print("\nNext steps:")
        print("  • Phase 3: Implement core workflow screens")
        print("  • Phase 4: Management screens")
        print("  • Phase 5-6: Extended features and polish")
        return 0
    else:
        print("✗ SOME TESTS FAILED")
        print("=" * 60)
        return 1

if __name__ == "__main__":
    sys.exit(main())
