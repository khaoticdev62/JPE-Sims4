/**
 * Claude API - Suggest Fix
 * 
 * Server-side endpoint for suggesting code fixes using Claude AI.
 * API key is stored in environment variables, not exposed to client.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { fileContent, fileName, errorMessage, errorContext } = body;

    if (!fileContent || typeof fileContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: fileContent is required' },
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

    // Initialize Claude client (server-side only)
    const client = new Anthropic({ apiKey });

    // Build prompt for fix suggestion
    const prompt = `You are an expert Sims 4 mod creator. Fix the following error in a JPE file.

File: ${fileName}
Error: ${errorMessage}
Context around error:
${errorContext || 'N/A'}

Full Content:
${fileContent}

Return ONLY a JSON object with:
1. "fixedCode": The complete corrected content.
2. "explanation": What you fixed.
`;

    // Call Claude API
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    if (response.content[0].type !== 'text') {
      throw new Error('Invalid AI response');
    }

    // Extract JSON from response
    const jsonMatch = response.content[0].text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      fixedCode: result.fixedCode,
      explanation: result.explanation,
    });

  } catch (error) {
    console.error('[Claude API Fix] Error:', error);
    const message = error instanceof Error ? error.message : 'API call failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
