from __future__ import annotations

import fnmatch
from dataclasses import dataclass
from pathlib import Path
from zipfile import ZipFile

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.extractors import dedupe_segments, extract_segments
from jpe_sims4.io.indexing import changed_paths, index_files
from jpe_sims4.io.zip_safety import ZipSafetyLimits, safe_read_zip_member
from jpe_sims4.project import Project
from jpe_sims4.remote_sources import normalize_remote_sources
from jpe_sims4.scanner import scan_input
from jpe_sims4.segments import Segment
from jpe_sims4.storage import load_project
from jpe_sims4.validate import validate_project_segments


@dataclass(frozen=True)
class ExtractProjectResult:
    project: Project
    diagnostics: list[Diagnostic]


@dataclass(frozen=True)
class ScanProjectResult:
    project: Project
    diagnostics: list[Diagnostic]

def _normalize_exclude_globs(exclude_globs: list[str] | None) -> list[str]:
    out: list[str] = []
    for raw in exclude_globs or []:
        s = str(raw or "").strip()
        if not s:
            continue
        s = s.replace("\\", "/")
        out.append(s)
    return out


def _apply_excludes(files: list[dict[str, str]], exclude_globs: list[str]) -> list[dict[str, str]]:
    if not exclude_globs:
        return files
    kept: list[dict[str, str]] = []
    for f in files:
        p = str(f.get("path") or "").replace("\\", "/")
        if not p:
            continue
        if any(fnmatch.fnmatchcase(p, pat) for pat in exclude_globs):
            continue
        kept.append(f)
    return kept


def _configure_plugins(*, plugin_paths: list[str] | None, disabled_plugins: list[str] | None) -> None:
    try:
        from jpe_sims4.plugins import plugins

        extra_dirs = [Path(p).expanduser() for p in (plugin_paths or []) if str(p or "").strip()]
        plugins().configure(extra_dirs=extra_dirs, disabled_paths=list(disabled_plugins or []))
    except Exception:
        return


def scan_project(
    source_path: Path,
    *,
    merge_from_project_json: Path | None = None,
    exclude_globs: list[str] | None = None,
    plugin_paths: list[str] | None = None,
    disabled_plugins: list[str] | None = None,
) -> ScanProjectResult:
    """
    Scan a source folder/zip into a Project and build a cache-friendly file index.

    This is the “fast path” for large mods: hashes are reused from a previous project JSON
    when size/mtime (folder) or crc/size (zip) indicate the file is unchanged.
    """
    project = Project.create(source_path=source_path)
    project.version = "m9"

    previous_project: Project | None = None
    if merge_from_project_json and merge_from_project_json.exists():
        try:
            previous_project = load_project(merge_from_project_json)
        except Exception:
            previous_project = None

    eff_excludes = _normalize_exclude_globs(
        exclude_globs if exclude_globs is not None else (getattr(previous_project, "exclude_globs", None) if previous_project else None)
    )
    eff_plugin_paths = list(plugin_paths if plugin_paths is not None else (previous_project.plugin_paths if previous_project else []))
    eff_disabled = list(disabled_plugins if disabled_plugins is not None else (previous_project.disabled_plugins if previous_project else []))
    _configure_plugins(plugin_paths=eff_plugin_paths, disabled_plugins=eff_disabled)

    scan = scan_input(project.source_path)
    project.exclude_globs = list(eff_excludes)
    project.plugin_paths = list(eff_plugin_paths)
    project.disabled_plugins = list(eff_disabled)
    project.files = _apply_excludes(scan.files, eff_excludes)
    diagnostics: list[Diagnostic] = [Diagnostic(**d) for d in scan.diagnostics]  # type: ignore[arg-type]

    file_index, index_diags, _stats = index_files(
        source_path=project.source_path,
        files=project.files,
        previous_index=(previous_project.file_index if previous_project else None),
    )
    project.file_index = file_index
    diagnostics.extend(index_diags)

    if previous_project is not None:
        if previous_project.remote_sources:
            project.remote_sources = normalize_remote_sources(previous_project.remote_sources)
        if previous_project.validation:
            project.validation = dict(previous_project.validation)
        if previous_project.glossary:
            project.glossary = list(previous_project.glossary)

    project.diagnostics = [d.to_dict() for d in diagnostics]
    return ScanProjectResult(project=project, diagnostics=diagnostics)


