"""Cloud sync API for JPE Sims 4 Mod Translator."""

import json
import tempfile
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import shutil
import hashlib
import requests
from datetime import datetime
import os

import sys
from pathlib import Path
# Add the parent directory to the path to allow imports
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from engine.ir import ProjectIR
from diagnostics.errors import EngineError
from config.config_manager import config_manager


@dataclass
class CloudProjectMetadata:
    """Metadata for a cloud-synced project."""
    project_id: str
    name: str
    version: str
    author: str
    created_at: str
    modified_at: str
    last_sync_at: str
    file_hash: str
    size_bytes: int


@dataclass
class SyncResult:
    """Result of a sync operation."""
    success: bool
    message: str
    errors: List[EngineError]
    project_metadata: Optional[CloudProjectMetadata] = None


class CloudSyncAPI:
    """API for syncing projects with cloud storage."""

    def __init__(self, api_base_url: Optional[str] = None, api_key: Optional[str] = None):
        # Get base URL from config if not provided
        self.api_base_url = api_base_url or config_manager.get("cloud.api_base_url", "https://api.jpe-sims4.com")

        # Use provided API key or retrieve from secure storage
        self._api_key = api_key or config_manager.retrieve_secure("cloud_api_key")

        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "JPE-Sims4-Translator/1.0.0"
        }
        if self._api_key:
            self.headers["Authorization"] = f"Bearer {self._api_key}"
    
    def authenticate(self, username: str, password: str) -> bool:
        """Authenticate with the cloud service."""
        try:
            response = requests.post(
                f"{self.api_base_url}/auth/login",
                json={"username": username, "password": password},
                headers={k: v for k, v in self.headers.items() if k != "Authorization"}  # Don't send old auth
            )
            if response.status_code == 200:
                token = response.json().get("token")
                if token:
                    self.headers["Authorization"] = f"Bearer {token}"
                    self._api_key = token
                    # Store securely in config
                    config_manager.store_secure("cloud_api_key", token)
                    return True
        except requests.RequestException:
            pass
        return False
    
    def upload_project(self, project_path: Path, user_id: str) -> SyncResult:
        """Upload a project to the cloud."""
        errors: List[EngineError] = []
        
        try:
            if not project_path.exists():
                errors.append(EngineError(
                    code="PROJECT_NOT_FOUND",
                    message_short="Project directory does not exist",
                    message_long=f"The project path {project_path} does not exist",
                    severity="error",
                    category="sync_cloud"
                ))
                return SyncResult(success=False, message="Project not found", errors=errors)
            
            # Create a temporary archive of the project
            with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
                temp_path = Path(temp_file.name)
            
            # Create zip archive of project
            shutil.make_archive(str(temp_path.with_suffix('')), 'zip', project_path)
            
            # Calculate file hash and size
            file_hash = self._calculate_file_hash(temp_path)
            file_size = temp_path.stat().st_size
            
            # Create metadata
            metadata = CloudProjectMetadata(
                project_id=project_path.name,
                name=project_path.name,
                version="1.0.0",  # This would come from project config in a real implementation
                author="Unknown",
                created_at=datetime.now().isoformat(),
                modified_at=datetime.now().isoformat(),
                last_sync_at=datetime.now().isoformat(),
                file_hash=file_hash,
                size_bytes=file_size
            )
            
            # Upload the file
            with open(temp_path, 'rb') as f:
                files = {'file': f}
                data = {'metadata': json.dumps(asdict(metadata)), 'user_id': user_id}
                
                response = requests.post(
                    f"{self.api_base_url}/sync/upload",
                    files=files,
                    data=data,
                    headers={k: v for k, v in self.headers.items() if k != "Content-Type"}  # Don't set content type for multipart
                )
            
            # Clean up temp file
            temp_path.unlink()
            
            if response.status_code == 200:
                return SyncResult(
                    success=True,
                    message="Project uploaded successfully",
                    errors=[],
                    project_metadata=metadata
                )
            else:
                errors.append(EngineError(
                    code="UPLOAD_FAILED",
                    message_short="Failed to upload project",
                    message_long=f"Server responded with status {response.status_code}: {response.text}",
                    severity="error",
                    category="sync_cloud"
                ))
                return SyncResult(success=False, message="Upload failed", errors=errors)
                
        except Exception as e:
            errors.append(EngineError(
                code="UPLOAD_ERROR",
                message_short="Error during upload",
                message_long=str(e),
                severity="error",
                category="sync_cloud"
            ))
            return SyncResult(success=False, message=str(e), errors=errors)
    
    def download_project(self, project_id: str, user_id: str, target_path: Path) -> SyncResult:
        """Download a project from the cloud."""
        errors: List[EngineError] = []
        
        try:
            response = requests.get(
                f"{self.api_base_url}/sync/download",
                params={"project_id": project_id, "user_id": user_id},
                headers=self.headers
            )
            
            if response.status_code == 200:
                # Save the downloaded content to a temporary file
                with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
                    temp_file.write(response.content)
                    temp_path = Path(temp_file.name)
                
                # Extract the zip to target location
                shutil.unpack_archive(str(temp_path), str(target_path))
                
                # Clean up temp file
                temp_path.unlink()
                
                return SyncResult(
                    success=True,
                    message="Project downloaded successfully",
                    errors=[]
                )
            else:
                errors.append(EngineError(
                    code="DOWNLOAD_FAILED",
                    message_short="Failed to download project",
                    message_long=f"Server responded with status {response.status_code}: {response.text}",
                    severity="error",
                    category="sync_cloud"
                ))
                return SyncResult(success=False, message="Download failed", errors=errors)
                
        except Exception as e:
            errors.append(EngineError(
                code="DOWNLOAD_ERROR",
                message_short="Error during download",
                message_long=str(e),
                severity="error",
                category="sync_cloud"
            ))
            return SyncResult(success=False, message=str(e), errors=errors)
    
    def list_user_projects(self, user_id: str) -> tuple[List[CloudProjectMetadata], List[EngineError]]:
        """List all projects for a user."""
        errors: List[EngineError] = []
        projects = []
        
        try:
            response = requests.get(
                f"{self.api_base_url}/sync/projects",
                params={"user_id": user_id},
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                for proj_data in data.get("projects", []):
                    project = CloudProjectMetadata(
                        project_id=proj_data["project_id"],
                        name=proj_data["name"],
                        version=proj_data["version"],
                        author=proj_data["author"],
                        created_at=proj_data["created_at"],
                        modified_at=proj_data["modified_at"],
                        last_sync_at=proj_data["last_sync_at"],
                        file_hash=proj_data["file_hash"],
                        size_bytes=proj_data["size_bytes"]
                    )
                    projects.append(project)
            else:
                errors.append(EngineError(
                    code="LIST_FAILED",
                    message_short="Failed to list projects",
                    message_long=f"Server responded with status {response.status_code}",
                    severity="error",
                    category="sync_cloud"
                ))
        except Exception as e:
            errors.append(EngineError(
                code="LIST_ERROR",
                message_short="Error listing projects",
                message_long=str(e),
                severity="error",
                category="sync_cloud"
            ))
        
        return projects, errors
    
    def delete_project(self, project_id: str, user_id: str) -> SyncResult:
        """Delete a project from the cloud."""
        errors: List[EngineError] = []
        
        try:
            response = requests.delete(
                f"{self.api_base_url}/sync/project",
                json={"project_id": project_id, "user_id": user_id},
                headers=self.headers
            )
            
            if response.status_code == 200:
                return SyncResult(success=True, message="Project deleted successfully", errors=[])
            else:
                errors.append(EngineError(
                    code="DELETE_FAILED",
                    message_short="Failed to delete project",
                    message_long=f"Server responded with status {response.status_code}",
                    severity="error",
                    category="sync_cloud"
                ))
                return SyncResult(success=False, message="Delete failed", errors=errors)
        except Exception as e:
            errors.append(EngineError(
                code="DELETE_ERROR",
                message_short="Error deleting project",
                message_long=str(e),
                severity="error",
                category="sync_cloud"
            ))
            return SyncResult(success=False, message=str(e), errors=errors)
    
    def _calculate_file_hash(self, file_path: Path) -> str:
        """Calculate SHA256 hash of a file."""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()


class CloudSyncManager:
    """Higher-level manager for cloud sync operations."""
    
    def __init__(self, api: CloudSyncAPI):
        self.api = api
    
    def sync_project_to_cloud(self, project_path: Path, user_id: str, sync_conflicts: bool = True) -> SyncResult:
        """Synchronize a project to the cloud, handling conflicts."""
        # First check if project exists in cloud
        projects, errors = self.api.list_user_projects(user_id)
        if errors:
            return SyncResult(success=False, message="Could not list existing projects", errors=errors)
        
        project_exists = any(p.project_id == project_path.name for p in projects)
        
        if project_exists and not sync_conflicts:
            return SyncResult(
                success=False,
                message="Project already exists in cloud. Use sync_conflicts=True to overwrite.",
                errors=[EngineError(
                    code="PROJECT_EXISTS",
                    message_short="Project already exists in cloud",
                    message_long="A project with the same ID already exists in the cloud",
                    severity="warning",
                    category="sync_cloud"
                )]
            )
        
        # Upload the project
        return self.api.upload_project(project_path, user_id)
    
    def sync_project_from_cloud(self, project_id: str, user_id: str, target_path: Path) -> SyncResult:
        """Synchronize a project from the cloud."""
        return self.api.download_project(project_id, user_id, target_path)