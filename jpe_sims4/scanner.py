from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from zipfile import ZipFile

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.io.zip_safety import ZipSafetyLimits, check_zip_member_info

_SNIFF_MAX_BYTES = 8192
_SNIFF_MAX_FILE_SIZE = 1_000_000  # 1MB (only used for unknown kinds)


@dataclass(frozen=True)
class ScanResult:
    files: list[dict[str, str]]
    diagnostics: list[dict[str, object]]


def _is_probably_text(data: bytes) -> bool:
    if not data:
        return True
    if b"\x00" in data:
        return False
    sample = data[:_SNIFF_MAX_BYTES]
    printable = 0
    for b in sample:
        if b in (9, 10, 13) or 32 <= b <= 126 or b >= 128:
            printable += 1
    return (printable / max(1, len(sample))) >= 0.85


def _sniff_text_file(path: Path) -> bool:
    try:
        st = path.stat()
        if int(st.st_size) > _SNIFF_MAX_FILE_SIZE:
            return False
        with path.open("rb") as fp:
            head = fp.read(_SNIFF_MAX_BYTES)
        return _is_probably_text(head)
    except Exception:
        return False


def _sniff_text_zip_member(zf: ZipFile, member: str) -> bool:
    try:
        info = zf.getinfo(member)
    except Exception:
        return False
    if int(getattr(info, "file_size", 0) or 0) > _SNIFF_MAX_FILE_SIZE:
        return False
    try:
        with zf.open(member) as fp:
            head = fp.read(_SNIFF_MAX_BYTES)
        return _is_probably_text(head)
    except Exception:
        return False

def _classify(path: str) -> str:
    lower = path.lower().replace("\\", "/")
    name = lower.rsplit("/", 1)[-1]

    if (".ts4rebels." in name or name.startswith("ts4rebels_") or name.startswith("ts4rebels-")) and (
        name.endswith(".json") or name.endswith(".csv")
    ):
        if "manifest" in name:
            return "ts4rebels-manifest"
        return "ts4rebels-meta"
    if lower.endswith(".xml"):
        return "xml"
    if lower.endswith(".stbl"):
        return "stbl"
    if lower.endswith(".package"):
        return "package"
    if lower.endswith(".ts4script"):
        return "ts4script"
    if lower.endswith(".jpe"):
        return "jpe"
    if lower.endswith(".jpe.xml") or lower.endswith(".jpe-xml"):
        return "jpe-xml"
    if lower.endswith(".json"):
        return "json"
    if lower.endswith(".ini"):
        return "ini"
    if lower.endswith(".cfg"):
        return "cfg"
    if lower.endswith(".log"):
        return "log"
    if lower.endswith(".txt") or lower.endswith(".md") or lower.endswith(".rst"):
        return "text"
    if lower.endswith(".csv") or lower.endswith(".tsv"):
        return "text"
    if lower.endswith(".yaml") or lower.endswith(".yml") or lower.endswith(".toml"):
        return "text"
    if lower.endswith(".properties"):
        return "text"
    if lower.endswith(".png") or lower.endswith(".jpg") or lower.endswith(".jpeg") or lower.endswith(".webp"):
        return "image"
    return "unknown"


