"""
Cloud Synchronization System for JPE Sims 4 Mod Translator.

This module handles synchronization of projects between local storage and cloud services.
"""

import asyncio
from pathlib import Path
from typing import List, Dict, Optional, Callable, Any
from dataclasses import dataclass, field
from datetime import datetime
import hashlib
import json
import os

from cloud.api import CloudAPI, CloudProject, CloudSyncStatus, CloudFileSyncState
from diagnostics.sentinel import SentinelExceptionLogger
from engine.ir import ProjectIR


@dataclass
class SyncOperation:
    """Represents a synchronization operation."""
    operation_type: str  # "upload", "download", "sync"
    source: str  # local or cloud
    destination: str  # cloud or local
    files: List[str]
    started_at: datetime
    completed_at: Optional[datetime] = None
    succeeded: bool = False
    error: Optional[str] = None


class CloudSyncManager:
    """Manages synchronization between local projects and cloud services."""
    
    def __init__(self, cloud_api: CloudAPI):
        self.cloud_api = cloud_api
        self.current_operation: Optional[SyncOperation] = None
        self.operation_history: List[SyncOperation] = []
        self.sentinel_logger = SentinelExceptionLogger()
        self.sync_callbacks: List[Callable[[float, str], None]] = []
        self.is_syncing = False
    
    def add_sync_progress_callback(self, callback: Callable[[float, str], None]):
        """Add a callback to receive sync progress updates."""
        self.sync_callbacks.append(callback)
    
    def remove_sync_progress_callback(self, callback: Callable[[float, str], None]):
        """Remove a sync progress callback."""
        if callback in self.sync_callbacks:
            self.sync_callbacks.remove(callback)
    
    def _update_progress(self, progress: float, message: str):
        """Update sync progress callbacks."""
        for callback in self.sync_callbacks:
            try:
                callback(progress, message)
            except Exception as e:
                self.sentinel_logger.log_exception(
                    e,
                    context_info={"callback_function": str(callback)}
                )
    
    async def sync_project(self, local_path: Path, cloud_project_id: Optional[str] = None) -> bool:
        """Synchronize a local project with the cloud."""
        if self.is_syncing:
            raise Exception("Synchronization already in progress")
        
        self.is_syncing = True
        start_time = datetime.now()
        
        # Create sync operation record
        op = SyncOperation(
            operation_type="sync",
            source="local",
            destination="cloud",
            files=[],
            started_at=start_time
        )
        self.current_operation = op
        
        try:
            self._update_progress(0.0, "Starting synchronization...")
            
            # If no cloud project ID provided, check if project exists in cloud
            if not cloud_project_id:
                # Check if this local project already exists in the cloud
                local_project_name = local_path.name
                cloud_projects = await self.cloud_api.get_user_projects()
                
                existing_project = None
                for proj in cloud_projects:
                    if proj.name == local_project_name:
                        existing_project = proj
                        break
                
                if existing_project:
                    cloud_project_id = existing_project.project_id
                else:
                    # Project doesn't exist in cloud, create it first
                    self._update_progress(0.2, "Creating new cloud project...")
                    success = await self.cloud_api.upload_project(local_path, local_project_name)
                    if not success:
                        raise Exception("Failed to create cloud project")
                    # After upload, we need to get the project ID somehow
                    # In a real implementation, upload_project would return the ID
                    # For now, we'll get the updated project list
                    cloud_projects = await self.cloud_api.get_user_projects()
                    for proj in cloud_projects:
                        if proj.name == local_project_name:
                            cloud_project_id = proj.project_id
                            break
            
            if not cloud_project_id:
                raise Exception("Could not find or create cloud project")
            
            # Get list of files to sync
            all_files = list(local_path.rglob("*.[jpe|xml|json|txt|py|md]"))
            jpe_files = [f for f in all_files if f.suffix.lower() in ['.jpe', '.xml', '.json', '.txt', '.py', '.md']]
            
            op.files = [str(f.relative_to(local_path)) for f in jpe_files]
            total_files = len(jpe_files)
            
            if total_files == 0:
                self._update_progress(1.0, "No JPE files found to synchronize")
                op.completed_at = datetime.now()
                op.succeeded = True
                self.operation_history.append(op)
                self.is_syncing = False
                return True
            
            # Calculate local hashes
            self._update_progress(0.3, f"Calculating local file hashes for {total_files} files...")
            local_file_hashes = {}
            for i, file_path in enumerate(jpe_files):
                try:
                    with open(file_path, 'rb') as f:
                        content = f.read()
                        file_hash = hashlib.sha256(content).hexdigest()
                        relative_path = file_path.relative_to(local_path).as_posix()
                        local_file_hashes[relative_path] = file_hash
                    
                    # Update progress
                    progress = 0.3 + (0.2 * (i + 1) / total_files)
                    self._update_progress(progress, f"Processed {i+1}/{total_files} files")
                except Exception as e:
                    self.sentinel_logger.log_exception(
                        e,
                        context_info={"file_path": str(file_path)}
                    )
            
            # Get cloud file hashes
            self._update_progress(0.5, "Fetching cloud file hashes...")
            cloud_file_hashes = {}
            # In a real implementation, this would call the API to get file hashes
            # For now, we'll use the API's sync_project method which already handles this
            success = await self.cloud_api.sync_project(local_path, cloud_project_id)
            
            op.completed_at = datetime.now()
            op.succeeded = success
            
            if success:
                self._update_progress(1.0, "Synchronization completed successfully!")
            else:
                self._update_progress(0.0, "Synchronization failed!")
            
            self.operation_history.append(op)
            self.is_syncing = False
            return success
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={
                    "local_path": str(local_path),
                    "cloud_project_id": cloud_project_id
                }
            )
            
            op.completed_at = datetime.now()
            op.succeeded = False
            op.error = str(e)
            self.operation_history.append(op)
            
            self._update_progress(0.0, f"Synchronization failed: {str(e)}")
            self.is_syncing = False
            return False
    
    async def upload_project(self, local_path: Path, project_name: str) -> bool:
        """Upload a complete project to the cloud."""
        if self.is_syncing:
            raise Exception("Synchronization already in progress")
        
        self.is_syncing = True
        start_time = datetime.now()
        
        op = SyncOperation(
            operation_type="upload",
            source="local",
            destination="cloud",
            files=[],
            started_at=start_time
        )
        self.current_operation = op
        
        try:
            self._update_progress(0.0, "Starting project upload...")
            
            # Get all project files
            all_files = list(local_path.rglob("*.[jpe|xml|json|txt|py|md]"))
            project_files = [f for f in all_files if f.suffix.lower() in ['.jpe', '.xml', '.json', '.txt', '.py', '.md']]
            
            op.files = [str(f.relative_to(local_path)) for f in project_files]
            
            success = await self.cloud_api.upload_project(local_path, project_name)
            
            op.completed_at = datetime.now()
            op.succeeded = success
            self.operation_history.append(op)
            
            self.is_syncing = False
            return success
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"local_path": str(local_path), "project_name": project_name}
            )
            
            op.completed_at = datetime.now()
            op.succeeded = False
            op.error = str(e)
            self.operation_history.append(op)
            
            self.is_syncing = False
            return False
    
    async def download_project(self, cloud_project_id: str, destination_path: Path) -> bool:
        """Download a project from the cloud."""
        if self.is_syncing:
            raise Exception("Synchronization already in progress")
        
        self.is_syncing = True
        start_time = datetime.now()
        
        op = SyncOperation(
            operation_type="download",
            source="cloud",
            destination="local",
            files=[],
            started_at=start_time
        )
        self.current_operation = op
        
        try:
            self._update_progress(0.0, "Starting project download...")
            
            success = await self.cloud_api.download_project(cloud_project_id, destination_path)
            
            # In a real implementation, we'd get the actual files downloaded
            # For now, we'll just mark the operation as potentially successful
            if success:
                # List files in downloaded project
                if destination_path.exists():
                    downloaded_files = list(destination_path.rglob("*.[jpe|xml|json|txt|py|md]"))
                    op.files = [str(f.relative_to(destination_path)) for f in downloaded_files]
            
            op.completed_at = datetime.now()
            op.succeeded = success
            self.operation_history.append(op)
            
            self.is_syncing = False
            return success
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context_info={"cloud_project_id": cloud_project_id, "destination_path": str(destination_path)}
            )
            
            op.completed_at = datetime.now()
            op.succeeded = False
            op.error = str(e)
            self.operation_history.append(op)
            
            self.is_syncing = False
            return False
    
    def get_last_operation(self) -> Optional[SyncOperation]:
        """Get the most recent sync operation."""
        return self.current_operation
    
    def get_sync_history(self, limit: int = 10) -> List[SyncOperation]:
        """Get recent sync operations."""
        return self.operation_history[-limit:]
    
    def get_sync_status(self) -> CloudSyncStatus:
        """Get the current sync status."""
        if self.is_syncing:
            return CloudSyncStatus.SYNCING
        elif self.current_operation and self.current_operation.succeeded:
            return CloudSyncStatus.SYNCED
        elif self.current_operation and not self.current_operation.succeeded:
            return CloudSyncStatus.ERROR
        else:
            return CloudSyncStatus.IDLE


# Global instance
cloud_sync_manager = CloudSyncManager(cloud_api)