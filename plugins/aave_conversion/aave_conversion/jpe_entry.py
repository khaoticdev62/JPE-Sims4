from __future__ import annotations

"""Entry-point shim for host discovery.

Some JPE builds discover plugins via:
- manifest.json entrypoint strings (importlib)
- Python entry-points (pyproject.toml) under group 'jpe.plugins'
- module-level PLUGIN objects
- module-level create_plugin() factories

This module exists to support the 'jpe.plugins' entry-point path.
"""

from .plugin import AAVEConversionPlugin, create_plugin  # re-export

__all__ = ["AAVEConversionPlugin", "create_plugin"]
