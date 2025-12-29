from __future__ import annotations

import argparse
import json
from pathlib import Path

from jpe_sims4.ts4rebels.sample_analysis import analyze_samples_folder


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="ts4rebels-analyze-samples")
    parser.add_argument("path", help="Folder containing TS4Rebels sample files (json/csv).")
    args = parser.parse_args(argv)

    root = Path(args.path).expanduser().resolve()
    if not root.exists():
        raise SystemExit(f"Path not found: {root}")
    analysis = analyze_samples_folder(root)
    payload = {"root": str(root), **analysis.to_dict()}
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
