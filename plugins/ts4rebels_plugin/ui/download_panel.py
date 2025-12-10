import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from pathlib import Path
import threading
from typing import Optional, Callable

# Import the DownloadManager
from ...download_manager import DownloadManager, DownloadError

class DownloadPanel(ttk.Frame):
    """
    A tkinter frame for managing TS4Rebels mod downloads.
    """
    def __init__(self, parent, vault_root: Path, scan_callback: Optional[Callable[[], None]] = None, *args, **kwargs):
        super().__init__(parent, *args, **kwargs)
        self.vault_root = vault_root
        self.scan_callback = scan_callback
        self.download_manager = DownloadManager(vault_root=self.vault_root)
        self.create_widgets()

    def create_widgets(self):
        # --- URL Input ---
        url_frame = ttk.LabelFrame(self, text="Download URL")
        url_frame.pack(fill="x", padx=10, pady=5, expand=True)
        url_frame.columnconfigure(1, weight=1)

        ttk.Label(url_frame, text="Mod URL:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.url_var = tk.StringVar()
        ttk.Entry(url_frame, textvariable=self.url_var).grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        
        # --- Target Folder ---
        target_frame = ttk.LabelFrame(self, text="Target Folder in Vault")
        target_frame.pack(fill="x", padx=10, pady=5, expand=True)
        target_frame.columnconfigure(1, weight=1)

        ttk.Label(target_frame, text="Subfolder:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.target_subfolder_var = tk.StringVar(value="")
        ttk.Entry(target_frame, textvariable=self.target_subfolder_var).grid(row=0, column=1, padx=5, pady=5, sticky="ew")
        ttk.Button(target_frame, text="Browse...", command=self._browse_target_subfolder).grid(row=0, column=2, padx=5, pady=5)

        # --- Options ---
        options_frame = ttk.Frame(self)
        options_frame.pack(fill="x", padx=10, pady=5, expand=True)

        self.extract_archive_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Extract archive after download (if applicable)", variable=self.extract_archive_var).pack(anchor="w")

        # --- Download Button ---
        self.download_button = ttk.Button(self, text="Download Mod", command=self._start_download_thread)
        self.download_button.pack(pady=10)

        # --- Progress Display ---
        progress_frame = ttk.LabelFrame(self, text="Download Progress")
        progress_frame.pack(fill="x", padx=10, pady=5, expand=True)
        progress_frame.columnconfigure(0, weight=1)

        self.progress_bar = ttk.Progressbar(progress_frame, orient="horizontal", mode="determinate")
        self.progress_bar.grid(row=0, column=0, padx=5, pady=5, sticky="ew")
        self.progress_label = ttk.Label(progress_frame, text="Idle")
        self.progress_label.grid(row=1, column=0, padx=5, pady=5, sticky="ew")

    def _browse_target_subfolder(self):
        # Allow user to pick a folder within the vault_root
        current_subfolder = self.target_subfolder_var.get()
        initial_dir = self.vault_root / current_subfolder
        if not initial_dir.is_dir():
            initial_dir = self.vault_root # Fallback to vault root if path is invalid

        chosen_dir = filedialog.askdirectory(parent=self, initialdir=str(initial_dir), title="Select Subfolder for Download")
        if chosen_dir:
            try:
                # Ensure the chosen directory is within the vault_root
                relative_path = Path(chosen_dir).relative_to(self.vault_root)
                self.target_subfolder_var.set(str(relative_path))
            except ValueError:
                messagebox.showerror("Invalid Folder", f"Please select a folder within your configured vault root: {self.vault_root}")

    def _start_download_thread(self):
        url = self.url_var.get()
        if not url:
            messagebox.showwarning("Input Error", "Please enter a URL to download.")
            return

        self.download_button.config(state="disabled")
        self.progress_label.config(text="Starting download...")
        self.progress_bar.config(value=0, mode="indeterminate")

        # Run download in a separate thread to keep UI responsive
        download_thread = threading.Thread(target=self._perform_download, args=(url,))
        download_thread.daemon = True
        download_thread.start()

    def _progress_callback(self, current: int, total: int):
        # Update UI from the main thread
        self.after(0, lambda: self._update_progress_ui(current, total))

    def _update_progress_ui(self, current: int, total: int):
        if total > 0:
            percentage = (current / total) * 100
            self.progress_bar.config(mode="determinate", value=percentage)
            self.progress_label.config(text=f"Downloading: {current}/{total} bytes ({percentage:.2f}%)")
        else:
            # For indeterminate mode or when total size is unknown
            self.progress_label.config(text=f"Downloading: {current} bytes")

    def _perform_download(self, url: str):
        try:
            target_subfolder_str = self.target_subfolder_var.get()
            target_subfolder = Path(target_subfolder_str) if target_subfolder_str else None

            downloaded_path = self.download_manager.download_file(
                url,
                target_subfolder=target_subfolder,
                progress_callback=self._progress_callback
            )
            
            self.after(0, lambda: self.progress_label.config(text=f"Download complete: {downloaded_path.name}"))
            self.after(0, lambda: self.progress_bar.config(value=100))

            if self.extract_archive_var.get():
                if downloaded_path.suffix.lower() in ('.zip', '.rar'):
                    self.after(0, lambda: self.progress_label.config(text="Extracting archive..."))
                    extracted_dir = self.download_manager.extract_archive(downloaded_path)
                    self.after(0, lambda: messagebox.showinfo("Success", f"Download & Extraction complete! Extracted to {extracted_dir}"))
                else:
                    self.after(0, lambda: messagebox.showinfo("Success", f"Download complete! Saved to {downloaded_path}"))
            else:
                self.after(0, lambda: messagebox.showinfo("Success", f"Download complete! Saved to {downloaded_path}"))

            # Trigger incremental scan after download/extraction (FR-D3)
            if self.scan_callback:
                self.after(0, self.scan_callback)

        except DownloadError as e:
            self.after(0, lambda: messagebox.showerror("Download Error", str(e)))
            self.after(0, lambda: self.progress_label.config(text="Download Failed"))
        except Exception as e:
            self.after(0, lambda: messagebox.showerror("Error", f"An unexpected error occurred: {e}"))
            self.after(0, lambda: self.progress_label.config(text="Download Failed"))
        finally:
            self.after(0, lambda: self.download_button.config(state="enabled"))

if __name__ == '__main__':
    root = tk.Tk()
    root.title("Download Panel Demo")
    
    try:
        from ttkbootstrap import Style
        style = Style(theme='darkly')
        root = style.master
    except ImportError:
        print("ttkbootstrap not found, using default ttk styles.")

    # Create a dummy vault root for demonstration
    dummy_vault_root = Path("./dummy_ts4rebels_vault")
    dummy_vault_root.mkdir(exist_ok=True)

    panel = DownloadPanel(root, vault_root=dummy_vault_root, padding=20)
    panel.pack(fill="both", expand=True)
    root.mainloop()

    # Clean up dummy vault
    import shutil
    if dummy_vault_root.exists():
        shutil.rmtree(dummy_vault_root)
