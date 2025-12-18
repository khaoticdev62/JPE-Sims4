from __future__ import annotations

from jpe_sims4.diagnostics import Diagnostic


def auth_required(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_AUTH_REQUIRED", message=message, file_path=file_path)


def auth_failed(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_AUTH_FAILED", message=message, file_path=file_path)


def parse_failed(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_PARSE", message=message, file_path=file_path)


def unsupported_version(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(
        severity="ERROR",
        category="TS4REBEL",
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
        category="TS4REBEL",
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
        category="TS4REBEL",
        code="E_TS4REBEL_TOKEN_MISMATCH",
        message=message,
        file_path=file_path,
        location=location,
        segment_id=segment_id,
    )


def placeholder_hint(*, message: str, file_path: str | None = None, location: str | None = None, segment_id: str | None = None) -> Diagnostic:
    return Diagnostic(
        severity="INFO",
        category="TS4REBEL",
        code="I_TS4REBEL_PLACEHOLDER_HINT",
        message=message,
        file_path=file_path,
        location=location,
        segment_id=segment_id,
    )


def network_disabled(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_NETWORK_DISABLED", message=message, file_path=file_path)


def rate_limited(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="WARNING", category="TS4REBEL", code="W_TS4REBEL_RATE_LIMIT", message=message, file_path=file_path)


def download_blocked(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_DOWNLOAD_BLOCKED", message=message, file_path=file_path)


def unsupported_host(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_UNSUPPORTED_HOST", message=message, file_path=file_path)


def tls_required(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_TLS_REQUIRED", message=message, file_path=file_path)


def download_too_large(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_DOWNLOAD_TOO_LARGE", message=message, file_path=file_path)


def unsupported_download(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_UNSUPPORTED_DOWNLOAD", message=message, file_path=file_path)


def extract_failed(*, message: str, file_path: str | None = None) -> Diagnostic:
    return Diagnostic(severity="ERROR", category="TS4REBEL", code="E_TS4REBEL_EXTRACT_FAILED", message=message, file_path=file_path)
