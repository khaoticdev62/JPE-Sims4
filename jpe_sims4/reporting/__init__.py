from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone

from jpe_sims4.diagnostics import Diagnostic
from jpe_sims4.project import Project


def _as_dicts(diagnostics: list[Diagnostic] | list[dict[str, object]]) -> list[dict[str, object]]:
    out: list[dict[str, object]] = []
    for d in diagnostics:
        if isinstance(d, Diagnostic):
            out.append(d.to_dict())
        else:
            out.append(d)
    return out


def summarize_diagnostics(diagnostics: list[Diagnostic] | list[dict[str, object]]) -> dict[str, object]:
    ds = _as_dicts(diagnostics)
    by_sev = Counter(str(d.get("severity") or "UNKNOWN") for d in ds)
    by_cat = Counter(str(d.get("category") or "UNCATEGORIZED") for d in ds)
    by_code = Counter(str(d.get("code") or "NO_CODE") for d in ds)
    by_file = Counter(str(d.get("file_path") or "(none)") for d in ds)

    return {
        "total": len(ds),
        "by_severity": dict(by_sev),
        "by_category": dict(by_cat),
        "by_code": dict(by_code),
        "top_files": by_file.most_common(15),
    }


def filter_diagnostics(
    diagnostics: list[dict[str, object]],
    *,
    severities: set[str] | None = None,
    text: str | None = None,
) -> list[dict[str, object]]:
    out: list[dict[str, object]] = []
    q = (text or "").strip().lower()
    for d in diagnostics:
        sev = str(d.get("severity") or "")
        if severities and sev not in severities:
            continue
        if q:
            hay = " ".join(
                str(d.get(k) or "")
                for k in ("severity", "category", "code", "message", "file_path", "location", "segment_id")
            ).lower()
            if q not in hay:
                continue
        out.append(d)
    return out


def render_diagnostics_markdown(
    project: Project, diagnostics: list[Diagnostic] | list[dict[str, object]] | None = None
) -> str:
    if diagnostics is None:
        ds: list[dict[str, object]] = list(project.diagnostics)
    else:
        ds = _as_dicts(diagnostics)

    summary = summarize_diagnostics(ds)
    built_at = datetime.now(timezone.utc).isoformat()

    lines: list[str] = []
    lines.append("# JPE Diagnostics Report")
    lines.append("")
    lines.append(f"- Generated: `{built_at}`")
    lines.append(f"- Project Version: `{project.version}`")
    lines.append(f"- Source: `{project.source_path}`")
    lines.append(f"- Files: `{len(project.files)}`")
    lines.append(f"- Segments: `{len(project.segments)}`")
    lines.append(f"- Diagnostics: `{summary['total']}`")
    lines.append("")

    lines.append("## Summary")
    for sev, count in sorted((summary["by_severity"] or {}).items()):  # type: ignore[union-attr]
        lines.append(f"- {sev}: {count}")
    lines.append("")

    lines.append("## Top Files")
    for fp, count in (summary["top_files"] or []):  # type: ignore[assignment]
        lines.append(f"- `{fp}`: {count}")
    lines.append("")

    lines.append("## Diagnostics")
    by_file: dict[str, list[dict[str, object]]] = defaultdict(list)
    for d in ds:
        by_file[str(d.get("file_path") or "(none)")].append(d)

    for fp in sorted(by_file.keys()):
        lines.append(f"### `{fp}`")
        for d in by_file[fp]:
            sev = str(d.get("severity") or "")
            code = str(d.get("code") or "")
            msg = str(d.get("message") or "")
            loc = str(d.get("location") or "")
            seg = str(d.get("segment_id") or "")
            extra = " ".join(x for x in [loc and f"loc={loc}", seg and f"segment={seg}"] if x)
            suffix = f" ({extra})" if extra else ""
            lines.append(f"- {sev} `{code}`: {msg}{suffix}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"
