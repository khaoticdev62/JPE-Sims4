from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Iterable

from jpe_sims4.project import Project
from jpe_sims4.build import build_to_folder, build_to_zip
from jpe_sims4.bulk import (
    apply_best_sqlite_tm_to_empty_targets_scoped,
    apply_best_tm_to_empty_targets_scoped,
    propagate_targets_by_source_scoped,
)
from jpe_sims4.csv_io import export_segments_csv, import_segments_csv
from jpe_sims4.glossary.io import export_glossary_csv, import_glossary_csv
from jpe_sims4.plugins import plugins
from jpe_sims4.predict import Prediction, predict_targets
from jpe_sims4.reporting import render_diagnostics_markdown, summarize_diagnostics
from jpe_sims4.sync import get_status, merge_projects, pull, push
from jpe_sims4.tm.sqlite_store import SqliteTMStore, default_tm_db_path
from jpe_sims4.workspace import filter_segments
from jpe_sims4.workflow import extract_project, scan_project
from jpe_sims4.storage import load_project, save_project
from jpe_sims4.validate import validate_project_segments
from jpe_sims4.ts4rebels.client import ClientConfig, TS4RebelsClient
import jpe_sims4.ts4rebels.diagnostics as ts4di
from jpe_sims4.ts4rebels.downloads import DownloadLimits
from jpe_sims4.ts4rebels.harvest import harvest_ts4rebels_samples
from jpe_sims4.ts4rebels.sample_analysis import analyze_samples_folder
from jpe_sims4.ts4rebels.sync import download_and_import_zip
from jpe_sims4.ts4rebels.translation_pack import apply_translation_pack, load_translation_pack
from jpe_sims4.ts4rebels.validation_preset import apply_ts4rebels_validation_preset


_SEVERITY_RANK = {"INFO": 0, "WARNING": 1, "ERROR": 2, "FATAL": 3}


def _exit_code_for_diagnostics(
    diagnostics: Iterable[object],
    *,
    warnings_as_errors: bool = False,
) -> int:
    max_rank = 0
    for d in diagnostics:
        if isinstance(d, dict):
            sev = str(d.get("severity") or "")
        else:
            sev = str(getattr(d, "severity", "") or "")
        rank = _SEVERITY_RANK.get(sev, 2)
        if rank > max_rank:
            max_rank = rank
    if warnings_as_errors and max_rank == _SEVERITY_RANK["WARNING"]:
        return _SEVERITY_RANK["ERROR"]
    return int(max_rank)


def _cmd_scan(args: argparse.Namespace) -> int:
    merge_from = Path(args.merge_from) if args.merge_from else None
    result = scan_project(Path(args.path), merge_from_project_json=merge_from)
    project = result.project

    payload = project.to_dict()
    if args.write:
        Path(args.write).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.json or not args.write:
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return _exit_code_for_diagnostics(project.diagnostics, warnings_as_errors=bool(args.warnings_as_errors))


def _cmd_extract(args: argparse.Namespace) -> int:
    merge_from = Path(args.merge_from) if args.merge_from else None
    result = extract_project(Path(args.path), merge_from_project_json=merge_from)
    payload = result.project.to_dict()
    if args.write:
        Path(args.write).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if args.json or not args.write:
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return _exit_code_for_diagnostics(result.project.diagnostics, warnings_as_errors=bool(args.warnings_as_errors))


def _cmd_build(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)

    if args.out_zip:
        res = build_to_zip(project=project, output_zip=Path(args.out_zip))
    else:
        if not args.out_dir:
            raise SystemExit("--out-dir is required unless --out-zip is used.")
        res = build_to_folder(project=project, output_dir=Path(args.out_dir))

    save_project(project, project_path)

    if args.report:
        Path(args.report).write_text(render_diagnostics_markdown(project, res.diagnostics), encoding="utf-8")

    payload = {
        "output": str(res.output_path),
        "files_written": res.files_written,
        "segments_applied": res.segments_applied,
        "diagnostics": [d.to_dict() for d in res.diagnostics],
    }
    exit_code = _exit_code_for_diagnostics(res.diagnostics, warnings_as_errors=bool(args.warnings_as_errors))
    payload["diagnostics_summary"] = summarize_diagnostics(payload["diagnostics"])  # type: ignore[assignment]
    payload["exit_code"] = exit_code
    if args.json:
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    else:
        sys.stdout.write(f"Built: {res.output_path}\n")
        sys.stdout.write(f"Files written: {res.files_written}\n")
        sys.stdout.write(f"Segments applied: {res.segments_applied}\n")
        sys.stdout.write(f"Diagnostics: {len(res.diagnostics)}\n")
    return exit_code


def _cmd_report(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)
    if args.source == "last-build":
        last = project.build_history[-1] if project.build_history else None
        diagnostics = list((last or {}).get("diagnostics") or [])
        text = render_diagnostics_markdown(project, diagnostics)
    else:
        diagnostics = list(project.diagnostics)
        text = render_diagnostics_markdown(project)

    exit_code = _exit_code_for_diagnostics(diagnostics, warnings_as_errors=bool(args.warnings_as_errors))

    if args.json:
        payload: dict[str, object] = {
            "source": args.source,
            "diagnostics": list(diagnostics),
            "diagnostics_summary": summarize_diagnostics(diagnostics),
            "exit_code": exit_code,
        }
        if args.include_markdown:
            payload["report_markdown"] = text
        out = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
        if args.write:
            Path(args.write).write_text(out, encoding="utf-8")
        if (not args.write) or args.print_stdout:
            sys.stdout.write(out)
        return exit_code

    if args.write:
        Path(args.write).write_text(text, encoding="utf-8")
    if (not args.write) or args.print_stdout:
        sys.stdout.write(text)
    return exit_code


