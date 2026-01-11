/**
 * Local Storage Service for JPE Mobile
 * Handles persistent storage of project files and metadata.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECT_PREFIX = '@jpe_project_';
const METADATA_KEY = '@jpe_projects_metadata';

export interface FileMetadata {
  path: string;
  hash: string;
  lastModified: string;
  syncStatus: 'synced' | 'modified' | 'conflict';
}

class StorageService {
  /**
   * Save project file content locally
   */
  async saveFile(projectId: string, filePath: string, content: string): Promise<void> {
    const key = `${PROJECT_PREFIX}${projectId}_${filePath}`;
    await AsyncStorage.setItem(key, content);
  }

  /**
   * Get project file content from local storage
   */
  async getFile(projectId: string, filePath: string): Promise<string | null> {
    const key = `${PROJECT_PREFIX}${projectId}_${filePath}`;
    return await AsyncStorage.getItem(key);
  }

  /**
   * Delete a local file
   */
  async deleteFile(projectId: string, filePath: string): Promise<void> {
    const key = `${PROJECT_PREFIX}${projectId}_${filePath}`;
    await AsyncStorage.removeItem(key);
  }

  /**
   * Get metadata for all files in a project
   */
  async getProjectMetadata(projectId: string): Promise<Record<string, FileMetadata>> {
    const key = `${METADATA_KEY}_${projectId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Save metadata for a project
   */
  async saveProjectMetadata(projectId: string, metadata: Record<string, FileMetadata>): Promise<void> {
    const key = `${METADATA_KEY}_${projectId}`;
    await AsyncStorage.setItem(key, JSON.stringify(metadata));
  }
}

export const storageService = new StorageService();
