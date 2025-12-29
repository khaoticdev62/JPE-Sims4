from __future__ import annotations

from jpe_sims4.diagnostics import Diagnostic


def parse_failed(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="PLUGIN_TS4REBEL", code="E_TS4REBEL_PARSE", message=message, file_path=file_path)


def unsupported_version(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(
        severity="ERROR",
        category="PLUGIN_TS4REBEL",
        code="E_TS4REBEL_UNSUPPORTED_VERSION",
        message=message,
        file_path=file_path,
    )


def apply_failed(
    *,
    message: str,
    file_path: str | None = None,
    location: str | None = None,
    segment_id: str | None = None,
) -> Diagnostic:
    return Diagnostic(
        severity="ERROR",
        category="PLUGIN_TS4REBEL",
        code="E_TS4REBEL_APPLY_FAILED",
        message=message,
        file_path=file_path,
        location=location,
        segment_id=segment_id,
    )


def token_mismatch(
    *,
    message: str,
    file_path: str | None = None,
    location: str | None = None,
    segment_id: str | None = None,
) -> Diagnostic:
    return Diagnostic(
        severity="ERROR",
        category="PLUGIN_TS4REBEL",
        code="E_TS4REBEL_TOKEN_MISMATCH",
        message=message,
        file_path=file_path,
        location=location,
        segment_id=segment_id,
    )


def placeholder_hint(
    *,
    message: str,
    file_path: str | None = None,
    location: str | None = None,
    segment_id: str | None = None,
) -> Diagnostic:
    return Diagnostic(
        severity="INFO",
        category="PLUGIN_TS4REBEL",
        code="I_TS4REBEL_PLACEHOLDER_HINT",
        message=message,
        file_path=file_path,
        location=location,
        segment_id=segment_id,
    )

