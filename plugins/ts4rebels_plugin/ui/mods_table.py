import tkinter as tk
from tkinter import ttk
from typing import List
from ..vault_indexer import ModRecord

class ModsTablePanel(ttk.Frame):
    """
    A tkinter frame containing the mods table for the TS4Rebels plugin.
    """
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.create_widgets()

    def create_widgets(self):
        # --- Treeview ---
        columns = ("name", "creator", "category", "files", "last_updated", "status", "issues")
        self.tree = ttk.Treeview(self, columns=columns, show="headings")

        # Define headings
        self.tree.heading("name", text="Name")
        self.tree.heading("creator", text="Creator")
        self.tree.heading("category", text="Category")
        self.tree.heading("files", text="Files")
        self.tree.heading("last_updated", text="Last Updated")
        self.tree.heading("status", text="Status")
        self.tree.heading("issues", text="Issues")

        # Configure column widths
        self.tree.column("name", width=200)
        self.tree.column("creator", width=150)
        self.tree.column("category", width=100)
        self.tree.column("files", width=50, anchor="center")
        self.tree.column("last_updated", width=150)
        self.tree.column("status", width=100)
        self.tree.column("issues", width=50, anchor="center")

        self.tree.pack(fill="both", expand=True)

    def populate_table(self, mods: List[ModRecord]):
        # Clear existing data
        for item in self.tree.get_children():
            self.tree.delete(item)

        # Insert new data
        for mod in mods:
            self.tree.insert("", tk.END, values=(
                mod.name,
                mod.creator or "N/A",
                mod.category or "N/A",
                len(mod.files),
                # A real implementation would format the timestamp
                str(mod.files[0].modified_at) if mod.files else "N/A",
                "Not Translated", # Placeholder
                0 # Placeholder
            ))

if __name__ == '__main__':
    root = tk.Tk()
    root.title("Mods Table Panel Demo")

    try:
        from ttkbootstrap import Style
        style = Style(theme='darkly')
        root = style.master
    except ImportError:
        print("ttkbootstrap not found, using default ttk styles.")

    panel = ModsTablePanel(root, padding=20)
    panel.pack(fill="both", expand=True)

    # Example data
    from ..vault_indexer import FileRef
    mods_data = [
        ModRecord(id="mod1", name="Awesome Mod", creator="Creator A", category="Gameplay", files=[FileRef("id", "path", "package", 123, 123456)]),
        ModRecord(id="mod2", name="Another Mod", creator="Creator B", category="CAS", files=[FileRef("id", "path", "package", 456, 123457)]),
    ]
    panel.populate_table(mods_data)

    root.mainloop()
