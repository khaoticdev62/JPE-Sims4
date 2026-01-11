"""Metadata extraction for Sims 4 files."""

from pathlib import Path
from typing import Dict, Any, Optional
import struct


class CCMetadataExtractor:
    """Extracts internal metadata from .package files."""
    
    def extract(self, file_path: Path) -> Dict[str, Any]:
        """Determine file type and extract appropriate metadata."""
        if file_path.suffix == '.package':
            return self._extract_package_metadata(file_path)
        elif file_path.suffix == '.ts4script':
            return self._extract_script_metadata(file_path)
        return {}
        
    def _extract_package_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract DBPF header information."""
        metadata = {"type": "DBPF"}
        try:
            with open(file_path, "rb") as f:
                header = f.read(96)
                if len(header) < 96:
                    return metadata
                    
                magic = header[0:4].decode('ascii', errors='ignore')
                if magic != 'DBPF':
                    return metadata
                    
                major = struct.unpack('<I', header[4:8])[0]
                minor = struct.unpack('<I', header[8:12])[0]
                metadata["version"] = f"{major}.{minor}"
                
                # In a real implementation, we would parse the index 
                # to find the manifest or STBL strings for the name/desc
        except Exception:
            pass
        return metadata
        
    def _extract_script_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract basic info from zip-based script files."""
        return {"type": "TS4Script"}
