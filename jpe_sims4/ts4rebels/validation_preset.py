from __future__ import annotations

from dataclasses import dataclass

from jpe_sims4.project import Project


@dataclass(frozen=True)
class ApplyPresetResult:
    added_token_regexes: int
    token_regexes: list[str]


_DEFAULT_TOKEN_REGEXES: list[str] = [
    # phpBB / TS4Rebels posts frequently contain ABBC3 / BBCode.
    r"\[/?[a-zA-Z]{1,20}(?:=[^\]\n]{0,200})?\]",
    # Common :emoji: token style used in posts and some metadata fields.
    r":[a-z0-9_+\-]{2,40}:",
]


def apply_ts4rebels_validation_preset(project: Project) -> ApplyPresetResult:
    rules = dict(project.validation or {})
    # Support both legacy flat config (token_regexes at root) and new rule-registry config:
    # rules = {"rules": {"token_regexes": {"token_regexes": [...]}}}
    nested = rules.get("rules") if isinstance(rules.get("rules"), dict) else None
    if isinstance(nested, dict) and isinstance(nested.get("token_regexes"), dict):
        existing = dict(nested.get("token_regexes") or {}).get("token_regexes") or []
    else:
        existing = rules.get("token_regexes") or []
    if isinstance(existing, str):
        existing_list = [line.strip() for line in existing.splitlines() if line.strip()]
    elif isinstance(existing, list):
        existing_list = [str(x) for x in existing if str(x).strip()]
    else:
        existing_list = []

    added = 0
    for rex in _DEFAULT_TOKEN_REGEXES:
        if rex not in existing_list:
            existing_list.append(rex)
            added += 1

    if isinstance(nested, dict) and isinstance(nested.get("token_regexes"), dict):
        nested = dict(nested)
        nested["token_regexes"] = dict(nested.get("token_regexes") or {})
        nested["token_regexes"]["token_regexes"] = existing_list
        rules["rules"] = nested
    else:
        rules["token_regexes"] = existing_list
    project.validation = rules
    return ApplyPresetResult(added_token_regexes=added, token_regexes=existing_list)
