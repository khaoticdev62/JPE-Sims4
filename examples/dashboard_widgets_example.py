"""
Examples: Dashboard Widgets (Health Gauge and AI Insights).

This example demonstrates:
1. Health Gauge widget and panel
2. AI Insights card
3. Integrating metrics with dashboard
4. Real-time updates
"""

from pathlib import Path
import sys
from datetime import datetime, timedelta

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from PySide6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QHBoxLayout
from PySide6.QtCore import Qt

from jpe_studio_qt.ui.health_gauge import HealthPanel, HealthStatus, HealthMetrics
from jpe_studio_qt.ui.ai_insights_card import AIInsightsCard, AIInsight, AIMetrics


def example_1_health_gauge():
    """Example 1: Health Gauge Panel."""
    print("\n" + "="*60)
    print("Example 1: Health Gauge Panel")
    print("="*60)

    metrics = HealthMetrics(
        error_count=2,
        warning_count=5,
        suggestion_count=3,
        total_issues=10,
        health_percentage=85.0
    )

    print(f"✓ Health metrics:")
    print(f"  Errors: {metrics.error_count}")
    print(f"  Warnings: {metrics.warning_count}")
    print(f"  Suggestions: {metrics.suggestion_count}")
    print(f"  Health: {int(metrics.health_percentage)}%")


def example_2_health_status():
    """Example 2: Health Status Indicator."""
    print("\n" + "="*60)
    print("Example 2: Health Status Indicator (Mini)")
    print("="*60)

    metrics = HealthMetrics(
        error_count=0,
        warning_count=2,
        suggestion_count=1,
        total_issues=3,
        health_percentage=95.0
    )

    print(f"✓ Mini health indicator:")
    print(f"  Status: {'Excellent' if metrics.health_percentage >= 90 else 'Good'}")
    print(f"  Health: {int(metrics.health_percentage)}%")


def example_3_health_levels():
    """Example 3: Different Health Levels."""
    print("\n" + "="*60)
    print("Example 3: Health Level Categories")
    print("="*60)

    levels = [
        ("Excellent", 95, "Green"),
        ("Good", 75, "Light Green"),
        ("Fair", 55, "Yellow"),
        ("Poor", 35, "Orange"),
        ("Critical", 15, "Red"),
    ]

    print("✓ Health level colors:")
    for name, percentage, color in levels:
        print(f"  {name:12} ({percentage}%) - {color}")


def example_4_ai_insights():
    """Example 4: AI Insights Card."""
    print("\n" + "="*60)
    print("Example 4: AI Insights Card")
    print("="*60)

    # Create metrics
    metrics = AIMetrics(
        total_suggestions=12,
        fixes_applied=8,
        code_quality_improvement=15.0,
        ai_features_used=5,
        last_analysis_time=datetime.now().isoformat()
    )

    print(f"✓ AI metrics:")
    print(f"  Total suggestions: {metrics.total_suggestions}")
    print(f"  Fixes applied: {metrics.fixes_applied}")
    print(f"  Quality improvement: {metrics.code_quality_improvement}%")
    print(f"  Features used: {metrics.ai_features_used}")


def example_5_ai_insights_items():
    """Example 5: Individual AI Insights."""
    print("\n" + "="*60)
    print("Example 5: AI Insight Items")
    print("="*60)

    now = datetime.now()
    insights = [
        AIInsight(
            title="Code Quality Improved",
            description="Fixed 3 errors and 5 warnings using auto-fix. Code quality improved by 12%.",
            type="improvement",
            timestamp="2 minutes ago",
            actionable=True,
            action_label="View Details"
        ),
        AIInsight(
            title="Missing XML Tag Detected",
            description="Parser detected missing closing tag in mod definition. Suggested fix available.",
            type="warning",
            timestamp="5 minutes ago",
            actionable=True,
            action_label="Apply Fix"
        ),
        AIInsight(
            title="Code Completion Used",
            description="AI code completion suggested and applied 4 completions in the last hour.",
            type="suggestion",
            timestamp="1 hour ago",
            actionable=False
        ),
    ]

    print(f"✓ Recent insights ({len(insights)} items):")
    for insight in insights:
        print(f"\n  {insight.title}")
        print(f"    Type: {insight.type}")
        print(f"    {insight.description[:60]}...")
        print(f"    {insight.timestamp}")


