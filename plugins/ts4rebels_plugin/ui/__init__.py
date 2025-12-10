import tkinter as tk
from tkinter import ttk
from .vault_overview import VaultOverviewPanel

class PluginFrame(ttk.Frame):
    """
    The main UI frame for the TS4Rebels plugin.
    """
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)

        self.overview_panel = VaultOverviewPanel(self)
        self.overview_panel.pack(fill="x", padx=10, pady=10)

        # The mods table will be in a separate window for now,
        # but could be integrated here in a notebook or paned window.

if __name__ == '__main__':
    root = tk.Tk()
    root.title("Plugin Frame Demo")
    root.geometry("800x600")

    try:
        from ttkbootstrap import Style
        style = Style(theme='darkly')
        root = style.master
    except ImportError:
        print("ttkbootstrap not found, using default ttk styles.")

    frame = PluginFrame(root, padding=20)
    frame.pack(fill="both", expand=True)
    root.mainloop()