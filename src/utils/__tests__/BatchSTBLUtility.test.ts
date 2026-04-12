import { BatchSTBLUtility, STBLFile } from '../BatchSTBLUtility';

describe('BatchSTBLUtility', () => {
  const mockFiles: STBLFile[] = [
    {
      id: 'file1',
      name: 'en_US.stbl',
      language: 'en_US',
      isDirty: false,
      entries: [
        { hash: '0x12345678', value: 'Hello' },
        { hash: '0x87654321', value: 'World' }
      ]
    },
    {
      id: 'file2',
      name: 'fr_FR.stbl',
      language: 'fr_FR',
      isDirty: false,
      entries: [
        { hash: '0x12345678', value: 'Bonjour' }
      ]
    }
  ];

  test('parseText correctly parses JPE formatted string tables', () => {
    const content = `// STBL File - en_US\nString 0x12345678: "Hello World"\nString 0xABCDEF01: "Escaped \\"Quotes\\""`;
    const result = BatchSTBLUtility.parseText(content, 'test.jpe.txt', 'en_US');
    
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]).toEqual({ hash: '0x12345678', value: 'Hello World' });
    expect(result.entries[1].value).toBe('Escaped "Quotes"');
  });

  test('detectCollisions identifies conflicts and synced keys', () => {
    const collisions = BatchSTBLUtility.detectCollisions(mockFiles);
    
    // 0x12345678 exists in both but with different values (Hello vs Bonjour)
    const conflict = collisions.get('0x12345678')!;
    expect(conflict.isConflict).toBe(true);
    expect(conflict.files).toHaveLength(2);

    // 0x87654321 only in one file
    const unique = collisions.get('0x87654321')!;
    expect(unique.isConflict).toBe(false);
    expect(unique.files).toHaveLength(1);
  });

  test('syncKeys ensures all files have the same key set', () => {
    const synced = BatchSTBLUtility.syncKeys(mockFiles);
    
    expect(synced[0].entries).toHaveLength(2); // file1 had both
    expect(synced[1].entries).toHaveLength(2); // file2 only had one, should now have two
    
    const missingValue = synced[1].entries.find(e => e.hash === '0x87654321')?.value;
    expect(missingValue).toBe('[MISSING: fr_FR]');
  });
});
