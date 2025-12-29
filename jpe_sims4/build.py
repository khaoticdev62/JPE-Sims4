from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

from jpe_sims4.apply import apply_translations
from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.io.zip_safety import ZipSafetyLimits, safe_read_zip_member
from jpe_sims4.project import Project
from jpe_sims4.validate import validate_project_segments


@dataclass(frozen=True)
class BuildResult:
    output_path: Path
    diagnostics: list[Diagnostic]
    files_written: int
    segments_applied: int


def _sha256_bytes(data: bytes) -> str:
    import hashlib

    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()


def _is_unsafe_relpath(posix_path: str) -> bool:
    p = (posix_path or "").replace("\\", "/").strip()
    if not p:
        return True
    if p.startswith("/"):
        return True
    first = p.split("/", 1)[0]
    if ":" in first:
        return True
    parts = [x for x in p.split("/") if x not in ("", ".")]
    return any(part == ".." for part in parts)


def _output_overwrites_source(*, source: Path, output: Path) -> bool:
    try:
        return source.expanduser().resolve() == output.expanduser().resolve()
    except Exception:
        return str(source) == str(output)


def _ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def _group_segments(project: Project) -> dict[str, list[dict[str, object]]]:
    by_file: dict[str, list[dict[str, object]]] = {}
    for s in project.segments:
        file_path = str(s.get("file_path") or "")
        by_file.setdefault(file_path, []).append(s)
    return by_file


def _read_source_file_bytes(source_root: Path, rel_posix: str) -> bytes:
    return (source_root / Path(rel_posix)).read_bytes()


def _backup_existing_folder(output_dir: Path) -> Diagnostic | None:
    try:
        if not output_dir.exists():
            return None
        if not output_dir.is_dir():
            return Diagnostic(
                severity="ERROR",
                category="BUILD",
                code="E_BACKUP_FAILED",
                message="Output path exists but is not a directory.",
                file_path=str(output_dir),
            )
        has_any = any(output_dir.rglob("*"))
        if not has_any:
            return None
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup = output_dir.parent / f"{output_dir.name}.bak.{ts}.zip"
        with ZipFile(backup, "w", compression=ZIP_DEFLATED) as zf:
            for p in sorted([x for x in output_dir.rglob("*") if x.is_file()]):
                rel = p.relative_to(output_dir).as_posix()
                zf.write(p, arcname=rel)
        return Diagnostic(
            severity="INFO",
            category="BUILD",
            code="I_BACKUP_CREATED",
            message="Created backup of existing output folder before build.",
            file_path=str(backup),
        )
    except Exception as e:
        return Diagnostic(
            severity="ERROR",
            category="BUILD",
            code="E_BACKUP_FAILED",
            message=str(e),
            file_path=str(output_dir),
        )


def _backup_existing_zip(output_zip: Path) -> Diagnostic | None:
    try:
        if not output_zip.exists():
            return None
        ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup = output_zip.parent / f"{output_zip.stem}.bak.{ts}{output_zip.suffix}"
        backup.write_bytes(output_zip.read_bytes())
        return Diagnostic(
            severity="INFO",
            category="BUILD",
            code="I_BACKUP_CREATED",
            message="Created backup of existing output zip before build.",
            file_path=str(backup),
        )
    except Exception as e:
        return Diagnostic(
            severity="ERROR",
            category="BUILD",
            code="E_BACKUP_FAILED",
            message=str(e),
            file_path=str(output_zip),
        )


def _manifest_entry(
    *,
    project: Project,
    rel: str,
    kind: str,
    output_sha256: str | None,
) -> dict[str, object]:
    src = (project.file_index or {}).get(rel) or {}
    src_sha = src.get("sha256")
    src_crc = src.get("zip_crc32")
    changed = False
    if src_sha and output_sha256:
        changed = bool(str(src_sha) != str(output_sha256))
    elif src_crc is not None:
        changed = True
    return {
        "path": rel,
        "kind": kind,
        "source_sha256": src_sha,
        "source_zip_crc32": src_crc,
        "output_sha256": output_sha256,
        "changed": changed,
    }


def _render_diff_report_md(*, manifest: dict[str, object], diagnostics: list[Diagnostic]) -> str:
    files = list(manifest.get("files") or [])
    changed = [f for f in files if bool((f or {}).get("changed"))]
    lines: list[str] = []
    lines.append("# Build Diff Report")
    lines.append("")
    lines.append(f"- Built: `{manifest.get('built_at')}`")
    lines.append(f"- Output: `{manifest.get('output')}`")
    lines.append(f"- Files: `{len(files)}` (changed={len(changed)})")
    lines.append(f"- Segments applied: `{manifest.get('segments_applied')}`")
    lines.append(f"- Diagnostics: `{len(diagnostics)}`")
    lines.append("")
    if changed:
        lines.append("## Changed Files")
        for f in changed[:200]:
            lines.append(f"- `{f.get('path')}`")
        lines.append("")
    return "\n".join(lines)


