"""Security validation utilities for JPE Sims 4 Mod Translator."""

import re
from pathlib import Path
from typing import Union, List
import mimetypes


class SecurityValidator:
    """Security validation utilities to prevent common vulnerabilities."""
    
    def __init__(self):
        # Define allowed file extensions
        self.allowed_extensions = {
            '.jpe', '.xml', '.json', '.txt', '.py', '.md', '.rst', 
            '.yaml', '.yml', '.cfg', '.ini', '.toml'
        }
        
        # Define allowed mime types for uploaded files
        self.allowed_mime_types = {
            'text/plain', 'text/xml', 'application/xml', 'application/json',
            'text/markdown', 'text/yaml', 'text/x-python'
        }
    
    def validate_file_path(self, path: Union[str, Path], base_dir: Path = None) -> bool:
        """Validate that a file path is safe and has allowed extension."""
        path_obj = Path(path) if isinstance(path, str) else path
        
        # Resolve the path to prevent directory traversal
        try:
            resolved_path = path_obj.resolve()
        except (OSError, RuntimeError):
            return False  # Cannot resolve path
        
        # If base directory is provided, ensure path is within it
        if base_dir:
            try:
                resolved_path.relative_to(base_dir.resolve())
            except ValueError:
                return False  # Path is outside base directory
        
        # Check file extension
        if resolved_path.suffix.lower() not in self.allowed_extensions:
            return False
        
        # Additional checks to prevent path traversal
        path_str = str(resolved_path)
        if '..' in path_str or '~' in path_str:
            return False
        
        return True
    
    def validate_file_content_type(self, file_path: Union[str, Path]) -> bool:
        """Validate the content type of a file."""
        path_obj = Path(file_path)
        
        # Get mime type from file content
        mime_type, _ = mimetypes.guess_type(str(path_obj))
        
        if mime_type and mime_type in self.allowed_mime_types:
            return True
        
        # If mime type detection failed, check extension
        if path_obj.suffix.lower() in self.allowed_extensions:
            return True
        
        return False
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize a filename to prevent path traversal and other issues."""
        # Remove path components
        filename = Path(filename).name
        
        # Replace potentially dangerous characters
        filename = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # Limit length (prevent buffer overflow in some systems)
        max_len = 255
        if len(filename) > max_len:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:max_len - len(ext) - 1] + ('.' + ext if ext else '')
        
        return filename
    
    def validate_file_size(self, file_path: Union[str, Path], max_size: int = None) -> bool:
        """Validate that a file is not too large."""
        if max_size is None:
            # Get from config or use default
            from .config.config_manager import config_manager
            max_size = config_manager.get("security.max_file_size", 50 * 1024 * 1024)  # 50MB
        
        path_obj = Path(file_path)
        
        if not path_obj.exists():
            return False
        
        try:
            file_size = path_obj.stat().st_size
            return file_size <= max_size
        except OSError:
            return False  # Cannot determine file size
    
    def validate_project_path(self, project_path: Union[str, Path]) -> bool:
        """Validate a project directory path for safety."""
        path_obj = Path(project_path)
        
        # Check if path is absolute to prevent confusion
        if not path_obj.is_absolute():
            path_obj = path_obj.resolve()
        
        # Validate path components
        for part in path_obj.parts:
            if part.startswith('..') or part.startswith('~'):
                return False
        
        # Check if it's a directory
        if not path_obj.is_dir():
            return False
        
        return True


# Global security validator instance
security_validator = SecurityValidator()