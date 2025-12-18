import json
from pathlib import Path
from typing import Dict, Any

class DesignTokenManager:
    """
    Manages loading and access to design tokens from design_tokens.json.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DesignTokenManager, cls).__new__(cls)
            cls._instance._load_tokens()
        return cls._instance

    def _load_tokens(self):
        token_file_path = Path(__file__).parent / "design_tokens.json"
        if not token_file_path.exists():
            raise FileNotFoundError(f"Design tokens file not found: {token_file_path}")
        
        with open(token_file_path, 'r', encoding='utf-8') as f:
            self._tokens = json.load(f)

    def get_color(self, key: str) -> str:
        """Retrieves a color token by key."""
        return self._tokens["colors"].get(key, "#000000") # Default to black if not found

    def get_typography(self, key: str) -> Dict[str, Any]:
        """Retrieves typography tokens by key."""
        return self._tokens["typography"].get(key, {})

    def get_spacing(self, key: str) -> int:
        """Retrieves a spacing token by key."""
        return self._tokens["spacing"].get(key, 0) # Default to 0 if not found

    def get_border_radius(self, key: str) -> int:
        """Retrieves a border radius token by key."""
        return self._tokens["border_radii"].get(key, 0) # Default to 0 if not found

    def get_shadow(self, key: str) -> Dict[str, Any]:
        """Retrieves a shadow token by key."""
        return self._tokens["shadows"].get(key, {})
    
    def get_all_tokens(self) -> Dict[str, Any]:
        """Returns all loaded tokens."""
        return self._tokens

# Create a singleton instance for easy access throughout the application
design_token_manager = DesignTokenManager()
