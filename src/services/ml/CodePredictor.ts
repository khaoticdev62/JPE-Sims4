import { AIServiceFactory } from '@/services/ai/AIServiceFactory';
import { ProjectPatterns } from '@/engine/ml/types';

export interface PredictionResult {
  token: string;
  confidence: number; // 0-1
  type: 'enum' | 'tuning' | 'tag' | 'keyword' | 'variable' | 'logic';
  description?: string;
  score?: number;
  source?: 'heuristic' | 'ai';
}

export interface CodeContext {
  fileType: 'jpe' | 'xml' | 'unknown';
  currentTag: string;
  beforeCursor: string;
  afterCursor: string;
  lineBefore: string;
}

/**
 * CODE PREDICTOR
 * 
 * Provides context-aware code suggestions based on analyzed project patterns.
 * Optimized for low-latency performance on Steam Deck hardware.
 */
export class CodePredictor {
  private static instance: CodePredictor;
  private cache: Map<string, PredictionResult[]> = new Map();
  private maxCacheSize: number = 200;

  private constructor() {}

  static getInstance(): CodePredictor {
    if (!CodePredictor.instance) {
      CodePredictor.instance = new CodePredictor();
    }
    return CodePredictor.instance;
  }

  /**
   * Analyze the current code context at cursor position
   */
  analyzeContext(content: string, position: number, fileName: string): CodeContext {
    const beforeCursor = content.slice(0, position);
    const afterCursor = content.slice(position);
    const lines = beforeCursor.split('\n');
    const lineBefore = lines[lines.length - 1] || '';
    
    let fileType: 'jpe' | 'xml' | 'unknown' = 'unknown';
    if (fileName.endsWith('.jpe')) fileType = 'jpe';
    else if (fileName.endsWith('.xml')) fileType = 'xml';

    // Find current tag (simple regex for XML)
    let currentTag = '';
    if (fileType === 'xml') {
      const tagMatch = beforeCursor.match(/<([a-zA-Z_][a-zA-Z0-9_-]*)[^>]*$/);
      if (tagMatch) currentTag = tagMatch[1];
    }

    return {
      fileType,
      currentTag,
      beforeCursor,
      afterCursor,
      lineBefore
    };
  }

  /**
   * Predict next tokens based on current context and patterns
   */
  async predict(
    context: CodeContext, 
    patterns: ProjectPatterns | null,
    limit: number = 5,
    enableAI: boolean = false,
    projectContext?: string
  ): Promise<PredictionResult[]> {
    const heuristicResults = this.predictHeuristic(context, patterns, limit);
    
    if (enableAI && heuristicResults.length < 3) {
      const aiResults = await this.predictAI(context, projectContext, limit - heuristicResults.length);
      return this.rankResults([...heuristicResults, ...aiResults], context, limit);
    }
    
    return heuristicResults;
  }

  private predictHeuristic(
    context: CodeContext, 
    patterns: ProjectPatterns | null,
    limit: number = 5
  ): PredictionResult[] {
    if (!patterns) return [];

    // Check cache
    const cacheKey = this.getCacheKey(context, patterns.timestamp);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const predictions: PredictionResult[] = [];
    const { fileType, currentTag: _currentTag, lineBefore } = context;
    
    // 1. Structural Suggestions (Tag completion)
    if (fileType === 'xml' && lineBefore.trim().endsWith('<')) {
      patterns.structuralPatterns.forEach(p => {
        predictions.push({
          token: p.tagSequence[0],
          confidence: p.confidence,
          type: 'tag',
          description: `Common tag sequence: ${p.description}`
        });
      });
    }

    // 2. Enum Suggestions
    if (lineBefore.trim().endsWith(':') || lineBefore.trim().endsWith('=')) {
      patterns.enumPatterns.forEach(p => {
        // Boost score if enum type matches convention (naive)
        let boost = 1.0;
        if (fileType === 'jpe' && p.type === 'UPPERCASE_SNAKE') boost = 1.2;
        
        predictions.push({
          token: p.value,
          confidence: p.confidence * boost,
          type: 'enum',
          description: `Common enum value (${p.type})`
        });
      });
    }

    // 3. Tuning Suggestions
    if (lineBefore.includes('tuning') || lineBefore.includes('0x')) {
      patterns.tuningPatterns.forEach(p => {
        predictions.push({
          token: p.tuningId,
          confidence: p.confidence,
          type: 'tuning',
          description: `Project tuning reference (${p.frequency} occurrences)`
        });
      });
    }

    const results = this.rankResults(predictions, context, limit);

    // Update cache
    this.updateCache(cacheKey, results);

    return results;
  }

