from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path
from typing import Iterable

from .errors import BuildReport, EngineError


class ReportWriter:
    """Responsible for writing build reports to disk.

    The writer does not interpret the errors; it only serializes data structures.
    """

    def __init__(self, base_directory: Path) -> None:
        self._base_directory = base_directory

    def write_build_report(self, report: BuildReport) -> Path:
        self._base_directory.mkdir(parents=True, exist_ok=True)
        file_path = self._base_directory / f"build_{report.build_id}.json"
        payload = asdict(report)
        file_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return file_path


def collect_errors(errors: Iterable[EngineError]) -> dict:
    """Return a summary structure from a sequence of errors.

    This can be used by UIs to quickly assess project health without parsing
    the entire build report.
    """

    summary: dict[str, int] = {
        "info": 0,
        "warning": 0,
        "error": 0,
        "fatal": 0,
    }
    for error in errors:
        key = error.severity.value
        if key in summary:
            summary[key] += 1
    return summary
