from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from jpe_sims4.validate import extract_placeholders


_BBCODE_TAG = re.compile(r"\[(/?)([a-zA-Z]{1,20})(?:=[^\]\n]{0,200})?\]")
_EMOJI = re.compile(r":[a-z0-9_+\-]{2,40}:")


@dataclass(frozen=True)
class SampleAnalysis:
    file_count: int
    extensions: dict[str, int]
    placeholders_top: list[tuple[str, int]]
    bbcode_tags_top: list[tuple[str, int]]
    emoji_tokens_top: list[tuple[str, int]]
    recommended_token_regexes: list[str]

    def to_dict(self) -> dict[str, object]:
        return {
            "file_count": self.file_count,
            "extensions": self.extensions,
            "placeholders_top": self.placeholders_top,
            "bbcode_tags_top": self.bbcode_tags_top,
            "emoji_tokens_top": self.emoji_tokens_top,
            "recommended_token_regexes": self.recommended_token_regexes,
        }


def _read_text(p: Path) -> str:
    try:
        return p.read_text(encoding="utf-8")
    except Exception:
        return p.read_text(encoding="utf-8", errors="replace")


def analyze_samples_folder(root: Path) -> SampleAnalysis:
    root = root.expanduser().resolve()
    files = [p for p in root.rglob("*") if p.is_file()]
    exts = Counter(p.suffix.lower() for p in files)

    placeholder = Counter()
    bbcode = Counter()
    emoji = Counter()

    for p in files:
        if p.suffix.lower() not in {".json", ".csv", ".txt"}:
            continue
        text = _read_text(p)
        for ph in extract_placeholders(text):
            placeholder[ph] += 1
        for m in _BBCODE_TAG.finditer(text):
            closing = m.group(1) == "/"
            tag = m.group(2).lower()
            bbcode[f"{'/' if closing else ''}{tag}"] += 1
        for m in _EMOJI.finditer(text):
            emoji[m.group(0)] += 1

    return SampleAnalysis(
        file_count=len(files),
        extensions=dict(exts),
        placeholders_top=placeholder.most_common(50),
        bbcode_tags_top=bbcode.most_common(50),
        emoji_tokens_top=emoji.most_common(50),
        recommended_token_regexes=[
            r"\[/?[a-zA-Z]{1,20}(?:=[^\]\n]{0,200})?\]",
            r":[a-z0-9_+\-]{2,40}:",
        ],
    )