def example_6_full_dashboard():
    """Example 6: Full Dashboard Integration."""
    print("\n" + "="*60)
    print("Example 6: Dashboard Integration")
    print("="*60)

    # Create health metrics
    health_metrics = HealthMetrics(
        error_count=1,
        warning_count=3,
        suggestion_count=2,
        total_issues=6,
        health_percentage=88.0
    )

    # Create AI metrics
    ai_metrics = AIMetrics(
        total_suggestions=15,
        fixes_applied=10,
        code_quality_improvement=18.0,
        ai_features_used=6,
        last_analysis_time=datetime.now().isoformat()
    )

    print(f"✓ Dashboard data prepared:")
    print(f"\n  Health Gauge:")
    print(f"    Health: {int(health_metrics.health_percentage)}%")
    print(f"    Status: {'Excellent' if health_metrics.health_percentage >= 90 else 'Good'}")
    print(f"    Errors: {health_metrics.error_count}, Warnings: {health_metrics.warning_count}")
    print(f"\n  AI Insights:")
    print(f"    Total suggestions: {ai_metrics.total_suggestions}")
    print(f"    Fixes applied: {ai_metrics.fixes_applied}")
    print(f"    Quality improvement: {ai_metrics.code_quality_improvement}%")


def example_7_metric_updates():
    """Example 7: Real-time Metric Updates."""
    print("\n" + "="*60)
    print("Example 7: Real-time Metric Updates")
    print("="*60)

    print("✓ Simulating metric changes over time:\n")

    # Initial state
    health = 75
    print(f"  Time 0:00 - Health: {health}% (Fair)")

    # After auto-fix
    health += 8
    print(f"  Time 0:05 - Health: {health}% (Good) - After 3 auto-fixes")

    # After more fixes
    health += 7
    print(f"  Time 0:10 - Health: {health}% (Good) - After 2 more fixes")

    # After code review
    health -= 2
    print(f"  Time 0:15 - Health: {health}% (Fair) - New issues detected")

    # After fixes again
    health += 12
    print(f"  Time 0:20 - Health: {health}% (Excellent) - Issues resolved")

    print(f"\n  Health progression: 75% → {health}% (↑{health - 75}%)")


def main():
    """Run all examples."""
    print("\n" + "="*60)
    print("Dashboard Widgets Examples")
    print("="*60)

    try:
        example_1_health_gauge()
        example_2_health_status()
        example_3_health_levels()
        example_4_ai_insights()
        example_5_ai_insights_items()
        example_6_full_dashboard()
        example_7_metric_updates()

        print("\n" + "="*60)
        print("All examples completed!")
        print("="*60)
        print("""
Key Takeaways:

1. HealthGauge provides circular visualization of code health (0-100%)
   - Color-coded: Green (90%+), Yellow (50%+), Red (<30%)
   - Shows error, warning, suggestion counts
   - Animates smoothly when values change

2. HealthPanel combines gauge + metrics in a card
   - Perfect for dashboard display
   - Shows resolved/unresolved issues
   - Click to view details

3. HealthStatus is a mini indicator
   - Compact version for tight spaces
   - Shows percentage and status label
   - Great for top bar or sidebar

4. AIInsightsCard shows AI-generated insights
   - Recent suggestions and fixes
   - Actionable recommendations
   - Metrics summary
   - Scrollable insight list

5. Real-time Integration
   - Update metrics when errors are fixed
   - Show improvements in real-time
   - Animate changes smoothly
   - Connect to diagnostics panel

Integration example:

    from jpe_studio_qt.ui.health_gauge import HealthPanel, HealthMetrics
    from jpe_studio_qt.ui.ai_insights_card import AIInsightsCard, AIInsight

    # Create widgets
    health_panel = HealthPanel()
    insights_card = AIInsightsCard()

    # In error handler
    metrics = HealthMetrics(errors=2, warnings=5, health=85)
    health_panel.set_metrics(metrics)

    # When fix applied
    metrics.health_percentage = 90
    health_panel.set_metrics(metrics)

    # Add insights
    insight = AIInsight(
        title="Error Fixed",
        description="Auto-fix applied successfully",
        type="improvement",
        timestamp="now"
    )
    insights_card.add_insight(insight)
""")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
