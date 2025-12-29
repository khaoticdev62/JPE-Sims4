from __future__ import annotations

import os
from dataclasses import dataclass
from zipfile import ZipFile, ZipInfo

from jpe_sims4.diagnostics import Diagnostic


def _env_int(name: str, default: int) -> int:
    raw = str(os.getenv(name, "")).strip()
    if not raw:
        return default
    try:
        v = int(raw)
        return v if v > 0 else default
    except Exception:
        return default


def _env_float(name: str, default: float) -> float:
    raw = str(os.getenv(name, "")).strip()
    if not raw:
        return default
    try:
        v = float(raw)
        return v if v > 0 else default
    except Exception:
        return default


@dataclass(frozen=True)
class ZipSafetyLimits:
    max_files: int
    max_total_uncompressed_bytes: int
    max_entry_uncompressed_bytes: int
    max_inflate_ratio: float

    @classmethod
    def from_env(cls) -> "ZipSafetyLimits":
        """
        Env overrides:
        - JPE_MAX_ZIP_FILES
        - JPE_MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES
        - JPE_MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES
        - JPE_MAX_ZIP_INFLATE_RATIO
        """
        return cls(
            max_files=_env_int("JPE_MAX_ZIP_FILES", 25_000),
            max_total_uncompressed_bytes=_env_int("JPE_MAX_ZIP_TOTAL_UNCOMPRESSED_BYTES", 1_500_000_000),
            max_entry_uncompressed_bytes=_env_int("JPE_MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES", 75_000_000),
            max_inflate_ratio=_env_float("JPE_MAX_ZIP_INFLATE_RATIO", 200.0),
        )


def is_unsafe_zip_member(member: str) -> bool:
    p = member.replace("\\", "/").strip()
    if not p:
        return True
    if p.startswith("/"):
        return True
    if ":" in p.split("/", 1)[0]:
        return True
    parts = [x for x in p.split("/") if x not in ("", ".")]
    return any(part == ".." for part in parts)


def check_zip_member_info(
    *,
    info: ZipInfo,
    limits: ZipSafetyLimits,
    category: str = "ZIP",
) -> list[Diagnostic]:
    diags: list[Diagnostic] = []

    member = info.filename
    if is_unsafe_zip_member(member):
        diags.append(
            Diagnostic(
                severity="ERROR",
                category=category,
                code="E_ZIP_PATH_TRAVERSAL",
                message="Zip contains an unsafe member path. Remediation: re-zip without absolute paths, drive letters, or '..' segments.",
                file_path=member,
            )
        )

    if int(info.file_size) > int(limits.max_entry_uncompressed_bytes):
        diags.append(
            Diagnostic(
                severity="ERROR",
                category=category,
                code="E_ZIP_ENTRY_TOO_LARGE",
                message=(
                    f"Zip member exceeds size limit ({info.file_size} bytes > {limits.max_entry_uncompressed_bytes}). "
                    "Remediation: remove large binaries from the archive, or increase JPE_MAX_ZIP_ENTRY_UNCOMPRESSED_BYTES."
                ),
                file_path=member,
            )
        )

    comp = int(getattr(info, "compress_size", 0) or 0)
    if comp > 0:
        ratio = float(info.file_size) / float(comp)
        if ratio > float(limits.max_inflate_ratio):
            diags.append(
                Diagnostic(
                    severity="ERROR",
                    category=category,
                    code="E_ZIP_SUSPICIOUS_COMPRESSION",
                    message=(
                        f"Zip member has suspicious compression ratio ({ratio:.1f}x > {limits.max_inflate_ratio:.1f}x). "
                        "Remediation: verify the archive is trusted, or increase JPE_MAX_ZIP_INFLATE_RATIO."
                    ),
                    file_path=member,
                )
            )
    return diags


def safe_read_zip_member(
    *,
    zf: ZipFile,
    member: str,
    limits: ZipSafetyLimits | None = None,
    category: str = "IO",
) -> tuple[bytes | None, list[Diagnostic]]:
    limits = limits or ZipSafetyLimits.from_env()
    try:
        info = zf.getinfo(member)
    except Exception as e:
        return None, [
            Diagnostic(
                severity="ERROR",
                category=category,
                code="E_ZIP_MISSING_MEMBER",
                message=str(e),
                file_path=member,
            )
        ]

    diags = check_zip_member_info(info=info, limits=limits, category=category)
    if any(d.severity in {"ERROR", "FATAL"} for d in diags):
        return None, diags

    try:
        with zf.open(member) as fp:
            return fp.read(), diags
    except Exception as e:
        diags.append(
            Diagnostic(
                severity="ERROR",
                category=category,
                code="E_ZIP_READ_FAILED",
                message=str(e),
                file_path=member,
            )
        )
        return None, diags

