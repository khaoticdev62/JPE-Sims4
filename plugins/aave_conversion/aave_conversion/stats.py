from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .registry import LexiconRegistry


@dataclass(frozen=True)
class Stats:
    entries: int
    canonicals: int
    aliases: int
    registers: list[str]
    domains: dict[str, int]

    def to_dict(self) -> dict[str, Any]:
        return {
            "entries": self.entries,
            "canonicals": self.canonicals,
            "aliases": self.aliases,
            "registers": self.registers,
            "domains": self.domains,
        }


def compute_stats(registry: LexiconRegistry) -> Stats:
    domains: dict[str, int] = {}
    alias_count = 0
    regs: set[str] = set()
    for e in registry.entries:
        for d in e.domains:
            domains[d] = domains.get(d, 0) + 1
        for reg, alist in e.aliases.items():
            regs.add(reg)
            alias_count += len(alist)
    return Stats(
        entries=len(registry.entries),
        canonicals=len({e.canonical for e in registry.entries}),
        aliases=alias_count,
        registers=sorted(regs),
        domains=dict(sorted(domains.items(), key=lambda kv: kv[0])),
    )
