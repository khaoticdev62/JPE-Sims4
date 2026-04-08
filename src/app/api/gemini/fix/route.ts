/**
 * Gemini API - Suggest Fix
 * Server-side endpoint for Gemini 1.5 Pro code fixes.
 * Supports x-api-key header overrides.
 */

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileContent, fileName, errorMessage, errorContext } = body;

    const headerKey = request.headers.get('x-api-key');
    const apiKey = headerKey || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API not configured. Please provide a key in settings for advanced use.' },
        { status: 500 }
      );
    }

    const prompt = `Fix the following error in a JPE file: ${fileName}
Error: ${errorMessage}
Context: ${errorContext}

Full Content:
${fileContent}

Return ONLY a JSON object with "fixedCode" and "explanation".`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    const result = JSON.parse(text);
    
    return NextResponse.json({
      success: true,
      fixedCode: result.fixedCode,
      explanation: result.explanation,
    });

  } catch (error) {
    console.error('[Gemini API Fix] Error:', error);
    const message = error instanceof Error ? error.message : 'Fix suggestion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
