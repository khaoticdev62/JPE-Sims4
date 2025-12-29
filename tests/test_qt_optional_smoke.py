from __future__ import annotations

import pytest


def test_qt_optional_diagnostics_pane_constructs() -> None:
    try:
        from PySide6.QtWidgets import QApplication
    except Exception:
        pytest.skip("PySide6 not installed")

    from jpe_studio_qt.ui.diagnostics_pane import GlobalDiagnosticsPane

    app = QApplication.instance() or QApplication([])
    dlg = GlobalDiagnosticsPane(None)
    dlg.close()
    # Avoid leaving dialogs around in CI.
    app.processEvents()

