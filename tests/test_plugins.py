from __future__ import annotations

import os
from pathlib import Path

from jpe_sims4.plugins import plugins
from jpe_sims4.validation import validate_segment
from jpe_sims4.workflow import extract_project


def test_plugin_extractor_is_used(tmp_path: Path, monkeypatch) -> None:
    plugdir = tmp_path / "plugs"
    plugdir.mkdir()
    (plugdir / "txt_plugin.py").write_text(
        "\n".join(
            [
                "from jpe_sims4.extractors import ExtractResult",
                "from jpe_sims4.segments import Segment",
                "",
                "def register(registry):",
                "    def extract_text(file_path: str, content: bytes):",
                "        text = content.decode('utf-8','replace').strip()",
                "        segs = [Segment.create(file_path=file_path, location='line:1', source=text)] if text else []",
                "        return ExtractResult(segments=segs, diagnostics=[])",
                "    registry.register_extractor('text', extract_text)",
                "",
            ]
        ),
        encoding="utf-8",
    )

    monkeypatch.setenv("JPE_PLUGINS_PATH", str(plugdir))
    plugins().reset()

    src = tmp_path / "mod"
    src.mkdir()
    (src / "readme.txt").write_text("Hello", encoding="utf-8")

    res = extract_project(src)
    assert any(s.get("source") == "Hello" for s in res.project.segments)


def test_plugin_validator_is_used(monkeypatch, tmp_path: Path) -> None:
    plugdir = tmp_path / "plugs"
    plugdir.mkdir()
    (plugdir / "validator_plugin.py").write_text(
        "\n".join(
            [
                "from jpe_sims4.diagnostics import Diagnostic",
                "",
                "def register(registry):",
                "    def v(segment):",
                "        tgt = str(segment.get('target') or '')",
                "        if 'bad' in tgt:",
                "            return [Diagnostic(severity='ERROR', category='PLUGIN', code='E_BAD_WORD', message='Contains bad word.')]",
                "        return []",
                "    registry.register_validator(v)",
                "",
            ]
        ),
        encoding="utf-8",
    )

    monkeypatch.setenv("JPE_PLUGINS_PATH", str(plugdir))
    plugins().reset()

    diags = validate_segment(segment={"id": "1", "file_path": "a.txt", "location": "x", "source": "s", "target": "bad"})
    assert any(d.code == "E_BAD_WORD" for d in diags)
    # Normalized diagnostics inherit missing context from the segment.
    bad = next(d for d in diags if d.code == "E_BAD_WORD")
    assert bad.file_path == "a.txt"
    assert bad.location == "x"
    assert bad.segment_id == "1"
