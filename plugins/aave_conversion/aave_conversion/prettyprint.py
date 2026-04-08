from __future__ import annotations

from typing import Iterable

from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from .pack import LexEntry

console = Console()


def print_search_results(results: list[LexEntry]) -> None:
    table = Table(title="AAVE Dictionary Search")
    table.add_column("Canonical", style="bold")
    table.add_column("Standard AAVE")
    table.add_column("Domains")
    table.add_column("Type")

    for e in results:
        std = ", ".join(e.aliases.get("standard", []))
        dom = ", ".join(e.domains)
        table.add_row(e.canonical, std, dom, e.token_type)

    console.print(table)


def print_entry(entry: LexEntry) -> None:
    title = entry.canonical
    table = Table(show_header=False, box=None)
    table.add_row("Canonical", entry.canonical)
    table.add_row("Token Type", entry.token_type)
    table.add_row("Domains", ", ".join(entry.domains))
    table.add_row("Locked", "yes" if entry.locked else "no")
    table.add_row("Reversible Key", entry.reversible_key)

    for reg in ("mild", "standard", "heavy"):
        table.add_row(f"Register ({reg})", ", ".join(entry.aliases.get(reg, [])) or "—")

    notes = "\n".join(entry.notes or []) or "—"
    console.print(Panel.fit(table, title=title))
    console.print(f"[bold]Notes:[/bold] {notes}")

    if entry.examples:
        ex = Table(title="Examples")
        ex.add_column("Canonical")
        ex.add_column("AAVE")
        for item in entry.examples:
            ex.add_row(str(item.get("canonical", "")), str(item.get("aave", "")))
        console.print(ex)
