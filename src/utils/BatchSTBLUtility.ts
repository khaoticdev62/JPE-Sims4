import { STBLParser } from '@/engine/parsers/STBLParser';
import type { STBLEntry as BinaryEntry } from '@/engine/parsers/types/stbl';

export interface STBLEntry {
  hash: string;
  value: string;
}

export interface STBLFile {
  id: string;
  name: string;
  language: string;
  entries: STBLEntry[];
  isDirty: boolean;
  path?: string;
}

export interface CollisionInfo {
  hash: string;
  files: string[]; // file ids
  isConflict: boolean; // same hash, different values
}

export class BatchSTBLUtility {
  /**
   * Parses a binary STBL buffer into the frontend structure.
   */
  static parseBinary(buffer: ArrayBuffer, name: string, language: string): STBLFile {
    const data = STBLParser.parse(buffer);
    if (!data) throw new Error(`Failed to parse binary STBL: ${name}`);

    return {
      id: `stbl-${Date.now()}-${language}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      language,
      isDirty: false,
      entries: data.entries.map((e: BinaryEntry) => ({
        hash: `0x${e.key.toString(16).toUpperCase().padStart(8, '0')}`,
        value: e.value
      }))
    };
  }

  /**
   * Parses a text-based JPE string table (.jpe.txt).
   * Format: String 0xHASH: "VALUE"
   */
  static parseText(content: string, name: string, language: string): STBLFile {
    const entries: STBLEntry[] = [];
    const lines = content.split('\n');
    
    // Industrial regex for matching: String 0x12345678: "Value with \"escaped\" quotes"
    const regex = /String\s+(0x[0-9A-Fa-f]{8}):\s*"((?:[^"\\]|\\.)*)"/i;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        entries.push({
          hash: `0x${match[1].substr(2).toUpperCase()}`,
          value: match[2].replace(/\\"/g, '"').replace(/\\n/g, '\n')
        });
      }
    }

    return {
      id: `stbl-${Date.now()}-${language}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      language,
      isDirty: false,
      entries
    };
  }

  /**
   * Detects hash collisions and conflicts across multiple files.
   */
  static detectCollisions(files: STBLFile[]): Map<string, CollisionInfo> {
    const collisions = new Map<string, CollisionInfo>();
    const hashValues = new Map<string, Set<string>>();

    files.forEach(file => {
      file.entries.forEach(entry => {
        const hash = `0x${entry.hash.substr(2).toUpperCase()}`;
        
        if (!collisions.has(hash)) {
          collisions.set(hash, { hash, files: [file.id], isConflict: false });
          hashValues.set(hash, new Set([entry.value]));
        } else {
          const info = collisions.get(hash)!;
          if (!info.files.includes(file.id)) {
            info.files.push(file.id);
          }
          
          const values = hashValues.get(hash)!;
          values.add(entry.value);
          if (values.size > 1) {
            info.isConflict = true;
          }
        }
      });
    });

    return collisions;
  }

  /**
   * Synchronizes keys across all files.
   * Ensures every file has every key present in any other file.
   */
  static syncKeys(files: STBLFile[]): STBLFile[] {
    const allKeys = new Set<string>();
    files.forEach(f => f.entries.forEach(e => allKeys.add(`0x${e.hash.substr(2).toUpperCase()}`)));

    return files.map(file => {
      const existingKeys = new Set(file.entries.map(e => `0x${e.hash.substr(2).toUpperCase()}`));
      const missingKeys = Array.from(allKeys).filter(k => !existingKeys.has(k));

      if (missingKeys.length === 0) return file;

      const newEntries = [
        ...file.entries,
        ...missingKeys.map(k => ({ hash: k, value: `[MISSING: ${file.language}]` }))
      ];

      return {
        ...file,
        isDirty: true,
        entries: newEntries
      };
    });
  }
}
