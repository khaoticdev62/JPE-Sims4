/**
 * Claude API - Explain Mod File
 * 
 * Server-side endpoint for explaining Sims 4 JPE mod files using Claude AI.
 * API key is stored in environment variables, not exposed to client.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Rate limiting: 50 requests per minute
const RATE_LIMIT = 50;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { fileContent, fileName } = body;

    if (!fileContent || typeof fileContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: fileContent is required and must be a string' },
        { status: 400 }
      );
    }

    // Check for API key in headers (override) first, then environment variables
    const headerKey = request.headers.get('x-api-key');
    const apiKey = headerKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Claude API not configured. Please provide a key in settings for advanced use.' },
        { status: 500 }
      );
    }

    // Initialize Claude client (server-side only, no dangerouslyAllowBrowser needed)
    const client = new Anthropic({ apiKey });

    // Build prompt for mod explanation
    const prompt = buildModExplanationPrompt(fileContent, fileName);

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    if (response.content[0].type !== 'text') {
      throw new Error('Unexpected response format from Claude API');
    }

    const explanationText = response.content[0].text;
    const explanation = parseExplanation(explanationText);

    return NextResponse.json({
      success: true,
      explanation,
      cached: false,
      timestamp: Date.now(),
      rateLimit: { remaining: rateLimit.remaining },
    });

  } catch (error) {
    console.error('[Claude API] Error:', error);
    const message = error instanceof Error ? error.message : 'API call failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function buildModExplanationPrompt(fileContent: string, fileName: string): string {
  return `Summarize this Sims 4 JPE mod file.

File: ${fileName}
Content:
${fileContent.substring(0, 3000)}

Provide:
1. **Overview**: Purpose of this mod.
2. **Key Fields**: Major tunable parameters.
3. **Effects**: Gameplay impact.
`;
}

function parseExplanation(text: string) {
  const extract = (section: string) => {
    const regex = new RegExp(`\\*\\*${section}\\*\\*:?\\s*([^\\n]*(?:\\n(?!\\*\\*).*)*)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  return {
    overview: extract('Overview'),
    purpose: extract('Purpose') || 'Mod customization',
    keyFields: extract('Key Fields')
      .split('\n')
      .filter(l => l.startsWith('-'))
      .map(l => l.substring(1).trim()),
    effects: extract('Effects')
      .split('\n')
      .filter(l => l.startsWith('-'))
      .map(l => l.substring(1).trim()),
    notes: [],
  };
}