def _read_file_bytes(root: Path, rel_posix: str) -> bytes:
    return (root / Path(rel_posix)).read_bytes()


def _merge_previous_segments(project: Project, previous_segments: list[dict[str, object]]) -> None:
    by_id: dict[str, dict[str, object]] = {str(s.get("id") or ""): s for s in previous_segments}
    for s in project.segments:
        sid = str(s.get("id") or "")
        prev = by_id.get(sid)
        if not prev:
            for alias in list(s.get("id_aliases") or []):
                prev = by_id.get(str(alias))
                if prev:
                    break
        if not prev:
            continue
        if not str(s.get("target") or "").strip() and str(prev.get("target") or "").strip():
            s["target"] = str(prev.get("target") or "")
        if prev.get("status") in {"new", "in_progress", "reviewed"}:
            s["status"] = prev.get("status")
        if prev.get("note") is not None:
            s["note"] = prev.get("note")
        if prev.get("updated_at"):
            s["updated_at"] = prev.get("updated_at")


def _segment_from_dict(d: dict[str, object]) -> Segment:
    return Segment(
        id=str(d.get("id") or ""),
        file_path=str(d.get("file_path") or ""),
        location=str(d.get("location") or ""),
        source=str(d.get("source") or ""),
        target=str(d.get("target") or ""),
        status=str(d.get("status") or "new"),
        note=str(d.get("note") or ""),
        updated_at=str(d.get("updated_at") or "") or None,
        id_aliases=[str(x) for x in (d.get("id_aliases") or []) if str(x).strip()],
    )


def extract_project(
    source_path: Path,
    *,
    merge_from_project_json: Path | None = None,
    exclude_globs: list[str] | None = None,
    plugin_paths: list[str] | None = None,
    disabled_plugins: list[str] | None = None,
) -> ExtractProjectResult:
    project = Project.create(source_path=source_path)
    project.version = "m9"

    previous_project: Project | None = None
    if merge_from_project_json and merge_from_project_json.exists():
        try:
            previous_project = load_project(merge_from_project_json)
        except Exception:
            previous_project = None

    eff_excludes = _normalize_exclude_globs(
        exclude_globs if exclude_globs is not None else (getattr(previous_project, "exclude_globs", None) if previous_project else None)
    )
    eff_plugin_paths = list(plugin_paths if plugin_paths is not None else (previous_project.plugin_paths if previous_project else []))
    eff_disabled = list(disabled_plugins if disabled_plugins is not None else (previous_project.disabled_plugins if previous_project else []))
    _configure_plugins(plugin_paths=eff_plugin_paths, disabled_plugins=eff_disabled)

    scan = scan_input(project.source_path)
    project.exclude_globs = list(eff_excludes)
    project.plugin_paths = list(eff_plugin_paths)
    project.disabled_plugins = list(eff_disabled)
    project.files = _apply_excludes(scan.files, eff_excludes)
    diagnostics: list[Diagnostic] = [Diagnostic(**d) for d in scan.diagnostics]  # type: ignore[arg-type]

    file_index, index_diags, _stats = index_files(
        source_path=project.source_path,
        files=project.files,
        previous_index=(previous_project.file_index if previous_project else None),
    )
    project.file_index = file_index
    diagnostics.extend(index_diags)
    changed = changed_paths(previous_project.file_index if previous_project else None, project.file_index)

    segments: list[Segment] = []
    extractor_diags: list[Diagnostic] = []
    supported = {"xml", "jpe-xml", "jpe", "json", "ini", "cfg"}
    try:
        from jpe_sims4.plugins import plugins

        supported |= set(plugins().load().extractors.keys())
    except Exception:
        pass

    if previous_project is not None:
        current_paths = {str(f.get("path") or "") for f in project.files}
        for prev_seg in previous_project.segments:
            fp = str(prev_seg.get("file_path") or "")
            if fp in current_paths and fp not in changed:
                segments.append(_segment_from_dict(prev_seg))

    if source_path.is_file() and source_path.suffix.lower() == ".zip":
        limits = ZipSafetyLimits.from_env()
        with ZipFile(source_path) as zf:
            for f in project.files:
                if f["kind"] not in supported:
                    continue
                if previous_project is not None and f["path"] not in changed:
                    continue
                content, diags = safe_read_zip_member(zf=zf, member=f["path"], limits=limits, category="IO")
                extractor_diags.extend(diags)
                if content is None:
                    continue
                res = extract_segments(file_path=f["path"], kind=f["kind"], content=content)
                segments.extend(res.segments)
                extractor_diags.extend(res.diagnostics)
    else:
        root = source_path
        for f in project.files:
            if f["kind"] not in supported:
                continue
            if previous_project is not None and f["path"] not in changed:
                continue
            try:
                content = _read_file_bytes(root, f["path"])
            except Exception as e:
                extractor_diags.append(
                    Diagnostic(
                        severity="ERROR",
                        category="IO",
                        code="E_READ_FAILED",
                        message=str(e),
                        file_path=f["path"],
                    )
                )
                continue
            res = extract_segments(file_path=f["path"], kind=f["kind"], content=content)
            segments.extend(res.segments)
            extractor_diags.extend(res.diagnostics)

    segments = dedupe_segments(segments)
    project.segments = [s.to_dict() for s in segments]
    if previous_project is not None:
        _merge_previous_segments(project, previous_project.segments)
        if previous_project.glossary:
            project.glossary = list(previous_project.glossary)
        if previous_project.validation:
            project.validation = dict(previous_project.validation)
        if previous_project.remote_sources:
            project.remote_sources = normalize_remote_sources(previous_project.remote_sources)

    validation_diags = validate_project_segments(project.segments, glossary_entries=project.glossary, rules=project.validation)
    diagnostics.extend(extractor_diags)
    diagnostics.extend(validation_diags)

    project.diagnostics = [d.to_dict() for d in diagnostics]
    return ExtractProjectResult(project=project, diagnostics=diagnostics)


