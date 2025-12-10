import tkinter as tk
from tkinter import ttk, filedialog

class SettingsPanel(ttk.Frame):
    """
    A tkinter frame containing the settings panel for the TS4Rebels plugin.
    """
    def __init__(self, parent, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.config = {}
        self.create_widgets()

    def create_widgets(self):
        # --- Vault Path ---
        vault_frame = ttk.LabelFrame(self, text="TS4Rebels Vault")
        vault_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")
        vault_frame.columnconfigure(1, weight=1)

        self.vault_path_var = tk.StringVar()
        ttk.Label(vault_frame, text="Vault Path:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        ttk.Entry(vault_frame, textvariable=self.vault_path_var).grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        ttk.Button(vault_frame, text="Browse...", command=self._browse_vault_path).grid(row=0, column=2, padx=5, pady=5)

        # --- Vault Structure ---
        structure_frame = ttk.LabelFrame(self, text="Vault Structure")
        structure_frame.grid(row=1, column=0, padx=10, pady=10, sticky="ew")

        self.structure_preset_var = tk.StringVar()
        ttk.Label(structure_frame, text="Structure Preset:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        structure_presets = ["flat", "by_creator", "by_pack", "mixed"]
        ttk.Combobox(structure_frame, textvariable=self.structure_preset_var, values=structure_presets).grid(row=0, column=1, padx=5, pady=5, sticky="ew")

        # --- Manifest Files ---
        manifest_frame = ttk.LabelFrame(self, text="Metadata Manifests")
        manifest_frame.grid(row=2, column=0, padx=10, pady=10, sticky="ew")
        manifest_frame.columnconfigure(0, weight=1)

        self.manifest_listbox = tk.Listbox(manifest_frame)
        self.manifest_listbox.grid(row=0, column=0, columnspan=2, padx=5, pady=5, sticky="ew")
        
        add_button = ttk.Button(manifest_frame, text="Add Manifest", command=self._add_manifest)
        add_button.grid(row=1, column=0, padx=5, pady=5, sticky="e")
        
        remove_button = ttk.Button(manifest_frame, text="Remove Selected", command=self._remove_manifest)
        remove_button.grid(row=1, column=1, padx=5, pady=5, sticky="w")

        # --- Diagnostics ---
        diag_frame = ttk.LabelFrame(self, text="Diagnostics")
        diag_frame.grid(row=3, column=0, padx=10, pady=10, sticky="ew")

        self.retention_days_var = tk.IntVar(value=90)
        ttk.Label(diag_frame, text="Retention (days):").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        ttk.Spinbox(diag_frame, from_=0, to=365, textvariable=self.retention_days_var).grid(row=0, column=1, padx=5, pady=5, sticky="w")

        # --- Privacy ---
        privacy_frame = ttk.LabelFrame(self, text="Privacy")
        privacy_frame.grid(row=4, column=0, padx=10, pady=10, sticky="ew")

        self.redact_paths_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(privacy_frame, text="Redact local paths in exports", variable=self.redact_paths_var).grid(row=0, column=0, sticky="w")

        self.redact_username_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(privacy_frame, text="Redact username in exports", variable=self.redact_username_var).grid(row=1, column=0, sticky="w")
        
        self.exclude_other_mods_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(privacy_frame, text="Exclude non-TS4Rebels mods from exports", variable=self.exclude_other_mods_var).grid(row=2, column=0, sticky="w")

        # --- Conflict Detection ---
        conflict_frame = ttk.LabelFrame(self, text="Conflict Detection")
        conflict_frame.grid(row=5, column=0, padx=10, pady=10, sticky="ew")

        self.conflict_ruleset_var = tk.StringVar()
        ttk.Label(conflict_frame, text="Ruleset:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        conflict_rulesets = ["conservative", "balanced", "aggressive"]
        ttk.Combobox(conflict_frame, textvariable=self.conflict_ruleset_var, values=conflict_rulesets).grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        
    def _browse_vault_path(self):
        path = filedialog.askdirectory()
        if path:
            self.vault_path_var.set(path)

    def _add_manifest(self):
        paths = filedialog.askopenfilenames(
            title="Select Manifest Files",
            filetypes=[("JSON files", "*.json"), ("CSV files", "*.csv"), ("All files", "*.*")]
        )
        for path in paths:
            if path not in self.manifest_listbox.get(0, tk.END):
                self.manifest_listbox.insert(tk.END, path)

    def _remove_manifest(self):
        selection = self.manifest_listbox.curselection()
        if selection:
            self.manifest_listbox.delete(selection)

    def get_settings(self):
        return {
            "vault_path": self.vault_path_var.get(),
            "vault_structure_preset": self.structure_preset_var.get(),
            "manifest_paths": list(self.manifest_listbox.get(0, tk.END)),
            "diagnostics_retention_days": self.retention_days_var.get(),
            "redact_local_paths_in_exports": self.redact_paths_var.get(),
            "redact_username_in_exports": self.redact_username_var.get(),
            "exclude_non_ts4rebels_mods_from_exports": self.exclude_other_mods_var.get(),
            "conflict_ruleset": self.conflict_ruleset_var.get(),
        }

    def set_settings(self, settings):
        self.vault_path_var.set(settings.get("vault_path", ""))
        self.structure_preset_var.set(settings.get("vault_structure_preset", "mixed"))
        
        self.manifest_listbox.delete(0, tk.END)
        for path in settings.get("manifest_paths", []):
            self.manifest_listbox.insert(tk.END, path)
            
        self.retention_days_var.set(settings.get("diagnostics_retention_days", 90))
        self.redact_paths_var.set(settings.get("redact_local_paths_in_exports", True))
        self.redact_username_var.set(settings.get("redact_username_in_exports", True))
        self.exclude_other_mods_var.set(settings.get("exclude_non_ts4rebels_mods_from_exports", True))
        self.conflict_ruleset_var.set(settings.get("conflict_ruleset", "balanced"))

if __name__ == '__main__':
    # Example usage
    root = tk.Tk()
    root.title("Settings Panel Demo")
    
    try:
        from ttkbootstrap import Style
        style = Style(theme='darkly')
        root = style.master
    except ImportError:
        print("ttkbootstrap not found, using default ttk styles.")

    settings_panel = SettingsPanel(root, padding=20)
    settings_panel.pack(fill="both", expand=True)

    def print_settings():
        print(settings_panel.get_settings())

    ttk.Button(root, text="Save Settings", command=print_settings).pack(pady=10)

    root.mainloop()
