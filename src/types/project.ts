export type FileType = 'folder' | 'xml' | 'stbl' | 'jpe' | 'package' | 'python' | 'unknown';

export interface ProjectFile {
  id: string; // usually absolute path
  name: string;
  path: string;
  type: FileType;
  children?: ProjectFile[]; // Defined if type is 'folder'
  isExpanded?: boolean; // UI state
}

export interface ProjectState {
  projectId: string | null;
  projectName: string | null;
  projectPath: string | null;
  files: ProjectFile[];
}
