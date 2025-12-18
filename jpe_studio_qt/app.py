from __future__ import annotations

import argparse
import sys
from pathlib import Path

from jpe_sims4.project import Project
from jpe_sims4.storage import load_project
from jpe_sims4.workflow import scan_project


def _require_pyside6() -> None:
    try:
        import PySide6  # noqa: F401
    except Exception as e:  # pragma: no cover
        raise SystemExit(
            "PySide6 is not installed.\n\n"
            "Install the Qt UI extras:\n"
            "  pip install -e .[studio_qt]\n\n"
            f"Original error: {e}"
        )


def main(argv: list[str] | None = None) -> int:
    _require_pyside6()
    from PySide6.QtWidgets import QApplication

    from jpe_studio_qt.ui.main_window import MainWindow
    from jpe_studio_qt.fonts import load_bundled_fonts
    from jpe_studio_qt.theme import qss

    parser = argparse.ArgumentParser(prog="jpe-studio-qt")
    parser.add_argument("--open", dest="open_path", help="Open a folder/zip/project json on startup.")
    parser.add_argument(
        "--smoke",
        action="store_true",
        help="Create the window, process events briefly, then exit (for sanity checks).",
    )
    args = parser.parse_args(argv)

    app = QApplication(sys.argv)
    app.setApplicationName("JPE Studio")
    load_bundled_fonts()
    app.setStyleSheet(qss())

    win = MainWindow()
    win.resize(1220, 820)
    win.show()

    if args.open_path:
        p = Path(args.open_path)
        if p.suffix.lower() == ".json":
            try:
                win.set_project(load_project(p), project_json_path=p)
            except Exception:
                pass
        else:
            try:
                res = scan_project(p, merge_from_project_json=None)
                proj = getattr(res, "project", None)
                if isinstance(proj, Project):
                    win.set_project(proj, project_json_path=None)
            except Exception:
                pass

    if args.smoke:  # pragma: no cover
        # Process a few event cycles and exit.
        for _ in range(3):
            app.processEvents()
        win.close()
        app.quit()
        return 0

    return int(app.exec())


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
