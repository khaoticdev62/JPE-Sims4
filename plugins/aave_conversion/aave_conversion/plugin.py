from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from pathlib import Path

from .diagnostics import Diagnostic
from .lint import lint_aave
from .normalize import normalize_to_canonical
from .pack import LexEntry, LexPack, load_pack, save_pack
from .registry import LexiconRegistry
from .render import render_aave
from .stats import compute_stats


@dataclass(frozen=True)
class AAVEConversionPlugin:
    """AAVE Conversion (AAVEPack) plugin for JPE.

    This plugin is intentionally *canonical-first*:

    - Compilation pipelines should parse/compile **canonical JPE**.
    - AAVE-flavored JPE is treated as an editor-friendly *view* and *input layer*.

    The plugin therefore supports two safe hooks:

    1) normalize_preparse():  AAVE-ish input  -> canonical JPE (diagnostic-rich)
    2) render_postprocess():  canonical JPE   -> AAVE-ish output (register-controlled)

    It also exposes a dictionary lookup, lint, suggestions, and stats.
    """

    id: str = "jpe.plugin.aave_conversion"
    name: str = "AAVE Conversion (AAVEPack)"
    version: str = "1.0.2"

    @property
    def registry(self) -> LexiconRegistry:
        return LexiconRegistry.default()

    # ---------------------------
    # Primary JPE-style hooks
    # ---------------------------
    def normalize_preparse(
        self, input_text: str, *, context: dict[str, Any] | None = None
    ) -> tuple[str, list[Diagnostic]]:
        context = context or {}
        strict = bool(context.get("strict", True))
        canonical, diags = normalize_to_canonical(input_text, self.registry, strict=strict)
        return canonical, diags

    def render_postprocess(
        self, canonical_text: str, *, context: dict[str, Any] | None = None
    ) -> tuple[str, list[Diagnostic]]:
        context = context or {}
        register = str(context.get("register", "standard"))
        domain = str(context.get("domain", "generic"))
        preserve_keywords = bool(context.get("preserve_keywords", True))
        out, diags = render_aave(
            canonical_text,
            self.registry,
            register=register,
            domain=domain,
            preserve_keywords=preserve_keywords,
        )
        return out, diags

    def dictionary_lookup(
        self, query: str, *, context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        context = context or {}
        limit = int(context.get("limit", 25))
        results = self.registry.search(query, limit=limit)
        return {"query": query, "results": [r.to_dict() for r in results]}

    def lint(self, text: str, *, context: dict[str, Any] | None = None) -> list[Diagnostic]:
        context = context or {}
        strict = bool(context.get("strict", False))
        return lint_aave(text, self.registry, strict=strict)

    def suggest(
        self, text: str, cursor: int, *, context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        token = self.registry.extract_token_at(text, cursor)
        results = self.registry.suggest(token, limit=10)
        return {"token": token, "suggestions": [e.to_dict() for e in results]}

    def stats(self, *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        return compute_stats(self.registry).to_dict()

    def lexicon_add(
        self, entry_dict: dict[str, Any], *, context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Add or update an entry in the user dictionary."""
        dict_dir = Path(__file__).resolve().parent / "dictionary"
        user_pack_path = dict_dir / "user.pack.yaml"

        # Load or create user pack
        user_pack: LexPack | None = None
        if user_pack_path.exists():
            user_pack, _ = load_pack(user_pack_path)

        if user_pack is None:
            user_pack = LexPack(
                version=1,
                pack_id="user_custom",
                language="en-US",
                registers=["mild", "standard", "heavy"],
                entries=[],
                rules=[],
            )

        # Parse new entry
        # Basic validation/transformation from dict
        new_entry = LexEntry(
            canonical=str(entry_dict.get("canonical", "")).strip(),
            token_type=str(entry_dict.get("token_type", "term")).strip(),
            domains=entry_dict.get("domains", ["generic"]),
            aliases=entry_dict.get("aliases", {}),
            reversible_key=str(entry_dict.get("reversible_key", "")).strip()
            or f"{entry_dict.get('canonical')}::custom",
            popularity=float(entry_dict.get("popularity", 0.5)),
        )

        # Update existing or add new
        new_entries = [e for e in user_pack.entries if e.canonical != new_entry.canonical]
        new_entries.append(new_entry)

        updated_pack = LexPack(
            version=user_pack.version,
            pack_id=user_pack.pack_id,
            language=user_pack.language,
            registers=user_pack.registers,
            entries=new_entries,
            rules=user_pack.rules,
        )

        save_pack(updated_pack, user_pack_path)

        # Reload registry (lazy reload on next access via property)
        # However, since current instance might have cached it in some loaders,
        # we trigger a re-creation if LexiconRegistry.default() is cached.
        # For simplicity in this PIS, we assume the next call to .registry property
        # will re-run LexiconRegistry.default() which scans the dir.

        return {"success": True, "canonical": new_entry.canonical}

    def lexicon_remove(
        self, canonical: str, *, context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Remove an entry from the user dictionary."""
        dict_dir = Path(__file__).resolve().parent / "dictionary"
        user_pack_path = dict_dir / "user.pack.yaml"

        if not user_pack_path.exists():
            return {"success": False, "error": "User dictionary not found"}

        user_pack, _ = load_pack(user_pack_path)
        if not user_pack:
            return {"success": False, "error": "Failed to load user dictionary"}

        new_entries = [e for e in user_pack.entries if e.canonical != canonical]

        updated_pack = LexPack(
            version=user_pack.version,
            pack_id=user_pack.pack_id,
            language=user_pack.language,
            registers=user_pack.registers,
            entries=new_entries,
            rules=user_pack.rules,
        )

        save_pack(updated_pack, user_pack_path)
        return {"success": True, "canonical": canonical}

    # ---------------------------
    # Compatibility aliases
    # (common plugin-loader naming variations)
    # ---------------------------
    def pre_parse(self, input_text: str, *, context: dict[str, Any] | None = None):
        return self.normalize_preparse(input_text, context=context)

    def post_render(self, canonical_text: str, *, context: dict[str, Any] | None = None):
        return self.render_postprocess(canonical_text, context=context)

    def lookup_dictionary(self, query: str, *, context: dict[str, Any] | None = None):
        return self.dictionary_lookup(query, context=context)

    def get_capabilities(self) -> list[str]:
        return [
            "render.postprocess",
            "normalize.preparse",
            "dictionary.lookup",
            "lint",
            "suggest",
            "stats",
        ]


# Convenience: some loaders prefer module-level instances / factories.
PLUGIN = AAVEConversionPlugin()


def create_plugin() -> AAVEConversionPlugin:
    return PLUGIN
