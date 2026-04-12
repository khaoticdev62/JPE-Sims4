import { JpeBundlerService } from '../JpeBundlerService';
import { TransformationService } from '../TransformationService';
import { Project } from '@/types/index';

// Mock dependencies
jest.mock('../TransformationService', () => ({
  TransformationService: {
    transformJPEToXML: jest.fn()
  }
}));

jest.mock('../SensoryService', () => ({
  sensory: {
    triggerSuccess: jest.fn(),
    triggerAlert: jest.fn()
  }
}));

jest.mock('../FileService', () => ({
  FileService: {
    readFileBuffer: jest.fn()
  }
}));

describe('JpeBundlerService Industrial Validation', () => {
  const mockProject: Project = {
    id: 'test-project',
    name: 'My Cool Mod',
    rootPath: '/mock/path',
    files: [
      {
        id: 'f1',
        name: 'test_buff.jpe',
        type: 'jpe',
        content: 'JPE_CONTENT_HERE',
        path: '/mock/path/test_buff.jpe',
        projectId: 'test-project',
        isDirty: false,
        size: 100,
        lastModified: Date.now()
      },
      {
        id: 'f2',
        name: 'strings_en-US.stbl',
        type: 'stbl',
        content: 'U1RCTF9DT05URU5UX0JBU0U2NA==', // 'STBL_CONTENT_BASE64'
        path: '/mock/path/strings_en-US.stbl',
        projectId: 'test-project',
        isDirty: false,
        size: 200,
        lastModified: Date.now()
      }
    ],
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should orchestrate a successful build with progress callbacks', async () => {
    // Mock successful transformation
    (TransformationService.transformJPEToXML as jest.Mock).mockResolvedValue({
      success: true,
      xml: '<I c="Buff" n="test_buff">...</I>',
      errors: []
    });

    const onProgress = jest.fn();
    const result = await JpeBundlerService.buildProject(mockProject, onProgress);

    expect(result.success).toBe(true);
    expect(result.packageBuffer).toBeDefined();
    expect(onProgress).toHaveBeenCalled();

    // Verify progress stages
    const stages = onProgress.mock.calls.map(call => call[0].stage);
    expect(stages).toContain('STARTING');
    expect(stages).toContain('TRANSPILLING_JPE');
    expect(stages).toContain('PACKING_STBL');
    expect(stages).toContain('SUCCESS');
  });

  it('should handle transpilation failures gracefully in logs', async () => {
    (TransformationService.transformJPEToXML as jest.Mock).mockResolvedValue({
      success: false,
      xml: '',
      errors: [{ message: 'Syntax Error in JPE' }]
    });

    const result = await JpeBundlerService.buildProject(mockProject);
    
    const errorLog = result.logs.find(l => l.level === 'error');
    expect(errorLog?.message).toContain('Failed to transpile test_buff.jpe');
    expect(result.success).toBe(true); // Should continue with other files (STBL)
  });

  it('should fail the build if no resources are produced', async () => {
    const emptyProject: Project = { ...mockProject, files: [] };
    
    const result = await JpeBundlerService.buildProject(emptyProject);
    
    expect(result.success).toBe(false);
    expect(result.logs.some(l => l.message.includes('No JPE or STBL files found'))).toBe(true);
  });
});
