from __future__ import annotations

import csv
import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from jpe_sims4.tm import Suggestion, _ratio


def default_tm_db_path(project_json_path: Path) -> Path:
    project_json_path = project_json_path.expanduser().resolve()
    stem = project_json_path.name
    if stem.lower().endswith(".json"):
        stem = stem[: -len(".json")]
    return project_json_path.with_name(f"{stem}.tm.sqlite3")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _norm(s: str) -> str:
    return " ".join((s or "").strip().lower().split())


def _tokens_for_prefilter(s: str) -> list[str]:
    parts: list[str] = []
    for raw in _norm(s).replace("_", " ").replace("-", " ").split():
        t = "".join(ch for ch in raw if ch.isalnum())
        if len(t) >= 3:
            parts.append(t)
    out: list[str] = []
    for t in parts:
        if t not in out:
            out.append(t)
    return out[:5]


@dataclass(frozen=True)
class TMRow:
    source_locale: str
    target_locale: str
    source: str
    target: str
    segment_id: str | None = None


class SqliteTMStore:
    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path.expanduser().resolve()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._ensure_schema()

    def _connect(self) -> sqlite3.Connection:
        con = sqlite3.connect(str(self.db_path))
        con.row_factory = sqlite3.Row
        con.execute("PRAGMA journal_mode=WAL;")
        con.execute("PRAGMA synchronous=NORMAL;")
        return con

    def _ensure_schema(self) -> None:
        with self._connect() as con:
            con.execute(
                """
                CREATE TABLE IF NOT EXISTS tm_entries (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  source_locale TEXT NOT NULL,
                  target_locale TEXT NOT NULL,
                  source TEXT NOT NULL,
                  target TEXT NOT NULL,
                  source_norm TEXT NOT NULL,
                  target_norm TEXT NOT NULL,
                  segment_id TEXT,
                  created_at TEXT NOT NULL,
                  updated_at TEXT NOT NULL,
                  use_count INTEGER NOT NULL DEFAULT 0,
                  last_used_at TEXT
                );
                """
            )
            con.execute(
                """
                CREATE UNIQUE INDEX IF NOT EXISTS ux_tm_pair_source_target
                ON tm_entries(source_locale, target_locale, source, target);
                """
            )
            con.execute(
                """
                CREATE INDEX IF NOT EXISTS ix_tm_pair_source_norm
                ON tm_entries(source_locale, target_locale, source_norm);
                """
            )
            con.execute(
                """
                CREATE INDEX IF NOT EXISTS ix_tm_pair_target_norm
                ON tm_entries(source_locale, target_locale, target_norm);
                """
            )

    def add(self, row: TMRow, *, now_iso: str | None = None) -> bool:
        src = (row.source or "").strip()
        tgt = (row.target or "").strip()
        if not src or not tgt:
            return False
        n = now_iso or _now_iso()
        with self._connect() as con:
            cur = con.execute(
                """
                INSERT OR IGNORE INTO tm_entries(
                  source_locale, target_locale, source, target,
                  source_norm, target_norm, segment_id,
                  created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                """,
                (
                    row.source_locale,
                    row.target_locale,
                    src,
                    tgt,
                    _norm(src),
                    _norm(tgt),
                    row.segment_id,
                    n,
                    n,
                ),
            )
            return bool(cur.rowcount)

    def add_many(self, rows: list[TMRow], *, now_iso: str | None = None) -> int:
        n = now_iso or _now_iso()
        added = 0
        with self._connect() as con:
            con.execute("BEGIN;")
            for r in rows:
                src = (r.source or "").strip()
                tgt = (r.target or "").strip()
                if not src or not tgt:
                    continue
                cur = con.execute(
                    """
                    INSERT OR IGNORE INTO tm_entries(
                      source_locale, target_locale, source, target,
                      source_norm, target_norm, segment_id,
                      created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                    """,
                    (
                        r.source_locale,
                        r.target_locale,
                        src,
                        tgt,
                        _norm(src),
                        _norm(tgt),
                        r.segment_id,
                        n,
                        n,
                    ),
                )
                if cur.rowcount:
                    added += 1
            con.execute("COMMIT;")
        return added

    def ingest_segments(
        self,
        segments: list[dict[str, object]],
        *,
        source_locale: str,
        target_locale: str,
        now_iso: str | None = None,
    ) -> int:
        rows: list[TMRow] = []
        seen: set[tuple[str, str]] = set()
        for s in segments:
            src = str(s.get("source") or "").strip()
            tgt = str(s.get("target") or "").strip()
            if not src or not tgt:
                continue
            key = (src, tgt)
            if key in seen:
                continue
            seen.add(key)
            rows.append(TMRow(source_locale=source_locale, target_locale=target_locale, source=src, target=tgt, segment_id=str(s.get("id") or "") or None))
        return self.add_many(rows, now_iso=now_iso)

    def suggest(
        self,
        *,
        source_locale: str,
        target_locale: str,
        source: str,
        limit: int = 5,
        min_score: int = 70,
    ) -> list[Suggestion]:
        src = (source or "").strip()
        if not src:
            return []

        exact = self._exact(
            source_locale=source_locale,
            target_locale=target_locale,
            source=src,
            limit=limit,
        )
        if exact:
            return exact

        candidates = self._prefilter_candidates(
            source_locale=source_locale,
            target_locale=target_locale,
            source=src,
            limit=max(limit * 100, 200),
        )
        scored: list[Suggestion] = []
        for row in candidates:
            s = str(row["source"])
            score = _ratio(s, src)
            if score < min_score:
                continue
            scored.append(
                Suggestion(
                    score=int(score),
                    source=s,
                    target=str(row["target"]),
                    segment_id=(str(row["segment_id"]) if row["segment_id"] is not None else None),
                )
            )
        scored.sort(key=lambda x: (x.score, len(x.source), x.target), reverse=True)
        return scored[:limit]

    def _exact(self, *, source_locale: str, target_locale: str, source: str, limit: int) -> list[Suggestion]:
        with self._connect() as con:
            rows = con.execute(
                """
                SELECT source, target, segment_id
                FROM tm_entries
                WHERE source_locale = ? AND target_locale = ? AND source = ?
                ORDER BY target ASC, id ASC
                LIMIT ?;
                """,
                (source_locale, target_locale, source, int(limit)),
            ).fetchall()

        if not rows:
            return []
        return [
            Suggestion(
                score=100,
                source=str(r["source"]),
                target=str(r["target"]),
                segment_id=(str(r["segment_id"]) if r["segment_id"] is not None else None),
            )
            for r in rows
        ]

    def _prefilter_candidates(
        self,
        *,
        source_locale: str,
        target_locale: str,
        source: str,
        limit: int,
    ) -> list[sqlite3.Row]:
        tokens = _tokens_for_prefilter(source)
        if not tokens:
            # Fall back to a bounded scan for very short queries.
            with self._connect() as con:
                return con.execute(
                    """
                    SELECT source, target, segment_id
                    FROM tm_entries
                    WHERE source_locale = ? AND target_locale = ?
                    ORDER BY id DESC
                    LIMIT ?;
                    """,
                    (source_locale, target_locale, int(limit)),
                ).fetchall()

        clauses = " OR ".join(["source_norm LIKE ?"] * len(tokens))
        params: list[object] = [source_locale, target_locale]
        params.extend([f"%{t}%" for t in tokens])
        params.append(int(limit))
        with self._connect() as con:
            return con.execute(
                f"""
                SELECT source, target, segment_id
                FROM tm_entries
                WHERE source_locale = ? AND target_locale = ? AND ({clauses})
                ORDER BY id DESC
                LIMIT ?;
                """,
                tuple(params),
            ).fetchall()

    def concordance(
        self,
        *,
        source_locale: str,
        target_locale: str,
        query: str,
        limit: int = 25,
        in_field: str = "both",
    ) -> list[dict[str, object]]:
        q = (query or "").strip()
        if not q:
            return []
        field = (in_field or "both").strip().lower()
        if field not in {"source", "target", "both"}:
            field = "both"
        nq = f"%{_norm(q)}%"

        out: list[dict[str, object]] = []
        with self._connect() as con:
            if field in {"source", "both"}:
                rows = con.execute(
                    """
                    SELECT source, target, segment_id
                    FROM tm_entries
                    WHERE source_locale = ? AND target_locale = ? AND source_norm LIKE ?
                    ORDER BY id DESC
                    LIMIT ?;
                    """,
                    (source_locale, target_locale, nq, int(limit)),
                ).fetchall()
                for r in rows:
                    out.append({"field": "source", "source": str(r["source"]), "target": str(r["target"]), "id": r["segment_id"]})
                    if len(out) >= limit:
                        return out
            if field in {"target", "both"}:
                rows = con.execute(
                    """
                    SELECT source, target, segment_id
                    FROM tm_entries
                    WHERE source_locale = ? AND target_locale = ? AND target_norm LIKE ?
                    ORDER BY id DESC
                    LIMIT ?;
                    """,
                    (source_locale, target_locale, nq, int(limit)),
                ).fetchall()
                for r in rows:
                    out.append({"field": "target", "source": str(r["source"]), "target": str(r["target"]), "id": r["segment_id"]})
                    if len(out) >= limit:
                        return out
        return out[:limit]

    def export_json(
        self,
        out_path: Path,
        *,
        source_locale: str,
        target_locale: str,
    ) -> None:
        out_path = out_path.expanduser().resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as con:
            rows = con.execute(
                """
                SELECT source_locale, target_locale, source, target, segment_id
                FROM tm_entries
                WHERE source_locale = ? AND target_locale = ?
                ORDER BY id ASC;
                """,
                (source_locale, target_locale),
            ).fetchall()
        payload = {"version": 1, "entries": [dict(r) for r in rows]}
        out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    def import_json(
        self,
        json_path: Path,
        *,
        source_locale: str,
        target_locale: str,
    ) -> int:
        json_path = json_path.expanduser().resolve()
        payload = json.loads(json_path.read_text(encoding="utf-8"))
        entries = payload.get("entries") if isinstance(payload, dict) else payload
        if not isinstance(entries, list):
            return 0
        rows: list[TMRow] = []
        for e in entries:
            if not isinstance(e, dict):
                continue
            rows.append(
                TMRow(
                    source_locale=str(e.get("source_locale") or source_locale),
                    target_locale=str(e.get("target_locale") or target_locale),
                    source=str(e.get("source") or ""),
                    target=str(e.get("target") or ""),
                    segment_id=(str(e.get("segment_id") or "") or None),
                )
            )
        return self.add_many(rows)

    def export_csv(
        self,
        out_path: Path,
        *,
        source_locale: str,
        target_locale: str,
    ) -> None:
        out_path = out_path.expanduser().resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as con:
            rows = con.execute(
                """
                SELECT source_locale, target_locale, source, target, segment_id
                FROM tm_entries
                WHERE source_locale = ? AND target_locale = ?
                ORDER BY id ASC;
                """,
                (source_locale, target_locale),
            ).fetchall()

        fieldnames = ["source_locale", "target_locale", "source", "target", "segment_id"]
        with out_path.open("w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            for r in rows:
                w.writerow(dict(r))

    def import_csv(
        self,
        csv_path: Path,
        *,
        source_locale: str,
        target_locale: str,
    ) -> int:
        csv_path = csv_path.expanduser().resolve()
        rows: list[TMRow] = []
        with csv_path.open("r", encoding="utf-8", newline="") as f:
            r = csv.DictReader(f)
            for row in r:
                rows.append(
                    TMRow(
                        source_locale=str(row.get("source_locale") or source_locale),
                        target_locale=str(row.get("target_locale") or target_locale),
                        source=str(row.get("source") or ""),
                        target=str(row.get("target") or ""),
                        segment_id=(str(row.get("segment_id") or "") or None),
                    )
                )
        return self.add_many(rows)
