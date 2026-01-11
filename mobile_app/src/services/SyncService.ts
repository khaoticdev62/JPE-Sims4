/**
 * Sync Service for JPE Mobile
 * Orchestrates synchronization between local storage and the cloud.
 */

import { apiService } from './ApiService';
import { storageService, FileMetadata } from './StorageService';

export enum MergeStrategy {
  LOCAL_WINS,
  CLOUD_WINS,
  NEWER_WINS
}

class SyncService {
  /**
   * Synchronize a project
   */
  async syncProject(projectId: string, strategy: MergeStrategy = MergeStrategy.NEWER_WINS): Promise<void> {
    console.log(`Starting sync for project: ${projectId}`);
    
    // 1. Get cloud state
    const cloudResponse = await apiService.getProject(projectId);
    const cloudFiles = cloudResponse.data.files; // Expected format: { path: { hash, modified_at } }
    
    // 2. Get local state
    const localMetadata = await storageService.getProjectMetadata(projectId);
    
    const allPaths = new Set([...Object.keys(cloudFiles), ...Object.keys(localMetadata)]);
    
    for (const path of allPaths) {
      const cloud = cloudFiles[path];
      const local = localMetadata[path];
      
      if (cloud && local) {
        if (cloud.hash !== local.hash) {
          // Conflict detected
          await this.resolveConflict(projectId, path, local, cloud, strategy);
        }
      } else if (cloud) {
        // Only in cloud - download
        await this.downloadFile(projectId, path, cloud.hash);
      } else if (local) {
        // Only local - upload
        await this.uploadFile(projectId, path);
      }
    }
  }

  private async resolveConflict(
    projectId: string, 
    path: string, 
    local: FileMetadata, 
    cloud: any, 
    strategy: MergeStrategy
  ): Promise<void> {
    let winner: 'local' | 'cloud' = 'local';
    
    if (strategy === MergeStrategy.CLOUD_WINS) {
      winner = 'cloud';
    } else if (strategy === MergeStrategy.NEWER_WINS) {
      const localTime = new Date(local.lastModified).getTime();
      const cloudTime = new Date(cloud.modified_at).getTime();
      winner = localTime > cloudTime ? 'local' : 'cloud';
    }
    
    if (winner === 'cloud') {
      await this.downloadFile(projectId, path, cloud.hash);
    } else {
      await this.uploadFile(projectId, path);
    }
  }

  private async downloadFile(projectId: string, path: string, hash: string): Promise<void> {
    const response = await apiService.axiosInstance.get(`/projects/${projectId}/files/${path}`);
    const content = response.data.content;
    
    await storageService.saveFile(projectId, path, content);
    
    const metadata = await storageService.getProjectMetadata(projectId);
    metadata[path] = {
      path,
      hash,
      lastModified: new Date().toISOString(),
      syncStatus: 'synced'
    };
    await storageService.saveProjectMetadata(projectId, metadata);
  }

  private async uploadFile(projectId: string, path: string): Promise<void> {
    const content = await storageService.getFile(projectId, path);
    if (content === null) return;
    
    await apiService.axiosInstance.put(`/projects/${projectId}/files/${path}`, {
      content
    });
    
    // Update local metadata after successful upload
    // In a real app we'd get the new hash/timestamp from the server
  }
}

export const syncService = new SyncService();