def _cmd_validate(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)

    diags = validate_project_segments(project.segments, glossary_entries=project.glossary, rules=project.validation)
    diagnostics = [d.to_dict() for d in diags]
    exit_code = _exit_code_for_diagnostics(diags, warnings_as_errors=bool(args.warnings_as_errors))
    payload = {
        "diagnostics": diagnostics,
        "diagnostics_summary": summarize_diagnostics(diagnostics),
        "count": len(diags),
        "exit_code": exit_code,
    }

    if args.update_project:
        keep = [d for d in (project.diagnostics or []) if str(d.get("category") or "") not in {"VALIDATION", "GLOSSARY"}]
        project.diagnostics = keep + payload["diagnostics"]
        if args.in_place:
            save_project(project, project_path)
        elif args.write:
            save_project(project, Path(args.write))

    if args.json:
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    else:
        sys.stdout.write(f"Diagnostics: {len(diags)}\n")
    return exit_code


def _cmd_export_csv(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)
    out = Path(args.out)
    export_segments_csv(project, out)
    if args.json:
        sys.stdout.write(json.dumps({"out": str(out), "segments": len(project.segments)}, indent=2) + "\n")
    return 0


def _cmd_glossary(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)

    if args.action == "export":
        if not args.out:
            raise SystemExit("--out is required for glossary export.")
        out = Path(args.out)
        export_glossary_csv(project, out)
        if args.json:
            sys.stdout.write(json.dumps({"out": str(out), "entries": len(project.glossary)}, indent=2) + "\n")
        return 0

    if args.action == "import":
        if not args.csv:
            raise SystemExit("--csv is required for glossary import.")
        res = import_glossary_csv(project, Path(args.csv), overwrite=(not args.no_overwrite))
        if args.in_place:
            save_project(project, project_path)
        elif args.write:
            save_project(project, Path(args.write))
        if args.json:
            sys.stdout.write(
                json.dumps(
                    {"added": res.added, "updated": res.updated, "skipped": res.skipped, "entries": len(project.glossary)},
                    indent=2,
                )
                + "\n"
            )
        else:
            sys.stdout.write(f"Glossary entries: {len(project.glossary)} (added={res.added}, updated={res.updated}, skipped={res.skipped})\n")
        return 0

    raise SystemExit(f"Unknown action: {args.action}")


def _cmd_plugins(args: argparse.Namespace) -> int:
    reg = plugins().load()
    payload = {
        "loaded": [{"name": p.name, "path": p.path} for p in reg.loaded],
        "extractors": sorted(reg.extractors.keys()),
        "appliers": sorted(reg.appliers.keys()),
        "validators": len(reg.validators),
        "diagnostics": [d.to_dict() for d in reg.diagnostics],
    }
    if args.json:
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    else:
        sys.stdout.write(f"Loaded plugins: {len(reg.loaded)}\n")
        for p in reg.loaded:
            sys.stdout.write(f"- {p.path}\n")
        sys.stdout.write(f"Extractors: {', '.join(sorted(reg.extractors.keys())) or '(none)'}\n")
        sys.stdout.write(f"Appliers: {', '.join(sorted(reg.appliers.keys())) or '(none)'}\n")
        sys.stdout.write(f"Validators: {len(reg.validators)}\n")
        sys.stdout.write(f"Diagnostics: {len(reg.diagnostics)}\n")
    return 0


def _cmd_sync(args: argparse.Namespace) -> int:
    root = Path(args.root).expanduser().resolve()
    if args.action in {"push", "status", "merge"}:
        if not args.project:
            raise SystemExit("--project is required for push/status/merge.")
        project_path = Path(args.project)
        local = load_project(project_path)
        if args.action == "push":
            diags = push(project=local, sync_root=root)
            local.diagnostics.extend([d.to_dict() for d in diags])
            if args.in_place:
                save_project(local, project_path)
            payload = {"action": "push", "project_uid": local.project_uid, "diagnostics": [d.to_dict() for d in diags]}
        elif args.action == "status":
            st = get_status(project=local, sync_root=root)
            payload = {
                "action": "status",
                "project_uid": local.project_uid,
                "state": st.state,
                "local_hash": st.local_hash,
                "remote_hash": st.remote_hash,
                "remote_path": str(st.remote_path) if st.remote_path else None,
                "base_remote_hash": local.sync_last_remote_hash,
            }
        else:  # merge
            if not args.project_uid or not args.write:
                raise SystemExit("--project-uid and --write are required for merge.")
            remote_proj, diags_pull = pull(project_uid=str(args.project_uid), sync_root=root)
            if remote_proj is None:
                sys.stdout.write(
                    json.dumps(
                        {"action": "merge", "project_uid": args.project_uid, "diagnostics": [d.to_dict() for d in diags_pull]},
                        indent=2,
                        ensure_ascii=False,
                    )
                    + "\n"
                )
                return 0
            m = merge_projects(local=local, remote=remote_proj)
            m.project.diagnostics.extend([d.to_dict() for d in diags_pull])
            m.project.diagnostics.extend([d.to_dict() for d in m.diagnostics])
            save_project(m.project, Path(args.write))
            payload = {
                "action": "merge",
                "project_uid": local.project_uid,
                "write": str(Path(args.write)),
                "conflicts": m.conflicts,
                "diagnostics": [d.to_dict() for d in (diags_pull + m.diagnostics)],
            }

        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return 0

    if args.action == "pull":
        if not args.project_uid or not args.write:
            raise SystemExit("--project-uid and --write are required for pull.")
        project, diags = pull(project_uid=str(args.project_uid), sync_root=root)
        payload = {"action": "pull", "project_uid": args.project_uid, "diagnostics": [d.to_dict() for d in diags]}
        if project is not None:
            out = Path(args.write)
            save_project(project, out)
            payload["write"] = str(out)
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return 0

    raise SystemExit("Unknown sync action.")


