
import { describe, it, expect, vi } from 'vitest'
import { CompilerService } from './CompilerService'
import type { ModFile } from '@/types/index'

describe('CompilerService', () => {
  it('should compile a file successfully', async () => {
    const file: ModFile = {
      id: 'file-1',
      name: 'test.xml',
      path: '/test.xml',
      type: 'xml',
      content: '<I c="Trait" i="trait:test" m="sims4.tuning"><T n="display_name">Test</T></I>',
      isDirty: false,
      size: 100,
      lastModified: Date.now(),
    }

    // Mock translateToJPE to avoid full parser chain complexity if needed,
    // but better to test integration if possible.
    // However, for this specific refactor verification (removing store),
    // we just want to ensure it returns the structure we expect.
    
    // We can spy on translateToJPE to see if it's called
    const spy = vi.spyOn(CompilerService, 'translateToJPE')
    spy.mockResolvedValue('{"mock": "jpe"}')

    const result = await CompilerService.compileFile(file)

    expect(result.success).toBe(true)
    expect(result.output).toBe('{"mock": "jpe"}')
    expect(result.errors).toEqual([])
    
    // cleanup
    spy.mockRestore()
  })

  it('should compile project (batch) successfully', async () => {
    const files: ModFile[] = [
      {
        id: 'file-1',
        name: 'test.xml',
        path: '/test.xml',
        type: 'xml',
        content: 'content',
        isDirty: false,
        size: 0,
        lastModified: 0,
      }
    ]

    const spy = vi.spyOn(CompilerService, 'compileFile')
    spy.mockResolvedValue({ success: true, output: '{}', errors: [] })

    const result = await CompilerService.compileProject(files)

    expect(result.success).toBe(true)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].fileId).toBe('file-1')
    expect(result.results[0].success).toBe(true)

    spy.mockRestore()
  })
})
