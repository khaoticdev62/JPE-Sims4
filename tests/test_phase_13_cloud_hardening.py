"""
Tests for Phase 13 Cloud Hardening components.
Verifies ConflictResolver, LocalStorageProvider, and SyncQueue.
"""

import unittest
import asyncio
import tempfile
import json
import uuid
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

from cloud.api import LocalStorageProvider, CloudAPI
from cloud.sync_manager import ConflictResolver, MergeStrategy, CloudSyncManager
from cloud.queue import SyncQueue, QueuedOperation


class TestConflictResolver(unittest.TestCase):
    """Test the ConflictResolver logic."""
    
    def setUp(self):
        self.resolver = ConflictResolver()
        
    def test_synced_versions(self):
        """Test identical versions."""
        result = self.resolver.resolve(
            "test.jpe", "hash1", "hash1", 
            datetime.now(), datetime.now()
        )
        self.assertEqual(result, "synced")
        
    def test_local_wins_strategy(self):
        """Test LOCAL_WINS strategy."""
        result = self.resolver.resolve(
            "test.jpe", "hash_local", "hash_cloud",
            datetime.now(), datetime.now() + timedelta(hours=1),
            strategy=MergeStrategy.LOCAL_WINS
        )
        self.assertEqual(result, "local")
        
    def test_newer_wins_local(self):
        """Test NEWER_WINS when local is newer."""
        now = datetime.now()
        result = self.resolver.resolve(
            "test.jpe", "hash_local", "hash_cloud",
            now, now - timedelta(hours=1),
            strategy=MergeStrategy.NEWER_WINS
        )
        self.assertEqual(result, "local")
        
    def test_newer_wins_cloud(self):
        """Test NEWER_WINS when cloud is newer."""
        now = datetime.now()
        result = self.resolver.resolve(
            "test.jpe", "hash_local", "hash_cloud",
            now - timedelta(hours=1), now,
            strategy=MergeStrategy.NEWER_WINS
        )
        self.assertEqual(result, "cloud")


class TestLocalStorageProvider(unittest.IsolatedAsyncioTestCase):
    """Test the LocalStorageProvider (simulated cloud)."""
    
    async def asyncSetUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.provider = LocalStorageProvider(Path(self.temp_dir.name))
        
    async def asyncTearDown(self):
        self.temp_dir.cleanup()
        
    async def test_upload_download(self):
        """Test basic file operations."""
        project_id = "test_proj"
        file_path = "subdir/mod.jpe"
        content = "JPE content"
        
        success = await self.provider.upload_file(project_id, file_path, content)
        self.assertTrue(success)
        
        downloaded = await self.provider.download_file(project_id, file_path)
        self.assertEqual(downloaded, content)
        
    async def test_get_project_state(self):
        """Test state retrieval."""
        project_id = "test_state"
        await self.provider.upload_file(project_id, "f1.jpe", "c1")
        await self.provider.upload_file(project_id, "f2.jpe", "c2")
        
        state = await self.provider.get_project_state(project_id)
        self.assertEqual(len(state), 2)
        self.assertIn("f1.jpe", state)
        self.assertIn("f2.jpe", state)


class TestSyncQueue(unittest.TestCase):
    """Test the persistent SyncQueue."""
    
    def setUp(self):
        self.temp_file = Path(tempfile.mktemp())
        self.queue = SyncQueue(self.temp_file)
        
    def tearDown(self):
        if self.temp_file.exists():
            self.temp_file.unlink()
            
    def test_add_remove_operation(self):
        """Test queue operations."""
        op = QueuedOperation(
            id=str(uuid.uuid4()),
            operation_type="upload",
            project_id="p1",
            file_path="f1.jpe",
            content="data"
        )
        self.queue.add_operation(op)
        self.assertEqual(len(self.queue.get_pending()), 1)
        
        # Test persistence
        new_queue = SyncQueue(self.temp_file)
        self.assertEqual(len(new_queue.get_pending()), 1)
        self.assertEqual(new_queue.get_pending()[0].content, "data")
        
        self.queue.remove_operation(op.id)
        self.assertEqual(len(self.queue.get_pending()), 0)


class TestCloudSyncManagerHardening(unittest.IsolatedAsyncioTestCase):
    """Test CloudSyncManager with new hardening features."""
    
    async def asyncSetUp(self):
        self.temp_cloud = tempfile.TemporaryDirectory()
        self.temp_local = tempfile.TemporaryDirectory()
        
        self.provider = LocalStorageProvider(Path(self.temp_cloud.name))
        self.api = CloudAPI(provider=self.provider)
        self.manager = CloudSyncManager(self.api)
        
    async def asyncTearDown(self):
        self.temp_cloud.cleanup()
        self.temp_local.cleanup()
        
    async def test_sync_with_conflict(self):
        """Test synchronization when a conflict exists."""
        project_id = "conflict_proj"
        local_path = Path(self.temp_local.name)
        
        # 1. Setup cloud state
        await self.provider.upload_file(project_id, "mod.jpe", "cloud version")
        
        # 2. Setup local state (different content)
        local_file = local_path / "mod.jpe"
        local_file.write_text("local version", encoding='utf-8')
        
        # Mock get_user_projects to return our project metadata
        mock_proj = Mock()
        mock_proj.project_id = project_id
        mock_proj.name = local_path.name
        # Note: In real life we'd need to mock the actual hash
        mock_proj.file_hashes = {"mod.jpe": hashlib.sha256("cloud version".encode()).hexdigest()}
        mock_proj.modified_at = datetime.now() - timedelta(days=1)
        
        with patch.object(self.api, 'get_user_projects', return_value=[mock_proj]):
            # Use LOCAL_WINS strategy for test
            self.manager.conflict_resolver.default_strategy = MergeStrategy.LOCAL_WINS
            
            success = await self.manager.sync_project(local_path, project_id)
            
            self.assertTrue(success)
            self.assertIn("mod.jpe", self.manager.current_operation.conflicts)


if __name__ == '__main__':
    unittest.main()