def build_to_folder(*, project: Project, output_dir: Path) -> BuildResult:
    diagnostics: list[Diagnostic] = []
    diagnostics.extend(
        validate_project_segments(project.segments, glossary_entries=project.glossary, rules=project.validation)
    )
    output_dir = output_dir.expanduser().resolve()

    segments_by_file = _group_segments(project)
    files_written = 0
    segments_applied = 0

    src = project.source_path.expanduser().resolve()
    is_zip = src.is_file() and src.suffix.lower() == ".zip"
    if not is_zip and _output_overwrites_source(source=src, output=output_dir):
        diagnostics.append(
            Diagnostic(
                severity="ERROR",
                category="BUILD",
                code="E_UNSAFE_OUTPUT",
                message="Output folder must not be the same as the source folder.",
                file_path=str(output_dir),
            )
        )
        project.build_history.append(
            {
                "built_at": datetime.now(timezone.utc).isoformat(),
                "output": str(output_dir),
                "format": "folder",
                "files_written": files_written,
                "segments_applied": segments_applied,
                "diagnostics": [d.to_dict() for d in diagnostics],
            }
        )
        return BuildResult(
            output_path=output_dir,
            diagnostics=diagnostics,
            files_written=files_written,
            segments_applied=segments_applied,
        )

    backup_diag = _backup_existing_folder(output_dir)
    if backup_diag:
        diagnostics.append(backup_diag)

    output_dir.mkdir(parents=True, exist_ok=True)

    manifest_files: list[dict[str, object]] = []
    limits = ZipSafetyLimits.from_env() if is_zip else None
    source_zip: ZipFile | None = None
    try:
        if is_zip:
            source_zip = ZipFile(src)
        for f in project.files:
            rel = f["path"]
            if _is_unsafe_relpath(rel):
                diagnostics.append(
                    Diagnostic(
                        severity="ERROR",
                        category="BUILD",
                        code="E_UNSAFE_PATH",
                        message="Refusing to write unsafe relative path.",
                        file_path=rel,
                    )
                )
                continue

            out_path = output_dir / Path(rel)
            _ensure_parent(out_path)

            try:
                if is_zip and source_zip is not None:
                    content, read_diags = safe_read_zip_member(zf=source_zip, member=rel, limits=limits, category="IO")
                    diagnostics.extend(read_diags)
                    if content is None:
                        continue
                else:
                    content = _read_source_file_bytes(src, rel)
            except Exception as e:
                diagnostics.append(
                    Diagnostic(
                        severity="ERROR",
                        category="IO",
                        code="E_READ_FAILED",
                        message=str(e),
                        file_path=rel,
                    )
                )
                continue

            kind = f.get("kind", "unknown")
            apply_res = apply_translations(file_path=rel, kind=kind, content=content, segments=segments_by_file.get(rel, []))
            diagnostics.extend(apply_res.diagnostics)
            segments_applied += apply_res.applied
            out_sha = (
                _sha256_bytes(apply_res.content)
                if str(kind) in {"xml", "jpe-xml", "jpe", "json", "ini", "cfg", "log", "unknown"}
                else None
            )
            manifest_files.append(_manifest_entry(project=project, rel=rel, kind=str(kind), output_sha256=out_sha))

            try:
                out_path.write_bytes(apply_res.content)
                files_written += 1
            except Exception as e:
                diagnostics.append(
                    Diagnostic(
                        severity="ERROR",
                        category="IO",
                        code="E_WRITE_FAILED",
                        message=str(e),
                        file_path=str(out_path),
                    )
                )
    finally:
        if source_zip is not None:
            source_zip.close()

    manifest = {
        "built_at": datetime.now(timezone.utc).isoformat(),
        "source": str(project.source_path),
        "output": str(output_dir),
        "format": "folder",
        "files_written": files_written,
        "segments_applied": segments_applied,
        "files": manifest_files,
    }
    try:
        (output_dir / "manifest.jpe.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        (output_dir / "diff_report.md").write_text(_render_diff_report_md(manifest=manifest, diagnostics=diagnostics), encoding="utf-8")
    except Exception as e:
        diagnostics.append(
            Diagnostic(
                severity="WARNING",
                category="BUILD",
                code="W_MANIFEST_WRITE_FAILED",
                message=str(e),
                file_path=str(output_dir),
            )
        )

    project.build_history.append(
        {
            "built_at": datetime.now(timezone.utc).isoformat(),
            "output": str(output_dir),
            "format": "folder",
            "files_written": files_written,
            "segments_applied": segments_applied,
            "diagnostics": [d.to_dict() for d in diagnostics],
            "manifest": manifest,
        }
    )
    return BuildResult(
        output_path=output_dir,
        diagnostics=diagnostics,
        files_written=files_written,
        segments_applied=segments_applied,
    )


def build_to_zip(*, project: Project, output_zip: Path) -> BuildResult:
    diagnostics: list[Diagnostic] = []
    diagnostics.extend(
        validate_project_segments(project.segments, glossary_entries=project.glossary, rules=project.validation)
    )
    output_zip = output_zip.expanduser().resolve()
    _ensure_parent(output_zip)

    segments_by_file = _group_segments(project)
    files_written = 0
    segments_applied = 0

    src = project.source_path.expanduser().resolve()
    is_zip = src.is_file() and src.suffix.lower() == ".zip"
    source_zip: ZipFile | None = None
    limits = ZipSafetyLimits.from_env() if is_zip else None
    if is_zip:
        source_zip = ZipFile(src)
        if _output_overwrites_source(source=src, output=output_zip):
            diagnostics.append(
                Diagnostic(
                    severity="ERROR",
                    category="BUILD",
                    code="E_UNSAFE_OUTPUT",
                    message="Output zip must not be the same path as the source zip.",
                    file_path=str(output_zip),
                )
            )
            project.build_history.append(
                {
                    "built_at": datetime.now(timezone.utc).isoformat(),
                    "output": str(output_zip),
                    "format": "zip",
                    "files_written": files_written,
                    "segments_applied": segments_applied,
                    "diagnostics": [d.to_dict() for d in diagnostics],
                }
            )
            source_zip.close()
            return BuildResult(
                output_path=output_zip,
                diagnostics=diagnostics,
                files_written=files_written,
                segments_applied=segments_applied,
            )

    backup_diag = _backup_existing_zip(output_zip)
    if backup_diag:
        diagnostics.append(backup_diag)

    manifest_files: list[dict[str, object]] = []
    try:
        with ZipFile(output_zip, "w") as outz:
            for f in project.files:
                rel = f["path"]
                if _is_unsafe_relpath(rel):
                    diagnostics.append(
                        Diagnostic(
                            severity="ERROR",
                            category="BUILD",
                            code="E_UNSAFE_PATH",
                            message="Refusing to write unsafe relative path.",
                            file_path=rel,
                        )
                    )
                    continue

                try:
                    if is_zip and source_zip is not None:
                        content, read_diags = safe_read_zip_member(zf=source_zip, member=rel, limits=limits, category="IO")
                        diagnostics.extend(read_diags)
                        if content is None:
                            continue
                    else:
                        content = _read_source_file_bytes(src, rel)
                except Exception as e:
                    diagnostics.append(
                        Diagnostic(
                            severity="ERROR",
                            category="IO",
                            code="E_READ_FAILED",
                            message=str(e),
                            file_path=rel,
                        )
                    )
                    continue

                kind = f.get("kind", "unknown")
                apply_res = apply_translations(
                    file_path=rel, kind=kind, content=content, segments=segments_by_file.get(rel, [])
                )
                diagnostics.extend(apply_res.diagnostics)
                segments_applied += apply_res.applied
                out_sha = _sha256_bytes(apply_res.content) if str(kind) in {"xml", "jpe-xml", "jpe", "json", "ini", "cfg", "log", "unknown"} else None
                manifest_files.append(_manifest_entry(project=project, rel=rel, kind=str(kind), output_sha256=out_sha))

                zi = ZipInfo(rel)
                outz.writestr(zi, apply_res.content)
                files_written += 1

            manifest = {
                "built_at": datetime.now(timezone.utc).isoformat(),
                "source": str(project.source_path),
                "output": str(output_zip),
                "format": "zip",
                "files_written": files_written,
                "segments_applied": segments_applied,
                "files": manifest_files,
            }
            outz.writestr("manifest.jpe.json", json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
            outz.writestr("diff_report.md", _render_diff_report_md(manifest=manifest, diagnostics=diagnostics))
    finally:
        if source_zip is not None:
            source_zip.close()

    manifest = {
        "built_at": datetime.now(timezone.utc).isoformat(),
        "source": str(project.source_path),
        "output": str(output_zip),
        "format": "zip",
        "files_written": files_written,
        "segments_applied": segments_applied,
        "files": manifest_files,
    }
    project.build_history.append(
        {
            "built_at": datetime.now(timezone.utc).isoformat(),
            "output": str(output_zip),
            "format": "zip",
            "files_written": files_written,
            "segments_applied": segments_applied,
            "diagnostics": [d.to_dict() for d in diagnostics],
            "manifest": manifest,
        }
    )
    return BuildResult(
        output_path=output_zip,
        diagnostics=diagnostics,
        files_written=files_written,
        segments_applied=segments_applied,
    )
