from __future__ import annotations

import argparse
import json
from pathlib import Path

from .registry import LexiconRegistry
from .render import render_aave
from .normalize import normalize_to_canonical
from .lint import lint_aave
from .prettyprint import print_entry, print_search_results
from .pack import load_pack
from .stats import compute_stats


def _read_text(path: str) -> str:
    p = Path(path)
    return p.read_text(encoding="utf-8")


def cmd_render(args: argparse.Namespace) -> int:
    reg = LexiconRegistry.default()
    src = _read_text(args.path)
    out, diags = render_aave(src, reg, register=args.register, domain=args.domain)
    if args.json_diags:
        print(json.dumps([d.to_dict(out) for d in diags], indent=2))
    else:
        print(out)
    return 0


def cmd_normalize(args: argparse.Namespace) -> int:
    reg = LexiconRegistry.default()
    src = _read_text(args.path)
    out, diags = normalize_to_canonical(src, reg, strict=args.strict)
    if args.json_diags:
        print(json.dumps([d.to_dict(src) for d in diags], indent=2))
    else:
        print(out)
    # Exit non-zero if strict and errors exist
    if args.strict and any(d.severity.value == "error" for d in diags):
        return 2
    return 0


def cmd_dict(args: argparse.Namespace) -> int:
    reg = LexiconRegistry.default()
    results = reg.search(args.query, limit=args.limit)
    if args.json:
        print(json.dumps([e.to_dict() for e in results], indent=2))
        return 0
    if not results:
        print("No matches.")
        return 1
    print_search_results(results)
    if args.show:
        for e in results[: args.show]:
            print_entry(e)
    return 0


def cmd_lint(args: argparse.Namespace) -> int:
    reg = LexiconRegistry.default()
    src = _read_text(args.path)
    diags = lint_aave(src, reg, strict=args.strict)
    print(json.dumps([d.to_dict(src) for d in diags], indent=2))
    if any(d.severity.value == "error" for d in diags):
        return 2
    return 0


def cmd_validate_pack(args: argparse.Namespace) -> int:
    pack, diags = load_pack(Path(args.path))
    print(json.dumps([d.to_dict() for d in diags], indent=2))
    if pack is None or any(d.severity.value == "error" for d in diags):
        return 2
    return 0


def cmd_stats(args: argparse.Namespace) -> int:
    reg = LexiconRegistry.default()
    s = compute_stats(reg)
    print(json.dumps(s.to_dict(), indent=2))
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="jpe-aave", description="JPE AAVE Conversion Plugin CLI")
    sub = p.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("render", help="Render canonical JPE into AAVE-ish JPE")
    r.add_argument("path", help="Path to canonical JPE file")
    r.add_argument("--register", default="standard", choices=["mild", "standard", "heavy"])
    r.add_argument("--domain", default="generic")
    r.add_argument("--json-diags", action="store_true", help="Print diagnostics as JSON")
    r.set_defaults(func=cmd_render)

    n = sub.add_parser("normalize", help="Normalize AAVE-ish JPE into canonical JPE")
    n.add_argument("path", help="Path to AAVE-ish JPE file")
    n.add_argument("--strict", action="store_true", help="Treat ambiguity/blocked terms as errors")
    n.add_argument("--json-diags", action="store_true", help="Print diagnostics as JSON")
    n.set_defaults(func=cmd_normalize)

    d = sub.add_parser("dict", help="Search dictionary")
    d.add_argument("query", help="Search term")
    d.add_argument("--limit", type=int, default=25)
    d.add_argument("--json", action="store_true", help="Output JSON instead of Rich tables")
    d.add_argument("--show", type=int, default=0, help="Show top N entries in full detail")
    d.set_defaults(func=cmd_dict)

    l = sub.add_parser("lint", help="Lint AAVE-ish JPE")
    l.add_argument("path", help="Path to file")
    l.add_argument("--strict", action="store_true")
    l.set_defaults(func=cmd_lint)

    v = sub.add_parser("validate-pack", help="Validate a YAML pack")
    v.add_argument("path", help="Path to *.pack.yaml")
    v.set_defaults(func=cmd_validate_pack)

    s = sub.add_parser("stats", help="Print pack stats")
    s.set_defaults(func=cmd_stats)

    return p


def main(argv: list[str] | None = None) -> int:
    p = build_parser()
    args = p.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
