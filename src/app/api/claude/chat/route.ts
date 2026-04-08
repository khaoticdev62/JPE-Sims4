/**
 * Claude API - Chat
 * 
 * Server-side endpoint for chatting with Claude AI.
 * API key is stored in environment variables, not exposed to client.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
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

    // Call Claude API with chat history
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: messages,
    });

    if (response.content[0].type !== 'text') {
      throw new Error('Invalid response');
    }

    return NextResponse.json({
      success: true,
      text: response.content[0].text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens
      },
      cached: false,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('[Claude API Chat] Error:', error);
    const message = error instanceof Error ? error.message : 'Chat failed';
    return NextResponse.json(
      { success: false, error: message, cached: false, timestamp: Date.now() },
      { status: 500 }
    );
  }
}
