/**
 * Qwen API - Chat
 * 
 * Server-side proxy for Alibaba Qwen.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'qwen-plus' } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: messages array is required', cached: false, timestamp: Date.now() },
        { status: 400 }
      );
    }

    const headerKey = request.headers.get('Authorization');
    const apiKey = headerKey?.replace('Bearer ', '') || process.env.QWEN_API_KEY;

    if (!apiKey) {
       // Support for Local Ollama if no key is provided? 
       // For now, require key on server or use env.
       return NextResponse.json(
        { success: false, error: 'Qwen API not configured.', cached: false, timestamp: Date.now() },
        { status: 500 }
      );
    }

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: model,
        messages: messages,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;
    const choice = data.choices[0];

    return NextResponse.json({
      success: true,
      text: choice.message.content,
      usage: {
        totalTokens: data.usage.total_tokens || 0,
        inputTokens: data.usage.prompt_tokens || 0,
        outputTokens: data.usage.completion_tokens || 0
      },
      cached: false,
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error('[Qwen API Chat] Error:', error);
    const message = error.response?.data?.error?.message || error.message || 'Chat failed';
    return NextResponse.json(
      { success: false, error: message, cached: false, timestamp: Date.now() },
      { status: error.response?.status || 500 }
    );
  }
}
