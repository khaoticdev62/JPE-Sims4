"""Example wiring for PluginManager in a JPE-style engine.

This file is *not* meant to be imported as-is. It's a concrete reference
you can copy into your engine's compile / decompile pipeline.

Where to wire (canonical-first contract)
- On *input*, before parsing JPE: run `normalize_preparse()`.
- On *output*, after generating canonical JPE: run `render_postprocess()`.

The SOP expects the desktop and mobile apps to consume structured diagnostics,
so return / attach `DiagnosticsReport.to_dict()` results on each stage.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .plugin_manager import PluginManager, discover_plugins


@dataclass
class PipelineResult:
    text: str
    diagnostics: list[dict[str, Any]]


class Engine:
    def __init__(self, *, plugins_dir: str = "plugins"):
        self.plugins: PluginManager = discover_plugins(plugins_dir=plugins_dir)

    # ---------------------------
    # JPE -> IR (parse)
    # ---------------------------
    def parse_jpe(self, input_text: str, *, context: dict[str, Any] | None = None) -> tuple[Any, list[dict[str, Any]]]:
        """Parse a (possibly AAVE-flavored) JPE text into IR.

        Replace the `parse_canonical_jpe_to_ir(...)` call with your real parser.
        """
        context = context or {}
        canonical, pre = self.plugins.normalize_preparse(input_text, context={**context, "strict": context.get("strict", True)})

        # parse_canonical_jpe_to_ir should be your real parse step
        ir = parse_canonical_jpe_to_ir(canonical)  # noqa: F821
        return ir, pre.items

    # ---------------------------
    # IR -> JPE (generate)
    # ---------------------------
    def generate_jpe(self, ir: Any, *, context: dict[str, Any] | None = None) -> PipelineResult:
        """Generate canonical JPE from IR, then render AAVE view if desired."""
        context = context or {}
        canonical_jpe = generate_ir_to_canonical_jpe(ir)  # noqa: F821
        rendered, post = self.plugins.render_postprocess(canonical_jpe, context=context)
        return PipelineResult(text=rendered, diagnostics=post.items)


# --- stubs for illustration only ---
def parse_canonical_jpe_to_ir(text: str) -> Any:  # pragma: no cover
    raise NotImplementedError


def generate_ir_to_canonical_jpe(ir: Any) -> str:  # pragma: no cover
    raise NotImplementedError
