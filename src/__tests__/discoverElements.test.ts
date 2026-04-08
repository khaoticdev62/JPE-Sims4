import { discoverElements, groupByCategory, categorizeFile } from '../utils/discoverElements';
import { ModFile } from '@/types/index';

// Helper to build a minimal ModFile
const makeFile = (id: string, name: string, type: ModFile['type'] = 'xml'): ModFile => ({
  id,
  projectId: 'test-project',
  name,
  path: `/mock/path/${name}`,
  type,
  content: '',
  isDirty: false,
  size: 0,
  lastModified: Date.now(),
});

describe('categorizeFile', () => {
  it('categorizes Interaction files', () => {
    expect(categorizeFile(makeFile('1', 'FeedDog_Interaction.xml'))).toBe('Interactions');
    expect(categorizeFile(makeFile('2', 'pet_affordance.xml'))).toBe('Interactions');
  });

  it('categorizes Buff files', () => {
    expect(categorizeFile(makeFile('1', 'HappyBuff.xml'))).toBe('Buffs');
    expect(categorizeFile(makeFile('2', 'tired_moodlet.xml'))).toBe('Buffs');
  });

  it('categorizes Trait files', () => {
    expect(categorizeFile(makeFile('1', 'CreativeTrait.xml'))).toBe('Traits');
  });

  it('categorizes unknown files as Other', () => {
    expect(categorizeFile(makeFile('1', 'override.xml'))).toBe('Other');
    expect(categorizeFile(makeFile('2', 'settings.jpe' as any))).toBe('Other');
  });

  it('is case-insensitive', () => {
    expect(categorizeFile(makeFile('1', 'FeedDog_INTERACTION.XML'))).toBe('Interactions');
    expect(categorizeFile(makeFile('2', 'HAPPY_BUFF.xml'))).toBe('Buffs');
  });
});

describe('discoverElements', () => {
  it('returns empty array for empty project', () => {
    expect(discoverElements([])).toEqual([]);
  });

  it('ignores non-mod file types (package, stbl, python, unknown)', () => {
    const files = [
      makeFile('1', 'game.package', 'package'),
      makeFile('2', 'strings.stbl', 'stbl'),
      makeFile('3', 'logic.py', 'py'),
    ];
    expect(discoverElements(files)).toHaveLength(0);
  });

  it('discovers xml files', () => {
    const files = [
      makeFile('1', 'Interaction.xml', 'xml'),
      makeFile('2', 'Buff.xml', 'xml'),
    ];
    expect(discoverElements(files)).toHaveLength(2);
  });

  it('strips file extension from element name', () => {
    const files = [makeFile('1', 'FeedDog_Interaction.xml', 'xml')];
    const elements = discoverElements(files);
    expect(elements[0].name).toBe('FeedDog_Interaction');
  });

  it('assigns correct category', () => {
    const files = [makeFile('1', 'HappyBuff.xml', 'xml')];
    const elements = discoverElements(files);
    expect(elements[0].category).toBe('Buffs');
  });
});

describe('groupByCategory', () => {
  it('groups elements into all four category buckets', () => {
    const elements = [
      { id: '1', name: 'A', path: '/a.xml', type: 'xml', category: 'Interactions' as const },
      { id: '2', name: 'B', path: '/b.xml', type: 'xml', category: 'Buffs' as const },
      { id: '3', name: 'C', path: '/c.xml', type: 'xml', category: 'Traits' as const },
      { id: '4', name: 'D', path: '/d.xml', type: 'xml', category: 'Other' as const },
    ];
    const grouped = groupByCategory(elements);
    expect(grouped.Interactions).toHaveLength(1);
    expect(grouped.Buffs).toHaveLength(1);
    expect(grouped.Traits).toHaveLength(1);
    expect(grouped.Other).toHaveLength(1);
  });

  it('returns empty arrays for empty inputs', () => {
    const grouped = groupByCategory([]);
    expect(grouped.Interactions).toHaveLength(0);
    expect(grouped.Buffs).toHaveLength(0);
    expect(grouped.Traits).toHaveLength(0);
    expect(grouped.Other).toHaveLength(0);
  });
});