def _scan_zip(zip_path: Path) -> tuple[list[dict[str, str]], list[Diagnostic]]:
    files: list[dict[str, str]] = []
    diags: list[Diagnostic] = []
    limits = ZipSafetyLimits.from_env()
    total_uncompressed = 0
    file_count = 0
    with ZipFile(zip_path) as zf:
        for info in sorted(zf.infolist(), key=lambda x: x.filename):
            if info.is_dir():
                continue
            file_count += 1
            if file_count > limits.max_files:
                diags.append(
                    Diagnostic(
                        severity="ERROR",
                        category="ZIP",
                        code="E_ZIP_TOO_MANY_FILES",
                        message=(
                            f"Zip exceeds file count limit ({file_count} > {limits.max_files}). "
                            "Remediation: remove non-essential content or increase JPE_MAX_ZIP_FILES."
                        ),
                        file_path=str(zip_path),
                    )
                )
                break

            total_uncompressed += int(getattr(info, "file_size", 0) or 0)
            if total_uncompressed > limits.max_total_uncompressed_bytes:
                diags.append(
                    Diagnostic(
                        severity="ERROR",
                        category="ZIP",
                        code="E_ZIP_TOO_LARGE",
                        message=(
                            f"Zip exceeds total uncompressed size limit ({total_uncompressed} bytes > {limits.max_total_uncompressed_bytes}). "
                            "Remediation: remove large assets or increase JPE_MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES."
                        ),
                        file_path=str(zip_path),
                    )
                )
                break

            member = info.filename
            member_diags = check_zip_member_info(info=info, limits=limits, category="ZIP")
            diags.extend(member_diags)
            kind = _classify(member)
            if kind == "unknown" and not any(d.severity in {"ERROR", "FATAL"} for d in member_diags):
                if _sniff_text_zip_member(zf, member):
                    kind = "text"
            if kind == "unknown":
                diags.append(
                    Diagnostic(
                        severity="INFO",
                        code="I_UNKNOWN_FILE_TYPE",
                        message="Unknown file type found during scan.",
                        file_path=member,
                    )
                )
            files.append({"path": member, "kind": kind})
    files.sort(key=lambda x: x["path"])
    diags.sort(key=lambda d: (d.severity, d.code, d.file_path or ""))
    return files, diags


def _iter_files(root: Path) -> Iterable[Path]:
    ignored_dir_names = {
        ".git",
        ".hg",
        ".svn",
        ".venv",
        "venv",
        "__pycache__",
        ".pytest_cache",
        ".pytest-tmp",
        ".tmp",
    }
    for dirpath, dirnames, filenames in os.walk(root, topdown=True, onerror=lambda _e: None):
        try:
            rel_dir = Path(dirpath).relative_to(root)
        except Exception:
            continue
        parts = set(rel_dir.parts)
        if any(part in ignored_dir_names for part in parts) or any(part.startswith("pytest-cache-files-") for part in parts):
            dirnames[:] = []
            continue

        pruned: list[str] = []
        for d in dirnames:
            if d in ignored_dir_names or d.startswith("pytest-cache-files-"):
                continue
            pruned.append(d)
        dirnames[:] = sorted(pruned)

        for fn in sorted(filenames):
            yield Path(dirpath) / fn


def _scan_folder(folder: Path) -> tuple[list[dict[str, str]], list[Diagnostic]]:
    files: list[dict[str, str]] = []
    diags: list[Diagnostic] = []
    for p in _iter_files(folder):
        try:
            rel = p.relative_to(folder).as_posix()
        except Exception:
            continue
        kind = _classify(rel)
        if kind == "unknown" and _sniff_text_file(p):
            kind = "text"
        if kind == "unknown":
            diags.append(
                Diagnostic(
                    severity="INFO",
                    code="I_UNKNOWN_FILE_TYPE",
                    message="Unknown file type found during scan.",
                    file_path=rel,
                )
            )
        files.append({"path": rel, "kind": kind})
    files.sort(key=lambda x: x["path"])
    diags.sort(key=lambda d: (d.severity, d.code, d.file_path or ""))
    return files, diags


def scan_input(path: Path) -> ScanResult:
    path = path.expanduser().resolve()
    diagnostics: list[Diagnostic] = []
    if not path.exists():
        diagnostics.append(
            Diagnostic(severity="FATAL", code="F_PATH_NOT_FOUND", message="Input path does not exist.", file_path=str(path))
        )
        return ScanResult(files=[], diagnostics=[d.to_dict() for d in diagnostics])

    if path.is_file() and path.suffix.lower() == ".zip":
        files, diags = _scan_zip(path)
        return ScanResult(files=files, diagnostics=[d.to_dict() for d in diags])

    if path.is_dir():
        files, diags = _scan_folder(path)
        return ScanResult(files=files, diagnostics=[d.to_dict() for d in diags])

    diagnostics.append(
        Diagnostic(
            severity="FATAL",
            code="F_UNSUPPORTED_INPUT",
            message="Input must be a folder or a .zip archive.",
            file_path=str(path),
        )
    )
    return ScanResult(files=[], diagnostics=[d.to_dict() for d in diagnostics])
