import requests
import os
import zipfile
import rarfile # Requires rarfile library which needs unrar or rar executable in system PATH
from pathlib import Path
from typing import Optional, Callable
from urllib.parse import urlparse

class DownloadError(Exception):
    """Custom exception for download-related errors."""
    pass

class DownloadManager:
    """Manages downloading files from URLs and optional extraction."""

    def __init__(self, vault_root: Path):
        self.vault_root = vault_root

    def download_file(self, url: str, target_subfolder: Optional[Path] = None,
                      progress_callback: Optional[Callable[[int, int], None]] = None) -> Path:
        """
        Downloads a file from the given URL into the vault.

        Args:
            url: The URL of the file to download.
            target_subfolder: An optional subfolder within the vault to save the file.
                              If None, saves to the vault root.
            progress_callback: A callback function (current_bytes, total_bytes) for progress updates.

        Returns:
            The Path to the downloaded file.

        Raises:
            DownloadError: If the download fails for any reason.
        """
        if not self.vault_root.is_dir():
            raise DownloadError(f"Vault root is not a valid directory: {self.vault_root}")

        try:
            response = requests.get(url, stream=True, allow_redirects=True)
            response.raise_for_status()  # Raise an exception for HTTP errors

            # Determine filename
            filename = self._get_filename_from_url(url, response.headers)
            
            # Determine save path
            save_dir = self.vault_root
            if target_subfolder:
                save_dir = self.vault_root / target_subfolder
            save_dir.mkdir(parents=True, exist_ok=True)
            
            save_path = save_dir / filename

            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)
                        if progress_callback:
                            progress_callback(downloaded_size, total_size)
            
            return save_path

        except requests.exceptions.RequestException as e:
            raise DownloadError(f"Network or HTTP error during download: {e}")
        except Exception as e:
            raise DownloadError(f"An unexpected error occurred during download: {e}")

    def _get_filename_from_url(self, url: str, headers: Dict[str, str]) -> str:
        # Try Content-Disposition header first
        if 'Content-Disposition' in headers:
            import re
            fname = re.findall(r'filename="(.+)"', headers['Content-Disposition'])
            if fname:
                return fname[0]
        
        # Fallback to URL path
        path = urlparse(url).path
        return Path(path).name or "downloaded_file" # Default if path is empty

    def extract_archive(self, archive_path: Path, extract_to_subfolder: bool = True) -> Path:
        """
        Extracts a .zip or .rar archive into a subfolder within the vault.

        Args:
            archive_path: The path to the archive file.
            extract_to_subfolder: If True, extracts to a new folder named after the archive.
                                  Otherwise, extracts directly to the archive's parent directory.

        Returns:
            The Path to the directory where contents were extracted.

        Raises:
            DownloadError: If extraction fails or archive type is unsupported.
        """
        if not archive_path.exists():
            raise DownloadError(f"Archive file not found: {archive_path}")

        extract_dir = archive_path.parent
        if extract_to_subfolder:
            extract_dir = extract_dir / archive_path.stem
            extract_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            if archive_path.suffix.lower() == '.zip':
                with zipfile.ZipFile(archive_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_dir)
            elif archive_path.suffix.lower() == '.rar':
                # Check if rarfile is installed and unrar/rar is in PATH
                if 'rarfile' not in globals():
                     raise DownloadError("rarfile library not imported. Please install it (`pip install rarfile`) and ensure 'unrar' or 'rar' executable is in your system PATH for .rar support.")
                with rarfile.RarFile(archive_path, 'r') as rar_ref:
                    rar_ref.extractall(extract_dir)
            else:
                raise DownloadError(f"Unsupported archive type: {archive_path.suffix}")
            
            # Optionally delete the archive after extraction
            # os.remove(archive_path) 
            
            return extract_dir

        except zipfile.BadZipFile as e:
            raise DownloadError(f"Corrupt or invalid zip file: {e}")
        except rarfile.BadRarFile as e:
            raise DownloadError(f"Corrupt or invalid rar file: {e}")
        except Exception as e:
            raise DownloadError(f"An unexpected error occurred during extraction: {e}")
