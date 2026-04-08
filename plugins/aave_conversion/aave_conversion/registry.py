from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Iterable, Optional

import yaml

from .diagnostics import Diagnostic, DiagSeverity, Span
from .pack import LexEntry, LexPack, load_pack
from .rules import RuleEngine
from .tokenize import tokenize, Tok


def _default_dictionary_dir() -> Path:
    return Path(__file__).resolve().parent / "dictionary"


def _load_blocked_terms(path: Path) -> set[str]:
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8")) or []
    except Exception:
        return set()
    if isinstance(raw, dict):
        raw = raw.get("blocked", [])
    if not isinstance(raw, list):
        return set()
    return {str(x).strip().lower() for x in raw if str(x).strip()}


@dataclass(frozen=True)
class Match:
    entry: LexEntry
    start_tok: int
    end_tok: int  # exclusive
    start_char: int
    end_char: int
    matched_text: str
    is_alias: bool  # True if matched via alias; False if canonical

    def to_dict(self) -> dict[str, Any]:
        return {
            "canonical": self.entry.canonical,
            "token_type": self.entry.token_type,
            "domains": self.entry.domains,
            "reversible_key": self.entry.reversible_key,
            "span": {"start": self.start_char, "end": self.end_char},
            "matched_text": self.matched_text,
            "is_alias": self.is_alias,
        }


class PhraseTrie:
    def __init__(self) -> None:
        self.children: dict[str, "PhraseTrie"] = {}
        self.payloads: list[LexEntry] = []  # multiple entries can share phrase -> ambiguity

    def add(self, phrase_tokens: list[str], entry: LexEntry) -> None:
        node = self
        for t in phrase_tokens:
            node = node.children.setdefault(t, PhraseTrie())
        node.payloads.append(entry)

    def longest_match(self, tokens: list[str], i: int) -> tuple[int, list[LexEntry]]:
        node = self
        best_len = 0
        best_payloads: list[LexEntry] = []
        j = i
        while j < len(tokens):
            t = tokens[j]
            nxt = node.children.get(t)
            if nxt is None:
                break
            node = nxt
            j += 1
            if node.payloads:
                best_len = j - i
                best_payloads = node.payloads
        return best_len, best_payloads


