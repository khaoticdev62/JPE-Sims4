/**
 * OpenAI API - Chat
 * 
 * Server-side proxy for GPT-4 messages.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'gpt-4o' } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: messages array is required', cached: false, timestamp: Date.now() },
        { status: 400 }
      );
    }

    const headerKey = request.headers.get('Authorization');
    const apiKey = headerKey?.replace('Bearer ', '') || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API not configured.', cached: false, timestamp: Date.now() },
        { status: 500 }
      );
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: model,
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const data = response.data;
    const choice = data.choices[0];

    return NextResponse.json({
      success: true,
      text: choice.message.content,
      usage: {
        inputTokens: data.usage.prompt_tokens,
        outputTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      cached: false,
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error('[OpenAI API Chat] Error:', error);
    const message = error.response?.data?.error?.message || error.message || 'Chat failed';
    return NextResponse.json(
      { success: false, error: message, cached: false, timestamp: Date.now() },
      { status: error.response?.status || 500 }
    );
  }
}