def estimate_project_segments(
    source_path: Path,
    *,
    exclude_globs: list[str] | None = None,
    plugin_paths: list[str] | None = None,
    disabled_plugins: list[str] | None = None,
) -> tuple[int, list[Diagnostic]]:
    """
    Return an approximate segment count without producing a full Project.

    Intended for UI scan previews; runs extractors but skips merge/validation.
    """
    _configure_plugins(plugin_paths=list(plugin_paths or []), disabled_plugins=list(disabled_plugins or []))
    eff_excludes = _normalize_exclude_globs(exclude_globs)

    scan = scan_input(source_path)
    files = _apply_excludes(scan.files, eff_excludes)
    diagnostics: list[Diagnostic] = [Diagnostic(**d) for d in scan.diagnostics]  # type: ignore[arg-type]

    supported = {"xml", "jpe-xml", "jpe", "json", "ini", "cfg"}
    try:
        from jpe_sims4.plugins import plugins

        supported |= set(plugins().load().extractors.keys())
    except Exception:
        pass

    seen: set[tuple[str, str, str]] = set()

    if source_path.is_file() and source_path.suffix.lower() == ".zip":
        limits = ZipSafetyLimits.from_env()
        with ZipFile(source_path) as zf:
            for f in files:
                if f["kind"] not in supported:
                    continue
                content, diags = safe_read_zip_member(zf=zf, member=f["path"], limits=limits, category="IO")
                diagnostics.extend(diags)
                if content is None:
                    continue
                res = extract_segments(file_path=f["path"], kind=f["kind"], content=content)
                diagnostics.extend(res.diagnostics)
                for s in res.segments:
                    seen.add((s.file_path, s.location, s.source))
    else:
        root = source_path
        for f in files:
            if f["kind"] not in supported:
                continue
            try:
                content = _read_file_bytes(root, f["path"])
            except Exception as e:
                diagnostics.append(
                    Diagnostic(
                        severity="ERROR",
                        category="IO",
                        code="E_READ_FAILED",
                        message=str(e),
                        file_path=f["path"],
                    )
                )
                continue
            res = extract_segments(file_path=f["path"], kind=f["kind"], content=content)
            diagnostics.extend(res.diagnostics)
            for s in res.segments:
                seen.add((s.file_path, s.location, s.source))

    return len(seen), diagnostics
