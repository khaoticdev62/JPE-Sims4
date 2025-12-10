"""
Cloud API System for JPE Sims 4 Mod Translator.

This module provides cloud synchronization, project sharing, and remote collaboration
capabilities for the mod translation system.
"""

import asyncio
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any, Callable, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import hashlib
import aiohttp
import requests
from enum import Enum

from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity
from diagnostics.sentinel import SentinelExceptionLogger
from engine.ir import ProjectIR


class CloudSyncStatus(Enum):
    """Status of cloud synchronization operations."""
    IDLE = "idle"
    SYNCING = "syncing"
    SYNCED = "synced"
    ERROR = "error"
    OFFLINE = "offline"


@dataclass
class CloudProject:
    """Represents a project in the cloud."""
    project_id: str
    name: str
    owner_id: str
    created_at: datetime
    modified_at: datetime
    collaborators: List[str]
    file_hashes: Dict[str, str]  # filename -> hash
    version: str = "1.0.0"
    description: str = ""
    last_synced: Optional[datetime] = None


@dataclass
class CloudFileSyncState:
    """Tracks the sync state of a specific file."""
    filename: str
    local_hash: str
    cloud_hash: Optional[str]
    sync_status: str  # "synced", "local_changed", "cloud_changed", "conflict"
    last_synced: Optional[datetime] = None


@dataclass(slots=True)
class CloudSyncError:
    """Represents an error returned by the cloud sync API."""
    code: str
    message: str


@dataclass(slots=True)
class CloudProjectMetadata:
    """Lightweight metadata for a synced project."""
    project_id: str
    name: str
    version: str
    author: str
    created_at: str
    modified_at: str
    last_sync_at: Optional[str]
    file_hash: str
    size_bytes: int


@dataclass(slots=True)
class SyncResult:
    """Represents the outcome of an API operation."""
    success: bool
    message: str
    errors: List[CloudSyncError]
    project_metadata: Optional[CloudProjectMetadata] = None


class CloudSyncAPI:
    """Synchronous helper used by tests and lightweight tools."""

    def __init__(self, api_base_url: str = "https://api.jpe-sims4.com", api_key: Optional[str] = None):
        self.api_base_url = api_base_url.rstrip("/")
        self.api_key = api_key or os.getenv("JPE_API_KEY")

    def authenticate(self, username: str, password: str) -> bool:
        """Authenticate the user and update the stored API key."""
        payload = {"username": username, "password": password}
        try:
            response = requests.post(f"{self.api_base_url}/auth/login", json=payload, timeout=10)
        except requests.RequestException:
            return False

        if response.status_code == 200:
            data = response.json() or {}
            token = data.get("token")
            if token:
                self.api_key = token
            return True
        return False

    def upload_project(self, project_path: Path, username: str) -> SyncResult:
        """Upload a project directory to the cloud service."""
        errors: List[CloudSyncError] = []
        if not project_path.exists() or not project_path.is_dir():
            errors.append(CloudSyncError("PROJECT_NOT_FOUND", f"Directory '{project_path}' does not exist."))
            return SyncResult(False, "Project directory was not found", errors)

        project_files = list(project_path.glob("**/*"))
        if not any(p.is_file() for p in project_files):
            errors.append(CloudSyncError("PROJECT_EMPTY", "No files found in project directory."))
            return SyncResult(False, "Project directory is empty", errors)

        metadata = self._create_project_metadata(project_path, username)
        payload = {
            "project_id": metadata.project_id,
            "name": metadata.name,
            "version": metadata.version,
            "author": metadata.author,
            "files": self._serialize_project_files(project_path),
        }

        try:
            response = requests.post(f"{self.api_base_url}/projects", json=payload, timeout=15)
        except requests.RequestException as exc:
            errors.append(CloudSyncError("UPLOAD_FAILED", str(exc)))
            return SyncResult(False, "Project upload failed", errors)

        if response.status_code == 200:
            return SyncResult(True, "Project uploaded successfully", [], metadata)

        errors.append(CloudSyncError("UPLOAD_FAILED", f"HTTP {response.status_code}"))
        return SyncResult(False, "Project upload failed", errors)

    def list_user_projects(self, username: str) -> Tuple[List[CloudProjectMetadata], List[CloudSyncError]]:
        """List projects for the specific user."""
        projects: List[CloudProjectMetadata] = []
        errors: List[CloudSyncError] = []
        try:
            response = requests.get(f"{self.api_base_url}/users/{username}/projects", timeout=10)
        except requests.RequestException as exc:
            errors.append(CloudSyncError("LIST_FAILED", str(exc)))
            return projects, errors

        if response.status_code != 200:
            errors.append(CloudSyncError("LIST_FAILED", f"HTTP {response.status_code}"))
            return projects, errors

        data = response.json() or {}
        for item in data.get("projects", []):
            projects.append(
                CloudProjectMetadata(
                    project_id=item.get("project_id", ""),
                    name=item.get("name", ""),
                    version=item.get("version", "0.0.0"),
                    author=item.get("author", ""),
                    created_at=item.get("created_at", ""),
                    modified_at=item.get("modified_at", ""),
                    last_sync_at=item.get("last_sync_at"),
                    file_hash=item.get("file_hash", ""),
                    size_bytes=int(item.get("size_bytes", 0)),
                )
            )
        return projects, errors

    def _serialize_project_files(self, project_path: Path) -> Dict[str, Dict[str, Any]]:
        """Create a payload of project files and hashes."""
        files: Dict[str, Dict[str, Any]] = {}
        for file_path in project_path.rglob("*"):
            if file_path.is_file():
                relative = file_path.relative_to(project_path).as_posix()
                content = file_path.read_bytes()
                files[relative] = {
                    "hash": hashlib.sha256(content).hexdigest(),
                    "size": len(content),
                }
        return files

    def _create_project_metadata(self, project_path: Path, username: str) -> CloudProjectMetadata:
        """Generate metadata for a project path."""
        hash_builder = hashlib.sha256()
        size = 0
        for file_path in sorted(project_path.rglob("*")):
            if file_path.is_file():
                content = file_path.read_bytes()
                hash_builder.update(content)
                size += len(content)

        digest = hash_builder.hexdigest()
        now = datetime.utcnow().isoformat()
        return CloudProjectMetadata(
            project_id=f"{username}_{project_path.name}",
            name=project_path.name,
            version="1.0.0",
            author=username,
            created_at=now,
            modified_at=now,
            last_sync_at=None,
            file_hash=digest,
            size_bytes=size,
        )