@dataclass
class LexiconRegistry:
    packs: list[LexPack]
    entries: list[LexEntry]
    blocked_terms: set[str]

    alias_trie: PhraseTrie
    canonical_trie: PhraseTrie
    rule_engine: RuleEngine

    # O(1) Flat indexes for exact phrase lookups (PIS Section 3)
    alias_index: dict[str, list[LexEntry]]
    canonical_index: dict[str, LexEntry]

    @classmethod
    def default(cls) -> "LexiconRegistry":
        d = _default_dictionary_dir()
        return cls.from_directory(d)

    @classmethod
    def from_directory(cls, d: Path) -> "LexiconRegistry":
        packs: list[LexPack] = []
        entries: list[LexEntry] = []
        diags: list[Diagnostic] = []
        for p in sorted(d.glob("*.pack.yaml")):
            pack, pack_diags = load_pack(p)
            diags.extend(pack_diags)
            if pack is not None:
                packs.append(pack)
                entries.extend(pack.entries)

        # Build tries and flat indexes
        alias_trie = PhraseTrie()
        canonical_trie = PhraseTrie()
        alias_index: dict[str, list[LexEntry]] = {}
        canonical_index: dict[str, LexEntry] = {}

        for e in entries:
            # canonical phrase tokens
            canon_tokens = _phrase_tokens(e.canonical)
            canonical_trie.add(canon_tokens, e)
            canonical_index[e.canonical.lower()] = e

            # aliases (all registers)
            for reg, alist in e.aliases.items():
                for a in alist:
                    alias_trie.add(_phrase_tokens(a), e)
                    alias_index.setdefault(a.lower(), []).append(e)

        blocked = _load_blocked_terms(d / "blocked_terms.yaml")

        # Build RuleEngine from all packs
        rule_engine = RuleEngine()
        for p in packs:
            for r in p.rules:
                rule_engine.add_rule(r)

        return cls(
            packs=packs,
            entries=entries,
            blocked_terms=blocked,
            alias_trie=alias_trie,
            canonical_trie=canonical_trie,
            rule_engine=rule_engine,
            alias_index=alias_index,
            canonical_index=canonical_index,
        )

    def lookup_phrase(self, phrase: str) -> list[LexEntry]:
        """O(1) exact phrase lookup (PIS Section 3)"""
        return self.alias_index.get(phrase.strip().lower(), [])

    def search(self, query: str, *, limit: int = 25) -> list[LexEntry]:
        q = query.strip().lower()
        if not q:
            return self.entries[:limit]
        hits: list[tuple[float, LexEntry]] = []
        for e in self.entries:
            score = 0.0
            if q in e.canonical.lower():
                score += 2.0
            for reg, alist in e.aliases.items():
                for a in alist:
                    if q in a.lower():
                        score += 1.5
            if q in e.reversible_key.lower():
                score += 0.5
            if score > 0:
                score += e.popularity * 0.25
                hits.append((score, e))
        hits.sort(key=lambda x: x[0], reverse=True)
        return [e for _, e in hits[:limit]]

    def extract_token_at(self, text: str, cursor: int) -> str:
        cursor = max(0, min(cursor, len(text)))
        toks = tokenize(text)
        for t in toks:
            if t.start <= cursor <= t.end:
                return t.text.strip()
        return ""

    def suggest(self, token: str, *, limit: int = 10) -> list[LexEntry]:
        q = token.strip().lower()
        if not q:
            return []
        return self.search(q, limit=limit)

    def find_blocked(self, text: str) -> list[tuple[str, Span]]:
        # Very simple: substring match on lower-cased text.
        lower = text.lower()
        found: list[tuple[str, Span]] = []
        for term in self.blocked_terms:
            if not term:
                continue
            start = 0
            while True:
                idx = lower.find(term, start)
                if idx == -1:
                    break
                found.append((term, Span(idx, idx + len(term))))
                start = idx + len(term)
        return found

    def match_aliases(self, text: str) -> list[Match]:
        return _match_using_trie(text, self.alias_trie, is_alias=True)

    def match_canonicals(self, text: str) -> list[Match]:
        return _match_using_trie(text, self.canonical_trie, is_alias=False)


def _phrase_tokens(phrase: str) -> list[str]:
    # Tokenize phrase into lower-case "wordish" tokens, ignoring pure whitespace.
    toks = [t.lower for t in tokenize(phrase) if not t.is_space]
    # Collapse punctuation-only segments into separate tokens too, because phrases may contain ":" etc.
    return [x for x in toks if x]


def _match_using_trie(text: str, trie: PhraseTrie, *, is_alias: bool) -> list[Match]:
    toks = tokenize(text)
    # Use lower tokens, but keep token indices to map back to spans.
    lower_tokens = [t.lower for t in toks if not t.is_space]
    # Map "compact token index" -> original token index
    compact_to_full: list[int] = [i for i, t in enumerate(toks) if not t.is_space]

    matches: list[Match] = []
    i = 0
    while i < len(lower_tokens):
        mlen, payloads = trie.longest_match(lower_tokens, i)
        if mlen <= 0:
            i += 1
            continue

        # Resolve char span in original text
        full_i = compact_to_full[i]
        full_j = compact_to_full[i + mlen - 1]
        start_char = toks[full_i].start
        end_char = toks[full_j].end

        matched_text = text[start_char:end_char]
        for entry in payloads:
            matches.append(
                Match(
                    entry=entry,
                    start_tok=i,
                    end_tok=i + mlen,
                    start_char=start_char,
                    end_char=end_char,
                    matched_text=matched_text,
                    is_alias=is_alias,
                )
            )

        i += mlen  # greedy skip (longest match)

    return matches
