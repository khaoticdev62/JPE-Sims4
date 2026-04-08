/**
 * File Read API Route
 *
 * POST /api/files/read
 * Body: { path: string }
 * Response: { success: boolean, content?: string, encoding?: string, size?: number, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { FileServiceEnhanced } from '@/services/FileServiceEnhanced'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: filePath } = body

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { success: false, error: 'path is required' },
        { status: 400 }
      )
    }

    const result = await FileServiceEnhanced.readFile(filePath)

    if (!result.success) {
      return NextResponse.json(result, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read file',
      },
      { status: 500 }
    )
  }
}
