from __future__ import annotations

import csv
from pathlib import Path

from jpe_sims4.csv_io import export_segments_csv, import_segments_csv
from jpe_sims4.project import Project


def test_csv_export_import_roundtrip(tmp_path: Path) -> None:
    project = Project.create(source_path=tmp_path)
    project.segments = [
        {
            "id": "s1",
            "file_path": "a.xml",
            "location": "/Root/text()",
            "source": "Hello",
            "target": "",
            "status": "new",
            "note": "",
        }
    ]

    out_csv = tmp_path / "segments.csv"
    export_segments_csv(project, out_csv)
    assert out_csv.exists()

    rows = []
    with out_csv.open("r", encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        for row in r:
            row["target"] = "Bonjour"
            row["status"] = "reviewed"
            row["note"] = "done"
            rows.append(row)

    with out_csv.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader()
        w.writerows(rows)

    res = import_segments_csv(project, out_csv, overwrite_target=False)
    assert res.updated_segments == 1
    assert project.segments[0]["target"] == "Bonjour"
    assert project.segments[0]["status"] == "reviewed"
    assert project.segments[0]["note"] == "done"

