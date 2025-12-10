import tkinter as tk
from tkinter import ttk

class VaultOverviewPanel(ttk.Frame):
    """
    A tkinter frame containing the vault overview panel for the TS4Rebels plugin.
    """
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.create_widgets()

    def create_widgets(self):
        # --- Vault Info ---
        info_frame = ttk.LabelFrame(self, text="Vault Information")
        info_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        info_frame.columnconfigure(1, weight=1)

        ttk.Label(info_frame, text="Vault Path:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.vault_path_var = tk.StringVar(value="Not set")
        ttk.Label(info_frame, textvariable=self.vault_path_var, anchor="w").grid(row=0, column=1, padx=5, pady=5, sticky="ew")

        ttk.Label(info_frame, text="Last Scan:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.last_scan_var = tk.StringVar(value="Never")
        ttk.Label(info_frame, textvariable=self.last_scan_var, anchor="w").grid(row=1, column=1, padx=5, pady=5, sticky="ew")

        ttk.Label(info_frame, text="Total Mods:").grid(row=2, column=0, padx=5, pady=5, sticky="w")
        self.total_mods_var = tk.StringVar(value="0")
        ttk.Label(info_frame, textvariable=self.total_mods_var, anchor="w").grid(row=2, column=1, padx=5, pady=5, sticky="ew")

        ttk.Label(info_frame, text="Total Files:").grid(row=3, column=0, padx=5, pady=5, sticky="w")
        self.total_files_var = tk.StringVar(value="0")
        ttk.Label(info_frame, textvariable=self.total_files_var, anchor="w").grid(row=3, column=1, padx=5, pady=5, sticky="ew")

        # --- Actions ---
        action_frame = ttk.Frame(self)
        action_frame.grid(row=1, column=0, padx=10, pady=10, sticky="ew")
        
        self.scan_button = ttk.Button(action_frame, text="Scan Vault")
        self.scan_button.pack(side="left", padx=5)

        self.view_mods_button = ttk.Button(action_frame, text="View Mods Table", command=self._open_mods_table)
        self.view_mods_button.pack(side="left", padx=5)

    def _open_mods_table(self):
        from .mods_table import ModsTablePanel
        
        win = tk.Toplevel(self)
        win.title("TS4Rebels Mods")
        win.geometry("1000x600")

        table_panel = ModsTablePanel(win)
        table_panel.pack(fill="both", expand=True, padx=10, pady=10)
        
        # This would be populated with real data from the vault indexer
        # For now, we use placeholder data
        from ..vault_indexer import ModRecord, FileRef
        mods_data = [
            ModRecord(id="mod1", name="Awesome Mod", creator="Creator A", category="Gameplay", files=[FileRef("id", "path", "package", 123, 123456)], source_url=None, tags=None, pack=None),
            ModRecord(id="mod2", name="Another Mod", creator="Creator B", category="CAS", files=[FileRef("id", "path", "package", 456, 123457)], source_url=None, tags=None, pack=None),
        ]
        table_panel.populate_table(mods_data)

    def update_info(self, vault_path, last_scan, total_mods, total_files):
        self.vault_path_var.set(vault_path)
        self.last_scan_var.set(last_scan)
        self.total_mods_var.set(str(total_mods))
        self.total_files_var.set(str(total_files))

if __name__ == '__main__':
    root = tk.Tk()
    root.title("Vault Overview Panel Demo")
    
    try:
        from ttkbootstrap import Style
        style = Style(theme='darkly')
        root = style.master
    except ImportError:
        print("ttkbootstrap not found, using default ttk styles.")

    panel = VaultOverviewPanel(root, padding=20)
    panel.pack(fill="both", expand=True)
    panel.update_info(
        vault_path="C:/Users/Test/Documents/Sims 4/TS4Rebels Vault",
        last_scan="2025-12-09 10:30 AM",
        total_mods=123,
        total_files=456
    )

    root.mainloop()
