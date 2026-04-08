from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml

from .diagnostics import Diagnostic, DiagSeverity
from .rules import RewriteRule


@dataclass(frozen=True)
class LexEntry:
    canonical: str
    token_type: str
    domains: list[str]
    aliases: dict[str, list[str]]  # register -> list of aliases
    reversible_key: str
    locked: bool = False
    popularity: float = 0.5
    notes: list[str] | None = None
    examples: list[dict[str, str]] | None = None
    safety_blocked: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "canonical": self.canonical,
            "token_type": self.token_type,
            "domains": self.domains,
            "aliases": self.aliases,
            "reversible_key": self.reversible_key,
            "locked": self.locked,
            "popularity": self.popularity,
            "notes": self.notes or [],
            "examples": self.examples or [],
            "safety": {"blocked": self.safety_blocked},
        }


@dataclass(frozen=True)
class LexPack:
    version: int
    pack_id: str
    language: str
    registers: list[str]
    entries: list[LexEntry]
    rules: list[RewriteRule]


def load_pack(path: Path) -> tuple[LexPack | None, list[Diagnostic]]:
    diags: list[Diagnostic] = []
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    except Exception as e:
        return None, [Diagnostic("AAVEPACK000", DiagSeverity.ERROR, f"Failed to read YAML: {e}")]

    if not isinstance(raw, dict):
        return None, [
            Diagnostic("AAVEPACK001", DiagSeverity.ERROR, "Pack YAML must be a mapping/object.")
        ]

    required = ["version", "pack_id", "language", "registers", "entries"]
    for k in required:
        if k not in raw:
            diags.append(
                Diagnostic("AAVEPACK002", DiagSeverity.ERROR, f"Missing required key: {k}")
            )

    if diags:
        return None, diags

    entries: list[LexEntry] = []
    seen_keys: set[str] = set()
    for i, ent in enumerate(raw.get("entries", [])):
        if not isinstance(ent, dict):
            diags.append(
                Diagnostic("AAVEPACK010", DiagSeverity.ERROR, f"Entry {i} must be an object.")
            )
            continue

        canonical = str(ent.get("canonical", "")).strip()
        if not canonical:
            diags.append(
                Diagnostic("AAVEPACK011", DiagSeverity.ERROR, f"Entry {i} missing canonical.")
            )
            continue

        token_type = str(ent.get("token_type", "term")).strip() or "term"
        domains = ent.get("domains") or ["generic"]
        if not isinstance(domains, list) or not all(isinstance(d, str) for d in domains):
            diags.append(
                Diagnostic(
                    "AAVEPACK012", DiagSeverity.ERROR, f"Entry {i} domains must be list[str]."
                )
            )
            continue

        aliases = ent.get("aliases") or {}
        if not isinstance(aliases, dict):
            diags.append(
                Diagnostic("AAVEPACK013", DiagSeverity.ERROR, f"Entry {i} aliases must be object.")
            )
            continue

        # Normalize alias lists
        aliases_norm: dict[str, list[str]] = {}
        for reg, vals in aliases.items():
            if isinstance(vals, str):
                aliases_norm[str(reg)] = [vals]
            elif isinstance(vals, list) and all(isinstance(v, str) for v in vals):
                aliases_norm[str(reg)] = [v.strip() for v in vals if v.strip()]
            else:
                diags.append(
                    Diagnostic(
                        "AAVEPACK014", DiagSeverity.ERROR, f"Entry {i} aliases[{reg}] invalid."
                    )
                )

        reversible_key = str(ent.get("reversible_key", "")).strip()
        if not reversible_key:
            reversible_key = f"{canonical}::{token_type}"

        if reversible_key in seen_keys:
            diags.append(
                Diagnostic(
                    "AAVEPACK020",
                    DiagSeverity.ERROR,
                    f"Duplicate reversible_key: {reversible_key}",
                    metadata={"entry_index": i},
                )
            )
            continue
        seen_keys.add(reversible_key)

        locked = bool(ent.get("locked", False))
        popularity = float(ent.get("popularity", 0.5))
        notes = ent.get("notes") or []
        if not isinstance(notes, list):
            notes = [str(notes)]
        examples = ent.get("examples") or []
        if not isinstance(examples, list):
            examples = []
        safety = ent.get("safety") or {}
        safety_blocked = bool(safety.get("blocked", False))

        entries.append(
            LexEntry(
                canonical=canonical,
                token_type=token_type,
                domains=[d.strip() for d in domains if d.strip()],
                aliases=aliases_norm,
                reversible_key=reversible_key,
                locked=locked,
                popularity=max(0.0, min(popularity, 1.0)),
                notes=[str(n) for n in notes if str(n).strip()] or None,
                examples=examples if examples else None,
                safety_blocked=safety_blocked,
            )
        )

    rules: list[RewriteRule] = []
    for i, r in enumerate(raw.get("rules", [])):
        if not isinstance(r, dict):
            diags.append(
                Diagnostic("AAVEPACK030", DiagSeverity.ERROR, f"Rule {i} must be an object.")
            )
            continue
        pattern = str(r.get("pattern", "")).strip()
        replacement = str(r.get("replacement", "")).strip()
        if not pattern or not replacement:
            diags.append(
                Diagnostic(
                    "AAVEPACK031", DiagSeverity.ERROR, f"Rule {i} missing pattern or replacement."
                )
            )
            continue
        rules.append(
            RewriteRule(
                pattern=pattern,
                replacement=replacement,
                domain=str(r.get("domain", "generic")).strip(),
                priority=int(r.get("priority", 0)),
                id=r.get("id"),
            )
        )

    pack = LexPack(
        version=int(raw["version"]),
        pack_id=str(raw["pack_id"]),
        language=str(raw["language"]),
        registers=[str(r) for r in raw.get("registers", [])],
        entries=entries,
        rules=rules,
    )
    return pack, diags


def save_pack(pack: LexPack, path: Path) -> None:
    """Save a LexPack to a YAML file."""
    data = {
        "version": pack.version,
        "pack_id": pack.pack_id,
        "language": pack.language,
        "registers": pack.registers,
        "entries": [e.to_dict() for e in pack.entries],
        "rules": [
            {
                "pattern": r.pattern,
                "replacement": r.replacement,
                "domain": r.domain,
                "priority": r.priority,
                "id": r.id,
            }
            for r in pack.rules
        ],
    }
    path.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")
