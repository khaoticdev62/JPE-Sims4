from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from zipfile import ZipFile

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.io.zip_safety import ZipSafetyLimits, check_zip_member_info


@dataclass(frozen=True)
class IndexStats:
    indexed: int
    hashed: int
    reused: int


def _sha256_bytes(data: bytes) -> str:
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fp:
        for chunk in iter(lambda: fp.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def index_files(
    *,
    source_path: Path,
    files: list[dict[str, str]],
    previous_index: dict[str, dict[str, object]] | None = None,
) -> tuple[dict[str, dict[str, object]], list[Diagnostic], IndexStats]:
    """
    Build a deterministic, cache-friendly file index keyed by project-relative POSIX paths.

    - Folder sources: stores sha256 + size + mtime.
    - Zip sources: stores crc32 + size (fast) and sha256 for text-like files.
    """
    src = source_path.expanduser().resolve()
    prev = dict(previous_index or {})
    out: dict[str, dict[str, object]] = {}
    diags: list[Diagnostic] = []
    hashed = 0
    reused = 0

    # Heuristic: hash only text-like kinds by default (avoid hashing large binaries).
    hash_kinds = {"xml", "jpe-xml", "jpe", "json", "ini", "cfg", "log", "text"}

    if src.is_file() and src.suffix.lower() == ".zip":
        limits = ZipSafetyLimits.from_env()
        with ZipFile(src) as zf:
            info_by_name = {i.filename: i for i in zf.infolist() if not i.is_dir()}
            for f in files:
                rel = str(f.get("path") or "")
                kind = str(f.get("kind") or "unknown")
                info = info_by_name.get(rel)
                if not info:
                    diags.append(
                        Diagnostic(
                            severity="WARNING",
                            category="INDEX",
                            code="W_MISSING_ZIP_MEMBER",
                            message="Scanned file not found in zip during indexing.",
                            file_path=rel,
                        )
                    )
                    continue

                key = {"kind": kind, "zip_crc32": int(info.CRC), "size": int(info.file_size)}
                member_diags = check_zip_member_info(info=info, limits=limits, category="INDEX")
                diags.extend(member_diags)
                prev_entry = prev.get(rel) or {}
                if member_diags and any(d.severity in {"ERROR", "FATAL"} for d in member_diags):
                    out[rel] = key
                    continue
                if (
                    prev_entry.get("zip_crc32") == key["zip_crc32"]
                    and prev_entry.get("size") == key["size"]
                    and isinstance(prev_entry.get("sha256"), str)
                ):
                    key["sha256"] = prev_entry.get("sha256")
                    reused += 1
                elif kind in hash_kinds:
                    try:
                        data = zf.read(rel)
                        key["sha256"] = _sha256_bytes(data)
                        hashed += 1
                    except Exception as e:
                        diags.append(
                            Diagnostic(
                                severity="ERROR",
                                category="INDEX",
                                code="E_ZIP_READ_FAILED",
                                message=str(e),
                                file_path=rel,
                            )
                        )
                out[rel] = key

        stats = IndexStats(indexed=len(out), hashed=hashed, reused=reused)
        return out, diags, stats

    if src.is_dir():
        root = src
        for f in files:
            rel = str(f.get("path") or "")
            kind = str(f.get("kind") or "unknown")
            abs_path = root / Path(rel)
            try:
                st = abs_path.stat()
            except Exception as e:
                diags.append(
                    Diagnostic(
                        severity="ERROR",
                        category="INDEX",
                        code="E_STAT_FAILED",
                        message=str(e),
                        file_path=rel,
                    )
                )
                continue

            size = int(st.st_size)
            mtime = int(getattr(st, "st_mtime_ns", int(st.st_mtime * 1_000_000_000)))
            prev_entry = prev.get(rel) or {}
            entry: dict[str, object] = {"kind": kind, "size": size, "mtime_ns": mtime}
            if prev_entry.get("size") == size and prev_entry.get("mtime_ns") == mtime and isinstance(prev_entry.get("sha256"), str):
                entry["sha256"] = prev_entry.get("sha256")
                reused += 1
            elif kind in hash_kinds:
                try:
                    entry["sha256"] = _sha256_file(abs_path)
                    hashed += 1
                except Exception as e:
                    diags.append(
                        Diagnostic(
                            severity="ERROR",
                            category="INDEX",
                            code="E_HASH_FAILED",
                            message=str(e),
                            file_path=rel,
                        )
                    )
            out[rel] = entry

        stats = IndexStats(indexed=len(out), hashed=hashed, reused=reused)
        return out, diags, stats

    return {}, [Diagnostic(severity="ERROR", category="INDEX", code="E_UNSUPPORTED_SOURCE", message="Unsupported source.")], IndexStats(indexed=0, hashed=0, reused=0)


def changed_paths(
    previous_index: dict[str, dict[str, object]] | None,
    current_index: dict[str, dict[str, object]] | None,
) -> set[str]:
    prev = previous_index or {}
    cur = current_index or {}
    changed: set[str] = set()
    for p in set(prev.keys()) | set(cur.keys()):
        if p not in prev or p not in cur:
            changed.add(p)
            continue
        a = prev[p]
        b = cur[p]
        # Prefer strong hashes when available.
        if str(a.get("sha256") or "") and str(b.get("sha256") or ""):
            if a.get("sha256") != b.get("sha256"):
                changed.add(p)
            continue
        if a.get("zip_crc32") != b.get("zip_crc32"):
            changed.add(p)
            continue
        if a.get("size") != b.get("size") or a.get("mtime_ns") != b.get("mtime_ns"):
            changed.add(p)
    return changed
