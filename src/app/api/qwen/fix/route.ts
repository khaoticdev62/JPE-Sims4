/**
 * Qwen API - Suggest Fix
 * Server-side endpoint for DashScope Qwen code fixes.
 * Supports x-api-key header overrides.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileContent, fileName, errorMessage, errorContext } = body;

    const headerKey = request.headers.get('x-api-key');
    const apiKey = headerKey || process.env.DASHSCOPE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'DashScope API not configured. Please provide a key in settings for advanced use.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });

    const prompt = `Fix the following error in a JPE file: ${fileName}
Error: ${errorMessage}
Context: ${errorContext}

Full Content:
${fileContent}

Return ONLY a JSON object with "fixedCode" and "explanation".`;

    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return NextResponse.json({
      success: true,
      fixedCode: result.fixedCode,
      explanation: result.explanation,
    });

  } catch (error) {
    console.error('[Qwen API Fix] Error:', error);
    const message = error instanceof Error ? error.message : 'Fix suggestion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