def _cmd_predict(args: argparse.Namespace) -> int:
    project = load_project(Path(args.project))
    seg_id = str(args.segment_id)
    seg = next((s for s in project.segments if str(s.get("id") or "") == seg_id), None)
    if not seg:
        raise SystemExit("Segment id not found in project.")
    partial = str(args.partial or "")
    src_text = str(seg.get("source") or "")
    limit = int(args.limit)
    min_tm_score = int(args.min_tm_score)

    preds: list[Prediction] = []

    try:
        project_path = Path(args.project)
        db_path = default_tm_db_path(project_path)
        if db_path.exists():
            src_loc = str(project.source_locale or "und").strip() or "und"
            tgt_loc = str(project.target_locale or "und").strip() or "und"
            store = SqliteTMStore(db_path=db_path)
            hits = store.suggest(source_locale=src_loc, target_locale=tgt_loc, source=src_text, limit=max(limit * 3, 10), min_score=min_tm_score)
            seen: set[str] = set()
            for h in hits:
                t = (h.target or "").strip()
                if not t or t in seen:
                    continue
                if partial and not t.lower().startswith(partial.strip().lower()):
                    continue
                seen.add(t)
                preds.append(Prediction(score=int(h.score), target=t, reason="tm_sqlite"))
                if len(preds) >= limit:
                    break
    except Exception:
        preds = []

    if len(preds) < limit:
        tm_entries = [{"source": str(s.get("source") or ""), "target": str(s.get("target") or ""), "id": str(s.get("id") or "")} for s in project.segments]
        preds = (preds + predict_targets(tm_entries, source=src_text, partial_target=partial, limit=limit, min_tm_score=min_tm_score))[:limit]
    payload = {"segment_id": seg_id, "predictions": [p.__dict__ for p in preds]}
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return 0


def _tm_pair_from_project(project: Project, args: argparse.Namespace) -> tuple[str, str]:
    src = str(getattr(args, "source_locale", "") or project.source_locale or "und").strip() or "und"
    tgt = str(getattr(args, "target_locale", "") or project.target_locale or "und").strip() or "und"
    return src, tgt


def _cmd_tm(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)
    src_loc, tgt_loc = _tm_pair_from_project(project, args)

    db_path = Path(args.db).expanduser() if getattr(args, "db", None) else default_tm_db_path(project_path)
    store = SqliteTMStore(db_path=db_path)

    if args.tm_action == "migrate":
        added = store.ingest_segments(project.segments, source_locale=src_loc, target_locale=tgt_loc)
        payload = {"action": "migrate", "db": str(db_path), "source_locale": src_loc, "target_locale": tgt_loc, "added": added}
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return 0

    if args.tm_action == "export":
        if not args.out:
            raise SystemExit("--out is required for tm export.")
        out_path = Path(args.out)
        fmt = str(args.format or "").strip().lower()
        if not fmt:
            fmt = "csv" if out_path.suffix.lower() == ".csv" else "json"
        if fmt == "csv":
            store.export_csv(out_path, source_locale=src_loc, target_locale=tgt_loc)
        elif fmt == "json":
            store.export_json(out_path, source_locale=src_loc, target_locale=tgt_loc)
        else:
            raise SystemExit("Unknown --format (use json or csv).")
        payload = {"action": "export", "db": str(db_path), "out": str(out_path), "format": fmt}
        if args.json:
            sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return 0

    if args.tm_action == "import":
        if not args.input:
            raise SystemExit("--in is required for tm import.")
        in_path = Path(args.input)
        fmt = str(args.format or "").strip().lower()
        if not fmt:
            fmt = "csv" if in_path.suffix.lower() == ".csv" else "json"
        if fmt == "csv":
            added = store.import_csv(in_path, source_locale=src_loc, target_locale=tgt_loc)
        elif fmt == "json":
            added = store.import_json(in_path, source_locale=src_loc, target_locale=tgt_loc)
        else:
            raise SystemExit("Unknown --format (use json or csv).")
        payload = {"action": "import", "db": str(db_path), "in": str(in_path), "format": fmt, "added": added}
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return 0

    if args.tm_action == "suggest":
        if not args.source:
            raise SystemExit("--source is required for tm suggest.")
        hits = store.suggest(source_locale=src_loc, target_locale=tgt_loc, source=str(args.source or ""), limit=int(args.limit), min_score=int(args.min_score))
        payload = {"action": "suggest", "db": str(db_path), "source": str(args.source or ""), "suggestions": [h.__dict__ for h in hits]}
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return 0

    if args.tm_action == "concordance":
        if not args.query:
            raise SystemExit("--query is required for tm concordance.")
        hits = store.concordance(
            source_locale=src_loc,
            target_locale=tgt_loc,
            query=str(args.query or ""),
            limit=int(args.limit),
            in_field=str(args.in_field or "both"),
        )
        payload = {"action": "concordance", "db": str(db_path), "query": str(args.query or ""), "hits": hits}
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return 0

    raise SystemExit("Unknown tm action.")


