/**
 * File Save API Route
 *
 * POST /api/files/save
 * Body: { path: string, content: string, createBackup?: boolean }
 * Response: { success: boolean, size?: number, backupPath?: string, error?: string }
 *
 * Uses FileServiceEnhanced for atomic writes with optional backup.
 */

import { NextRequest, NextResponse } from 'next/server'
import { FileServiceEnhanced } from '@/services/FileServiceEnhanced'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path: filePath, content, createBackup = true } = body

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { success: false, error: 'path is required' },
        { status: 400 }
      )
    }

    if (typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'content is required and must be a string' },
        { status: 400 }
      )
    }

    const result = await FileServiceEnhanced.writeFile(filePath, content, { createBackup })

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save file',
      },
      { status: 500 }
    )
  }
}
