from __future__ import annotations

from jpe_sims4.diagnostics import Diagnostic


def register(registry) -> None:
    def extract_stbl(file_path: str, content: bytes):
        return type(
            "ExtractResultProxy",
            (),
            {
                "segments": [],
                "diagnostics": [
                    Diagnostic(
                        severity="INFO",
                        category="PLUGIN_STBL",
                        code="I_STBL_NOT_IMPLEMENTED",
                        message="STBL extraction is not implemented yet. This plugin is a placeholder for future support.",
                        file_path=file_path,
                    )
                ],
            },
        )()

    registry.register_extractor("stbl", extract_stbl)

