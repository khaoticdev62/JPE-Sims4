"""Pytest configuration for the JPE Sims 4 project."""

from __future__ import annotations

import pytest

# Import workspace-specific startup customizations so sandbox-safe temp
# overrides are applied before any tests rely on tempfile.
import sitecustomize  # noqa: F401

try:
    import tkinter as _tk

    _tk_root = _tk.Tk()
    _tk_root.withdraw()
    _tk_root.destroy()
    _TK_AVAILABLE = True
except Exception:
    _TK_AVAILABLE = False


def pytest_collection_modifyitems(config, items):
    """Skip UI-heavy tests when Tkinter is unavailable in the sandbox."""
    if _TK_AVAILABLE:
        return

    skip_ui = pytest.mark.skip(reason="Tkinter runtime is unavailable in this environment")
    for item in items:
        if item.module.__name__.endswith("test_ui_enhancements"):
            item.add_marker(skip_ui)
