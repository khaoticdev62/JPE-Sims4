/**
 * Type definitions for JPE Sims 4 Mod Translator Mobile App
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  lastModified: string;
  status: 'ready' | 'modified' | 'error';
  version: string;
  author?: string;
}

export interface BuildStatus {
  status: 'idle' | 'building' | 'success' | 'error';
  progress: number;
  output: string[];
  buildId?: string;
}

export interface NavigationParams {
  projectId?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}