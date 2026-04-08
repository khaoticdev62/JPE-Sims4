/**
 * Gemini API - Chat
 * 
 * Server-side proxy for Google Gemini.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'gemini-1.5-flash' } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: messages array is required', cached: false, timestamp: Date.now() },
        { status: 400 }
      );
    }

    const headerKey = request.headers.get('Authorization');
    const apiKey = headerKey?.replace('Bearer ', '') || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Gemini API not configured. Please set GOOGLE_API_KEY or GEMINI_API_KEY in .env.local', cached: false, timestamp: Date.now() },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const apiModel = genAI.getGenerativeModel({ model });

    // Format messages for Gemini (it uses a different structure)
    // For now, take the last message as the prompt
    const prompt = messages[messages.length - 1].content;
    const result = await apiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      text: text,
      usage: {
        // Gemini doesn't always provide usage in the sync response the same way
        totalTokens: response.usageMetadata?.totalTokenCount || 0,
        inputTokens: response.usageMetadata?.promptTokenCount || 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount || 0
      },
      cached: false,
      timestamp: Date.now()
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Chat failed';
    console.error('[Gemini API Chat] Error:', error);
    return NextResponse.json(
      { success: false, error: message, cached: false, timestamp: Date.now() },
      { status: 500 }
    );
  }
}
