from __future__ import annotations

import hashlib
import json
import shutil
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class HarvestedFile:
    source_path: str
    dest_path: str
    sha256: str
    size_bytes: int


@dataclass(frozen=True)
class HarvestResult:
    copied: list[HarvestedFile]
    skipped: int

    def to_dict(self) -> dict[str, object]:
        return {
            "copied": [c.__dict__ for c in self.copied],
            "skipped": self.skipped,
        }


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fp:
        for chunk in iter(lambda: fp.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def harvest_ts4rebels_samples(
    *,
    sources: list[Path],
    dest_dir: Path,
    max_files: int = 35,
    include_all_json_csv: bool = False,
) -> HarvestResult:
    """
    Copies TS4Rebels-related JSON/CSV files into dest_dir for local analysis.

    Default matching: filename contains "ts4rebels" and ends with .json/.csv.
    """
    dest_dir = dest_dir.expanduser().resolve()
    dest_dir.mkdir(parents=True, exist_ok=True)

    copied: list[HarvestedFile] = []
    skipped = 0
    seen_hashes: set[str] = set()

    def match(p: Path) -> bool:
        suf = p.suffix.lower()
        if suf not in {".json", ".csv"}:
            return False
        if include_all_json_csv:
            return True
        return "ts4rebels" in p.name.lower()

    for root in sources:
        root = root.expanduser()
        if not root.exists():
            continue
        for p in sorted([x for x in root.rglob("*") if x.is_file()]):
            if len(copied) >= int(max_files):
                break
            if not match(p):
                continue
            try:
                sha = _sha256_file(p)
            except Exception:
                skipped += 1
                continue
            if sha in seen_hashes:
                skipped += 1
                continue
            seen_hashes.add(sha)

            safe_name = "".join(ch for ch in p.name if ch.isalnum() or ch in ("-", "_", ".", " ")).strip() or "sample"
            out = dest_dir / f"{sha[:12]}_{safe_name}"
            try:
                shutil.copy2(p, out)
            except Exception:
                skipped += 1
                continue

            copied.append(
                HarvestedFile(
                    source_path=str(p),
                    dest_path=str(out),
                    sha256=sha,
                    size_bytes=int(out.stat().st_size),
                )
            )

    # Write a local manifest (dest_dir is ignored by git in this repo).
    try:
        (dest_dir / "harvest_manifest.json").write_text(
            json.dumps({"copied": [c.__dict__ for c in copied], "skipped": skipped}, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
    except Exception:
        pass

    return HarvestResult(copied=copied, skipped=skipped)

