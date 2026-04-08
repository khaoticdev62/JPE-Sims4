from __future__ import annotations

from typing import Optional

try:
    from textual.app import App, ComposeResult
    from textual.screen import ModalScreen
    from textual.widgets import Input, ListView, ListItem, Static, Button
    from textual.containers import Horizontal, Vertical
except Exception as e:  # pragma: no cover
    raise RuntimeError("Textual is not installed. Install with: pip install .[tui]") from e


class DictionaryModal(ModalScreen):
    BINDINGS = [("escape", "dismiss", "Close")]

    def __init__(self, registry, *, initial_query: str = ""):
        super().__init__()
        self.registry = registry
        self.initial_query = initial_query
        self._selected = None

    def compose(self) -> ComposeResult:
        yield Vertical(
            Input(placeholder="Search canonical or AAVE alias…", value=self.initial_query, id="q"),
            Horizontal(
                ListView(id="results"),
                Static(id="details"),
                id="body",
            ),
            Horizontal(
                Button("Insert", id="insert"),
                Button("Close", id="close"),
                id="footer",
            ),
            id="root",
        )

    def on_mount(self) -> None:
        self._refresh(self.initial_query)
        self.query_one("#q", Input).focus()

    def on_input_changed(self, event: Input.Changed) -> None:
        if event.input.id == "q":
            self._refresh(event.value)

    def _refresh(self, query: str) -> None:
        results = self.registry.search(query, limit=50)
        lv = self.query_one("#results", ListView)
        lv.clear()
        for e in results:
            label = f"{e.canonical} → {', '.join(e.aliases.get('standard', []))}"
            item = ListItem(Static(label))
            item.data = e  # type: ignore[attr-defined]
            lv.append(item)
        if results:
            self._show_entry(results[0])

    def on_list_view_selected(self, event: ListView.Selected) -> None:
        e = getattr(event.item, "data", None)
        if e is not None:
            self._show_entry(e)

    def _show_entry(self, e) -> None:
        self._selected = e
        details = self.query_one("#details", Static)
        lines = [
            f"[b]Canonical:[/b] {e.canonical}",
            f"[b]Type:[/b] {e.token_type}",
            f"[b]Domains:[/b] {', '.join(e.domains)}",
            f"[b]Mild:[/b] {', '.join(e.aliases.get('mild', [])) or '—'}",
            f"[b]Standard:[/b] {', '.join(e.aliases.get('standard', [])) or '—'}",
            f"[b]Heavy:[/b] {', '.join(e.aliases.get('heavy', [])) or '—'}",
            f"[b]Key:[/b] {e.reversible_key}",
        ]
        details.update("\n".join(lines))

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "close":
            self.dismiss(None)
        elif event.button.id == "insert":
            # Return canonical by default; host editor can decide what to insert.
            if self._selected is not None:
                self.dismiss(self._selected.canonical)


class DictionaryApp(App):
    CSS = """
    #body { height: 1fr; }
    #results { width: 50%; }
    #details { width: 50%; padding: 1; }
    #footer { height: 3; }
    """

    def __init__(self, registry, query: str = ""):
        super().__init__()
        self.registry = registry
        self.query = query

    async def on_mount(self) -> None:
        result = await self.push_screen(DictionaryModal(self.registry, initial_query=self.query))
        if result:
            self.exit(message=str(result))
        else:
            self.exit()


def run_dictionary_modal(registry, query: str = "") -> None:
    DictionaryApp(registry, query=query).run()