def _cmd_import_csv(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)
    res = import_segments_csv(
        project,
        Path(args.csv),
        overwrite_target=bool(args.overwrite_target),
        update_status=not bool(args.no_status),
        update_note=not bool(args.no_note),
    )
    if args.write:
        save_project(project, Path(args.write))
    if args.in_place:
        save_project(project, project_path)

    payload = {"updated_segments": res.updated_segments, "diagnostics": [d.to_dict() for d in res.diagnostics]}
    if args.json or (not args.write and not args.in_place):
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return 0


def _cmd_bulk(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)

    set_status = str(args.set_status or "").strip() or None
    scope = filter_segments(
        project.segments,
        query=str(getattr(args, "query", "") or ""),
        status=str(getattr(args, "status", "All") or "All"),
        file_path=(str(getattr(args, "file", "") or "").strip() or None),
    )
    if args.action == "propagate":
        res = propagate_targets_by_source_scoped(project.segments, scope=scope, overwrite=bool(args.overwrite), set_status=set_status)
    elif args.action == "apply-tm":
        used_sqlite = False
        if bool(getattr(args, "sqlite_tm", False)):
            try:
                db_path = Path(args.tm_db).expanduser() if getattr(args, "tm_db", None) else default_tm_db_path(project_path)
                store = SqliteTMStore(db_path=db_path)
                src_loc = str(project.source_locale or "und").strip() or "und"
                tgt_loc = str(project.target_locale or "und").strip() or "und"
                # Best-effort: ensure the TM has at least segment-derived entries.
                store.ingest_segments(project.segments, source_locale=src_loc, target_locale=tgt_loc)
                res = apply_best_sqlite_tm_to_empty_targets_scoped(
                    project.segments,
                    scope=scope,
                    tm_store=store,
                    source_locale=src_loc,
                    target_locale=tgt_loc,
                    min_score=int(args.min_score),
                    overwrite=bool(args.overwrite),
                    set_status=set_status,
                )
                used_sqlite = True
            except Exception:
                used_sqlite = False
        if not used_sqlite:
            res = apply_best_tm_to_empty_targets_scoped(
                project.segments,
                scope=scope,
                min_score=int(args.min_score),
                overwrite=bool(args.overwrite),
                set_status=set_status,
            )
    else:
        raise SystemExit("Unknown bulk action.")

    project.diagnostics.extend([d.to_dict() for d in res.diagnostics])

    if args.in_place:
        save_project(project, project_path)
    if args.write:
        save_project(project, Path(args.write))

    payload = {"updated_segments": res.updated_segments, "diagnostics": [d.to_dict() for d in res.diagnostics]}
    if args.json or (not args.in_place and not args.write):
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return 0


def _ts4rebels_client_from_args(args: argparse.Namespace) -> TS4RebelsClient:
    base = str(getattr(args, "base_url", "") or "").strip() or "https://ts4rebels.cc/"
    allowed = str(getattr(args, "allowed_hosts", "") or "").strip()
    hosts = tuple([h.strip() for h in allowed.split(",") if h.strip()]) or ("ts4rebels.cc",)
    return TS4RebelsClient(
        config=ClientConfig(
            base_url=base,
            enable_network=bool(args.enable_network),
            allowed_hosts=hosts,
            allow_insecure_http=bool(getattr(args, "allow_insecure_http", False)),
        )
    )


def _cmd_ts4rebels_login(args: argparse.Namespace) -> int:
    username = str(args.username or os.getenv("JPE_TS4REBELS_USER", "")).strip()
    password = str(args.password or os.getenv("JPE_TS4REBELS_PASS", ""))
    client = _ts4rebels_client_from_args(args)
    if not bool(getattr(args, "enable_network", False)):
        diags = [ts4di.network_disabled(message="Network is disabled. Pass --enable-network to use TS4Rebels commands.")]
        sys.stdout.write(json.dumps({"ok": False, "diagnostics": [d.to_dict() for d in diags]}, indent=2, ensure_ascii=False) + "\n")
        return _exit_code_for_diagnostics(diags, warnings_as_errors=bool(args.warnings_as_errors))
    diags = client.login(username=username, password=password)
    payload = {"ok": len(diags) == 0, "diagnostics": [d.to_dict() for d in diags]}
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return _exit_code_for_diagnostics(diags, warnings_as_errors=bool(args.warnings_as_errors))


