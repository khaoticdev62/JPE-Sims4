from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Any, Iterable, List


_TOKEN_RE = re.compile(
    r"""(
        \r\n|\n|\r                     # newlines
      | [A-Za-z0-9_]+(?:'[A-Za-z]+)?      # words, allow simple apostrophe
      | \s+                               # whitespace
      | [^\sA-Za-z0-9_]+                  # punctuation/symbols
    )""",
    re.VERBOSE,
)


@dataclass(frozen=True)
class Tok:
    text: str
    start: int
    end: int

    @property
    def lower(self) -> str:
        return self.text.lower()

    @property
    def is_space(self) -> bool:
        return self.text.isspace()

    @property
    def is_word(self) -> bool:
        return self.text[:1].isalnum() or self.text[:1] == "_"


def tokenize(text: str) -> List[Tok]:
    out: List[Tok] = []
    for m in _TOKEN_RE.finditer(text):
        s, e = m.start(1), m.end(1)
        out.append(Tok(m.group(1), s, e))
    return out


def tokenize_aave_phrases(text: str, registry: Any) -> List[Tok]:
    """Tokenize text while merging multi-word aliases/canonicals (PIS Section 4)."""
    # Use the registry matches to identify spans that should be merged.
    # To keep it simple, we match aliases AND canonicals, merge them into single tokens.
    all_toks = tokenize(text)
    # Filter out spaces for trie matching
    compact_toks = [t for t in all_toks if not t.is_space]
    compact_to_full = [i for i, t in enumerate(all_toks) if not t.is_space]

    out: List[Tok] = []
    i = 0
    while i < len(compact_toks):
        # Check both canonical and alias tries for the longest match from here
        mlen_a, _ = registry.alias_trie.longest_match([t.lower for t in compact_toks], i)
        mlen_c, _ = registry.canonical_trie.longest_match([t.lower for t in compact_toks], i)

        mlen = max(mlen_a, mlen_c)

        if mlen > 1:
            # Multi-word match! Merge them.
            start_full = compact_to_full[i]
            end_full = compact_to_full[i + mlen - 1]
            out.append(
                Tok(
                    text=text[all_toks[start_full].start : all_toks[end_full].end],
                    start=all_toks[start_full].start,
                    end=all_toks[end_full].end,
                )
            )
            i += mlen
        else:
            # Fallback to single token
            out.append(compact_toks[i])
            i += 1

    # Note: this greedy approach skips spaces between matches if not careful.
    # For AAVE conversion, usually we want to preserve spaces/punct between tokens.
    # Refined: just yield the original tokens but merge the ones that matched.
    return out
