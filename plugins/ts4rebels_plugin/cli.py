import json
import argparse
from .core.plugin import TS4RebelsPlugin


def main():
    parser = argparse.ArgumentParser(description="TS4Rebels Plugin CLI")
    parser.add_argument("command", choices=["scan", "deep_scan", "analyze_conflicts"])
    parser.add_argument("--vault", help="Path to the mod vault")
    parser.add_argument("--mod_ids", help="Comma-separated mod IDs")

    args = parser.parse_args()

    plugin = TS4RebelsPlugin()
    plugin.index.initialize()
    if args.vault:
        import os

        os.environ["TS4REBEL_VAULT"] = args.vault

    if args.command == "scan":
        result = plugin.on_scan_requested()
        print(json.dumps(result))
    elif args.command == "deep_scan":
        # First ensure index is up to date
        plugin.on_scan_requested()
        # Then run deep scan
        result = plugin.scanner.deep_scan()
        print(json.dumps(result))
    elif args.command == "analyze_conflicts":
        conflicts = plugin.conflicts.analyze()
        issues = list(plugin.issues.issues.values())
        print(json.dumps({"conflicts": conflicts, "issues": issues}))


if __name__ == "__main__":
    main()
