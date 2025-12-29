from __future__ import annotations

import argparse
import json
from pathlib import Path

from jpe_studio_qt.assets_inventory import scan_assets_folder, summarize_tokens, write_manifest


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="jpe-assets-inventory")
    parser.add_argument(
        "--assets-root",
        default="JPE assets folder",
        help="Path to the JPE assets folder (default: ./JPE assets folder).",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write docs/ui/assets_manifest.json and print a short summary.",
    )
    parser.add_argument(
        "--out-json",
        default="docs/ui/assets_manifest.json",
        help="Output path for the JSON manifest when using --write.",
    )
    args = parser.parse_args(argv)

    assets_root = Path(args.assets_root)
    if args.write:
        payload = write_manifest(assets_root=assets_root, out_json=Path(args.out_json))
        summary = payload.get("summary") or {}
        print(
            json.dumps(
                {
                    "assets_root": payload.get("assets_root"),
                    "assets_count": summary.get("assets_count"),
                    "top_fonts": (summary.get("fonts") or [])[:6],
                    "primary_variants": summary.get("primary_variants"),
                    "color_keys": summary.get("color_keys"),
                },
                indent=2,
                ensure_ascii=False,
            )
        )
        return 0

    assets = scan_assets_folder(assets_root)
    print(json.dumps({"assets_root": str(assets_root), "assets": [a.to_dict() for a in assets]}, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

