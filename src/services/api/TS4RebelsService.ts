'./HttpClient';

/**
 * TS4Rebels Service
 * 
 * Provides methods for interacting with the TS4Rebels.cc scraping API.
 */

export interface TS4RebelsLink {
  url: string;
  host: string;
  kind: 'external' | 'internal';
  label: string | null;
}

export interface TS4RebelsPost {
  post_id: number;
  author: string | null;
  created_at: string | null;
  links: TS4RebelsLink[];
}

export interface TS4RebelsTopicSummary {
  topic_id: number;
  title: string;
  author: string;
  created_at: string;
  reply_count: number;
  view_count: number;
}

export interface TS4RebelsBridgeResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  performance?: {
    duration: number;
  };
}

export class TS4RebelsService {
  /**
   * Performs authentication with ts4rebels.cc
   */
  static async login(username: string, password: string): Promise<TS4RebelsBridgeResponse<{ ok: boolean; cookies: Record<string, string>; diagnostics: Array<Record<string, unknown>> }>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ts4rebels) {
        return await window.electron.ts4rebels.invoke('login', { username, password })
      }
      throw new Error('Native TS4Rebels bridge not available');
    } catch (error: unknown) {
      return {
        success: false,
        data: { ok: false, cookies: {}, diagnostics: [] },
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Fetches a list of topics from a specific forum.
   * Default Forum ID 59 is "File Donations".
   */
  static async listForum(forumId: number = 59, page: number = 1, cookies?: string): Promise<TS4RebelsBridgeResponse<{ topics: TS4RebelsTopicSummary[] }>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ts4rebels) {
        return await window.electron.ts4rebels.invoke('forum', { 
          forum: String(forumId), 
          page: String(page),
          cookies: cookies || ''
        })
      }
      throw new Error('Native TS4Rebels bridge not available');
    } catch (error: unknown) {
      return {
        success: false,
        data: { topics: [] },
        error: error instanceof Error ? error.message : 'Failed to fetch forum'
      };
    }
  }

  /**
   * Fetches full topic content including post links.
   */
  static async getTopic(topicId: number, page: number = 1, cookies?: string): Promise<TS4RebelsBridgeResponse<{ posts: TS4RebelsPost[] }>> {
    try {
      if (typeof window !== 'undefined' && window.electron?.ts4rebels) {
        return await window.electron.ts4rebels.invoke('topic', {
          topic: String(topicId),
          page: String(page),
          cookies: cookies || ''
        })
      }
      throw new Error('Native TS4Rebels bridge not available');
    } catch (error: unknown) {
      return {
        success: false,
        data: { posts: [] },
        error: error instanceof Error ? error.message : 'Failed to fetch topic'
      };
    }
  }

  /**
   * Extract download links from a topic's posts.
   */
  static extractDownloadLinks(posts: TS4RebelsPost[]): TS4RebelsLink[] {
    const downloads: TS4RebelsLink[] = [];
    const seen = new Set<string>();

    posts.forEach(post => {
      post.links.forEach(link => {
        // Simple heuristic for download links (external hosts, common file sharing sites)
        const isDownload = !link.url.includes('ts4rebels.cc') && 
                          (link.url.includes('simfileshare') || 
                           link.url.includes('mega.nz') || 
                           link.url.includes('google.com/drive') ||
                           link.label?.toLowerCase().includes('download'));

        if (isDownload && !seen.has(link.url)) {
          downloads.push(link);
          seen.add(link.url);
        }
      });
    });

    return downloads;
  }
}
