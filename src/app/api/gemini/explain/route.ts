/**
 * Gemini API - Explain Mod File
 * Server-side endpoint for Google Gemini 1.5 Pro mod explanations.
 * Supports x-api-key header overrides.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileContent, fileName } = body;

    const headerKey = request.headers.get('x-api-key');
    const apiKey = headerKey || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API not configured. Please provide a key in settings for advanced use.' },
        { status: 500 }
      );
    }

    const prompt = `Summarize this Sims 4 JPE mod file.
File: ${fileName}
Content:
${fileContent.substring(0, 3000)}

Provide:
1. **Overview**: Purpose of this mod.
2. **Key Fields**: Major tunable parameters.
3. **Effects**: Gameplay impact.
\nReturn the summary in the specified structured text format.`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;

    return NextResponse.json({
      success: true,
      explanationText: text,
    });

  } catch (error) {
    console.error('[Gemini API Explain] Error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
