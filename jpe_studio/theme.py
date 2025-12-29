from __future__ import annotations

from dataclasses import dataclass
from tkinter import Tk, ttk


@dataclass(frozen=True)
class JPETheme:
    primary: str = "#9d5cff"
    background: str = "#170f23"
    surface: str = "#231b30"
    surface_2: str = "#31214a"
    border: str = "#472f6a"
    text: str = "#ffffff"
    text_muted: str = "#a78ecc"
    success: str = "#22c55e"
    warning: str = "#eab308"
    error: str = "#ef4444"


THEME = JPETheme()


def apply_theme(root: Tk) -> None:
    """
    Apply the JPE visual system to ttk widgets.

    The palette is derived from the UI templates under `JPE assets folder/`.
    """
    # Use a themeable ttk base. On Windows, native themes (vista/xpnative) ignore many color options.
    # We intentionally do NOT use ttkbootstrap themes here because they can force a light palette
    # (e.g., "litera") even when our design tokens are dark.
    style = ttk.Style(master=root)
    try:
        if "clam" in style.theme_names():
            style.theme_use("clam")
    except Exception:
        pass

    root.configure(background=THEME.background)
    try:
        root.option_add("*Font", ("Segoe UI", 10))
    except Exception:
        pass

    # Baseline defaults: ensure a dark surface even if a widget forgets to use JPE.* styles.
    try:
        style.configure(".", background=THEME.background, foreground=THEME.text)
        style.configure("TFrame", background=THEME.background)
        style.configure("TLabel", background=THEME.background, foreground=THEME.text)
    except Exception:
        pass

    style.configure("JPE.TFrame", background=THEME.background)
    style.configure("JPE.Surface.TFrame", background=THEME.surface)
    style.configure("JPE.Card.TFrame", background=THEME.surface, relief="flat")
    style.configure("JPE.Divider.TFrame", background=THEME.border)

    style.configure("JPE.TLabel", background=THEME.background, foreground=THEME.text)
    style.configure("JPE.Muted.TLabel", background=THEME.background, foreground=THEME.text_muted)
    style.configure("JPE.H1.TLabel", background=THEME.background, foreground=THEME.text, font=("Segoe UI", 18, "bold"))
    style.configure("JPE.H2.TLabel", background=THEME.background, foreground=THEME.text, font=("Segoe UI", 12, "bold"))
    style.configure("JPE.Caption.TLabel", background=THEME.background, foreground=THEME.text_muted, font=("Segoe UI", 9))

    style.configure(
        "JPE.Primary.TButton",
        background=THEME.primary,
        foreground="#ffffff",
        borderwidth=0,
        focusthickness=2,
        focuscolor=THEME.primary,
        padding=(12, 8),
    )
    style.map(
        "JPE.Primary.TButton",
        background=[("active", "#b08aff"), ("disabled", THEME.surface_2)],
        foreground=[("disabled", THEME.text_muted)],
    )

    style.configure(
        "JPE.Secondary.TButton",
        background=THEME.surface_2,
        foreground=THEME.text,
        borderwidth=0,
        focusthickness=2,
        focuscolor=THEME.primary,
        padding=(12, 8),
    )
    style.map("JPE.Secondary.TButton", background=[("active", THEME.border), ("disabled", THEME.surface_2)])

    style.configure(
        "JPE.Chip.TButton",
        background=THEME.surface_2,
        foreground=THEME.text,
        borderwidth=0,
        focusthickness=2,
        focuscolor=THEME.primary,
        padding=(10, 6),
    )
    style.map("JPE.Chip.TButton", background=[("active", THEME.border), ("disabled", THEME.surface_2)])

    style.configure("JPE.TEntry", fieldbackground=THEME.surface_2, background=THEME.surface_2, foreground=THEME.text)
    style.map(
        "JPE.TEntry",
        fieldbackground=[("disabled", THEME.surface)],
        foreground=[("disabled", THEME.text_muted)],
    )

    style.configure(
        "JPE.TCombobox",
        fieldbackground=THEME.surface_2,
        background=THEME.surface_2,
        foreground=THEME.text,
        arrowcolor=THEME.text_muted,
        padding=(6, 4),
    )
    style.map(
        "JPE.TCombobox",
        fieldbackground=[("readonly", THEME.surface_2), ("disabled", THEME.surface)],
        foreground=[("disabled", THEME.text_muted)],
    )

    style.configure("TLabelframe", background=THEME.background, foreground=THEME.text, bordercolor=THEME.border)
    style.configure("TLabelframe.Label", background=THEME.background, foreground=THEME.text_muted)

    style.configure(
        "JPE.TRadiobutton",
        background=THEME.background,
        foreground=THEME.text,
        padding=(6, 4),
    )
    style.map(
        "JPE.TRadiobutton",
        foreground=[("disabled", THEME.text_muted)],
        background=[("active", THEME.background)],
    )
    style.configure(
        "JPE.Surface.TRadiobutton",
        background=THEME.surface,
        foreground=THEME.text,
        padding=(6, 4),
    )
    style.map(
        "JPE.Surface.TRadiobutton",
        foreground=[("disabled", THEME.text_muted)],
        background=[("active", THEME.surface)],
    )

    style.configure(
        "JPE.TCheckbutton",
        background=THEME.background,
        foreground=THEME.text,
        padding=(6, 4),
    )
    style.map(
        "JPE.TCheckbutton",
        foreground=[("disabled", THEME.text_muted)],
        background=[("active", THEME.background)],
    )
    style.configure(
        "JPE.Surface.TCheckbutton",
        background=THEME.surface,
        foreground=THEME.text,
        padding=(6, 4),
    )
    style.map(
        "JPE.Surface.TCheckbutton",
        foreground=[("disabled", THEME.text_muted)],
        background=[("active", THEME.surface)],
    )

    style.configure(
        "JPE.Treeview",
        background=THEME.surface,
        fieldbackground=THEME.surface,
        foreground=THEME.text,
        bordercolor=THEME.border,
        lightcolor=THEME.border,
        darkcolor=THEME.border,
        rowheight=24,
    )
    style.configure("JPE.Treeview.Heading", background=THEME.surface_2, foreground=THEME.text, relief="flat")
    style.map(
        "JPE.Treeview",
        background=[("selected", THEME.primary)],
        foreground=[("selected", "#ffffff")],
    )

    style.configure("TNotebook", background=THEME.background, borderwidth=0)
    style.configure("TNotebook.Tab", padding=(10, 6))
    style.map(
        "TNotebook.Tab",
        background=[("selected", THEME.surface_2), ("active", THEME.surface)],
        foreground=[("selected", THEME.text), ("active", THEME.text)],
    )