def _cmd_ts4rebels_forum(args: argparse.Namespace) -> int:
    client = _ts4rebels_client_from_args(args)
    if not bool(getattr(args, "enable_network", False)):
        diags = [ts4di.network_disabled(message="Network is disabled. Pass --enable-network to use TS4Rebels commands.")]
        payload = {"topics": [], "diagnostics": [d.to_dict() for d in diags]}
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return _exit_code_for_diagnostics(diags, warnings_as_errors=bool(args.warnings_as_errors))
    topics, diags = client.list_forum_topics(forum_id=int(args.forum_id), page=int(args.page))
    payload = {"topics": [t.__dict__ for t in topics], "diagnostics": [d.to_dict() for d in diags]}
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return _exit_code_for_diagnostics(diags, warnings_as_errors=bool(args.warnings_as_errors))


def _cmd_ts4rebels_topic(args: argparse.Namespace) -> int:
    client = _ts4rebels_client_from_args(args)
    if not bool(getattr(args, "enable_network", False)):
        diags = [ts4di.network_disabled(message="Network is disabled. Pass --enable-network to use TS4Rebels commands.")]
        payload = {"posts": [], "diagnostics": [d.to_dict() for d in diags]}
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        return _exit_code_for_diagnostics(diags, warnings_as_errors=bool(args.warnings_as_errors))
    posts, diags = client.get_topic(topic_id=int(args.topic_id), page=int(args.page))
    payload = {
        "posts": [
            {
                "post_id": p.post_id,
                "author": p.author,
                "created_at": p.created_at,
                "links": [l.__dict__ for l in p.links],
            }
            for p in posts
        ],
        "diagnostics": [d.to_dict() for d in diags],
    }
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return _exit_code_for_diagnostics(diags, warnings_as_errors=bool(args.warnings_as_errors))


def _cmd_ts4rebels_download_import(args: argparse.Namespace) -> int:
    client = _ts4rebels_client_from_args(args)
    url = str(args.url or "").strip()
    if not url:
        raise SystemExit("url is required.")

    downloads_dir = Path(args.downloads_dir).expanduser()
    imports_root = Path(args.imports_root).expanduser()

    allowed_dl = str(getattr(args, "allowed_download_hosts", "") or "").strip()
    if not allowed_dl:
        allowed_dl = str(getattr(args, "allowed_hosts", "") or "").strip()
    dl_hosts = tuple([h.strip() for h in allowed_dl.split(",") if h.strip()]) or ("ts4rebels.cc",)
    limits = DownloadLimits(
        max_bytes=int(args.max_bytes),
        allowed_hosts=dl_hosts,
        allow_insecure_http=bool(getattr(args, "allow_insecure_http", False)),
    )

    res = download_and_import_zip(
        client=client,
        url=url,
        downloads_dir=downloads_dir,
        imports_root=imports_root,
        download_limits=limits,
    )

    payload = {
        "url": url,
        "downloaded_path": str(res.downloaded_path) if res.downloaded_path else None,
        "sha256": res.sha256,
        "import_dir": str(res.import_dir) if res.import_dir else None,
        "files_written": res.files_written,
        "bytes_written": res.bytes_written,
        "diagnostics": [d.to_dict() for d in res.diagnostics],
    }
    exit_code = _exit_code_for_diagnostics(res.diagnostics, warnings_as_errors=bool(args.warnings_as_errors))
    payload["exit_code"] = exit_code
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return exit_code


def _cmd_ts4rebels_preset_validation(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)
    res = apply_ts4rebels_validation_preset(project)

    if args.in_place:
        save_project(project, project_path)
    if args.write:
        save_project(project, Path(args.write))

    payload = {
        "project": str(project_path),
        "added_token_regexes": res.added_token_regexes,
        "token_regexes": res.token_regexes,
    }
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return 0


def _cmd_ts4rebels_harvest_samples(args: argparse.Namespace) -> int:
    sources = [Path(p) for p in (args.sources or [])]
    if not sources:
        raise SystemExit("--from is required.")
    dest = Path(args.dest).expanduser()
    res = harvest_ts4rebels_samples(
        sources=sources,
        dest_dir=dest,
        max_files=int(args.max_files),
        include_all_json_csv=bool(args.include_all_json_csv),
    )
    payload = {"dest": str(dest), **res.to_dict()}
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return 0


def _cmd_ts4rebels_analyze_samples(args: argparse.Namespace) -> int:
    root = Path(args.path).expanduser()
    analysis = analyze_samples_folder(root)
    payload = {"root": str(root), **analysis.to_dict()}
    sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    return 0


