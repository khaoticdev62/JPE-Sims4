from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class TelemetryEvent:
    name: str
    properties: dict[str, object]


class TelemetrySink(Protocol):
    def emit(self, event: TelemetryEvent) -> None: ...


class NullTelemetry:
    def emit(self, event: TelemetryEvent) -> None:
        return


_sink: TelemetrySink = NullTelemetry()


def configure(sink: TelemetrySink | None) -> None:
    global _sink
    _sink = sink or NullTelemetry()


def emit(name: str, **properties: object) -> None:
    try:
        _sink.emit(TelemetryEvent(name=name, properties=dict(properties)))
    except Exception:
        return