  /**
   * AI-powered prediction pass
   */
  private async predictAI(
    context: CodeContext,
    projectContext?: string,
    _limit: number = 3
  ): Promise<PredictionResult[]> {
    try {
      const activeService = AIServiceFactory.getActiveService();
      if (!activeService) return [];

      const result = await AIServiceFactory.getActiveService()?.getPredictiveCompletion(
        context.beforeCursor + '|' + context.afterCursor,
        context.fileType === 'jpe' ? 'temp.jpe' : 'temp.xml',
        context.beforeCursor.length,
        projectContext
      );

      if (result && result.success && result.text && result.text.trim().length > 0) {
        // AI usually returns a single completion string
        const token = result.text.trim();
        return [{
          token,
          confidence: 0.8,
          type: 'logic',
          description: `AI-powered completion (${result.provider || 'Active Service'})`,
          source: 'ai'
        }];
      }
    } catch (error) {
      console.warn('[AI:Predict] Prediction failed:', error);
    }
    return [];
  }

  /**
   * Record a successfully accepted prediction to improve future ranking
   */
  recordAcceptance(token: string, type: string): void {
    const feedback = this.getFeedback();
    const key = `${type}:${token}`;
    feedback[key] = (feedback[key] || 0) + 1;
    localStorage.setItem('jpe-prediction-feedback', JSON.stringify(feedback));
  }

  /**
   * Record a rejected prediction
   */
  recordRejection(token: string, type: string): void {
    const feedback = this.getFeedback();
    const key = `${type}:${token}`;
    feedback[key] = (feedback[key] || 0) - 0.5; // Slight penalty
    localStorage.setItem('jpe-prediction-feedback', JSON.stringify(feedback));
  }

  private getFeedback(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem('jpe-prediction-feedback') || '{}');
    } catch {
      return {};
    }
  }

  private rankResults(
    predictions: PredictionResult[], 
    context: CodeContext, 
    limit: number
  ): PredictionResult[] {
    const { fileType, currentTag } = context;
    const feedback = this.getFeedback();
    
    // Deduplicate and score
    const unique = new Map<string, PredictionResult>();
    predictions.forEach(p => {
      let score = p.confidence;
      
      // Boost if it matches the current file type's typical patterns
      if (fileType === 'xml' && p.type === 'tag') score *= 1.5;
      if (fileType === 'jpe' && p.type === 'enum') score *= 1.3;
      
      // Boost based on tag context
      if (currentTag && p.token.includes(currentTag)) score *= 1.2;

      // Apply user feedback boost
      const feedbackScore = feedback[`${p.type}:${p.token}`] || 0;
      if (feedbackScore > 0) score *= (1 + Math.min(feedbackScore * 0.1, 0.5));
      else if (feedbackScore < 0) score *= (1 + Math.max(feedbackScore * 0.1, -0.3));

      if (!unique.has(p.token) || unique.get(p.token)!.score! < score) {
        unique.set(p.token, { ...p, score });
      }
    });

    return Array.from(unique.values())
      .sort((a, b) => b.score! - a.score!)
      .slice(0, limit);
  }

  private getCacheKey(context: CodeContext, timestamp: number): string {
    const snippet = context.lineBefore.slice(-30);
    return `${context.fileType}_${snippet}_${timestamp}`;
  }

  private updateCache(key: string, results: PredictionResult[]): void {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    this.cache.set(key, results);
  }
}