def _cmd_ts4rebels_import(args: argparse.Namespace) -> int:
    project_path = Path(args.project)
    project = load_project(project_path)

    pack = load_translation_pack(Path(args.input))
    updated = apply_translation_pack(
        project_segments=project.segments,
        translation_pairs=pack.pairs,
        overwrite_targets=bool(args.overwrite_targets),
    )
    if pack.diagnostics:
        project.diagnostics.extend([d.to_dict() for d in pack.diagnostics])

    if bool(args.import_glossary) and pack.glossary_entries:
        existing = {str(e.get("id") or "") for e in (project.glossary or [])}
        for e in pack.glossary_entries:
            eid = str(e.get("id") or "")
            if eid and eid not in existing:
                project.glossary.append(e)
                existing.add(eid)

    if args.in_place:
        save_project(project, project_path)
    if args.write:
        save_project(project, Path(args.write))

    payload = {
        "project": str(project_path),
        "input": str(Path(args.input)),
        "pairs": len(pack.pairs),
        "segments_updated": updated,
        "glossary_imported": bool(args.import_glossary),
        "diagnostics": [d.to_dict() for d in pack.diagnostics],
    }
    if args.json or (not args.in_place and not args.write):
        sys.stdout.write(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
    else:
        sys.stdout.write(f"Segments updated: {updated}\n")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="jpe-sims4")
    sub = parser.add_subparsers(dest="command", required=True)

    scan = sub.add_parser("scan", help="Scan a folder or zip and produce a project JSON.")
    scan.add_argument("path", help="Path to a mod folder or .zip.")
    scan.add_argument("--write", help="Write project JSON to a file path.")
    scan.add_argument("--merge-from", help="Previous project JSON to reuse file hashes from.")
    scan.add_argument("--json", action="store_true", help="Print project JSON to stdout.")
    scan.add_argument("--warnings-as-errors", action="store_true", help="Return a non-zero exit code if warnings exist.")
    scan.set_defaults(func=_cmd_scan)

    extract = sub.add_parser("extract", help="Scan + extract translation segments into a project JSON.")
    extract.add_argument("path", help="Path to a mod folder or .zip.")
    extract.add_argument("--write", help="Write project JSON to a file path.")
    extract.add_argument("--merge-from", help="Previous project JSON to merge targets/status/notes from.")
    extract.add_argument("--json", action="store_true", help="Print project JSON to stdout.")
    extract.add_argument(
        "--warnings-as-errors", action="store_true", help="Return a non-zero exit code if warnings exist."
    )
    extract.set_defaults(func=_cmd_extract)

    build = sub.add_parser("build", help="Apply translated targets from a project JSON and build an output folder/zip.")
    build.add_argument("project", help="Path to a project JSON with translated targets.")
    build.add_argument("--out-dir", help="Output directory to write a built mod folder.")
    build.add_argument("--out-zip", help="Output .zip path to write a built mod archive.")
    build.add_argument("--report", help="Write a Markdown diagnostics report.")
    build.add_argument("--json", action="store_true", help="Print a machine-readable build summary JSON.")
    build.add_argument("--warnings-as-errors", action="store_true", help="Return a non-zero exit code if warnings exist.")
    build.set_defaults(func=_cmd_build)

    report = sub.add_parser("report", help="Export a Markdown diagnostics report from a project JSON.")
    report.add_argument("project", help="Path to a project JSON.")
    report.add_argument("--source", choices=["project", "last-build"], default="project", help="Which diagnostics to render.")
    report.add_argument("--write", help="Write report to a file path (Markdown by default; JSON with --json).")
    report.add_argument("--json", action="store_true", help="Print a machine-readable JSON report (diagnostics + summary).")
    report.add_argument("--include-markdown", action="store_true", help="With --json, include a 'report_markdown' field.")
    report.add_argument(
        "--print-stdout",
        action="store_true",
        help="Also print to stdout even when --write is used (default: only print when --write is omitted).",
    )
    report.add_argument("--warnings-as-errors", action="store_true", help="Return a non-zero exit code if warnings exist.")
    report.set_defaults(func=_cmd_report)

    val = sub.add_parser("validate", help="Validate project segments (placeholders, glossary, and rule-based QA).")
    val.add_argument("project", help="Path to a project JSON.")
    val.add_argument("--json", action="store_true", help="Print machine-readable diagnostics JSON.")
    val.add_argument("--update-project", action="store_true", help="Write validation diagnostics into project.diagnostics.")
    val.add_argument("--in-place", action="store_true", help="Overwrite the input project JSON (with --update-project).")
    val.add_argument("--write", help="Write updated project JSON to a file path (with --update-project).")
    val.add_argument("--warnings-as-errors", action="store_true", help="Return a non-zero exit code if warnings exist.")
    val.set_defaults(func=_cmd_validate)

    export_csv = sub.add_parser("export-csv", help="Export project segments to a CSV for translation workflows.")
    export_csv.add_argument("project", help="Path to a project JSON.")
    export_csv.add_argument("--out", required=True, help="Output CSV file path.")
    export_csv.add_argument("--json", action="store_true", help="Print a machine-readable summary.")
    export_csv.set_defaults(func=_cmd_export_csv)

    glossary = sub.add_parser("glossary", help="Import/export glossary CSV for a project.")
    glossary.add_argument("project", help="Path to a project JSON.")
    glossary.add_argument("action", choices=["import", "export"])
    glossary.add_argument("--csv", help="Glossary CSV path to import (import only).")
    glossary.add_argument("--out", help="Output CSV path (export only).")
    glossary.add_argument("--write", help="Write updated project JSON to a file path (import only).")
    glossary.add_argument("--in-place", action="store_true", help="Overwrite the input project JSON (import only).")
    glossary.add_argument("--no-overwrite", action="store_true", help="Do not overwrite existing glossary entry ids (import only).")
    glossary.add_argument("--json", action="store_true", help="Print a machine-readable summary JSON.")
    glossary.set_defaults(func=_cmd_glossary)

    import_csv = sub.add_parser("import-csv", help="Import translations from a CSV back into a project JSON.")
    import_csv.add_argument("project", help="Path to a project JSON.")
    import_csv.add_argument("--csv", required=True, help="CSV file path exported from export-csv.")
    import_csv.add_argument("--write", help="Write updated project JSON to a file path.")
    import_csv.add_argument("--in-place", action="store_true", help="Overwrite the input project JSON.")
    import_csv.add_argument("--overwrite-target", action="store_true", help="Overwrite existing non-empty targets.")
    import_csv.add_argument("--no-status", action="store_true", help="Do not import status from CSV.")
    import_csv.add_argument("--no-note", action="store_true", help="Do not import note from CSV.")
    import_csv.add_argument("--json", action="store_true", help="Print a machine-readable summary JSON.")
    import_csv.set_defaults(func=_cmd_import_csv)

    bulk = sub.add_parser("bulk", help="Run bulk actions to speed up translation workflow.")
    bulk.add_argument("project", help="Path to a project JSON.")
    bulk.add_argument("action", choices=["propagate", "apply-tm"], help="Bulk action to run.")
    bulk.add_argument("--in-place", action="store_true", help="Overwrite the input project JSON.")
    bulk.add_argument("--write", help="Write updated project JSON to a file path.")
    bulk.add_argument("--overwrite", action="store_true", help="Overwrite existing non-empty targets.")
    bulk.add_argument("--set-status", default="in_progress", help="Set status for updated segments (or empty to skip).")
    bulk.add_argument("--min-score", default="95", help="TM min score (apply-tm only).")
    bulk.add_argument("--query", default="", help="Scope bulk action to segments matching search query.")
    bulk.add_argument("--status", default="All", help="Scope bulk action by status: All|new|in_progress|reviewed.")
    bulk.add_argument("--file", help="Scope bulk action to a specific file_path.")
    bulk.add_argument("--sqlite-tm", action="store_true", help="Use SQLite TM at <project>.tm.sqlite3 (best-effort).")
    bulk.add_argument("--tm-db", help="Override SQLite TM db path (with --sqlite-tm).")
    bulk.add_argument("--json", action="store_true", help="Print a machine-readable summary JSON.")
    bulk.set_defaults(func=_cmd_bulk)

    p = sub.add_parser("plugins", help="List loaded plugins and their capabilities.")
    p.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    p.set_defaults(func=_cmd_plugins)

    sync = sub.add_parser("sync", help="Filesystem-backed sync (simulated cloud): push/pull/status/merge.")
    sync.add_argument("--root", required=True, help="Sync root folder (shared drive / cloud folder).")
    sync.add_argument("action", choices=["push", "pull", "status", "merge"])
    sync.add_argument("--project", help="Project JSON path (push/status/merge).")
    sync.add_argument("--in-place", action="store_true", help="Overwrite input project JSON when pushing.")
    sync.add_argument("--project-uid", dest="project_uid", help="Project UID (pull/merge).")
    sync.add_argument("--write", help="Output project JSON path (pull/merge).")
    sync.set_defaults(func=_cmd_sync)

    pred = sub.add_parser("predict", help="Generate predictive target suggestions for a segment (local TM-based).")
    pred.add_argument("project", help="Path to a project JSON.")
    pred.add_argument("--segment-id", required=True, help="Segment id.")
    pred.add_argument("--partial", help="Partial target text to bias suggestions.")
    pred.add_argument("--limit", default="5", help="Max suggestions.")
    pred.add_argument("--min-tm-score", default="70", help="Minimum TM match score.")
    pred.set_defaults(func=_cmd_predict)

    tm = sub.add_parser("tm", help="SQLite-backed translation memory (TM): migrate/import/export/suggest/concordance.")
    tm.add_argument("project", help="Path to a project JSON (used to pick default TM db and locales).")
    tm.add_argument("tm_action", choices=["migrate", "import", "export", "suggest", "concordance"])
    tm.add_argument("--db", help="TM sqlite path (default: <project>.tm.sqlite3).")
    tm.add_argument("--source-locale", help="Override project source locale (default: project.source_locale or und).")
    tm.add_argument("--target-locale", help="Override project target locale (default: project.target_locale or und).")
    tm.add_argument("--json", action="store_true", help="Print machine-readable JSON (export only).")
    tm.add_argument("--format", choices=["json", "csv"], help="Import/export format (default: infer from extension).")
    tm.add_argument("--out", help="Output path (export only).")
    tm.add_argument("--in", dest="input", help="Input path (import only).")
    tm.add_argument("--source", help="Source text (suggest only).")
    tm.add_argument("--query", help="Query text (concordance only).")
    tm.add_argument("--in-field", default="both", help="Concordance field: source|target|both.")
    tm.add_argument("--limit", default="5", help="Max suggestions/hits.")
    tm.add_argument("--min-score", default="70", help="Min fuzzy score (suggest only).")
    tm.set_defaults(func=_cmd_tm)

    ts4 = sub.add_parser("ts4rebels", help="TS4Rebels.cc browser helpers (network).")
    ts4.add_argument("--base-url", default="https://ts4rebels.cc/", help="Base URL (default: https://ts4rebels.cc/).")
    ts4.add_argument("--enable-network", action="store_true", help="Required to perform network requests.")
    ts4.add_argument("--allowed-hosts", default="ts4rebels.cc", help="Comma-separated allowlisted hosts for base-url (default: ts4rebels.cc).")
    ts4.add_argument(
        "--allowed-download-hosts",
        default="ts4rebels.cc",
        help="Comma-separated allowlisted download hosts (default: ts4rebels.cc).",
    )
    ts4.add_argument(
        "--allow-insecure-http",
        action="store_true",
        help="Allow http:// base-url and downloads (intended for local testing only).",
    )
    ts4.add_argument("--warnings-as-errors", action="store_true", help="Return a non-zero exit code if warnings exist.")
    ts4sub = ts4.add_subparsers(dest="ts4_command", required=True)

    ts4login = ts4sub.add_parser("login", help="Test login (reads env JPE_TS4REBELS_USER/PASS if args omitted).")
    ts4login.add_argument("--username", help="Username (prefer env var to avoid shell history).")
    ts4login.add_argument("--password", help="Password (prefer env var to avoid shell history).")
    ts4login.set_defaults(func=_cmd_ts4rebels_login)

    ts4forum = ts4sub.add_parser("forum", help="List topics from a forum id (best-effort HTML parsing).")
    ts4forum.add_argument("forum_id", help="Forum id (e.g., 59 for File Donations).")
    ts4forum.add_argument("--page", default="1", help="Page number.")
    ts4forum.set_defaults(func=_cmd_ts4rebels_forum)

    ts4topic = ts4sub.add_parser("topic", help="Fetch a topic and extract links (best-effort HTML parsing).")
    ts4topic.add_argument("topic_id", help="Topic id.")
    ts4topic.add_argument("--page", default="1", help="Page number.")
    ts4topic.set_defaults(func=_cmd_ts4rebels_topic)

    ts4dl = ts4sub.add_parser("download-import", help="Download a .zip from a link and safely import it to a local folder.")
    ts4dl.add_argument("url", help="Direct download URL to a .zip (host must be allowlisted).")
    ts4dl.add_argument(
        "--downloads-dir",
        default=str(Path.home() / ".jpe_studio" / "ts4rebels" / "downloads"),
        help="Where to store downloaded archives (default: ~/.jpe_studio/ts4rebels/downloads).",
    )
    ts4dl.add_argument(
        "--imports-root",
        default=str(Path.home() / ".jpe_studio" / "ts4rebels" / "imports"),
        help="Where to extract imported mods (default: ~/.jpe_studio/ts4rebels/imports).",
    )
    ts4dl.add_argument("--max-bytes", default=str(500_000_000), help="Max download size in bytes.")
    ts4dl.set_defaults(func=_cmd_ts4rebels_download_import)

    ts4preset = ts4sub.add_parser("preset-validation", help="Apply TS4Rebels token validation presets to a project JSON.")
    ts4preset.add_argument("--project", required=True, help="Path to a project JSON.")
    ts4preset.add_argument("--in-place", action="store_true", help="Save changes back to --project.")
    ts4preset.add_argument("--write", help="Write updated project JSON to a new path.")
    ts4preset.set_defaults(func=_cmd_ts4rebels_preset_validation)

    ts4harvest = ts4sub.add_parser("harvest-samples", help="Copy TS4Rebels JSON/CSV files from local mods into a sample folder.")
    ts4harvest.add_argument(
        "--from",
        dest="sources",
        action="append",
        required=True,
        help="Source folder to scan (repeatable). Example: ~/.jpe_studio/ts4rebels/imports",
    )
    ts4harvest.add_argument(
        "--to",
        dest="dest",
        default="tests/fixtures/ts4rebels_real",
        help="Destination folder for harvested samples (default: tests/fixtures/ts4rebels_real).",
    )
    ts4harvest.add_argument("--max-files", default="35", help="Maximum number of unique files to copy.")
    ts4harvest.add_argument(
        "--include-all-json-csv",
        action="store_true",
        help="Also copy non-ts4rebels-named .json/.csv files (broader, potentially noisy).",
    )
    ts4harvest.set_defaults(func=_cmd_ts4rebels_harvest_samples)

    ts4an = ts4sub.add_parser("analyze-samples", help="Analyze a local TS4Rebels sample folder for tokens/placeholders.")
    ts4an.add_argument(
        "path",
        nargs="?",
        default="tests/fixtures/ts4rebels_real",
        help="Samples folder (default: tests/fixtures/ts4rebels_real).",
    )
    ts4an.set_defaults(func=_cmd_ts4rebels_analyze_samples)

    ts4imp = sub.add_parser("ts4rebels-import", help="Import a TS4Rebels translation pack (CSV/JSON) into a project.")
    ts4imp.add_argument("--project", required=True, help="Path to project JSON.")
    ts4imp.add_argument("--in", dest="input", required=True, help="Translation pack path (.csv/.json).")
    ts4imp.add_argument("--overwrite-targets", action="store_true", help="Overwrite non-empty targets (default: off).")
    ts4imp.add_argument("--import-glossary", action="store_true", help="Import glossary terms if present in the pack.")
    ts4imp.add_argument("--in-place", action="store_true", help="Save changes back to --project.")
    ts4imp.add_argument("--write", help="Write updated project JSON to a new path.")
    ts4imp.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    ts4imp.set_defaults(func=_cmd_ts4rebels_import)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
