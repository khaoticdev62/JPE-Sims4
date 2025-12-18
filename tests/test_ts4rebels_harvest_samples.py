from __future__ import annotations

from pathlib import Path

from jpe_sims4.ts4rebels.harvest import harvest_ts4rebels_samples
from jpe_sims4.ts4rebels.sample_analysis import analyze_samples_folder


def test_harvest_samples_copies_ts4rebels_named_json_csv(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir(parents=True, exist_ok=True)
    (src / "ts4rebels-manifest.json").write_text('{"schema_version":"1","title":"Hello"}', encoding="utf-8")
    (src / "ts4rebels-meta.csv").write_text("title,description\nHi,There\n", encoding="utf-8")
    (src / "other.json").write_text('{"x":1}', encoding="utf-8")

    dest = tmp_path / "dest"
    res = harvest_ts4rebels_samples(sources=[src], dest_dir=dest, max_files=35, include_all_json_csv=False)
    assert len(res.copied) == 2
    names = {Path(x.dest_path).name for x in res.copied}
    assert any("ts4rebels-manifest" in n for n in names)
    assert any("ts4rebels-meta" in n for n in names)

    analysis = analyze_samples_folder(dest)
    assert analysis.file_count >= 2


def test_harvest_samples_include_all_json_csv(tmp_path: Path) -> None:
    src = tmp_path / "src"
    src.mkdir(parents=True, exist_ok=True)
    (src / "a.json").write_text('{"a":"b"}', encoding="utf-8")
    (src / "b.csv").write_text("k,v\nx,y\n", encoding="utf-8")

    dest = tmp_path / "dest"
    res = harvest_ts4rebels_samples(sources=[src], dest_dir=dest, include_all_json_csv=True)
    assert len(res.copied) == 2

