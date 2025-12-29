from __future__ import annotations

# Thin entrypoint wrapper to keep `jpe-studio = "studio:main"` stable.

from jpe_studio.app import main


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())

