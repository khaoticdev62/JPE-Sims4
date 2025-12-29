from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from zipfile import ZipFile

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.io.zip_safety import ZipSafetyLimits, check_zip_member_info, is_unsafe_zip_member
import jpe_sims4.ts4rebels.diagnostics as di
from jpe_sims4.ts4rebels.client import TS4RebelsClient
from jpe_sims4.ts4rebels.downloads import DownloadLimits, download_to_file, finalize_download


@dataclass(frozen=True)
class DownloadAndImportResult:
    downloaded_path: Path | None
    sha256: str | None
    import_dir: Path | None
    files_written: int
    bytes_written: int
    diagnostics: list[Diagnostic]


def _unique_dir(root: Path, name: str) -> Path:
    root.mkdir(parents=True, exist_ok=True)
    base = root / name
    if not base.exists():
        return base
    i = 1
    while True:
        cand = root / f"{name}-{i}"
        if not cand.exists():
            return cand
        i += 1


def _iter_zip_members(zf: ZipFile) -> Iterable[str]:
    for info in sorted(zf.infolist(), key=lambda x: x.filename):
        if info.is_dir():
            continue
        yield info.filename


def extract_zip_to_folder(
    *,
    zip_path: Path,
    dest_dir: Path,
    limits: ZipSafetyLimits | None = None,
    category: str = "ZIP",
) -> tuple[int, int, list[Diagnostic]]:
    """
    Safely extracts a zip into dest_dir, skipping unsafe members and enforcing size limits.
    Returns (files_written, bytes_written, diagnostics).
    """
    limits = limits or ZipSafetyLimits.from_env()
    diags: list[Diagnostic] = []
    files_written = 0
    bytes_written = 0

    try:
        with ZipFile(zip_path) as zf:
            total_uncompressed = 0
            file_count = 0
            for info in sorted(zf.infolist(), key=lambda x: x.filename):
                if info.is_dir():
                    continue
                file_count += 1
                if file_count > limits.max_files:
                    diags.append(
                        Diagnostic(
                            severity="ERROR",
                            category=category,
                            code="E_ZIP_TOO_MANY_FILES",
                            message=f"Zip exceeds file count limit ({file_count} > {limits.max_files}).",
                            file_path=str(zip_path),
                        )
                    )
                    break

                total_uncompressed += int(getattr(info, "file_size", 0) or 0)
                if total_uncompressed > limits.max_total_uncompressed_bytes:
                    diags.append(
                        Diagnostic(
                            severity="ERROR",
                            category=category,
                            code="E_ZIP_TOO_LARGE",
                            message=(
                                f"Zip exceeds total uncompressed size limit ({total_uncompressed} bytes > {limits.max_total_uncompressed_bytes})."
                            ),
                            file_path=str(zip_path),
                        )
                    )
                    break

                member = info.filename
                member_diags = check_zip_member_info(info=info, limits=limits, category=category)
                diags.extend(member_diags)
                if any(d.severity in {"ERROR", "FATAL"} for d in member_diags):
                    continue
                if is_unsafe_zip_member(member):
                    continue

                out_path = dest_dir / member.replace("\\", "/")
                out_path.parent.mkdir(parents=True, exist_ok=True)

                try:
                    with zf.open(member) as src, out_path.open("wb") as dst:
                        for chunk in iter(lambda: src.read(1024 * 128), b""):
                            dst.write(chunk)
                            bytes_written += len(chunk)
                    files_written += 1
                except Exception as e:
                    diags.append(di.extract_failed(message=str(e), file_path=member))
                    try:
                        out_path.unlink(missing_ok=True)  # type: ignore[arg-type]
                    except Exception:
                        pass
    except Exception as e:
        return 0, 0, [di.extract_failed(message=str(e), file_path=str(zip_path))]

    return files_written, bytes_written, diags


def download_and_import_zip(
    *,
    client: TS4RebelsClient,
    url: str,
    downloads_dir: Path,
    imports_root: Path,
    download_limits: DownloadLimits | None = None,
    zip_limits: ZipSafetyLimits | None = None,
) -> DownloadAndImportResult:
    """
    Downloads a remote zip and safely imports it to a new folder under imports_root.
    Offline-first: caller must configure client.enable_network=True and allowlisted hosts.
    """
    diags = list(client.guard_network() or [])
    if diags:
        return DownloadAndImportResult(
            downloaded_path=None,
            sha256=None,
            import_dir=None,
            files_written=0,
            bytes_written=0,
            diagnostics=diags,
        )

    dl_path, dl_diags = download_to_file(
        http=client.http,
        url=url,
        dest_dir=downloads_dir,
        limits=download_limits,
    )
    diags.extend(dl_diags)
    if dl_path is None:
        return DownloadAndImportResult(None, None, None, 0, 0, diags)

    preferred_ext = ".zip" if str(url).lower().endswith(".zip") else ".bin"
    final, sha = finalize_download(downloaded_path=dl_path, dest_dir=downloads_dir, preferred_ext=preferred_ext)
    if preferred_ext != ".zip":
        diags.append(di.unsupported_download(message="Downloaded file is not a .zip; import is not supported.", file_path=str(url)))
        return DownloadAndImportResult(final, sha, None, 0, 0, diags)

    import_dir = _unique_dir(imports_root, sha)
    try:
        import_dir.mkdir(parents=True, exist_ok=False)
    except Exception:
        # Fallback: if mkdir races, still proceed.
        import_dir.mkdir(parents=True, exist_ok=True)

    files_written, bytes_written, ex_diags = extract_zip_to_folder(zip_path=final, dest_dir=import_dir, limits=zip_limits)
    diags.extend(ex_diags)
    return DownloadAndImportResult(final, sha, import_dir, files_written, bytes_written, diags)