class CloudAPI:
    """Main class for interacting with the JPE cloud services."""
    
    def __init__(self, api_base_url: str = "https://api.jpe-sims4.com", 
                 api_key: Optional[str] = None):
        self.api_base_url = api_base_url.rstrip('/')
        self.api_key = api_key or os.getenv("JPE_API_KEY")
        self.session: Optional[aiohttp.ClientSession] = None
        self.sentinel_logger = SentinelExceptionLogger()
        self.sync_states: Dict[str, CloudFileSyncState] = {}
        self.current_sync_status = CloudSyncStatus.IDLE
        self.sync_progress_callback: Optional[Callable[[float, str], None]] = None
    
    async def __aenter__(self):
        """Async context manager entry."""
        if not self.session:
            self.session = aiohttp.ClientSession(
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
            self.session = None
    
    async def initialize_session(self):
        """Initialize the HTTP session."""
        if not self.session:
            self.session = aiohttp.ClientSession(
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
            )
    
    async def authenticate_user(self, username: str, password: str) -> Optional[str]:
        """Authenticate user and get API token."""
        try:
            await self.initialize_session()
            
            auth_data = {
                "username": username,
                "password": password
            }
            
            async with self.session.post(
                f"{self.api_base_url}/auth/login",
                json=auth_data
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    self.api_key = result.get("token")
                    # Update session with new token
                    await self.session.close()
                    self.session = aiohttp.ClientSession(
                        headers={"Authorization": f"Bearer {self.api_key}"}
                    )
                    return self.api_key
                else:
                    error_data = await response.json()
                    raise Exception(f"Authentication failed: {error_data.get('message', 'Unknown error')}")
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"username": username}
            )
            return None
    
    async def get_user_projects(self) -> List[CloudProject]:
        """Get list of projects belonging to the authenticated user."""
        try:
            await self.initialize_session()
            
            async with self.session.get(f"{self.api_base_url}/projects") as response:
                if response.status == 200:
                    projects_data = await response.json()
                    return [
                        CloudProject(
                            project_id=proj["id"],
                            name=proj["name"],
                            owner_id=proj["owner_id"],
                            created_at=datetime.fromisoformat(proj["created_at"]),
                            modified_at=datetime.fromisoformat(proj["modified_at"]),
                            collaborators=proj.get("collaborators", []),
                            file_hashes=proj.get("file_hashes", {}),
                            version=proj.get("version", "1.0.0"),
                            description=proj.get("description", ""),
                            last_synced=datetime.fromisoformat(proj["last_synced"]) if proj.get("last_synced") else None
                        ) for proj in projects_data
                    ]
                else:
                    error_data = await response.json()
                    raise Exception(f"Failed to get projects: {error_data.get('message', 'Unknown error')}")
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"api_endpoint": "/projects"}
            )
            return []
    
    async def upload_project(self, project_path: Path, project_name: str) -> bool:
        """Upload a project to the cloud."""
        try:
            await self.initialize_session()
            
            # Calculate file hashes for project
            files_to_upload = {}
            for file_path in project_path.rglob("*.[jpe|xml|json|txt]"):  # JPE and related files
                if file_path.is_file():
                    with open(file_path, "rb") as f:
                        content = f.read()
                        file_hash = hashlib.sha256(content).hexdigest()
                        relative_path = file_path.relative_to(project_path).as_posix()
                        files_to_upload[relative_path] = {
                            "content": content.decode('utf-8'),
                            "hash": file_hash
                        }
            
            # Upload project metadata
            project_data = {
                "name": project_name,
                "description": f"JPE project uploaded from local: {project_path.name}",
                "files": {name: {"hash": info["hash"]} for name, info in files_to_upload.items()},
                "version": "1.0.0"
            }
            
            async with self.session.post(
                f"{self.api_base_url}/projects",
                json=project_data
            ) as response:
                if response.status == 201:
                    result = await response.json()
                    project_id = result["project_id"]
                    
                    # Upload individual files
                    for file_path, file_info in files_to_upload.items():
                        if self.sync_progress_callback:
                            self.sync_progress_callback(0.2, f"Uploading {file_path}...")
                        
                        file_upload_data = {
                            "project_id": project_id,
                            "file_path": file_path,
                            "content": file_info["content"],
                            "hash": file_info["hash"]
                        }
                        
                        await self.session.post(
                            f"{self.api_base_url}/projects/{project_id}/files",
                            json=file_upload_data
                        )
                    
                    if self.sync_progress_callback:
                        self.sync_progress_callback(1.0, "Upload completed successfully!")
                    
                    return True
                else:
                    error_data = await response.json()
                    raise Exception(f"Failed to upload project: {error_data.get('message', 'Unknown error')}")
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"project_path": str(project_path), "project_name": project_name}
            )
            if self.sync_progress_callback:
                self.sync_progress_callback(0.0, f"Upload failed: {str(e)}")
            return False
    
    async def download_project(self, project_id: str, destination_path: Path) -> bool:
        """Download a project from the cloud."""
        try:
            await self.initialize_session()
            
            # Get project metadata
            async with self.session.get(f"{self.api_base_url}/projects/{project_id}") as response:
                if response.status == 200:
                    project_data = await response.json()
                    destination_path.mkdir(parents=True, exist_ok=True)
                    
                    # Get all files for the project
                    async with self.session.get(f"{self.api_base_url}/projects/{project_id}/files") as files_response:
                        if files_response.status == 200:
                            files_data = await files_response.json()
                            
                            # Download each file
                            for file_info in files_data:
                                file_path = destination_path / file_info["path"]
                                file_path.parent.mkdir(parents=True, exist_ok=True)
                                
                                with open(file_path, "w", encoding="utf-8") as f:
                                    f.write(file_info["content"])
                                
                                if self.sync_progress_callback:
                                    self.sync_progress_callback(0.5, f"Downloading {file_info['path']}...")
                            
                            if self.sync_progress_callback:
                                self.sync_progress_callback(1.0, "Download completed successfully!")
                            
                            return True
                        else:
                            error_data = await files_response.json()
                            raise Exception(f"Failed to get project files: {error_data.get('message', 'Unknown error')}")
                else:
                    error_data = await response.json()
                    raise Exception(f"Failed to get project: {error_data.get('message', 'Unknown error')}")
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"project_id": project_id, "destination_path": str(destination_path)}
            )
            if self.sync_progress_callback:
                self.sync_progress_callback(0.0, f"Download failed: {str(e)}")
            return False
    
    async def sync_project(self, project_path: Path, project_id: str) -> bool:
        """Synchronize a project with the cloud."""
        try:
            self.current_sync_status = CloudSyncStatus.SYNCING
            if self.sync_progress_callback:
                self.sync_progress_callback(0.0, "Starting project sync...")
            
            # Get current cloud state
            async with self.session.get(f"{self.api_base_url}/projects/{project_id}/state") as response:
                if response.status == 200:
                    cloud_state = await response.json()
                    cloud_files = cloud_state.get("files", {})
                else:
                    raise Exception("Failed to get cloud project state")
            
            # Calculate local file hashes
            local_files = {}
            for file_path in project_path.rglob("*.[jpe|xml|json|txt]"):
                if file_path.is_file():
                    with open(file_path, "rb") as f:
                        content = f.read()
                        file_hash = hashlib.sha256(content).hexdigest()
                        relative_path = file_path.relative_to(project_path).as_posix()
                        local_files[relative_path] = file_hash
            
            # Determine what needs to be synced
            to_upload = []
            to_download = []
            
            all_files = set(local_files.keys()).union(set(cloud_files.keys()))
            
            for file_path in all_files:
                local_hash = local_files.get(file_path)
                cloud_hash = cloud_files.get(file_path)
                
                if local_hash and cloud_hash:
                    # Both exist - check if they differ
                    if local_hash != cloud_hash:
                        # Conflict - both changed
                        # For now, we'll prioritize local changes (could be configurable)
                        to_upload.append(file_path)
                        self.sync_states[file_path] = CloudFileSyncState(
                            filename=file_path,
                            local_hash=local_hash,
                            cloud_hash=cloud_hash,
                            sync_status="conflict"
                        )
                    else:
                        # Both are the same
                        self.sync_states[file_path] = CloudFileSyncState(
                            filename=file_path,
                            local_hash=local_hash,
                            cloud_hash=cloud_hash,
                            sync_status="synced"
                        )
                elif local_hash:
                    # Only exists locally - needs to be uploaded
                    to_upload.append(file_path)
                    self.sync_states[file_path] = CloudFileSyncState(
                        filename=file_path,
                        local_hash=local_hash,
                        cloud_hash=None,
                        sync_status="local_changed"
                    )
                elif cloud_hash:
                    # Only exists in cloud - needs to be downloaded
                    to_download.append(file_path)
                    self.sync_states[file_path] = CloudFileSyncState(
                        filename=file_path,
                        local_hash=None,
                        cloud_hash=cloud_hash,
                        sync_status="cloud_changed"
                    )
            
            # Upload local changes
            if to_upload:
                if self.sync_progress_callback:
                    self.sync_progress_callback(0.3, f"Uploading {len(to_upload)} changed files...")
                
                for i, file_path in enumerate(to_upload):
                    full_path = project_path / file_path
                    with open(full_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    
                    file_upload_data = {
                        "project_id": project_id,
                        "file_path": file_path,
                        "content": content,
                        "hash": local_files[file_path]
                    }
                    
                    await self.session.put(
                        f"{self.api_base_url}/projects/{project_id}/files/{file_path}",
                        json=file_upload_data
                    )
                    
                    # Update progress
                    if self.sync_progress_callback:
                        progress = 0.3 + (0.4 * (i + 1) / len(to_upload))
                        self.sync_progress_callback(progress, f"Uploaded {file_path}")
            
            # Download cloud changes
            if to_download:
                if self.sync_progress_callback:
                    self.sync_progress_callback(0.7, f"Downloading {len(to_download)} cloud files...")
                
                for i, file_path in enumerate(to_download):
                    async with self.session.get(
                        f"{self.api_base_url}/projects/{project_id}/files/{file_path}"
                    ) as file_response:
                        if file_response.status == 200:
                            file_data = await file_response.json()
                            
                            full_path = project_path / file_path
                            full_path.parent.mkdir(parents=True, exist_ok=True)
                            
                            with open(full_path, "w", encoding="utf-8") as f:
                                f.write(file_data["content"])
                    
                    # Update progress
                    if self.sync_progress_callback:
                        progress = 0.7 + (0.3 * (i + 1) / len(to_download))
                        self.sync_progress_callback(progress, f"Downloaded {file_path}")
            
            # Mark as synced
            self.current_sync_status = CloudSyncStatus.SYNCED
            if self.sync_progress_callback:
                self.sync_progress_callback(1.0, "Project sync completed successfully!")
            
            return True
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"project_path": str(project_path), "project_id": project_id}
            )
            self.current_sync_status = CloudSyncStatus.ERROR
            if self.sync_progress_callback:
                self.sync_progress_callback(0.0, f"Sync failed: {str(e)}")
            return False
    
    def set_sync_progress_callback(self, callback: Callable[[float, str], None]):
        """Set callback to receive sync progress updates."""
        self.sync_progress_callback = callback
    
    async def get_sync_status(self) -> CloudSyncStatus:
        """Get the current sync status."""
        return self.current_sync_status
    
    def get_file_sync_state(self, filename: str) -> Optional[CloudFileSyncState]:
        """Get sync state for a specific file."""
        return self.sync_states.get(filename)


# Global cloud API instance
cloud_api = CloudAPI()
