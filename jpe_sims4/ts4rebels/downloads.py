from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

from jpe_sims4.diagnostics import Diagnostic
import jpe_sims4.ts4rebels.diagnostics as di
from jpe_sims4.ts4rebels.http import HttpSession


@dataclass(frozen=True)
class DownloadLimits:
    max_bytes: int = 500_000_000
    allowed_hosts: tuple[str, ...] = ("ts4rebels.cc",)
    allow_insecure_http: bool = False


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fp:
        for chunk in iter(lambda: fp.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def download_to_file(
    *,
    http: HttpSession,
    url: str,
    dest_dir: Path,
    limits: DownloadLimits | None = None,
) -> tuple[Path | None, list[Diagnostic]]:
    limits = limits or DownloadLimits()
    diags: list[Diagnostic] = []

    parsed = urlparse(url)
    scheme = parsed.scheme.lower()
    if scheme != "https":
        if not (scheme == "http" and bool(limits.allow_insecure_http)):
            return None, [di.tls_required(message="Only https:// URLs are allowed.")]
    host = (parsed.hostname or "").lower()
    if host not in {h.lower() for h in limits.allowed_hosts}:
        return None, [di.unsupported_host(message=f"Host not allowlisted: {host}", file_path=url)]

    dest_dir.mkdir(parents=True, exist_ok=True)
    tmp = dest_dir / "download.tmp"
    out = dest_dir / "download.bin"

    total = 0
    try:
        resp = http.request("GET", url, stream=True)
        resp.raise_for_status()
        with tmp.open("wb") as fp:
            for chunk in resp.iter_content(chunk_size=1024 * 128):
                if not chunk:
                    continue
                total += len(chunk)
                if total > int(limits.max_bytes):
                    fp.close()
                    try:
                        tmp.unlink(missing_ok=True)  # type: ignore[arg-type]
                    except Exception:
                        pass
                    return None, [di.download_too_large(message=f"Download exceeds max_bytes ({limits.max_bytes}).", file_path=url)]
                fp.write(chunk)
        tmp.replace(out)
    except Exception as e:
        return None, [di.download_blocked(message=str(e), file_path=url)]

    return out, diags


def finalize_download(
    *,
    downloaded_path: Path,
    dest_dir: Path,
    preferred_ext: str = ".zip",
) -> tuple[Path, str]:
    sha = _sha256_file(downloaded_path)
    dest_dir.mkdir(parents=True, exist_ok=True)
    final = dest_dir / f"{sha}{preferred_ext}"
    if final.exists():
        try:
            downloaded_path.unlink(missing_ok=True)  # type: ignore[arg-type]
        except Exception:
            pass
        return final, sha
    downloaded_path.replace(final)
    return final, sha
