import tkinter as tk
from tkinter import ttk
from pathlib import Path
from .vault_overview import VaultOverviewPanel
from .download_panel import DownloadPanel
from ..vault_indexer import VaultIndexer # Import VaultIndexer
import datetime # For last scan time


class PluginFrame(ttk.Frame):
    """
    The main UI frame for the TS4Rebels plugin.
    """
    def __init__(self, parent, vault_root: Path, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.vault_root = vault_root
        self.vault_indexer = VaultIndexer(vault_root=self.vault_root) # Instantiate VaultIndexer
        self.last_scan_time: datetime.datetime | None = None
        self.mod_records = []

        self.notebook = ttk.Notebook(self)
        self.notebook.pack(fill="both", expand=True, padx=5, pady=5)

        # Vault Overview Tab
        self.overview_panel = VaultOverviewPanel(self.notebook)
        self.notebook.add(self.overview_panel, text="Vault Overview")
        self.overview_panel.scan_button.config(command=self._trigger_vault_scan) # Connect scan button
        self.overview_panel.view_mods_button.config(command=self._open_mods_table) # Connect view mods button
        
        # Download Tab
        self.download_panel = DownloadPanel(self.notebook, vault_root=self.vault_root, scan_callback=self._trigger_vault_scan)
        self.notebook.add(self.download_panel, text="Downloader")

        # Initial scan
        self._trigger_vault_scan()

    def _trigger_vault_scan(self):
        print("Performing incremental vault scan...")
        self.mod_records = self.vault_indexer.full_scan() # For simplicity, always full scan for now
        self.last_scan_time = datetime.datetime.now()
        
        total_files = sum(len(mod.files) for mod in self.mod_records)
        
        self.overview_panel.update_info(
            vault_path=str(self.vault_root),
            last_scan=self.last_scan_time.strftime("%Y-%m-%d %H:%M:%S"),
            total_mods=len(self.mod_records),
            total_files=total_files
        )
        print("Vault scan complete.")

    def _open_mods_table(self):
        from .mods_table import ModsTablePanel
        
        win = tk.Toplevel(self)
        win.title("TS4Rebels Mods")
        win.geometry("1000x600")

        table_panel = ModsTablePanel(win)
        table_panel.pack(fill="both", expand=True, padx=10, pady=10)
        table_panel.populate_table(self.mod_records) # Populate with actual data

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

    # Create a dummy vault root for demonstration
    dummy_vault_root = Path("./dummy_ts4rebels_vault")
    dummy_vault_root.mkdir(exist_ok=True)

    frame = PluginFrame(root, vault_root=dummy_vault_root, padding=20)
    frame.pack(fill="both", expand=True)
    root.mainloop()

    # Clean up dummy vault
    import shutil
    if dummy_vault_root.exists():
        shutil.rmtree(dummy_vault_root)