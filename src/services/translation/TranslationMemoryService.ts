
export interface TmSegment {
  id: string;
  source: string;
  target: string;
  confidence: number;
  locale: string;
  domain: string;
  usageCount: number;
  lastUsed: string;
  starred: boolean;
}

export class TranslationMemoryService {
  private static STORAGE_KEY = 'jpe_tm_segments';

  /**
   * Finds the best fuzzy match for a given source string.
   */
  static async suggest(source: string, locale: string, threshold: number = 0.7): Promise<TmSegment[]> {
    const segments = this.loadSegments();
    const relevant = segments.filter(s => s.locale === locale);
    
    const matches = relevant.map(seg => {
      const similarity = this.calculateSimilarity(source, seg.source);
      return { ...seg, confidence: Math.round(similarity * 100) };
    });

    return matches
      .filter(m => m.confidence >= (threshold * 100))
      .sort((a, b) => b.confidence - a.confidence);
  }

  static addSegment(segment: TmSegment): void {
    const segments = this.loadSegments();
    segments.unshift(segment);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(segments.slice(0, 5000))); // Cap at 5k segments
  }

  static loadSegments(): TmSegment[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Levenshtein-based similarity index [0, 1]
   */
  private static calculateSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshtein(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshtein(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            }
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  /**
   * Export TM segments as TMX (Translation Memory eXchange) format.
   */
  static exportTMX(locale: string): string {
    const segments = this.loadSegments().filter(s => s.locale === locale);
    let tmx = '<?xml version="1.0" encoding="UTF-8"?>\n';
    tmx += '<tmx version="1.4">\n  <header creationtool="jpe-studio" creationtoolversion="2.1" datatype="plaintext" segtype="sentence" adminlang="en-us" srclang="en-us"/>\n  <body>\n';
    
    segments.forEach(s => {
      tmx += `    <tu>\n      <tuv xml:lang="en-us"><seg>${this.escapeXml(s.source)}</seg></tuv>\n`;
      tmx += `      <tuv xml:lang="${locale}"><seg>${this.escapeXml(s.target)}</seg></tuv>\n    </tu>\n`;
    });
    
    tmx += '  </body>\n</tmx>';
    return tmx;
  }

  private static escapeXml(text: string): string {
    return text.replace(/[<>&"']/g, (m) => {
      switch (m) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        default: return '&apos;';
      }
    });
  }
}
