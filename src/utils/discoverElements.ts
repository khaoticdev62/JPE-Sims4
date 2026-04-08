import { ModFile } from '@/types/index';

export type ElementCategory = 'Interactions' | 'Buffs' | 'Traits' | 'Other';

export interface ModElement {
  id: string;       // Unique identifier (file id)
  name: string;     // Display name (file name without extension)
  path: string;     // Absolute path to the file
  type: string;     // File type from ModFile
  category: ElementCategory;
}

/**
 * Heuristic: Determine category based on filename.
 * Checks for keywords in the file name (case-insensitive).
 */
export function categorizeFile(file: ModFile): ElementCategory {
  const nameLower = file.name.toLowerCase();
  if (nameLower.includes('interaction') || nameLower.includes('affordance')) {
    return 'Interactions';
  }
  if (nameLower.includes('buff') || nameLower.includes('moodlet')) {
    return 'Buffs';
  }
  if (nameLower.includes('trait')) {
    return 'Traits';
  }
  return 'Other';
}

/**
 * Transforms a list of project files into a list of mod elements.
 * Only includes XML files that are relevant mod-format files.
 */
export function discoverElements(files: ModFile[]): ModElement[] {
  return files
    .filter((file) => file.type === 'xml')
    .map((file) => ({
      id: file.id,
      name: file.name.replace(/\.[^/.]+$/, ''), // strip extension
      path: file.path,
      type: file.type,
      category: categorizeFile(file),
    }));
}

/**
 * Groups a flat list of ModElements by category.
 */
export function groupByCategory(
  elements: ModElement[]
): Record<ElementCategory, ModElement[]> {
  return {
    Interactions: elements.filter((e) => e.category === 'Interactions'),
    Buffs: elements.filter((e) => e.category === 'Buffs'),
    Traits: elements.filter((e) => e.category === 'Traits'),
    Other: elements.filter((e) => e.category === 'Other'),
  };
}
