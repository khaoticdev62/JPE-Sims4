"""Configuration management system for JPE Sims 4 Mod Translator."""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
import hashlib
import base64


class ConfigManager:
    """Secure configuration management system."""
    
    def __init__(self, config_file: Optional[Path] = None):
        self.config_file = config_file or Path.home() / ".jpe-sims4" / "config.json"
        self.config_dir = self.config_file.parent
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize with default values
        self.config = self._get_defaults()
        self._load_config()
        
        # Initialize encryption
        self._initialize_encryption()
    
    def _get_defaults(self) -> Dict[str, Any]:
        """Get default configuration values."""
        return {
            "app": {
                "name": "JPE Sims 4 Mod Translator",
                "version": "0.1.0",
                "data_dir": str(Path.home() / ".jpe-sims4-data"),
                "log_level": "INFO",
                "max_log_size": 10 * 1024 * 1024,  # 10MB
                "max_log_files": 5
            },
            "ui": {
                "theme": "default",
                "font_size": 10,
                "window_width": 1200,
                "window_height": 800,
                "show_line_numbers": True,
                "word_wrap": True,
                "auto_save": True
            },
            "security": {
                "api_keys_encrypted": {},
                "max_file_size": 50 * 1024 * 1024,  # 50MB
                "allowed_extensions": [".jpe", ".xml", ".json", ".txt", ".py"],
                "sanitize_logs": True,
                "session_timeout": 3600  # 1 hour
            },
            "cloud": {
                "api_base_url": "https://api.jpe-sims4.com",
                "sync_enabled": False,
                "auto_sync": False
            },
            "plugins": {
                "enabled": True,
                "trusted_only": True,
                "auto_update": False
            }
        }
    
    def _initialize_encryption(self):
        """Initialize encryption for sensitive data."""
        # Create key from a hash of user directory for portability
        key_source = str(self.config_dir).encode() + os.urandom(16)
        key = hashlib.sha256(key_source).digest()
        self.cipher = Fernet(base64.urlsafe_b64encode(key.ljust(32, b'\0')))
    
    def _load_config(self):
        """Load configuration from file."""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    file_config = json.load(f)
                
                # Merge with defaults to ensure all keys exist
                self.config = self._deep_merge(self.config, file_config)
            except Exception:
                # If config is corrupted, use defaults
                pass
    
    def _deep_merge(self, base: Dict, override: Dict) -> Dict:
        """Deep merge two dictionaries."""
        result = base.copy()
        
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = self._deep_merge(result[key], value)
            else:
                result[key] = value
        
        return result
    
    def save(self):
        """Save configuration to file."""
        # Create a copy without encrypted data to save
        save_config = self.config.copy()
        
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(save_config, f, indent=2, ensure_ascii=False)
    
    def get(self, key_path: str, default: Any = None) -> Any:
        """Get a configuration value using dot notation (e.g., 'ui.theme')."""
        keys = key_path.split('.')
        value = self.config
        
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        
        return value
    
    def set(self, key_path: str, value: Any):
        """Set a configuration value using dot notation."""
        keys = key_path.split('.')
        config_ref = self.config

        for key in keys[:-1]:
            if key not in config_ref:
                config_ref[key] = {}
            config_ref = config_ref[key]

        config_ref[keys[-1]] = value
        self.save()

    def save(self):
        """Save configuration to file."""
        # Create a copy without encrypted data to save
        save_config = self.config.copy()

        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(save_config, f, indent=2, ensure_ascii=False)
    
    def store_secure(self, key: str, value: str):
        """Store a sensitive value securely."""
        encrypted_value = self.cipher.encrypt(value.encode()).decode()
        
        if "security" not in self.config:
            self.config["security"] = {}
        
        if "encrypted_data" not in self.config["security"]:
            self.config["security"]["encrypted_data"] = {}
        
        self.config["security"]["encrypted_data"][key] = encrypted_value
        self.save()
    
    def retrieve_secure(self, key: str) -> Optional[str]:
        """Retrieve a sensitive value securely."""
        if ("security" in self.config and 
            "encrypted_data" in self.config["security"] and 
            key in self.config["security"]["encrypted_data"]):
            encrypted_value = self.config["security"]["encrypted_data"][key]
            try:
                return self.cipher.decrypt(encrypted_value.encode()).decode()
            except Exception:
                # If decryption fails, return None
                return None
        return None
    
    def validate_path(self, path: Path) -> bool:
        """Validate that a path is safe to use (prevent directory traversal)."""
        try:
            # Resolve the path to its absolute form
            resolved_path = path.resolve()
            config_dir_resolved = self.config_dir.resolve()
            
            # Check if the resolved path is within the allowed directory
            resolved_path.relative_to(config_dir_resolved)
            return True
        except ValueError:
            # Path is outside the allowed directory
            return False
    
    def get_safe_path(self, path: Path, base_dir: Optional[Path] = None) -> Optional[Path]:
        """Get a safe path within allowed directories."""
        if base_dir is None:
            base_dir = Path.cwd()
        
        try:
            # Join the base directory with the provided path
            safe_path = (base_dir / path).resolve()
            
            # Verify it's within the base directory
            safe_path.relative_to(base_dir.resolve())
            return safe_path
        except ValueError:
            # Path traversal detected
            return None


# Global config manager instance
config_manager = ConfigManager()