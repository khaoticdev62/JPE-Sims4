from __future__ import annotations

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path


def configure_file_logging(log_path: Path, *, level: int = logging.INFO) -> None:
    log_path = log_path.expanduser().resolve()
    log_path.parent.mkdir(parents=True, exist_ok=True)

    root = logging.getLogger("jpe_sims4")
    root.setLevel(level)
    root.propagate = False

    for h in list(root.handlers):
        root.removeHandler(h)

    handler = RotatingFileHandler(
        log_path,
        maxBytes=2_000_000,
        backupCount=3,
        encoding="utf-8",
    )
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    root.addHandler(handler)


def get_logger(name: str = "jpe_sims4") -> logging.Logger:
    return logging.getLogger(name)

