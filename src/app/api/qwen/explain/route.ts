/**
 * Qwen API - Explain Mod File
 * Server-side endpoint for DashScope Qwen mod explanations.
 * Supports x-api-key header overrides.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileContent, fileName } = body;

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

    const prompt = `Summarize this Sims 4 JPE mod file.
File: ${fileName}
Content:
${fileContent.substring(0, 3000)}

Provide:
1. **Overview**: Purpose of this mod.
2. **Key Fields**: Major tunable parameters.
3. **Effects**: Gameplay impact.
\nReturn the summary in the specified structured text format.`;

    const response = await openai.chat.completions.create({
      model: 'qwen-plus',
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.choices[0].message.content || "";
    
    return NextResponse.json({
      success: true,
      explanationText: text,
    });

  } catch (error) {
    console.error('[Qwen API Explain] Error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
