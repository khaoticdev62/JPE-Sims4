/* ─────────────────────────────────────────────────────────────
   JPE Studio — Global Search Service (Story 1.6)
   Bridges Renderer to Electron Main for project-wide search.
   ───────────────────────────────────────────────────────────── */

export interface SearchResult {
  file: {
    path: string;
    ext: string;
  };
  matches: {
    num: number;
    text: string;
  }[];
}

export interface SearchOptions {
  isRegex: boolean;
  isCase: boolean;
  isWord: boolean;
  extension?: string;
}

export interface SearchResponse {
  success: boolean;
  results?: SearchResult[];
  duration?: string;
  error?: string;
}

export interface ReplaceResponse {
  success: boolean;
  affectedFiles?: number;
  totalReplacements?: number;
  duration?: string;
  error?: string;
}

class SearchService {
  private static instance: SearchService;

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Execute a project-wide search.
   */
  public async search(dirPath: string, query: string, options: SearchOptions): Promise<SearchResponse> {
    if (!query || !dirPath) return { success: true, results: [] };
    
    try {
      return await window.electron.project.search(dirPath, query, options);
    } catch (error) {
      console.error('[SearchService] Search failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Execute a project-wide search and replace.
   */
  public async replace(dirPath: string, query: string, replacement: string, options: SearchOptions): Promise<ReplaceResponse> {
    if (!query || !dirPath) return { success: false, error: 'Query and directory are required' };
    
    try {
      return await window.electron.project.replaceInFiles(dirPath, query, replacement, options);
    } catch (error) {
      console.error('[SearchService] Replace failed:', error);
      return { success: false, error: String(error) };
    }
  }
}

export const searchService = SearchService.getInstance();
