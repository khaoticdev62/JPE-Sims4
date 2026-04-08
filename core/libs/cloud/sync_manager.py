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

from cloud.api import CloudAPI, CloudProject, CloudSyncStatus, CloudFileSyncState, cloud_api
from cloud.queue import SyncQueue, QueuedOperation
from diagnostics.sentinel import SentinelExceptionLogger
from diagnostics.logging import log_info, log_error
from engine.ir import ProjectIR
import uuid
from enum import Enum


class MergeStrategy(Enum):
    """Strategies for resolving synchronization conflicts."""
    LOCAL_WINS = "local_wins"
    CLOUD_WINS = "cloud_wins"
    MANUAL = "manual"
    NEWER_WINS = "newer_wins"


class ConflictResolver:
    """Resolves conflicts between local and cloud file versions."""
    
    def __init__(self, default_strategy: MergeStrategy = MergeStrategy.NEWER_WINS):
        self.default_strategy = default_strategy
    
    def resolve(self, filename: str, local_hash: str, cloud_hash: str, 
                local_mtime: datetime, cloud_mtime: datetime,
                strategy: Optional[MergeStrategy] = None) -> str:
        """
        Determine which version should prevail.
        Returns "local", "cloud", or "manual_required".
        """
        if local_hash == cloud_hash:
            return "synced"
            
        strategy = strategy or self.default_strategy
        
        if strategy == MergeStrategy.LOCAL_WINS:
            return "local"
        elif strategy == MergeStrategy.CLOUD_WINS:
            return "cloud"
        elif strategy == MergeStrategy.NEWER_WINS:
            return "local" if local_mtime > cloud_mtime else "cloud"
            
        return "manual_required"


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
    conflicts: List[str] = field(default_factory=list)


class CloudSyncManager:
    """Manages synchronization between local projects and cloud services."""
    
    def __init__(self, cloud_api: CloudAPI):
        self.cloud_api = cloud_api
        self.conflict_resolver = ConflictResolver()
        self.sync_queue = SyncQueue(Path(".jpe_tmp/sync_queue.json"))
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
                    context={"callback_function": str(callback)}
                )
    
    async def process_queue(self):
        """Process pending operations in the sync queue."""
        pending = self.sync_queue.get_pending()
        if not pending:
            return
            
        self._update_progress(0.1, f"Processing {len(pending)} queued operations...")
        
        for op in list(pending):
            try:
                if op.operation_type == "upload" and op.content:
                    success = await self.cloud_api.provider.upload_file(op.project_id, op.file_path, op.content)
                    if success:
                        self.sync_queue.remove_operation(op.id)
                elif op.operation_type == "download":
                    # Download handling would need a target local path
                    # For now, we mainly queue uploads/deletes from local
                    pass
            except Exception as e:
                log_error(f"Failed to process queued op {op.id}", error=str(e))
                op.retry_count += 1
                if op.retry_count > 5:
                    self.sync_queue.remove_operation(op.id)
        
        self._update_progress(1.0, "Queue processing complete.")

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
            
            # Process any pending offline operations first
            await self.process_queue()
            
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
            allowed_extensions = {'.jpe', '.xml', '.json', '.txt', '.py', '.md'}
            jpe_files = [
                f for f in local_path.rglob("*") 
                if f.is_file() and f.suffix.lower() in allowed_extensions
            ]
            
            op.files = [str(f.relative_to(local_path).as_posix()) for f in jpe_files]
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
                        context={"file_path": str(file_path)}
                    )
            
            # Get cloud file hashes
            self._update_progress(0.5, "Fetching cloud project state...")
            
            # Use CloudAPI to get the current state
            cloud_projects = await self.cloud_api.get_user_projects()
            target_project = next((p for p in cloud_projects if p.project_id == cloud_project_id), None)
            
            if not target_project:
                raise Exception(f"Cloud project {cloud_project_id} no longer exists")
            
            cloud_file_hashes = target_project.file_hashes
            
            # Detect conflicts
            for rel_path, local_hash in local_file_hashes.items():
                if rel_path in cloud_file_hashes:
                    cloud_hash = cloud_file_hashes[rel_path]
                    if local_hash != cloud_hash:
                        # Conflict found
                        op.conflicts.append(rel_path)
                        
                        # Use resolver to decide
                        # Note: In a real app we'd need local/cloud mtimes
                        # For now we'll assume current time for local
                        decision = self.conflict_resolver.resolve(
                            filename=rel_path,
                            local_hash=local_hash,
                            cloud_hash=cloud_hash,
                            local_mtime=datetime.now(),
                            cloud_mtime=target_project.modified_at
                        )
                        log_info(f"Conflict resolution for {rel_path}: {decision}")

            # Execute the sync via API
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
                context={
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
            allowed_extensions = {'.jpe', '.xml', '.json', '.txt', '.py', '.md'}
            project_files = [
                f for f in local_path.rglob("*") 
                if f.is_file() and f.suffix.lower() in allowed_extensions
            ]
            
            op.files = [str(f.relative_to(local_path).as_posix()) for f in project_files]
            
            success = await self.cloud_api.upload_project(local_path, project_name)
            
            op.completed_at = datetime.now()
            op.succeeded = success
            self.operation_history.append(op)
            
            self.is_syncing = False
            return success
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context={"local_path": str(local_path), "project_name": project_name}
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
                    allowed_extensions = {'.jpe', '.xml', '.json', '.txt', '.py', '.md'}
                    downloaded_files = [
                        f for f in destination_path.rglob("*") 
                        if f.is_file() and f.suffix.lower() in allowed_extensions
                    ]
                    op.files = [str(f.relative_to(destination_path).as_posix()) for f in downloaded_files]
            
            op.completed_at = datetime.now()
            op.succeeded = success
            self.operation_history.append(op)
            
            self.is_syncing = False
            return success
            
        except Exception as e:
            self.sentinel_logger.log_exception(
                e,
                context={"cloud_project_id": cloud_project_id, "destination_path": str(destination_path)}
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